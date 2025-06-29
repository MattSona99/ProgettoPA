import { Request, Response, NextFunction } from 'express';
import varcoRepository from '../repositories/varcoRepository';

export const getVarcoById = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const varco = await varcoRepository.findVarco(parseInt(id));
    if (!varco) {
        res.status(404).json({ message: "Varco non trovato" });
    }
    res.status(200).json(varco);
}

export const createVarco = async (req: Request, res: Response, next: NextFunction) => {
    const newVarco = req.body;
    try {
        const createdVarco = await varcoRepository.createVarco(newVarco);
        if (!createdVarco) {
            res.status(400).json({ message: "Errore nella creazione del varco" });
        }
        res.status(201).json(createdVarco);
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
            res.status(404).json({ message: "Varco non trovato" });
        }
        res.status(200).json(updatedVarco);
    } catch (error) {
        next(error);
    }
}

export const deleteVarco = async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    try {
        const deleted = await varcoRepository.deleteVarco(parseInt(id));
        if (!deleted) {
            res.status(404).json({ message: "Varco non trovato" });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}