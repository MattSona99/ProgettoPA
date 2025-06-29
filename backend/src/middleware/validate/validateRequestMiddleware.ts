/**
 * Middleware di validazione dei dati inseriti nelle rotte
 */
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req); // Recupero gli errori di validazione

  // Se ci sono errori accumulati allora ritorno l'errore
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    next(new Error('Errore di validazione: ' + JSON.stringify(errors.array()))); // Passo l'errore al middleware di gestione degli errori
  }
  next(); // Passaggio dell'errore al middleware successivo
};

export default validateRequest;

