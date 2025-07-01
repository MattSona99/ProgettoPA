import Varco from '../models/varco';
import varcoDao from '../dao/varcoDao';
import Database from '../utils/database';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

/**
 * Classe VarcoRepository che gestisce le operazioni relative ai varchi.
 */
class VarcoRepository {

    /**
     * Funzione per ottenere tutti i varchi.
     * 
     * @returns - Una promessa che risolve con un array di varchi.
     */
    public async getAllVarco(): Promise<Varco[]> {
        try {
            return await varcoDao.getAll();
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero dei varchi.");
        }
    }

    /**
     * Funzione per ottenere un varco da un ID.
     * 
     * @param id - L'ID del varco da recuperare.
     * @returns - Una promessa che risolve con il varco trovato.
     */
    public async findVarco(id: number): Promise<Varco | null> {
        try {
            const varco = await varcoDao.getById(id);
            if (!varco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Varco con ID ${id} non trovato.`);
            }
            return varco;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del varco con ID ${id}.`);
        }
    }

    /**
     * Funzione per la creazione di un nuovo varco.
     * 
     * @param varcoData - L'oggetto parziale del varco da creare.
     * @returns - Una promessa che risolve con il nuovo varco creato.
     */
    public async createVarco(varcoData: Varco): Promise<Varco> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const newVarco = await varcoDao.create(varcoData, { transaction });
            await transaction.commit();
            return newVarco;
        } catch (error) {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione del varco con ID ${varcoData.id_varco}.`);
        }
    }

    /**
     * Funzione per aggiornare un varco.
     * 
     * @param id - L'ID del varco da aggiornare.
     * @param varcoData - L'oggetto parziale del varco da aggiornare.
     * @returns - Una promessa che risolve con il numero di righe aggiornate e un array di varchi aggiornati.
     */
    public async updateVarco(id: number, varcoData: Varco): Promise<[number, Varco[]]> {
        try {
            const updatedVarco = await varcoDao.update(id, varcoData);
            if (!updatedVarco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Varco con ID ${id} non trovato.`);
            }
            return updatedVarco;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del varco con ID ${id}.`);
        }
    }

    /**
     * Funzione per eliminare un varco.
     * 
     * @param id - L'ID del varco da eliminare.
     * @returns - Una promessa che risolve con il numero di righe eliminate.
     */
    public async deleteVarco(id: number): Promise<boolean> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const deleted = await varcoDao.delete(id, { transaction });
            if (!deleted) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Varco con ID ${id} non trovato.`);
            }
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del varco con ID ${id}.`);
        }
    }
}

export default new VarcoRepository();
