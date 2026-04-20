import React, { useState } from "react";
import {
    EyeOff,
    ChevronDown,
    ChevronRight,
    Eye,
} from "lucide-react";
import { FinancialSituation, FundMovement } from "../../types";
import { formatCurrency } from "../../utils/helpers";

/**
 * Dashboard Props
 * @property {FinancialSituation} situazione - Current financial status
 * @property {FundMovement[]} movimentiFondo - List of fund movements (income/outcome)
 * @property {function} onToggleVisibility - Handler to toggle movement visibility (archive)
 */
interface DashboardProps {
    situazione: FinancialSituation;
    movimentiFondo: FundMovement[];
    onToggleVisibility: (uniqueId: string) => void;
}

/**
 * Dashboard Component
 * Displays the main financial overview: Real Cash, Wired Funds, and Available Balance.
 * Also lists fund movements with filtering capabilities (Search, Date Range).
 */
const Dashboard: React.FC<DashboardProps> = ({
    situazione,
    movimentiFondo,
    onToggleVisibility,
}) => {
    const [showArchived, setShowArchived] = useState(false);
    const [showVincolatoDetails, setShowVincolatoDetails] = useState(false);
    const [filterDetails, setFilterDetails] = useState({
        search: "",
        dateStart: "",
        dateEnd: ""
    });
    // Filter logic
    const filteredFondo = movimentiFondo
        .filter((m) => {
            // Apply Search
            if (filterDetails.search) {
                const s = filterDetails.search.toLowerCase();
                if (!m.descrizione.toLowerCase().includes(s) && !m.importo.toString().includes(s))
                    return false;
            }
            // Apply Date Range
            if (filterDetails.dateStart) {
                if (new Date(m.data) < new Date(filterDetails.dateStart)) return false;
            }
            if (filterDetails.dateEnd) {
                if (new Date(m.data) > new Date(filterDetails.dateEnd + "T23:59:59")) return false; // End of day
            }
            return true;
        })
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    const visibleFondo = filteredFondo.filter((m) => !m.hidden);
    const hiddenFondo = filteredFondo.filter((m) => m.hidden);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Situazione Contabile</h2>
            </div>
            <div className="flex gap-4 mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <input
                    placeholder="Cerca..."
                    className="bg-black border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500"
                    value={filterDetails.search}
                    onChange={(e) => setFilterDetails({ ...filterDetails, search: e.target.value })}
                />
                <input
                    type="date"
                    className="bg-black border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500"
                    value={filterDetails.dateStart}
                    onChange={(e) => setFilterDetails({ ...filterDetails, dateStart: e.target.value })}
                />
                <span className="text-gray-500 self-center">a</span>
                <input
                    type="date"
                    className="bg-black border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-blue-500"
                    value={filterDetails.dateEnd}
                    onChange={(e) => setFilterDetails({ ...filterDetails, dateEnd: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-xl">
                    <p className="text-gray-400 font-bold text-xs uppercase mb-2">
                        Cassa Reale
                    </p>
                    <p className="text-5xl font-bold">
                        {formatCurrency(situazione?.fondo_cassa_reale || 0)}
                    </p>
                </div>
                <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-xl relative group">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-400 font-bold text-xs uppercase">
                            Vincolato
                        </p>
                        {situazione?.dettaglio_vincolato && situazione.dettaglio_vincolato.length > 0 && (
                            <button
                                onClick={() => setShowVincolatoDetails(!showVincolatoDetails)}
                                className="text-gray-600 hover:text-white transition-colors"
                            >
                                {showVincolatoDetails ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                        )}
                    </div>
                    <p className="text-4xl font-bold text-yellow-500">
                        {formatCurrency(situazione?.fondi_vincolati || 0)}
                    </p>

                    {/* DROPDOWN DETAILS */}
                    {showVincolatoDetails && situazione?.dettaglio_vincolato && (
                        <div className="mt-4 pt-4 border-t border-gray-800 animate-in slide-in-from-top-2">
                            <ul className="space-y-3">
                                {situazione.dettaglio_vincolato.map((d, idx) => (
                                    <li key={idx} className="text-xs">
                                        <div className="flex justify-between text-white font-bold mb-1">
                                            <span>{d.purchase_name}</span>
                                            <span className="text-yellow-500">{formatCurrency(d.vincolato_residuo)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500 text-[10px] font-mono">
                                            <span>Raccolto: {formatCurrency(d.raccolto)}</span>
                                            <span>Acconti: {formatCurrency(d.acconto_speso)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="bg-gray-900 p-8 rounded-2xl border border-blue-900/30 shadow-xl">
                    <p className="text-blue-400 font-bold text-xs uppercase mb-2">
                        Disponibile
                    </p>
                    <p className="text-5xl font-bold text-blue-400">
                        {formatCurrency(situazione?.disponibile_effettivo || 0)}
                    </p>
                </div>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-4">
                <table className="w-full text-left">
                    <thead className="bg-gray-800 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="p-4">Data</th>
                            <th className="p-4">Descrizione</th>
                            <th className="p-4 text-right">Importo</th>
                            <th className="p-4 w-20 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleFondo.map((m: any) => (
                            <tr
                                key={m.id}
                                className="border-b border-gray-800 group hover:bg-gray-800/30 transition-colors"
                            >
                                <td className="p-4 text-gray-400">
                                    {new Date(m.data).toLocaleDateString()}
                                </td>
                                <td className="p-4 font-bold text-white">{m.descrizione}</td>
                                <td
                                    className={`p-4 text-right font-bold ${m.importo >= 0 ? "text-green-400" : "text-red-400"
                                        }`}
                                >
                                    {m.importo > 0 ? "+" : ""}
                                    {formatCurrency(m.importo)}
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => onToggleVisibility(String(m.id))}
                                        className="text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition"
                                        title="Nascondi dalla dashboard"
                                    >
                                        <EyeOff size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {hiddenFondo.length > 0 && (
                <div className="opacity-80">
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className="flex items-center text-xs font-bold text-gray-500 uppercase mb-2 ml-2 hover:text-white transition group"
                    >
                        {showArchived ? (
                            <ChevronDown size={16} className="mr-1" />
                        ) : (
                            <ChevronRight size={16} className="mr-1" />
                        )}
                        <span>Transazioni Nascoste ({hiddenFondo.length})</span>
                    </button>
                    {showArchived && (
                        <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden animate-in slide-in-from-top-2">
                            <table className="w-full text-left text-sm opacity-60">
                                <tbody>
                                    {hiddenFondo.map((m: any) => (
                                        <tr
                                            key={m.id}
                                            className="border-b border-gray-800 hover:bg-gray-800/30"
                                        >
                                            <td className="p-4 w-32 text-gray-500">
                                                {new Date(m.data).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-gray-400 italic">
                                                {m.descrizione}
                                            </td>
                                            <td className="p-4 text-right w-32 text-gray-500">
                                                {formatCurrency(m.importo)}
                                            </td>
                                            <td className="p-4 w-10 text-right">
                                                <button
                                                    onClick={() => onToggleVisibility(String(m.id))}
                                                    className="text-gray-500 hover:text-green-400 transition"
                                                    title="Ripristina"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
