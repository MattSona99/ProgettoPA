# 📌 Progetto Programmazione Avanzata 2024-2025
<div align="center">
  <img src="https://github.com/MattSona99/ProgettoPA/blob/main/images/logo.png" />
</div>

# 📚 Indice
- [🎯 Obiettivo](#🎯-obiettivo)
- [🛠️ Progettazione](#🛠️-progettazione)
  - [🏗️ Architettura](#🏗️-architettura)
  - [🧑‍💼 Diagramma dei casi d'uso](#🧑‍💼-diagramma-dei-casi-duso)
  - [🗂️ Diagramma E‑R](#🗂️-diagramma-e-r)
  - [🧩 Pattern Utilizzati](#🧩-pattern-utilizzati)
  - [📈 Diagrammi delle sequenze](#📈-diagrammi-delle-sequenze)
- [🌐 Rotte API](#🌐-rotte-api)
- [⚙️ Setup & Installazione](#⚙️-setup--installazione)
- [💡 Scelte implementative](#💡-scelte-implementative)
- [🧰 Strumenti utilizzati](#🧰-strumenti-utilizzati)
- [👥 Autori](#👥-autori)

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

### 🗂️ Diagramma E‑R

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

### 🧩 Pattern Utilizzati

Nel progetto sono stati adottati diversi design pattern per garantire modularità, manutenibilità e scalabilità del codice. Di seguito una descrizione dei principali pattern e dei vantaggi che hanno apportato all’architettura.

- **MVC (Model-View-Controller)**

È stato utilizzato il pattern MVC per separare chiaramente i ruoli tra dati, logica e interfaccia: i modelli definiscono la struttura dei dati (grazie a Sequelize), i controller gestiscono la logica delle richieste HTTP, e la "vista" corrisponde alle risposte API restituite ai client (in formato JSON). Questa struttura permette di lavorare in modo modulare e mantenere il codice pulito.

- **DAO (Data Access Object)**

Per isolare ulteriormente la logica di accesso al database, sono stati introdotti i DAO (Data Access Object). Ogni DAO si occupa delle interazioni dirette con il database, come query, inserimenti o aggiornamenti, in modo centralizzato. Questo approccio semplifica il testing e rende più semplice cambiare il backend (ad esempio, da Sequelize a un’altra libreria) senza modificare tutta l’applicazione.

- **REPOSITORY**

A un livello superiore, i Repository orchestrano più DAO e incapsulano logiche applicative più complesse. Sono responsabili di operazioni che coinvolgono più entità o che richiedono calcoli specifici (come la generazione di multe, calcoli di velocità, ecc.). Questo migliora la leggibilità dei controller e favorisce una divisione dei compiti chiara.
- **COR (Chain of Responsability)**

Per alcune funzionalità che richiedono una valutazione progressiva e flessibile, come l’analisi delle condizioni di un transito per determinare se va multato o meno, è stato adottato il Chain of Responsibility. Questo pattern permette di definire una catena di controlli, dove ciascun "anello" della catena può decidere se gestire la richiesta o passarla avanti. Questo approccio è molto utile per evitare blocchi di `if` annidati e rende più semplice aggiungere nuove regole senza modificare quelle esistenti.
I middleware, in particolare, permettono la creazione della catena di responsabilità, poiché [Express.js](https://expressjs.com/) stesso fa un ampio uso di questo pattern. I middleware, infatti, sono funzioni che vengono eseguite in sequenza per gestire le richieste HTTP. Sfruttando il COR, sono state implementate le seguenti funzionalità dei middleware:
  - **Middleware di autenticazione**: verifica se l'utente è autenticato e autorizzato ad eseguire l'operazione richiesta, sfruttando la verifica tramite JWT. Se non lo è, restituisce una risposta d'errore; altrimenti, passa la richiesta al middleware successivo.
  - **Middleware di validazione**: viene utilizzato per validare i dati di una richiesta, che possono essere passati come `param` o `body`. Se i dati non sono validi, restituisce una risposta d'errore; altrimenti, passa la richiesta al middleware successivo.
  - **Middleware di gestione degli errori**: intercetta eventuali errori verificatisi nei middleware precedenti e restituisce una risposta d'errore appropriata, sfruttando un `errorHandler` personalizzato con il pattern Factory.

- **FACTORY**

Per la gestione personalizzata degli errori è stato scelto l'utilizzo del design pattern comportamentale Factory, il quale permette di delegare la creazione di oggetti a una factory (fabbrica), che decide quale tipo di oggetto creare in base a determinati parametri parametri forniti.
All'interno del sistema sviluppato, il pattern è stato utilizzato per la creazione di errori personalizzati attraverso l'`errorHandler`, che fornisce un metodo per creare istanze di errori `HttpError` con diversi tipi e messaggi, sfruttando anche l'utilizzo della libreria `http-status-code` per la stampa dei codici di errore, incapsulando la logica di creazione degli errori in un'unica classe. In questo modo, risulta particolarmente facilitata la gestione e la possibile estensione degli errori, essendo l'intera logica localizzata in un unico punto.

- **SINGLETON**

Infine, il pattern Singleton è stato usato dove è necessario garantire una sola istanza condivisa in tutto il sistema, come ad esempio per alcune configurazioni, o per servizi che devono essere accessibili ovunque, senza duplicazioni.

L’uso combinato di questi pattern ha permesso di realizzare un’architettura robusta, estendibile e pronta per evolversi in progetti futuri più complessi.

### 📈 Diagrammi delle sequenze

I diagrammi di sequenza illustrano lo scambio di messaggi tra oggetti che interagiscono tra loro, fornendo una rappresentazione chiara e dettagliata del flusso di comunicazione. Sono particolarmente efficaci per comprendere il funzionamento delle interazioni in sistemi basati su API, dove evidenziano le richieste e risposte tra le diverse entità coinvolte.

Dato che la maggior parte dei diagrammi risultavano con la stessa struttura, mostreremo di seguito soltanto alcuni di essi, quelli di maggior interesse e particolarità.

- **POST /login**
La rotta descritta costituisce il punto centrale del meccanismo di autenticazione dell'intero sistema. In fase di login, l'utente invia una richiesta con le proprie credenziali al middleware di autenticazione (`authMiddleware`), che accede all'ambiente di esecuzione (`.env`) per recuperare la chiave segreta utilizzata nella firma dei token JWT.
Una volta ottenuta la chiave, il middleware genera un token JWT firmato, contenente le informazioni di autenticazione dell’utente, e lo restituisce come risposta alla richiesta iniziale.
Successivamente, per accedere alle rotte protette, l’utente include il token nelle richieste. Il middleware intercetta la richiesta e utilizza nuovamente la chiave segreta per verificare l’autenticità del token. Se il token è valido, la libreria JWT restituisce il payload decodificato, consentendo l’accesso alla risorsa richiesta. In caso contrario, il token viene considerato non valido e il middleware genera un errore, restituendo un messaggio di accesso negato.

Il token JWT, una volta ottenuto, sarà dunque utilizzato dall’utente per autenticarsi nelle richieste successive verso le API che richiedono autorizzazione.

```mermaid
sequenceDiagram
  participant C as Client
  participant A as App
  participant M as Middleware
  participant V as Validate
  participant CN as Controller
  participant D as DAO
  participant S as Sequelize
  participant F as Factory

  C ->> A: POST /login
  A ->> V: validateLogin
  V -->> A: 
  A ->> CN: LOGIN
  CN ->> D: utenteDao.getEmail
  D ->> S: Utente.findOne
  S -->> D: 
  D -->> CN: 
  CN ->> F: createError
  F -->> CN: 
  CN -->> A: 
  A ->> M: errorHandler
  M -->> A: 
  A --) C:
```

- **GET /veicolo/:id**
La chiamata `GET /veicolo/:id` consente al client di recuperare le informazioni di un veicolo specifico, identificato tramite il suo ID. Quando la richiesta viene inviata, il sistema verifica innanzitutto il token JWT e il ruolo dell’utente tramite il middleware di autenticazione. Se l’autenticazione ha esito positivo, viene avviata la validazione dei parametri della richiesta, in particolare dell'ID del veicolo.
Successivamente, il controller richiama il repository per ottenere i dati del veicolo. Quest'ultimo si appoggia al DAO, che interroga il database tramite Sequelize, utilizzando il metodo `findByPk` per cercare il veicolo tramite chiave primaria. Se il veicolo non viene trovato, viene generato un errore tramite una factory di errori, che viene poi gestito dal middleware degli errori. Infine, la risposta viene inviata al client, contenente o i dati del veicolo richiesto oppure un messaggio d’errore se il veicolo non esiste o la richiesta è invalida.
```mermaid
  sequenceDiagram
  participant C as Client
  participant A as App
  participant M as Middleware
  participant V as VeicoloValidate
  participant CN as VeicoloController
  participant R as VeicoloRepository
  participant VD as VeicoloDAO
  participant TD as TipoVeicoloDAO
  participant UD as UtenteDAO
  participant S as Sequelize
  participant F as Factory

  C ->> A: GET /veicolo:id
  A ->> M: Token e ruolo verificati
  M -->> A: 
  A ->> V: validateGetVeicoloById
  V -->> A: 
  A ->> CN: getVeicoloById
  CN ->> R: veicoloRepository.getVeicoloById
  R ->> VD: veicoloDao.getById
  VD ->> S: Veicolo.findByPk
  S -->> VD: 
  VD -->> R: 
  R ->> TD: tipoVeicoloDao.getById
  TD ->> S: TipoVeicolo.findByPk
  S -->> TD: 
  TD -->> R: 
  R ->> UD: utenteDao.getById
  UD ->> S: Utente.findByPk
  S -->> TD: 
  TD -->> R: 
  R -->> CN: 
  CN ->> F: createError
  F -->> CN: 
  CN -->> A: 
  A ->> M: errorHandler
  M -->> A: 
  A --) C:  
```

- **POST /veicolo**
La chiamata `POST /veicolo` permette al client di creare un nuovo veicolo all'interno del sistema. Una volta ricevuta la richiesta, l'applicazione verifica l’autenticità del token JWT e i privilegi dell’utente tramite il middleware di autenticazione.

Se l’accesso è autorizzato, i dati forniti vengono validati per assicurarsi che rispettino i requisiti previsti per la creazione di un veicolo (targa, tipo, utente). Dopo la validazione, il controller attiva il processo di creazione chiamando il repository, che a sua volta si appoggia al DAO per interagire con il database.

Il DAO utilizza Sequelize per inserire il nuovo record nella tabella dei veicoli. Una volta completata l’operazione, i dati del nuovo veicolo vengono restituiti risalendo la catena. Se si verifica un errore (ad esempio un duplicato o un problema di integrità), viene generato tramite la factory degli errori e gestito dal middleware di error handling, che infine invia una risposta di errore o successo al client, a seconda dell’esito.
```mermaid
sequenceDiagram
  participant C as Client
  participant A as App
  participant M as Middleware
  participant V as VeicoloValidate
  participant CN as VeicoloController
  participant R as VeicoloRepository
  participant D as VeicoloDAO
  participant S as Sequelize
  participant F as Factory

  C ->> A: POST /veicolo
  A ->> M: Token e ruolo verificati
  M -->> A: 
  A ->> V: validateCreateVeicolo
  V -->> A: 
  A ->> CN: createVeicolo
  CN ->> R: veicoloRepository.createVeicolo
  R ->> D: veicoloDao.create
  D ->> S: Veicolo.create
  S -->> D: 
  D -->> CN: 
  CN ->> F: createError
  F -->> CN: 
  CN -->> A: 
  A ->> M: errorHandler
  M -->> A: 
  A -->> C:  
```

- **DELETE /veicolo**
La chiamata `DELETE /veicolo/:id` consente al client di eliminare un veicolo specifico identificato tramite il suo ID. Una volta inviata la richiesta, il sistema verifica il token JWT e il ruolo dell’utente per accertarsi che l’operazione sia autorizzata.

Dopo l’autenticazione, viene effettuata la validazione dell’ID del veicolo da eliminare. Superata la validazione, il controller invoca il repository, che a sua volta chiama il DAO per gestire l’eliminazione. Il DAO interroga il database tramite Sequelize, inizialmente cercando il veicolo con `findByPk` per verificarne l’esistenza. Se il veicolo è presente, viene eseguita l’operazione di cancellazione con `destroy`.

Il risultato dell’operazione viene quindi risalito fino al controller. Se si verifica un errore, viene creato tramite la factory degli errori e gestito dal middleware di errore. Infine, viene inviata al client una risposta che conferma l’avvenuta eliminazione o comunica l’errore rilevato.
```mermaid
sequenceDiagram
  participant C as Client
  participant A as App
  participant M as Middleware
  participant V as VeicoloValidate
  participant CN as VeicoloController
  participant R as VeicoloRepository
  participant D as VeicoloDAO
  participant S as Sequelize
  participant F as Factory

  C ->> A: DELETE /veicolo/:id
  A ->> M: Token e ruolo verificati
  M -->> A: 
  A ->> V: validateDeleteVeicolo
  V -->> A: 
  A ->> CN: deleteVeicolo
  CN ->> R: veicoloRepository.deleteVeicolo
  R ->> D: veicoloDao.delete
  D ->> S: Veicolo.findByPk
  S -->> D: 
  D ->> S: Veicolo.destroy
  S -->> D: 
  D -->> CN: 
  CN ->> F: createError
  F -->> CN: 
  CN -->> A: 
  A ->> M: errorHandler
  M -->> A: 
  A -->> C:  
```

- **POST /tratta**
Questa rotta gestisce la creazione di una nuova tratta, cioè un collegamento tra due varchi. Dopo l’invio della richiesta da parte del client, il middleware autentica l’utente e ne controlla i privilegi.

Il corpo della richiesta viene validato per verificare la correttezza delle informazioni, in particolare degli ID dei due varchi estremi. Il controller, tramite il repository, effettua due interrogazioni al DAO dei varchi (`varcoDao.getById`) per verificare che entrambi esistano nel sistema.

Se i varchi sono validi, si procede con la creazione della tratta nel database tramite il DAO (`trattaDao.create`), che sfrutta `Sequelize.Tratta.create.` Infine, il risultato viene risalito fino al client. In caso di problemi (varchi inesistenti, errore di creazione, ecc.), viene generato e gestito un errore.
```mermaid
sequenceDiagram
  participant C as Client
  participant A as App
  participant M as Middleware
  participant V as TrattaValidate
  participant CN as TrattaController
  participant R as TrattaRepository
  participant TD as TrattaDAO
  participant VD as VarcoDAO
  participant S as Sequelize
  participant F as Factory

  C ->> A: POST /tratta
  A ->> M: Token e ruolo verificati
  M -->> A: 
  A ->> V: validateCreateTratta
  V -->> A: 
  A ->> CN: createTratta
  CN ->> R: trattaRepository.createTratta
  R ->> VD: varcoDao.getById (x2)
  VD ->> S: Varco.findByPk (x2)
  S -->> VD: (x2)
  VD -->> R: (x2)
  R ->> TD: trattaDao.create
  TD ->> S: Tratta.create
  S -->> TD: 
  TD -->> CN: 
  CN ->> F: createError
  F -->> CN: 
  CN -->> A: 
  A ->> M: errorHandler
  M -->> A: 
  A -->> C: 
```

- **DELETE /tratta/:id**
Questa rotta permette di eliminare una tratta specificata tramite il suo ID. Dopo l’autenticazione e la verifica del ruolo da parte del middleware, l’ID fornito viene validato.

Il controller controlla che non ci siano transiti associati alla tratta tramite una query (`Transito.findOne`). Se la tratta non è collegata ad alcun transito (quindi può essere eliminata senza violare integrità referenziale), il controller procede all’eliminazione passando per il repository e il DAO.

Il DAO interroga il database per verificare l’esistenza della tratta (`findByPk`) e, se presente, la elimina con `destroy`. Eventuali errori vengono gestiti attraverso la factory e propagati al middleware, che fornisce la risposta al client.
```mermaid
sequenceDiagram
  participant C as Client
  participant A as App
  participant M as Middleware
  participant V as TrattaValidate
  participant CN as TrattaController
  participant R as TrattaRepository
  participant TD as TrattaDAO
  participant S as Sequelize
  participant F as Factory

  C ->> A: DELETE /tratta/:id
  A ->> M: Token e ruolo verificati
  M -->> A: 
  A ->> V: validateDeleteTratta
  V -->> A: 
  A ->> CN: deleteTratta
  CN ->> S: Transito.findOne
  S -->> CN: Se non c'è nessun transito associato
  CN ->> R: trattaRepository.deleteTratta
  R ->> TD: trattaDao.delete
  TD ->> S: Tratta.findByPk
  S -->> TD: 
  TD ->> S: Tratta.destroy
  S -->> TD: 
  TD -->> CN: 
  CN ->> F: createError
  F -->> CN: 
  CN -->> A: 
  A ->> M: errorHandler
  M -->> A: 
  A -->> C: 
```

- **GET /transito**
Questa rotta permette di ottenere i dettagli completi di un transito a partire dal suo identificativo. Come sempre, il flusso inizia con il client che invia la richiesta e l'applicazione che la intercetta, passando prima attraverso il middleware per la verifica del token JWT e dei privilegi di ruolo. Superato il controllo di sicurezza, l’app si affida al modulo di validazione per controllare la correttezza del parametro `id`.
Una volta validata la richiesta, il controller TransitoController invoca il metodo del repository, che a sua volta interroga il TransitoDAO per ottenere il transito richiesto dal database tramite `findByPk`.
Ottenuto il transito, il repository recupera anche le entità correlate per costruire una risposta completa e arricchita:
- la tratta associata, attraverso `trattaDao.getById`;
- il veicolo che ha effettuato il transito (`Veicolo.findOne`);
- il relativo tipo di veicolo (`TipoVeicolo.findOne`).
Tutte queste informazioni vengono aggregate e inviate dal controller al client. Se in qualunque punto si verifica un errore (transito inesistente, riferimenti nulli, ecc.), il controller si affida alla factory per creare l’errore corrispondente, che viene poi gestito dal middleware centralizzato per la gestione degli errori e inviato al client come risposta appropriata.
```mermaid
sequenceDiagram
  participant C as Client
  participant A as App
  participant M as Middleware
  participant TV as TransitoValidate
  participant CN as TransitoController
  participant R as TransitoRepository
  participant TD as TransitoDAO
  participant VD as VeicoloDAO
  participant TVD as TipoVeicolODAO
  participant TTD as TrattaDAO
  participant VRD as VarcoDAO
  participant MD as MultaDAO
  participant S as Sequelize
  participant F as Factory

  C ->> A: GET /transito
  A ->> M: Token e ruolo verificati
  M -->> A: 
  A ->> TV: validateGetTransitoById
  TV -->> A: 
  A ->> CN: getTransitoById
  CN ->> R: transitoRepository.getTransitoById
  R ->> TD: transitoDao.getById
  TD ->> S: Transito.findByPk
  S -->> TD: 
  TD -->> R: 
  R ->> TTD: trattaDao.getById
  TTD ->> S: Tratta.findByPk
  S -->> TTD: 
  TTD -->> R: 
  R ->> S: Veicolo.findOne
  S ->> R: 
  R ->> S: TipoVeicolo.findOne
  S -->> R: 
  R -->> CN: 
  CN ->> F: createError
  F -->> CN: 
  CN -->> A: 
  A ->> M: errorHandler
  M -->> A: 
  A -->> C:  
```

- **POST /transito/smart**
Questa rotta consente la creazione manuale di un transito da parte di un operatore o un varco smart (ad esempio in caso di mancata rilevazione automatica o inserimento retroattivo). Anche in questo caso, tutto parte con l’invio della richiesta da parte del client, l’autenticazione dell’utente e la verifica dei privilegi tramite middleware.
Il payload viene quindi validato (`validateCreateTransito`) per assicurarsi che contenga dati coerenti (veicolo, tratta, varco, ecc.). A questo punto entra in gioco il controller, che chiama il repository. Il repository passa il compito di creare il transito al DAO (`transitoDao.create`), che usa `Sequelize.Transito.create` per l’inserimento nel database.
Dopo la creazione, il repository esegue una serie di interrogazioni per arricchire il dato:
- recupera il veicolo tramite `VeicoloDAO.getById`;
- da questo ottiene il tipo di veicolo con `TipoVeicoloDAO.getById`;
- infine ottiene i dati della tratta associata tramite `TrattaDAO.getById`.
Queste informazioni sono utilizzate per effettuare controlli aggiuntivi (ad esempio sul rispetto dei limiti di velocità) o per generare multe. Una volta completata la logica di business, il controller restituisce la risposta al client. Anche in questo caso, se si verificano errori (veicolo o tratta inesistenti, problemi di creazione nel DB, ecc.), si genera un errore tramite la factory, che viene poi gestito e restituito in forma strutturata.
```mermaid
sequenceDiagram
  participant C as Client
  participant A as App
  participant M as Middleware
  participant TV as TransitoValidate
  participant CN as TransitoController
  participant R as TransitoRepository
  participant TD as TransitoDAO
  participant VD as VeicoloDAO
  participant TVD as TipoVeicolODAO
  participant TTD as TrattaDAO
  participant VRD as VarcoDAO
  participant MD as MultaDAO
  participant S as Sequelize
  participant F as Factory

  C ->> A: POST /transito/smart
  A ->> M: Token e ruolo verificati
  M -->> A: 
  A ->> TV: validateCreateTransito
  TV -->> A: 
  A ->> CN: createTransito
  CN ->> R: transitoRepository.getTransitoById
  R ->> TD: veicoloDao.createTransito
  TD ->> S: Transito.create
  S -->> TD:
  TD -->> R:
  R ->> VD: veicoloDao.getById
  VD ->> S: Veicolo.findByPk
  S -->> VD:
  VD -->> R:
  R ->> TVD: tipoVeicoloDao.getById
  TVD ->> S: tipoVeicolo.findByPk
  S -->> TVD:
  TVD -->> R:
  R ->> TTD: trattaDao.getById
  TTD ->> S: Tratta.findByPk
  S -->> TTD:
  TTD -->> R:
  R ->> TD: transitoDao.create
  TD ->> S: Transito.create
  S -->> TD:
  TD -->> R:
  R -->> CN: 
  CN ->> F: createError
  F -->> CN: 
  CN -->> A: 
  A ->> M: errorHandler
  M -->> A: 
  A -->> C:  
```

- **POST /transito/manuale**
Questa rotta consente l'invio di un'immagine contenente una targa, che viene elaborata tramite Tesseract.js per l'estrazione automatica del numero di targa. Il sistema utilizza l'OCR per leggere la targa e predispone i dati necessari per la successiva registrazione manuale del transito.
È previsto il controllo del token di autenticazione e del ruolo dell’utente (che deve essere un operatore di varco).
```mermaid
sequenceDiagram
  participant C as Client
  participant A as App
  participant M as Middleware
  participant TV as TransitoValidate
  participant CN as TransitoController
  participant R as TransitoRepository
  participant S as Sequelize
  participant F as Factory

  C ->> A: POST /transito/manuale
  A ->> M: Token e ruolo verificati
  M -->> A: 
  A ->> TV: uploadImage
  TV -->> A:
  A ->> CN: createTransitoByVarco
  CN ->> R: transitoRepository.processImage
  R -->> CN: 
  CN ->> F: createError
  F -->> CN: 
  CN -->> A: 
  A ->> M: errorHandler
  M -->> A: 
  A -->> C: 
```
  
- **DELETE /transito**
Questa rotta consente l'eliminazione di un transito esistente, identificato dal suo `id`. Prima di procedere, il sistema verifica l'autenticazione e il ruolo dell’utente. L’eliminazione è permessa solo se non esiste alcuna multa associata al transito in questione.
Il flusso prevede:
- Validazione del `transitoId` ricevuto.
- Verifica della presenza di una multa collegata al transito.
- Se non è presente alcuna multa, il transito viene eliminato dal database.
In caso esista già una multa legata al transito, viene generato un errore e il transito non può essere cancellato.
```mermaid
sequenceDiagram
  participant C as Client
  participant A as App
  participant M as Middleware
  participant TV as TransitoValidate
  participant CN as TransitoController
  participant R as TransitoRepository
  participant TD as TransitoDAO
  participant S as Sequelize
  participant F as Factory

  C ->> A: DELETE /transito/:id
  A ->> M: Token e ruolo verificati
  M -->> A: 
  A ->> TV: validateDeleteTransito
  TV -->> A: 
  A ->> CN: deleteTransito
  CN ->> S: Multa.findOne
  S -->> CN: Se la Multa non esiste, si può eliminare il Transito
  CN ->> R: transitoRepository.deleteTransito
  R ->> TD: transitoDao.delete
  TD ->> S: Transito.destroy
  S -->> TD:
  TD -->> R:
  R -->> CN: 
  CN ->> F: createError
  F -->> CN: 
  CN -->> A: 
  A ->> M: errorHandler
  M -->> A: 
  A -->> C:  
```

- **GET /multe/dettagli**
Questa rotta consente a un automobilista o un operatore di consultare tutte le multe ricevute in un determinato intervallo temporale, filtrate in base alle targhe dei veicoli di sua proprietà (mentre operatore può vederle tutte). Dopo la verifica del token e del ruolo da parte del middleware, il sistema procede con la validazione dei parametri forniti, come il periodo e l’elenco delle targhe. Il controller coordina il recupero dei dati attraverso il repository, che interroga in sequenza le tabelle di Veicoli, Transiti, Multe, Tratte e Varchi per ottenere tutte le informazioni necessarie. Il risultato è una risposta JSON ricca di dettagli, utile per l'utente che desidera conoscere non solo l'importo della sanzione, ma anche la dinamica del transito che ha generato la multa, inclusi limiti di velocità, condizioni ambientali e caratteristiche del tratto percorso.
```mermaid
sequenceDiagram
  participant C as Client
  participant A as App
  participant M as Middleware
  participant MV as MultaValidate
  participant CN as MultaController
  participant R as MultaRepository
  participant MD as MultaDAO
  participant S as Sequelize
  participant F as Factory

  C ->> A: GET /multe/dettagli
  A ->> M: Token e ruolo verificati
  M -->> A:
  A ->> MV: validateGetMulteByTargheEPeriodo
  MV -->> A: 
  A ->> CN: getMulteByTargheEPeriodo
  CN ->> R: multaRepository.getMulteByTargheEPeriodo
  R ->> MD: multaDao.getMulteByTargheEPeriodo
  MD ->> S: Veicolo.findAll
  S -->> MD:
  MD ->> S: Transito.findAll
  S -->> MD:
  MD ->> S: Multa.findAll
  S -->> MD:
  MD -->> R:
  R ->> S: Transito.findAll
  S -->> R:
  R ->> S: Tratta.findAll
  S -->> R:
  R ->> S: Varco.findAll (x2)
  S -->> R: (x2)
  R -->> CN: 
  CN ->> F: createError
  F -->> CN: 
  CN -->> A: 
  A ->> M: errorHandler
  M -->> A: 
  A -->> C:
```

- **POST /multe**
Questa rotta si occupa invece della creazione manuale di una nuova multa. È una funzionalità destinata agli operatori autorizzati, ad esempio nei casi in cui sia necessario generare una sanzione in seguito a una verifica o segnalazione. Una volta autenticato l’utente e validati i dati forniti nella richiesta (come il transito associato, l’importo, la motivazione o la data), il controller passa il comando al repository, che si occupa dell’effettivo inserimento nel database attraverso il DAO. La multa viene registrata nella tabella `Multa` tramite Sequelize e, se tutto va a buon fine, viene restituito un esito positivo. In caso contrario, l’errore viene gestito attraverso il factory centralizzato per la generazione degli errori HTTP.
```mermaid
sequenceDiagram
  participant C as Client
  participant A as App
  participant M as Middleware
  participant MV as MultaValidate
  participant CN as MultaController
  participant R as MultaRepository
  participant MD as MultaDAO
  participant S as Sequelize
  participant F as Factory

  C ->> A: GET /multe/dettagli
  A ->> M: Token e ruolo verificati
  M -->> A:
  A ->> MV: validateCreateMulta
  MV -->> A:
  A ->> CN: createMulta
  CN ->> R: multaRepository.create
  R ->> MD: multaDao.create
  MD ->> S: Multa.create
  S -->> MD:
  MD -->> R:
  R -->> CN: 
  CN ->> F: createError
  F -->> CN: 
  CN -->> A: 
  A ->> M: errorHandler
  M -->> A: 
  A -->> C:
```

- **GET /multe/download/:id**
Questa rotta fornisce all’utente la possibilità di scaricare un bollettino PDF relativo a una multa specifica, identificata tramite `id`. Dopo l’autenticazione, il controller avvia una complessa catena di richieste che ricostruisce tutte le informazioni necessarie per compilare correttamente il bollettino. Si parte dalla multa, poi si recuperano i dati dell’utente, del transito associato, del veicolo e infine del tratto percorso. L’interazione tra i DAO e i repository garantisce che tutte le entità correlate vengano caricate, così da includere nel PDF dati come targa, data, ora, varco di rilevamento e importo. Il bollettino generato può essere usato per il pagamento o per la consultazione offline da parte dell’utente, rendendo l’esperienza completa e accessibile.

```mermaid
sequenceDiagram
  participant C as Client
  participant A as App
  participant M as Middleware
  participant MV as MultaValidate
  participant CN as MultaController
  participant R as MultaRepository
  participant TR as TransitoRepository
  participant MD as MultaDAO
  participant TD as TransitoDAO
  participant S as Sequelize
  participant F as Factory

  C ->> A: GET /multe/dettagli
  A ->> M: Token e ruolo verificati
  M -->> A:
  A ->> CN: downlaodBollettinoPDF
  CN ->> MD: multaDao.getMultaByUtente
  MD ->> S: Multa.findByPk
  S -->> MD:
  MD ->> S: Utente.findByPk
  S -->> MD:
  MD ->> S: Transito.findByPk
  S -->> MD:
  MD ->> S: Veicolo.findByPk
  S -->> MD:
  MD -->> CN:
  CN ->> TR: transitoRepository.getTransitoById
  TR ->> TD: transitoDao.getById
  TD ->> S: Transito.findByPk
  S -->> TD:
  TD -->> TR:
  TR -->> CN: 
  CN ->> F: createError
  F -->> CN: 
  CN -->> A: 
  A ->> M: errorHandler
  M -->> A: 
  A -->> C:
```


## 🌐 Rotte API

Le rotte sono tutte autenticate con JWT e prevedono il controllo del ruolo dell'utente.
All'interno del sistema sono presenti delle rotte aggiuntive per permettere di visualizzare, aggiungere, aggiornare o cancellare ulteriori informazioni, che riguardano `tipoVeicolo`, per scopi di completezza.

### Utente
- `POST /login` – Login utente

*Richiesta Body/Query*
```json
{
  "email": "mrossi@example.com"
}
```
*Risposta:*
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwicnVvbG8iOiJvcGVyYXRvcmUiLCJpYXQiOjE3NTE2MjMwNjEsImV4cCI6MTc1MTYyNjY2MX0.VeOchsjtmCRuRNDd29E0rLROhPzO5QCy-Yzx-yleI4Y"
}
```

### Varchi (`/varco`)
- `GET /` – Elenco varchi [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
[
    {
        "id_varco": 1,
        "nome_autostrada": "A1",
        "km": 10,
        "smart": true,
        "pioggia": false
    },
    {
        "id_varco": 2,
        "nome_autostrada": "A1",
        "km": 50,
        "smart": true,
        "pioggia": false
    },
    {
        "id_varco": 3,
        "nome_autostrada": "A4",
        "km": 120,
        "smart": false,
        "pioggia": true
    },
    {
        "id_varco": 4,
        "nome_autostrada": "A4",
        "km": 161,
        "smart": false,
        "pioggia": true
    },
    {
        "id_varco": 5,
        "nome_autostrada": "A14",
        "km": 75,
        "smart": true,
        "pioggia": false
    },
    {
        "id_varco": 6,
        "nome_autostrada": "A14",
        "km": 126,
        "smart": true,
        "pioggia": true
    },
    {
        "id_varco": 7,
        "nome_autostrada": "A22",
        "km": 40,
        "smart": false,
        "pioggia": true
    },
    {
        "id_varco": 8,
        "nome_autostrada": "A22",
        "km": 90,
        "smart": false,
        "pioggia": false
    }
]
```

- `GET /:id` – Cerca varco [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
{
    "id_varco": 3,
    "nome_autostrada": "A4",
    "km": 120,
    "smart": false,
    "pioggia": true,
    "utente": {
        "id_utente": 8,
        "nome": "",
        "cognome": "",
        "email": "varco_2@example.com",
        "ruolo": "varco",
        "tokens": 100
    }
}
```

- `POST /` – Crea varco [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
```json
{
    "nome_autostrada": "A16",
    "km": 40,
    "smart": "false",
    "pioggia": "true",
    "utente": 10
}
```
*Risposta:*
```json
{
    "id_varco": 9,
    "nome_autostrada": "A16",
    "km": 40,
    "smart": false,
    "pioggia": true
}
```

- `PUT /:id` – Modifica varco [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
```json
{
    "nome_autostrada": "A55",
    "km": 33
}
```
*Risposta:*
```json
[
    1,
    [
        {
            "id_varco": 9,
            "nome_autostrada": "A55",
            "km": 33,
            "smart": false,
            "pioggia": true
        }
    ]
]
```

- `DELETE /:id` – Elimina varco [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
{
    "message": "Varco eliminato con successo."
}
```

### Tratte (`/tratta`)
- `GET /` – Elenco tratte [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
[
    {
        "id_tratta": 1,
        "varco_in": {
            "id_varco": 1,
            "nome_autostrada": "A1",
            "km": 10,
            "smart": true,
            "pioggia": false
        },
        "varco_out": {
            "id_varco": 2,
            "nome_autostrada": "A1",
            "km": 50,
            "smart": true,
            "pioggia": false
        },
        "distanza": 39.7
    },
    {
        "id_tratta": 2,
        "varco_in": {
            "id_varco": 3,
            "nome_autostrada": "A4",
            "km": 120,
            "smart": false,
            "pioggia": true
        },
        "varco_out": {
            "id_varco": 4,
            "nome_autostrada": "A4",
            "km": 161,
            "smart": false,
            "pioggia": true
        },
        "distanza": 40.5
    },
    {
        "id_tratta": 3,
        "varco_in": {
            "id_varco": 5,
            "nome_autostrada": "A14",
            "km": 75,
            "smart": true,
            "pioggia": false
        },
        "varco_out": {
            "id_varco": 6,
            "nome_autostrada": "A14",
            "km": 126,
            "smart": true,
            "pioggia": true
        },
        "distanza": 50.6
    },
    {
        "id_tratta": 4,
        "varco_in": {
            "id_varco": 7,
            "nome_autostrada": "A22",
            "km": 40,
            "smart": false,
            "pioggia": true
        },
        "varco_out": {
            "id_varco": 8,
            "nome_autostrada": "A22",
            "km": 90,
            "smart": false,
            "pioggia": false
        },
        "distanza": 49.6
    }
]
```

- `GET /` – Cerca tratta [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
{
    "id_tratta": 3,
    "varco_in": {
        "id_varco": 5,
        "nome_autostrada": "A14",
        "km": 75,
        "smart": true,
        "pioggia": false
    },
    "varco_out": {
        "id_varco": 6,
        "nome_autostrada": "A14",
        "km": 126,
        "smart": true,
        "pioggia": true
    },
    "distanza": 50.6
}
```

- `POST /` – Crea tratta (varco_in, varco_out) [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
```json
{
    "varco_in": 3,
    "varco_out": 4,
}
```

*Risposta:*
```json
{
    "id_tratta": 5,
    "varco_in": 3,
    "varco_out": 4,
    "distanza": 41
}
```

- `PUT /:id` – Modifica tratta [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
```json
{
    "varco_in": 5,
    "varco_out": 6,
}
```

*Risposta:*
```json
{
    "id_tratta": 5,
    "varco_in": {
        "id_varco": 5,
        "nome_autostrada": "A14",
        "km": 75,
        "smart": true,
        "pioggia": false
    },
    "varco_out": {
        "id_varco": 6,
        "nome_autostrada": "A14",
        "km": 126,
        "smart": true,
        "pioggia": true
    },
    "distanza": 51
}
```

- `DELETE /:id` – Elimina tratta [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
{
    "message": "Tratta eliminata con successo."
}
```

### Veicoli (`/veicolo`)
- `GET /` – Elenco veicoli [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
[
    {
        "targa": "AB123CD",
        "tipo_veicolo": {
            "id_tipo_veicolo": 1,
            "tipo": "autovettura",
            "limite_velocita": 130
        },
        "utente": {
            "id_utente": 1,
            "nome": "Matteo",
            "cognome": "Sonaglioni",
            "email": "msonaglioni@example.com",
            "ruolo": "automobilista",
            "tokens": 100
        }
    },
    {
        "targa": "EF456GH",
        "tipo_veicolo": {
            "id_tipo_veicolo": 2,
            "tipo": "motociclo",
            "limite_velocita": 130
        },
        "utente": {
            "id_utente": 2,
            "nome": "Enzo",
            "cognome": "Cingoli",
            "email": "ecingoli@example.com",
            "ruolo": "automobilista",
            "tokens": 100
        }
    },
    {
        "targa": "IJ789KL",
        "tipo_veicolo": {
            "id_tipo_veicolo": 3,
            "tipo": "roulotte",
            "limite_velocita": 80
        },
        "utente": {
            "id_utente": 3,
            "nome": "Giuseppe",
            "cognome": "Verdi",
            "email": "gverdi@example.com",
            "ruolo": "automobilista",
            "tokens": 100
        }
    },
    {
        "targa": "MN321OP",
        "tipo_veicolo": {
            "id_tipo_veicolo": 4,
            "tipo": "autocarri",
            "limite_velocita": 130
        },
        "utente": {
            "id_utente": 4,
            "nome": "Mario",
            "cognome": "Bianchi",
            "email": "mbianchi@example.com",
            "ruolo": "automobilista",
            "tokens": 100
        }
    },
    {
        "targa": "QR654ST",
        "tipo_veicolo": {
            "id_tipo_veicolo": 5,
            "tipo": "autobus",
            "limite_velocita": 100
        },
        "utente": {
            "id_utente": 5,
            "nome": "Luigi",
            "cognome": "Verdi",
            "email": "lverdi@example.com",
            "ruolo": "automobilista",
            "tokens": 100
        }
    },
    {
        "targa": "UV987WX",
        "tipo_veicolo": {
            "id_tipo_veicolo": 6,
            "tipo": "pesante",
            "limite_velocita": 80
        },
        "utente": {
            "id_utente": 1,
            "nome": "Matteo",
            "cognome": "Sonaglioni",
            "email": "msonaglioni@example.com",
            "ruolo": "automobilista",
            "tokens": 100
        }
    },
    {
        "targa": "YZ741AB",
        "tipo_veicolo": {
            "id_tipo_veicolo": 7,
            "tipo": "eccezionale",
            "limite_velocita": 60
        },
        "utente": {
            "id_utente": 2,
            "nome": "Enzo",
            "cognome": "Cingoli",
            "email": "ecingoli@example.com",
            "ruolo": "automobilista",
            "tokens": 100
        }
    },
    {
        "targa": "CD852EF",
        "tipo_veicolo": {
            "id_tipo_veicolo": 1,
            "tipo": "autovettura",
            "limite_velocita": 130
        },
        "utente": {
            "id_utente": 3,
            "nome": "Giuseppe",
            "cognome": "Verdi",
            "email": "gverdi@example.com",
            "ruolo": "automobilista",
            "tokens": 100
        }
    },
    {
        "targa": "GH963IJ",
        "tipo_veicolo": {
            "id_tipo_veicolo": 2,
            "tipo": "motociclo",
            "limite_velocita": 130
        },
        "utente": {
            "id_utente": 4,
            "nome": "Mario",
            "cognome": "Bianchi",
            "email": "mbianchi@example.com",
            "ruolo": "automobilista",
            "tokens": 100
        }
    },
    {
        "targa": "KL159MN",
        "tipo_veicolo": {
            "id_tipo_veicolo": 3,
            "tipo": "roulotte",
            "limite_velocita": 80
        },
        "utente": {
            "id_utente": 5,
            "nome": "Luigi",
            "cognome": "Verdi",
            "email": "lverdi@example.com",
            "ruolo": "automobilista",
            "tokens": 100
        }
    }
]
```

- `GET /:targa` – Cerca veicolo [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
{
    "targa": "MN321OP",
    "tipo_veicolo": {
        "id_tipo_veicolo": 4,
        "tipo": "autocarri",
        "limite_velocita": 130
    },
    "utente": {
        "id_utente": 4,
        "nome": "Mario",
        "cognome": "Bianchi",
        "email": "mbianchi@example.com",
        "ruolo": "automobilista",
        "tokens": 100
    }
}
```

- `POST /` – Crea veicolo [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
```json
{
    "targa": "MN321OZ",
    "tipo_veicolo": 3,
    "utente": 2
}
```

*Risposta:*
```json
{
    "targa": "MN321OZ",
    "tipo_veicolo": 3,
    "utente": 2
}
```

- `PUT /:targa` – Modifica veicolo [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
```json
{
    "tipo_veicolo": 4,
    "utente": 1
}
```
*Risposta:*
```json
{
    "targa": "MN321OZ",
    "tipo_veicolo": {
        "id_tipo_veicolo": 4,
        "tipo": "autocarri",
        "limite_velocita": 130
    },
    "utente": {
        "id_utente": 1,
        "nome": "Matteo",
        "cognome": "Sonaglioni",
        "email": "msonaglioni@example.com",
        "ruolo": "automobilista",
        "tokens": 100
    }
}
```

- `DELETE /:targa` – Elimina veicolo [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
{
    "message": "Veicolo eliminato con successo."
}
```

### TipoVeicolo (`/tipoVeicolo`)
- `GET /` – Elenco tipo veicoli [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
[
    {
        "id_tipo_veicolo": 1,
        "tipo": "autovettura",
        "limite_velocita": 130
    },
    {
        "id_tipo_veicolo": 2,
        "tipo": "motociclo",
        "limite_velocita": 130
    },
    {
        "id_tipo_veicolo": 3,
        "tipo": "roulotte",
        "limite_velocita": 80
    },
    {
        "id_tipo_veicolo": 4,
        "tipo": "autocarri",
        "limite_velocita": 130
    },
    {
        "id_tipo_veicolo": 5,
        "tipo": "autobus",
        "limite_velocita": 100
    },
    {
        "id_tipo_veicolo": 6,
        "tipo": "pesante",
        "limite_velocita": 80
    },
    {
        "id_tipo_veicolo": 7,
        "tipo": "eccezionale",
        "limite_velocita": 60
    }
]
```

- `GET /:id` – Cerca tipo veicolo [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
{
    "id_tipo_veicolo": 2,
    "tipo": "motociclo",
    "limite_velocita": 130
}
```

- `POST /` – Crea tipo veicolo [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
```json
{
    "tipo": "Prova",
    "limite_velocita": 130
}
```

*Risposta:*
```json
{
    "id_tipo_veicolo": 8,
    "tipo": "Prova",
    "limite_velocita": 130
}
```

- `PUT /:id` – Modifica tipo veicolo [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
```json
{
    "tipo": "prova_2",
    "limite_velocita": 100
}
```

*Risposta:*
```json
{
    "id_tipo_veicolo": 8,
    "tipo": "prova_2",
    "limite_velocita": 100
}
```

- `DELETE /:id` – Elimina tipo veicolo [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
{
    "message": "Tipo di veicolo eliminato"
}
```

### Transiti (`/transito`)
- `GET /` – Elenco transiti [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
[
    {
        "id_transito": 1,
        "targa": "AB123CD",
        "tratta": 1,
        "data_in": "2025-06-28T08:00:00.000Z",
        "data_out": "2025-06-28T08:40:00.000Z",
        "velocita_media": 59.55,
        "delta_velocita": -70.45
    },
    {
        "id_transito": 2,
        "targa": "EF456GH",
        "tratta": 1,
        "data_in": "2025-06-28T09:00:00.000Z",
        "data_out": "2025-06-28T09:15:00.000Z",
        "velocita_media": 158.8,
        "delta_velocita": 28.8
    },
    {
        "id_transito": 3,
        "targa": "IJ789KL",
        "tratta": 2,
        "data_in": "2025-06-28T09:00:00.000Z",
        "data_out": "2025-06-28T09:25:00.000Z",
        "velocita_media": 97.2,
        "delta_velocita": 37.2
    },
    {
        "id_transito": 4,
        "targa": "MN321OP",
        "tratta": 2,
        "data_in": "2025-06-28T08:00:00.000Z",
        "data_out": "2025-06-28T08:45:00.000Z",
        "velocita_media": 54,
        "delta_velocita": -56
    },
    {
        "id_transito": 5,
        "targa": "QR654ST",
        "tratta": 3,
        "data_in": "2025-06-28T09:00:00.000Z",
        "data_out": "2025-06-28T09:25:00.000Z",
        "velocita_media": 121.44,
        "delta_velocita": 21.44
    },
    {
        "id_transito": 6,
        "targa": "UV987WX",
        "tratta": 3,
        "data_in": "2025-06-28T09:00:00.000Z",
        "data_out": "2025-06-28T09:20:00.000Z",
        "velocita_media": 151.8,
        "delta_velocita": 71.8
    },
    {
        "id_transito": 7,
        "targa": "YZ741AB",
        "tratta": 4,
        "data_in": "2025-06-28T09:00:00.000Z",
        "data_out": "2025-06-28T09:20:00.000Z",
        "velocita_media": 148.8,
        "delta_velocita": 88.8
    },
    {
        "id_transito": 8,
        "targa": "CD852EF",
        "tratta": 4,
        "data_in": "2025-06-28T08:00:00.000Z",
        "data_out": "2025-06-28T08:50:00.000Z",
        "velocita_media": 59.52,
        "delta_velocita": -70.48
    },
    {
        "id_transito": 9,
        "targa": "GH963IJ",
        "tratta": 1,
        "data_in": "2025-06-28T08:00:00.000Z",
        "data_out": "2025-06-28T08:40:00.000Z",
        "velocita_media": 59.55,
        "delta_velocita": -70.45
    },
    {
        "id_transito": 10,
        "targa": "KL159MN",
        "tratta": 2,
        "data_in": "2025-06-28T09:00:00.000Z",
        "data_out": "2025-06-28T09:25:00.000Z",
        "velocita_media": 97.2,
        "delta_velocita": 37.2
    }
]
```

- `GET /:id` – Cerca transito [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
{
    "id_transito": 3,
    "targa": "IJ789KL",
    "tratta": {
        "id_tratta": 2,
        "varco_in": 3,
        "varco_out": 4,
        "distanza": 40.5
    },
    "data_in": "2025-06-28T09:00:00.000Z",
    "data_out": "2025-06-28T09:25:00.000Z",
    "velocita_media": 97.2,
    "delta_velocita": 37.2,
    "veicolo": {
        "targa": "IJ789KL",
        "tipo_veicolo": 3,
        "utente": 3
    },
    "tipoVeicolo": {
        "id_tipo_veicolo": 3,
        "tipo": "roulotte",
        "limite_velocita": 80
    }
}
```

- `POST /manuale` – Inserimento da operatore o varco non smart [operatore/varco]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
```json
{
    "targa": "UV987WX",
    "tratta": 2,
    "data_in": "2025-06-28 08:00:00",
    "data_out": "2025-06-28 08:40:00"
}
```

*Risposta:*
```json
{
    "id_transito": 11,
    "targa": "UV987WX",
    "tratta": 2,
    "data_in": "2025-06-28T06:00:00.000Z",
    "data_out": "2025-06-28T16:40:00.000Z",
    "velocita_media": 3.79688,
    "delta_velocita": -56.20312
}
```

- `POST /smart` – Inserimento da varco smart [varco]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
{
  "": 
}
```

- `PUT /:id` – Modifica transito [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
```json
{
    "data_in": "2025-06-28T06:30:00.000Z",
    "data_out": "2025-06-28T06:40:00.000Z"
}
```

*Risposta:*
```json
[
    1,
    [
        {
            "id_transito": 11,
            "targa": "UV987WX",
            "tratta": 2,
            "data_in": "2025-06-28T06:30:00.000Z",
            "data_out": "2025-06-28T06:40:00.000Z",
            "velocita_media": 243,
            "delta_velocita": 163
        }
    ]
]
```

- `DELETE /:id` – Elimina transito [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```

*Risposta:*
```json
{
    "message": "Transito eliminato con successo."
}
```

### Multe (`/api/multe`)
- `GET /` – Elenco multe [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
```json
[
    {
        "id_multa": 1,
        "uuid_pagamento": "92c1e299-0ee0-4089-9092-1822a95fc3c1",
        "transito": 2,
        "importo": 150
    },
    {
        "id_multa": 2,
        "uuid_pagamento": "68af3843-9b7a-4067-9009-f684aea70af4",
        "transito": 3,
        "importo": 120
    },
    {
        "id_multa": 3,
        "uuid_pagamento": "48cffbd0-2bec-4946-a21e-077625a41f59",
        "transito": 5,
        "importo": 130
    },
    {
        "id_multa": 4,
        "uuid_pagamento": "e334be7f-0299-4e2e-b2d4-0918e2c86f87",
        "transito": 6,
        "importo": 180
    },
    {
        "id_multa": 5,
        "uuid_pagamento": "f6dc714a-1f5b-46a1-931d-78a297153302",
        "transito": 7,
        "importo": 200
    },
    {
        "id_multa": 6,
        "uuid_pagamento": "2a3fba50-3f95-40c4-bd61-6aca589d08ac",
        "transito": 10,
        "importo": 110
    }
]
```
*Risposta:*
```json
{
  "": 
}
```

- `GET /dettagli` – Lista multe per targa e periodo [operatore/automobilista]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
Params
```
targa: EF456GH
dataIn: 2025-01-28
dataOut: 2025-12-28
```

*Risposta:*
```json
[
    {
        "id_multa": 1,
        "uuid_pagamento": "92c1e299-0ee0-4089-9092-1822a95fc3c1",
        "importo": 150,
        "transito": {
            "id": 2,
            "targa": "EF456GH",
            "data_in": "2025-06-28T09:00:00.000Z",
            "data_out": "2025-06-28T09:15:00.000Z",
            "velocita_media": 158.8,
            "delta_velocita": 28.8,
            "tratta": {
                "id": 1,
                "distanza": 39.7,
                "varcoIn": {
                    "nome_autostrada": "A1",
                    "km": 10
                },
                "varcoOut": {
                    "nome_autostrada": "A1",
                    "km": 50
                }
            }
        },
        "condizioni_ambientali": "nessuna pioggia"
    }
]
```

- `POST /multe` - Inserimento da operatore [operatore]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
```json
{
  "": 
}
```

*Risposta:*
```json
{
  "": 
}
```

- `GET /download/:id` – Scarica PDF con QR code del bollettino di pagamento [operatore/automobilista]

*Richiesta Body/Query*
```bash
Authorization: Bearer {authToken}
```
```json
{
  "": 
}
```

*Risposta:*
```json
{
  "": 
}
```

---

## ⚙️ Setup & Installazione

Per l'installazione e la configurazione del progetto è necessario innanzitutto installare [Docker](https://www.docker.com/) e [docker-compose](https://docs.docker.com/compose/). Successivamente, bisogna eseguire la *clone* della repository. Per far ciò, è sufficiente eseguire i seguenti comandi sul proprio terminale:
```
# Clona il repository
git clone https://github.com/MattSona99/ProgettoPA.git

# Entra nella cartella del progetto
cd ProgettoPA

# Importa il file '.env' all'interno della directory principale

# Avvia il progetto
docker-compose up --build
```
Esempio di file .env
```
DB_NAME=progettoPA_DB
DB_USER=myuser
DB_PASSWORD=mypassword
DB_PORT=5432
DB_HOST=postgres

BACKEND_PORT=3000
JWT_SECRET=your_secret_key
```
Il sistema sarà in ascolto all'indirizzo `http://127.0.0.1:3000`. Le rotte API possono essere testate tramite [Postman](https://www.postman.com/).

## 💡 Scelte implementative

Per facilitare lo sviluppo didattico del progetto, sono state adottate alcune scelte implementative mirate.
Come già evidenziato, l'intero sistema è stato progettato secondo un approccio modulare, realizzato attraverso lo sviluppo di un backend utilizzato il pattern MVC, per facilitare possibili implementazioni e modifiche future.

Considerata la natura del progetto, che non include lo sviluppo di un frontend, le rotte sono state testate tramite Postman. Ogni rotta prevede meccanismi di autenticazione ed autorizzazione, modulati in base al ruolo dell'utente.

Per quanto riguarda l'implementazione della logica legata alle multe, si è scelto di considerare la presenza di condizioni ambientali avverse (pioggia) solo nei casi in cui nel Transito entrambi i varchi, di ingresso (`varco_in`) e di uscita (`varco_out`), riportino il campo `pioggia=true`. Questa scelta è stata adottata per garantire maggiore coerenza ed affidabilità nella rilevazione delle condizioni meteo, riducendo il rischio di penalizzazioni ingiustificate dovute a segnalazioni parziali o localizzate.


## 🧰 Strumenti utilizzati

Per lo sviluppo dell'applicazione presentata sono stati utilizzati i seguenti strumenti di lavoro:

* [Typescript](https://www.typescriptlang.org/) come linguaggio di programmazione principale;

* [Express.js](https://expressjs.com/) come framework per applicazioni Web per Node.js;

* [Node.js](https://nodejs.org/en) come sistema per la gestione di moduli e pacchetti;

* [Tesseract.js](https://github.com/tesseract-ocr/tesseract) per la lettura di file di testo nelle immagini;

* [Sequelize](https://sequelize.org/) per l'Object Relational Mapping (ORM);

* [Docker](https://www.docker.com/) come sistema di containerizzazione per il deployment dell'applicazione;

* [PostgreSQL](https://www.postgresql.org/) come database;

* [Postman](https://www.postman.com/) per il testing delle rotte API;

* [JWT](https://jwt.io/) per la trasmissione sicura di informazioni tra le parti

* [GitHub](https://github.com/) come piattaforma di condivisione e versioning del codice;

* [Visual Studio Code](https://code.visualstudio.com/) come editor di codice.

## 👥 Autori

|Nome | GitHub |
|-----------|--------|
|`Sonaglioni Matteo` | [Clicca qui!](https://github.com/MattSona99) |
|`Cingoli Enzo` | [Clicca qui!](https://github.com/enzoc2000) |
