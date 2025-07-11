import { Op, Transaction } from "sequelize";
import Varco, { IVarcoAttributes, IVarcoCreationAttributes } from "../models/varco";
// import { DAO } from "./daoInterface";
import { HttpErrorFactory, HttpErrorCodes, HttpError } from '../utils/errorHandler';
import { DAO } from "./daoInterface";

// Interfaccia VarcoDAO che estende la DAO per includere metodi specifici per Varco
interface IVarcoDAO extends DAO<IVarcoAttributes, number> {
    // metodi da aggiungere nel caso specifico dei varchi
    verifyCreateVarco(varco: Varco): Promise<Varco | null>;
    verifyUpdateVarco(varco: Varco): Promise<Varco | null>;
}

// Classe VarcoDao che implementa l'interfaccia VarcoDAO
class VarcoDao implements IVarcoDAO {

    /**
     * Funzione per ottenere tutti i varchi.
     * 
     * @returns {Promise<Varco[]>} - Una promessa che risolve con un array di varchi.
     */
    public async getAll(): Promise<Varco[]> {
        try {
            return await Varco.findAll();
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero dei varchi.`);
        }
    }

    /**
     * Funzione per ottenere un varco da un ID.
     * 
     * @param id - L'ID da utilizzare per ottenere il varco.
     * @returns {Promise<Varco>} - Una promessa che risolve con il varco trovato.
     */
    public async getById(id: number): Promise<Varco> {
        try {
            const varco = await Varco.findByPk(id);
            if (!varco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Varco con ID ${id} non trovato.`);
            } else {
                return varco;
            }
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del varco con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per verificare se un varco già esiste.
     * 
     * @param {IVarcoCreationAttributes} varco - Il varco da utilizzare per verificare l'esistenza.
     * @returns {Promise<Varco>} - Una promessa che risolve con il varco trovato.
     */

    public async verifyCreateVarco(varco: IVarcoCreationAttributes): Promise<Varco | null> {
        try {
            const existingVarco = await Varco.findOne(
                {
                    where:
                    {
                        [Op.and]: [
                            { nome_autostrada: varco.nome_autostrada },
                            { km: varco.km },
                            { smart: varco.smart }
                        ]
                    }
                });
            return existingVarco;
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del varco con ID ${varco.id_varco}.`);
        }
    }

    /**
     * Funzione per verificare se un varco già esiste per l'aggiornamento.
     * 
     * @param {Varco} varco - Il varco da utilizzare per verificare l'esistenza.
     * @returns {Promise<Varco>} - Una promessa che risolve con il varco trovato.
     */

    public async verifyUpdateVarco(varco: Varco): Promise<Varco | null> {
        try {
            const existingVarco = await Varco.findOne(
                {
                    where:
                    {
                        [Op.and]: [
                            { nome_autostrada: varco.nome_autostrada },
                            { km: varco.km },
                            { smart: varco.smart },
                        ],
                        [Op.not]: [{ id_varco: varco.id_varco }]
                    }
                });
            return existingVarco;
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del varco con ID ${varco.id_varco}.`);
        }
    };

    /**
     * Funzione per la creazione di un nuovo varco.
     * 
     * @param item - L'oggetto parziale del varco da creare.
     * @returns {Promise<Varco>} - Una promessa che risolve con il nuovo varco creato.
     */
    public async create(item: IVarcoCreationAttributes, options?: { transaction?: Transaction }): Promise<Varco> {
        try {
            return await Varco.create(item, options);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione del varco con ID ${item.id_varco}.`);
        }
    }

    /**
     * Funzione per aggiornare un varco.
     * 
     * @param id - L'ID del varco da aggiornare.
     * @param item - L'oggetto parziale del varco da aggiornare.
     * @returns {Promise<[number, Varco[]]>} - Una promessa che risolve con il numero di righe aggiornate e un array di varchi aggiornati.
     */
    public async update(id: number, item: IVarcoAttributes, options?: { transaction?: Transaction }): Promise<[number, Varco[]]> {
        try {
            const [rows, updatedVarco] = await Varco.update(item, { where: { id_varco: id }, ...options, returning: true});
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Varco con ID ${id} non aggiornato .`);
            }
            return [rows, updatedVarco];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del varco con ID ${id}.`);
            }
        }

    }

    /**
     * Funzione per eliminare un varco.
     * 
     * @param id - L'ID del varco da eliminare.
     * @param options - Opzioni per la transazione.
     * @returns {Promise<[number, Varco]>} - Una promessa che risolve con il numero di righe eliminate e il varco eliminato.
     */
    public async delete(id: number, options?: { transaction?: Transaction }): Promise<[number, Varco]> {
        try {
            const varco = await Varco.findByPk(id);
            if (!varco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Varco con ID ${id} non trovato.`);
            }
            const rows = await Varco.destroy({ where: { id_varco: id }, ...options });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Varco con ID ${id} non eliminato.`);
            }
            return [rows, varco];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del varco con ID ${id}.`);
            }
        }
    }
}

export default new VarcoDao();
