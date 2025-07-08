import Transito, { ITransitoAttributes, ITransitoCreationAttributes } from '../models/transito';
import transitoDao from '../dao/transitoDao';
import Database from '../utils/database';
import { HttpErrorFactory, HttpErrorCodes, HttpError } from '../utils/errorHandler';
import multaDao from '../dao/multaDao';
import Multa, { IMultaCreationAttributes } from '../models/multa';
import Tesseract from 'tesseract.js';
import trattaDao from '../dao/trattaDao';
import veicoloDao from '../dao/veicoloDao';
import tipoVeicoloDao from '../dao/tipoVeicoloDao';
import varcoDao from '../dao/varcoDao';
import Veicolo from '../models/veicolo';
import Tratta from '../models/tratta';
import TipoVeicolo from '../models/tipoVeicolo';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

/**
 * Classe TransitoRepository che gestisce le operazioni relative ai transiti.
 */
class TransitoRepository {

    /**
     * Funzione per ottenere tutti i transiti.
     * 
     * @returns {Promise<Transito[]>} - Una promessa che risolve con un array di transiti.
     */
    public async getAllTransiti(): Promise<Transito[]> {
        return await transitoDao.getAll();
    }
    /**
     * Funzione per ottenere un transito da un ID.
     * 
     * @param id - L'ID del transito da recuperare.
     * @returns - Una promessa che risolve con il transito trovato.
     */
    public async getTransitoById(id: number) {
        const transito = await transitoDao.getById(id);

        return await this.enrichTransito(transito);
    }

    /**
     * Funzione per creare un nuovo transito.
     * 
     * @param transito - L'oggetto transito da creare.
     * @returns {Promise<[Transito, Multa | null]>} - Una promessa che risolve con il transito creato e la multa associata se presente.
     */
    public async createTransito(transito: ITransitoCreationAttributes): Promise<[Transito, Multa | null]> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();

        // Controllo se il veicolo esiste
        const existingVeicolo = await veicoloDao.getById(transito.targa);

        // Controllo se il tipo di veicolo esiste e ne ricavo il limite di velocità
        const tipoVeicolo = await tipoVeicoloDao.getById(existingVeicolo!.tipo_veicolo);

        // Controllo se la tratta esiste
        const existingTratta = await trattaDao.getById(transito.tratta);

        // Controllo se i varchi esistono
        const varcoIn = await varcoDao.getById(existingTratta!.varco_in);
        const varcoOut = await varcoDao.getById(existingTratta!.varco_out);

        // Se entrambi i varchi hanno pioggia, la velocità consentita viene ridotta di 20km/h
        let limiteVelocita = tipoVeicolo.limite_velocita;
        if (varcoIn.pioggia && varcoOut.pioggia) {
            limiteVelocita -= 20;
        }

        // Calcolo della velocità media e del delta
        const transitoCompleto = await this.calcoloVelocita(transito, limiteVelocita, existingTratta.distanza);
        try {
            const existingTransito = await transitoDao.verifyCreateTransito(transitoCompleto);
            if (existingTransito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, `Il transito con targa ${existingTransito.targa}, tratta ${existingTransito.tratta}, data ingresso ${existingTransito.data_in} e data uscita ${existingTransito.data_out} esiste gia`);
            }

            const newTransito = await transitoDao.create(transitoCompleto, { transaction });

            // Se il transito ha una velocità superiore a quella consentita, si crea una multa
            if (newTransito.delta_velocita > 0) { // Se il transito ha una velocità superiore a quella consentita, si crea una multa
                const multa: IMultaCreationAttributes = this.createMulta(newTransito);
                const newMulta = await multaDao.create(multa, { transaction });
                await transaction.commit();
                return [newTransito, newMulta];
            }

