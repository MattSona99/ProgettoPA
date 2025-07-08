import { Request, Response, NextFunction } from 'express';
import transitoRepository from '../repositories/transitoRepository';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';
import IsVarco from '../models/isVarco';
import { RuoloUtente } from '../enums/RuoloUtente';
import trattaDao from '../dao/trattaDao';

/**
 * Funzione per ottenere tutti i transiti.
 * 
 * @returns - Una promessa che risolve con un array di transiti.
 */
export const getAllTransiti = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transiti = await transitoRepository.getAllTransiti();

        res.status(StatusCodes.OK).json(transiti);

    } catch (error) {
        next(error);
    }
};

/**
 * Funzione per ottenere un transito da un ID.
 * 
 * @param id - L'ID del transito da recuperare.
 * @returns - Una promessa che risolve con il transito trovato.
 */
export const getTransitoById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const transito = await transitoRepository.getTransitoById(parseInt(id));

        res.status(StatusCodes.OK).json(transito);

    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per creare un nuovo transito.
 * 
 * @returns - Una promessa che risolve con il transito creato.
 */
export const createTransito = async (req: Request, res: Response, next: NextFunction) => {
    const newTransito = req.body;
    const ruolo = (req as any).user.ruolo;  // Ruolo dell'utente passato nell'header
    const id_utente = (req as any).user.id; // ID dell'utente passato nell'header

    try {
        if (ruolo === RuoloUtente.OPERATORE) { // Operatore forza manualmente l'inserimento del transito
            const [createdTransito, createdMulta] = await transitoRepository.createTransito(newTransito);

            if (createdMulta) {
                res.status(StatusCodes.CREATED).json({ transito: createdTransito, multa: createdMulta });
            } else {
                res.status(StatusCodes.CREATED).json(createdTransito);
            }
        } else if (ruolo === RuoloUtente.VARCO) { // Il varco può essere di 2 tipologie: smart o non smart
            // Verifica se l'utente è associato a un varco
            const isVarcoAssociato = await IsVarco.findOne({ where: { id_utente: id_utente } });
            if (!isVarcoAssociato) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Accesso negato: il varco non è stato associato correttamente ad un utente.");
            }

            // Creazione del transito a seconda del tipo di varco
            const [createdTransito, createdMulta] = await transitoRepository.createTransito(newTransito);

            if (createdMulta) {
                res.status(StatusCodes.CREATED).json({ transito: createdTransito, multa: createdMulta });
            }
            else {
                res.status(StatusCodes.CREATED).json(createdTransito);
            }
        } else {
            throw HttpErrorFactory.createError(HttpErrorCodes.Forbidden, "Accesso negato: il ruolo non è autorizzato a creare transiti.");
        }
    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per creare un transito tramite un varco non smart.
 * 
 * @returns - Una promessa che risolve con il transito creato.
*/
export const createTransitoByVarco = async (req: Request, res: Response, next: NextFunction) => {
    // Verifica se il file è stato caricato correttamente
    if (!req.file) {
        return next(HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "File non fornito o non valido."));
    }
    const id_utente = (req as any).user.id;
    const ruolo = (req as any).user.ruolo;
    const data_in = req.body;

    try {
        if (ruolo !== RuoloUtente.VARCO) {
            return next(HttpErrorFactory.createError(HttpErrorCodes.Forbidden, "Accesso negato: l'utente non è autorizzato a creare transiti."));
        }
        const file = req.file as Express.Multer.File;
        // Processamento dell'immagine della targa per ottenere di ritorno la stessa
        // Utilizzo di tesseract.js o un altro OCR per leggere la targa
        const targa = await transitoRepository.processImage(file);
        if (!targa) {
            return next(HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Errore nel processamento dell'immagine della targa."));
        }

        // Verifica se l'utente è associato a un varco
        const isVarcoAssociato = await IsVarco.findOne({ where: { id_utente: id_utente } });
        if (!isVarcoAssociato) {
            return next(HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Accesso negato: il varco non è stato associato correttamente ad un utente."));
        }

        // Verifica se il varco è associato a una tratta
        const tratta = await trattaDao.getTrattaByVarcoOut(isVarcoAssociato.id_varco);
        if (!tratta) {
            return next(HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Tratta non trovata."));
        }

        const newTransito = {
            targa,
            tratta: tratta.id_tratta,
            data_in: data_in.data_in,
            data_out: new Date()
        };

        const [createdTransito, createdMulta ] = await transitoRepository.createTransito(newTransito);

        if (createdMulta) {
            res.status(StatusCodes.CREATED).json({ transito: createdTransito, multa: createdMulta });
        }
        else {
            res.status(StatusCodes.CREATED).json(createdTransito);
        }
    } catch (error) {
        next(error);
    }
}
/**
 * Funzione per aggiornare un transito esistente.
 * 
 * @returns - Una promessa che risolve con il transito aggiornato.
 */
export const updateTransito = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const [row, updatedTransito, newMulta] = await transitoRepository.updateTransito(parseInt(id), updatedData);

        if (newMulta) {
            res.status(StatusCodes.OK).json({ message: `Row modificate: ${row}, Transito con id = ${id} aggiornato con successo.`, transito: updatedTransito, multa: newMulta });
        }
        res.status(StatusCodes.OK).json({ message: `Row modificate: ${row}, Transito con id = ${id} aggiornato con successo.`, transito: updatedTransito });

    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per eliminare un transito.
 * 
 * @param id - L'ID del transito da eliminare.
 * @returns - Una promessa che risolve con un messaggio di conferma dell'eliminazione.
 */
export const deleteTransito = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const [deleted, deletedTransito] = await transitoRepository.deleteTransito(parseInt(id));

        res.status(StatusCodes.OK).json({ message: `Row eliminate: ${deleted}, Transito con id = ${id} eliminato con successo:`, transito: deletedTransito });

    } catch (error) {
        next(error);
    }
}