import Varco from '../models/varco';
import varcoDao from '../dao/varcoDao';

class VarcoRepository {
    public async findVarco(id: number): Promise<Varco | undefined> {
        try{
            const varco = await varcoDao.getById(id);
            if (!varco) {
                return undefined; // Se il varco non esiste, ritorna undefined
            }
            return varco;
        } catch (error) {
            throw new Error("Errore nel recupero del varco");
        }
    }
}

export const varcoRepository = new VarcoRepository();
