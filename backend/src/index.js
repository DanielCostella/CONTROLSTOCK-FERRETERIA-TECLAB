import express from 'express';
import cors from 'cors';
import pool from './db.js';
import dotenv from 'dotenv';
import proveedorRoutes from './routes/proveedorRoutes.js';
import productoRoutes from './routes/productoRoutes.js';
import movimientoRoutes from './routes/movimientoRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();

// Configurar CORS para permitir el frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // React y Vite
  credentials: true
}));

app.use(express.json());

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas para dashboard
app.use('/api/dashboard', dashboardRoutes);

// Rutas para usuarios
app.use('/api/usuarios', usuarioRoutes);

// Rutas para clientes
app.use('/api/clientes', clienteRoutes);

// Rutas para proveedores
app.use('/api/proveedores', proveedorRoutes);

// Rutas para productos
app.use('/api/productos', productoRoutes);

// Rutas para movimientos de stock
app.use('/api/movimientos', movimientoRoutes);

// Rutas para categorías
app.use('/api/categorias', categoriaRoutes);

// Rutas para tickets
app.use('/api/tickets', ticketRoutes);

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
