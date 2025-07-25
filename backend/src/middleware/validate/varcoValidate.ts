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
    body('km').isInt({min: 1, max: 800}).withMessage('Chilometraggio (KM) deve essere un numero intero. Valore compreso tra 1 e 800.'),
    body('smart').isBoolean().withMessage('Smart deve essere un valore booleano.'),
    body('pioggia').isBoolean().withMessage('Pioggia deve essere un valore booleano.'),
    validateRequest
];

export const validateUpdateVarco = [
    param('id').isInt({min: 1}).withMessage('ID deve essere un numero intero.'),
    body('nome_autostrada').optional().isString().withMessage('Nome deve essere una stringa.'),
    body('km').optional().isInt({min: 1,max: 800}).withMessage('Chilometraggio (KM) deve essere un numero intero. Valore compreso tra 1 e 800.'),
    body('smart').optional().isBoolean().withMessage('Smart deve essere un valore booleano.'),
    body('pioggia').optional().isBoolean().withMessage('Pioggia deve essere un valore booleano.'),
    validateRequest
];

export const validateDeleteVarco = [
    param('id').isInt({min: 1}).withMessage('ID deve essere un numero intero.'),
    validateRequest
];