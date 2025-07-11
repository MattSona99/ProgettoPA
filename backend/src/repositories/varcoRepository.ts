import Varco, { IVarcoAttributes, IVarcoCreationAttributes } from '../models/varco';
import varcoDao from '../dao/varcoDao';
import Database from '../utils/database';
import { HttpErrorFactory, HttpErrorCodes, HttpError } from '../utils/errorHandler';
import utenteDao from '../dao/utenteDao';
import IsVarco from '../models/isVarco';
import trattaDao from '../dao/trattaDao';

/**
 * Classe VarcoRepository che gestisce le operazioni relative ai varchi.
 */
class VarcoRepository {

    /**
     * Funzione per ottenere tutti i varchi.
     * 
     * @returns {Promise<Varco[]>} - Una promessa che risolve con un array di varchi.
     */
    public async getAllVarco(): Promise<Varco[]> {
        return await varcoDao.getAll();
    }

    /**
     * Funzione per ottenere un varco da un ID.
     * 
     * @param id - L'ID del varco da recuperare.
     * @returns - Una promessa che risolve con il varco trovato.
     */
    public async getVarcoById(id: number) {
        const varco = await varcoDao.getById(id);

        return await this.enrichVarco(varco);
    }

    /**
     * Funzione per la creazione di un nuovo varco.
     * 
     * @param {IVarcoCreationAttributes} varcoData - L'oggetto parziale del varco da creare.
     * @returns {Promise<Varco>} - Una promessa che risolve con il nuovo varco creato.
     */
    public async createVarco(varcoData: IVarcoCreationAttributes): Promise<Varco> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const existingVarco = await varcoDao.verifyCreateVarco(varcoData);
            if (existingVarco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, `Il varco con ID ${existingVarco.id_varco} esiste già.`);
            }

            const newVarco = await varcoDao.create(varcoData, { transaction });
            await transaction.commit();
            return newVarco;
        } catch (error) {
            await transaction.rollback();
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiunta del varco.");
            }
        }
    }

    /**
     * Funzione per aggiornare un varco.
     * 
     * @param {number} id - L'ID del varco da aggiornare.
     * @param {IVarcoAttributes} varcoData - L'oggetto parziale del varco da aggiornare.
     * @returns {Promise<[number, Varco[]]>} - Una promessa che risolve con il numero di righe aggiornate e un array di varchi aggiornati.
     */
    public async updateVarco(id: number, varcoData: IVarcoAttributes): Promise<[number, Varco[]]> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const existingTratta = await trattaDao.getByVarco(id);
            if (existingTratta) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, `Il varco con ID ${id} è utilizzato in una tratta. Non puoi aggiornarlo. Tratta ID: ${existingTratta.id_tratta}`);
            }
            const [rows, updatedVarco] = await varcoDao.update(id, varcoData, { transaction });
            const existingVarco = await varcoDao.verifyUpdateVarco(updatedVarco[0]);
            if (existingVarco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, `Il varco con ID ${existingVarco.id_varco} esiste già.`);
            }
            await transaction.commit();
            return [rows, updatedVarco];
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del varco con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per eliminare un varco.
     * 
     * @param {number} id - L'ID del varco da eliminare.
     * @returns {Promise<[number, Varco]>} - Una promessa che risolve con il numero di righe eliminate e il varco eliminato.
     */
    public async deleteVarco(id: number): Promise<[number, Varco]> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const existingTratta = await trattaDao.getByVarco(id);
            if (existingTratta) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, `Il varco con ID ${id} è utilizzato in una tratta. Non puoi eliminarlo. Tratta ID: ${existingTratta.id_tratta}`);
            }

            const [rows, deletedVarco] = await varcoDao.delete(id, { transaction });
            await transaction.commit();
            return [rows, deletedVarco];
        } catch (error) {
            await transaction.rollback();
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del varco con ID ${id}.`);
            }
        }
    }

    // HELPER PRIVATI

    /**
     * Funzione di stampa per le informazioni aggiuntive sui veicoli.
     */
    private async enrichVarco(varco: Varco) {
        try {
            const isVarco = await IsVarco.findOne({ where: { id_varco: varco.id_varco } });
            if (isVarco) {
                const utente = await utenteDao.getById(isVarco.id_utente);
                return {
                    ...varco.dataValues,
                    utente: utente ? utente.dataValues : null
                }
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Varco con ID ${varco.id_varco} non trovato.`);
            }
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero dei varchi.");
            }
        }
    }
}

export default new VarcoRepository();
