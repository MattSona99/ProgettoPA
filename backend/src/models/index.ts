import Database from '../utils/database';
import Utente from './utente';
import Varco from './varco';
import IsVarco from './isVarco';
import TipoVeicolo from './tipoVeicolo';
import Veicolo from './veicolo';
import Tratta from './tratta';
import Transito from './transito';
import Multa from './multa';

const sequelize = Database.getInstance();

/**
 * Inizializzazione delle relazioni tra i modelli
 */

// Un Utente può avere molti Veicoli
Utente.hasMany(Veicolo, { foreignKey: 'utente' });
Veicolo.belongsTo(Utente, { foreignKey: 'utente' });

// Un Utente può avere solo un Varco
Utente.hasOne(IsVarco, { foreignKey: 'id_utente' });
IsVarco.belongsTo(Utente, { foreignKey: 'id_utente' });

// Un Varco può avere solo un Utente
Varco.hasOne(IsVarco, { foreignKey: 'id_varco' });
IsVarco.belongsTo(Varco, { foreignKey: 'id_varco' });

// Un TipoVeicolo può essere associato a molti Veicoli
TipoVeicolo.hasMany(Veicolo, { foreignKey: 'tipo_veicolo' });
Veicolo.belongsTo(TipoVeicolo, { foreignKey: 'tipo_veicolo' });

// Un Varco può essere presente in molte Tratte
Varco.hasMany(Tratta, { foreignKey: 'varco' });
Tratta.belongsTo(Varco, { foreignKey: 'varco' });

// Una Tratta può avere molti Transiti
Tratta.hasMany(Transito, { foreignKey: 'tratta' });
Transito.belongsTo(Tratta, { foreignKey: 'tratta' });

// Un Veicolo può avere molti Transiti
Veicolo.hasMany(Transito, { foreignKey: 'veicolo' });
Transito.belongsTo(Veicolo, { foreignKey: 'veicolo' });

// Un Transito può avere una sola Multa
Transito.hasOne(Multa, { foreignKey: 'transito' });
Multa.belongsTo(Transito, { foreignKey: 'transito' });

// Creazione delle istanze del database e dei modelli
const db = {
  sequelize,
  Utente,
  Varco,
  IsVarco,
  TipoVeicolo,
  Veicolo,
  Tratta,
  Transito,
  Multa
};

// Sincronizzazione dei modelli con il database
export const initModels = async () => {
    // { alter: true } per aggiornare le tabelle esistenti
    await sequelize.sync({ alter: true });
};

export default db;