import { Router } from 'express';
import {
    getAllVeicoli,
    getVeicoloById,
    createVeicolo,
    updateVeicolo,
    deleteVeicolo
} from '../controllers/veicoloController';
import { authMiddleware, authorize } from '../middleware/authMiddleware';
import {
    validateGetVeicoloById,
    validateCreateVeicolo,
    validateUpdateVeicolo,
    validateDeleteVeicolo
} from '../middleware/validate/veicoloValidate';
import { RuoloUtente } from '../enums/RuoloUtente';

const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware)

// Rotte per la gestione dei veicoli
router.get('/veicolo', authorize([RuoloUtente.OPERATORE]), getAllVeicoli);
router.get('/veicolo/:targa', authorize([RuoloUtente.OPERATORE]), validateGetVeicoloById, getVeicoloById);
router.post('/veicolo', authorize([RuoloUtente.OPERATORE]), validateCreateVeicolo, createVeicolo);
router.put('/veicolo/:targa', authorize([RuoloUtente.OPERATORE]), validateUpdateVeicolo, updateVeicolo);
router.delete('/veicolo/:targa', authorize([RuoloUtente.OPERATORE]), validateDeleteVeicolo, deleteVeicolo);

export default router;