import { body, param } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

/**
 * Validazioni per le rotte di Multa
 */

// Regular Expression per le targhe italiane
const targaRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

export const validateCreateMulta = [
    body('importo').isInt({ min: 1 }).withMessage('Importo deve essere un numero intero positivo.'),
    body('transito').isInt({ min: 1 }).withMessage('Transito ID deve essere un numero intero positivo.'),
    validateRequest
];

export const validateGetMulteByTargheEPeriodo = [
    param('targa').isArray({ min: 1 }).withMessage('Targhe deve essere un array con almeno un elemento.'),
    param('targa.*').matches(targaRegex).withMessage('Targa del veicolo deve rispettare il formato AA123AA.'),
    param('dataIn').isDate().withMessage('Data di inizio deve essere una data valida.'),
    param('dataOut').isDate().withMessage('Data di fine deve essere una data valida.'),
    validateRequest
];
