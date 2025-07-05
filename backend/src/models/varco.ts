import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../utils/database';

const sequelize = Database.getInstance();

// Interfaccia per le proprietà del modello Varco
export interface IVarcoAttributes {
  id_varco: number;
  nome_autostrada: string;
  km: number;
  smart: boolean;
  pioggia: boolean;
}

// Interfaccia per le proprietà di creazione del modello Varco
export interface IVarcoCreationAttributes extends Optional<IVarcoAttributes, 'id_varco'> {}

// Implementazione del modello Varco
class Varco extends Model<IVarcoAttributes, IVarcoCreationAttributes> implements IVarcoAttributes {
  public id_varco!: number;
  public nome_autostrada!: string;
  public km!: number;
  public smart!: boolean;
  public pioggia!: boolean;
}

// Inizializzazione del modello Varco
Varco.init(
  {
    id_varco: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome_autostrada: {
      type: DataTypes.STRING,
      allowNull: false
    },
    km: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    smart: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    pioggia: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'varco',
    timestamps: false
  }
);

export default Varco;
