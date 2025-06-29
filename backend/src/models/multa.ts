import { DataTypes, Model } from 'sequelize';
import Database from '../utils/database';
import Transito from './transito';

const sequelize = Database.getInstance();

// Interfaccia per le proprietà del modello Multa
export interface MultaAttributes {
  id_multa: number;
  uuid_pagamento: string;
  transito: number;
  importo: number;
}

// Implementazione del modello Multa
class Multa extends Model<MultaAttributes> implements MultaAttributes {
  public id_multa!: number;
  public uuid_pagamento!: string;
  public transito!: number;
  public importo!: number;
}

// Inizializzazione del modello Multa
Multa.init(
  {
    id_multa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    uuid_pagamento: {
      type: DataTypes.UUID,
    },
    transito: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Transito,
        key: 'id_transito'
      }
    },
    importo: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'multa',
    timestamps: false
  }
);

export default Multa;