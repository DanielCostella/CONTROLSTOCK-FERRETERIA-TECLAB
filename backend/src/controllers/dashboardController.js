import pool from '../db.js';

// Obtener resumen para dashboard
export const getDashboardResumen = async (req, res) => {
  try {
    // Total de productos
    const [totalProductos] = await pool.query('SELECT COUNT(*) as total FROM producto');
    
    // Productos con stock bajo (≤ 5)
    const [stockBajo] = await pool.query('SELECT COUNT(*) as total FROM producto WHERE stock <= 5');
    
    // Productos sin stock
    const [sinStock] = await pool.query('SELECT COUNT(*) as total FROM producto WHERE stock = 0');
    
    // Movimientos de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const [movimientosHoy] = await pool.query('SELECT COUNT(*) as total FROM movimiento_stock WHERE DATE(fecha) = ?', [hoy]);
    
    // Ventas del mes actual
    const primerDiaMes = new Date().toISOString().slice(0, 7) + '-01';
    const [ventasMes] = await pool.query(
      'SELECT COUNT(*) as total, SUM(cantidad) as totalCantidad FROM movimiento_stock WHERE tipo = "salida" AND fecha >= ?',
      [primerDiaMes]
    );
    
    // Compras del mes actual
    const [comprasMes] = await pool.query(
      'SELECT COUNT(*) as total, SUM(cantidad) as totalCantidad FROM movimiento_stock WHERE tipo = "entrada" AND fecha >= ?',
      [primerDiaMes]
    );

    res.json({
      totalProductos: totalProductos[0].total,
      stockBajo: stockBajo[0].total,
      sinStock: sinStock[0].total,
      movimientosHoy: movimientosHoy[0].total,
      ventasMes: {
        cantidad: ventasMes[0].total || 0,
        totalUnidades: ventasMes[0].totalCantidad || 0
      },
      comprasMes: {
        cantidad: comprasMes[0].total || 0,
        totalUnidades: comprasMes[0].totalCantidad || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener productos más vendidos (últimos 30 días)
export const getProductosMasVendidos = async (req, res) => {
  try {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    const fecha30Dias = hace30Dias.toISOString().split('T')[0];

    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        SUM(m.cantidad) as totalVendido
      FROM movimiento_stock m
      JOIN producto p ON m.id_producto = p.id
      WHERE m.tipo = 'salida' AND m.fecha >= ?
      GROUP BY p.id, p.nombre
      ORDER BY totalVendido DESC
      LIMIT 10
    `, [fecha30Dias]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};