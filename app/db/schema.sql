-- Database Schema for App-Tesoreria
-- This file documents the structure created in db.ts

-- 1. Membri (Members)
-- Stores personal information of association members.
CREATE TABLE IF NOT EXISTS membri (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    matricola TEXT,
    deleted_at DATETIME DEFAULT NULL -- Soft delete support
);

-- 2. Acquisti (Purchases / Events)
-- Represents a financial event (Expense, Fund Collection, or Direct Fund Movement).
CREATE TABLE IF NOT EXISTS acquisti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_acquisto TEXT NOT NULL,
    prezzo_unitario REAL NOT NULL,
    completato BOOLEAN DEFAULT 0, -- 0 = Open, 1 = Closed
    data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_chiusura DATETIME DEFAULT NULL,
    tipo TEXT DEFAULT 'acquisto', -- 'acquisto', 'raccolta_fondo', 'movimento'
    acconto_fornitore REAL DEFAULT 0, -- Amount paid in advance by the fund
    hidden BOOLEAN DEFAULT 0 -- UI visibility toggle
);

-- 3. Quote Membri (Member Shares)
-- Junction table linking Members to Purchases, tracking individual payments.
CREATE TABLE IF NOT EXISTS quote_membri (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    acquisto_id INTEGER NOT NULL,
    membro_id INTEGER NOT NULL,
    quantita INTEGER DEFAULT 1, -- Multiplier (e.g., 2 t-shirts)
    importo_versato REAL DEFAULT 0, -- Amount actually paid by member
    FOREIGN KEY (acquisto_id) REFERENCES acquisti(id) ON DELETE CASCADE,
    FOREIGN KEY (membro_id) REFERENCES membri(id) ON DELETE CASCADE
);

-- 4. Fondo Cassa (Cash Fund)
-- Direct movements in/out of the cash fund not linked to specific members.
CREATE TABLE IF NOT EXISTS fondo_cassa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    importo REAL NOT NULL, -- Positive = Income, Negative = Expense
    descrizione TEXT,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    hidden BOOLEAN DEFAULT 0
);

-- Note: The application also checks and applies migrations at runtime if needed,
-- such as adding the 'tipo', 'acconto_fornitore', and 'hidden' columns if missing.