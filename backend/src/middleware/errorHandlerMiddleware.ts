import { Request, Response } from 'express';
import { HttpError, HttpErrorCodes, HttpErrorFactory } from '../utils/errorHandler';

/**
 * Middleware per la gestione degli errori personalizzati e generici.
 */
export const errorHandler = (err: any, req: Request, res: Response) => {
    let finalError: HttpError;

    if (err && err.statusCode && err.code && err.message) {
        // Errore già strutturato come HttpError
        finalError = err;
    } else {
        // Errore generico, lo trasformiamo in HttpError
        finalError = HttpErrorFactory.createError(
            HttpErrorCodes.InternalServerError,
            err?.message || 'Internal Server Error'
        );
    }

    res.status(finalError.statusCode).json({
        error: {
            statusCode: finalError.statusCode,
            code: finalError.code,
            message: finalError.message
        }
    });
};