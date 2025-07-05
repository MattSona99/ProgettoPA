import { Transaction } from "sequelize";
import Varco, { IVarcoAttributes, IVarcoCreationAttributes } from "../models/varco";
import { DAO } from "./daoInterface";
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

// Interfaccia VarcoDAO che estende la DAO per includere metodi specifici per Varco
interface IVarcoDAO extends DAO<IVarcoAttributes, number> {
    // metodi da aggiungere nel caso specifico dei varchi
}

// Classe VarcoDao che implementa l'interfaccia VarcoDAO
class VarcoDao implements IVarcoDAO {

    /**
     * Funzione per ottenere tutti i varchi.
     * 
     * @returns - Una promessa che risolve con un array di varchi.
     */
    public async getAll(): Promise<Varco[]> {
        try {
            return await Varco.findAll();
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero dei varchi.`);
        }
    }

    /**
     * Funzione per ottenere un varco da un ID.
     * 
     * @param id - L'ID da utilizzare per ottenere il varco.
     * @returns - Una promessa che risolve con il varco trovato.
     */
    public async getById(id: number): Promise<Varco | null> {
        try {
            const varco = await Varco.findByPk(id);
            if (!varco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Varco con ID ${id} non trovato.`);
            }
            return varco;
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del varco con ID ${id}.`);
        }
    }

    /**
     * Funzione per la creazione di un nuovo varco.
     * 
     * @param item - L'oggetto parziale del varco da creare.
     * @returns - Una promessa che risolve con il nuovo varco creato.
     */
    public async create(item: IVarcoCreationAttributes, options?: { transaction?: Transaction }): Promise<Varco> {
        try {
            return await Varco.create(item, options);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione del varco con ID ${item.id_varco}.`);
        }
    }

    /**
     * Funzione per aggiornare un varco.
     * 
     * @param id - L'ID del varco da aggiornare.
     * @param item - L'oggetto parziale del varco da aggiornare.
     * @returns - Una promessa che risolve con il numero di righe aggiornate e un array di varchi aggiornati.
     */
    public async update(id: number, item: IVarcoAttributes): Promise<[number, Varco[]]> {
        try {
            const existingVarco = await Varco.findByPk(id);
            if (!existingVarco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Varco con ID ${id} non trovato.`);
            }
            const [rows] = await Varco.update(item, {
                where: { id_varco: id },
                returning: true
            });
            const updated = await Varco.findAll({ where: { id_varco: id } });
            return [rows, updated];
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del varco con ID ${id}.`);
        }
    }

    /**
     * Funzione per eliminare un varco.
     * 
     * @param id - L'ID del varco da eliminare.
     * @param options - Opzioni per la transazione.
     * @returns - Una promessa che risolve con il numero di righe eliminate.
     */
    public async delete(id: number, options?: { transaction?: Transaction }): Promise<number> {
        try {
            const varco = await Varco.findByPk(id);
            if (!varco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Varco con ID ${id} non trovato.`);
            }
            return await Varco.destroy({ where: { id_varco: id }, ...options });
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del varco con ID ${id}.`);
        }
    }
}

export default new VarcoDao();
