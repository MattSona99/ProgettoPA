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

const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);

// Rotte per la gestione dei tipi di veicolo
router.get('/tipoVeicolo', authorize(['operatore']), getAllTipoVeicolo);
router.get('/tipoVeicolo/:id', authorize(['operatore']), validateGetTipoVeicoloById, getTipoVeicoloById);
router.post('/tipoVeicolo', authorize(['operatore']), validateCreateTipoVeicolo, createTipoVeicolo);
router.put('/tipoVeicolo/:id', authorize(['operatore']), validateUpdateTipoVeicolo, updateTipoVeicolo);
router.delete('/tipoVeicolo/:id', authorize(['operatore']), validateDeleteTipoVeicolo, deleteTipoVeicolo);

export default router;

