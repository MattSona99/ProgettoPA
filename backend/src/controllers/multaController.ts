import { Request, Response, NextFunction } from 'express';
import multaRepository from '../repositories/multaRepository';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';
import Utente from '../models/utente';

/**
 * Funzione per creare una multa
 */
export const createMulta = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const createdMulta = await multaRepository.create(req.body);
        res.status(StatusCodes.CREATED).json(createdMulta);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione della multa."));
    }
}

/**
 * Funzione per ottenere le multe per le targhe e il periodo specificato.
 */
export const getMulteByTargheEPeriodo = async (req: Request, res: Response, next: NextFunction) => {
    const { targhe, dataIn, dataOut } = req.query;
    const utente = (req as any).user;
    try {
        const multe = await multaRepository.getMulteByTargheEPeriodo(
            targhe as string[],
            dataIn as string,
            dataOut as string,
            utente as Utente
        );
        res.status(StatusCodes.OK).json(multe);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle multe."));
    }
}

