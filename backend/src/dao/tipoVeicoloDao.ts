import TipoVeicolo, { TipoVeicoloCreationAttributes } from '../models/tipoVeicolo';
import { Transaction } from 'sequelize';
import { DAO } from './daoInterface';
import { TipoVeicoloAttributes } from '../models/tipoVeicolo';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

// Interfaccia TipoVeicoloDAO che estende la DAO per includere metodi specifici per TipoVeicolo
interface TipoVeicoloDAO extends DAO<TipoVeicoloAttributes, number> {
    // Metodi specifici per TipoVeicolo, se necessari
}

// Classe TipoVeicoloDao che implementa l'interfaccia TipoVeicoloDAO
class TipoVeicoloDao implements TipoVeicoloDAO {

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
     * @returns {Promise<TipoVeicolo | null>} - Una promessa che risolve con il tipo di veicolo trovato o null se non trovato.
     */
    public async getById(id: number): Promise<TipoVeicolo | null> {
        try {
            const tipoVeicolo = await TipoVeicolo.findByPk(id);
            if (!tipoVeicolo) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con id ${id} non trovato.`);
            } else {
                return tipoVeicolo;
            }
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del tipo di veicolo con id ${id}.`);
        }
    }

    /**
     * Funzione che crea un nuovo tipo di veicolo.
     * 
     * @param {TipoVeicolo} item - L'oggetto parziale del tipo di veicolo da creare.
     * @returns {Promise<TipoVeicolo>} - Una promessa che risolve con il nuovo tipo di veicolo creato.
     */
    public async create(item: TipoVeicoloCreationAttributes, options?: { transaction?: Transaction }): Promise<TipoVeicolo> {
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
     * @returns {Promise<[number, TipoVeicolo[]]>} - Una promessa che risolve con un array di tipi di veicolo.
     */

    public async update(id: number, item: TipoVeicolo): Promise<[number, TipoVeicolo[]]> {
        try {
            const tipoVeicolo = await TipoVeicolo.findByPk(id);
            if (!tipoVeicolo) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con id ${id} non trovato.`);
            }
            const [rows] = await TipoVeicolo.update(item, { where: { id_tipo_veicolo: id }, returning: true });
            const updated = await TipoVeicolo.findAll({ where: { id_tipo_veicolo: id } });
            return [rows, updated];
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del tipo di veicolo con id ${id}.`);
        }
    }

    /**
     * Funzione che elimina un tipo di veicolo.
     * 
     * @param {number} id - L'ID del tipo di veicolo da eliminare.
     * @returns {Promise<number>} - Una promessa che risolve con il numero di righe eliminate.
     */
    public async delete(id: number): Promise<number> {
        try {
            const tipoVeicolo = await TipoVeicolo.findByPk(id);
            if (!tipoVeicolo) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con id ${id} non trovato.`);
            }
            return await TipoVeicolo.destroy({ where: { id_tipo_veicolo: id } });
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del tipo di veicolo con id ${id}.`);
        }
    }
}

export default new TipoVeicoloDao();