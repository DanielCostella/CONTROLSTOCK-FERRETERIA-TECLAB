import pool from '../db.js';

// Obtener todos los proveedores
export const getProveedores = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedor');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo proveedor
export const createProveedor = async (req, res) => {
  const { nombre, contacto, telefono } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO proveedor (nombre, contacto, telefono) VALUES (?, ?, ?)',
      [nombre, contacto, telefono]
    );
    res.status(201).json({ id: result.insertId, nombre, contacto, telefono });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar proveedor
export const updateProveedor = async (req, res) => {
  const { id } = req.params;
  const { nombre, contacto, telefono } = req.body;
  try {
    await pool.query(
      'UPDATE proveedor SET nombre = ?, contacto = ?, telefono = ? WHERE id = ?',
      [nombre, contacto, telefono, id]
    );
    res.json({ id, nombre, contacto, telefono });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar proveedor
export const deleteProveedor = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM proveedor WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
