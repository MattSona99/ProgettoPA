import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../utils/database';
import Veicolo from './veicolo';
import Tratta from './tratta';

const sequelize = Database.getInstance();

// Interfaccia per le proprietà del modello Transito
export interface ITransitoAttributes {
    id_transito: number;
    targa: string; // Riferimento alla targa del veicolo
    tratta: number; // Riferimento all'ID della tratta
    data_in: Date;
    data_out: Date;
    // Da calcolare in  fase di logica
    velocita_media: number; 
    delta_velocita: number;
}

// Interfaccia per le proprietà di creazione del modello Transito
export interface ITransitoCreationAttributes extends Optional<ITransitoAttributes, 'id_transito' | 'velocita_media' | 'delta_velocita'> {}

// Implementazione del modello Transito
class Transito extends Model<ITransitoAttributes, ITransitoCreationAttributes> implements ITransitoAttributes {
    public id_transito!: number;
    public targa!: string;
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
    targa: {
      type: DataTypes.STRING,
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