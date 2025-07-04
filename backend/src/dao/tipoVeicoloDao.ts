import TipoVeicolo, { ITipoVeicoloCreationAttributes } from '../models/tipoVeicolo';
import { Transaction } from 'sequelize';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

// Interfaccia TipoVeicoloDAO che estende la DAO per includere metodi specifici per TipoVeicolo
/* interface ITipoVeicoloDAO extends DAO<ITipoVeicoloAttributes, number> {
    // Metodi specifici per TipoVeicolo, se necessari
} */

// Classe TipoVeicoloDao che implementa l'interfaccia TipoVeicoloDAO
class TipoVeicoloDao /*  implements ITipoVeicoloDAO */ {

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
        const tipoVeicolo = await TipoVeicolo.findByPk(id);
        if (!tipoVeicolo) {
            throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con id ${id} non trovato.`);
        } else {
            return tipoVeicolo;
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
     * @returns {Promise<[number, TipoVeicolo[]]>} - Una promessa che risolve con un array di tipi di veicolo.
     */

    public async update(id: number, item: TipoVeicolo): Promise<[number, TipoVeicolo[]]> {
        const tipoVeicolo = await TipoVeicolo.findByPk(id);
        if (!tipoVeicolo) {
            throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con id ${id} non trovato.`);
        }
        const [rows, updatedTipoVeicolo] = await TipoVeicolo.update(item, { where: { id_tipo_veicolo: id }, returning: true });
        if (rows === 0) {
            throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con id ${id} non aggiornato.`);
        }
        return [rows, updatedTipoVeicolo];
    }

    /**
     * Funzione che elimina un tipo di veicolo.
     * 
     * @param {number} id - L'ID del tipo di veicolo da eliminare.
     * @returns {Promise<number>} - Una promessa che risolve con il numero di righe eliminate.
     */
    public async delete(id: number, options?: { transaction?: Transaction }): Promise<number> {
        const tipoVeicolo = await TipoVeicolo.findByPk(id);
        if (!tipoVeicolo) {
            throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con id ${id} non trovato.`);
        }
        try {
            return await TipoVeicolo.destroy({ where: { id_tipo_veicolo: id }, ...options });
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del tipo di veicolo con id ${id}.`);
        }
    }
}

export default new TipoVeicoloDao();