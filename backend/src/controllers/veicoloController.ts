import { Request, Response, NextFunction } from 'express';
import veicoloRepository from '../repositories/veicoloRepository';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

// Funzione di Regex per la validazione del formato della targa
export const validateTarga = (targa: string): boolean => {
    const regex = /^[A-Z]{2}\d{3}[A-Z]{2}$/;
    return regex.test(targa);
}

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
    try {
        const targa = req.params.targa;

        const veicolo = await veicoloRepository.getVeicoloById(targa);

        res.status(StatusCodes.OK).json(veicolo);

    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per creare un nuovo Veicolo.
 */
export const createVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { targa } = req.body;

        // Validazione del formato della targa
        if (!validateTarga(targa)) {
            next(HttpErrorFactory.createError(HttpErrorCodes.InvalidID, "Formato targa non valido."));
        }

        const nuovoVeicolo = await veicoloRepository.createVeicolo(req.body);

        res.status(StatusCodes.CREATED).json(nuovoVeicolo);

    } catch (error) {
        next(error);
    }

}

/**
 * Funzione per aggiornare un Veicolo.
 */
export const updateVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const targa = req.params.targa;

        // Validazione del formato della targa
        if (!validateTarga(targa)) {
            next(HttpErrorFactory.createError(HttpErrorCodes.InvalidID, "Formato targa non valido."));
        }

        const [rows, updatedVeicolo] = await veicoloRepository.updateVeicolo(targa, req.body);

        res.status(StatusCodes.OK).json({ message: `Row modificate: ${rows}, Veicolo con targa = ${targa} aggiornato con successo.`, veicolo: updatedVeicolo });

    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per eliminare un Veicolo.
 */
export const deleteVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { targa } = req.params;

        // Validazione del formato della targa
        if (!validateTarga(targa)) {
            next(HttpErrorFactory.createError(HttpErrorCodes.InvalidID, "Formato targa non valido."));
        }

        const [rows, deletedVeicolo] = await veicoloRepository.deleteVeicolo(targa);
       
        res.status(StatusCodes.OK).json({ message: `Row eliminate: ${rows}, Veicolo con targa = ${targa} eliminato con successo.`, veicolo: deletedVeicolo });
        
    } catch (error) {
        next(error);
    }
}