import { Request, Response, NextFunction } from 'express';
import varcoRepository from '../repositories/varcoRepository';
import { StatusCodes } from 'http-status-codes';

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
    try {
        const { id } = req.params;

        const varco = await varcoRepository.getVarcoById(parseInt(id));

        res.status(StatusCodes.OK).json(varco);

    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per creare un nuovo varco.
 */
export const createVarco = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newVarco = req.body;

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
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const [rows, updatedVarco] = await varcoRepository.updateVarco(parseInt(id), updatedData);

        res.status(StatusCodes.OK).json({ message: `Row modificate: ${rows}, Varco con id = ${id} aggiornato con successo.`, varco: updatedVarco });

    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per eliminare un varco.
 */
export const deleteVarco = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const [rows, deletedVarco] = await varcoRepository.deleteVarco(parseInt(id));
        
        res.status(StatusCodes.OK).json({ message: `Row eliminate: ${rows}, Varco con id = ${id} eliminato con successo.`, varco: deletedVarco });
        
    } catch (error) {
        next(error);
    }
}