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
import { RuoloUtente } from '../enums/RuoloUtente';

const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);

// Rotte per la gestione dei varchi
router.get('/varco', authorize([RuoloUtente.OPERATORE]), getAllVarco);
router.get('/varco/:id', authorize([RuoloUtente.OPERATORE]), validateGetVarcoById, getVarcoById);
router.post('/varco', authorize([RuoloUtente.OPERATORE]), validateCreateVarco, createVarco);
router.put('/varco/:id', authorize([RuoloUtente.OPERATORE]), validateUpdateVarco, updateVarco);
router.delete('/varco/:id', authorize([RuoloUtente.OPERATORE]), validateDeleteVarco, deleteVarco);

export default router;
