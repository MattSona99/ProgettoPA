import {DAO} from "./daoInterface";
import Transito, {TransitoAttributes} from "../models/transito";
import {Transaction} from "sequelize";
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

interface TransitoDAO extends DAO<TransitoAttributes, number> {
    // metodi da aggiungere nel caso specifico dei transiti
}

class TransitoDao implements TransitoDAO {

    public async getAll(): Promise<Transito[]> {
        try {
            return await Transito.findAll();
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero dei transiti.");
        }
    }
    public async getById(id: number): Promise<Transito | null> {
        try {
            const transito = await Transito.findByPk(id);
            if (!transito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato.");
            }
            return transito;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero del transito.");
        }
    }

    public async create(transito: Transito, options?: { transaction?: Transaction }): Promise<Transito> {
        try {
            return await Transito.create(transito, options);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione del transito.");
        }
    }

    public async update(id: number, transito: Transito): Promise<[number, Transito[]]> {
        try {
            const existingTransito = await Transito.findByPk(id);
            if (!existingTransito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato.");
            }
            const [indexedCount] = await Transito.update(transito, { where: { id_transito: id }, returning: true });
            const updatedTransito = await Transito.findAll({ where: { id_transito: id } });

            return [indexedCount, updatedTransito];
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiornamento del transito.");
        }
    }

    public async delete(id: number, options?: { transaction?: Transaction }): Promise<number> {
        try {
            const deleted = await Transito.destroy({ where: { id_transito: id }, ...options });
            if (deleted === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato.");
            }
            return deleted;
        } catch (error: any) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'eliminazione del transito.");
        }
    }
}

export default new TransitoDao();