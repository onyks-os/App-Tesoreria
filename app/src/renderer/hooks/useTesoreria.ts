import { useState, useEffect, useCallback } from "react";
import { Member, Purchase, FundMovement, FinancialSituation, Quota } from "../types";

/**
 * Custom Hook: useTesoreria
 * Manages global application state and IPC communication.
 * Handles data loading, caching, actions, and loading states.
 */
export const useTesoreria = () => {
    const [situazione, setSituazione] = useState<FinancialSituation>({
        fondo_cassa_reale: 0,
        fondi_vincolati: 0,
        disponibile_effettivo: 0,
        dettaglio_vincolato: [],
    });
    const [membri, setMembri] = useState<Member[]>([]);
    const [acquisti, setAcquisti] = useState<Purchase[]>([]);
    const [movimentiFondo, setMovimentiFondo] = useState<FundMovement[]>([]);
    const [backups, setBackups] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Higher-order helper to wrap async API calls with loading state.
     * @param {Function} fn - Async function to execute
     */
    const withLoading = async (fn: () => Promise<void>) => {
        setIsLoading(true);
        try {
            await fn();
        } catch (e) {
            console.error(e);
            // Optional: Add global error handling here
        } finally {
            setIsLoading(false);
        }
    };

    const loadData = useCallback(async () => {
        try {
            const [sit, mem, acq, mov, bks] = await Promise.all([
                window.api.getSituazione(),
                window.api.getMembri(),
                window.api.getAcquisti(),
                window.api.getMovimentiFondo(),
                window.api.getBackups(),
            ]);

            setSituazione(sit);
            setMembri(mem);
            setAcquisti(acq);
            setMovimentiFondo(mov);
            setBackups(bks);
        } catch (e) {
            console.error("Failed to load data:", e);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // WRAPPERS FOR API ACTIONS
    // Members
    const addMembro = async (m: Omit<Member, "id">) => {
        await withLoading(async () => {
            await window.api.addMembro(m);
            await loadData();
        });
    };

    const updateMembro = async (id: number, m: Omit<Member, "id">) => {
        await withLoading(async () => {
            await window.api.updateMembro(id, m);
            await loadData();
        });
    };

    const deleteMembro = async (id: number) => {
        await withLoading(async () => {
            await window.api.deleteMembro(id);
            await loadData();
        });
    };

    const toggleMovementVisibility = async (id: string) => {
        await window.api.toggleDashboardVisibility(id);
        await loadData();
    }

    // Purchases
    const createAcquisto = async (data: any) => {
        await withLoading(async () => {
            await window.api.createAcquisto(data);
            await loadData();
        });
    };

    const deleteAcquisto = async (id: number) => {
        await withLoading(async () => {
            await window.api.deleteAcquisto(id);
            await loadData();
        });
    };

    // Fund
    const addMovimentoFondo = async (data: { importo: number; descrizione: string }) => {
        await withLoading(async () => {
            await window.api.addMovimentoFondo(data);
            await loadData();
        });
    };

    const deleteMovimentoFondo = async (id: number) => {
        await withLoading(async () => {
            await window.api.deleteMovimentoFondo(id);
            await loadData();
        });
    };

    const updateAcquisto = async (data: any) => {
        await withLoading(async () => {
            await window.api.updateAcquisto(data);
            await loadData();
        });
    };

    const completaAcquisto = async (id: number) => {
        await withLoading(async () => {
            await window.api.completaAcquisto(id);
            await loadData();
        });
    };

    const triggerManualBackup = async () => {
        await window.api.triggerManualBackup();
        await loadData();
    };

    const restoreBackup = async (filename: string) => {
        await withLoading(async () => {
            await window.api.restoreBackup(filename);
            await loadData();
        });
    };

    const resetAnnual = async () => {
        await withLoading(async () => {
            await window.api.resetAnnualData();
            await loadData();
        });
    };

    const exportMembri = async () => {
        await window.api.exportMembri();
    };

    const importMembriExcel = async () => {
        const path = await window.api.selectFile();
        if (path) {
            await withLoading(async () => {
                await window.api.importMembriExcel(path);
                await loadData();
            });
        }
    };


    // Return state and action wrappers
    return {
        situazione,
        membri,
        acquisti,
        movimentiFondo,
        backups,
        isLoading,
        loadData,
        actions: {
            addMembro,
            updateMembro,
            deleteMembro,
            toggleMovementVisibility,
            createAcquisto,
            deleteAcquisto,
            addMovimentoFondo,
            deleteMovimentoFondo,
            updateAcquisto,
            completaAcquisto,
            triggerManualBackup,
            restoreBackup,
            resetAnnual,
            exportMembri,
            importMembriExcel
        }
    };
};
