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
        utente: { id: number, ruolo: string }
    ) {
        try {
            let veicoliUtente: Veicolo[] = [];
            console.log("############UTENTE: ", utente);
            console.log("############MULTADAO:Recuperando i veicoli per le targhe", targhe, "nel periodo", dataIn, "-", dataOut);
            // 1) Prendo tutti i veicoli dell'utente
            if (utente.ruolo === "automobilista") {
                console.log("Automobilista");
                veicoliUtente = await Veicolo.findAll({
                    where: {
                        targa: { [Op.in]: targhe },
                        utente: {[Op.eq]: utente.id}
                    },
                    attributes: ['targa']
                });
            }
            else if (utente.ruolo === "operatore") {
                console.log("Operatore");
                veicoliUtente = await Veicolo.findAll({
                    where: {
                        targa: { [Op.in]: targhe }
                    },
                    attributes: ['targa']
                });
            }
            else {
                console.log("Utente non autorizzato");
               throw HttpErrorCodes.Unauthorized, "Utente non autorizzato";
            }

            if (veicoliUtente.length === 0) {
                console.log("Veicoli associati a quelle targhe non trovati o non associati all'utente");
                throw HttpErrorCodes.NotFound, "Veicoli associati a quelle targhe non trovati o non associati all'utente";
            }

            console.log(veicoliUtente)

            console.log("############MULTADAO:Recuperando i transiti per le targhe", targhe, "nel periodo", dataIn, "-", dataOut);
            // 1) Prendo i transiti per le targhe dell'utente filtrati per periodo
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

            if(transiti.length === 0) {
                console.log("Transiti associati a quelle targhe non trovato o non associati all'utente");
                throw HttpErrorCodes.NotFound, "Transiti associati a quelle targhe non trovato o non associati all'utente";
            }

            console.log(transiti)

            console.log("############MULTADAO:Recuperando le multe per le targhe", targhe, "nel periodo", dataIn, "-", dataOut);
            // 2) Recupero le multe che fanno riferimento a quegli id_transito
            const multe = await Multa.findAll({
                where: { transito: { [Op.in]: transiti.map(t => t.id_transito) } },
            });

            if (multe.length === 0) {
                console.log("Nessuna multa trovata");
                throw HttpErrorCodes.NotFound, "Nessuna multa trovata";
            }
            console.log(multe);

            return multe;

            // 3) Ritorno un array “piatto” dove ogni multa porta con sé i dettagli di transito → tratta → varchi
            /* return multe.map(m => {
                const transito = m.dataValues.transito;
                const tratta = transito.getDataValue('tratta');
                return {
                    id_multa: m.id_multa,
                    uuid_pagamento: m.uuid_pagamento,
                    importo: m.importo,
                    transito: {
                        id: transito.id_transito,
                        targa: transito.targa,
                        data_in: transito.data_in,
                        data_out: transito.data_out,
                        velocita_media: transito.velocita_media,
                        delta_velocita: transito.delta_velocita,
                        tratta: {
                            id: tratta.id_tratta,
                            distanza: tratta.distanza,
                            varcoIn: tratta.varcoIn,
                            varcoOut: tratta.varcoOut
                        }
                    }
                };
            }); */
        } catch (e) {
            throw HttpErrorFactory.createError(
                HttpErrorCodes.InternalServerError,
                `Errore nel recupero delle multe per le targhe ${targhe.join(', ')} tra ${dataIn} e ${dataOut}`
            );
        }
    }
}

export default new MultaDao();