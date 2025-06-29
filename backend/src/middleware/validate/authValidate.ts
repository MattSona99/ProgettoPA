import { body } from "express-validator";
import validateRequest from "./validateRequestMiddleware";

export const validateLogin = [
    body('email').isEmail().notEmpty().withMessage('Email non valida'),
    validateRequest
]