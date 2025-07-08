import TipoVeicolo, { ITipoVeicoloAttributes, ITipoVeicoloCreationAttributes } from '../models/tipoVeicolo';
import { Op, Transaction } from 'sequelize';
import { HttpErrorFactory, HttpErrorCodes, HttpError } from '../utils/errorHandler';
import { DAO } from './daoInterface';

// Interfaccia TipoVeicoloDAO che estende la DAO per includere metodi specifici per TipoVeicolo
interface ITipoVeicoloDAO extends DAO<ITipoVeicoloAttributes, number> {
    // Metodi specifici per TipoVeicolo, se necessari
    verifyCreateTipoVeicolo(tipoVeicolo: ITipoVeicoloCreationAttributes): Promise<TipoVeicolo | null>;
    verifyUpdateTipoVeicolo(tipoVeicolo: ITipoVeicoloAttributes): Promise<TipoVeicolo | null>;
}

// Classe TipoVeicoloDao che implementa l'interfaccia TipoVeicoloDAO
class TipoVeicoloDao  implements ITipoVeicoloDAO {

    /**
     * Funzione per ottenere tutti i tipi di veicolo.
     * 
     * @returns {Promise<TipoVeicolo[]>} - Una promessa che risolve con un array di tipi di veicolo.
     */
    public async getAll(): Promise<TipoVeicolo[]> {
        try {
            return await TipoVeicolo.findAll();
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero dei tipi di veicolo.");
        }
    }

    /**
     * Funzione che recupera un tipo di veicolo da un ID.
     * 
     * @param {number} id - L'ID del tipo di veicolo da recuperare.
     * @returns {Promise<TipoVeicolo>} - Una promessa che risolve con il tipo di veicolo trovato.
     */
    public async getById(id: number): Promise<TipoVeicolo> {
        try {
            const tipoVeicolo = await TipoVeicolo.findByPk(id);
            if (!tipoVeicolo) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con id ${id} non trovato.`);
            } else {
                return tipoVeicolo;
            }
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del tipo di veicolo con id ${id}.`);
            }
        }
    };

    /**
     * Funzione che verifica la creazione di un nuovo tipo di veicolo.
     * 
     * @param tipoVeicolo - L'oggetto parziale del tipo di veicolo da creare.
     * @returns {Promise<TipoVeicolo | null>} - Una promessa che risolve con il tipo di veicolo trovato o null se non trovato.
     */

    verifyCreateTipoVeicolo(tipoVeicolo: ITipoVeicoloCreationAttributes): Promise<TipoVeicolo | null> {
        try {
            return TipoVeicolo.findOne({ 
                where: {
                    [Op.and]: [
                        {tipo: tipoVeicolo.tipo}
                    ]
                }
            });
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella verifica del tipo di veicolo con id ${tipoVeicolo.id_tipo_veicolo}.`);
        }
    };

    /**
     * Funzione che verifica l'aggiornamento di un tipo di veicolo.
     * 
     * @param tipoVeicolo - L'oggetto parziale del tipo di veicolo da aggiornare.
     * @returns {Promise<TipoVeicolo | null>} - Una promessa che risolve con il tipo di veicolo trovato o null se non trovato.
     */

    public async verifyUpdateTipoVeicolo(tipoVeicolo: ITipoVeicoloAttributes): Promise<TipoVeicolo | null> {
        try{
            return await TipoVeicolo.findOne({ 
                where: {
                    [Op.and]: [
                        {id_tipo_veicolo: { [Op.ne]: tipoVeicolo.id_tipo_veicolo}},
                        {tipo: tipoVeicolo.tipo}
                    ]
                }
            });
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella verifica del tipo di veicolo con id ${tipoVeicolo.id_tipo_veicolo}.`);
        }
    }



    /**
     * Funzione che crea un nuovo tipo di veicolo.
     * 
     * @param {TipoVeicolo} item - L'oggetto parziale del tipo di veicolo da creare.
     * @returns {Promise<TipoVeicolo>} - Una promessa che risolve con il nuovo tipo di veicolo creato.
     */
    public async create(item: ITipoVeicoloCreationAttributes, options?: { transaction?: Transaction }): Promise<TipoVeicolo> {
        try {
            return await TipoVeicolo.create(item, options);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione del tipo di veicolo con id ${item.id_tipo_veicolo}.`);
        }
    }

    /**
     * Funzione che aggiorna un tipo di veicolo esistente.
     * 
     * @param {number} id - L'ID del tipo di veicolo.
     * @param {TipoVeicolo} item - L'oggetto parziale del tipo di veicolo da aggiornare.
     * @returns {Promise<[number, TipoVeicolo[]]>} - Una promessa che risolve con il numero di righe aggiornate e un array di tipi di veicolo.
     */

    public async update(id: number, item: ITipoVeicoloAttributes, options?: { transaction?: Transaction }): Promise<[number, TipoVeicolo[]]> {
        try {
            const [rows, updatedTipoVeicolo] = await TipoVeicolo.update(item, { where: { id_tipo_veicolo: id }, ...options, returning: true });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con id ${id} non aggiornato.`);
            }
            return [rows, updatedTipoVeicolo];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del tipo di veicolo con id ${id}.`);
            }
        }
    }

    /**
     * Funzione che elimina un tipo di veicolo.
     * 
     * @param {number} id - L'ID del tipo di veicolo da eliminare.
     * @returns {Promise<[number, TipoVeicolo]>} - Una promessa che risolve con il numero di righe eliminate e il tipo di veicolo eliminato.
     */
    public async delete(id: number, options?: { transaction?: Transaction }): Promise<[number, TipoVeicolo]> {
        try {
            const tipoVeicolo = await TipoVeicolo.findByPk(id);
            if (!tipoVeicolo) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con id ${id} non trovato.`);
            }

            const rows = await TipoVeicolo.destroy({ where: { id_tipo_veicolo: id }, ...options });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con id ${id} non eliminato.`);
            }
            return [rows, tipoVeicolo];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del tipo di veicolo con id ${id}.`);
            }
        }
    }
}

export default new TipoVeicoloDao();