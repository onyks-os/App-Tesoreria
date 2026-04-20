# Documentazione Tecnica di Design (TDD) - App Tesoreria

## 1. Panoramica del Sistema

**App Tesoreria** è un'applicazione desktop standalone per la gestione finanziaria di enti associativi. È progettata per funzionare completamente offline, garantendo privacy e persistenza locale dei dati.

### Stack Tecnologico
*   **Runtime**: Electron (Separazione Main/Renderer process)
*   **Frontend**: React 18 + TypeScript + Vite
*   **UI Framework**: TailwindCSS + Lucide Icons
*   **Backend Locale**: Node.js (Eseguito nel processo Main di Electron)
*   **Database**: `better-sqlite3` (SQLite con journaling WAL)
*   **Interfaccia S.O.**: IPC (Inter-Process Communication) per dialogo sicuro tra UI e Sistema.

---

## 2. Architettura Software

L'applicazione segue il pattern **Electron MVC-like**, dove:
*   **Model**: Il database SQLite gestito da `db.ts` nel processo Main.
*   **View**: L'interfaccia React nel processo Renderer.
*   **Controller**: I bridge IPC (`preload.ts`) e gli handler nel `main/index.ts` che smistano le richieste.

### Diagramma di Flusso Dati
1.  **UI (React)** richiede dati (es. `getSituazione`) tramite `window.api`.
2.  **Preload Script** inoltra la chiamata via `ipcRenderer.invoke`.
3.  **Main Process** intercetta l'evento, interroga SQLite tramite `db.ts`.
4.  **Database** restituisce i risultati crudi.
5.  **Main Process** restituisce i dati alla UI (Promise resolved).
6.  **Custom Hook (`useTesoreria`)** aggiorna lo stato locale React.

---

## 3. Schema Database (SQLite)

Il database è normalizzato e consiste nelle seguenti tabelle principali:

### `membri`
Anagrafica dei soci.
*   `id` (PK, Autoinc)
*   `nome`, `cognome`: Testo
*   `matricola`: Opzionale, per riferimenti esterni.
*   `deleted_at`: Soft delete per mantenere lo storico contabile.

### `acquisti` (Movimenti)
Rappresenta un evento finanziario (spesa, raccolta fondi o movimento fondo).
*   `id` (PK)
*   `nome_acquisto`: Descrizione evento.
*   `prezzo_unitario`: Costo per singolo (o totale in base alla logica).
*   `acconto_fornitore`: Spese anticipate dal fondo per questo acquisto.
*   `tipo`: `acquisto` (spesa da dividere), `raccolta_fondo` (entrata da dividere), `movimento` (diretto sul fondo).
*   `completato`: `0` (Aperto), `1` (Chiuso/Congelato).
*   `data_creazione`: Timestamp.

### `quote_membri`
Tabella di giunzione che lega Membri e Acquisti.
*   `id` (PK)
*   `acquisto_id` (FK -> acquisti)
*   `membro_id` (FK -> membri)
*   `quantita`: Moltiplicatore quota (default 1).
*   `importo_versato`: Quanto il membro ha effettivamente pagato per questo evento.

### `fondo_cassa`
Registro delle movimentazioni dirette del fondo (extra-acquisti).
*   `id` (PK)
*   `importo`: Positivo (entrata) o Negativo (uscita).
*   `descrizione`: Causale.
*   `data`: Timestamp.

---

## 4. Moduli Core

### `db.ts` (Main Process)
È il cuore logico dell'applicazione. Gestisce:
*   **Inizializzazione**: Crea le tabelle se non esistono (`initDB`).
*   **Calcoli Finanziari**: `getSituazioneGlobale` calcola in tempo reale:
    *   *Fondo Cassa Reale*: Somma algebrica di tutti i flussi.
    *   *Vincolato*: Somma raccolta per eventi aperti - Acconti pagati per essi.
    *   *Disponibile*: Reale - Vincolato.
*   **Operazioni CRUD**: Tutte le query SQL passano di qui.
*   **Backup/Ripristino**: Gestione rotativa backup automatici e reset.

### `useTesoreria.ts` (Renderer Hook)
Custom Hook che centralizza la logica di stato del frontend.
*   Mantiene lo stato sincronizzato (`situazione`, `membri`, `acquisti`).
*   Espone l'oggetto `actions` per invocare le funzioni di backend.
*   Gestisce lo stato di caricamento `isLoading`.

### `Settings.tsx` & Reset
Il modulo impostazioni permette gestione avanzata:
*   **Reset Annuale**: Pulisce movimenti mantenendo i membri.
*   **Hard Reset**: (`hardResetDB`) Droppa le tabelle, chiude la connessione SQL e reinizializza il DB da zero.

---

## 5. Sicurezza e Integrità

*   **Sanitizzazione**: Better-SQLite3 usa prepared statements per prevenire SQL Injection.
*   **Integrità Referenziale**: FK su `quote_membri` con `ON DELETE CASCADE` (dove applicabile) o soft-delete per preservare la storia.
*   **Backup**: Backup automatico ad ogni avvio e pre-reset critici. I file sono salvati nella `userData` directory.
