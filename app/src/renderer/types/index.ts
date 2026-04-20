export interface Member {
    id: number;
    nome: string;
    cognome: string;
    matricola: string;
}

export interface Quota {
    id: number;
    membro_id: number;
    nome: string;
    cognome: string;
    matricola: string;
    quantita: number;
    importo_versato: number;
}

export interface Purchase {
    id: number;
    nome_acquisto: string;
    prezzo_unitario: number;
    acconto_fornitore: number;
    data_creazione: string;
    tipo: string;
    completato?: boolean;
    data_chiusura?: string;
}

export interface FundMovement {
    id: string;
    importo: number;
    descrizione: string;
    data: string;
    hidden?: boolean;
}

export interface VincolatoDetail {
    purchase_name: string;
    raccolto: number;
    acconto_speso: number;
    vincolato_residuo: number;
}

export interface FinancialSituation {
    fondo_cassa_reale: number;
    fondi_vincolati: number;
    disponibile_effettivo: number;
    dettaglio_vincolato: VincolatoDetail[];
}

declare global {
    interface Window {
        api: any;
    }
}
