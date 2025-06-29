import { body, param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

/**
 * Validazioni per le rotte di Veicolo
 */

// Regular Expression per le targhe italiane
const targaRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

export const validateGetVeicoloById = [
    param('targa').matches(targaRegex).withMessage('Targa deve essere una registrazione valida.'),
    validateRequest
];

export const validateCreateVeicolo = [
    body('targa').matches(targaRegex).withMessage('Targa deve essere una registrazione valida.'),
    body('tipo_veicolo').isInt().withMessage('Tipo veicolo deve essere un numero intero.'),
    body('utente').isInt().withMessage('Utente deve essere un numero intero.'),
    validateRequest
];

export const validateUpdateVeicolo = [
    param('targa').matches(targaRegex).withMessage('Targa deve essere una registrazione valida.'),
    body('tipo_veicolo').isInt().withMessage('Tipo veicolo deve essere un numero intero.'),
    body('utente').isInt().withMessage('Utente deve essere un numero intero.'),
    validateRequest
];

export const validateDeleteVeicolo = [
    param('targa').matches(targaRegex).withMessage('Targa deve essere una registrazione valida'),
    validateRequest
];