# 📌 Progetto Programmazione Avanzata 2024-2025
<div align="center">
  <img src="https://github.com/MattSona99/ProgettoPA/blob/main/images/logo.png" />
</div>

# 📚 Indice
- [📌 Progetto Programmazione Avanzata A.A. 2024-2025](#progetto-programmazione-avanzata-aa-2425)
- [📚 Indice](#indice)
  - [🎯 Obiettivo](#obiettivo)
  - [🛠️ Progettazione](#progettazione)
    - [🏗️ Architettura](#architettura)
    - [🧑‍💼 Diagramma dei casi d'uso](#diagramma-dei-casi-duso)
    - [🗂️ Diagramma E-R](#diagramma-e-r)
    - [📈 Diagramma delle sequenze](#diagramma-delle-sequenze)
  - [🌐 Rotte API](#rotte-api)
  - [⚙️ Setup & Installazione](#setup-e-installazione)
  - [🧰 Strumenti utilizzati](#strumenti-utilizzati)
  - [💡 Scelte implementative](#scelte-implementative)
  - [👥 Autori](#autori)

---

## 🎯 Obiettivo

Il progetto consiste nella realizzazione di un sistema backend per la gestione dei transiti di veicoli tra varchi autostradali, con calcolo automatico di eventuali **multe** in base alla **velocità media** rilevata. Il sistema supporta **OCR (Tesseract.js)** per l'identificazione automatica delle targhe, gestione utenti con **JWT**, **CRUD completo per varchi, tratte, veicoli e transiti**, generazione di **bollettini PDF** e ruoli differenziati (Operatore, Varco, Automobilista).

---

## 🛠️ Progettazione

### 🏗️ Architettura

- **Node.js** con **Express** per la gestione delle API REST
- **Sequelize** come ORM per l'interazione con un database **PostgreSQL**
- **Autenticazione JWT** e gestione dei ruoli
- **OCR con Tesseract.js** per lettura targa da immagini
- **Docker Compose** per orchestrazione dei servizi
- **Test con Jest** + **Postman Collection**

```
  Utente      API Server        Backend Server         PostgreSQL
  |               |                  |                    |
  |  ---> Richiesta HTTP  -------->  |                    |
  |               |  --> Elabora logica (Node.js)        |
  |               |                  |  ---> Query ------>|
  |               |                  |  <--- Risposta ----|
  |               |  <-- Risultato --|                    |
  |  <--- Risposta HTTP -------------|                    |
```
Il sistema adotta un'architettura **client-server** strutturata su più livelli:
- L'utente (es. operatore, varco o automobilista) effettua una richiesta HTTP (es. `GET`, `POST`) verso il **server Express.js**, autenticandosi tramite **token JWT**.
- Il **backend** gestisce la logica applicativa (validazioni, controlli sui ruoli, calcoli di velocità o multe, OCR targa, etc.).
- Quando necessario, il backend comunica con il **database PostgreSQL** attraverso **Sequelize**, per leggere o aggiornare i dati persistenti (veicoli, transiti, multe, tratte, etc.).
- Infine, una **risposta JSON** viene restituita all'utente.

Questo flusso garantisce una separazione chiara tra livelli e sicurezza tramite autenticazione. Inoltre, l'architettura si riflette sulla struttura stessa del progetto, poiché le **directory** sono organizzate come di seguito:
```
ProgettoPA
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── dao
│   │   ├── middleware
│   │   ├── models
│   │   ├── repositories
│   │   ├── routes
│   │   ├── utils
│   │   └── app.ts
│   │   └── server.ts
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
├── db
|   └── init.sql
├── images
|   ├── logo.png
|   ├── targa1.png
|   ├── targa2.png
│   └── targa3.png
├── test_postman
├──docker-compose.yml
├──LICENSE
└──README.md
```


### 🧑‍💼 Diagramma dei casi d'uso
Nel sistema sviluppato, ci sono 3 tipologie di utenti: Automobilista, Operatore e Varco.
Ognuno può interagire con il sistema per svolgere determinate operazioni:
- **Automobilista**: può autenticarsi, vedere le proprie multe (anche in un determinato periodo) e scaricare un bollettino di pagamento.
- **Operatore**: può autenticarsi, gestire i varchi, le tratte, i veicoli e i transiti, può vedere le multe di tutti gli utenti (anche in un determinato periodo) e scaricare un bollettino di pagamento.
- **Varco**: può autenticarsi e inserire un transito (manualmente o in automatico).

![Diagramma dei casi d'uso](https://i.imgur.com/IrMuGUF.png)

### 🗂️ Diagramma E-R

Il sistema utilizza **PostgreSQL** come RDBMS, il quale è particolarmente indicato per applicazioni back-end come quella sviluppata in questo progetto, dove l'autenticazione sicura dei dati e l'efficienza nelle operazioni di lettura e scrittura sono fondamentali. Grazie alle sue prestazioni ottimizzate, PostgreSQL rappresenta una soluzione ideale per garantire la robustezza e la velocità del sistema.
```mermaid
classDiagram
    class UTENTE {
        int id_utente
        string nome
        string cognome
        string email
        string ruolo
        int tokens
    }
    class VARCO {
        int id_varco
        string nome_autostrada
        float km
        bool smart
        bool pioggia
    }
    class IS_VARCO {
        int id_utente
        int id_varco
    }
    class TIPO_VEICOLO {
        int id_tipo_veicolo
        string tipo
        int limite_velocita
    }
    class VEICOLO {
        string targa
        int tipo_veicolo
        int utente
    }
    class TRATTA {
        int id_tratta
        int varco_in
        int varco_out
        float distanza
    }
    class TRANSITO {
        int id_transito
        int tratta
        string targa
        timestamp data_in
        timestamp data_out
        float velocita_media
        float delta_velocita
    }
    class MULTA {
        int id_multa
        uuid uuid_pagamento
        int transito
        float importo
    }

    UTENTE --> VEICOLO : possiede
    TIPO_VEICOLO --> VEICOLO : è
    VEICOLO --> TRANSITO : effettua
    TRANSITO --> MULTA : genera
    VARCO --> TRATTA : in/out
    TRATTA --> TRANSITO : percorre
    UTENTE --> IS_VARCO : gestisce
    VARCO --> IS_VARCO : è gestito
```

### 📈 Diagrammi delle sequenze

## 🌐 Rotte API

Le rotte sono tutte autenticate con JWT e prevedono il controllo del ruolo dell'utente.

### Utente
- `POST /login` – Login utente

### Varchi (`/varco`)
- `GET /` – Elenco varchi [operatore]
- `GET /:id` – Cerca varco [operatore]
- `POST /` – Crea varco [operatore]
- `PUT /:id` – Modifica varco [operatore]
- `DELETE /:id` – Elimina varco [operatore]

### Tratte (`/tratta`)
- `GET /` – Elenco tratte [operatore]
- `GET /` – Cerca tratta [operatore]
- `POST /` – Crea tratta (v_in, v_out, distanza) [operatore]
- `PUT /:id` – Modifica tratta [operatore]
- `DELETE /:id` – Elimina tratta [operatore]

### Veicoli (`/veicolo`)
- `GET /` – Elenco veicoli [operatore]
- `GET /:targa` – Cerca veicolo [operatore]
- `POST /` – Crea veicolo [operatore]
- `PUT /:targa` – Modifica veicolo [operatore]
- `DELETE /:targa` – Elimina veicolo [operatore]

### Veicoli (`/tipoVeicolo`)
- `GET /` – Elenco tipo veicoli [operatore]
- `GET /:id` – Cerca tipo veicolo [operatore]
- `POST /` – Crea tipo veicolo [operatore]
- `PUT /:id` – Modifica tipo veicolo [operatore]
- `DELETE /:id` – Elimina tipo veicolo [operatore]

### Transiti (`/transito`)
- `GET /` – Elenco transiti [operatore]
- `GET /:id` – Cerca transito [operatore]
- `POST /manuale` – Inserimento da operatore o varco non smart [operatore/varco]
- `POST /smart` – Inserimento da varco smart [varco]
- `PUT /:id` – Modifica transito [operatore]
- `DELETE /:id` – Elimina transito [operatore]

### Multe (`/api/multe`)
- `GET /` – Elenco multe [operatore]
- `GET /dettagli` – Lista multe per targa e periodo [operatore/automobilista]
- `GET /:id/pdf` – Scarica PDF con QR code del bollettino di pagamento [operatore/automobilista]

---

## ⚙️ Setup e Installazione

## 🧰 Strumenti utilizzati

## 💡 Scelte implementative

## 👥 Autori
|Nome | GitHub |
|-----------|--------|
|`Sonaglioni Matteo` | [Clicca qui!](https://github.com/MattSona99) |
|`Cingoli Enzo` | [Clicca qui!](https://github.com/enzoc2000) |

