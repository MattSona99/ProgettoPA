import { body } from "express-validator";
import validateRequest from "./validateRequestMiddleware";

/**
 * Validazioni per le rotte di Utente
 */

export const validateLogin = [
    body('email')
        .notEmpty().withMessage('Email obbligatoria')
        .isEmail().withMessage('Email non valida'),
    validateRequest
]