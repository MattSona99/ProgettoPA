import jwt, { JwtPayload } from "jsonwebtoken";
import { HttpErrorCodes, HttpErrorFactory } from "./errorHandler";

// Caricamento della variabile d'ambiente JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
if (!JWT_SECRET) {
    throw new Error("La variabile d'ambiente JWT_SECRET non è definita");
}

// Funzione per generare un token JWT
// Il payload deve contenere almeno l'id dell'utente e il ruolo 
export const generateToken = (payload: JwtPayload): string => {
    try {
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        return token;
    } catch {
        throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella generazione del token JWT: ");
    }
}

// Funzione per verificare un token JWT
// Se il token è valido, restituisce il payload decodificato
export const verifyToken = (token: string): JwtPayload => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded as JwtPayload;
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InvalidToken, "Token JWT non valido: ");
        }
        else if (error instanceof jwt.TokenExpiredError) {
            throw HttpErrorFactory.createError(HttpErrorCodes.TokenExpiredError, "Token JWT scaduto: ");
        } else {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella verifica del token JWT: ");
        }
    }
}