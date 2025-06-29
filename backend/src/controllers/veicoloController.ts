import { Request, Response, NextFunction } from 'express';
import veicoloRepository from '../repositories/veicoloRepository';
import { StatusCodes } from 'http-status-codes';

/**
 * Funzione per ottenere tutti i Veicoli.
 */
export const getAllVeicoli = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const veicoli = await veicoloRepository.getAllVeicoli();
        res.status(StatusCodes.OK).json(veicoli);
    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per ottenere un Veicolo da una targa.
 */
export const getVeicoloById = async (req: Request, res: Response, next: NextFunction) => {
    const targa = req.params.targa;

    try {
        const veicolo = await veicoloRepository.getVeicoloById(targa);
        if (veicolo) {
            res.status(StatusCodes.OK).json(veicolo);
        } else {
            next(res.status(StatusCodes.NOT_FOUND).json({ message: "Veicolo non trovato" }));
        }
    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per creare un nuovo Veicolo.
 */
export const createVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nuovoVeicolo = await veicoloRepository.createVeicolo(req.body);
    } catch (error) {
        next(error);
    }

}

/**
 * Funzione per aggiornare un Veicolo.
 */
export const updateVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    const targa = req.params.targa;

    try {
        const [updated] = await veicoloRepository.updateVeicolo(targa, req.body);
        if (updated) {
            const updatedVeicolo = await veicoloRepository.getVeicoloById(targa);
            res.status(StatusCodes.OK).json(updatedVeicolo);
        } else {
            next(res.status(StatusCodes.NOT_FOUND).json({ message: "Veicolo non trovato" }));
        }
    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per eliminare un Veicolo.
 */
export const deleteVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    const targa = req.params.targa;

    try {
        const deleted = await veicoloRepository.deleteVeicolo(targa);
        if (deleted) {
            res.status(StatusCodes.OK).json({ message: "Veicolo eliminato con successo" });
        } else {
            next(res.status(StatusCodes.NOT_FOUND).json({ message: "Veicolo non trovato" }));
        }
    } catch (error) {
        next(error);
    }
}