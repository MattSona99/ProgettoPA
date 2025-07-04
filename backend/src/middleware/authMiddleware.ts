import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { verifyToken } from '../utils/jwt';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';
dotenv.config(); // Caricamento delle variabili d'ambiente dal file .env

/**
 * Middleware per la verifica e decodifica del token JWT
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Controllo se il token è presente nell'intestazione della richiesta
        const token = req.header('Authorization')?.replace('Bearer ', ''); // Estrazione del token dall'intestazione della richiesta
        if (!token) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InvalidToken, 'Token mancante.');
        }
        const payload = verifyToken(token); // Verifica e decodifica del token
        if (!payload) {
            throw HttpErrorFactory.createError(HttpErrorCodes.TokenExpiredError, 'Token scaduto.');
        }

        (req as any).user = payload; // Aggiunta del payload alla richiesta
        next();
    } catch (error) {
        next(error);
    }
}

/**
 * Verifica dell'autorizzazione in base al ruolo dell'utente
 */
export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Recupero dell'utente dalla richiesta
            const user = (req as any).user;
            if (!user) {
                throw HttpErrorFactory.createError(HttpErrorCodes.Forbidden, 'Utente non autenticato.');
            }
            // Verifica del ruolo dell'utente
            if (!roles.includes(user.ruolo)) {
                throw HttpErrorFactory.createError(HttpErrorCodes.Unauthorized, 'Utente non autorizzato.');
            }
            next();
        } catch (error) {
            next(error);
        }
    }
};
export default { authMiddleware, authorize };