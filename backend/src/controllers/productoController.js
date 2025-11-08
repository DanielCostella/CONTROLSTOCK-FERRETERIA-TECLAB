// Obtener productos con stock bajo
export const getProductosStockBajo = async (req, res) => {
  const minimo = parseInt(req.query.minimo) || 5;
  try {
    const [rows] = await pool.query('SELECT * FROM producto WHERE stock <= ?', [minimo]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener productos sin stock
export const getProductosSinStock = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM producto WHERE stock = 0');
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
import pool from '../db.js';

// Obtener todos los productos
export const getProductos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM producto');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo producto
export const createProducto = async (req, res) => {
  const { nombre, descripcion, stock, precio, id_categoria, id_proveedor } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO producto (nombre, descripcion, stock, precio, id_categoria, id_proveedor) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, stock, precio, id_categoria, id_proveedor]
    );
    res.status(201).json({ id: result.insertId, nombre, descripcion, stock, precio, id_categoria, id_proveedor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar producto
export const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, stock, precio, id_categoria, id_proveedor } = req.body;
  try {
    await pool.query(
      'UPDATE producto SET nombre = ?, descripcion = ?, stock = ?, precio = ?, id_categoria = ?, id_proveedor = ? WHERE id = ?',
      [nombre, descripcion, stock, precio, id_categoria, id_proveedor, id]
    );
    res.json({ id, nombre, descripcion, stock, precio, id_categoria, id_proveedor });
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
