# Stage 1: build
FROM node:18 AS builder
WORKDIR /usr/src/app

# Copio solo i package.json + tsconfig
COPY package*.json tsconfig.json ./

# Installa tutte le dipendenze e aspetta la disponibilità del db
RUN npm install --save wait-port

# Copio il sorgente TS e compilo
COPY src ./src
RUN npm run build  

# Stage 2: runtime
FROM node:18
WORKDIR /usr/src/app

# Copio solo quello che serve in produzione
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# all’avvio, aspetto che il database sia pronto, poi lancio il server compilato
CMD ["sh", "-c", "npx wait-port $DB_HOST:$DB_PORT && npm start"]

