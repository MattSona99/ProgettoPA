import { Router } from 'express';
import { authMiddleware, authorize } from '../middleware/authMiddleware';
import { validateGetTransitoById, validateCreateTransito, validateUpdateTransito, validateDeleteTransito } from '../middleware/validate/transitoValidate';
import { getTransitoById, createTransito, updateTransito, deleteTransito } from '../controllers/transitoController';

const router = Router();
// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);
// Rotte per la gestione del transito
router.get('/transito/:id', authorize(['operatore']), validateGetTransitoById, getTransitoById);
router.post('/transito', authorize(['operatore', 'varco']), validateCreateTransito, createTransito);
router.put('/transito/:id', authorize(['operatore']), validateUpdateTransito, updateTransito);
router.delete('/transito/:id', authorize(['operatore']), validateDeleteTransito, deleteTransito);

export default router;
