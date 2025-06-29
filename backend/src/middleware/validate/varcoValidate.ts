import { body, param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

export const validateGetVarcoById = [
    param('id').isInt().withMessage('ID deve essere un numero intero.'),
    validateRequest
]