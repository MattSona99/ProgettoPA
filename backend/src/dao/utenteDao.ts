import {DAO} from './daoInterface';
import Utente, {UtenteAttributes} from '../models/utente';
import {Transaction} from 'sequelize';

interface UtenteDAO extends DAO<UtenteAttributes, number> {
    // metodi da aggiungere nel caso specifico degli utenti
    getByEmail(email: string): Promise<Utente | null>;
}

class UtenteDao implements UtenteDAO {
    public async getAll(): Promise<Utente[]> {
        try {
            return await Utente.findAll();
        } catch (error) {
            throw new Error("Errore nel recupero degli utenti: " + error.message);
        }
    }

    public async getById(id: number): Promise<Utente | null> {
        try {
            const utente = await Utente.findByPk(id);
            if (!utente) {
                throw new Error("Utente con id " + id + " non trovato");
            }
            return utente;
        } catch (error) {
            throw new Error("Errore nel recupero dell'utente: " + error.message);
        }
    }

    public async getByEmail(email: string): Promise<Utente | null> {
        try {
            const utente = await Utente.findOne({ where: { email } });
            if (!utente) {
                throw new Error("Utente con email " + email + " non trovato");
            }
            return utente;
        } catch (error) {
            throw new Error("Errore nel recupero dell'utente per email: " + error.message);
        }
    }

    public async create(utente: Utente, options?: { transaction?: Transaction }): Promise<Utente> {
        try {
            return await Utente.create(utente, options);
        } catch (error) {
            throw new Error("Errore nella creazione dell'utente: " + error.message);
        }
    }

    public async update(id: number, utente: UtenteAttributes): Promise<[number, Utente[]]> {
        try {
            const existingUtente = await Utente.findByPk(id);
            if (!existingUtente) {
                throw new Error("Utente con id " + id + " non trovato");
            }
            const [indexedCount] = await Utente.update(utente, {
                where: { id_utente: id },
                returning: true
            });
            const updatedItem = await Utente.findAll({ where: { id_utente: id } });
            return [indexedCount, updatedItem];
        } catch (error) {
            throw new Error("Errore nell'aggiornamento dell'utente: " + error.message);
        }
    }

    public async delete(id: number, options?: { transaction?: Transaction }): Promise<number> {
        try {
            const deletedCount = await Utente.destroy({
                where: { id_utente: id },
                ...options
            });
            if (deletedCount === 0) {
                throw new Error("Utente con id " + id + " non trovato");
            }
            return deletedCount;
        } catch (error) {
            throw new Error("Errore nella cancellazione dell'utente: " + error.message);
        }
    }
}

export default new UtenteDao();