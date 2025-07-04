import { Request, Response, NextFunction } from 'express';
import tipoVeicoloDao from '../dao/tipoVeicoloDao';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

/**
 * Funzione per ottenere tutti i tipi di Veicolo.
 */
export const getAllTipoVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tipiVeicolo = await tipoVeicoloDao.getAll();
        res.status(StatusCodes.OK).json(tipiVeicolo);
    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per ottenere un tipo di Veicolo da un ID.
 */
export const getTipoVeicoloById = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    try {
        const tipoVeicolo = await tipoVeicoloDao.getById(id);
        if (!tipoVeicolo) {
            return next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Tipo di veicolo non trovato."))
        } else {
            res.status(StatusCodes.OK).json(tipoVeicolo);
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per creare un nuovo tipo di Veicolo.
 */
export const createTipoVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nuovoTipoVeicolo = await tipoVeicoloDao.create(req.body);
        res.status(StatusCodes.CREATED).json(nuovoTipoVeicolo);
    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per aggiornare un tipo di Veicolo esistente.
 */
export const updateTipoVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);

    try {
        const [updated] = await tipoVeicoloDao.update(id, req.body);
        if (updated) {
            const updatedTipoVeicolo = await tipoVeicoloDao.getById(id);
            res.status(StatusCodes.OK).json(updatedTipoVeicolo);
        } else {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, 'Tipo di veicolo non trovato.'));
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per eliminare un tipo di Veicolo.
 */
export const deleteTipoVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    try {
        const deleted = await tipoVeicoloDao.delete(id);
        if (deleted) {
            res.status(StatusCodes.OK).json({ message: "Tipo di veicolo eliminato" });
        } else {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Tipo di veicolo non trovato."));
        }
    } catch (error) {
        next(error);
    }
};