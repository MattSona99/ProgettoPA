import Transito from '../models/transito';
import transitoDao from '../dao/transitoDao';
import Database from '../utils/database';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

class TransitoRepository {
    
    public async findTransito(id: number): Promise<Transito | null> {
        try {
            const transito = await transitoDao.getById(id);
            if (!transito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato.");
            }
            return transito;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero del transito.");
        }
    }

    public async createTransito(transitoData: Transito): Promise<Transito> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const newTransito = await transitoDao.create(transitoData, { transaction });
            await transaction.commit();
            return newTransito;
        } catch (error) {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione del transito.");
        }
    }

    public async updateTransito(id: number, transitoData: Transito): Promise<[number, Transito[]]> {
        try {
            const updatedTransito = await transitoDao.update(id, transitoData);
            if (!updatedTransito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato.");
            }
            return updatedTransito;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiornamento del transito.");
        }
    }

    public async deleteTransito(id: number): Promise<boolean> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const deleted = await transitoDao.delete(id, { transaction });
            if (!deleted) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato.");
            }
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella cancellazione del transito.");
        }
    }
}

export default new TransitoRepository();