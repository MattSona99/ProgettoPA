import { Request, Response, NextFunction } from 'express';
import { varcoRepository } from '../repositories/varcoRepository';

export const getVarcoById = async(req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const varco = await varcoRepository.findVarco(parseInt(id));
    if (!varco) {
        return res.status(404).json({ message: "Varco non trovato" });
    }
    return res.status(200).json(varco);
}