/*
  Gestione dell'avvio del server e connessione al database
 */

import app from './app';
import { initModels } from './models';

const BACKEND_PORT = process.env.BACKEND_PORT || 3000;

// Avvio del server
const startServer = async () => {
    try {
        // Sincronizzazione dei modelli con il database
        await initModels();
        console.log('Database sincronizzato con successo.');

        // Avvio del server
        app.listen(BACKEND_PORT, () => {
            console.log(`Server in ascolto sulla porta ${BACKEND_PORT}`);
        });
    } catch (error) {
        console.error('Errore durante l\'avvio del server:', error);
    }
};

// Avvio del server
startServer();
