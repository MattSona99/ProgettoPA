/**
 * Configurazione e logica dell’applicazione Express
 */
import express from 'express';
import dotenv from 'dotenv';
import varcoRoutes from './routes/varcoRoutes';
import tipoVeicoloRoutes from './routes/tipoVeicoloRoutes';
import veicoloRoutes from './routes/veicoloRoutes';
import trattaRoutes from './routes/trattaRoutes';
import transitoRoutes from './routes/transitoRoutes';
import authRoutes from './routes/authRoutes';
import multaRoutes from './routes/multaRoutes';
import { HttpErrorCodes, HttpErrorFactory } from './utils/errorHandler';
import { errorHandler } from './middleware/errorHandlerMiddleware';

// Caricamento delle variabili d'ambiente (.env)
dotenv.config();

const app = express();

// Middleware per la gestione delle richieste JSON
app.use(express.json());

app.use('/', authRoutes);
app.use('/', varcoRoutes);
app.use('/', tipoVeicoloRoutes);
app.use('/', veicoloRoutes)
app.use('/', trattaRoutes);
app.use('/', transitoRoutes );
app.use('/', multaRoutes);
// Middleware per la gestione di rotte non esistenti
app.use((req, res, next) => {
    next(HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Rotta non trovata."));
});

app.use(errorHandler);

export default app;