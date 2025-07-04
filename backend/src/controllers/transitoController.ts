import { Request, Response, NextFunction } from 'express';
import transitoRepository from '../repositories/transitoRepository';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';
import IsVarco from '../models/isVarco';
import varcoRepository from '../repositories/varcoRepository';
import Multa from '../models/multa';
import { RuoloUtente } from '../enums/RuoloUtente';

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
        if (typeof error === 'object' && error !== null && 'statusCode' in error && 'message' in error) {
            const status = (error as { statusCode: number }).statusCode;
            res.status(status).json({ error: error.message });
        } else {


            next(error);
        }
    }
};

/**
 * Funzione per ottenere un transito da un ID.
 * 
 * @param id - L'ID del transito da recuperare.
 * @returns - Una promessa che risolve con il transito trovato.
 */
export const getTransitoById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const transito = await transitoRepository.getTransitoById(parseInt(id));
        if (!transito) {
            next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato."))
        }
        res.status(StatusCodes.OK).json(transito);
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'statusCode' in error && 'message' in error) {
            const status = (error as { statusCode: number }).statusCode;
            res.status(status).json({ error: error.message });
        } else {
            next(error);
        }
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
            const { transito: createdTransito, multa: createdMulta } = await transitoRepository.createTransito(newTransito);

            if (createdMulta) {
                res.status(StatusCodes.CREATED).json({ transito: createdTransito, multa: createdMulta });
            } else {
                res.status(StatusCodes.CREATED).json(createdTransito);
            }
        } else if (ruolo === RuoloUtente.VARCO) { // Il varco può essere di 2 tipologie: smart o non smart
            // Verifica se l'utente è associato a un varco
            const isVarcoAssociato = await IsVarco.findOne({ where: { id_varco: id_utente } });
            if (!isVarcoAssociato) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Accesso negato: il varco non è stato associato correttamente ad un utente.");
            }
            // Recupera il varco associato all'utente
            const varco = await varcoRepository.getVarcoById(isVarcoAssociato.id_varco);

            // Creazione del transito a seconda del tipo di varco
            const { transito: createdTransito, multa: createdMulta } = await transitoRepository.createTransito(newTransito, varco);

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
        if (typeof error === 'object' && error !== null && 'statusCode' in error && 'message' in error) {
            const status = (error as { statusCode: number }).statusCode;
            res.status(status).json({ error: error.message });
        } else {
            next(error);
        }
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
    try {
        const file = req.file as Express.Multer.File;
        // Processamento dell'immagine della targa per ottenere di ritorno la stessa
        // Utilizzo di tesseract.js o un altro OCR per leggere la targa
        const targa = await transitoRepository.processImage(file);

        // DA COMPLETARE CON L'AGGIUNTA DEL TRANSITO
        res.status(StatusCodes.OK).json({ targa });
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'statusCode' in error && 'message' in error) {
            const status = (error as { statusCode: number }).statusCode;
            res.status(status).json({ error: error.message });
        } else {
            next(error);
        }
    }
}
/**
 * Funzione per aggiornare un transito esistente.
 * 
 * @returns - Una promessa che risolve con il transito aggiornato.
 */
export const updateTransito = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updatedData = req.body;
    try {
        const [row, updatedTransito] = await transitoRepository.updateTransito(parseInt(id), updatedData);
        res.status(StatusCodes.OK).json({ message: `Row modificate: ${row}, Transito con id = ${id} aggiornato con successo.`, transito: updatedTransito });
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'statusCode' in error && 'message' in error) {
            const status = (error as { statusCode: number }).statusCode;
            res.status(status).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

/**
 * Funzione per eliminare un transito.
 * 
 * @param id - L'ID del transito da eliminare.
 * @returns - Una promessa che risolve con un messaggio di conferma dell'eliminazione.
 */
export const deleteTransito = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const existingMulta = await Multa.findOne({ where: { transito: id } });
        if (existingMulta) {
            next(HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Impossibile eliminare un transito con una multa associata."));
        }
        const [deleted, deletedTransito] = await transitoRepository.deleteTransito(parseInt(id));
        res.status(StatusCodes.OK).json({ message: `Row eliminate: ${deleted}, Transito con id = ${id} eliminato con successo:`, transito: deletedTransito });
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'statusCode' in error && 'message' in error) {
            const status = (error as { statusCode: number }).statusCode;
            res.status(status).json({ error: error.message });
        } else {
            next(error);
        }
    }
}