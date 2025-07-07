import multaDao from "../dao/multaDao";
import transitoDao from "../dao/transitoDao";
import trattaDao from "../dao/trattaDao";
import varcoDao from "../dao/varcoDao";
import Multa, { IMultaCreationAttributes } from "../models/multa";
import Database from "../utils/database";

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
        const multe = await multaDao.getMulteByTargheEPeriodo(targhe, dataIn, dataOut, utente);
        return await this.enrichMulte(multe);
    }


    /**
     * Funzione per ottenere e verificare che la multa appartenga all'utente.
     * 
     * @param idMulta - L'ID della multa.
     * @param idUtente - L'ID dell'utente.
     * @returns {Promise<Multa>} - Una promessa che risolve con la multa con informazioni aggiuntive.
     */
    public async getMultaByUtente(idMulta: number, idUtente: number): Promise<Multa> {
        return await multaDao.getMultaByUtente(idMulta, idUtente);
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
}

export default new multaRepository();