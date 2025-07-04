import Transito, { TransitoAttributes, TransitoCreationAttributes } from '../models/transito';
import transitoDao from '../dao/transitoDao';
import Database from '../utils/database';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';
import Varco from '../models/varco';
import multaDao from '../dao/multaDao';
import Multa, { MultaCreationAttributes } from '../models/multa';
import Tesseract from 'tesseract.js';
import trattaDao from '../dao/trattaDao';
import veicoloDao from '../dao/veicoloDao';
import tipoVeicoloDao from '../dao/tipoVeicoloDao';
import varcoDao from '../dao/varcoDao';
import Veicolo from '../models/veicolo';
import Tratta from '../models/tratta';
import TipoVeicolo from '../models/tipoVeicolo';
import { v4 as uuidv4 } from 'uuid';

/**
 * Classe TransitoRepository che gestisce le operazioni relative ai transiti.
 */
class TransitoRepository {

    /**
     * Funzione per ottenere tutti i transiti.
     * 
     * @returns - Una promessa che risolve con un array di transiti.
     */
    public async getAllTransiti(): Promise<Transito[]> {
        try {
            return await transitoDao.getAll();
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero dei transiti.");
        }
    }
    /**
     * Funzione per ottenere un transito da un ID.
     * 
     * @param id - L'ID del transito da recuperare.
     * @returns - Una promessa che risolve con il transito trovato.
     */
    public async getTransitoById(id: number): Promise<Transito | null> {
        try {
            const transito = await transitoDao.getById(id);
            if (!transito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Transito con ID ${id} non trovato.`);
            }
            return await this.enrichTransito(transito);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero del transito con ID ${id}.`);
        }
    }

