import tipoVeicoloDao from '../dao/tipoVeicoloDao';
import utenteDao from '../dao/utenteDao';
import veicoloDao from '../dao/veicoloDao';
import Veicolo from '../models/veicolo';
import { IVeicoloAttributes } from '../models/veicolo';
import Database from '../utils/database';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

/**
 * Classe VeicoloRepository che gestisce le operazioni relative ai veicoli.
 */
class VeicoloRepository {

    /**
     * Funzione per ottenere tutti i veicoli.
     * 
     * @returns {Promise<any[]>} - Una promessa che risolve con un array di più Promise.
     */
    public async getAllVeicoli(): Promise<any[]> {
        try {
            const veicoli = await veicoloDao.getAll();
            return await Promise.all(veicoli.map(veicolo => this.enrichVeicolo(veicolo)));
        } catch {
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
            const veicolo = await veicoloDao.getById(targa);
            if (!veicolo) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Veicolo con targa ${targa} non trovato.`);
            }
            return await this.enrichVeicolo(veicolo);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del veicolo con targa ${targa}.`);
        }
    }

    /**
     * Funzione per creare un nuovo veicolo.
     * 
     * @param {IVeicoloAttributes} item - L'oggetto parziale del veicolo da creare.
     * @returns {Promise<Veicolo>} - Una promessa che risolve con il nuovo veicolo creato.
     */
    public async createVeicolo(item: IVeicoloAttributes): Promise<Veicolo> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction()
        try {
            const nuovoVeicolo = await veicoloDao.create(item, { transaction });
            await transaction.commit()
            return nuovoVeicolo;
        } catch (error) {
            await transaction.rollback()
            throw error;
        }
    }

    /**
     * Funzione per aggiornare un veicolo.
     * 
     * @param {string} targa - La targa del veicolo da aggiornare.
     * @param {IVeicoloAttributes} item - L'oggetto parziale del veicolo da aggiornare.
     * @returns {Promise<number>} - Una promessa che risolve con il numero di righe aggiornate.
     */
    public async updateVeicolo(targa: string, item: IVeicoloAttributes): Promise<[number, Veicolo[]]> {
        try {
            return await veicoloDao.update(targa, item);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del veicolo con targa ${targa}.`);
        }
    }

    /**
     * Funzione per eliminare un veicolo.
     * 
     * @param {string} targa - La targa del veicolo da eliminare.
     * @returns {Promise<number>} - Una promessa che risolve con il numero di righe eliminate.
     */
    public async deleteVeicolo(targa: string): Promise<boolean> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const deleted = await veicoloDao.delete(targa);
            if (!deleted) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Veicolo con targa ${targa} non trovato.`);
            }
            await transaction.commit();
            return true;
        } catch {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del veicolo con targa ${targa}.`);
        }
    }

    // HELPER PRIVATI

    /**
     * Funzione di stampa per le informazioni aggiuntive sui veicoli.
     */
    private async enrichVeicolo(veicolo: Veicolo): Promise<any> {
        try {
            const tipo_veicolo = await tipoVeicoloDao.getById(veicolo.tipo_veicolo);
            const utente = await utenteDao.getById(veicolo.utente);
            return {
                ...veicolo.dataValues,
                tipo_veicolo: tipo_veicolo ? tipo_veicolo.dataValues : null,
                utente: utente ? utente.dataValues : null
            };
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero delle informazioni aggiuntive sul veicolo con targa ${veicolo.targa}.`);
        }
    }
}

export default new VeicoloRepository();





