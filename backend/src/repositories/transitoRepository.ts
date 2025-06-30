import Transito from '../models/transito';
import transitoDao from '../dao/transitoDao';
import Database from '../utils/database';
import { HttpErrorFactory, HttpErrorCodes } from '../utils/errorHandler';
import Varco from '../models/varco';
import multaDao from '../dao/multaDao';
import { MultaAttributes } from '../models/multa';

class TransitoRepository {

    public async findTransito(id: number): Promise<Transito | null> {
        try {
            const transito = await transitoDao.getById(id);
            if (!transito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato.");
            }
            return transito;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nel recupero del transito.");
        }
    }

    public async createTransito(transito: Transito, ruolo: Varco | null = null): Promise<Transito> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            // Se il ruolo è 'operatore', si forza l'inserimento del transito
            if (ruolo === null) {
                const newTransito = await transitoDao.create(transito, { transaction });
                if (!newTransito) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Errore nella creazione del transito.");
                }
                if (newTransito.delta_velocita > 0) { // Se il transito ha una velocità superiore a quella consentita, si crea una multa
                    const multa: MultaAttributes = this.createMulta(newTransito);
                    await multaDao.create(multa, { transaction });
                }
                await transaction.commit();
                return newTransito;
            } else if (ruolo.smart) { // Se il ruolo è di un varco smart, si crea il transito
                const newTransito = await transitoDao.create(transito, { transaction });
                if (!newTransito) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Errore nella creazione del transito.");
                }
                if (newTransito.delta_velocita > 0) { // Se il transito ha una velocità superiore a quella consentita, si crea una multa
                    const multa: MultaAttributes = this.createMulta(newTransito);
                    await multaDao.create(multa, { transaction });
                }
                await transaction.commit();
                return newTransito;
            } else { // Altrimenti, si crea il transito con l'id del varco
                const newTransito = await transitoDao.create(transito, { transaction });
                if (!newTransito) {
                    throw HttpErrorFactory.createError(HttpErrorCodes.BadRequest, "Errore nella creazione del transito.");
                }
                if (newTransito.delta_velocita > 0) { // Se il transito ha una velocità superiore a quella consentita, si crea una multa
                    const multa: MultaAttributes = this.createMulta(newTransito);
                    await multaDao.create(multa, { transaction });
                }
                await transaction.commit();
                return newTransito;
            }
        } catch (error) {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione del transito.");
        }
    }

    public async updateTransito(id: number, transitoData: Transito): Promise<[number, Transito[]]> {
        try {
            const updatedTransito = await transitoDao.update(id, transitoData);
            if (!updatedTransito) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato.");
            }
            return updatedTransito;
        } catch (error) {
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nell'aggiornamento del transito.");
        }
    }

    public async deleteTransito(id: number): Promise<boolean> {
        const sequelize = Database.getInstance();
        const transaction = await sequelize.transaction();
        try {
            const deleted = await transitoDao.delete(id, { transaction });
            if (!deleted) {
                throw HttpErrorFactory.createError(HttpErrorCodes.NotFound, "Transito non trovato.");
            }
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella cancellazione del transito.");
        }
    }

    private createMulta(transito: Transito): MultaAttributes {
        // Creazione di una multa associata al transito
        const costoMulta = transito.delta_velocita * 10; // Esempio di calcolo del costo della multa
        return {
            id_multa: 0, 
            uuid_pagamento: '', // Generato successivamente
            transito: transito.id_transito,
            importo: costoMulta
        };
    }
}

export default new TransitoRepository();