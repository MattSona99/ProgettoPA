import { DataTypes, Model } from 'sequelize';
import Database from '../utils/database';
import Veicolo from './veicolo';
import Tratta from './tratta';

const sequelize = Database.getInstance();

// Interfaccia per le proprietà del modello Transito
export interface TransitoAttributes {
    id_transito: number;
    veicolo: number;
    tratta: number;
    data_in: Date;
    data_out: Date;
    velocita_media: number;
    delta_velocita: number;
}

// Implementazione del modello Transito
class Transito extends Model<TransitoAttributes> implements TransitoAttributes {
    public id_transito!: number;
    public veicolo!: number;
    public tratta!: number;
    public data_in!: Date;
    public data_out!: Date;
    public velocita_media!: number;
    public delta_velocita!: number;
}

// Inizializzazione del modello Transito
Transito.init(
  {
    id_transito: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    veicolo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Veicolo,
        key: 'targa'
      }
    },
    tratta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Tratta,
        key: 'id_tratta'
      }
    },
    data_in: {
      type: DataTypes.DATE,
      allowNull: false
    },
    data_out: {
      type: DataTypes.DATE,
      allowNull: false
    },
    velocita_media: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    delta_velocita: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'transito',
    timestamps: false
  }
);

export default Transito;