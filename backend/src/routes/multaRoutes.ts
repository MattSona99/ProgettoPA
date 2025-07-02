import { Router } from 'express';
import { 
    getAllMulte,
    getMulteByTargheEPeriodo,
    createMulta,
    //downloadBollettinoPDF
 } from '../controllers/multaController';
import { authMiddleware, authorize } from '../middleware/authMiddleware';
import { 
    validateGetMulteByTargheEPeriodo,
    validateCreateMulta,
    //validateDownloadBollettinoPDF
 } from '../middleware/validate/multaValidate';

const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);

// Rotte per la gestione delle multe
router.get('/multe', authorize(['operatore']), getAllMulte);
router.get('/multe/dettagli', authorize(['operatore', 'automobilista']), validateGetMulteByTargheEPeriodo, getMulteByTargheEPeriodo);
router.post('/multe', authorize(['operatore']), validateCreateMulta, createMulta);
//router.get('/multe/download/:id', authorize(['operatore', 'automobilista']), validateDownloadBollettinoPDF, downloadBollettinoPDF);

export default router;