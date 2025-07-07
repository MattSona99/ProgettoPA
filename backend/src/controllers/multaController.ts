import { Request, Response, NextFunction } from 'express';
import multaRepository from '../repositories/multaRepository';
import { StatusCodes } from 'http-status-codes';
import multaDao from '../dao/multaDao';
import transitoRepository from '../repositories/transitoRepository';
import { generateBollettinoPDFBuffer } from '../utils/bollettino';

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
export const getMulteByTargheEPeriodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { targa, dataIn, dataOut } = req.query;
        const utente = (req as any).user;
        const arrayTarga = Array.isArray(targa) ? targa : [targa];

        const multe = await multaRepository.getMulteByTargheEPeriodo(
            arrayTarga as string[],
            dataIn as string,
            dataOut as string,
            utente as { id: number, ruolo: string }
        );
        res.status(StatusCodes.OK).json(multe);
    } catch (error) {
        next(error);
    }
}

export const downloadBollettinoPDF = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id_utente = (req as any).user.id;
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
}
