import { Router } from 'express';
import {
    validateGetTransitoById,
    validateCreateTransito,
    validateUpdateTransito,
    validateDeleteTransito
} from '../middleware/validate/transitoValidate';
import { authMiddleware, authorize } from '../middleware/authMiddleware';
import {
    getTransitoById,
    createTransito,
    createTransitoByVarco,
    updateTransito,
    deleteTransito,
    getAllTransiti
} from '../controllers/transitoController';
import { uploadImage } from '../utils/upload';
import { RuoloUtente } from '../enums/RuoloUtente';

const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);

// Rotte per la gestione del transito
router.get('/transito', authorize([RuoloUtente.OPERATORE]), getAllTransiti);
router.get('/transito/:id', authorize([RuoloUtente.OPERATORE]), validateGetTransitoById, getTransitoById);
router.post('/transito/smart', authorize([RuoloUtente.OPERATORE, RuoloUtente.VARCO]), validateCreateTransito, createTransito);
router.post('/transito/manuale', authorize([RuoloUtente.VARCO]), uploadImage.single('image'), createTransitoByVarco);
router.put('/transito/:id', authorize([RuoloUtente.OPERATORE]), validateUpdateTransito, updateTransito);
router.delete('/transito/:id', authorize([RuoloUtente.OPERATORE]), validateDeleteTransito, deleteTransito);

export default router;
