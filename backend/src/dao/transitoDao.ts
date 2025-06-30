import {DAO} from "./daoInterface";
import Transito, {TransitoAttributes} from "../models/transito";
import {Transaction} from "sequelize";

interface TransitoDAO extends DAO<TransitoAttributes, number> {
    // metodi da aggiungere nel caso specifico dei transiti
}

class TransitoDao implements TransitoDAO {

    public async getAll(): Promise<Transito[]> {
        try {
            return await Transito.findAll();
        } catch (error: any) {
            throw new Error("Errore nel recupero dei transiti: " + error.message);
        }
    }
    public async getById(id: number): Promise<Transito | null> {
        try {
            const transito = await Transito.findByPk(id);
            if (!transito) {
                throw new Error("Transito con id " + id + " non trovato");
            }
            return transito;
        } catch (error: any) {
            throw new Error("Errore nel recupero del transito: " + error.message);
        }
    }

    public async create(transito: Transito, options?: { transaction?: Transaction }): Promise<Transito> {
        try {
            return await Transito.create(transito, options);
        } catch (error: any) {
            throw new Error("Errore nella creazione del transito: " + error.message);
        }
    }

    public async update(id: number, transito: Transito): Promise<[number, Transito[]]> {
        try {
            const existingTransito = await Transito.findByPk(id);
            if (!existingTransito) {
                throw new Error("Transito con id " + id + " non trovato");
            }
            const [indexedCount] = await Transito.update(transito, { where: { id_transito: id }, returning: true });
            const updatedTransito = await Transito.findAll({ where: { id_transito: id } });

            return [indexedCount, updatedTransito];
        } catch (error: any) {
            throw new Error("Errore nell'aggiornamento del transito: " + error.message);
        }
    }

    public async delete(id: number, options?: { transaction?: Transaction }): Promise<number> {
        try {
            const deleted = await Transito.destroy({ where: { id_transito: id }, ...options });
            if (deleted === 0) {
                throw new Error("Transito con id " + id + " non trovato");
            }
            return deleted;
        } catch (error: any) {
            throw new Error("Errore nella cancellazione del transito: " + error.message);
        }
    }
}

export default new TransitoDao();