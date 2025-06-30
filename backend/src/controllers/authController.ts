import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import utenteDao from "../dao/utenteDao";
import { generateToken } from "../utils/jwt";

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;
    // Controlla se l'email è presente nel corpo della richiesta
    if (!email) {
        throw new Error("Email non fornita");
    }
    try {
        const user = await utenteDao.getByEmail(email);
        if (!user) {
            throw new Error("Utente non trovato");
        }
        // genera un token JWT
        const token = generateToken({ id: user.id_utente, ruolo: user.ruolo });
        res.status(StatusCodes.OK).json({ token });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Errore durante il login" });
    }
}