import { body, param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

/**
 * Validazioni per le rotte di Varco
 */

export const validateGetVarcoById = [
     param('id').isInt({min: 1}).withMessage('ID deve essere un numero intero.'),
    validateRequest
];

export const validateCreateVarco = [
    body('nome_autostrada').isString().withMessage('Nome deve essere una stringa.'),
    body('km').isInt({min: 1}).withMessage('Chilometraggio (KM) deve essere un numero intero.'),
    body('smart').isBoolean().withMessage('Smart deve essere una stringa.'),
    body('pioggia').isBoolean().withMessage('Pioggia deve essere una stringa.'),
    validateRequest
];

export const validateUpdateVarco = [
    param('id').isInt({min: 1}).withMessage('ID deve essere un numero intero.'),
    body('nome_autostrada').optional().isString().withMessage('Nome deve essere una stringa.'),
    body('km').optional().isInt({min: 1}).withMessage('Chilometraggio (KM) deve essere un numero intero.'),
    body('smart').optional().isBoolean().withMessage('Smart deve essere una stringa.'),
    body('pioggia').optional().isBoolean().withMessage('Pioggia deve essere una stringa.'),
    validateRequest
];

export const validateDeleteVarco = [
    param('id').isInt({min: 1}).withMessage('ID deve essere un numero intero.'),
    validateRequest
];