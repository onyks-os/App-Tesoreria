import React, { useState } from "react";
import {
    CalendarDays,
    CheckCircle,
    Wallet,
    Edit2,
    Trash2,
    Search,
    FileWarning,
    FileSpreadsheet,
    Lock,
    Unlock,
    Save,
    CheckSquare,
    ShoppingCart,
    Check,
} from "lucide-react";
import { Purchase, Quota } from "../../types";
import { formatCurrency } from "../../utils/helpers";
import QuantityControl from "../common/QuantityControl";

/**
 * PurchaseDetails Props
 * @property {Purchase | null} acquisto - The currently selected purchase
 * @property {Quota[]} quote - List of quotas (member payments) related to this purchase
 * @property {boolean} isEditingQuotes - Whether 'edit mode' is active for quotas
 * @property {function} onEditAcquisto - Handler to edit purchase metadata
 * @property {function} onDeleteAcquisto - Handler to delete purchase
 * @property {function} onExportDebtors - Handler to export list of debtors
 * @property {function} onImportBank - Handler to import/match bank excel for this purchase
 * @property {function} onConclude - Handler to mark purchase as concluded
 * @property {function} onEnableQuoteEditing - Handler to enable quote editing mode
 * @property {function} onSaveQuotes - Handler to save buffered quote changes
 * @property {function} onUpdateQuota - Handler for local updates to quote values
 */
interface PurchaseDetailsProps {
    acquisto: Purchase | null;
    quote: Quota[];
    isEditingQuotes: boolean;
    onEditAcquisto: () => void;
    onDeleteAcquisto: () => void;
    onExportDebtors: (debtors: any[]) => void;
    onImportBank: () => void;
    onConclude: (diff: number, dovuto: number, versato: number) => void;
    onEnableQuoteEditing: () => void;
    onSaveQuotes: () => void;
    onUpdateQuota: (q: Quota, field: string, val: string | number) => void;
}

