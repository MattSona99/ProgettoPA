import { Request, Response, NextFunction } from 'express';
import transitoRepository from '../repositories/transitoRepository';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

export const getTransitoById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const transito = await transitoRepository.findTransito(parseInt(id));
        if (!transito) {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato."))
        }
        res.status(StatusCodes.OK).json(transito);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero del transito."));
    }
}

export const createTransito = async (req: Request, res: Response, next: NextFunction) => {
    const newTransito = req.body;
    try {
        const createdTransito = await transitoRepository.createTransito(newTransito);
        res.status(StatusCodes.CREATED).json(createdTransito);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione del transito."));
    }
}

export const updateTransito = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updatedData = req.body;
    try {
        const updatedTransito = await transitoRepository.updateTransito(parseInt(id), updatedData);
        if (!updatedTransito) {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato."));
        }
        res.status(StatusCodes.OK).json(updatedTransito);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiornamento del transito."));
    }
}

export const deleteTransito = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const deleted = await transitoRepository.deleteTransito(parseInt(id));
        if (!deleted) {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato."));
        }
        res.status(StatusCodes.NO_CONTENT).json({ message: "Transito eliminato con successo" });
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'eliminazione del transito."));
    }
}