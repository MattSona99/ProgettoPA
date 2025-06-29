import { body, param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

/**
 * Validazioni per le rotte di tipoVeicolo
 */

export const validateGetTipoVeicoloById = [
    param('id').isInt().withMessage('ID deve essere un numero intero.'),
    validateRequest
];

export const validateCreateTipoVeicolo = [
    body('tipo').isString().withMessage('Tipo deve essere una stringa.'),
    body('limite_velocita').isInt().withMessage('Limite velocità deve essere un numero intero.'),
    validateRequest
];

export const validateUpdateTipoVeicolo = [
    param('id').isInt().withMessage('ID deve essere un numero intero.'),
    body('tipo').isString().withMessage('Tipo deve essere una stringa.'),
    body('limite_velocita').isInt().withMessage('Limite velocità deve essere un numero intero.'),
    validateRequest
];

export const validateDeleteTipoVeicolo = [
    param('id').isInt().withMessage('ID deve essere un numero intero.'),
    validateRequest
];