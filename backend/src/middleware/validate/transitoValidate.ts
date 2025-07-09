import { body, param } from "express-validator";
import validateRequest from "./validateRequestMiddleware";
import { HttpErrorCodes, HttpErrorFactory } from "../../utils/errorHandler";

/**
 * Validazioni per le rotte di Utente
 */

// Regular Expression per le targhe italiane
const targaRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

export const validateGetTransitoById = [
    param('id').isInt({ min: 1 }).withMessage('ID del transito deve essere un numero intero.'),
    validateRequest
]

export const validateCreateTransito = [
    body('targa').matches(targaRegex).withMessage('Targa del veicolo deve rispettare il formato AA123AA.'),
    body('tratta').isInt({ min: 1 }).withMessage('ID della tratta deve essere un numero intero.'),
    body('data_in').isISO8601().toDate().withMessage('Data di ingresso deve essere una data valida (YYYY-MM-DD).'),
    body('data_out').isISO8601().toDate().withMessage('Data di uscita deve essere una data valida (YYYY-MM-DD).')
    .customSanitizer((value, { req }) => {
        // Se la data di uscita non è specificata, la imposto alla data di ingresso
        if (req.body.data_in > value) {
            throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, 'Data di uscita deve essere successiva alla data di ingresso.');
        }
        return value;
    }),
    validateRequest
]

export const validateCreateTransitoByVarco = [
    body('data_in').isISO8601().toDate().withMessage('Data di ingresso deve essere una data valida.'),
    validateRequest
]

export const validateUpdateTransito = [
    param('id').isInt({ min: 1 }).withMessage('ID del transito deve essere un numero intero.'),
    body('targa').optional().matches(targaRegex).withMessage('Targa del veicolo deve rispettare il formato AA123AA.'),
    body('tratta').optional().isInt({ min: 1 }).withMessage('ID della tratta deve essere un numero intero.'),
    body('data_in').optional().isISO8601().toDate().withMessage('Data di ingresso deve essere una data valida (YYYY-MM-DD).'),
    body('data_out').optional().isISO8601().toDate().withMessage('Data di uscita deve essere una data valida (YYYY-MM-DD).')
    .customSanitizer((value, { req }) => {
        // Se la data di uscita non è specificata, la imposto alla data di ingresso
        if (req.body.data_in > value) {
            throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, 'Data di uscita deve essere successiva alla data di ingresso.');
        }
        return value;
    }),
    validateRequest
]

export const validateDeleteTransito = [
    param('id').isInt({ min: 1 }).withMessage('ID del transito deve essere un numero intero.'),
    validateRequest
]