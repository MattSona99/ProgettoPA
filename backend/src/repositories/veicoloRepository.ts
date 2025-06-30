import veicoloDao from '../dao/veicoloDao';
import Veicolo from '../models/veicolo';
import { VeicoloAttributes } from '../models/veicolo';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

/**
 * Classe VeicoloRepository che gestisce le operazioni relative ai veicoli.
 */
class VeicoloRepository {

    /**
     * Funzione per ottenere tutti i veicoli.
     * 
     * @returns {Promise<Veicolo[]>} - Una promessa che risolve con un array di veicoli.
     */
    public async getAllVeicoli(): Promise<Veicolo[]> {
        try {
            return await veicoloDao.getAll();
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero dei veicoli.");
        }
    }

    /**
     * Funzione per ottenere un veicolo da una targa.
     * 
     * @param {string} targa - La targa del veicolo da recuperare.
     * @returns {Promise<Veicolo | null>} - Una promessa che risolve con il veicolo trovato o null se non trovato.
     */
    public async getVeicoloById(targa: string): Promise<Veicolo | null> {
        try {
            return await veicoloDao.getById(targa);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero del veicolo.");
        }
    }

    /**
     * Funzione per creare un nuovo veicolo.
     * 
     * @param {VeicoloAttributes} item - L'oggetto parziale del veicolo da creare.
     * @returns {Promise<Veicolo>} - Una promessa che risolve con il nuovo veicolo creato.
     */
    public async createVeicolo(item: VeicoloAttributes): Promise<Veicolo> {
        try {
            return await veicoloDao.create(item);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione del veicolo.");
        }
    }

    /**
     * Funzione per aggiornare un veicolo.
     * 
     * @param {string} targa - La targa del veicolo da aggiornare.
     * @param {VeicoloAttributes} item - L'oggetto parziale del veicolo da aggiornare.
     * @returns {Promise<number>} - Una promessa che risolve con il numero di righe aggiornate.
     */
    public async updateVeicolo(targa: string, item: VeicoloAttributes): Promise<[number, Veicolo[]]> {
        try {
            return await veicoloDao.update(targa, item);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiornamento del veicolo.");
        }
    }

    /**
     * Funzione per eliminare un veicolo.
     * 
     * @param {string} targa - La targa del veicolo da eliminare.
     * @returns {Promise<number>} - Una promessa che risolve con il numero di righe eliminate.
     */
    public async deleteVeicolo(targa: string): Promise<number> {
        try {
            return await veicoloDao.delete(targa);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'eliminazione del veicolo.");
        }
    }
}

export default new VeicoloRepository();





