/**
 * Middleware di validazione dei dati inseriti nelle rotte
 */
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req); // Recupero gli errori di validazione

  // Se ci sono errori accumulati allora ritorno l'errore
  if (!errors.isEmpty()) {
    throw new Error(`Errore di validazione: ${errors.array().map(err => err.msg).join(', ')}`);
  }
  next(); // Passaggio dell'errore al middleware successivo
};

export default validateRequest;

