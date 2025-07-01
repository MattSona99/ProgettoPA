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
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero dei veicoli."));
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
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Veicolo non trovato."))
        }
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero del veicolo."));
    }
}

/**
 * Funzione per creare un nuovo Veicolo.
 */
export const createVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    const { targa } = req.body;

    // Validazione del formato della targa
    if (!validateTarga(targa)) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InvalidID, "Formato targa non valido."));
    }

    try {
        const nuovoVeicolo = await veicoloRepository.createVeicolo(req.body);
        res.status(StatusCodes.CREATED).json(nuovoVeicolo);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione del veicolo."));
    }

}

/**
 * Funzione per aggiornare un Veicolo.
 */
export const updateVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    const { targa } = req.params;

    // Validazione del formato della targa
    if (!validateTarga(targa)) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InvalidID, "Formato targa non valido."));
    }

    try {
        const [updated] = await veicoloRepository.updateVeicolo(targa, req.body);
        if (updated) {
            const updatedVeicolo = await veicoloRepository.getVeicoloById(targa);
            res.status(StatusCodes.OK).json(updatedVeicolo);
        } else {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Veicolo non trovato."));
        }
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell\'aggiornamento del veicolo."));
    }
}

/**
 * Funzione per eliminare un Veicolo.
 */
export const deleteVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    const { targa } = req.params;

    // Validazione del formato della targa
    if (!validateTarga(targa)) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InvalidID, "Formato targa non valido."));
    }

    try {
        const deleted = await veicoloRepository.deleteVeicolo(targa);
        if (deleted) {
            res.status(StatusCodes.OK).json({ message: "Veicolo eliminato con successo" });
        } else {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Veicolo non trovato."));
        }
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell\'eliminazione del veicolo."));
    }
}