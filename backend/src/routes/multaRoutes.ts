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

const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);

// Rotte per la gestione delle multe
router.get('/multa', authorize(['operatore']), getAllMulte);
router.get('/multa/dettagli', authorize(['operatore', 'automobilista']), validateGetMulteByTargheEPeriodo, getMulteByTargheEPeriodo);
router.get('/multa/download/:id', authorize(['automobilista']), downloadBollettinoPDF);

export default router;