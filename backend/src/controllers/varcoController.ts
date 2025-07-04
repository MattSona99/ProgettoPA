import { Request, Response, NextFunction } from 'express';
import varcoRepository from '../repositories/varcoRepository';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

/**
 * Funzione per ottenere tutti i varchi
 */
export const getAllVarco = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const varchi = await varcoRepository.getAllVarco();
        res.status(StatusCodes.OK).json(varchi);
    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per ottenere un varco da un ID.
 */
export const getVarcoById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const varco = await varcoRepository.getVarcoById(parseInt(id));
        if (!varco) {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco non trovato."));
        }
        res.status(StatusCodes.OK).json(varco);
    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per creare un nuovo varco.
 */
export const createVarco = async (req: Request, res: Response, next: NextFunction) => {
    const newVarco = req.body;
    try {
        const createdVarco = await varcoRepository.createVarco(newVarco);
        res.status(StatusCodes.CREATED).json(createdVarco);
    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per aggiornare un varco esistente.
 */
export const updateVarco = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updatedData = req.body;
    try {
        const updatedVarco = await varcoRepository.updateVarco(parseInt(id), updatedData);
        if (!updatedVarco) {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco non trovato."));
        }
        res.status(StatusCodes.OK).json(updatedVarco);
    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per eliminare un varco.
 */
export const deleteVarco = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const deleted = await varcoRepository.deleteVarco(parseInt(id));
        if (deleted) {
            res.status(StatusCodes.OK).json({ message: "Varco eliminato con successo." });
        } else {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco non trovato."));
        }
    } catch (error) {
        next(error);
    }
}