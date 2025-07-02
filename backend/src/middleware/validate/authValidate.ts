import { body } from "express-validator";
import validateRequest from "./validateRequestMiddleware";

/**
 * Validazioni per le rotte di Utente
 */

export const validateLogin = [
    body('email')
        .notEmpty().withMessage('Email è obbligatoria.')
        .isEmail().withMessage('Email non è valida.'),
    validateRequest
]