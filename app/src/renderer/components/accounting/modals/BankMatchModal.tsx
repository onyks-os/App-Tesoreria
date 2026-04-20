import React, { useState, useMemo } from "react";
import {
    FileSpreadsheet,
    X,
    ListChecks,
    CalendarDays,
    Search,
    Download,
} from "lucide-react";
import { formatCurrency } from "../../../utils/helpers";

interface BankMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    matches: any[];
    onConfirm: (selectedIndices: number[]) => Promise<void>;
}

const BankMatchModal: React.FC<BankMatchModalProps> = ({
    isOpen,
    onClose,
    matches,
    onConfirm,
}) => {
    const [selectedMatches, setSelectedMatches] = useState<number[]>([]);
    const [search, setSearch] = useState("");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");

    // Auto-select all on open if matches change?
    React.useEffect(() => {
        if (isOpen && matches.length > 0) {
            setSelectedMatches(matches.map((_, i) => i));
        }
    }, [isOpen, matches]);

    const filteredMatches = useMemo(
        () =>
            matches
                .map((m, i) => ({ ...m, originalIndex: i }))
                .filter((m) => {
                    const textMatch =
                        m.nome_trovato.toUpperCase().includes(search.toUpperCase()) ||
                        m.linea_originale.toUpperCase().includes(search.toUpperCase());
                    if (!textMatch) return false;
                    if (m.data_movimento && (dateStart || dateEnd)) {
                        const mDate = new Date(m.data_movimento);
                        mDate.setHours(0, 0, 0, 0);
                        if (dateStart && mDate < new Date(dateStart)) return false;
                        if (dateEnd && mDate > new Date(dateEnd)) return false;
                    }
                    return true;
                }),
        [matches, search, dateStart, dateEnd]
    );

    const toggleMatch = (idx: number) => {
        setSelectedMatches((prev) =>
            prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/95 z-50 flex items-center justify-center p-8">
            <div className="bg-gray-900 w-full max-w-6xl h-[90vh] rounded-2xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-700 flex justify-between bg-gray-800">
                    <h3 className="text-xl font-bold flex items-center text-green-500">
                        <FileSpreadsheet className="mr-2" /> Salda Debiti da Banca
                    </h3>
                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4 bg-gray-800/50 border-b border-gray-700 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => setSelectedMatches(matches.map((_, i) => i))}
                            className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded flex items-center"
                        >
                            <ListChecks size={14} className="mr-1" /> TUTTI
                        </button>
                        <button
                            onClick={() => setSelectedMatches([])}
                            className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded flex items-center"
                        >
                            <X size={14} className="mr-1" /> NESSUNO
                        </button>
                        <div className="h-8 w-px bg-gray-700 mx-2"></div>
                        <div className="flex items-center gap-2">
                            <CalendarDays size={16} className="text-gray-500" />
                            <input
                                type="date"
                                className="bg-black border border-gray-600 rounded p-1 text-sm text-gray-300"
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                            />
                            <span className="text-gray-600">-</span>
                            <input
                                type="date"
                                className="bg-black border border-gray-600 rounded p-1 text-sm text-gray-300"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Cerca testo..."
                            className="bg-black border border-gray-600 rounded-full pl-10 pr-4 py-2 text-sm w-48 focus:border-green-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-400">
                        Selezionati: <b className="text-white">{selectedMatches.length}</b>{" "}
                        / {matches.length}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-gray-500 uppercase text-xs sticky top-0 bg-gray-900 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 w-10 text-center">✓</th>
                                <th className="p-4">Data</th>
                                <th className="p-4">Membro</th>
                                <th className="p-4">Importo</th>
                                <th className="p-4">Dettaglio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMatches.map((m) => (
                                <tr
                                    key={m.originalIndex}
                                    className={`border-b border-gray-800 cursor-pointer transition-colors ${selectedMatches.includes(m.originalIndex)
                                            ? "bg-green-900/20 hover:bg-green-900/30"
                                            : "hover:bg-gray-800/50"
                                        }`}
                                    onClick={() => toggleMatch(m.originalIndex)}
                                >
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedMatches.includes(m.originalIndex)}
                                            readOnly
                                            className="accent-green-500 w-4 h-4 cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-4 text-gray-400 text-xs">
                                        {m.data_movimento
                                            ? new Date(m.data_movimento).toLocaleDateString()
                                            : "-"}
                                    </td>
                                    <td className="p-4 font-bold text-white">{m.nome_trovato}</td>
                                    <td className="p-4 font-mono text-green-400 font-bold">
                                        {formatCurrency(m.importo_trovato)}
                                    </td>
                                    <td className="p-4 text-xs text-gray-500 truncate max-w-lg font-mono">
                                        {m.linea_originale}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 border-t border-gray-700 bg-gray-800 flex justify-end">
                    <button
                        onClick={() => onConfirm(selectedMatches)}
                        className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg font-bold shadow-lg text-white flex items-center"
                    >
                        <Download className="mr-2" size={20} /> IMPORTA (
                        {selectedMatches.length})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BankMatchModal;
