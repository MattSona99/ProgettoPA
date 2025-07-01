import { body, param } from "express-validator";
import validateRequest from "./validateRequestMiddleware";

/**
 * Validazioni per le rotte di Utente
 */

// Regular Expression per le targhe italiane
const targaRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

export const validateGetTransitoById = [
    param('id').isInt({ min: 1 }).withMessage('ID del transito deve essere un numero intero'),
    validateRequest
]

export const validateCreateTransito = [
    body('veicolo').matches(targaRegex).withMessage('Targa del veicolo deve rispettare il formato AA123AA'),
    body('tratta').isInt({ min: 1 }).withMessage('ID della tratta deve essere un numero intero'),
    body('data_in').isDate().withMessage('Data di ingresso deve essere una data valida'),
    body('data_out').isDate().withMessage('Data di uscita deve essere una data valida'),
    // valori da calcolare
    // body('velocita_media').isFloat({ min: 1 }).withMessage('Velocità media deve essere un numero positivo'),
    // body('delta_velocita').isFloat({ min: 1 }).withMessage('Delta velocità deve essere un numero positivo'),
    validateRequest
]

export const validateUpdateTransito = [
    param('id').isInt({ min: 1 }).withMessage('ID del transito deve essere un numero intero'),
    body('veicolo').optional().matches(targaRegex).withMessage('Targa del veicolo deve rispettare il formato AA123AA'),
    body('tratta').optional().isInt({ min: 1 }).withMessage('ID della tratta deve essere un numero intero'),
    body('data_in').optional().isDate().withMessage('Data di ingresso deve essere una data valida'),
    body('data_out').optional().isDate().withMessage('Data di uscita deve essere una data valida'),
    body('velocita_media').optional().isFloat({ min: 1 }).withMessage('Velocità media deve essere un numero positivo'),
    body('delta_velocita').optional().isFloat({ min: 1 }).withMessage('Delta velocità deve essere un numero positivo'),
    validateRequest
]

export const validateDeleteTransito = [
    param('id').isInt({ min: 1 }).withMessage('ID del transito deve essere un numero intero'),
    validateRequest
]