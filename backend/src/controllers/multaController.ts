import { Request, Response, NextFunction } from 'express';
import multaRepository from '../repositories/multaRepository';
import { StatusCodes } from 'http-status-codes';
import multaDao from '../dao/multaDao';
import transitoRepository from '../repositories/transitoRepository';
import { generateBollettinoPDFBuffer } from '../utils/bollettino';
import { Formato } from '../enums/Formato';
import { RequestWithUser } from '../middleware/authMiddleware';

/**
 * Funzione per creare una multa
 */
export const createMulta = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const createdMulta = await multaRepository.create(req.body);
        res.status(StatusCodes.CREATED).json(createdMulta);
    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per ottenere tutte le multe
 */
export const getAllMulte = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const multe = await multaDao.getAll();
        res.status(StatusCodes.OK).json(multe);
    } catch (error) {
        next(error);
    }
}

/**
 * Funzione per ottenere le multe per le targhe e il periodo specificato.
 */
export const getMulteByTargheEPeriodo = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const { targa, dataIn, dataOut, formato } = req.query;
        const utente = req.user;
        const arrayTarga = Array.isArray(targa) ? targa : [targa];

        const multe = await multaRepository.getMulteByTargheEPeriodo(
            arrayTarga as string[],
            dataIn as string,
            dataOut as string,
            utente
        );
        switch (formato) {
            case Formato.JSON:
                res.status(StatusCodes.OK).json(multe);
                break;
            case Formato.CSV:
                res.status(StatusCodes.NOT_IMPLEMENTED).json({ message: "Formato CSV non implementato." });
                break;
            case Formato.PDF:
                res.status(StatusCodes.NOT_IMPLEMENTED).json({ message: "Formato PDF non implementato." });
                break;
            default:
                res.status(StatusCodes.OK).json(multe);
        }
    } catch (error) {
        next(error);
    }
}

export const downloadBollettinoPDF = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const id_utente = req.user.id;
        const { id } = req.params;
        
        // Verifico che la multa sia associata all'utente e la recupero
        const multa = await multaRepository.getMultaByUtente(parseInt(id), id_utente);

        // Recupero il transito per ottenere la targa
        const transito = await transitoRepository.getTransitoById(multa!.transito);

        // Genero il PDF
        const pdfBuffer = await generateBollettinoPDFBuffer(multa!, transito!.targa);

        res
            .status(StatusCodes.OK)
            .header("Content-Type", "application/pdf")
            .header("Content-Disposition", `attachment; filename="bollettino_${multa!.id_multa}.pdf"`)
            .send(pdfBuffer);
    }
    catch (error) {
        next(error);
    }
};

/**
 * Funzione per eliminare una multa
 * 
 * @param id - L'ID della multa da eliminare
 * @returns - Una promessa che risolve con un messaggio di conferma dell'eliminazione
 */
export const deleteMulta = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const [rows, deletedMulta] = await multaRepository.deleteMulta(parseInt(id));

        res.status(StatusCodes.OK).json({ message: `Row eliminate: ${rows}, Multa con id = ${id} eliminata con successo:`, multa: deletedMulta });
    } catch (error) {
        next(error);
    }
}
