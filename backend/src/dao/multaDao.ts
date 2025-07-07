import Multa, { IMultaCreationAttributes } from "../models/multa";
import { DAO } from "./daoInterface";
import { IMultaAttributes } from "../models/multa";
import { HttpErrorFactory, HttpErrorCodes, HttpError } from "../utils/errorHandler";
import { Op, Transaction } from "sequelize";
import Transito from "../models/transito";

// Interfaccia MultaDAO che estende la DAO per includere metodi specifici per Multa
interface IMultaDAO extends DAO<IMultaAttributes, number> {
    // metodi da aggiungere nel caso specifico delle multe
    getByTransiti(transiti: Transito[]): Promise<Multa[]>
    getByTransito(id: number): Promise<Multa | null>
}

// Classe MultaDao che implementa l'interfaccia MultaDAO
class MultaDao implements IMultaDAO {

    /**
     * Funzione per ottenere tutte le multe.
     * 
     * @returns {Promise<IMultaAttributes[]>} - Una promessa che risolve con un array di multe.
     */
    public async getAll(): Promise<IMultaAttributes[]> {
        try {
            return await Multa.findAll();
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle multe.");
        }
    }

    /**
     * Funzione per ottenere le multe da un ID.
     * 
     * @param id - L'ID da utilizzare per ottenere le multe.
     * @returns {Promise<Multa>} - Una promessa che risolve con un array di multe.
     */
    public async getById(id: number): Promise<Multa> {
        try {
            const multa = await Multa.findByPk(id);
            if (!multa) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Multa con ID ${id} non trovata.`);
            }
            return multa;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero della multa con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per ottenere la multa da un transito.
     * 
     * @param idTransito - L'ID del transito da utilizzare per ottenere la multa.
     * @returns {Promise<Multa | null>} - Una promessa che risolve con la multa trovata o null se non trovata.
     */
    public getByTransito(idTransito: number): Promise<Multa | null> {
        try {
            const multa = Multa.findOne({ where: { transito: idTransito } })
            return multa;
        }
        catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero della multa con ID ${idTransito}.`);
        }
    }

    /**
     * Funzione per la creazione di una nuova multa.
     * 
     * @param item - L'oggetto parziale della multa da creare.
     * @returns {Promise<Multa> }- Una promessa che risolve con la nuova multa creata.
     */
    public async create(item: IMultaCreationAttributes, options?: { transaction?: Transaction }): Promise<Multa> {
        try {
            return await Multa.create(item, options);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione della multa con ID ${item.id_multa}.`);
        }
    }

    /**
     * Funzione per aggiornare una multa.
     * 
     * @param id - L'ID della multa da aggiornare.
     * @param item - L'oggetto parziale della multa da aggiornare.
     * @returns {Promise<[number, IMultaAttributes[]]>} - Una promessa che risolve con il numero di righe aggiornate e un array di multe aggiornate.
     */
    public async update(id: number, item: IMultaAttributes): Promise<[number, IMultaAttributes[]]> {
        try {
            const [rows, updatedMulta] = await Multa.update(item, { where: { id_multa: id }, returning: true });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Multa con ID ${id} non aggiornata.`);
            }
            return [rows, updatedMulta];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento della multa con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per eliminare una multa.
     * 
     * @param id - L'ID della multa da eliminare.
     * @returns {Promise<[number, Multa]>} - Una promessa che risolve con il numero di righe eliminate e la multa eliminata.
     */
    public async delete(id: number, options?: { transaction?: Transaction }): Promise<[number, Multa]> {
        try {
            const multa = await Multa.findByPk(id);
            if (!multa) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Multa con ID ${id} non trovata.`);
            }
            const rows = await Multa.destroy({ where: { id_multa: id }, ...options });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Multa con ID ${id} non eliminata.`);
            }
            return [rows, multa];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione della multa con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per ottenere le multe per i transiti specificati.
     * 
     * @param {Transito[]} transiti - Un array di transiti.
     * @returns {Promise<Multa[]>} - Una promessa che risolve con un array di multe.
     */
    public async getByTransiti(transiti: Transito[]): Promise<Multa[]> {
        try {
            const multe = await Multa.findAll({
                where: { transito: { [Op.in]: transiti.map(t => t.id_transito) } },
                attributes: ['id_multa', 'uuid_pagamento', 'importo', 'transito'],
            });

            if (multe.length === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Nessuna multa trovata.");
            }
            return multe;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle multe.");
            }
        }
    };
}

export default new MultaDao();