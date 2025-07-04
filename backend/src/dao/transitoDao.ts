import { DAO } from "./daoInterface";
import Transito, { TransitoAttributes, TransitoCreationAttributes } from "../models/transito";
import { Transaction } from "sequelize";
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

// Interfaccia TransitoDAO che estende la DAO per includere metodi specifici per Transito
interface TransitoDAO extends DAO<TransitoAttributes, number> {
    // metodi da aggiungere nel caso specifico dei transiti
}

// Classe TransitoDao che implementa l'interfaccia TransitoDAO
class TransitoDao implements TransitoDAO {

    /**
     * Funzione per ottenere tutti i transiti.
     *
     * @returns - Una promessa che risolve con un array di transiti.
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
     * @returns - Una promessa che risolve con il transito trovato.
     */
    public async getById(id: number): Promise<Transito | null> {
        try {
            const transito = await Transito.findByPk(id);
            if (!transito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Transito con ID ${id} non trovato.`);
            } else {
                return transito;
            }
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del transito con ID ${id}.`);
        }
    }

    /**
     * Funzione per creare un nuovo transito.
     * 
     * @param transito - L'oggetto transito da creare.
     * @returns - Una promessa che risolve con il transito creato.
     */
    public async create(transito: TransitoCreationAttributes, options?: { transaction?: Transaction }): Promise<Transito> {
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
     * @returns - Una promessa che risolve con il numero di righe aggiornate e l'array di transiti aggiornati.
     */
    public async update(id: number, transito: TransitoAttributes): Promise<[number, Transito[]]> {
        try {
            const existingTransito = await Transito.findByPk(id);
            if (!existingTransito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Transito con ID ${id} non trovato.`);
            }
            const [row, updatedTransito] = await Transito.update(transito, { where: { id_transito: id }, returning: true });
            if (row === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Transito con ID ${id} non aggiornato.`);
            }

            return [row, updatedTransito];
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del transito con ID ${id}.`);
        }
    }

    /**
     * Funzione per eliminare un transito.
     * 
     * @param id - L'ID del transito da eliminare.
     * @param options - Opzioni per la transazione.
     * @returns - Una promessa che risolve con il numero di righe eliminate.
     */
    public async delete(id: number, options?: { transaction?: Transaction }): Promise<number> {
        try {
            const deleted = await Transito.destroy({ where: { id_transito: id }, ...options });
            if (deleted === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Transito con ID ${id} non trovato.`);
            }
            return deleted;
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del transito con ID ${id}.`);
        }
    }
}

export default new TransitoDao();