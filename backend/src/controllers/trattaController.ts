import { Request, Response, NextFunction } from 'express';
import trattaRepository from '../repositories/trattaRepository';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

/**
 * Funzione per ottenere tutte le tratte.
 */
export const getAllTratte = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tratte = await trattaRepository.getAllTratte();
        res.status(StatusCodes.OK).json(tratte);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle tratte."));
    }
};

/**
 * Funzione per ottenere una tratta da un ID. 
 */
export const getTrattaById = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    try {
        const tratta = await trattaRepository.getTrattaById(id);
        if (tratta) {
            res.status(StatusCodes.OK).json(tratta);
        } else {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Tratta non trovata."));
        }
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero della tratta."));
    }
};

/**
 * Funzione per creare una nuova tratta.
 */
export const createTratta = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nuovaTratta = await trattaRepository.createTratta(req.body);
        res.status(StatusCodes.CREATED).json(nuovaTratta);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione della tratta."));
    }
};

/**
 * Funzione per aggiornare una tratta esistente.
 */
export const updateTratta = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    try {
        const [updated] = await trattaRepository.updateTratta(id, req.body);
        if (updated) {
            const updatedTratta = await trattaRepository.getTrattaById(id);
            res.status(StatusCodes.OK).json(updatedTratta);
        } else {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Tratta non trovata."));
        }
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiornamento della tratta."));
    }
};

/**
 * Funzione per eliminare una tratta.
 */
export const deleteTratta = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    try {
        const deleted = await trattaRepository.deleteTratta(id);
        if (deleted) {
            res.status(StatusCodes.OK).json({ message: "Tratta eliminata con successo." });
        } else {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Tratta non trovata."));
        }
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'eliminazione della tratta."));
    }
};