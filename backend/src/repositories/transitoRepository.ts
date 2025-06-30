import Transito from '../models/transito';
import transitoDao from '../dao/transitoDao';
import Database from '../utils/database';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';
import Varco from '../models/varco';

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

    public async createTransito(transito: Transito, ruolo: Varco | null = null): Promise<Transito> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            // Se il ruolo è 'operatore', si forza l'inserimento del transito
            if (ruolo === null) {
                const newTransito = await transitoDao.create(transito, { transaction });
                if (!newTransito) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Errore nella creazione del transito.");
                }
                await transaction.commit();
                return newTransito;
            }else if (ruolo.smart) { // Se il ruolo è di un varco smart, si crea il transito
                const newTransito = await transitoDao.create(transito, { transaction });
                if (!newTransito) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Errore nella creazione del transito.");
                }
                await transaction.commit();
                return newTransito;
            } else { // Altrimenti, si crea il transito con l'id del varco
                const newTransito = await transitoDao.create(transito, { transaction });
                if (!newTransito) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Errore nella creazione del transito.");
                }
                return newTransito;
            }
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