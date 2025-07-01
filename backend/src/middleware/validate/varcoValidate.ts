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
    body('id_varco').notEmpty().withMessage('ID varco non deve essere fornito.'),
    body('nome').isString().withMessage('Nome deve essere una stringa.'),
    body('km').isInt({min: 1}).withMessage('Chilometraggio (KM) deve essere un numero intero.'),
    body('smart').isString().withMessage('Smart deve essere una stringa.'),
    body('pioggia').isString().withMessage('Pioggia deve essere una stringa.'),
    body('utente').isInt({min: 1}).withMessage('Utente deve essere un numero intero.'),
    validateRequest
];

export const validateUpdateVarco = [
    param('id').isInt({min: 1}).withMessage('ID deve essere un numero intero.'),
    body('nome').isString().withMessage('Nome deve essere una stringa.'),
    body('km').isInt({min: 1}).withMessage('Chilometraggio (KM) deve essere un numero intero.'),
    body('smart').isString().withMessage('Smart deve essere una stringa.'),
    body('pioggia').isString().withMessage('Pioggia deve essere una stringa.'),
    body('utente').isInt({min: 1}).withMessage('Utente deve essere un numero intero.'),
    validateRequest
];

export const validateDeleteVarco = [
    param('id').isInt({min: 1}).withMessage('ID deve essere un numero intero.'),
    validateRequest
];