import { Request, Response, NextFunction } from 'express';
import transitoRepository from '../repositories/transitoRepository';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';
import IsVarco from '../models/isVarco';
import varcoDao from '../dao/varcoDao';

export const getTransitoById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const transito = await transitoRepository.findTransito(parseInt(id));
        if (!transito) {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato."))
        }
        res.status(StatusCodes.OK).json(transito);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero del transito."));
    }
}

export const createTransito = async (req: Request, res: Response, next: NextFunction) => {
    const newTransito = req.body;
    const ruolo = (req as any).user.ruolo;  // Ruolo dell'utente passato nell'header
    const id_utente = (req as any).user.id; // ID dell'utente passato nell'header
    try {
        if (ruolo === 'operatore') { // Operatore forza manualmente l'inserimento del transito
            const createdTransito = await transitoRepository.createTransito(newTransito);
            if (!createdTransito) {
                next(HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Errore nella creazione del transito."));
            }
            res.status(StatusCodes.CREATED).json(createdTransito);
        } else if (ruolo === 'varco') { // Il varco può essere di 2 tipologie: smart o non smart
            const varcoAssociato = await IsVarco.findOne({ where: { id_varco: id_utente } });
            if (!varcoAssociato) { // Non so se è necessario visto che per effettuare una chiamata bisogna essere autenticati e lo si è solo se si è un utente
                return next(HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Accesso negato: il varco non è stato associato correttamente ad un utente."));
            }
            const varco = await varcoDao.getById(varcoAssociato.id_varco);
            if (!varco) {
                return next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco non trovato."));
            }
            if (varco.smart) {
                const createdTransito = await transitoRepository.createTransito(newTransito, varco);
                if (!createdTransito) {
                    next(HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Errore nella creazione del transito."));
                }
                res.status(StatusCodes.CREATED).json(createdTransito);
            }
            const createdTransito = await transitoRepository.createTransito(newTransito, varco);
            if (!createdTransito) {
                next(HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Errore nella creazione del transito."));
            }
            res.status(StatusCodes.CREATED).json(createdTransito);
        }
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione del transito."));
    }
}

export const updateTransito = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updatedData = req.body;
    try {
        const updatedTransito = await transitoRepository.updateTransito(parseInt(id), updatedData);
        if (!updatedTransito) {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato."));
        }
        res.status(StatusCodes.OK).json(updatedTransito);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiornamento del transito."));
    }
}

export const deleteTransito = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const deleted = await transitoRepository.deleteTransito(parseInt(id));
        if (!deleted) {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato."));
        }
        res.status(StatusCodes.NO_CONTENT).json({ message: "Transito eliminato con successo" });
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'eliminazione del transito."));
    }
}