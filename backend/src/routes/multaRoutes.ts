import { Router } from 'express';
import { 
    getAllMulte,
    getMulteByTargheEPeriodo,
    downloadBollettinoPDF,
    deleteMulta
 } from '../controllers/multaController';
import { authMiddleware, authorize } from '../middleware/authMiddleware';
import { 
    validateGetMulteByTargheEPeriodo,
    validateDeleteMulta
 } from '../middleware/validate/multaValidate';
import { RuoloUtente } from '../enums/RuoloUtente';

const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);

// Rotte per la gestione delle multe
router.get('/multa', authorize([RuoloUtente.OPERATORE]), getAllMulte);
router.get('/multa/dettagli', authorize([RuoloUtente.OPERATORE, RuoloUtente.AUTOMOBILISTA]), validateGetMulteByTargheEPeriodo, getMulteByTargheEPeriodo);
router.get('/multa/download/:id', authorize([RuoloUtente.AUTOMOBILISTA]), downloadBollettinoPDF);
router.delete('/multa/:id', authorize([RuoloUtente.OPERATORE]), validateDeleteMulta, deleteMulta);

export default router;