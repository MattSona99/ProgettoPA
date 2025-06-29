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
router.get('/tratte', getAllTratte);
router.get('/tratte/:id', authorize(['operatore']), validateGetTrattaById, getTrattaById);
router.post('/tratte', authorize(['operatore']), validateCreateTratta, createTratta);
router.put('/tratte/:id', authorize(['operatore']), validateUpdateTratta, updateTratta);
router.delete('/tratte/:id', authorize(['operatore']), validateDeleteTratta, deleteTratta);

export default router;