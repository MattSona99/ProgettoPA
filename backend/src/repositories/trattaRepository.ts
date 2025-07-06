import trattaDao from "../dao/trattaDao";
import varcoDao from "../dao/varcoDao";
import Transito from "../models/transito";
import Tratta from "../models/tratta";
import { ITrattaAttributes, ITrattaCreationAttributes } from "../models/tratta";
import Varco from "../models/varco";
import Database from "../utils/database";
import { HttpErrorFactory, HttpErrorCodes, HttpError } from '../utils/errorHandler';

/**
 * Classe TrattaRepository che gestisce le operazioni relative alle tratte.
 */
class TrattaRepository {
    /**
     * Funzione per ottenere tutte le tratte.
     * 
     * @returns - Una promessa che risolve con un array di tratte.
     */
    public async getAllTratte() {
        const tratte = await trattaDao.getAll();

        return await Promise.all(tratte.map(tratta => this.enrichTratta(tratta)));
    }

    /**
     * Funzione per ottenere una tratta da un ID.
     * 
     * @param {number} id - L'ID della tratta da recuperare.
     * @returns - Una promessa che risolve con la tratta trovata o null se non trovata.
     */
    public async getTrattaById(id: number) {
        const tratta = await trattaDao.getById(id);

        return await this.enrichTratta(tratta);

    }

