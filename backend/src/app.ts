/**
 * Configurazione e logica dell’applicazione Express
 */
import express from 'express';
import dotenv from 'dotenv';


// Caricamento delle variabili d'ambiente (.env)
dotenv.config();

const app = express();

// Middleware per la gestione delle richieste JSON
app.use(express.json());

// Middleware per la gestione di rotte non esistenti
app.use((req, res) => {
    // DA CAMBIARE
    res.status(404).json({ error: 'Rotta non trovata.' });
});

export default app;