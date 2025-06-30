import { Router } from "express";
import { login} from "../controllers/authController";
import { validateLogin } from "../middleware/validate/authValidate";

const router = Router();

// Rotta per il login
// Questa rotta non richiede autenticazione, quindi non utilizza il middleware authMiddleware
router.post('/login', validateLogin, login);

export default router;