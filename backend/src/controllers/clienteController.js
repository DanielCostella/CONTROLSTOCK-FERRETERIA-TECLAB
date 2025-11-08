import pool from '../db.js';

// Obtener todos los clientes
export const getClientes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cliente');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo cliente
export const createCliente = async (req, res) => {
  const { nombre, contacto } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO cliente (nombre, contacto) VALUES (?, ?)',
      [nombre, contacto]
    );
    res.status(201).json({ id: result.insertId, nombre, contacto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar cliente
export const updateCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, contacto } = req.body;
  try {
    await pool.query(
      'UPDATE cliente SET nombre = ?, contacto = ? WHERE id = ?',
      [nombre, contacto, id]
    );
    res.json({ id, nombre, contacto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar cliente
export const deleteCliente = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cliente WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
