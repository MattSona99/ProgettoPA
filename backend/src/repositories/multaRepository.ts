import multaDao from "../dao/multaDao";
import transitoDao from "../dao/transitoDao";
import trattaDao from "../dao/trattaDao";
import utenteDao from "../dao/utenteDao";
import varcoDao from "../dao/varcoDao";
import veicoloDao from "../dao/veicoloDao";
import Multa, { IMultaCreationAttributes } from "../models/multa";
import Database from "../utils/database";
import { HttpError, HttpErrorCodes, HttpErrorFactory } from "../utils/errorHandler";

/**
 * Classe MultaRepository che gestisce le operazioni relative alle multe.
 */
class multaRepository {

    /**
     * Funzione per creare una nuova multa.
     * 
     * @param itemMulta - L'oggetto parziale della multa da creare.
     * @returns {Promise<Multa>} - Una promessa che risolve con la nuova multa creata.
     */
    public async create(itemMulta: IMultaCreationAttributes): Promise<Multa> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const nuovaMulta = await multaDao.create(itemMulta, { transaction });
            await transaction.commit();
            return nuovaMulta;
        } catch (error) {
            await transaction.rollback();
            throw error;
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
    public async getMulteByTargheEPeriodo(targhe: string[], dataIn: string, dataOut: string, utente: { id: number, ruolo: string }) {
        try {
            // 1) Prendo tutti i veicoli dell'utente
            const veicoli = await veicoloDao.getByTarghe(utente, targhe);
            if (veicoli.length === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Veicolo con targa ${targhe} non trovato o non associato all'utente.`);
            }

            // 2) Prendo i transiti con le targhe dell'utente, filtrati per periodo
            const transiti = await transitoDao.getByVeicoliEPeriodo(veicoli, dataIn, dataOut);
            if (transiti.length === 0) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Nessun transito trovato per le targhe ${targhe} e il periodo specificato.`);
            }

            // 3) Recupero le multe che fanno riferimento a quegli id_transito
            const multe = await multaDao.getByTransiti(transiti);
            return await this.enrichMulte(multe);
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle multe.");
            }
        }
    }


    /**
     * Funzione per ottenere e verificare che la multa appartenga all'utente.
     * 
     * @param idMulta - L'ID della multa.
     * @param idUtente - L'ID dell'utente.
     * @returns {Promise<Multa>} - Una promessa che risolve con la multa con informazioni aggiuntive.
     */
    public async getMultaByUtente(idMulta: number, idUtente: number){
        try {

            // 1) Recupero la multa
            const multa = await multaDao.getById(idMulta);

            // 2) Recupero l'utente
            const utente = await utenteDao.getById(idUtente);

            // 3) Recupero il transito
            const transito = await transitoDao.getById(multa.transito);

            // 4) Recupero il veicolo
            const veicolo = await veicoloDao.getById(transito.targa);

            // 5) Verifico che la multa appartenga all'utente
            if (veicolo.utente !== utente.id_utente) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Multa con ID ${idMulta} non appartiene all'utente con ID ${idUtente}.`);
            }
            return multa;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero della multa.");
            }
        }
    };

    /**
     * Funzione per eliminare una multa.
     * 
     * @param idMulta - L'ID della multa da eliminare.
     * @returns {Promise<[number, Multa]>} - Una promessa che risolve con il numero di righe eliminate e la multa eliminata.
     */

    public async deleteMulta(idMulta: number) {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const [rows, deletedMulta] = await multaDao.delete(idMulta, { transaction });
            await transaction.commit();
            return [rows, deletedMulta];
        } catch (error) {
            await transaction.rollback();
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione della multa con ID ${idMulta}.`);
            }
        }
    }

    /**
     * Funzione di stampa sulle informazioni aggiuntive delle Multe.
     * 
     * @param multe - Un array di multe.
     * @returns - Una promessa che risolve con un array di multe con informazioni aggiuntive.
     */
    private async enrichMulte(multe: Multa[]) {
        const multaCompleta = await Promise.all(multe.map(async m => {
            const transito = await transitoDao.getById(m.transito);
            const tratta = await trattaDao.getById(transito.tratta);
            const varcoIn = await varcoDao.getById(tratta.varco_in);
            const varcoOut = await varcoDao.getById(tratta.varco_out);
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
                    tratta: tratta
                        ? {
                            id: tratta.id_tratta,
                            distanza: tratta.distanza,
                            varcoIn: varcoIn
                                ? {
                                    nome_autostrada: varcoIn.nome_autostrada,
                                    km: varcoIn.km
                                } : null,
                            varcoOut: varcoOut
                                ? {
                                    nome_autostrada: varcoOut.nome_autostrada,
                                    km: varcoOut.km
                                } : null
                        }
                        : null
                },
                condizioni_ambientali:
                    varcoIn.pioggia && varcoOut.pioggia ? "pioggia" : "nessuna pioggia"
            }
        }));
        return multaCompleta.filter(m => m !== null);
    }
};

export default new multaRepository();