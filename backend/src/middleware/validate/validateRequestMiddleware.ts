import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { HttpErrorFactory, HttpErrorCodes } from '../../utils/errorHandler';

/**
 * Middleware di validazione dei dati inseriti nelle rotte
 */

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req); // Recupero gli errori di validazione

  // Se ci sono errori accumulati allora ritorno l'errore
  if (!errors.isEmpty()) {
    throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, errors.array()[0].msg);
  }
  next(); // Passaggio dell'errore al middleware successivo
};

export default validateRequest;

