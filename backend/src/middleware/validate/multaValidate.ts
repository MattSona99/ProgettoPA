import { query } from 'express-validator';
import validateRequest from './validateRequestMiddleware';

/**
 * Validazioni per le rotte di Multa
 */

// Regular Expression per le targhe italiane
const targaRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

export const validateGetMulteByTargheEPeriodo = [
    query('targa')
    .exists().withMessage('Serve almeno una targa.')
    .bail()
    .customSanitizer((val) => {
      // Se arriva come stringa, lo avvolgo in un array
      if (typeof val === 'string') return [val];
      return val;
    })
    // 2) Solo ora lo tratto come array
    .isArray({ min: 1 }).withMessage('Targhe deve essere un array con almeno un elemento.'),
    query('targa.*').matches(targaRegex).withMessage('Targa deve essere una registrazione valida.'),
    query('dataIn').isISO8601().withMessage('Data di inizio deve essere una data valida (YYYY-MM-DD).'),
    query('dataOut').isISO8601().withMessage('Data di fine deve essere una data valida (YYYY-MM-DD).'),
    query('formato').isString().withMessage('Formato deve essere una stringa.'),
    validateRequest
];
