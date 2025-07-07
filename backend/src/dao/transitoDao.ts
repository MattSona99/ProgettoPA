import Transito, { ITransitoAttributes, ITransitoCreationAttributes } from "../models/transito";
import { Op, Transaction } from "sequelize";
import { HttpErrorFactory, HttpErrorCodes, HttpError } from '../utils/errorHandler';
import { DAO } from "./daoInterface";
import Veicolo from "../models/veicolo";

// Interfaccia TransitoDAO che estende la DAO per includere metodi specifici per Transito
interface ITransitoDAO extends DAO<ITransitoAttributes, number> {
    // metodi da aggiungere nel caso specifico dei transiti
    getByTratta(id: number): Promise<Transito | null>;
    getByVeicolo(targa: string): Promise<Transito | null>;
    getByVeicoliEPeriodo(veicoli: Veicolo[], dataIn: string, dataOut: string): Promise<Transito[]>
}

// Classe TransitoDao che implementa l'interfaccia TransitoDAO
class TransitoDao implements ITransitoDAO {

    /**
     * Funzione per ottenere tutti i transiti.
     *
     * @returns {Promise<Transito[]>} - Una promessa che risolve con un array di transiti.
     */
    public async getAll(): Promise<Transito[]> {
        try {
            return await Transito.findAll();
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero dei transiti.");
        }
    }

    /**
     * Funzione per ottenere un transito da un ID.
     * 
     * @param id - L'ID da utilizzare per ottenere il transito.
     * @returns {Promise<Transito>} - Una promessa che risolve con il transito trovato.
     */
    public async getById(id: number): Promise<Transito> {
        try {
            const transito = await Transito.findByPk(id);
            if (!transito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Transito con ID ${id} non trovato.`);
            } else {
                return transito;
            }
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del transito con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per ottenere un transito da una tratta.
     * 
     * @param { number } id - L'ID della tratta da utilizzare per ottenere il transito.
     * @returns {Promise<Transito>} - Una promessa che risolve con il transito trovato.
     */

    public async getByTratta(id: number): Promise<Transito | null> {
        try {
            const transito = await Transito.findOne({ where: { tratta: id } });
            return transito;

        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del transito con ID ${id}.`);
        }
    };

    /**
     * Funzione per ottenere un transito da una targa
     * 
     * @param targa - La targa del veicolo da utilizzare per ottenere il transito
     * @returns {Promise<Transito | null>} - Una promessa che risolve con il transito trovato o null se non trovato
     */

    public async getByVeicolo(targa: string): Promise<Transito | null> {
        try {
            const transito = await Transito.findOne({ where: { targa: targa } });
            return transito;
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del transito con targa ${targa}.`);
        }
    }

    public async getByVeicoliEPeriodo(veicoli: Veicolo[], dataIn: string, dataOut: string): Promise<Transito[]> {
        try {
            return await Transito.findAll({
                where: {
                    targa: { [Op.in]: veicoli.map(v => v.targa) },
                    [Op.or]: [
                        { data_in: { [Op.between]: [dataIn, dataOut] } },
                        { data_out: { [Op.between]: [dataIn, dataOut] } },
                        {
                            data_in: { [Op.gte]: dataIn },
                            data_out: { [Op.lte]: dataOut }
                        }
                    ]
                },
                attributes: ['id_transito', 'targa', 'tratta', 'data_in', 'data_out', 'velocita_media', 'delta_velocita']
            });
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero dei transiti per le targhe ${veicoli.map(veicolo => veicolo.targa)} e il periodo specificato.`);
        }
    }

    /**
     * Funzione per creare un nuovo transito.
     * 
     * @param transito - L'oggetto transito da creare.
     * @returns {Promise<Transito>} - Una promessa che risolve con il transito creato.
     */
    public async create(transito: ITransitoCreationAttributes, options?: { transaction?: Transaction }): Promise<Transito> {
        try {
            return await Transito.create(transito, options);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione del transito con ID ${transito.id_transito}.`);
        }
    }

    /**
     * Funzione per aggiornare un transito.
     * 
     * @param id - L'ID del transito da aggiornare.
     * @param transito - L'oggetto transito da aggiornare.
     * @returns {Promise<[number, Transito[]]>} - Una promessa che risolve con il numero di righe aggiornate e un array di transiti aggiornati.
     */
    public async update(id: number, transito: ITransitoAttributes): Promise<[number, Transito[]]> {
        try {
            const [rows, updatedTransito] = await Transito.update(transito, { where: { id_transito: id }, returning: true });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Transito con ID ${id} non aggiornato.`);
            }

            return [rows, updatedTransito];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del transito con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per eliminare un transito.
     * 
     * @param id - L'ID del transito da eliminare.
     * @param options - Opzioni per la transazione.
     * @returns {Promise<[number, Transito]>} - Una promessa che risolve con il numero di righe eliminate e il transito eliminato.
     */
    public async delete(id: number, options?: { transaction?: Transaction }): Promise<[number, Transito]> {
        try {
            const transito = await Transito.findByPk(id);
            if (!transito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Transito con ID ${id} non trovato.`);
            }
            const rows = await Transito.destroy({ where: { id_transito: id }, ...options });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Transito con ID ${id} non eliminato.`);
            }
            return [rows, transito]
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del transito con ID ${id}.`);
            }
        }
    }
}

export default new TransitoDao();