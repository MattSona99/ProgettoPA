import { DataTypes, Model } from 'sequelize';
import Database from '../utils/database';
import Utente from './utente';

const sequelize = Database.getInstance();

// Interfaccia per le proprietà del modello Varco
export interface VarcoAttributes {
  id_varco: number;
  nome_autostrada: string;
  km: number;
  smart: boolean;
  pioggia: boolean;
  utente: number;
}

// Implementazione del modello Varco
class Varco extends Model<VarcoAttributes> implements VarcoAttributes {
  public id_varco!: number;
  public nome_autostrada!: string;
  public km!: number;
  public smart!: boolean;
  public pioggia!: boolean;
  public utente!: number;
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
    tableName: 'varco',
    timestamps: false
  }
);

export default Varco;
