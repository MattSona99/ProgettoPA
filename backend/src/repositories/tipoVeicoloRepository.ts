import tipoVeicoloDao from "../dao/tipoVeicoloDao";
import TipoVeicolo, { ITipoVeicoloAttributes, ITipoVeicoloCreationAttributes } from "../models/tipoVeicolo";
import Database from "../utils/database";
import { HttpErrorFactory, HttpErrorCodes, HttpError } from '../utils/errorHandler';

/**
 * Classe TipoVeicoloRepository che gestisce le operazioni relative ai tipi di veicolo.
 */
class TipoVeicoloRepository {

    /**
     * Funzione per ottenere tutti i tipi di veicolo.
     * 
     * @returns {Promise<TipoVeicolo[]>} - Una promessa che risolve con un array di tipi di veicolo.
     */
    public async getAllTipoVeicolo(): Promise<ITipoVeicoloAttributes[]> {
        const tipiVeicolo = await tipoVeicoloDao.getAll();

        return tipiVeicolo;
    }

    /**
     * Funzione per ottenere un tipo di veicolo da un ID.
     * 
     * @param {number} id - L'ID del tipo di veicolo da recuperare.
     * @returns {Promise<TipoVeicolo>} - Una promessa che risolve con il tipo di veicolo trovato.
     */
    public async getTipoVeicoloById(id: number): Promise<ITipoVeicoloAttributes> {
        const tipoVeicolo = await tipoVeicoloDao.getById(id);

        return tipoVeicolo;
    }

    /**
     * Funzione per creare un nuovo tipo di veicolo.
     * 
     * @param {ITipoVeicoloCreationAttributes} item - L'oggetto parziale del tipo di veicolo da creare.
     * @returns {Promise<TipoVeicolo>} - Una promessa che risolve con il nuovo tipo di veicolo creato.
     */
    public async createTipoVeicolo(item: ITipoVeicoloCreationAttributes): Promise<ITipoVeicoloAttributes> {
        const nuovoTipoVeicolo = await tipoVeicoloDao.create(item);

        return nuovoTipoVeicolo;
    }

    /**
     * Funzione per aggiornare un tipo di veicolo esistente.
     * 
     * @param {number} id - L'ID del tipo di veicolo da aggiornare.
     * @param {TipoVeicolo} item - L'oggetto parziale del tipo di veicolo da aggiornare.
     * @returns {Promise<TipoVeicolo>} - Una promessa che risolve con il tipo di veicolo aggiornato.
     */
    public async updateTipoVeicolo(id: number, item: ITipoVeicoloAttributes): Promise<[number, TipoVeicolo[]]> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const [rows, updatedTipoVeicolo] = await tipoVeicoloDao.update(id, item, { transaction });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con id ${id} non aggiornato.`);
            }
            await transaction.commit();
            return [rows, updatedTipoVeicolo];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                await transaction.rollback();
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del tipo di veicolo con id ${id}.`);
            }
        }
    }

    /**
     * Funzione per eliminare un tipo di veicolo.
     * 
     * @param {number} id - L'ID del tipo di veicolo da eliminare.
     * @returns {Promise<TipoVeicolo>} - Una promessa che risolve con il tipo di veicolo eliminato.
     */
    public async deleteTipoVeicolo(id: number): Promise<[number, TipoVeicolo]> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const tipoVeicolo = await tipoVeicoloDao.getById(id);
            if (!tipoVeicolo) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con id ${id} non trovato.`);
            }

            const [rows, deletedTipoVeicolo] = await tipoVeicoloDao.delete(id);
            await transaction.commit();
            return [rows, deletedTipoVeicolo];
        } catch (error) {
            await transaction.rollback();
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del tipo di veicolo con id ${id}.`);
            }
        }
    }
}

export default new TipoVeicoloRepository();