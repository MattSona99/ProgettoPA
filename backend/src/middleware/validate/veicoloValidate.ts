import { body, param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

/**
 * Validazioni per le rotte di Veicolo
 */

// Regular Expression per le targhe italiane
const targaRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

export const validateGetVeicoloById = [
    param('targa').matches(targaRegex).withMessage('Targa del veicolo deve rispettare il formato AA123AA.'),
    validateRequest
];

export const validateCreateVeicolo = [
    body('targa').matches(targaRegex).withMessage('Targa del veicolo deve rispettare il formato AA123AA.'),
    body('tipo_veicolo').isInt({ min: 1 }).withMessage('Tipo veicolo ID deve essere un numero intero positivo.'),
    body('utente').isInt({ min: 1 }).withMessage('Utente ID deve essere un numero intero positivo.'),
    validateRequest
];

export const validateUpdateVeicolo = [
    param('targa').matches(targaRegex).withMessage('Targa del veicolo deve rispettare il formato AA123AA.'),
    body('tipo_veicolo').optional().isInt({ min: 1 }).withMessage('Tipo veicolo ID deve essere un numero intero positivo.'),
    body('utente').optional().isInt({ min: 1 }).withMessage('Utente ID deve essere un numero intero positivo.'),
    validateRequest
];

export const validateDeleteVeicolo = [
    param('targa').matches(targaRegex).withMessage('Targa del veicolo deve rispettare il formato AA123AA.'),
    validateRequest
];