import multaDao from "../dao/multaDao";
import transitoDao from "../dao/transitoDao";
import trattaDao from "../dao/trattaDao";
import Multa, { MultaCreationAttributes } from "../models/multa";
import { MultaAttributes } from "../models/multa";
import Utente from "../models/utente";
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
    public async getMulteByTargheEPeriodo(targhe: string[], dataIn: string, dataOut: string, utente: Utente): Promise<any[]> {
        try {
            return await multaDao.getMulteByTargheEPeriodo(targhe, dataIn, dataOut, utente);
        } catch (error) {
            throw HttpErrorFactory.createError(
                HttpErrorCodes.InternalServerError,
                `Errore nel recupero delle multe per le targhe ${targhe.join(", ")} nel periodo ${dataIn} - ${dataOut}.`);
        }
    }
}

export default new multaRepository();