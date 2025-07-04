import trattaDao from "../dao/trattaDao";
import varcoDao from "../dao/varcoDao";
import Transito from "../models/transito";
import Tratta from "../models/tratta";
import { TrattaAttributes, TrattaCreationAttributes } from "../models/tratta";
import Varco from "../models/varco";
import Database from "../utils/database";
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';

/**
 * Classe TrattaRepository che gestisce le operazioni relative alle tratte.
 */
class TrattaRepository {
    /**
     * Funzione per ottenere tutte le tratte.
     * 
     * @returns {Promise<Tratta[]>} Una promessa che risolve con un array di tratte.
     */
    public async getAllTratte(): Promise<Tratta[]> {
        try {
            const tratte = await trattaDao.getAll();
            return await Promise.all(tratte.map(tratta => this.enrichTratta(tratta)));
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle tratte.");
        }
    }

    /**
     * Funzione per ottenere una tratta da un ID.
     * 
     * @param {number} id - L'ID della tratta da recuperare.
     * @returns {Promise<Tratta | null>} Una promessa che risolve con la tratta trovata o null se non trovata.
     */
    public async getTrattaById(id: number): Promise<Tratta | null> {
        try {
            const tratta = await trattaDao.getById(id);
            if (!tratta) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tratta con ID ${id} non trovata.`);
            }
            return await this.enrichTratta(tratta);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero della tratta con ID ${id}.`);
        }
    }

    /**
     * Funzione per creare una nuova tratta.
     * 
     * @param {TrattaCreationAttributes} tratta - L'oggetto parziale della tratta da creare.
     * @returns {Promise<Tratta>} Una promessa che risolve con la nuova tratta creata.
     */
    public async createTratta(tratta: TrattaCreationAttributes): Promise<Tratta> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const varcoIn = await varcoDao.getById(tratta.varco_in);
            const varcoOut = await varcoDao.getById(tratta.varco_out);
            if (!varcoIn || !varcoOut) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco in o varco out non trovati.");
            }
            if (!(varcoIn.nome_autostrada === varcoOut.nome_autostrada)) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "I varchi si devono trovare sulla stessa autostrada.");
            }
            const trattaCompleta = this.completeTratta(tratta, varcoIn, varcoOut);
            const nuovaTratta = await trattaDao.create(trattaCompleta, { transaction });
            await transaction.commit();
            return nuovaTratta;
        } catch {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione della tratta.`);
        }
    }

    /**
     * Funzione per aggiornare una tratta.
     * 
     * @param {number} id - L'ID della tratta da aggiornare.
     * @param {TrattaAttributes} tratta - L'oggetto parziale della tratta da aggiornare.
     * @returns {Promise<number>} Una promessa che risolve con il numero di righe aggiornate.
     */
    public async updateTratta(id: number, tratta: TrattaAttributes): Promise<[number, Tratta[]]> {
        try {
            // Controlla se la tratta esiste
            const trattaToUpdate = await trattaDao.getById(id);
            if (!trattaToUpdate) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tratta con ID ${id} non trovata.`);
            }

            // Controllo quali id dei varchi sono stati inseriti
            if (!tratta.varco_in && !tratta.varco_out) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Devi inserire almeno un varco.");
            }

            if (tratta.varco_in && !tratta.varco_out) {
                // Controllo se il varco in esiste
                const varcoIn = await varcoDao.getById(tratta.varco_in);
                if (!varcoIn) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco in non trovato.");
                }

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
                const trattaModificata = this.completeTratta(tratta, varcoIn, varcoOut);
                const trattaCompleta: TrattaAttributes = {
                    ...trattaModificata,
                    id_tratta: id,
                    distanza: trattaModificata.distanza !== undefined ? trattaModificata.distanza : 0
                };
                return await trattaDao.update(id, trattaCompleta);
            }
            else if (tratta.varco_out && !tratta.varco_in) {
                // Controllo se il varco out esiste
                const varcoOut = await varcoDao.getById(tratta.varco_out);
                if (!varcoOut) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Varco out non trovato.");
                }

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
                const trattaModificata = this.completeTratta(tratta, varcoIn, varcoOut);
                const trattaCompleta: TrattaAttributes = {
                    ...trattaModificata,
                    id_tratta: id,
                    distanza: trattaModificata.distanza ? trattaModificata.distanza : 0
                };
                return await trattaDao.update(id, trattaCompleta);
            }
            // Controllo se entrambi i varchi esistono
            const varcoOut = await varcoDao.getById(tratta.varco_out);
            const varcoIn = await varcoDao.getById(tratta.varco_in);
            if (!varcoOut || !varcoIn) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Almeno uno dei 2 varchi non esiste.");
            }

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
            const trattaModificata = this.completeTratta(tratta, varcoIn, varcoOut);
            const trattaCompleta: TrattaAttributes = {
                ...trattaModificata,
                id_tratta: id,
                distanza: trattaModificata.distanza ? trattaModificata.distanza : 0
            };
            return await trattaDao.update(id, trattaCompleta);

        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento della tratta con ID ${id}.`);
        }
    }

    /**
     * Funzione per eliminare una tratta.
     * 
     * @param {number} id - L'ID della tratta da eliminare.
     * @returns {Promise<number>} Una promessa che risolve con il numero di righe eliminate.
     */
    public async deleteTratta(id: number): Promise<number> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const transito = await Transito.findOne({ where: { tratta: id } });
            if (transito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Non e' possibile eliminare una tratta perchè associata ad un transito.");
            }
            const deleted = await trattaDao.delete(id);
            await transaction.commit();
            return deleted;
        } catch {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione della tratta con ID ${id}.`);
        }
    }

    // HELPER PRIVATI

    /**
     * Funzione di stampa per le informazioni aggiuntive sulle tratte.
     */
    private async enrichTratta(tratta: Tratta): Promise<any> {
        try {
            const varco_in = await varcoDao.getById(tratta.varco_in);
            const varco_out = await varcoDao.getById(tratta.varco_out);
            return {
                ...tratta.dataValues,
                varco_in: varco_in ? varco_in.dataValues : null,
                varco_out: varco_out ? varco_out.dataValues : null
            }
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero delle tratte.");
        }
    };

    private completeTratta(tratta: TrattaCreationAttributes, varcoIn: Varco, varcoOut: Varco): TrattaCreationAttributes {
        const distanza = Math.abs(varcoIn.km - varcoOut.km);
        return { ...tratta, varco_in: varcoIn.id_varco, varco_out: varcoOut.id_varco, distanza: distanza };
    }
}

export default new TrattaRepository();