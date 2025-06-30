import {DAO} from './daoInterface';
import Utente, {UtenteAttributes} from '../models/utente';
import {Transaction} from 'sequelize';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

interface UtenteDAO extends DAO<UtenteAttributes, number> {
    // metodi da aggiungere nel caso specifico degli utenti
    getByEmail(email: string): Promise<Utente | null>;
}

class UtenteDao implements UtenteDAO {
    public async getAll(): Promise<Utente[]> {
        try {
            return await Utente.findAll();
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero degli utenti.");
        }
    }

    public async getById(id: number): Promise<Utente | null> {
        try {
            const utente = await Utente.findByPk(id);
            if (!utente) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Utente non trovato.");
            }
            return utente;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero dell'utente.");
        }
    }

    public async getByEmail(email: string): Promise<Utente | null> {
        try {
            const utente = await Utente.findOne({ where: { email } });
            if (!utente) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Utente non trovato.");
            }
            return utente;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero dell'utente.");
        }
    }

    public async create(utente: Utente, options?: { transaction?: Transaction }): Promise<Utente> {
        try {
            return await Utente.create(utente, options);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione dell'utente.");
        }
    }

    public async update(id: number, utente: UtenteAttributes): Promise<[number, Utente[]]> {
        try {
            const existingUtente = await Utente.findByPk(id);
            if (!existingUtente) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Utente non trovato.");
            }
            const [indexedCount] = await Utente.update(utente, {
                where: { id_utente: id },
                returning: true
            });
            const updatedItem = await Utente.findAll({ where: { id_utente: id } });
            return [indexedCount, updatedItem];
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiornamento dell'utente.");
        }
    }

    public async delete(id: number, options?: { transaction?: Transaction }): Promise<number> {
        try {
            const deletedCount = await Utente.destroy({
                where: { id_utente: id },
                ...options
            });
            if (deletedCount === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Utente non trovato.");
            }
            return deletedCount;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'eliminazione dell'utente.");
        }
    }
}

export default new UtenteDao();