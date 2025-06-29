import TipoVeicolo from '../models/tipoVeicolo';
import { DAO } from './daoInterface';
import { TipoVeicoloAttributes } from '../models/tipoVeicolo';

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
        try{
        return await TipoVeicolo.findAll();
        } catch (error) {
            // ERRORE
            throw error;
        }
    }

    /**
     * Funzione che recupera un tipo di veicolo da un ID.
     * 
     * @param {number} id - L'ID del tipo di veicolo da recuperare.
     * @returns {Promise<TipoVeicolo | null>} - Una promessa che risolve con il tipo di veicolo trovato o null se non trovato.
     */
    public async getById(id: number): Promise<TipoVeicolo | null> {
        try{
            const tipoVeicolo = await TipoVeicolo.findByPk(id);
            if (!tipoVeicolo) {
                // ERRORE
                return null;
            }
            return tipoVeicolo;
        } catch (error) {
            // ERRORE
            throw error;
        }
    }

    /**
     * Funzione che crea un nuovo tipo di veicolo.
     * 
     * @param {TipoVeicolo} item - L'oggetto parziale del tipo di veicolo da creare.
     * @returns {Promise<TipoVeicolo>} - Una promessa che risolve con il nuovo tipo di veicolo creato.
     */
    public async create(item:TipoVeicolo): Promise<TipoVeicolo> {
        try {
            return await TipoVeicolo.create(item);
        } catch (error) {
            // ERRORE
            throw error;
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
                // ERRORE
                return [0, []];
            }
            const [rows] = await TipoVeicolo.update(item, { where: { id_tipo_veicolo: id }, returning: true });
            const updated = await TipoVeicolo.findAll({ where: { id_tipo_veicolo: id } });
            return [rows, updated];
        } catch (error) {
            // ERRORE
            throw error;
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
                // ERRORE
                return 0;
            }
            return await TipoVeicolo.destroy({ where: { id_tipo_veicolo: id } });
        } catch (error) {
            // ERRORE
            throw error;
        }
    }
}

export default new TipoVeicoloDao();