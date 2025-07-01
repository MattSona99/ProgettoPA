import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../utils/database';
import TipoVeicolo from './tipoVeicolo';
import Utente from './utente';


const sequelize = Database.getInstance();

// Interfaccia per le proprietà del modello Veicolo
export interface VeicoloAttributes {
  targa: string;
  tipo_veicolo: number;
  utente: number;
}

// Interfaccia per le proprietà di creazione del modello Veicolo
export interface VeicoloCreationAttributes extends Optional<VeicoloAttributes, 'targa'> {}

// Implementazione del modello Veicolo
class Veicolo extends Model<VeicoloAttributes, VeicoloCreationAttributes> implements VeicoloAttributes {
  public targa!: string;
  public tipo_veicolo!: number;
  public utente!: number;
}

// Inizializzazione del modello Veicolo
Veicolo.init(
  {
    targa: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    tipo_veicolo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TipoVeicolo,
        key: 'id_tipo_veicolo'
      }
    },
    utente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Utente,
        key: 'id_utente'
      }
    }
  },
  {
    sequelize,
    tableName: 'veicolo',
    timestamps: false
  }
);

export default Veicolo;
