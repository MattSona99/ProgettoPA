import { Router } from 'express';
import { 
    getAllMulte,
    getMulteByTargheEPeriodo,
    downloadBollettinoPDF
 } from '../controllers/multaController';
import { authMiddleware, authorize } from '../middleware/authMiddleware';
import { 
    validateGetMulteByTargheEPeriodo
 } from '../middleware/validate/multaValidate';
import { RuoloUtente } from '../enums/RuoloUtente';

const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);

// Rotte per la gestione delle multe
router.get('/multa', authorize([RuoloUtente.OPERATORE]), getAllMulte);
router.get('/multa/dettagli', authorize([RuoloUtente.OPERATORE, RuoloUtente.AUTOMOBILISTA]), validateGetMulteByTargheEPeriodo, getMulteByTargheEPeriodo);
router.get('/multa/download/:id', authorize([RuoloUtente.AUTOMOBILISTA]), downloadBollettinoPDF);

export default router;