const PurchaseDetails: React.FC<PurchaseDetailsProps> = ({
    acquisto,
    quote,
    isEditingQuotes,
    onEditAcquisto,
    onDeleteAcquisto,
    onExportDebtors,
    onImportBank,
    onConclude,
    onEnableQuoteEditing,
    onSaveQuotes,
    onUpdateQuota,
}) => {
    const [searchQuota, setSearchQuota] = useState("");
    const [selectedQuotaIds, setSelectedQuotaIds] = useState<Set<number>>(new Set());
    const [bulkAmount, setBulkAmount] = useState("");

    const [isManualBulkMode, setIsManualBulkMode] = useState(false);

    // Reset selection when exiting edit mode
    React.useEffect(() => {
        if (!isEditingQuotes && !isManualBulkMode) {
            setSelectedQuotaIds(new Set());
        }
    }, [isEditingQuotes, isManualBulkMode]);

    if (!acquisto) {
        return (
            <div className="col-span-8 h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/50">
                <ShoppingCart size={48} className="mb-4 opacity-50" />
                <p>Seleziona un movimento</p>
            </div>
        );
    }

    const filteredQuote = quote.filter((q) =>
        (q.nome + " " + q.cognome + " " + q.matricola)
            .toUpperCase()
            .includes(searchQuota.toUpperCase())
    );

    const toggleSelection = (id: number) => {
        const newSet = new Set(selectedQuotaIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedQuotaIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedQuotaIds.size === filteredQuote.length) {
            setSelectedQuotaIds(new Set());
        } else {
            setSelectedQuotaIds(new Set(filteredQuote.map((q) => q.id)));
        }
    };

    const handleBulkUpdate = (action: "paid" | "unpaid" | "custom") => {
        const selected = quote.filter((q) => selectedQuotaIds.has(q.id));
        selected.forEach((q) => {
            let val = 0;
            if (action === "paid") val = q.quantita * acquisto.prezzo_unitario;
            else if (action === "unpaid") val = 0;
            else if (action === "custom") val = parseFloat(bulkAmount) || 0;
            onUpdateQuota(q, "importo_versato", val);
        });
    };

    const calculateDebtors = () => {
        return quote
            .filter((q) => q.importo_versato < q.quantita * acquisto.prezzo_unitario)
            .map((q) => ({
                Cognome: q.cognome,
                Nome: q.nome,
                Matricola: q.matricola,
                DaPagare:
                    q.quantita * acquisto.prezzo_unitario - q.importo_versato,
            }));
    };

    const handleConclude = () => {
        let d = 0,
            v = 0;
        quote.forEach((q: any) => {
            d += q.quantita * acquisto.prezzo_unitario;
            v += q.importo_versato;
        });
        onConclude(v - d, d, v);
    };

    const completato = (acquisto as any).completato;
    const dataChiusura = (acquisto as any).data_chiusura;
    const showBulkTools = isEditingQuotes || isManualBulkMode;

    return (
        <div className="col-span-8 flex flex-col h-full overflow-hidden">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 h-full flex flex-col">
                {/* HEADER */}
                <div className="p-6 border-b border-gray-800 flex flex-col gap-4 bg-gray-800/50 rounded-t-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            {/* TITOLO CON BADGE CONTEGGIO */}
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-bold text-white">
                                    {acquisto.nome_acquisto}
                                </h2>
                                {/* BADGE QUI SOTTO */}
                                {filteredQuote.length > 0 && (<span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30 self-center">
                                    {filteredQuote.length} {filteredQuote.length === 1 ? 'partecipante' : 'partecipanti'}
                                    {searchQuota && ` su ${quote.length}`}
                                </span>)}
                            </div>

                            {!showBulkTools && (
                                <div className="text-xs text-gray-500 mb-2 font-mono flex items-center mt-2">
                                    <CalendarDays size={12} className="mr-1" /> Creazione:{" "}
                                    {new Date(acquisto.data_creazione).toLocaleDateString()}
                                    {Number(completato) === 1 && (
                                        <span className="ml-3 text-green-600 flex items-center">
                                            <CheckCircle size={12} className="mr-1" /> Chiuso:{" "}
                                            {new Date(dataChiusura).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            )}

                            {acquisto.tipo === "spesa_fondo" ? (
                                <div className="text-purple-400 font-bold flex items-center mt-2">
                                    <Wallet className="mr-2" size={18} /> SPESA DIRETTA
                                </div>
                            ) : acquisto.tipo === "raccolta_fondo" ? (
                                <div className="text-green-400 font-bold flex items-center mt-2">
                                    <Wallet className="mr-2" size={18} /> RACCOLTA FONDI
                                </div>
                            ) : acquisto.tipo === "storico" ? (
                                <div className="text-orange-400 font-bold flex items-center mt-2">
                                    <Wallet className="mr-2" size={18} /> STORICO
                                </div>
                            ) : acquisto.tipo === "importo_cassa" ? (
                                <div className="text-blue-400 font-bold flex items-center mt-2">
                                    <Wallet className="mr-2" size={18} /> IMPORTO FONDO
                                    CASSA
                                </div>
                            ) : (
                                !showBulkTools && (
                                    <div className="text-sm text-gray-400 flex gap-4 items-center">
                                        <span>
                                            Prezzo Totale:{" "}
                                            <b className="text-white text-lg">
                                                {formatCurrency(acquisto.prezzo_unitario)}
                                            </b>
                                        </span>
                                        <span>
                                            Acconto:{" "}
                                            <b className="text-blue-300 text-lg">
                                                {formatCurrency(acquisto.acconto_fornitore || 0)}
                                            </b>
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={onEditAcquisto}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded font-bold text-xs flex items-center shadow-lg"
                            >
                                <Edit2 size={14} className="mr-1" /> MODIFICA
                            </button>
                            <button
                                onClick={onDeleteAcquisto}
                                className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded font-bold text-xs flex items-center shadow-lg"
                            >
                                <Trash2 size={14} className="mr-1" /> ELIMINA
                            </button>
                        </div>
                    </div>
                    {Number(completato) === 0 && acquisto.tipo !== "spesa_fondo" && (
                        <div className="flex justify-between items-end border-t border-gray-700 pt-4">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-2 text-gray-500"
                                    size={16}
                                />
                                <input
                                    placeholder="Cerca..."
                                    className="bg-black border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:border-blue-500 outline-none"
                                    value={searchQuota}
                                    onChange={(e) => setSearchQuota(e.target.value)}
                                />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onExportDebtors(calculateDebtors())}
                                    className="bg-orange-700 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center transition"
                                    title="Scarica Excel"
                                >
                                    <FileWarning className="mr-2" size={18} /> Morosi
                                </button>
                                <button
                                    onClick={onImportBank}
                                    className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center transition"
                                >
                                    <FileSpreadsheet className="mr-2" size={18} /> Banca
                                </button>
                                <button
                                    onClick={() => setIsManualBulkMode(!isManualBulkMode)}
                                    className={`px-4 py-2 rounded-lg font-bold flex items-center transition ${isManualBulkMode
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                        }`}
                                >
                                    <CheckSquare className="mr-2" size={18} /> Multi
                                </button>
                                <button
                                    onClick={handleConclude}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center transition"
                                >
                                    <CheckCircle className="mr-2" size={18} /> Concludi
                                </button>
                            </div>
                        </div>
                    )}
                    {Number(completato) === 1 && acquisto.tipo !== "spesa_fondo" && acquisto.tipo !== "importo_cassa" && acquisto.tipo !== "storico" && (
                        <div className="flex justify-between items-center border-t border-gray-700 pt-4 bg-gray-800/30 p-2 rounded mt-2">
                            <span className="text-sm text-gray-400 flex items-center">
                                <Lock size={14} className="mr-2" /> Movimento Concluso.
                            </span>
                            {!isEditingQuotes ? (
                                <button
                                    onClick={onEnableQuoteEditing}
                                    className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded font-bold text-xs flex items-center transition shadow-lg"
                                >
                                    <Unlock size={14} className="mr-2" /> MODIFICA QUOTE
                                </button>
                            ) : (
                                <button
                                    onClick={onSaveQuotes}
                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold text-xs flex items-center transition shadow-lg animate-pulse"
                                >
                                    <Save size={14} className="mr-2" /> SALVA MODIFICHE
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {/* BULK ACTIONS BAR (STICKY ABOVE TABLE) */}
                {showBulkTools && (
                    <div className="bg-blue-900/40 border-b border-blue-500/30 p-3 flex items-center justify-between animate-in slide-in-from-top-2 z-10">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-blue-200">
                                <CheckCircle size={16} className="inline mr-2" />
                                {selectedQuotaIds.size} SELEZIONATI
                            </span>
                            <div className="h-6 w-px bg-blue-500/50 mx-2"></div>
                            <button
                                onClick={() => handleBulkUpdate("paid")}
                                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-xs font-bold shadow-lg transition-transform hover:scale-105"
                            >
                                SEGNA PAGATO
                            </button>
                            <button
                                onClick={() => handleBulkUpdate("unpaid")}
                                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-xs font-bold shadow-lg transition-transform hover:scale-105"
                            >
                                AZZERA
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="Importo..."
                                className="bg-black/50 border border-blue-500/50 rounded px-3 py-1.5 w-32 text-white text-sm focus:border-blue-400 outline-none"
                                value={bulkAmount}
                                onChange={(e) => setBulkAmount(e.target.value)}
                            />
                            <button
                                onClick={() => handleBulkUpdate("custom")}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-xs font-bold shadow-lg transition-transform hover:scale-105"
                            >
                                IMPOSTA
                            </button>
                            <div className="h-6 w-px bg-blue-500/50 mx-2"></div>
                            <button
                                onClick={() => {
                                    if (isEditingQuotes) onSaveQuotes();
                                    else {
                                        setIsManualBulkMode(false);
                                        setSelectedQuotaIds(new Set());
                                    }
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-xs font-bold shadow-lg transition-transform hover:scale-105 flex items-center"
                            >
                                <Save size={14} className="mr-2" /> SALVA
                            </button>
                        </div>
                    </div>
                )}
                {/* BODY */}
                <div className="flex-1 overflow-y-auto">
                    {acquisto.tipo === "spesa_fondo" ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <CheckSquare size={64} className="mb-4 opacity-20" />
                            <p>Questa spesa è registrata come spesa diretta dal fondo cassa.</p>
                            <p className="text-sm opacity-60">
                                Nessuna quota soci da gestire.
                            </p>
                        </div>
                    ) : acquisto.tipo == "importo_cassa" ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <CheckSquare size={64} className="mb-4 opacity-20" />
                            <p>Questa spesa è registrata come importo del fondo cassa.</p>
                            <p className="text-sm opacity-60">
                                Nessuna quota soci da gestire.
                            </p>
                        </div>
                    ) : acquisto.tipo == "storico" ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <CheckSquare size={64} className="mb-4 opacity-20" />
                            <p>Questa spesa è registrata come transazione storica.</p>
                            <p className="text-sm opacity-60">
                                Nessuna quota soci da gestire.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-950 text-gray-500 text-xs uppercase sticky top-0">
                                <tr>
                                    {showBulkTools && (
                                        <th className="p-4 w-12 text-center">
                                            <div
                                                onClick={toggleSelectAll}
                                                className={`w-6 h-6 mx-auto rounded-md border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${selectedQuotaIds.size === filteredQuote.length &&
                                                    filteredQuote.length > 0
                                                    ? "bg-blue-600 border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                                                    : "bg-gray-900 border-gray-600 hover:border-gray-400 hover:scale-105"
                                                    }`}
                                            >
                                                {selectedQuotaIds.size === filteredQuote.length &&
                                                    filteredQuote.length > 0 && (
                                                        <Check size={16} className="text-white" strokeWidth={3} />
                                                    )}
                                            </div>
                                        </th>
                                    )}
                                    <th className="p-4">Membro</th>
                                    <th className="p-4 text-center">Qtà</th>
                                    <th className="p-4 text-right">Dovuto</th>
                                    <th className="p-4 text-right">Versato</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQuote.map((q) => {
                                    const dov = q.quantita * acquisto.prezzo_unitario;
                                    const isDisabled = completato && !isEditingQuotes;
                                    return (
                                        <tr
                                            key={q.id}
                                            className={`border-b border-gray-800 transition ${selectedQuotaIds.has(q.id) ? "bg-blue-900/10" : "hover:bg-gray-800/30"
                                                }`}
                                        >
                                            {showBulkTools && (
                                                <td className="p-4 text-center">
                                                    <div
                                                        onClick={() => toggleSelection(q.id)}
                                                        className={`w-6 h-6 mx-auto rounded-md border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${selectedQuotaIds.has(q.id)
                                                            ? "bg-blue-600 border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                                                            : "bg-gray-900 border-gray-600 hover:border-gray-400 hover:scale-105"
                                                            }`}
                                                    >
                                                        {selectedQuotaIds.has(q.id) && (
                                                            <Check size={16} className="text-white" strokeWidth={3} />
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="p-4">
                                                <div className="font-bold text-base text-white">
                                                    {q.cognome} {q.nome}
                                                </div>
                                                {q.matricola && (
                                                    <div className="font-mono text-xs text-blue-300">
                                                        {q.matricola}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center">
                                                    {acquisto.tipo === "raccolta_fondo" ? (
                                                        <span className="text-gray-500 font-bold">-</span>
                                                    ) : (
                                                        <QuantityControl
                                                            value={q.quantita}
                                                            onChange={(v) =>
                                                                onUpdateQuota(q, "quantita", v)
                                                            }
                                                            disabled={isDisabled}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-mono font-bold text-white">
                                                {formatCurrency(dov)}
                                            </td>
                                            <td className="p-4 text-right">
                                                <input
                                                    type="number"
                                                    disabled={isDisabled}
                                                    className={`bg-black border rounded p-2 w-24 text-right font-bold text-lg outline-none ${q.importo_versato < 0 || q.importo_versato > dov
                                                        ? "border-red-500 text-red-500"
                                                        : "border-gray-700 text-white focus:border-blue-500"
                                                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""
                                                        }`}
                                                    value={q.importo_versato}
                                                    onChange={(e) =>
                                                        onUpdateQuota(
                                                            q,
                                                            "importo_versato",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseDetails;
