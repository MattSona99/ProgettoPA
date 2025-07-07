import tipoVeicoloDao from '../dao/tipoVeicoloDao';
import transitoDao from '../dao/transitoDao';
import utenteDao from '../dao/utenteDao';
import veicoloDao from '../dao/veicoloDao';
import Veicolo from '../models/veicolo';
import { IVeicoloAttributes } from '../models/veicolo';
import Database from '../utils/database';
import { HttpErrorFactory, HttpErrorCodes, HttpError } from '../utils/errorHandler';

/**
 * Classe VeicoloRepository che gestisce le operazioni relative ai veicoli.
 */
class VeicoloRepository {

    /**
     * Funzione per ottenere tutti i veicoli.
     * 
     * @returns - Una promessa che risolve con un array di più Promise.
     */
    public async getAllVeicoli() {
        const veicoli = await veicoloDao.getAll();

        return await Promise.all(veicoli.map(veicolo => this.enrichVeicolo(veicolo)));
    }

    /**
     * Funzione per ottenere un veicolo da una targa.
     * 
     * @param {string} targa - La targa del veicolo da recuperare.
     * @returns - Una promessa che risolve con il veicolo trovato o null se non trovato.
     */
    public async getVeicoloById(targa: string) {
        const veicolo = await veicoloDao.getById(targa);

        return await this.enrichVeicolo(veicolo);
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
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiunta del veicolo.");
            }
        }
    }

    /**
     * Funzione per aggiornare un veicolo.
     * 
     * @param {string} targa - La targa del veicolo da aggiornare.
     * @param {IVeicoloAttributes} item - L'oggetto parziale del veicolo da aggiornare.
     * @returns {Promise<[number, Veicolo]>} - Una promessa che risolve con il numero di righe aggiornate.
     */
    public async updateVeicolo(targa: string, item: IVeicoloAttributes): Promise<[number, Veicolo[]]> {
        try {
            const existingTransito = await transitoDao.getByVeicolo(targa);
            if (existingTransito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, `Il veicolo con targa ${targa} è utilizato in un transito. Non può essere aggiornato. Transito ID: ${existingTransito.id_transito}`);
            }
            const [rows, updatedVeicolo] = await veicoloDao.update(targa, item);
            return [rows, updatedVeicolo];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del veicolo con targa ${targa}.`);
            }
        }
    }

    /**
     * Funzione per eliminare un veicolo.
     * 
     * @param {string} targa - La targa del veicolo da eliminare.
     * @returns {Promise<[number, Veicolo]>} - Una promessa che risolve con il numero di righe eliminate.
     */
    public async deleteVeicolo(targa: string): Promise<[number, Veicolo]> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const existingTransito = await transitoDao.getByVeicolo(targa);
            if (existingTransito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, `Il veicolo con targa ${targa} è utilizato in un transito. Non può essere eliminato. Transito ID: ${existingTransito.id_transito}`);
            }
            const [rows, deletedVeicolo] = await veicoloDao.delete(targa);
            await transaction.commit();
            return [rows, deletedVeicolo];
        } catch (error) {
            await transaction.rollback();
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del veicolo con targa ${targa}.`);
            }
        }
    }

    // HELPER PRIVATI

    /**
     * Funzione di stampa per le informazioni aggiuntive sui veicoli.
     */
    private async enrichVeicolo(veicolo: Veicolo) {
        const tipo_veicolo = await tipoVeicoloDao.getById(veicolo.tipo_veicolo);
        const utente = await utenteDao.getById(veicolo.utente);
        return {
            ...veicolo.dataValues,
            tipo_veicolo: tipo_veicolo ? tipo_veicolo.dataValues : null,
            utente: utente ? utente.dataValues : null
        };
    }
}

export default new VeicoloRepository();