            await transaction.commit();
            return [newTransito, null];
        } catch (error) {
            await transaction.rollback();
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nel creare il transito.`);
            }
        }
    }

    /**
     * Funzione per aggiornare un transito.
     * 
     * @param id - L'ID del transito da aggiornare.
     * @param transito - L'oggetto transito da aggiornare.
     * @returns {Promise<[number, Transito[]]>} - Una promessa che risolve con il numero di righe aggiornate e un array di transiti aggiornati.
     */
    public async updateTransito(id: number, transito: ITransitoCreationAttributes): Promise<[number, Transito[], Multa | null]> {
        let tratta: Tratta | null = null;
        let veicolo: Veicolo | null = null;
        let tipoVeicolo: TipoVeicolo | null = null;
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {

            // Controllo se il transito esiste
            const existingTransitoToUpdate = await transitoDao.getById(id);


            // Controllo se esiste una multa per il transito
            const existingMulta = await multaDao.getByTransito(id);
            if (existingMulta) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, `Il transito con ID ${id} è utilizzato in una multa. Non può essere aggiornato. Multa ID: ${existingMulta.id_multa}`);
            }

            // Controllo se la tratta non sia vuota
            if (transito.tratta) {
                // Controllo se la tratta esiste
                tratta = await trattaDao.getById(transito.tratta);
            } else {
                tratta = await trattaDao.getById(existingTransitoToUpdate!.tratta);
            }

            // Controllo se la targa non sia vuota
            if (transito.targa) {
                // Controllo se il veicolo esiste dalla targa
                veicolo = await veicoloDao.getById(transito.targa);

                // Cerco il tipo di veicolo per prendere il limite di velocità
                tipoVeicolo = await tipoVeicoloDao.getById(veicolo!.tipo_veicolo);
            } else {
                // Prendo il veicolo dalla targa del transito esistente
                veicolo = await veicoloDao.getById(existingTransitoToUpdate!.targa);

                // Cerco il tipo di veicolo per prendere il limite di velocità
                tipoVeicolo = await tipoVeicoloDao.getById(veicolo!.tipo_veicolo);
            }

            // Controllo se la data di ingresso non sia vuota
            if (!transito.data_in) {
                transito.data_in = existingTransitoToUpdate!.data_in;
            }

            // Controllo se la data di uscita non sia vuota
            if (!transito.data_out) {
                transito.data_out = existingTransitoToUpdate!.data_out;
            }

            // Aggiorno il transito
            const transitoCompleto = await this.calcoloVelocita(transito, tipoVeicolo!.limite_velocita, tratta!.distanza);
            const transitoAggiornato: ITransitoAttributes = {
                id_transito: id,
                tratta: tratta!.id_tratta,
                targa: veicolo!.targa,
                data_in: transitoCompleto.data_in,
                data_out: transitoCompleto.data_out,
                velocita_media: transitoCompleto.velocita_media ?? 0,
                delta_velocita: transitoCompleto.delta_velocita ?? 0
            }
            const [rows, updatedTransito] = await transitoDao.update(id, transitoAggiornato, { transaction });
            const existingTransito = await transitoDao.verifyUpdateTransito(updatedTransito[0]);
            if (existingTransito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, `Transito con ID ${existingTransito.id_transito} esiste già.`);
            }
            if (updatedTransito[0].delta_velocita >0){
                const multa: IMultaCreationAttributes = this.createMulta(updatedTransito[0]);
                const newMulta = await multaDao.create(multa, { transaction });
                await transaction.commit();
                return [rows, updatedTransito, newMulta];
            }

            await transaction.commit();
            return [rows, updatedTransito, null];
        } catch (error) {
            await transaction.rollback();
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'aggiornamento del transito con ID ${id}.`);
            }
        }
    }

    /**
     * Funzione per eliminare un transito.
     * 
     * @param id - L'ID del transito da eliminare.
     * @returns {Promise<[boolean, Transito]>} - Una promessa che risolve con il numero di righe eliminate e l'oggetto transito eliminato.
     */
    public async deleteTransito(id: number): Promise<[number, Transito]> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const existingMulta = await multaDao.getByTransito(id);
            if (existingMulta) {
                throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, `Il transito con ID ${id} è utilizzato in una multa. Non può essere eliminato. Multa ID: ${existingMulta.id_multa}`);
            }

            const [rows, deletedTransito] = await transitoDao.delete(id, { transaction });
            await transaction.commit();
            return [rows, deletedTransito];
        } catch (error) {
            await transaction.rollback();
            if (error instanceof HttpError) {
                throw error;
            } else {
                throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, `Errore nell'eliminazione del transito con ID ${id}.`);
            }
        }
    }

    // HELPER PRIVATI

    /**
     * Funzione di stampa per le informazioni aggiuntive sui transiti.
     * 
     * @param transito - Il transito da arricchire.
     */
    private async enrichTransito(transito: Transito) {
        const tratta = await trattaDao.getById(transito.tratta);
        const veicolo = await veicoloDao.getById(transito.targa);
        const tipoVeicolo = await tipoVeicoloDao.getById(veicolo!.tipo_veicolo);
        return {
            ...transito.dataValues,
            tratta: tratta ? tratta.dataValues : null,
            veicolo: veicolo ? veicolo.dataValues : null,
            tipoVeicolo: tipoVeicolo ? tipoVeicolo.dataValues : null
        };
    }

    /**
     * Funzione di creazione di una multa associata al transito.
     * 
     * @param transito - Il transito associato alla multa.
     * @returns {IMultaCreationAttributes} - L'oggetto parziale della multa da creare.
     */
    private createMulta(transito: Transito): IMultaCreationAttributes {
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


        // Vengono restituiti solo i campi richiesti da MultaCreationAttributes (senza id_multa e uuid_pagamento)
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
    public async processImage(file: Express.Multer.File): Promise<string | null> {
        try {
            // Preprocessing dell'immagine
            const preprocessedBuffer = await sharp(file.buffer)
                .greyscale()
                .sharpen()
                .toBuffer();

            const { data: { text } } = await Tesseract.recognize(
                preprocessedBuffer,
                'ita'
            )
            const regex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/; // Regex per validare la targa italiana
            console.log(text);
            const match = text.replace(/\s+/g, '').toUpperCase().match(regex);
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
    private async calcoloVelocita(transito: ITransitoCreationAttributes, limiteVelocita: number, distanza: number): Promise<ITransitoCreationAttributes> { // Calcolo della velocita media 
        const tempoPercorrenza = ((transito.data_out.getTime() - transito.data_in.getTime()) / 1000) / 3600;
        const velocitaMedia = parseFloat((distanza / (tempoPercorrenza)).toFixed(5));
        const deltaVelocita = parseFloat((velocitaMedia - limiteVelocita).toFixed(5));
        return { ...transito, velocita_media: velocitaMedia, delta_velocita: deltaVelocita };
    }
}

export default new TransitoRepository();