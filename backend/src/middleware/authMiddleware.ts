import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Caricamento delle variabili d'ambiente dal file .env

const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * Middleware per la verifica e decodifica del token JWT
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Controllo se il token è presente nell'intestazione della richiesta
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Estrazione del token dall'intestazione della richiesta
    if (!token) {
        res.status(401).json({ message: "Token mancante o malformato" });
        return;
    }
    // Decodifica e verifica il token
    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (!payload || typeof payload !== 'object' || !payload.id_utente) {
            res.status(401).json({ message: "Token non valido" });
            return;
        }
        (req as any).user = payload; // Aggiunta del payload alla richiesta
        next();
    } catch {
        res.status(401).json({ message: "Token non valido o scaduto" });
        return;
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
        } catch {
            throw new Error('Utente non autorizzato.');
        }
    }
};
export default { authMiddleware, authorize };