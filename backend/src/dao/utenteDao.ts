import { DAO } from './daoInterface';
import Utente, { IUtenteAttributes, IUtenteCreationAttributes } from '../models/utente';
import { Transaction } from 'sequelize';
import { HttpErrorFactory, HttpErrorCodes, HttpError } from '../utils/errorHandler';

// Interfaccia UtenteDAO che estende la DAO per includere metodi specifici per Utente
interface IUtenteDAO extends DAO<IUtenteAttributes, number> {
    // metodi da aggiungere nel caso specifico degli utenti
    getByEmail(email: string): Promise<Utente | null>;
}

// Classe UtenteDao che implementa l'interfaccia UtenteDAO
class UtenteDao implements IUtenteDAO {

    /**
     * Funzione per ottenere tutti gli utenti.
     * 
     * @returns {Promise<Utente[]>} - Una promessa che risolve con un array di utenti
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
     * @returns {Promise<Utente>} - Una promessa che risolve con l'utente trovato.
     */
    public async getById(id: number): Promise<Utente> {
        try {
            const utente = await Utente.findByPk(id);
            if (!utente) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Utente con ID ${id} non trovato.`);
            }
            return utente;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero dell'utente con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per ottenere un utente da una email.
     * 
     * @param email - L'email da utilizzare per ottenere l'utente.
     * @returns {Promise<Utente>} - Una promessa che risolve con l'utente trovato.
     */
    public async getByEmail(email: string): Promise<Utente> {
        try {
            const utente = await Utente.findOne({ where: { email } });
            if (!utente) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Utente con email ${email} non trovato.`);
            }
            return utente;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero dell'utente con email ${email}.`);
            }
        }
    }

    /**
     * Funzione per la creazione di un nuovo utente.
     * 
     * @param utente - L'oggetto parziale dell'utente da creare.
     * @returns {Promise<Utente>} - Una promessa che risolve con l'utente creato.
     */
    public async create(utente: IUtenteCreationAttributes, options?: { transaction?: Transaction }): Promise<Utente> {
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
     * @returns {Promise<[number, Utente[]]>} - Una promessa che risolve con il numero di righe aggiornate e un array di utenti aggiornati.
     */
    public async update(id: number, utente: IUtenteAttributes): Promise<[number, Utente[]]> {
        try {
            const [rows, updatedUtente] = await Utente.update(utente, { where: { id_utente: id }, returning: true });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Utente con ID ${id} non trovato.`);
            }
            return [rows, updatedUtente];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento dell'utente con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per eliminare un utente.
     * 
     * @param id - L'ID dell'utente da eliminare.
     * @returns {Promise<[number, Utente]>} - Una promessa che risolve con il numero di righe eliminate e l'utente eliminato.
     */
    public async delete(id: number, options?: { transaction?: Transaction }): Promise<[number, Utente]> {
        try {
            const utente = await Utente.findByPk(id);
            if (!utente) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Utente con ID ${id} non trovato.`);
            }
            const rows = await Utente.destroy({ where: { id_utente: id }, ...options });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Utente con ID ${id} non trovato.`);
            }
            return [rows, utente];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione dell'utente con ID ${id}.`);
            }
        }
    }
}

export default new UtenteDao();