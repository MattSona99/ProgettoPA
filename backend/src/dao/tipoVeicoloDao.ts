import TipoVeicolo from '../models/tipoVeicolo';
import { DAO } from './daoInterface';
import { TipoVeicoloAttributes } from '../models/tipoVeicolo';

// Interfaccia TipoVeicoloDAO che estende la DAO per includere metodi specifici per TipoVeicolo
interface TipoVeicoloDAO extends DAO<TipoVeicoloAttributes, number> {
    // Metodi specifici per TipoVeicolo, se necessari
}

// Classe TipoVeicoloDAO che implementa l'interfaccia TipoVeicoloDAO
class TipoVeicoloDAO implements TipoVeicoloDAO {
    
    /**
     * Funzione per ottenere tutti i tipi di veicolo.
     * 
     * @returns {Promise<TipoVeicolo[]>} Una promessa che risolve con un array di tipi di veicolo.
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
     * @returns {Promise<TipoVeicolo | null>} Una promessa che risolve con il tipo di veicolo trovato o null se non trovato.
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
     * @param {Partial<TipoVeicolo>} item - L'oggetto parziale del tipo di veicolo da creare.
     * @returns {Promise<TipoVeicolo>} Una promessa che risolve con il nuovo tipo di veicolo creato.
     */
    public async create(item: Partial<TipoVeicolo>): Promise<TipoVeicolo> {
        try {
            return await TipoVeicolo.create(item);
        } catch (error) {
            // ERRORE
            throw error;
        }
    }






}

export default new TipoVeicoloDAO();