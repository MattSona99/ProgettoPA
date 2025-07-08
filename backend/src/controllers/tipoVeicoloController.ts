import { Request, Response, NextFunction } from 'express';
import tipoVeicoloRepository from '../repositories/tipoVeicoloRepository';

import { StatusCodes } from 'http-status-codes';

/**
 * Funzione per ottenere tutti i tipi di Veicolo.
 */
export const getAllTipoVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tipiVeicolo = await tipoVeicoloRepository.getAllTipoVeicolo();

        res.status(StatusCodes.OK).json(tipiVeicolo);

    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per ottenere un tipo di Veicolo da un ID.
 */
export const getTipoVeicoloById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);

        const tipoVeicolo = await tipoVeicoloRepository.getTipoVeicoloById(id);

        res.status(StatusCodes.OK).json(tipoVeicolo);

    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per creare un nuovo tipo di Veicolo.
 */
export const createTipoVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nuovoTipoVeicolo = await tipoVeicoloRepository.createTipoVeicolo(req.body);
        
        res.status(StatusCodes.CREATED).json(nuovoTipoVeicolo);

    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per aggiornare un tipo di Veicolo esistente.
 */
export const updateTipoVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        
        const [rows, updatedTipoVeicolo] = await tipoVeicoloRepository.updateTipoVeicolo(id, req.body);
        
        res.status(StatusCodes.OK).json({ message: `Row modificate: ${rows}, Tipo di veicolo con id = ${id} aggiornato con successo.`, tipoVeicolo: updatedTipoVeicolo });
    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per eliminare un tipo di Veicolo.
 */
export const deleteTipoVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);

        const [rows, deletedTipoVeicolo] = await tipoVeicoloRepository.deleteTipoVeicolo(id);
        
        res.status(StatusCodes.OK).json({ message: `Row eliminate: ${rows}, Tipo di veicolo con id = ${id} eliminato con successo.`, tipoVeicolo: deletedTipoVeicolo });
        
    } catch (error) {
        next(error);
    }
};