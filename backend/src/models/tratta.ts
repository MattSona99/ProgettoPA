import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../utils/database';
import Varco from './varco';

const sequelize = Database.getInstance();

// Interfaccia per le proprietà del modello Tratta
export interface TrattaAttributes {
  id_tratta: number;
  varco_in: number;
  varco_out: number;
  distanza: number;
}
// Interfaccia per le proprietà di creazione del modello Tratta
export interface TrattaCreationAttributes extends Optional<TrattaAttributes, 'id_tratta'> {}

// Implementazione del modello Tratta
class Tratta extends Model<TrattaAttributes, TrattaCreationAttributes> implements TrattaAttributes {
  public id_tratta!: number;
  public varco_in!: number;
  public varco_out!: number;
  public distanza!: number;
}

// Inizializzazione del modello Tratta
Tratta.init(
  {
    id_tratta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    varco_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Varco,
        key: 'id_varco'
      }
    },
    varco_out: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Varco,
        key: 'id_varco'
      }
    },
    distanza: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'tratta',
    timestamps: false
  }
);

export default Tratta;