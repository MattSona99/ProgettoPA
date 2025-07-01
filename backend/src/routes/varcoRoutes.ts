import { Router } from 'express';
import {
    getAllVarco,
    getVarcoById,
    createVarco,
    updateVarco,
    deleteVarco
} from '../controllers/varcoController';
import { authMiddleware, authorize } from '../middleware/authMiddleware';
import {
    validateCreateVarco,
    validateGetVarcoById,
    validateUpdateVarco,
    validateDeleteVarco
} from '../middleware/validate/varcoValidate';

const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);

// Rotte per la gestione dei varchi
router.get('/varco', authorize(['operatore']), getAllVarco);
router.get('/varco/:id', authorize(['operatore']), validateGetVarcoById, getVarcoById);
router.post('/varco', authorize(['operatore']), validateCreateVarco, createVarco);
router.put('/varco/:id', authorize(['operatore']), validateUpdateVarco, updateVarco);
router.delete('/varco/:id', authorize(['operatore']), validateDeleteVarco, deleteVarco);

export default router;
