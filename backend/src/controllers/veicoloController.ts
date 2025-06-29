import { Request, Response, NextFunction } from 'express';
import veicoloDao from '../dao/veicoloDao';
import { StatusCodes } from 'http-status-codes';

// Funzione di utilità per validare il formato della targa
export const isValidTarga = (targa: string): boolean => {
    const targaRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
    return targaRegex.test(targa);
};

/**
 * Funzione per ottenere tutti i tipi i Veicoli.
 */
export const getAllVeicoli = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const veicoli = await veicoloDao.getAll();
        res.status(StatusCodes.OK).json(veicoli);
    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per ottenere un Veicolo da una targa.
 */
export const getVeicoloById = async (req: Request, res: Response, next: NextFunction) => {
    const { targa } = req.params;

    // Validazione del formato della targa
    if (!isValidTarga(targa)) {
        return next(res.status(StatusCodes.BAD_REQUEST).json({ message: "Formato della targa non valido." }));
    }

    try {
        const veicolo = await veicoloDao.getById(targa);
        if (!veicolo) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "Veicolo non trovato." });
        } else {
            next(res.status(StatusCodes.OK).json(veicolo));
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per creare un nuovo Veicolo.
 */
export const createVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    const { targa } = req.body;

    // Validazione del formato della targa
    if (!isValidTarga(targa)) {
        return next(res.status(StatusCodes.BAD_REQUEST).json({ message: "Formato della targa non valido." }));
    }

    try {
        const nuovoVeicolo = await veicoloDao.create(req.body);
        res.status(StatusCodes.CREATED).json(nuovoVeicolo);
    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per aggiornare un Veicolo esistente.
 */
export const updateVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    const { targa } = req.params;

    // Validazione del formato della targa
    if (!isValidTarga(targa)) {
        return next(res.status(StatusCodes.BAD_REQUEST).json({ message: "Formato della targa non valido." }));
    }

    try {
        const [updated] = await veicoloDao.update(targa, req.body);
        if (updated) {
            const updatedVeicolo = await veicoloDao.getById(targa);
            res.status(StatusCodes.OK).json(updatedVeicolo);
        } else {
            next(res.status(StatusCodes.NOT_FOUND).json({ message: "Veicolo non trovato." }));
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per eliminare un Veicolo.
 */
export const deleteVeicolo = async (req: Request, res: Response, next: NextFunction) => {
    const { targa } = req.params;

    // Validazione del formato della targa
    if (!isValidTarga(targa)) {
        return next(res.status(StatusCodes.BAD_REQUEST).json({ message: "Formato della targa non valido." }));
    }

    try {
        const deleted = await veicoloDao.delete(targa);
        if (deleted) {
            res.status(StatusCodes.OK).json({ message: "Veicolo eliminato." });
        } else {
            next(res.status(StatusCodes.NOT_FOUND).json({ message: "Veicolo non trovato." }));
        }
    } catch (error) {
        next(error);
    }
};