    /**
     * Funzione per creare una nuova tratta.
     * 
     * @param {ITrattaCreationAttributes} tratta - L'oggetto parziale della tratta da creare.
     * @returns {Promise<Tratta>} Una promessa che risolve con la nuova tratta creata.
     */
    public async createTratta(tratta: ITrattaCreationAttributes): Promise<Tratta> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const varcoIn = await varcoDao.getById(tratta.varco_in);
            const varcoOut = await varcoDao.getById(tratta.varco_out);
            if (!(varcoIn.nome_autostrada === varcoOut.nome_autostrada)) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "I varchi si devono trovare sulla stessa autostrada.");
            }
            const trattaCompleta = await this.completeTratta(tratta, varcoIn, varcoOut);
            const nuovaTratta = await trattaDao.create(trattaCompleta, { transaction });
            await transaction.commit();
            return nuovaTratta;
        } catch (error) {
            await transaction.rollback();
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiunta della tratta.");
            }
        }
    }

    /**
     * Funzione per aggiornare una tratta.
     * 
     * @param {number} id - L'ID della tratta da aggiornare.
     * @param {ITrattaAttributes} tratta - L'oggetto parziale della tratta da aggiornare.
     * @returns {Promise<[number, Tratta[]]>} Una promessa che risolve con il numero di righe aggiornate e un array di tratte aggiornate.
     */
    public async updateTratta(id: number, tratta: ITrattaAttributes): Promise<[number, Tratta[]]> {
        try {
            // Controlla se la tratta esiste
            const trattaToUpdate = await trattaDao.getById(id);

            // Controllo quali id dei varchi sono stati inseriti
            if (!tratta.varco_in && !tratta.varco_out) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Inserire almeno un varco.");
            }

            if (tratta.varco_in && !tratta.varco_out) {
                // Controllo se il varco IN inserito esiste
                const varcoIn = await varcoDao.getById(tratta.varco_in);

                // Controllo se il nuovo varco è uguale ad uno dei 2 precedenti
                if (varcoIn.id_varco === trattaToUpdate.varco_in || varcoIn.id_varco === trattaToUpdate.varco_out) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Il nuovo varco deve essere diverso dal precedente.");
                }

                // Controllo se il nuovo varco si trova sulla stessa autostrada
                const varcoOut = await varcoDao.getById(trattaToUpdate.varco_out);
                if (!(varcoIn.nome_autostrada === varcoOut?.nome_autostrada)) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "I varchi si devono trovare sulla stessa autostrada.");
                }

                // Completo e modifico il tratto
                const trattaModificata = await this.completeTratta(tratta, varcoIn, varcoOut);
                const trattaCompleta: ITrattaAttributes = {
                    ...trattaModificata,
                    id_tratta: id,
                    distanza: trattaModificata.distanza !== undefined ? trattaModificata.distanza : 0
                };
                return await trattaDao.update(id, trattaCompleta);
            }
            else if (tratta.varco_out && !tratta.varco_in) {
                // Controllo se il varco out esiste
                const varcoOut = await varcoDao.getById(tratta.varco_out);

                // Controllo se il nuovo varco é uguale al precedente
                if (varcoOut.id_varco === trattaToUpdate.varco_out || varcoOut.id_varco === trattaToUpdate.varco_in) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Il nuovo varco deve essere diverso dal precedente.");
                }

                // Controllo se il nuovo varco si trova sulla stessa autostrada
                const varcoIn = await varcoDao.getById(trattaToUpdate.varco_in);
                if (!(varcoOut.nome_autostrada === varcoIn?.nome_autostrada)) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "I varchi si devono trovare sulla stessa autostrada.");
                }

                // Completo e modifico il tratto
                const trattaModificata = await this.completeTratta(tratta, varcoIn, varcoOut);
                const trattaCompleta: ITrattaAttributes = {
                    ...trattaModificata,
                    id_tratta: id,
                    distanza: trattaModificata.distanza ? trattaModificata.distanza : 0
                };
                return await trattaDao.update(id, trattaCompleta);
            }
            // Controllo se entrambi i varchi esistono
            const varcoOut = await varcoDao.getById(tratta.varco_out);
            const varcoIn = await varcoDao.getById(tratta.varco_in);

            // Controllo che i 2 varchi non siano uguali
            if (varcoOut.id_varco === varcoIn.id_varco) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "I due varchi devono essere diversi tra loro.");
            }

            // Controllo se i nuovi varchi sono uguali ai precedenti
            if (
                (varcoOut.id_varco === trattaToUpdate.varco_out
                    || varcoOut.id_varco === trattaToUpdate.varco_in)
                && (varcoIn.id_varco === trattaToUpdate.varco_out
                    || varcoIn.id_varco === trattaToUpdate.varco_in)
            ) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Almeno uno dei 2 varchi deve essere diverso dal precedente.");
            }

            // Controllo se i nuovo varchi si trovano sulla stessa autostrada
            if (!(varcoOut.nome_autostrada === varcoIn.nome_autostrada)) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "I varchi si devono trovare sulla stessa autostrada.");
            }

            // Completo e modifico il tratto
            const trattaModificata = await this.completeTratta(tratta, varcoIn, varcoOut);
            const trattaCompleta: ITrattaAttributes = {
                ...trattaModificata,
                id_tratta: id,
                distanza: trattaModificata.distanza ? trattaModificata.distanza : 0
            };
            return await trattaDao.update(id, trattaCompleta);

        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento della tratta con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per eliminare una tratta.
     * 
     * @param {number} id - L'ID della tratta da eliminare.
     * @returns {Promise<[number, Tratta]>} Una promessa che risolve con il numero di righe eliminate.
     */
    public async deleteTratta(id: number): Promise<[number, Tratta]> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const transito = await Transito.findOne({ where: { tratta: id } });
            if (transito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Non e' possibile eliminare una tratta perchè associata ad un transito.");
            }
            const [rows, deletedTransito] = await trattaDao.delete(id);
            await transaction.commit();
            return [rows, deletedTransito];
        } catch (error) {
            await transaction.rollback();
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione della tratta con ID ${id}.`);
            }
        }
    }

    // HELPER PRIVATI

    /**
     * Funzione di stampa per le informazioni aggiuntive sulle tratte.
     * 
     * @param {Tratta} tratta - L'oggetto parziale della tratta da creare.
     * @returns - Una promessa che risolve con l'oggetto completo della tratta.
     */
    private async enrichTratta(tratta: Tratta) {
        const varco_in = await varcoDao.getById(tratta.varco_in);
        const varco_out = await varcoDao.getById(tratta.varco_out);
        return {
            ...tratta.dataValues,
            varco_in: varco_in,
            varco_out: varco_out
        }
    };

    /**
     * Funzione per completare la tratta calcolando la distanza.
     * 
     * @param tratta - L'oggetto parziale della tratta da creare.
     * @param varcoIn - Il varco di ingresso.
     * @param varcoOut  - Il varco di uscita.
     * @returns {ITrattaCreationAttributes} L'oggetto completo della tratta.
     */
    private async completeTratta(tratta: ITrattaCreationAttributes, varcoIn: Varco, varcoOut: Varco): Promise<ITrattaCreationAttributes> {
        const distanza = Math.abs(varcoIn.km - varcoOut.km);
        return { ...tratta, varco_in: varcoIn.id_varco, varco_out: varcoOut.id_varco, distanza: distanza };
    }
}

export default new TrattaRepository();