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

const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware)

// Rotte per la gestione dei veicoli
router.get('/veicoli', authorize(['operatore']), getAllVeicoli);
router.get('/veicoli/:targa', authorize(['operatore']), validateGetVeicoloById, getVeicoloById);
router.post('/veicoli', authorize(['operatore']), validateCreateVeicolo, createVeicolo);
router.put('/veicoli/:targa', authorize(['operatore']), validateUpdateVeicolo, updateVeicolo);
router.delete('/veicoli/:targa', authorize(['operatore']), validateDeleteVeicolo, deleteVeicolo);

export default router;