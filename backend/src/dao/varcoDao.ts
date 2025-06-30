import { Transaction } from "sequelize";
import Varco, { VarcoAttributes } from "../models/varco";
import { DAO } from "./daoInterface";
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

interface VarcoDAO extends DAO<VarcoAttributes, number> {
    // metodi da aggiungere nel caso specifico dei varchi
}

class VarcoDao implements VarcoDAO {
    public async getById(id: number): Promise<Varco | null> {
        try {
            const varco = await Varco.findByPk(id);
            if (!varco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco non trovato.");
            }
            return varco;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero del varco.");
        }
    }

    public async getAll(): Promise<Varco[]> {
        try {
            return await Varco.findAll();
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero dei varchi.");
        }
    }

    public async create(item: Varco, options?: { transaction?: Transaction }): Promise<Varco> {
        try {
            return await Varco.create(item, options);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione del varco.");
        }
    }

    public async update(id: number, item: VarcoAttributes): Promise<[number, Varco[]]> {
        try {
            const existingVarco = await Varco.findByPk(id);
            if (!existingVarco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco non trovato.");
            }
            const [indexedCount] = await Varco.update(item, {
                where: { id_varco: id },
                returning: true
            });
            const updatedItem = await Varco.findAll({ where: { id_varco: id } });
            return [indexedCount, updatedItem];
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiornamento del varco.");
        }
    }

    public async delete(id: number, options?: { transaction?: Transaction }): Promise<number> {
        try {
            const deletedCount = await Varco.destroy({
                where: { id_varco: id },
                ...options
            });
            if (deletedCount === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco non trovato.");
            }
            return deletedCount;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'eliminazione del varco.");
        }
    }
}

export default new VarcoDao();
