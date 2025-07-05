import { Request, Response } from 'express';
import { HttpError, HttpErrorCodes, HttpErrorFactory } from '../utils/errorHandler';

/**
 * Middleware per la gestione degli errori personalizzati con struttura JSON.
 */
export const errorHandler = (err: HttpError, req: Request, res: Response) => {
    const statusCode = err.statusCode || HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, 'Internal Server Error').statusCode;
    const code = err.code || HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, 'Internal Server Error').code;
    const message = err.message || HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, 'Internal Server Error').message;
    res.status(statusCode).json({ error: { statusCode, code, message } });
}