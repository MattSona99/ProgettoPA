-- CREAZIONE TABELLE --

-- Abilita estensione per UUID in PostgreSQL --
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Creazione tabella UTENTE --
CREATE TABLE IF NOT EXISTS utente (
    id_utente SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    cognome VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    ruolo VARCHAR(50) CHECK (ruolo IN ('automobilista', 'operatore', 'varco')) NOT NULL
);

-- Creazione tabella VARCO --
CREATE TABLE IF NOT EXISTS varco (
    id_varco SERIAL PRIMARY KEY,
    nome_autostrada VARCHAR(100),
    km DOUBLE PRECISION,
    smart BOOLEAN,
    pioggia BOOLEAN DEFAULT FALSE
);

-- Creazione tabella IS_VARCO --
CREATE TABLE IF NOT EXISTS is_varco (
    id_utente INTEGER REFERENCES utente(id_utente),
    id_varco INTEGER REFERENCES varco(id_varco),
    PRIMARY KEY (id_utente, id_varco)
);

-- Creazione tabella TIPO_VEICOLO --
CREATE TABLE IF NOT EXISTS tipo_veicolo (
    id_tipo_veicolo SERIAL PRIMARY KEY,
    tipo VARCHAR(100),
    limite_velocita INTEGER
);

-- Creazione tabella VEICOLO --
CREATE TABLE IF NOT EXISTS veicolo (
    targa VARCHAR(8) PRIMARY KEY,
    tipo_veicolo INTEGER REFERENCES tipo_veicolo(id_tipo_veicolo),
    utente INTEGER REFERENCES utente(id_utente)
);

-- Creazione tabella TRATTA --
CREATE TABLE IF NOT EXISTS tratta (
    id_tratta SERIAL PRIMARY KEY,
    varco_in INTEGER REFERENCES varco(id_varco),
    varco_out INTEGER REFERENCES varco(id_varco),
    distanza DOUBLE PRECISION NOT NULL
);

-- Creazione tabella TRANSITO --
CREATE TABLE IF NOT EXISTS transito (
    id_transito SERIAL PRIMARY KEY,
    tratta INTEGER REFERENCES tratta(id_tratta),
    targa VARCHAR(8) REFERENCES veicolo(targa),
    data_in TIMESTAMP NOT NULL,
    data_out TIMESTAMP NOT NULL,
    velocita_media DOUBLE PRECISION NOT NULL,
    delta_velocita DOUBLE PRECISION NOT NULL
);

-- Creazione tabella MULTA --
CREATE TABLE IF NOT EXISTS multa (
    id_multa SERIAL PRIMARY KEY,
    uuid_pagamento UUID NOT NULL DEFAULT gen_random_uuid(),
    transito INTEGER REFERENCES transito(id_transito),
    importo DOUBLE PRECISION NOT NULL
);

-- SEEDING DEL DATABASE --

-- Inserimento dati tabella UTENTE --
INSERT INTO utente (nome, cognome, email, ruolo) VALUES
    ('Matteo', 'Sonaglioni', 'msonaglioni@example.com', 'automobilista'),
    ('Enzo', 'Cingoli', 'ecingoli@example.com', 'automobilista'),
    ('Giuseppe', 'Verdi', 'gverdi@example.com', 'automobilista'),
    ('Mario', 'Bianchi', 'mbianchi@example.com', 'automobilista'),
    ('Luigi', 'Verdi', 'lverdi@example.com', 'automobilista'),
    ('Mario', 'Rossi', 'mrossi@example.com', 'operatore'),
    ('', '', 'varco_1@example.com', 'varco'),
    ('', '', 'varco_2@example.com', 'varco'),
    ('', '', 'varco_3@example.com', 'varco'),
    ('', '', 'varco_4@example.com', 'varco'),
    ('', '', 'varco_5@example.com', 'varco'),
    ('', '', 'varco_6@example.com', 'varco'),
    ('', '', 'varco_7@example.com', 'varco'),
    ('', '', 'varco_8@example.com', 'varco');

-- Inserimento dati tabella VARCO --
INSERT INTO varco (nome_autostrada, km, smart, pioggia) VALUES
    ('A1', 10.5, TRUE, FALSE),
    ('A1', 50.2, TRUE, FALSE),
    ('A4', 120.3, FALSE, TRUE),
    ('A4', 160.8, FALSE, TRUE),
    ('A14', 75.0, TRUE, FALSE),
    ('A14', 125.6, TRUE, TRUE),
    ('A22', 40.1, FALSE, TRUE),
    ('A22', 89.7, FALSE, FALSE);

-- Inserimento dati tabella IS_VARCO --
INSERT INTO is_varco (id_utente, id_varco) VALUES
    (7, 2),
    (8, 3),
    (9, 4),
    (10, 5),
    (11, 6),
    (12, 7),
    (13, 8),
    (14, 1);

