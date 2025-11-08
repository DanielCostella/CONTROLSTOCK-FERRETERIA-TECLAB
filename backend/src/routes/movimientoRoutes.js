import { Router } from 'express';
import { getMovimientos, createMovimiento, updateMovimiento, deleteMovimiento } from '../controllers/movimientoController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getMovimientos);
router.post('/', authenticateToken, createMovimiento);
router.put('/:id', authenticateToken, updateMovimiento);
router.delete('/:id', authenticateToken, deleteMovimiento);

export default router;
