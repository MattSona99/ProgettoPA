import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../utils/database';
import { RuoloUtente } from '../enums/RuoloUtente';

const sequelize = Database.getInstance();

// Interfaccia per le proprietà del modello Utente
export interface IUtenteAttributes {
  id_utente: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: string;
  tokens: number;
}

// Interfaccia per le proprietà di creazione del modello Utente
export interface IUtenteCreationAttributes extends Optional<IUtenteAttributes, 'id_utente' | 'tokens'> {}

// Implementazione del modello Utente
class Utente extends Model<IUtenteAttributes, IUtenteCreationAttributes> implements IUtenteAttributes {
  public id_utente!: number;
  public nome!: string;
  public cognome!: string;
  public email!: string;
  public ruolo!: RuoloUtente;
  public tokens!: number;
}

// Inizializzazione del modello Utente
Utente.init(
  {
    id_utente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cognome: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    ruolo: {
      type: DataTypes.ENUM(...Object.values(RuoloUtente)),
      allowNull: false
    },
    tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    }
  },
  {
    sequelize,
    tableName: 'utente',
    timestamps: false
  }
);

export default Utente;