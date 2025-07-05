import { Router } from 'express';
import {
    getAllTipoVeicolo,
    getTipoVeicoloById,
    createTipoVeicolo,
    updateTipoVeicolo,
    deleteTipoVeicolo,
} from '../controllers/tipoVeicoloController';
import { authMiddleware, authorize } from '../middleware/authMiddleware';
import {
    validateGetTipoVeicoloById,
    validateCreateTipoVeicolo,
    validateUpdateTipoVeicolo,
    validateDeleteTipoVeicolo
} from '../middleware/validate/tipoVeicoloValidate';
import { RuoloUtente } from '../enums/RuoloUtente';

const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);

// Rotte per la gestione dei tipi di veicolo
router.get('/tipoVeicolo', authorize([RuoloUtente.OPERATORE]), getAllTipoVeicolo);
router.get('/tipoVeicolo/:id', authorize([RuoloUtente.OPERATORE]), validateGetTipoVeicoloById, getTipoVeicoloById);
router.post('/tipoVeicolo', authorize([RuoloUtente.OPERATORE]), validateCreateTipoVeicolo, createTipoVeicolo);
router.put('/tipoVeicolo/:id', authorize([RuoloUtente.OPERATORE]), validateUpdateTipoVeicolo, updateTipoVeicolo);
router.delete('/tipoVeicolo/:id', authorize([RuoloUtente.OPERATORE]), validateDeleteTipoVeicolo, deleteTipoVeicolo);

export default router;

