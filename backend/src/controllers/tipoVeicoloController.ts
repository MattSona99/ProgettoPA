import { Request, Response, NextFunction } from 'express';
import tipoVeicoloDao from '../dao/tipoVeicoloDao';
import { StatusCodes } from 'http-status-codes';

/**
 * Funzione per ottenere tutti i tipi di veicolo.
 */
export const getAllTipoVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tipiVeicolo = await tipoVeicoloDao.getAll();
        res.status(StatusCodes.OK).json(tipiVeicolo);
    } catch (error) {
        next(error);
    }
}