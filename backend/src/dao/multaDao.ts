import Multa, { IMultaCreationAttributes } from "../models/multa";
import { DAO } from "./daoInterface";
import { IMultaAttributes } from "../models/multa";
import { HttpErrorFactory, HttpErrorCodes, HttpError } from "../utils/errorHandler";
import { Op, Transaction } from "sequelize";
import Transito from "../models/transito";
import Veicolo from "../models/veicolo";
import Utente from "../models/utente";
import { RuoloUtente } from "../enums/RuoloUtente";

// Interfaccia MultaDAO che estende la DAO per includere metodi specifici per Multa
interface IMultaDAO extends DAO<IMultaAttributes, number> {
    // metodi da aggiungere nel caso specifico delle multe
    getMulteByTargheEPeriodo(targhe: string[], dataIn: string, dataOut: string, utente: { id: number, ruolo: string }): Promise<Multa[]>
    getMultaByUtente(idMulta: number, idUtente: number): Promise<Multa>
}

// Classe MultaDao che implementa l'interfaccia MultaDAO
class MultaDao implements IMultaDAO {

    /**
     * Funzione per ottenere tutte le multe.
     * 
     * @returns {Promise<IMultaAttributes[]>} - Una promessa che risolve con un array di multe.
     */
    public async getAll(): Promise<IMultaAttributes[]> {
        try {
            return await Multa.findAll();
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle multe.");
        }
    }

    /**
     * Funzione per ottenere le multe da un ID.
     * 
     * @param id - L'ID da utilizzare per ottenere le multe.
     * @returns {Promise<Multa>} - Una promessa che risolve con un array di multe.
     */
    public async getById(id: number): Promise<Multa> {
        try {
            const multa = await Multa.findByPk(id);
            if (!multa) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Multa con ID ${id} non trovata.`);
            }
            return multa;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero della multa con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per la creazione di una nuova multa.
     * 
     * @param item - L'oggetto parziale della multa da creare.
     * @returns {Promise<Multa> }- Una promessa che risolve con la nuova multa creata.
     */
    public async create(item: IMultaCreationAttributes, options?: { transaction?: Transaction }): Promise<Multa> {
        try {
            return await Multa.create(item, options);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione della multa con ID ${item.id_multa}.`);
        }
    }

    /**
     * Funzione per aggiornare una multa.
     * 
     * @param id - L'ID della multa da aggiornare.
     * @param item - L'oggetto parziale della multa da aggiornare.
     * @returns {Promise<[number, IMultaAttributes[]]>} - Una promessa che risolve con il numero di righe aggiornate e un array di multe aggiornate.
     */
    public async update(id: number, item: IMultaAttributes): Promise<[number, IMultaAttributes[]]> {
        try {
            const [rows, updatedMulta] = await Multa.update(item, { where: { id_multa: id }, returning: true });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Multa con ID ${id} non aggiornata.`);
            }
            return [rows, updatedMulta];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento della multa con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per eliminare una multa.
     * 
     * @param id - L'ID della multa da eliminare.
     * @returns {Promise<[number, Multa]>} - Una promessa che risolve con il numero di righe eliminate e la multa eliminata.
     */
    public async delete(id: number, options?: { transaction?: Transaction }): Promise<[number, Multa]> {
        try {
            const multa = await Multa.findByPk(id);
            if (!multa) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Multa con ID ${id} non trovata.`);
            }
            const rows = await Multa.destroy({ where: { id_multa: id }, ...options });
            if (rows === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Multa con ID ${id} non eliminata.`);
            }
            return [rows, multa];
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione della multa con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per ottenere le multe per le targhe e il periodo specificato.
     * 
     * @param targhe - Un array di targhe.
     * @param dataIn - La data di inizio del periodo.
     * @param dataOut - La data di fine del periodo.
     * @returns {Promise<Multa[]>} - Una promessa che risolve con un array di multe.
     */
    public async getMulteByTargheEPeriodo(
        targhe: string[],
        dataIn: string,
        dataOut: string,
        utente: { id: number, ruolo: string }
    ): Promise<Multa[]> {
        try {
            let veicoliUtente: Veicolo[] = [];
            // 1) Prendo tutti i veicoli dell'utente
            if (utente.ruolo === RuoloUtente.AUTOMOBILISTA) {
                veicoliUtente = await Veicolo.findAll({
                    where: {
                        targa: { [Op.in]: targhe },
                        utente: { [Op.eq]: utente.id }
                    },
                    attributes: ['targa']
                });
            }
            else if (utente.ruolo === RuoloUtente.OPERATORE) {
                veicoliUtente = await Veicolo.findAll({
                    where: {
                        targa: { [Op.in]: targhe }
                    },
                    attributes: ['targa']
                });
            }
            else {
                throw HttpErrorFactory.createError(HttpErrorCodes.Unauthorized, "Utente non autorizzato.");
            }

            if (veicoliUtente.length === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Veicolo con targa ${targhe} non trovato o non associato all'utente.`);
            }

            // 2) Prendo i transiti con le targhe dell'utente, filtrati per periodo
            const transiti = await Transito.findAll({
                where: {
                    targa: { [Op.in]: veicoliUtente.map(v => v.targa) },
                    [Op.or]: [
                        { data_in: { [Op.between]: [dataIn, dataOut] } },
                        { data_out: { [Op.between]: [dataIn, dataOut] } },
                        {
                            data_in: { [Op.gte]: dataIn },
                            data_out: { [Op.lte]: dataOut }
                        }
                    ]
                },
                attributes: ['id_transito', 'targa', 'tratta', 'data_in', 'data_out', 'velocita_media', 'delta_velocita']
            });

            if (transiti.length === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Nessun transito trovato per le targhe ${targhe} e il periodo specificato.`);
            }

            // 3) Recupero le multe che fanno riferimento a quegli id_transito
            const multe = await Multa.findAll({
                where: { transito: { [Op.in]: transiti.map(t => t.id_transito) } },
                attributes: ['id_multa', 'uuid_pagamento', 'importo', 'transito'],
            });

            if (multe.length === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Nessuna multa trovata.");
            }
            return multe;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle multe.");
            }
        }
    }


    /**
     * Funzione per ottenere la multa associata ad un utente.
     * 
     * @param idMulta - Un array di targhe.
     * @param idUtente - La data di inizio del periodo.
     * @returns {Promise<Multa>} - Una promessa che risolve con una multa.
     */
    public async getMultaByUtente(idMulta: number, idUtente: number): Promise<Multa> {
        try {
            // 1) Recupero la multa
            const multa = await Multa.findByPk(idMulta);
            if (!multa) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Multa con ID ${idMulta} non trovata.`);
            }
            // 2) Recupero l'utente
            const utente = await Utente.findByPk(idUtente);
            if (!utente) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Utente con ID ${idUtente} non trovato.`);
            }
            // 3) Recupero il transito
            const transito = await Transito.findByPk(multa.transito);
            if (!transito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Transito con ID ${multa.transito} non trovato.`);
            }
            // 4) Recupero il veicolo
            const veicolo = await Veicolo.findByPk(transito.targa);
            if (!veicolo) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Veicolo con targa ${transito.targa} non trovato.`);
            }
            // 5) Verifico che la multa appartenga all'utente
            if (veicolo.utente !== idUtente) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Multa con ID ${idMulta} non appartiene all'utente con ID ${idUtente}.`);
            }
            return multa;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero della multa con ID ${idMulta}.`);
            }
        }
    }
}

export default new MultaDao();