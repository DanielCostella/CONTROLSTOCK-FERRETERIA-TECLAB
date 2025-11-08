import { Router } from 'express';
import { getProductos, getProductoById, createProducto, updateProducto, deleteProducto, getProductosStockBajo, getProductosSinStock } from '../controllers/productoController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getProductos);
router.get('/stock-bajo', authenticateToken, getProductosStockBajo);
router.get('/sin-stock', authenticateToken, getProductosSinStock);
router.get('/:id', authenticateToken, getProductoById);
router.post('/', authenticateToken, createProducto);
router.put('/:id', authenticateToken, updateProducto);
router.delete('/:id', authenticateToken, deleteProducto);

export default router;
