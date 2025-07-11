import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import utenteDao from "../dao/utenteDao";
import { generateToken } from "../utils/jwt";
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';
import bcrypt from 'bcrypt';

/**
 * Funzione per effettuare il login dell'utente.
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = req.body;
    // Controlla se l'email è presente nel corpo della richiesta
    if (!email) {
        next(HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Email mancante."));
    }
    // Controlla se la password è presente nel corpo della richiesta
    if (!password) {
        next(HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Password mancante."));
    }
    try {
        const user = await utenteDao.getByEmail(email);
        if (!user) {
            throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Utente con email ${email} non trovato.`);
        }

        // Verifica della password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw HttpErrorFactory.createError(HttpErrorCodes.Unauthorized, 'Password non corretta.');
        }

        // Genera un token JWT
        const token = generateToken({ id: user.id_utente, ruolo: user.ruolo });
        res.status(StatusCodes.OK).json({ token });
    } catch (error) {
        next(error);
    }
}