    /**
     * Funzione per creare un nuovo transito.
     * 
     * @param transito - L'oggetto transito da creare.
     * @param ruolo - Il ruolo dell'utente.
     * @returns - Una promessa che risolve con il transito creato.
     */
    public async createTransito(transito: TransitoCreationAttributes, ruolo: Varco | null = null): Promise<{ transito: Transito | null, multa: Multa | null }> {
        const response = {
            transito: null as Transito | null,
            multa: null as Multa | null
        };
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            // Controllo se il veicolo esiste
            const existingVeicolo = await veicoloDao.getById(transito.targa);
            if (!existingVeicolo) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Veicolo con targa ${transito.targa} non trovato.`);
            }

            // Controllo se il tipo di veicolo esiste e ne ricavo il limite di velocità
            const tipoVeicolo = await tipoVeicoloDao.getById(existingVeicolo.tipo_veicolo);
            if (!tipoVeicolo) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tipo di veicolo con ID ${existingVeicolo.tipo_veicolo} non trovato.`);
            }

            // Controllo se la tratta esiste
            const existingTratta = await trattaDao.getById(transito.tratta);
            if (!existingTratta) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Tratta con ID ${transito.tratta} non trovata.`);
            }

            // Controllo se i varchi esistono
            const varcoIn = await varcoDao.getById(existingTratta.varco_in);
            const varcoOut = await varcoDao.getById(existingTratta.varco_out);

            if (!varcoIn || !varcoOut) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Uno dei varchi della tratta con ID ${transito.tratta} non è stato trovato.`);
            }
            console.log(varcoIn.pioggia, varcoOut.pioggia)

            // Se entrambi i varchi hanno pioggia, la velocità consentita viene ridotta di 20km/h
            let limiteVelocita = tipoVeicolo.limite_velocita;
            if (varcoIn.pioggia && varcoOut.pioggia) {
                limiteVelocita -= 20;
            }
            console.log(limiteVelocita);

            // Calcolo della velocità media e del delta
            const transitoCompleto = await this.calcoloVelocita(transito, limiteVelocita, existingTratta.distanza);

            // Se il ruolo è 'operatore', si forza l'inserimento del transito
            if (ruolo === null) {
                const newTransito = await transitoDao.create(transitoCompleto, { transaction });
                if (!newTransito) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, `Errore nella creazione del transito con ID ${transito.id_transito}.`);
                }
                response['transito'] = newTransito;

                // Se il transito ha una velocità superiore a quella consentita, si crea una multa
                if (newTransito.delta_velocita > 0) { // Se il transito ha una velocità superiore a quella consentita, si crea una multa
                    const multa: MultaCreationAttributes = this.createMulta(newTransito);
                    const newMulta = await multaDao.create(multa, { transaction });
                    response['multa'] = newMulta;
                }

                await transaction.commit();
                return response;

            } else if (ruolo.smart) { // Se un varco è smart, si crea il transito
                const newTransito = await transitoDao.create(transitoCompleto, { transaction });
                if (!newTransito) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, `Errore nella creazione del transito con ID ${transito.id_transito}.`);
                }
                response['transito'] = newTransito;

                // Se il transito ha una velocità superiore a quella consentita, si crea una multa
                if (newTransito.delta_velocita > 0) {
                    const multa = this.createMulta(newTransito);
                    const newMulta = await multaDao.create(multa, { transaction });
                    response['multa'] = newMulta;
                }
                

                await transaction.commit();
                return response;
            } else { // Se il ruolo è di un varco non smart, non si può creare un transito
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, `Il varco non è di tipo smart, quindi non può creare transiti.`);
            }
        } catch  {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nella creazione del transito con ID ${transito.id_transito}.`);
        }
    }

    /**
     * Funzione per aggiornare un transito.
     * 
     * @param id - L'ID del transito da aggiornare.
     * @param transito - L'oggetto transito da aggiornare.
     * @returns - Una promessa che risolve con il numero di righe aggiornate e l'array di transiti aggiornati.
     */
    public async updateTransito(id: number, transito: TransitoCreationAttributes): Promise<[number, Transito[]]> {
        let tratta: Tratta | null = null;
        let veicolo: Veicolo | null = null;
        let tipoVeicolo: TipoVeicolo | null = null;
        try {
            // Controllo se il transito esiste
            const existingTransito = await transitoDao.getById(id);

            // Controllo se la tratta non sia vuota
            if (transito.tratta) {
                // Controllo se la tratta esiste
                tratta = await trattaDao.getById(transito.tratta);
            } else {
                tratta = await trattaDao.getById(existingTransito!.tratta);
            }

            // Controllo se la targa non sia vuota
            if (transito.targa) {
                // Controllo se il veicolo esiste dalla targa
                veicolo = await veicoloDao.getById(transito.targa);

                // Cerco il tipo di veicolo per prendere il limite di velocità
                tipoVeicolo = await tipoVeicoloDao.getById(veicolo!.tipo_veicolo);
            } else {
                // Prendo il veicolo dalla targa del transito esistente
                veicolo = await veicoloDao.getById(existingTransito!.targa);

                // Cerco il tipo di veicolo per prendere il limite di velocità
                tipoVeicolo = await tipoVeicoloDao.getById(veicolo!.tipo_veicolo);
            }

            // Controllo se la data di ingresso non sia vuota
            if (!transito.data_in) {
                transito.data_in = existingTransito!.data_in;
            }

            // Controllo se la data di uscita non sia vuota
            if (!transito.data_out) {
                transito.data_out = existingTransito!.data_out;
            }

            // Aggiorno il transito
            const transitoCompleto = await this.calcoloVelocita(transito, tipoVeicolo!.limite_velocita, tratta!.distanza);
            const transitoAggiornato: TransitoAttributes = {
                id_transito: id,
                tratta: tratta!.id_tratta,
                targa: veicolo!.targa,
                data_in: transitoCompleto.data_in,
                data_out: transitoCompleto.data_out,
                velocita_media: transitoCompleto.velocita_media ?? 0,
                delta_velocita: transitoCompleto.delta_velocita ?? 0
            }
            return await transitoDao.update(id, transitoAggiornato);
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del transito con ID ${id}.`);
        }
    }

    /**
     * Funzione per eliminare un transito.
     * 
     * @param id - L'ID del transito da eliminare.
     * @returns - Una promessa che risolve con il numero di righe eliminate.
     */
    public async deleteTransito(id: number): Promise<boolean> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const deleted = await transitoDao.delete(id, { transaction });
            if (!deleted) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, `Transito con ID ${id} non trovato.`);
            }
            await transaction.commit();
            return true;
        } catch {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del transito con ID ${id}.`);
        }
    }

    // HELPER PRIVATI

    /**
     * Funzione di stampa per le informazioni aggiuntive sui transiti.
     */
    private async enrichTransito(transito: Transito): Promise<any> {
        try {
            const tratta = await trattaDao.getById(transito.tratta);
            const veicolo = await Veicolo.findOne({ where: { targa: transito.targa } });
            const tipoVeicolo = await TipoVeicolo.findOne({ where: { id_tipo_veicolo: veicolo!.tipo_veicolo } });
            return {
                ...transito.dataValues,
                tratta: tratta ? tratta.dataValues : null,
                veicolo: veicolo ? veicolo.dataValues : null,
                tipoVeicolo: tipoVeicolo ? tipoVeicolo.dataValues : null
            };
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel recupero delle informazioni aggiuntive sul transito con ID ${transito.id_transito}.`);
        }
    }

    /**
     * Funzione di creazione di una multa associata al transito.
     * 
     * @param transito - Il transito associato alla multa.
     * @returns - L'oggetto parziale della multa da creare.
     */
    private createMulta(transito: Transito): MultaCreationAttributes {
        // Calcolo dell'importo della multa (esempio)
        let importo = 0;
        const delta = transito.delta_velocita;
        if (delta < 10) {
            importo = 100;
        }
        else if (delta < 20) {
            importo = 200;
        }
        else if (delta < 60) {
            importo = 600;
        }
        else {
            importo = 1000;
        }


        // Restituisci solo i campi richiesti da MultaCreationAttributes (senza id_multa e uuid_pagamento)
        return {
            transito: transito.id_transito,
            importo: importo,
            uuid_pagamento: uuidv4()
        };
    }

    /**
     * Funzione per processare l'immagine della targa.
     * 
     * @param file - Il file dell'immagine da processare
     * @returns - Una promessa che risolve con la targa o null.
     */
    public async processImage(file: any): Promise<string | null> {
        try {
            const { data: { text } } = await Tesseract.recognize(file, 'ita')
            const regex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/; // Regex per validare la targa italiana
            const match = text.match(regex);
            return match ? match[0] : null;
        } catch {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel processamento dell'immagine della targa.");
        }
    }

    /**
     * Funzione per calcolare la velocita media e la velocita media con la velocita limite.
     * 
     * @param transito - Il transito da cui calcolare la velocita media.
     * @param limiteVelocita - La velocita limite.
     * @param distanza - La distanza della tratta.
     * @returns - L'oggetto transito con la velocita media e la delta velocita.
     */
    private async calcoloVelocita(transito: TransitoCreationAttributes, limiteVelocita: number, distanza: number): Promise<TransitoCreationAttributes> { // Calcolo della velocita media 
        const tempoPercorrenza = ((transito.data_out.getTime() - transito.data_in.getTime()) / 1000) / 3600;
        const velocitaMedia = parseFloat((distanza / (tempoPercorrenza)).toFixed(5));
        const deltaVelocita = parseFloat((velocitaMedia - limiteVelocita).toFixed(5));
        return { ...transito, velocita_media: velocitaMedia, delta_velocita: deltaVelocita };
    }
}

export default new TransitoRepository();