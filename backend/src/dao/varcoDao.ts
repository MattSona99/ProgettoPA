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
}

export const varcoDao = new VarcoDao();
