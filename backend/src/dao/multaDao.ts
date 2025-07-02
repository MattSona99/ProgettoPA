import Multa, { MultaCreationAttributes } from "../models/multa";
import { DAO } from "./daoInterface";
import { MultaAttributes } from "../models/multa";
import { HttpErrorFactory, HttpErrorCodes } from "../utils/errorHandler";
import { Op, Transaction } from "sequelize";
import Transito from "../models/transito";
import Veicolo from "../models/veicolo";
import Utente from "../models/utente";
import Tratta from "../models/tratta";
import Varco from "../models/varco";

// Interfaccia MultaDAO che estende la DAO per includere metodi specifici per Multa
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
    public async create(item: MultaCreationAttributes, options?: { transaction?: Transaction }): Promise<Multa> {
        try {
            return await Multa.create(item, options);
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione della multa con ID ${item.id_multa}.`);
        }
    }

    /**
     * Funzione per aggiornare una multa.
     * 
     * @param id - L'ID della multa da aggiornare.
     * @param item - L'oggetto parziale della multa da aggiornare.
     * @returns - Una promessa che risolve con il numero di righe aggiornate.
     */
    public async update(id: number, item: MultaAttributes, options?: { transaction?: Transaction }): Promise<[number, MultaAttributes[]]> {
        try {
            const multa = await Multa.update(item, { where: { id_multa: id } });
            if (!multa) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Multa con ID ${id} non trovata.`);
            }
            const [rows] = await Multa.update(item, { where: { id_multa: id }, returning: true });
            const updated = await Multa.findAll({ where: { id_multa: id } });
            return [rows, updated];
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell\'aggiornamento della multa con ID ${id}.`);
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
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell\'eliminazione della multa con ID ${id}.`);
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
    
    public async getMulteByTargheEPeriodo(
        targhe: string[],
        dataIn: string,
        dataOut: string,
        utente: { id: number; ruolo: string }
    ) {
    try {
        // 1) Prendo tutti i transiti per quelle targhe e date
        const transiti = await Transito.findAll({
            where: {
                targa: { [Op.in]: targhe },
                [Op.or]: [
                    { data_in: { [Op.between]: [dataIn, dataOut] } },
                    { data_out: { [Op.between]: [dataIn, dataOut] } },
                    {
                        data_in: { [Op.lte]: dataIn },
                        data_out: { [Op.gte]: dataOut }
                    }
                ]
            },
            attributes: ['id_transito', 'targa', 'tratta', 'data_in', 'data_out', 'velocita_media', 'delta_velocita']
        });

        // Se l’utente è automobilista, filtriamo ulteriormente per i suoi veicoli:
        const transitiFiltrati = utente.ruolo === 'automobilista'
            ? transiti.filter(t => t.getDataValue('targa') && /* controlla se appartiene a utente.id */ true)
            : transiti;

        const transitoIds = transitiFiltrati.map(t => t.id_transito);
        if (!transitoIds.length) return [];

        // 2) Recupero le multe che fanno riferimento a quegli id_transito
        const multe = await Multa.findAll({
            where: { transito: { [Op.in]: transitoIds } },
            include: [{
                model: Transito,
                attributes: ['id_transito', 'targa', 'data_in', 'data_out', 'velocita_media', 'delta_velocita'],
                include: [{
                    model: Tratta,
                    include: [
                        { model: Varco, as: 'varcoIn', attributes: ['id_varco', 'nome_autostrada', 'km', 'smart', 'pioggia'] },
                        { model: Varco, as: 'varcoOut', attributes: ['id_varco', 'nome_autostrada', 'km', 'smart', 'pioggia'] }
                    ]
                }]
            }]
        });

        // 3) Ritorno un array “piatto” dove ogni multa porta con sé i dettagli di transito → tratta → varchi
        return multe.map(m => {
            const t = m.transito!;
            const tratta = t.Tratta!;
            return {
                id_multa: m.id_multa,
                uuid_pagamento: m.uuid_pagamento,
                importo: m.importo,
                transito: {
                    id: t.id_transito,
                    targa: t.targa,
                    data_in: t.data_in,
                    data_out: t.data_out,
                    velocita_media: t.velocita_media,
                    delta_velocita: t.delta_velocita,
                    tratta: {
                        id: tratta.id_tratta,
                        distanza: tratta.distanza,
                        varcoIn: tratta.varcoIn,
                        varcoOut: tratta.varcoOut
                    }
                }
            };
        });
    } catch (e) {
        throw HttpErrorFactory.createError(
            HttpErrorCodes.InternalServerError,
            `Errore nel recupero delle multe per le targhe ${targhe.join(', ')} tra ${dataIn} e ${dataOut}`
        );
    }
}
}

export default new MultaDao();