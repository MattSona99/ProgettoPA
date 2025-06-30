import Varco from '../models/varco';
import varcoDao from '../dao/varcoDao';
import Database from '../utils/database';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

class VarcoRepository {
    public async findVarco(id: number): Promise<Varco | null> {
        try{
            const varco = await varcoDao.getById(id);
            if (!varco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco non trovato.");
            }
            return varco;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero del varco.");
        }
    }

    public async createVarco(varcoData: Varco): Promise<Varco> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const newVarco = await varcoDao.create(varcoData, { transaction });
            await transaction.commit();
            return newVarco;
        } catch (error) {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione del varco.");
        }
    }

    public async updateVarco(id: number, varcoData: Varco): Promise<[number, Varco[]]> {
        try {
            const updatedVarco = await varcoDao.update(id, varcoData);
            if (!updatedVarco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco non trovato.");
            }
            return updatedVarco;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiornamento del varco.");
        }
    }

    public async deleteVarco(id: number): Promise<boolean> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const deleted = await varcoDao.delete(id, { transaction });
            if (!deleted) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco non trovato.");
            }
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella cancellazione del varco.");
        }
    }
}

export default new VarcoRepository();
