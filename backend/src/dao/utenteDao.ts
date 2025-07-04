import {DAO} from './daoInterface';
import Utente, {UtenteAttributes, UtenteCreationAttributes} from '../models/utente';
import {Transaction} from 'sequelize';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

// Interfaccia UtenteDAO che estende la DAO per includere metodi specifici per Utente
interface UtenteDAO extends DAO<UtenteAttributes, number> {
    // metodi da aggiungere nel caso specifico degli utenti
    getByEmail(email: string): Promise<Utente | null>;
}

// Classe UtenteDao che implementa l'interfaccia UtenteDAO
class UtenteDao implements UtenteDAO {

    /**
     * Funzione per ottenere tutti gli utenti.
     * 
     * @returns - Una promessa che risolve con un array di utenti
     */
    public async getAll(): Promise<Utente[]> {
        try {
            return await Utente.findAll();
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero degli utenti.");
        }
    }

    /**
     * Funzione per ottenere un utente da un ID.
     * 
     * @param id - L'ID da utilizzare per ottenere l'utente.
     * @returns - Una promessa che risolve con l'utente trovato.
     */
    public async getById(id: number): Promise<Utente | null> {
        try {
            const utente = await Utente.findByPk(id);
            if (!utente) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Utente con ID ${id} non trovato.`);
            }
            return utente;
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero dell'utente con ID ${id}.`);
        }
    }

    /**
     * Funzione per ottenere un utente da una email.
     * 
     * @param email - L'email da utilizzare per ottenere l'utente.
     * @returns - Una promessa che risolve con l'utente trovato.
     */
    public async getByEmail(email: string): Promise<Utente | null> {
        try {
            const utente = await Utente.findOne({ where: { email } });
            if (!utente) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Utente con email ${email} non trovato.`);
            }
            return utente;
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero dell'utente con email ${email}.`);
        }
    }

    /**
     * Funzione per la creazione di un nuovo utente.
     * 
     * @param utente - L'oggetto parziale dell'utente da creare.
     * @returns - Una promessa che risolve con l'utente creato.
     */
    public async create(utente: UtenteCreationAttributes, options?: { transaction?: Transaction }): Promise<Utente> {
        try {
            return await Utente.create(utente, options);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione dell'utente con ID ${utente.id_utente}.`);
        }
    }

    /**
     * Funzione per aggiornare un utente.
     * 
     * @param id - L'ID dell'utente da aggiornare.
     * @param utente - L'oggetto parziale dell'utente da aggiornare.
     * @returns - Una promessa che risolve con il numero di righe aggiornate e un array di utenti aggiornati.
     */
    public async update(id: number, utente: UtenteAttributes): Promise<[number, Utente[]]> {
        try {
            const existingUtente = await Utente.findByPk(id);
            if (!existingUtente) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Utente con ID ${id} non trovato.`);
            }
            const [indexedCount] = await Utente.update(utente, {
                where: { id_utente: id },
                returning: true
            });
            const updatedItem = await Utente.findAll({ where: { id_utente: id } });
            return [indexedCount, updatedItem];
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento dell'utente con ID ${id}.`);
        }
    }

    /**
     * Funzione per eliminare un utente.
     * 
     * @param id - L'ID dell'utente da eliminare.
     * @returns - Una promessa che risolve con il numero di righe eliminate.
     */
    public async delete(id: number, options?: { transaction?: Transaction }): Promise<number> {
        try {
            const deletedCount = await Utente.destroy({
                where: { id_utente: id },
                ...options
            });
            if (deletedCount === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Utente con ID ${id} non trovato.`);
            }
            return deletedCount;
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione dell'utente con ID ${id}.`);
        }
    }
}

export default new UtenteDao();