import { Request, Response, NextFunction } from 'express';
import transitoRepository from '../repositories/transitoRepository';
import { StatusCodes } from 'http-status-codes';

export const getTransitoById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const transito = await transitoRepository.findTransito(parseInt(id));
        if (!transito) {
            next(res.status(StatusCodes.NOT_FOUND).json({ message: "Transito non trovato" }));
        }
        res.status(StatusCodes.OK).json(transito);
    } catch (error) {
        next(error);
    }
}

export const createTransito = async (req: Request, res: Response, next: NextFunction) => {
    const newTransito = req.body;
    try {
        const createdTransito = await transitoRepository.createTransito(newTransito);
        if (!createdTransito) {
            next(res.status(StatusCodes.BAD_REQUEST).json({ message: "Errore nella creazione del transito" }));
        }
        res.status(StatusCodes.CREATED).json(createdTransito);
    } catch (error) {
        next(error);
    }
}

export const updateTransito = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updatedData = req.body;
    try {
        const updatedTransito = await transitoRepository.updateTransito(parseInt(id), updatedData);
        if (!updatedTransito) {
            next(res.status(StatusCodes.NOT_FOUND).json({ message: "Transito non trovato" }));
        }
        res.status(StatusCodes.OK).json(updatedTransito);
    } catch (error) {
        next(error);
    }
}

export const deleteTransito = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const deleted = await transitoRepository.deleteTransito(parseInt(id));
        if (!deleted) {
            next(res.status(StatusCodes.NOT_FOUND).json({ message: "Transito non trovato" }));
        }
        res.status(StatusCodes.NO_CONTENT).json({ message: "Transito eliminato con successo" });
    } catch (error) {
        next(error);
    }
}