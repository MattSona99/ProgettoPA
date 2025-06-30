import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
// Caricamento della variabile d'ambiente JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("La variabile d'ambiente JWT_SECRET non è definita");
}

// Funzione per generare un token JWT
// Il payload deve contenere almeno l'id dell'utente e il ruolo 
export const generateToken = (payload: JwtPayload): string => {
    try {
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        return token;
    } catch (error: any) {
        throw new Error("Errore nella generazione del token JWT: " + error.message);
    }
}

// Funzione per verificare un token JWT
// Se il token è valido, restituisce il payload decodificato
export const verifyToken = (token: string): JwtPayload => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded as JwtPayload;
    } catch (error: any) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error("Token JWT non valido: " + error.message);
        }
        else if (error instanceof jwt.TokenExpiredError) {
            throw new Error("Token JWT scaduto: " + error.message);
        } else {
            throw new Error("Errore nella verifica del token JWT: " + error.message);
        }
    }
}