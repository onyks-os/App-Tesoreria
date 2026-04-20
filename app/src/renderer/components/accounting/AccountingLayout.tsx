import React, { useState, useEffect } from "react";
import PurchaseCreation from "./PurchaseCreation";
import PurchaseDetails from "./PurchaseDetails";
import EditPurchaseModal from "./modals/EditPurchaseModal";
import SelectMembersModal from "./modals/SelectMembersModal";
import BankMatchModal from "./modals/BankMatchModal";
import ImportWizardModal from "./modals/ImportWizardModal";
import { Purchase, Quota, Member } from "../../types";
import CustomModal from "../common/CustomModal";
import { CheckCircle, ArrowRight } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

/**
 * AccountingLayout Props
 * @interface AccountingLayoutProps
 * @property {Purchase[]} acquisti - List of purchases
 * @property {Member[]} membri - List of members
 * @property {function} onCreateAcquisto - Handler to create a purchase
 * @property {function} onUpdateAcquisto - Handler to update a purchase
 * @property {function} onDeleteAcquisto - Handler to delete a purchase
 * @property {function} onOpenGlobalModal - Handler to open app-level modals
 */
interface AccountingLayoutProps {
    acquisti: Purchase[];
    membri: Member[];
    onCreateAcquisto: (data: any) => Promise<void>;
    onUpdateAcquisto: (data: any) => Promise<void>;
    onDeleteAcquisto: (id: number) => Promise<void>;
    onCompletaAcquisto: (id: number) => Promise<void>;
    onOpenGlobalModal: (view: string, data?: any) => void;
}

/**
 * Main Layout for Accounting Management.
 * Manages PurchaseCreation, PurchaseDetails, and local modals.
 */
