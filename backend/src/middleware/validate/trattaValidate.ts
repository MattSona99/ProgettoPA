import { body, param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

/**
 * Validazioni per le rotte di Tratta
 */

export const validateGetTrattaById = [
    param('id').isInt({ min: 1 }).withMessage('ID deve essere un numero intero.'),
    validateRequest
];

export const validateCreateTratta = [
    body('varco_in').isInt({ min: 1 }).withMessage('Varco di ingresso ID deve essere un numero intero.'),
    body('varco_out').isInt({ min: 1 }).withMessage('Varco di uscita ID deve essere un numero intero.'),
    validateRequest
];

export const validateUpdateTratta = [
    param('id').isInt({ min: 1 }).withMessage('ID deve essere un numero intero.'),
    body('varco_in').optional().isInt({ min: 1 }).withMessage('Varco di ingresso ID deve essere un numero intero.'), 
    body('varco_out').optional().isInt({ min: 1 }).withMessage('Varco di uscita ID deve essere un numero intero.'),
    body('distanza').optional().isFloat({ min: 1 }).withMessage('Distanza deve essere un numero positivo.'),
    validateRequest
];

export const validateDeleteTratta = [
    param('id').isInt({ min: 1 }).withMessage('ID deve essere un numero intero.'),
    validateRequest
];

