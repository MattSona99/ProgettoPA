// Configurazione della connessione al dataabase con Sequelize
// Utilizza il file .env per le credenziali

import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Caricamento delle variabili d'ambiente dal file .env
dotenv.config();

class Database {
	private static instance: Sequelize;

	// Costrutore privato per evitare l'acceso esterno
	private constructor() { }

	// Metodo per ottenere l'istanza del database (singleton)
	public static getInstance(): Sequelize {
		if (!Database.instance) {
			const dbName: string = process.env.DB_NAME || '';
			const dbUser: string = process.env.DB_USER || '';
			const dbPassword: string = process.env.DB_PASSWORD || '';
			const dbHost: string = process.env.DB_HOST|| '';
			const dbPort: number = Number(process.env.DB_PORT || '');

			Database.instance = new Sequelize({
				database: dbName,
				username: dbUser,
				password: dbPassword,
				host: dbHost,
				port: dbPort,
				dialect: 'postgres',
				pool: {
					max: 5,
					min: 0,
					acquire: 30000,
					idle: 10000
				}
			});
		}
		return Database.instance;
	}
}

export default Database;