const AccountingLayout: React.FC<AccountingLayoutProps> = ({
    acquisti,
    membri,
    onCreateAcquisto,
    onUpdateAcquisto,
    onDeleteAcquisto,
    onCompletaAcquisto,
    onOpenGlobalModal,
}) => {
    const [selectedAcquisto, setSelectedAcquisto] = useState<Purchase | null>(
        null
    );
    const [quote, setQuote] = useState<Quota[]>([]);
    const [tempQuotes, setTempQuotes] = useState<Quota[]>([]);
    const [isEditingQuotes, setIsEditingQuotes] = useState(false);

    // --- SELECTION STATE (NEW PURCHASE) ---
    // Stores IDs of members manually selected for a new purchase
    const [selectedMembersForPurchase, setSelectedMembersForPurchase] = useState<
        number[]
    >([]);

    // --- MODAL STATES (LOCAL) ---
    const [modalView, setModalView] = useState<string>("none");

    // Sync selectedAcquisto with acquisti prop to prevent stale data after updates
    useEffect(() => {
        if (selectedAcquisto) {
            const updated = acquisti.find((a) => a.id === selectedAcquisto.id);
            if (updated && updated !== selectedAcquisto) {
                setSelectedAcquisto(updated);
            }
        }
    }, [acquisti]);
    const [modalData, setModalData] = useState<any>(null); // For passing context data to modals (e.g. edit/create context)

    // For storing matches from bank analysis excel
    const [excelMatches, setExcelMatches] = useState<any[]>([]);

    /**
     * Selects a purchase and loads its associated quotes (debtors/payers).
     * @param {Purchase | null} a - The purchase to select
     */
    const selectAcquistoAndLoadQuotes = async (a: Purchase | null) => {
        setSelectedAcquisto(a);
        if (a) {
            const q = await window.api.getQuote(a.id);
            setQuote(q);
        } else {
            setQuote([]);
        }
        setIsEditingQuotes(false);
    };

    const updateQuotaLocal = (
        q: Quota,
        field: string,
        val: string | number
    ) => {
        let v = typeof val === "string" ? parseFloat(val) : val;
        if (isNaN(v) || v < 0) return;

        const newQta = field === "quantita" ? v : q.quantita;
        const newVersato = field === "importo_versato" ? v : q.importo_versato;

        if (isEditingQuotes) {
            setTempQuotes((prev) =>
                prev.map((i) =>
                    i.id === q.id
                        ? { ...i, quantita: newQta, importo_versato: newVersato }
                        : i
                )
            );
        } else {
            window.api
                .updateQuota({
                    id: q.id,
                    qta: newQta,
                    versato: newVersato,
                })
                .then(async () => {
                    if (selectedAcquisto) {
                        const updated = await window.api.getQuote(selectedAcquisto.id);
                        setQuote(updated);
                    }
                });
        }
    };

    const handleSaveBufferedQuotes = async () => {
        for (const q of tempQuotes) {
            await window.api.updateQuota({
                id: q.id,
                qta: q.quantita,
                versato: q.importo_versato,
            });
        }
        if (selectedAcquisto) {
            const updated = await window.api.getQuote(selectedAcquisto.id);
            setQuote(updated);
        }
        setIsEditingQuotes(false);
    };

    const handleBankImportForCreation = async () => {
        const path = await window.api.selectFile();
        if (!path) return;
        try {
            const result = await window.api.analyzeExcelBank(path);
            setExcelMatches(result.matched);
            setModalView("import_wizard");
        } catch (e: any) {
            onOpenGlobalModal("alert", { title: "Errore", msg: e.message });
        }
    };

    const handleBankImportForMatch = async () => {
        const path = await window.api.selectFile();
        if (!path) return;
        try {
            const result = await window.api.analyzeExcelBank(path);
            setExcelMatches(result.matched);
            setModalView("bank_match");
        } catch (e: any) {
            onOpenGlobalModal("alert", { title: "Errore", msg: e.message });
        }
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-8 h-full">
                <PurchaseCreation
                    acquisti={acquisti}
                    selectedAcquistoId={selectedAcquisto?.id || null}
                    onSelectAcquisto={selectAcquistoAndLoadQuotes}
                    onCreate={async (data) => {
                        let targetIds = null;
                        if (data.tipo !== "spesa_fondo" && data.tipo !== "storico" && data.tipo !== "importo_cassa" && selectedMembersForPurchase.length > 0) {
                            targetIds = selectedMembersForPurchase;
                        }

                        await onCreateAcquisto({ ...data, targetMemberIds: targetIds });
                        setSelectedMembersForPurchase([]);
                    }}
                    onOpenMemberSelector={() => {
                        setModalData({ context: "create" });
                        setModalView("select_members");
                    }}
                    onOpenImportWizard={handleBankImportForCreation}
                    selectedMemberCount={selectedMembersForPurchase.length}
                />
                <PurchaseDetails
                    acquisto={selectedAcquisto}
                    quote={isEditingQuotes ? tempQuotes : quote}
                    isEditingQuotes={isEditingQuotes}
                    onEditAcquisto={() => setModalView("edit_acquisto")}
                    onDeleteAcquisto={() => setModalView("confirm_delete")}
                    onExportDebtors={async (debtors) => {
                        if (debtors.length === 0)
                            return onOpenGlobalModal("alert", {
                                title: "Nessun Moroso",
                                variant: "success",
                                msg: "Tutti hanno pagato!",
                            });
                        await window.api.exportDebtors({
                            acquistoNome: selectedAcquisto?.nome_acquisto,
                            debtors,
                        });
                    }}
                    onImportBank={handleBankImportForMatch}
                    onConclude={(diff, dovuto, versato) => {
                        setModalData({ diff, dovuto, versato });
                        setModalView("confirm_conclude");
                    }
                    }
                    onEnableQuoteEditing={() => {
                        setTempQuotes([...quote]);
                        setIsEditingQuotes(true);
                    }}
                    onSaveQuotes={handleSaveBufferedQuotes}
                    onUpdateQuota={updateQuotaLocal}
                />
            </div>

            {/* --- LOCAL MODALS --- */}
            <EditPurchaseModal
                isOpen={modalView === "edit_acquisto"}
                onClose={() => setModalView("none")}
                originalAcquisto={selectedAcquisto}
                onSave={async (data) => {
                    const targetIds = modalData?.selection ? modalData.selection : null;
                    await onUpdateAcquisto({ ...data, targetMemberIds: targetIds });
                    if (selectedAcquisto) {
                        selectAcquistoAndLoadQuotes(selectedAcquisto);
                    }
                }}
                onOpenMemberSelector={() => {
                    const currentIds = quote.map(q => q.membro_id);
                    setModalData({ context: "edit", selection: currentIds });
                    setModalView("select_members");
                }}
                selectedMemberCount={modalData?.selection?.length || quote.length} // Just a display
            />

            <SelectMembersModal
                isOpen={modalView === "select_members"}
                onClose={() => setModalView("none")}
                membri={membri}
                initialSelection={
                    modalData?.context === "edit" ? (modalData.selection || []) : selectedMembersForPurchase
                }
                onConfirm={(ids) => {
                    if (modalData?.context === "edit") {
                        setModalData({ ...modalData, selection: ids });
                    } else {
                        setSelectedMembersForPurchase(ids);
                    }
                    setModalView("none");
                    if (modalData?.context === "edit") setModalView("edit_acquisto");
                }}
            />

            <BankMatchModal
                isOpen={modalView === "bank_match"}
                onClose={() => setModalView("none")}
                matches={excelMatches}
                onConfirm={async (indices) => {
                    for (const i of indices) {
                        const m = excelMatches[i];
                        const q = quote.find((x) => x.membro_id === m.membro_id);
                        if (q) {
                            await window.api.updateQuota({
                                id: q.id,
                                qta: q.quantita,
                                versato: m.importo_trovato,
                            });
                        }
                    }
                    if (selectedAcquisto) {
                        const updated = await window.api.getQuote(selectedAcquisto.id);
                        setQuote(updated);
                    }
                    setModalView("none");
                }}
            />

            <ImportWizardModal
                isOpen={modalView === "import_wizard"}
                onClose={() => setModalView("none")}
                matches={excelMatches}
                onConfirm={(indices, markAsPaid) => {
                    const aggregationMap = new Map<number, number>();
                    indices.forEach((idx) => {
                        const m = excelMatches[idx];
                        const currentTotal = aggregationMap.get(m.membro_id) || 0;
                        const amountToAdd = markAsPaid ? m.importo_trovato : 0;
                        aggregationMap.set(m.membro_id, currentTotal + amountToAdd);
                    });

                    const selectedPeople = Array.from(aggregationMap.entries()).map(
                        ([id, versato]) => ({
                            id: id,
                            versato: versato,
                        })
                    );
                    setSelectedMembersForPurchase(selectedPeople as any);
                    setModalView("none");
                }}
            />

            {/* Confirm Delete Purchase */}
            <CustomModal
                isOpen={modalView === "confirm_delete"}
                title="Elimina Movimento"
                onClose={() => setModalView("none")}
                variant="danger"
                actions={
                    <>
                        <button onClick={() => setModalView("none")} className="px-4 py-2 opacity-70 hover:opacity-100">Annulla</button>
                        <button onClick={async () => {
                            if (selectedAcquisto) {
                                await onDeleteAcquisto(selectedAcquisto.id);
                                selectAcquistoAndLoadQuotes(null);
                            }
                            setModalView("none");
                        }} className="bg-red-600 px-4 py-2 rounded">Conferma</button>
                    </>
                }
            >
                Sicuro di voler eliminare questo movimento?
            </CustomModal>

            {/* Confirm Conclude */}
            {modalView === "confirm_conclude" && (
                <CustomModal
                    isOpen={true}
                    title="Riepilogo Chiusura"
                    onClose={() => setModalView("none")}
                    actions={
                        <button onClick={async () => {
                            if (selectedAcquisto) {
                                await onCompletaAcquisto(selectedAcquisto.id);
                                selectAcquistoAndLoadQuotes(null);
                            }
                            setModalView("none");
                        }} className="bg-green-600 px-4 py-2 rounded font-bold">Conferma Chiusura</button>
                    }
                >
                    <div className="flex flex-col gap-6 p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Totale Dovuto</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(modalData?.dovuto || 0)}</p>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Totale Versato</p>
                                <p className="text-2xl font-bold text-blue-400">{formatCurrency(modalData?.versato || 0)}</p>
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center ${(modalData?.diff || 0) > 0
                            ? "bg-green-900/20 border-green-500/30 text-green-400"
                            : (modalData?.diff || 0) < 0
                                ? "bg-red-900/20 border-red-500/30 text-red-400"
                                : "bg-gray-800 border-gray-700 text-gray-400"
                            }`}>
                            <p className="opacity-80 text-sm uppercase font-bold mb-2">Differenza (Bilancio)</p>
                            <p className="text-4xl font-bold">{formatCurrency(modalData?.diff || 0)}</p>
                            {(modalData?.diff || 0) > 0 && <p className="text-sm mt-2 opacity-80">Hai incassato più del necessario.</p>}
                            {(modalData?.diff || 0) < 0 && <p className="text-sm mt-2 opacity-80">Mancano fondi per coprire la spesa.</p>}
                            {(modalData?.diff || 0) === 0 && <p className="text-sm mt-2 opacity-80">I conti tornano perfettamente.</p>}
                        </div>
                    </div>
                </CustomModal>
            )}

        </>
    );
};

export default AccountingLayout;
