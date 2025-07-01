import trattaDao from "../dao/trattaDao";
import varcoDao from "../dao/varcoDao";
import Tratta from "../models/tratta";
import { TrattaAttributes } from "../models/tratta";
import Database from "../utils/database";
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
            const tratte = await trattaDao.getAll();
            return await Promise.all(tratte.map(tratta => this.enrichTratta(tratta)));
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
            const tratta = await trattaDao.getById(id);
            if (!tratta) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tratta con ID ${id} non trovata.`);
            }
            return await this.enrichTratta(tratta);
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
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const nuovaTratta = await trattaDao.create(item, { transaction });
            await transaction.commit();
            return nuovaTratta;
        } catch (error) {
            await transaction.rollback();
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
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell\'aggiornamento della tratta con ID ${id}.`);
        }
    }

    /**
     * Funzione per eliminare una tratta.
     * 
     * @param {number} id - L'ID della tratta da eliminare.
     * @returns {Promise<number>} Una promessa che risolve con il numero di righe eliminate.
     */
    public async deleteTratta(id: number): Promise<number> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const deleted = await trattaDao.delete(id, { transaction });
            await transaction.commit();
            return deleted;
        } catch (error) {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell\'eliminazione della tratta con ID ${id}.`);
        }
    }

    // HELPER PRIVATI

    /**
     * Funzione di stampa per le informazioni aggiuntive sulle tratte.
     */
    private async enrichTratta(tratta: Tratta): Promise<any> {
        try {
            const varco_in = await varcoDao.getById(tratta.varco_in);
            const varco_out = await varcoDao.getById(tratta.varco_out);
            return {
                ...tratta.dataValues,
                varco_in: varco_in ? varco_in.dataValues : null,
                varco_out: varco_out ? varco_out.dataValues : null
            }
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle tratte.");
        }
    }
}

export default new TrattaRepository();