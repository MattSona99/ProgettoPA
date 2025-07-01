import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../utils/database';

const sequelize = Database.getInstance();

// Interfaccia per le proprietà del modello TipoVeicolo
export interface TipoVeicoloAttributes {
  id_tipo_veicolo: number;
  tipo: string;
  limite_velocita: number;
}

// Interfaccia per le proprietà di creazione del modello TipoVeicolo
export interface TipoVeicoloCreationAttributes extends Optional<TipoVeicoloAttributes, 'id_tipo_veicolo'> {}

// Implementazione del modello TipoVeicolo
class TipoVeicolo extends Model<TipoVeicoloAttributes, TipoVeicoloCreationAttributes> implements TipoVeicoloAttributes {
  public id_tipo_veicolo!: number;
  public tipo!: string;
  public limite_velocita!: number;
}

// Inizializzazione del modello TipoVeicolo
TipoVeicolo.init(
  {
    id_tipo_veicolo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    limite_velocita: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'tipo_veicolo',
    timestamps: false
  }
);

export default TipoVeicolo;