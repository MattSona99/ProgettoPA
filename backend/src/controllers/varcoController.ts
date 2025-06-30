import { Request, Response, NextFunction } from 'express';
import varcoRepository from '../repositories/varcoRepository';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

export const getVarcoById = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    try {
        const varco = await varcoRepository.findVarco(parseInt(id));
        if (!varco) {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco non trovato."));
        }
        res.status(StatusCodes.OK).json(varco);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero del varco."));
    }
}

export const createVarco = async (req: Request, res: Response, next: NextFunction) => {
    const newVarco = req.body;
    try {
        const createdVarco = await varcoRepository.createVarco(newVarco);
        res.status(StatusCodes.CREATED).json(createdVarco);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione del varco."));
    }
}

export const updateVarco = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const updatedData = req.body;
    try {
        const updatedVarco = await varcoRepository.updateVarco(parseInt(id), updatedData);
        if (!updatedVarco) {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco non trovato."));
        }
        res.status(StatusCodes.OK).json(updatedVarco);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiornamento del varco."));
    }
}

export const deleteVarco = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    try {
        const deleted = await varcoRepository.deleteVarco(parseInt(id));
        if (!deleted) {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco non trovato."));
        }
        res.status(StatusCodes.NO_CONTENT).json({ message: "Varco eliminato con successo" });
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'eliminazione del varco."));
    }
}