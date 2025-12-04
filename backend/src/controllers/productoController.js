import pool from '../db.js';

// Generar código único de producto
const generarCodigoProducto = async () => {
  const [rows] = await pool.query('SELECT MAX(id) as maxId FROM producto');
  const nextId = (rows[0].maxId || 0) + 1;
  return `PROD-${String(nextId).padStart(6, '0')}`;
};

// Obtener todos los productos
export const getProductos = async (req, res) => {
  try {
    // Actualizar estados automáticamente basados en stock_actual
    await pool.query(`
      UPDATE producto 
      SET estado = CASE 
        WHEN stock_actual = 0 THEN 'sin_stock'
        WHEN stock_actual <= stock_minimo THEN 'disponible'
        ELSE 'disponible'
      END
      WHERE estado != 'discontinuado'
    `);
    
    const [rows] = await pool.query('SELECT * FROM producto');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un producto por id
export const getProductoById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM producto WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo producto
export const createProducto = async (req, res) => {
  const { nombre, descripcion, marca, codigo_barras, precio_compra, precio_venta, stock_minimo, categoria_id } = req.body;
  try {
    const codigoFinal = codigo_barras || await generarCodigoProducto();
    
    // El stock_actual siempre empieza en 0, se incrementa con movimientos de entrada
    const [result] = await pool.query(
      'INSERT INTO producto (nombre, codigo_barras, descripcion, marca, precio_compra, precio_venta, stock_actual, stock_minimo, categoria_id, estado) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)',
      [nombre, codigoFinal, descripcion, marca || null, precio_compra, precio_venta, stock_minimo || 5, categoria_id || null, 'sin_stock']
    );
    res.status(201).json({ 
      id: result.insertId, 
      nombre, 
      codigo_barras: codigoFinal, 
      descripcion,
      marca: marca || null, 
      precio_compra, 
      precio_venta, 
      stock_actual: 0, 
      stock_minimo: stock_minimo || 5, 
      categoria_id, 
      estado: 'sin_stock'
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar producto
export const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, codigo_barras, descripcion, marca, precio_compra, precio_venta, stock_minimo, categoria_id, estado } = req.body;
  try {
    // No permitimos actualizar stock_actual, solo desde movimientos
    await pool.query(
      'UPDATE producto SET nombre = ?, codigo_barras = ?, descripcion = ?, marca = ?, precio_compra = ?, precio_venta = ?, stock_minimo = ?, categoria_id = ?, estado = ? WHERE id = ?',
      [nombre, codigo_barras, descripcion, marca, precio_compra, precio_venta, stock_minimo, categoria_id, estado, id]
    );
    res.json({ id, nombre, codigo_barras, descripcion, marca, precio_compra, precio_venta, stock_minimo, categoria_id, estado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar producto
export const deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM producto WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener productos con stock bajo
export const getProductosStockBajo = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM producto WHERE stock_actual <= stock_minimo AND stock_actual > 0');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener productos sin stock
export const getProductosSinStock = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM producto WHERE stock_actual = 0 OR estado = "sin_stock"');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
