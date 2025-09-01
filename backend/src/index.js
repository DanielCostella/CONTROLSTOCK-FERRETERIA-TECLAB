import express from 'express';
import pool from './db.js';
import dotenv from 'dotenv';
import proveedorRoutes from './routes/proveedorRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

// Rutas para proveedores
app.use('/api/proveedores', proveedorRoutes);

// Endpoint de prueba de conexión a la base de datos
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ success: true, result: rows[0].result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