-- Inserimento dati tabella TIPO_VEICOLO --
INSERT INTO tipo_veicolo (tipo, limite_velocita) VALUES
    ('autovettura', 130),
    ('motociclo', 130),
    ('roulotte', 80),
    ('autocarri', 130),
    ('autobus', 100),
    ('pesante', 80),
    ('eccezionale', 60);

-- Inserimento dati tabella VEICOLO --
INSERT INTO veicolo (targa, tipo_veicolo, utente) VALUES
    ('AB123CD', 1, 1),
    ('EF456GH', 2, 2),
    ('IJ789KL', 3, 3),
    ('MN321OP', 4, 4),
    ('QR654ST', 5, 5),
    ('UV987WX', 6, 1),
    ('YZ741AB', 7, 2),
    ('CD852EF', 1, 3),
    ('GH963IJ', 2, 4),
    ('KL159MN', 3, 5);

-- Inserimento dati tabella TRATTA --
INSERT INTO tratta (varco_in, varco_out, distanza) VALUES
    (1, 2, 39.7),
    (3, 4, 40.5),
    (5, 6, 50.6),
    (7, 8, 49.6);

-- Inserimento dati tabella TRANSITO --
INSERT INTO transito (tratta, targa, data_in, data_out, velocita_media, delta_velocita) VALUES
-- Veicolo 1, tratta 1, limite 130
(1, 'AB123CD', '2025-06-28 08:00:00', '2025-06-28 08:40:00', 39.7 / (40.0/60), (39.7 / (40.0/60)) - 130), -- sotto limite (~59.55 km/h)
-- Veicolo 2, tratta 1, limite 130
(1, 'EF456GH', '2025-06-28 09:00:00', '2025-06-28 09:15:00', 39.7 / (15.0/60), (39.7 / (15.0/60)) - 130), -- sopra limite (~158.8 km/h)
-- Veicolo 3, tratta 2, limite 80 - 20 = 60
(2, 'IJ789KL', '2025-06-28 09:00:00', '2025-06-28 09:25:00', 40.5 / (25.0/60), (40.5 / (25.0/60)) - 60), -- sopra limite (~97.2 km/h)
-- Veicolo 4, tratta 2, limite 130 - 20 = 110
(2, 'MN321OP', '2025-06-28 08:00:00', '2025-06-28 08:45:00', 40.5 / (45.0/60), (40.5 / (45.0/60)) - 110), -- sotto limite (~54 km/h)
-- Veicolo 5, tratta 3, limite 100
(3, 'QR654ST', '2025-06-28 09:00:00', '2025-06-28 09:25:00', 50.6 / (25.0/60), (50.6 / (25.0/60)) - 100), -- sopra limite (~121.44 km/h)
-- Veicolo 6, tratta 3, limite 80
(3, 'UV987WX', '2025-06-28 09:00:00', '2025-06-28 09:20:00', 50.6 / (20.0/60), (50.6 / (20.0/60)) - 80), -- sopra limite (~151.8 km/h)
-- Veicolo 7, tratta 4, limite 60
(4, 'YZ741AB', '2025-06-28 09:00:00', '2025-06-28 09:20:00', 49.6 / (20.0/60), (49.6 / (20.0/60)) - 60), -- sopra limite (~148.8 km/h)
-- Veicolo 8, tratta 4, limite 130
(4, 'CD852EF', '2025-06-28 08:00:00', '2025-06-28 08:50:00', 49.6 / (50.0/60), (49.6 / (50.0/60)) - 130), -- sotto limite (~59.52 km/h)
-- Veicolo 9, tratta 1, limite 130
(1, 'GH963IJ', '2025-06-28 08:00:00', '2025-06-28 08:40:00', 39.7 / (40.0/60), (39.7 / (40.0/60)) - 130), -- sotto limite (~59.55 km/h)
-- Veicolo 10, tratta 2, limite 80 - 20 = 60
(2, 'KL159MN', '2025-06-28 09:00:00', '2025-06-28 09:25:00', 40.5 / (25.0/60), (40.5 / (25.0/60)) - 60); -- sopra limite (~97.2 km/h)

-- Inserimento dati tabella MULTA --
INSERT INTO multa (transito, importo) VALUES
    -- Veicolo 2, tratta 1, delta_velocita positivo
    (2, 150.0),
    -- Veicolo 3, tratta 2, delta_velocita positivo
    (3, 120.0),
    -- Veicolo 5, tratta 3, delta_velocita positivo
    (5, 130.0),
    -- Veicolo 6, tratta 3, delta_velocita positivo
    (6, 180.0),
    -- Veicolo 7, tratta 4, delta_velocita positivo
    (7, 200.0),
    -- Veicolo 10, tratta 2, delta_velocita positivo
    (10, 110.0);
