import {Router} from 'express';
import {authMiddleware} from '../middleware/authMiddleware';
import {getVarcoById} from '../controllers/varcoController';

const router = Router();


// Middleware di autenticazione per tutte le rotte
router.use(authMiddleware);

// Rotte per la gestione dei varchi
router.get('/varco/:id', getVarcoById);
// router.post('/varco', createVarco);
// router.put('/varco/:id', updateVarco);
// router.delete('/varco/:id', deleteVarco);

export default router;
