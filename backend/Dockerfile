# Stage 1: build
FROM node:18 AS builder
WORKDIR /usr/src/app
COPY package*.json tsconfig.json ./
RUN npm install --save wait-port
COPY src ./src
RUN npm run build

# Stage 2: runtime
FROM node:18
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
CMD ["sh", "-c", "npx wait-port $DB_HOST:$DB_PORT && npm start"]

