# Progetto Programmazione Avanzata 2024-2025
<div align="center">
  <img src="https://github.com/MattSona99/ProgettoPA/blob/main/images/logo.png" />
</div>

# Indice
- [Progetto Programmazione Avanzata A.A. 2024-2025](#progetto-programmazione-avanzata-aa-2425)
- [Indice](#indice)
  - [Obiettivo](#obiettivo)
  - [Progettazione](#progettazione)
    - [Architettura](#architettura)
    - [Diagramma dei casi d'uso](#diagramma-dei-casi-duso)
    - [Diagramma E-R](#diagramma-e-r)
    - [Diagramma delle sequenze](#diagramma-delle-sequenze)
  - [Rotte API](#rotte-api)
  - [Setup & Installazione](#setup-e-installazione)
  - [Strumenti utilizzati](#strumenti-utilizzati)
  - [Scelte implementative](#scelte-implementative)
  - [Autori](#autori)

---

## Obiettivo

Il progetto consiste nella realizzazione di un sistema backend per la gestione dei transiti di veicoli tra varchi autostradali, con calcolo automatico di eventuali **multe** in base alla **velocità media** rilevata. Il sistema supporta **OCR (Tesseract.js)** per l'identificazione automatica delle targhe, gestione utenti con **JWT**, **CRUD completo per varchi, tratte, veicoli e transiti**, generazione di **bollettini PDF** e ruoli differenziati (Operatore, Varco, Automobilista).

---

## Progettazione

### Architettura

- **Node.js** con **Express** per la gestione delle API REST
- **Sequelize** come ORM per l'interazione con un database **PostgreSQL**
- **Autenticazione JWT** e gestione dei ruoli
- **OCR con Tesseract.js** per lettura targa da immagini
- **Docker Compose** per orchestrazione dei servizi
- **Test con Jest** + **Postman Collection**

### Diagramma dei casi d'uso

## Rotte API

Le rotte sono tutte autenticate con JWT (`[U]`) e prevedono il controllo del ruolo dell'utente.

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

## Setup e Installazione

## Strumenti utilizzati

## Scelte implementative

## Autori
|Nome | GitHub |
|-----------|--------|
| 👩 `Sonaglioni Matteo` | [Clicca qui!](https://github.com/MattSona99) |
| 👨 `Cingoli Enzo` | [Clicca qui!](https://github.com/enzoc2000) |

