import Varco, { VarcoAttributes} from "../models/varco";
import { DAO } from "./daoInterface";

interface VarcoDAO extends DAO<VarcoAttributes, number>{
    // metodi da aggiungere nel caso specifico dei varchi
}

class VarcoDao implements VarcoDAO {
    public async getById(id: number): Promise<Varco | null> {
        try {
            const varco = await Varco.findByPk(id);
            if (!varco) {
                return null; // Se il varco non esiste, ritorna null
            }
            return varco;
        } catch (error) {
            throw new Error("Errore nel recupero del varco");
        }
    }

    public async getAll(): Promise<Varco[]> {
        try {
            return await Varco.findAll();
        } catch (error) {
            throw new Error("Errore nel recupero dei varchi");
        }
    }

    public async create(item: Varco): Promise<Varco> {
        try {
            return await Varco.create(item);
        } catch (error) {
            throw new Error("Errore nella creazione del varco");
        }
    }

    public async update(id: number, item: VarcoAttributes): Promise<[number, VarcoAttributes[]]> {
        try {
            const existingVarco = await Varco.findByPk(id);
            if (!existingVarco) {
                throw new Error("Varco non trovato");
            }
            const [affectedCount] = await Varco.update(item, {
                where: { id_varco: id },
                returning: true
            });
            const updatedItem = await Varco.findAll({where: { id_varco: id }});
            return [affectedCount, updatedItem];
        } catch (error) {
            throw new Error("Errore nell'aggiornamento del varco");
        }
    }

    public async delete(id: number): Promise<number> {
        try {
            const deletedCount = await Varco.destroy({
                where: { id_varco: id }
            });
            if (deletedCount === 0) {
                throw new Error("Varco non trovato");
            }
            return deletedCount;
        } catch (error) {
            throw new Error("Errore nella cancellazione del varco");
        }
    }
}

export default new VarcoDao();
