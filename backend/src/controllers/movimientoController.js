import pool from '../db.js';

// Obtener todos los movimientos de stock
// Obtener todos los movimientos de stock, con filtro opcional por id_ticket o producto
export const getMovimientos = async (req, res) => {
  try {
    const filtros = [
      { campo: 'id_ticket', valor: req.query.id_ticket },
      { campo: 'id_producto', valor: req.query.producto },
      { campo: 'tipo', valor: req.query.tipo },
      { campo: 'fecha >=', valor: req.query.desde },
      { campo: 'fecha <=', valor: req.query.hasta }
    ];

    let query = 'SELECT * FROM movimiento_stock';
    let conditions = [];
    let params = [];

    filtros.forEach(f => {
      if (f.valor !== undefined && f.valor !== null && f.valor !== '') {
        if (f.campo.includes(' ')) {
          conditions.push(`${f.campo} ?`);
        } else {
          conditions.push(`${f.campo} = ?`);
        }
        params.push(f.valor);
      }
    });

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo movimiento de stock
export const createMovimiento = async (req, res) => {
  const { id_producto, tipo, cantidad, fecha, id_usuario, id_proveedor, id_cliente, observaciones, id_ticket } = req.body;

  // Si no se proporciona fecha, usar la fecha y hora actual
  const fechaMovimiento = fecha || new Date().toISOString().slice(0, 19).replace('T', ' '); // Formato YYYY-MM-DD HH:MM:SS

  // Validaciones usando array de reglas
  const reglas = [
    { valido: !!id_producto, error: 'id_producto es obligatorio' },
    { valido: !!tipo, error: 'tipo es obligatorio' },
    { valido: !!cantidad, error: 'cantidad es obligatoria' },
    { valido: !!id_usuario, error: 'id_usuario es obligatorio' },
    { valido: ['entrada', 'salida'].includes(tipo), error: 'El tipo debe ser "entrada" o "salida"' },
    { valido: !isNaN(cantidad) && cantidad > 0, error: 'La cantidad debe ser un número mayor a cero' },
    { valido: typeof fechaMovimiento === 'string' && fechaMovimiento.length >= 10, error: 'La fecha debe tener formato válido' }
  ];
  const errorRegla = reglas.find(r => !r.valido);
  if (errorRegla) {
    return res.status(400).json({ error: errorRegla.error });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Validar stock suficiente si es salida
    if (tipo === 'salida') {
      const [rows] = await conn.query('SELECT stock FROM producto WHERE id = ?', [id_producto]);
      if (!rows.length) throw new Error('Producto no encontrado');
      if (rows[0].stock < cantidad) {
        throw new Error(`Stock insuficiente. Stock actual: ${rows[0].stock}, cantidad solicitada: ${cantidad}`);
      }
      
      // Validación adicional: asegurar que el stock nunca sea negativo
      const stockResultante = rows[0].stock - cantidad;
      if (stockResultante < 0) {
        throw new Error('Error: El stock resultante sería negativo');
      }
      
      await conn.query('UPDATE producto SET stock = stock - ? WHERE id = ?', [cantidad, id_producto]);
      
      // Verificar si el producto queda sin stock y actualizar estado
      const [newStockRows] = await conn.query('SELECT stock FROM producto WHERE id = ?', [id_producto]);
      if (newStockRows[0].stock === 0) {
        await conn.query('UPDATE producto SET estado = "sin_stock" WHERE id = ?', [id_producto]);
      } else if (newStockRows[0].stock < 0) {
        // Protección adicional: revertir si algo salió mal
        throw new Error('Error crítico: Stock negativo detectado');
      }
    } else if (tipo === 'entrada') {
      await conn.query('UPDATE producto SET stock = stock + ? WHERE id = ?', [cantidad, id_producto]);
      
      // Si era sin stock y ahora tiene stock, cambiar a disponible
      const [newStockRows] = await conn.query('SELECT stock FROM producto WHERE id = ?', [id_producto]);
      if (newStockRows[0].stock > 0) {
        await conn.query('UPDATE producto SET estado = "disponible" WHERE id = ?', [id_producto]);
      }
    }

    const [result] = await conn.query(
      'INSERT INTO movimiento_stock (id_producto, tipo, cantidad, fecha, id_usuario, id_proveedor, id_cliente, observaciones, id_ticket) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id_producto, tipo, cantidad, fechaMovimiento, id_usuario, id_proveedor, id_cliente, observaciones, id_ticket || null]
    );

    await conn.commit();
    res.status(201).json({ id: result.insertId, id_producto, tipo, cantidad, fecha: fechaMovimiento, id_usuario, id_proveedor, id_cliente, observaciones, id_ticket });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
};

// Actualizar un movimiento de stock
export const updateMovimiento = async (req, res) => {
  const { id } = req.params;
  const { id_producto, tipo, cantidad, fecha, id_usuario, id_proveedor, id_cliente, observaciones, id_ticket } = req.body;

  // Validaciones usando array de reglas
  const reglas = [
    { valido: !!id_producto, error: 'id_producto es obligatorio' },
    { valido: !!tipo, error: 'tipo es obligatorio' },
    { valido: !!cantidad, error: 'cantidad es obligatoria' },
    { valido: !!fecha, error: 'fecha es obligatoria' },
    { valido: !!id_usuario, error: 'id_usuario es obligatorio' },
    { valido: ['entrada', 'salida'].includes(tipo), error: 'El tipo debe ser "entrada" o "salida"' },
    { valido: !isNaN(cantidad) && cantidad > 0, error: 'La cantidad debe ser un número mayor a cero' },
    { valido: typeof fecha === 'string' && fecha.length >= 8, error: 'La fecha debe tener formato válido' }
  ];
  const errorRegla = reglas.find(r => !r.valido);
  if (errorRegla) {
    return res.status(400).json({ error: errorRegla.error });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Leer el movimiento original
    const [oldRows] = await conn.query('SELECT * FROM movimiento_stock WHERE id = ?', [id]);
    if (!oldRows.length) throw new Error('Movimiento no encontrado');
    const old = oldRows[0];

    // 2. Revertir el efecto del movimiento viejo
    if (old.tipo === 'salida') {
      await conn.query('UPDATE producto SET stock = stock + ? WHERE id = ?', [old.cantidad, old.id_producto]);
    } else if (old.tipo === 'entrada') {
      await conn.query('UPDATE producto SET stock = stock - ? WHERE id = ?', [old.cantidad, old.id_producto]);
    }

    // 3. Aplicar el efecto del movimiento nuevo
    if (tipo === 'salida') {
      // Validar stock suficiente
      const [rows] = await conn.query('SELECT stock FROM producto WHERE id = ?', [id_producto]);
      if (!rows.length) throw new Error('Producto no encontrado');
      if (rows[0].stock < cantidad) {
        throw new Error('Stock insuficiente para realizar la salida');
      }
      await conn.query('UPDATE producto SET stock = stock - ? WHERE id = ?', [cantidad, id_producto]);
      
      // Verificar si el producto queda sin stock y actualizar estado
      const [newStockRows] = await conn.query('SELECT stock FROM producto WHERE id = ?', [id_producto]);
      if (newStockRows[0].stock === 0) {
        await conn.query('UPDATE producto SET estado = "sin_stock" WHERE id = ?', [id_producto]);
      }
    } else if (tipo === 'entrada') {
      await conn.query('UPDATE producto SET stock = stock + ? WHERE id = ?', [cantidad, id_producto]);
      
      // Si era sin stock y ahora tiene stock, cambiar a disponible
      const [newStockRows] = await conn.query('SELECT stock FROM producto WHERE id = ?', [id_producto]);
      if (newStockRows[0].stock > 0) {
        await conn.query('UPDATE producto SET estado = "disponible" WHERE id = ?', [id_producto]);
      }
    }

    // 4. Actualizar el movimiento
    await conn.query(
      'UPDATE movimiento_stock SET id_producto = ?, tipo = ?, cantidad = ?, fecha = ?, id_usuario = ?, id_proveedor = ?, id_cliente = ?, observaciones = ?, id_ticket = ? WHERE id = ?',
      [id_producto, tipo, cantidad, fecha, id_usuario, id_proveedor, id_cliente, observaciones, id_ticket || null, id]
    );

    await conn.commit();
    res.json({ id, id_producto, tipo, cantidad, fecha, id_usuario, id_proveedor, id_cliente, observaciones, id_ticket });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
};

// Eliminar un movimiento de stock
export const deleteMovimiento = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM movimiento_stock WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
