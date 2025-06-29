/**
 * Configurazione e logica dell’applicazione Express
 */
import express from 'express';
import dotenv from 'dotenv';
import varcoRoutes from './routes/varcoRoutes';
import tipoVeicoloRoutes from './routes/tipoVeicoloRoutes';
import veicoloRoutes from './routes/veicoloRoutes';

// Caricamento delle variabili d'ambiente (.env)
dotenv.config();

const app = express();

// Middleware per la gestione delle richieste JSON
app.use(express.json());

app.use('/', varcoRoutes);
app.use('/', tipoVeicoloRoutes);
app.use('/', veicoloRoutes)

// Middleware per la gestione di rotte non esistenti
app.use((req, res) => {
    // DA CAMBIARE
    res.status(404).json({ error: 'Rotta non trovata.' });
});

export default app;