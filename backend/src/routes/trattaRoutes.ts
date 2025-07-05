import { Router } from 'express';
import {
    getAllTratte,
    getTrattaById,
    createTratta,
    updateTratta,
    deleteTratta
} from '../controllers/trattaController';
import { authMiddleware, authorize } from '../middleware/authMiddleware';
import { 
    validateCreateTratta, 
    validateGetTrattaById, 
    validateUpdateTratta, 
    validateDeleteTratta 
} from '../middleware/validate/trattaValidate';
import { RuoloUtente } from '../enums/RuoloUtente';


const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);

// Rotte per la gestione delle tratte
router.get('/tratta', authorize([RuoloUtente.OPERATORE]), getAllTratte);
router.get('/tratta/:id', authorize([RuoloUtente.OPERATORE]), validateGetTrattaById, getTrattaById);
router.post('/tratta', authorize([RuoloUtente.OPERATORE]), validateCreateTratta, createTratta);
router.put('/tratta/:id', authorize([RuoloUtente.OPERATORE]), validateUpdateTratta, updateTratta);
router.delete('/tratta/:id', authorize([RuoloUtente.OPERATORE]), validateDeleteTratta, deleteTratta);

export default router;