import { DataTypes, Model } from 'sequelize';
import Database from '../utils/database';

const sequelize = Database.getInstance();

// Interfaccia per le proprietà del modello IsVarco
export interface IIsVarcoAttributes {
    id_utente: number;
    id_varco: number;
}

// Implementazione del modello Multa
class IsVarco extends Model<IIsVarcoAttributes> implements IIsVarcoAttributes {
    public id_utente!: number;
    public id_varco!: number;
}

// Inizializzazione del modello Multa
IsVarco.init(
    {
        id_utente: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        id_varco: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    },
    {
        sequelize,
        tableName: 'is_varco',
        timestamps: false
    }
);

export default IsVarco;