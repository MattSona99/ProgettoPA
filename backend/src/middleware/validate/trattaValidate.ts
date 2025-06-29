import { body, param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

/**
 * Validazioni per le rotte di Tratta
 */

export const validateGetTrattaById = [
    param('id').isInt().withMessage('ID deve essere un numero intero.'),
    validateRequest
];

export const validateCreateTratta = [
    body('id').isInt().withMessage('ID deve essere un numero intero.'),
    // ????
    validateRequest
];

export const validateUpdateTratta = [
    param('id').isInt().withMessage('ID deve essere un numero intero.'),
    validateRequest
];

export const validateDeleteTratta = [
    param('id').isInt().withMessage('ID deve essere un numero intero.'),
    validateRequest
];

