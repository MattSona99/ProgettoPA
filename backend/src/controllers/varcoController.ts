import { Request, Response, NextFunction } from 'express';
import varcoRepository from '../repositories/varcoRepository';
import { StatusCodes } from 'http-status-codes';

export const getVarcoById = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    try {
        const varco = await varcoRepository.findVarco(parseInt(id));
        if (!varco) {
            next(res.status(StatusCodes.NOT_FOUND).json({ message: "Varco non trovato" }));
        }
        res.status(StatusCodes.OK).json(varco);
    } catch (error) {
        next(error);
    }
}

export const createVarco = async (req: Request, res: Response, next: NextFunction) => {
    const newVarco = req.body;
    try {
        const createdVarco = await varcoRepository.createVarco(newVarco);
        if (!createdVarco) {
            next(res.status(StatusCodes.BAD_REQUEST).json({ message: "Errore nella creazione del varco" }));
        }
        res.status(StatusCodes.CREATED).json(createdVarco);
    } catch (error) {
        next(error);
    }
}

export const updateVarco = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const updatedData = req.body;
    try {
        const updatedVarco = await varcoRepository.updateVarco(parseInt(id), updatedData);
        if (!updatedVarco) {
            next(res.status(StatusCodes.NOT_FOUND).json({ message: "Varco non trovato" }));
        }
        res.status(StatusCodes.OK).json(updatedVarco);
    } catch (error) {
        next(error);
    }
}

export const deleteVarco = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    try {
        const deleted = await varcoRepository.deleteVarco(parseInt(id));
        if (!deleted) {
            next(res.status(StatusCodes.NOT_FOUND).json({ message: "Varco non trovato" }));
        }
        res.status(StatusCodes.NO_CONTENT).json({ message: "Varco eliminato con successo" });
    } catch (error) {
        next(error);
    }
}