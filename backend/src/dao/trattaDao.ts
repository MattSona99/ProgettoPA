import Tratta, { ITrattaCreationAttributes } from '../models/tratta';
import { DAO } from './daoInterface';
import { ITrattaAttributes } from '../models/tratta';
import { HttpErrorFactory, HttpErrorCodes, HttpError } from '../utils/errorHandler';
import { Op, Transaction } from 'sequelize';

// Interfaccia TrattaDAO che estende la DAO per includere metodi specifici per Tratta
interface ITrattaDAO extends DAO<ITrattaAttributes, number> {
    // Metodi specifici per Tratta, se necessari
    getTrattaByVarcoOut(id_varco_out: number): Promise<Tratta | null>;
    getByVarco(id: number): Promise<Tratta | null>;
}

// Classe TrattaDao che implementa l'interfaccia TrattaDAO
class TrattaDao implements ITrattaDAO {

    /**
     * Funzione per ottenere tutte le tratte.
     * 
     * @returns {Promise<Tratta[]>} Una promessa che risolve con un array di tratte.
     */
    public async getAll(): Promise<Tratta[]> {
        try {
            return await Tratta.findAll();
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle tratte.");
        }
    }

    /**
     * Funzione per ottenere una tratta da un ID.
     * 
     * @param {number} id - L'ID della tratta da recuperare.
     * @returns {Promise<Tratta>} Una promessa che risolve con la tratta trovata.
     */
    public async getById(id: number): Promise<Tratta> {
        try {
            const tratta = await Tratta.findByPk(id);
            if (!tratta) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tratta con ID ${id} non trovata.`);
            } else {
                return tratta;
            }
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero della tratta con ID ${id}.`);
            }
        }
    }

    public async getByVarco(id: number): Promise<Tratta | null> {
        try {
            return await Tratta.findOne({
                where:
                {
                    [Op.or]: [
                        { varco_in: id },
                        { varco_out: id }
                    ]
                }
            });
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero della tratta con varco di uscita ${id}.`);
        }
    }

    /**
     * Funzione per creare una nuova tratta.
     * 
     * @param {TrattaAttributes} item - L'oggetto parziale della tratta da creare.
     * @returns {Promise<Tratta>} Una promessa che risolve con la nuova tratta creata.
     */
    public async create(item: ITrattaCreationAttributes, options?: { transaction?: Transaction }): Promise<Tratta> {
        try {
            return await Tratta.create(item, options);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione della tratta con ID ${item.id_tratta}.`);
        }
    }

    /**
     * Funzione per aggiornare una tratta.
     * 
     * @param {number} id - L'ID della tratta da aggiornare.
     * @param {TrattaAttributes} item - L'oggetto parziale della tratta da aggiornare.
     * @returns {Promise<[number, Tratta[]]>} Una promessa che risolve con il numero di righe aggiornate e un array di tratte aggiornate.
     */
    public async update(id: number, item: ITrattaAttributes): Promise<[number, Tratta[]]> {
        try {
            const [rows, updatedTratta] = await Tratta.update(item, { where: { id_tratta: id }, returning: true });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tratta con ID ${id} non aggiornata.`);
            }
            return [rows, updatedTratta];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento della tratta con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per eliminare una tratta.
     * 
     * @param {number} id - L'ID della tratta da eliminare.
     * @returns {Promise<[number, Tratta]>} - Una promessa che risolve con il numero di righe eliminate e la tratta eliminata.
     */
    public async delete(id: number): Promise<[number, Tratta]> {
        try {
            const tratta = await Tratta.findByPk(id);
            if (!tratta) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tratta con ID ${id} non trovata.`);
            }
            const rows = await Tratta.destroy({ where: { id_tratta: id } });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tratta con ID ${id} non eliminata.`);
            }
            return [rows, tratta];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione della tratta con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per ottenere una tratta da un varco di uscita.
     * 
     * @param {number} id_varco_out - L'ID del varco di uscita.
     * @returns {Promise<Tratta | null>} - Una promessa che risolve con la tratta trovata o null se non trovata.
     */
    public async getTrattaByVarcoOut(id_varco_out: number): Promise<Tratta | null> {
        try {
            return await Tratta.findOne({ where: { varco_out: id_varco_out } });
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero della tratta con varco di uscita ${id_varco_out}.`);
        }
    }
}

export default new TrattaDao();