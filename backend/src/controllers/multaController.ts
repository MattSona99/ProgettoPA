import { Request, Response, NextFunction } from 'express';
import multaRepository from '../repositories/multaRepository';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';
import multaDao from '../dao/multaDao';
import transitoRepository from '../repositories/transitoRepository';
import { generateBollettinoPDFBuffer } from '../utils/bollettino';
import utenteDao from '../dao/utenteDao';

/**
 * Funzione per creare una multa
 */
export const createMulta = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const createdMulta = await multaRepository.create(req.body);
        res.status(StatusCodes.CREATED).json(createdMulta);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione della multa."));
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
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle multe."));
    }
}

/**
 * Funzione per ottenere le multe per le targhe e il periodo specificato.
 */
export const getMulteByTargheEPeriodo = async (req: Request, res: Response, next: NextFunction) => {
    const { targa, dataIn, dataOut } = req.query;
    const utente = (req as any).user;
    const arrayTarga = Array.isArray(targa) ? targa : [targa];
    console.log(arrayTarga, dataIn, dataOut, utente);
    try {
        const multe = await multaRepository.getMulteByTargheEPeriodo(
            arrayTarga as string[],
            dataIn as string,
            dataOut as string,
            utente as { id: number, ruolo: string }
        );
        res.status(StatusCodes.OK).json(multe);
    } catch (error) {
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle multe."));
    }
}

export const downloadBollettinoPDF = async (req: Request, res: Response, next: NextFunction) => {
    const id_utente = (req as any).user.id;
    const { id } = req.params;
    try {
        // Verifico che la multa sia associata all'utente e la recupero
        const multa = await multaDao.getMultaByUtente(parseInt(id), id_utente);

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
        next(HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel download del bollettino."));
    }
}
