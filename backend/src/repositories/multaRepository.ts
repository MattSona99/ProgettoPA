import multaDao from "../dao/multaDao";
import transitoDao from "../dao/transitoDao";
import trattaDao from "../dao/trattaDao";
import Multa, { MultaCreationAttributes } from "../models/multa";
import { MultaAttributes } from "../models/multa";
import Transito from "../models/transito";
import Tratta from "../models/tratta";
import Utente from "../models/utente";
import Varco from "../models/varco";
import Database from "../utils/database";
import { HttpErrorFactory, HttpErrorCodes } from "../utils/errorHandler";

/**
 * Classe MultaRepository che gestisce le operazioni relative alle multe.
 */
class multaRepository {

    /**
     * Funzione per creare una nuova multa.
     * 
     * @param item - L'oggetto parziale della multa da creare.
     * @returns - Una promessa che risolve con la nuova multa creata.
     */
    public async create(item: MultaCreationAttributes): Promise<Multa> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const nuovaMulta = await multaDao.create(item, { transaction });
            await transaction.commit();
            return nuovaMulta;
        } catch (error) {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione della multa con ID ${item.id_multa}.`);
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
    public async getMulteByTargheEPeriodo(targhe: string[], dataIn: string, dataOut: string, utente: { id: number, ruolo: string }): Promise<any[]> {
        try {
            console.log(`Recuperando le multe per le targhe ${targhe.join(", ")} nel periodo ${dataIn} - ${dataOut}.`);
            const multe = await multaDao.getMulteByTargheEPeriodo(targhe, dataIn, dataOut, utente);
            console.log(multe)
            const multeComplete = await this.enrichMulte(multe);
            console.log(multeComplete)
            return multeComplete;
        } catch (error) {
            throw HttpErrorFactory.createError(
                HttpErrorCodes.InternalServerError,
                `Errore nel recupero delle multe per le targhe ${targhe.join(", ")} nel periodo ${dataIn} - ${dataOut}.`);
        }
    }

    private async enrichMulte(multe: Multa[]) {
        const multaCompleta = await Promise.all(multe.map(async m => {
            const transito = await Transito.findByPk(m.transito);
            if (!transito) return null;
            const tratta = await Tratta.findByPk(transito.tratta);
            if (!tratta) return null;
            const varcoIn = await Varco.findByPk(tratta.varco_in);
            if (!varcoIn) return null;
            const varcoOut = await Varco.findByPk(tratta.varco_out);
            if (!varcoOut) return null;
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