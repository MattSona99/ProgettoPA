import { body, param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

/**
 * Validazioni per le rotte di Multa
 */

// Regular Expression per le targhe italiane
const targaRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

export const validateCreateMulta = [
    body('id_multa').isInt({ min: 1 }).withMessage('ID deve essere un numero intero positivo.'),
    body('utente').isInt({ min: 1 }).withMessage('Utente ID deve essere un numero intero positivo.'),
    body('transito').isInt({ min: 1 }).withMessage('Transito ID deve essere un numero intero positivo.'),
    validateRequest
];

export const validateGetMulteByTargheEPeriodo = [
    param('targa').isArray({ min: 1 }).withMessage('Targhe deve essere un array con almeno un elemento.'),
    param('targa.*').matches(targaRegex).withMessage('Targa deve essere una registrazione valida.'),
    param('dataIn').isDate().withMessage('Data di inizio deve essere una data valida.'),
    param('dataOut').isDate().withMessage('Data di fine deve essere una data valida.'),
    validateRequest
];
