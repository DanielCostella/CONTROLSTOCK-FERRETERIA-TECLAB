import { Router } from 'express';
import { getDashboardResumen, getProductosMasVendidos } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/resumen', authenticateToken, getDashboardResumen);
router.get('/productos-mas-vendidos', authenticateToken, getProductosMasVendidos);

export default router;