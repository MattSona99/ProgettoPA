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


const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);

// Rotte per la gestione delle tratte
router.get('/tratta', authorize(['operatore']), getAllTratte);
router.get('/tratta/:id', authorize(['operatore']), validateGetTrattaById, getTrattaById);
router.post('/tratta', authorize(['operatore']), validateCreateTratta, createTratta);
router.put('/tratta/:id', authorize(['operatore']), validateUpdateTratta, updateTratta);
router.delete('/tratta/:id', authorize(['operatore']), validateDeleteTratta, deleteTratta);

export default router;