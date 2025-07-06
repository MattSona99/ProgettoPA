import Veicolo, { IVeicoloAttributes } from '../models/veicolo';
import { DAO } from './daoInterface';
import { HttpErrorFactory, HttpErrorCodes, HttpError } from '../utils/errorHandler';
import { Transaction } from 'sequelize';

// Interfaccia VeicoloDAO che estende la DAO per includere metodi specifici per Veicolo
interface IVeicoloDAO extends DAO<IVeicoloAttributes, string> {
    // Metodi specifici per Veicolo, se necessari
}

// Classe VeicoloDao che implementa l'interfaccia VeicoloDAO
class VeicoloDao implements IVeicoloDAO {

    /**
     * Funzione per ottenere tutti i veicoli.
     * 
     * @returns {Promise<Veicolo[]>} - Una promessa che risolve con un array di veicoli.
     */
    public async getAll(): Promise<Veicolo[]> {
        try {
            return await Veicolo.findAll();
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero dei veicoli.");
        }
    }

    /**
     * Funzione per ottenere un veicolo da una targa.
     * 
     * @param {string} targa - La targa del veicolo da recuperare.
     * @returns {Promise<Veicolo>} - Una promessa che risolve con il veicolo trovato.
     */
    public async getById(targa: string): Promise<Veicolo> {
        try {
            const veicolo = await Veicolo.findByPk(targa);
            if (!veicolo) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Veicolo con targa ${targa} non trovato.`);
            } else {
                return veicolo;
            }
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del veicolo con targa ${targa}.`);
            }
        }
    }

    /**
     * Funzione per creare un nuovo veicolo.
     * 
     * @param {VeicoloAttributes} item - L'oggetto parziale del veicolo da creare.
     * @returns {Promise<Veicolo>} - Una promessa che risolve con il nuovo veicolo creato.
     */
    public async create(item: IVeicoloAttributes, options?: { transaction?: Transaction }): Promise<Veicolo> {
        try {
            return await Veicolo.create(item, options);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione del veicolo con targa ${item.targa}.`);
        }
    }

    /**
     * Funzione per aggiornare un veicolo.
     * 
     * @param {string} targa - La targa del veicolo da aggiornare.
     * @param {VeicoloAttributes} item - L'oggetto parziale del veicolo da aggiornare.
     * @returns {Promise<[number, Veicolo[]]>} - Una promessa che risolve con il numero di righe aggiornate e un array di veicoli aggiornati.
     */
    public async update(targa: string, item: IVeicoloAttributes): Promise<[number, Veicolo[]]> {
        try {
            const [rows, updatedVeicolo] = await Veicolo.update(item, { where: { targa: targa }, returning: true });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Veicolo con targa ${targa} non aggiornato .`);
            }
            return [rows, updatedVeicolo];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del veicolo con targa ${targa}.`);
            }
        }
    }

    /**
     * Funzione per eliminare un veicolo.
     * 
     * @param {string} targa - La targa del veicolo da eliminare.
     * @returns {Promise<[number, Veicolo]>} - Una promessa che risolve con il numero di righe eliminate e il veicolo eliminato.
     */
    public async delete(targa: string): Promise<[number, Veicolo]> {
        try {
            const veicolo = await Veicolo.findByPk(targa);
            if (!veicolo) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Veicolo con targa ${targa} non trovato.`);
            }
            const rows = await Veicolo.destroy({ where: { targa: targa } });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Veicolo con targa ${targa} non eliminato.`);
            }
            return [rows, veicolo];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del veicolo con targa ${targa}.`);
            }
        }
    }
}

export default new VeicoloDao();