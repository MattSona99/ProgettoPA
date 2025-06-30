import { body } from "express-validator";
import validateRequest from "./validateRequestMiddleware";

export const validateLogin = [
    body('email')
        .notEmpty().withMessage('Email obbligatoria')
        .isEmail().withMessage('Email non valida'),
    validateRequest
]