import { Request, Response, NextFunction } from 'express';
import trattaRepository from '../repositories/trattaRepository';
import { StatusCodes } from 'http-status-codes';

/**
 * Funzione per ottenere tutte le tratte.
 */
export const getAllTratte = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tratte = await trattaRepository.getAllTratte();

        res.status(StatusCodes.OK).json(tratte);

    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per ottenere una tratta da un ID. 
 */
export const getTrattaById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);

        const tratta = await trattaRepository.getTrattaById(id);

        res.status(StatusCodes.OK).json(tratta);

    } catch (error) {
        next(error);
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
        next(error);
    }
};

/**
 * Funzione per aggiornare una tratta esistente.
 */
export const updateTratta = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);

        const [rows, updatedTratta] = await trattaRepository.updateTratta(id, req.body);

        res.status(StatusCodes.OK).json({ message: `Row modificate: ${rows}, Tratta con id = ${id} aggiornata con successo.`, tratta: updatedTratta });

    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per eliminare una tratta.
 */
export const deleteTratta = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);

        const [rows, deletedTratta] = await trattaRepository.deleteTratta(id);

        res.status(StatusCodes.OK).json({ message: `Row eliminate: ${rows}, Tratta con id = ${id} eliminata con successo.`, tratta: deletedTratta });

    } catch (error) {
        next(error);
    }
};