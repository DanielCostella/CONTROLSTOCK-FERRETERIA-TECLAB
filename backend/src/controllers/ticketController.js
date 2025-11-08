// Obtener un ticket con el detalle de sus movimientos (detalle de factura)
export const getTicketDetalle = async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener datos del ticket
    const [ticketRows] = await pool.query('SELECT * FROM ticket WHERE id = ?', [id]);
    if (ticketRows.length === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    const ticket = ticketRows[0];
    // Obtener movimientos asociados
    const [movimientos] = await pool.query('SELECT * FROM movimiento_stock WHERE id_ticket = ?', [id]);
    ticket.movimientos = movimientos;
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
import pool from '../db.js';

// Obtener todos los tickets
export const getTickets = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ticket');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un ticket por id
export const getTicketById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM ticket WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo ticket
export const createTicket = async (req, res) => {
  const { tipo, fecha, id_cliente, id_proveedor, total, observaciones, id_usuario } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO ticket (tipo, fecha, id_cliente, id_proveedor, total, observaciones, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [tipo, fecha, id_cliente, id_proveedor, total, observaciones, id_usuario]
    );
    res.status(201).json({ id: result.insertId, tipo, fecha, id_cliente, id_proveedor, total, observaciones, id_usuario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
