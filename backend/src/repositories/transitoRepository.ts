import Transito from '../models/transito';
import transitoDao from '../dao/transitoDao';
import Database from '../utils/database';
class TransitoRepository {
    
    public async findTransito(id: number): Promise<Transito | null> {
        try {
            const transito = await transitoDao.getById(id);
            if (!transito) {
                throw new Error("Transito con id " + id + " non trovato");
            }
            return transito;
        } catch (error: any) {
            throw new Error("Errore nel recupero del transito: " + error.message);
        }
    }

    public async createTransito(transitoData: Transito): Promise<Transito> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const newTransito = await transitoDao.create(transitoData, { transaction });
            await transaction.commit();
            return newTransito;
        } catch (error: any) {
            await transaction.rollback();
            throw new Error("Errore nella creazione del transito: " + error.message);
        }
    }

    public async updateTransito(id: number, transitoData: Transito): Promise<[number, Transito[]]> {
        try {
            const updatedTransito = await transitoDao.update(id, transitoData);
            if (!updatedTransito) {
                throw new Error("Transito con id " + id + " non trovato");
            }
            return updatedTransito;
        } catch (error: any) {
            throw new Error("Errore nell'aggiornamento del transito: " + error.message);
        }
    }

    public async deleteTransito(id: number): Promise<boolean> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const deleted = await transitoDao.delete(id, { transaction });
            if (!deleted) {
                return false;
            }
            await transaction.commit();
            return true;
        } catch (error: any) {
            await transaction.rollback();
            throw new Error("Errore nella cancellazione del transito: " + error.message);
        }
    }
}

export default new TransitoRepository();