import { Router } from 'express';
import { getTickets, getTicketById, createTicket, getTicketDetalle } from '../controllers/ticketController.js';

const router = Router();


router.get('/', getTickets);
router.get('/:id', getTicketById);
router.get('/:id/detalle', getTicketDetalle); // Nuevo endpoint para detalle de factura
router.post('/', createTicket);

export default router;
