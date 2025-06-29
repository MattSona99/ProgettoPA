import Varco from '../models/varco';
import varcoDao from '../dao/varcoDao';

class VarcoRepository {
    public async findVarco(id: number): Promise<Varco | null> {
        try{
            const varco = await varcoDao.getById(id);
            if (!varco) {
                throw new Error("Varco con id " + id + " non trovato");
            }
            return varco;
        } catch (error) {
            throw new Error("Errore nel recupero del varco");
        }
    }
}

export default new VarcoRepository();
