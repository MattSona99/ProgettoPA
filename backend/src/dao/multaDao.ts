import Multa from "../models/multa";
import { DAO } from "./daoInterface";
import { MultaAttributes } from "../models/multa";
import { HttpErrorFactory, HttpErrorCodes } from "../utils/errorHandler";
import { Op, Transaction } from "sequelize";
import Transito from "../models/transito";
import Veicolo from "../models/veicolo";
import Utente from "../models/utente";
import Tratta from "../models/tratta";
import Varco from "../models/varco";

interface MultaDAO extends DAO<MultaAttributes, number> {
    // metodi da aggiungere nel caso specifico delle multe
}

// Classe MultaDao che implementa l'interfaccia MultaDAO
class MultaDao implements MultaDAO {

    /**
     * Funzione per ottenere tutte le multe.
     * 
     * @returns - Una promessa che risolve con un array di multe.
     */
    public async getAll(): Promise<MultaAttributes[]> {
        try {
            return await Multa.findAll();
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle multe.");
        }
    }

    /**
     * Funzione per ottenere le multe da un ID.
     * 
     * @param id - L'ID da utilizzare per ottenere le multe.
     * @returns - Una promessa che risolve con un array di multe.
     */
    public async getById(id: number): Promise<MultaAttributes | null> {
        try {
            const multa = await Multa.findByPk(id);
            if (!multa) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Multa con ID ${id} non trovata.`);
            }
            return multa;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero della multa con ID ${id}.`);
        }
    }

    /**
     * Funzione per la creazione di una nuova multa.
     * 
     * @param item - L'oggetto parziale della multa da creare.
     * @returns - Una promessa che risolve con la nuova multa creata.
     */
    public async create(item: MultaAttributes, options?: { transaction?: Transaction }): Promise<Multa> {
        try {
            return await Multa.create(item);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione della multa.");
        }
    }

    /**
     * Funzione per aggiornare una multa.
     * 
     * @param id - L'ID della multa da aggiornare.
     * @param item - L'oggetto parziale della multa da aggiornare.
     * @returns - Una promessa che risolve con il numero di righe aggiornate.
     */
    public async update(id: number, item: MultaAttributes): Promise<[number, MultaAttributes[]]> {
        try {
            const multa = await Multa.update(item, { where: { id_multa: id } });
            if (!multa) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Multa con ID ${id} non trovata.`);
            }
            const [rows] = await Multa.update(item, { where: { id_multa: id }, returning: true });
            const updated = await Multa.findAll({ where: { id_multa: id } });
            return [rows, updated];
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento della multa con ID ${id}.`);
        }
    }

    /**
     * Funzione per eliminare una multa.
     * 
     * @param id - L'ID della multa da eliminare.
     * @returns - Una promessa che risolve con il numero di righe eliminate.
     */
    public async delete(id: number, options?: { transaction?: Transaction }): Promise<number> {
        try {
            const multa = await Multa.findByPk(id);
            if (!multa) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Multa con ID ${id} non trovata.`);
            }
            return await Multa.destroy({ where: { id_multa: id } });
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione della multa con ID ${id}.`);
        }
    }

    /**
     * Funzione per ottenere le multe per le targhe e il periodo specificato.
     * 
     * @param targhe - Un array di targhe.
     * @param dataIn - La data di inizio del periodo.
     * @param dataOut - La data di fine del periodo.
     * @returns - Una promessa che risolve con un array di multe.
     */
    public async getMulteByTargheEPeriodo(targhe: string[], dataIn: string, dataOut: string, utente: Utente): Promise<Multa[]> {
        try {
            const multe = await Multa.findAll({
                include: [{
                    model: Transito,
                    include: [
                        {
                            model: Veicolo,
                            where: utente.ruolo === 'automobilista'
                                ? { targa: { [Op.in]: targhe }, id_utente: utente.id_utente }
                                : { targa: { [Op.in]: targhe } }
                        },
                        {
                            model: Tratta,
                            include: [
                                { model: Varco, as: 'varco_in' },
                                { model: Varco, as: 'varco_out' }
                            ]
                        }
                    ],
                    where: {
                        [Op.or]: [
                            { data_in: { [Op.between]: [dataIn, dataOut] } },
                            { data_out: { [Op.between]: [dataIn, dataOut] } },
                            {
                                data_in: { [Op.lte]: dataIn },
                                data_out: { [Op.gte]: dataOut }
                            }
                        ]
                    }
                }]
            });

            return multe;
        } catch (error) {
            throw HttpErrorFactory.createError(
                HttpErrorCodes.InternalServerError,
                `Errore nel recupero delle multe per le targhe ${targhe.join(", ")} nel periodo ${dataIn} - ${dataOut}.`
            );
        }
    }
}

export default new MultaDao();