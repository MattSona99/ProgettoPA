import trattaDao from "../dao/trattaDao";
import Tratta from "../models/tratta";
import { TrattaAttributes } from "../models/tratta";
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

/**
 * Classe TrattaRepository che gestisce le operazioni relative alle tratte.
 */
class TrattaRepository {
    /**
     * Funzione per ottenere tutte le tratte.
     * 
     * @returns {Promise<Tratta[]>} Una promessa che risolve con un array di tratte.
     */
    public async getAllTratte(): Promise<Tratta[]> {
        try {
            return await trattaDao.getAll();
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle tratte.");
        }
    }

    /**
     * Funzione per ottenere una tratta da un ID.
     * 
     * @param {number} id - L'ID della tratta da recuperare.
     * @returns {Promise<Tratta | null>} Una promessa che risolve con la tratta trovata o null se non trovata.
     */
    public async getTrattaById(id: number): Promise<Tratta | null> {
        try {
            return await trattaDao.getById(id);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero della tratta con ID ${id}.`);
        }
    }

    /**
     * Funzione per creare una nuova tratta.
     * 
     * @param {TrattaAttributes} item - L'oggetto parziale della tratta da creare.
     * @returns {Promise<Tratta>} Una promessa che risolve con la nuova tratta creata.
     */
    public async createTratta(item: TrattaAttributes): Promise<Tratta> {
        try {
            return await trattaDao.create(item);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione della tratta con ID ${item.id_tratta}.`);
        }
    }

    /**
     * Funzione per aggiornare una tratta.
     * 
     * @param {number} id - L'ID della tratta da aggiornare.
     * @param {TrattaAttributes} item - L'oggetto parziale della tratta da aggiornare.
     * @returns {Promise<number>} Una promessa che risolve con il numero di righe aggiornate.
     */
    public async updateTratta(id: number, item: TrattaAttributes): Promise<[number, Tratta[]]> {
        try {
            return await trattaDao.update(id, item);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento della tratta con ID ${id}.`);
        }
    }

    /**
     * Funzione per eliminare una tratta.
     * 
     * @param {number} id - L'ID della tratta da eliminare.
     * @returns {Promise<number>} Una promessa che risolve con il numero di righe eliminate.
     */
    public async deleteTratta(id: number): Promise<number> {
        try {
            return await trattaDao.delete(id);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione della tratta con ID ${id}.`);
        }
    }
}

export default new TrattaRepository();