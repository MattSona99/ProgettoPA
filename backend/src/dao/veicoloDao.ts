import Veicolo from '../models/veicolo';
import { DAO } from './daoInterface';
import { VeicoloAttributes } from '../models/veicolo';

// Interfaccia VeicoloDAO che estende la DAO per includere metodi specifici per Veicolo
interface VeicoloDAO extends DAO<VeicoloAttributes, string> {
    // Metodi specifici per Veicolo, se necessari
}

// Classe VeicoloDao che implementa l'interfaccia VeicoloDAO
class VeicoloDao implements VeicoloDAO {

    /**
     * Funzione per ottenere tutti i veicoli.
     * 
     * @returns {Promise<Veicolo[]>} - Una promessa che risolve con un array di veicoli.
     */
    public async getAll(): Promise<Veicolo[]> {
        try {
            return await Veicolo.findAll();
        } catch (error) {
            // ERRORE
            throw error;
        }
    }

    /**
     * Funzione per ottenere un veicolo da una targa.
     * 
     * @param {string} targa - La targa del veicolo da recuperare.
     * @returns {Promise<Veicolo | null>} - Una promessa che risolve con il veicolo trovato o null se non trovato.
     */
    public async getById(targa: string): Promise<Veicolo | null> {
        try {
            const veicolo = await Veicolo.findByPk(targa);
            if (!veicolo) {
                // ERRORE
                return null;
            }
            return veicolo;
        } catch (error) {
            // ERRORE
            throw error;
        }
    }

    /**
     * Funzione per creare un nuovo veicolo.
     * 
     * @param {VeicoloAttributes} item - L'oggetto parziale del veicolo da creare.
     * @returns {Promise<Veicolo>} - Una promessa che risolve con il nuovo veicolo creato.
     */
    public async create(item: VeicoloAttributes): Promise<Veicolo> {
        try {
            return await Veicolo.create(item);
        } catch (error) {
            // ERRORE
            throw error;
        }
    }

    /**
     * Funzione per aggiornare un veicolo.
     * 
     * @param {string} targa - La targa del veicolo da aggiornare.
     * @param {VeicoloAttributes} item - L'oggetto parziale del veicolo da aggiornare.
     * @returns {Promise<number>} - Una promessa che risolve con il numero di righe aggiornate.
     */
    public async update(targa: string, item: VeicoloAttributes): Promise<[number, Veicolo[]]> {
        try {
            const veicolo = await Veicolo.findByPk(targa);
            if (!veicolo) {
                // ERRORE
                return [0, []];
            }
            const [rows] = await Veicolo.update(item, { where: { targa: targa }, returning: true });
            const updated = await Veicolo.findAll({ where: { targa: targa } });
            return [rows, updated];
        } catch (error) {
            // ERRORE
            throw error;
        }
    }

    /**
     * Funzione per eliminare un veicolo.
     * 
     * @param {string} targa - La targa del veicolo da eliminare.
     * @returns {Promise<number>} - Una promessa che risolve con il numero di righe eliminate.
     */
    public async delete(targa: string): Promise<number> {
        try {
            const veicolo = await Veicolo.findByPk(targa);
            if (!veicolo) {
                // ERRORE
                return 0;
            }
            return await Veicolo.destroy({ where: { targa: targa } });
        } catch (error) {
            // ERRORE
            throw error;
        }
    }
}

export default new VeicoloDao();