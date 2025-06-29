import e, { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { StatusCodes } from 'http-status-codes';
import { verifyToken } from '../utils/jwt';

dotenv.config(); // Caricamento delle variabili d'ambiente dal file .env

const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * Middleware per la verifica e decodifica del token JWT
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Controllo se il token è presente nell'intestazione della richiesta
        const token = req.header('Authorization')?.replace('Bearer ', ''); // Estrazione del token dall'intestazione della richiesta
        if (!token) {
            throw new Error('Token mancante o malformato.');
        }
        const payload = verifyToken(token); // Verifica e decodifica del token
        if (!payload) {
            throw new Error('Token non valido o scaduto.');
        }

        (req as any).user = payload; // Aggiunta del payload alla richiesta
        next();
    } catch (error) {
        next(error)
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
                throw new Error('Utente non autenticato.');
            }
            // Verifica del ruolo dell'utente
            if (!roles.includes(user.ruolo)) {
                throw new Error('Utente non autorizzato.');
            }
            next();
        } catch (error) {
            next(error);
        }
    }
};
export default { authMiddleware, authorize };