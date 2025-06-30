import Tratta from '../models/tratta';
import { DAO } from './daoInterface';
import { TrattaAttributes } from '../models/tratta';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

// Interfaccia TrattaDAO che estende la DAO per includere metodi specifici per Tratta
interface TrattaDAO extends DAO<TrattaAttributes, number> {
    // Metodi specifici per Tratta, se necessari
}

// Classe TrattaDao che implementa l'interfaccia TrattaDAO
class TrattaDao implements TrattaDAO {
    
    /**
     * Funzione per ottenere tutte le tratte.
     * 
     * @returns {Promise<Tratta[]>} Una promessa che risolve con un array di tratte.
     */
    public async getAll(): Promise<Tratta[]> {
        try {
            return await Tratta.findAll();
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle tratte.");
        }
    }

    /**
     * Funzione per ottenere una tratta da un ID.
     * 
     * @param {number} id - L'ID della tratta da recuperare.
     * @returns {Promise<Tratta | null>} Una promessa che risolve con la tratta trovata o null se non trovata.
     */
    public async getById(id: number): Promise<Tratta | null> {
        try {
            return await Tratta.findByPk(id);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero della tratta.");
        }
    }

    /**
     * Funzione per creare una nuova tratta.
     * 
     * @param {TrattaAttributes} item - L'oggetto parziale della tratta da creare.
     * @returns {Promise<Tratta>} Una promessa che risolve con la nuova tratta creata.
     */
    public async create(item: TrattaAttributes): Promise<Tratta> {
        try {
            return await Tratta.create(item);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione della tratta.");
        }
    }

    /**
     * Funzione per aggiornare una tratta.
     * 
     * @param {number} id - L'ID della tratta da aggiornare.
     * @param {TrattaAttributes} item - L'oggetto parziale della tratta da aggiornare.
     * @returns {Promise<number>} Una promessa che risolve con il numero di righe aggiornate.
     */
    public async update(id: number, item: TrattaAttributes): Promise<[number, Tratta[]]> {
        try {
            const tratta = await Tratta.findByPk(id);
            if (!tratta) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Tratta non trovata.");
            }
            const [rows] = await Tratta.update(item, { where: { id_tratta: id }, returning: true });
            const updated = await Tratta.findAll({ where: { id_tratta: id } });
            return [rows, updated];
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiornamento della tratta.");
        }
    }

    /**
     * Funzione per eliminare una tratta.
     * 
     * @param {number} id - L'ID della tratta da eliminare.
     * @returns {Promise<number>} Una promessa che risolve con il numero di righe eliminate.
     */
    public async delete(id: number): Promise<number> {
        try {
            return await Tratta.destroy({ where: { id_tratta: id } });
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'eliminazione della tratta.");
        }
    }
}

export default new TrattaDao();