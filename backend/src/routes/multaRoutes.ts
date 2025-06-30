import { Router } from 'express';
import { 
    getMulte,
    createMulta,
    downloadBollettinoPDF
 } from '../controllers/multaController';
import { authMiddleware, authorize } from '../middleware/authMiddleware';
import { 
    validateGetMulte,
    validateCreateMulta,
    validateDownloadBollettinoPDF
 } from '../middleware/validate/multaValidate';

const router = Router();

// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);

// Rotte per la gestione delle multe
router.get('/multe', authorize(['operatore', 'automobilista']), validateGetMulte, getMulte);
router.post('/multe', authorize(['operatore']), validateCreateMulta, createMulta);
router.get('/multe/download/:id', authorize(['operatore', 'automobilista']), validateDownloadBollettinoPDF, downloadBollettinoPDF);

export default router;