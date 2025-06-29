import Varco from '../models/varco';
import varcoDao from '../dao/varcoDao';
import Database from '../utils/database';

class VarcoRepository {
    public async findVarco(id: number): Promise<Varco | null> {
        try{
            const varco = await varcoDao.getById(id);
            if (!varco) {
                throw new Error("Varco con id " + id + " non trovato");
            }
            return varco;
        } catch (error) {
            throw new Error("Errore nel recupero del varco");
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
            throw new Error("Errore nella creazione del varco");
        }
    }

    public async updateVarco(id: number, varcoData: Varco): Promise<[number, Varco[]]> {
        try {
            const updatedVarco = await varcoDao.update(id, varcoData);
            if (!updatedVarco) {
                throw new Error("Varco con id " + id + " non trovato");
            }
            return updatedVarco;
        } catch (error) {
            throw new Error("Errore nell'aggiornamento del varco");
        }
    }

    public async deleteVarco(id: number): Promise<boolean> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const deleted = await varcoDao.delete(id, { transaction });
            if (!deleted) {
                throw new Error("Varco con id " + id + " non trovato");
            }
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw new Error("Errore nella cancellazione del varco");
        }
    }
}

export default new VarcoRepository();
