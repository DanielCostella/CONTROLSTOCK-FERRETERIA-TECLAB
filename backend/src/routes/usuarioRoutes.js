import { Router } from 'express';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../controllers/usuarioController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getUsuarios);
router.post('/', authenticateToken, createUsuario);
router.put('/:id', authenticateToken, updateUsuario);
router.delete('/:id', authenticateToken, deleteUsuario);

export default router;
