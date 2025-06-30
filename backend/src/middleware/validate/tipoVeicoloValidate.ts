import { body, param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

/**
 * Validazioni per le rotte di tipoVeicolo
 */

export const validateGetTipoVeicoloById = [
    param('id').isInt({ min: 1 }).withMessage('ID deve essere un numero intero positivo.'),
    validateRequest
];

export const validateCreateTipoVeicolo = [
    body('tipo').isString().withMessage('Tipo deve essere una stringa.'),
    body('limite_velocita').isInt({ min: 1 }).withMessage('Limite velocità deve essere un numero intero positivo.'),
    validateRequest
];

export const validateUpdateTipoVeicolo = [
    param('id').isInt({ min: 1 }).withMessage('ID deve essere un numero intero positivo.'),
    body('tipo').optional().isString().withMessage('Tipo deve essere una stringa.'),
    body('limite_velocita').optional().isInt({ min: 1 }).withMessage('Limite velocità deve essere un numero intero positivo.'),
    validateRequest
];

export const validateDeleteTipoVeicolo = [
    param('id').isInt({ min: 1 }).withMessage('ID deve essere un numero intero positivo.'),
    validateRequest
];