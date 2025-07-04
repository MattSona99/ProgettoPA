import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import utenteDao from "../dao/utenteDao";
import { generateToken } from "../utils/jwt";
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

/**
 * Funzione per effettuare il login dell'utente.
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;
    // Controlla se l'email è presente nel corpo della richiesta
    if (!email) {
        next(HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Email mancante."));
    }
    try {
        const user = await utenteDao.getByEmail(email);
        if (!user) {
            throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Utente con email ${email} non trovato.`);
        }
        // genera un token JWT
        const token = generateToken({ id: user.id_utente, ruolo: user.ruolo });
        res.status(StatusCodes.OK).json({ token });
    } catch (error) {
        next(error);
    }
}