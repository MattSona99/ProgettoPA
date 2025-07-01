import { DataTypes, Model, Optional } from 'sequelize';
import Database from '../utils/database';

const sequelize = Database.getInstance();

// Interfaccia per le proprietà del modello Utente
export interface UtenteAttributes {
  id_utente: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: string;
  tokens: number;
}

// Interfaccia per le proprietà di creazione del modello Utente
export interface UtenteCreationAttributes extends Optional<UtenteAttributes, 'id_utente' | 'tokens'> {}

// Implementazione del modello Utente
class Utente extends Model<UtenteAttributes, UtenteCreationAttributes> implements UtenteAttributes {
  public id_utente!: number;
  public nome!: string;
  public cognome!: string;
  public email!: string;
  public ruolo!: string;
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
      type: DataTypes.ENUM('automobilista', 'operatore', 'varco'),
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