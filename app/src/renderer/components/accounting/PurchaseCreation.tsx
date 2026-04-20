import React from "react";
import {
    Wallet,
    PiggyBank,
    CheckCircle,
    AlertCircle,
    FileSpreadsheet,
} from "lucide-react";
import { Purchase } from "../../types";
import { formatCurrency } from "../../utils/helpers";

/**
 * Props for PurchaseCreation
 * @property {Purchase[]} acquisti - List of existing purchases for sidebar list
 * @property {number|null} selectedAcquistoId - ID of currently selected purchase
 * @property {function} onSelectAcquisto - Handler when user clicks a purchase in the list
 * @property {function} onCreate - Handler to submit new purchase
 * @property {function} onOpenMemberSelector - Handler to open member selection modal
 * @property {function} onOpenImportWizard - Handler to open bank import wizard
 * @property {number} selectedMemberCount - Count of currently selected members for the new purchase
 */
interface PurchaseCreationProps {
    acquisti: Purchase[];
    selectedAcquistoId: number | null;
    onSelectAcquisto: (a: Purchase) => void;
    onCreate: (data: any) => Promise<void>;
    onOpenMemberSelector: () => void;
    onOpenImportWizard: () => void;
    selectedMemberCount: number;
}

const PurchaseCreation: React.FC<PurchaseCreationProps> = ({
    acquisti,
    selectedAcquistoId,
    onSelectAcquisto,
    onCreate,
    onOpenMemberSelector,
    onOpenImportWizard,
    selectedMemberCount,
}) => {
    const [newAcq, setNewAcq] = React.useState({
        nome: "",
        prezzo: "",
        acconto: "",
    });
    const [newAcqType, setNewAcqType] = React.useState("acquisto");
    const [newAcqDate, setNewAcqDate] = React.useState("");

    const handleCreate = async () => {
        await onCreate({
            ...newAcq,
            tipo: newAcqType,
            date: newAcqDate
        });
        setNewAcq({ nome: "", prezzo: "", acconto: "" });
        setNewAcqDate("");
    };

    return (
        <div className="col-span-4 flex flex-col h-full overflow-hidden">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-6 space-y-3">
                <h3 className="font-bold text-green-400 mb-2">NUOVO MOVIMENTO</h3>
                <input
                    placeholder="Nome / Descrizione"
                    className="w-full bg-black p-3 rounded border border-gray-700 text-white focus:border-blue-500 outline-none"
                    value={newAcq.nome}
                    onChange={(e) => setNewAcq({ ...newAcq, nome: e.target.value })}
                />

                <div className="relative">
                    <select
                        value={newAcqType}
                        onChange={(e) => {
                            const t = e.target.value;
                            setNewAcqType(t);
                            if (t === "storico" || t === "importo_cassa") {
                                setNewAcqDate(new Date().toISOString().split("T")[0]);
                            } else {
                                setNewAcqDate("");
                            }
                        }}
                        className="w-full bg-black p-3 rounded border border-gray-700 text-white appearance-none outline-none focus:border-blue-500 font-bold cursor-pointer"
                    >
                        <option value="acquisto">ACQUISTO</option>
                        <option value="spesa_fondo">SPESA DIRETTA FONDO</option>
                        <option value="importo_cassa">IMPORTO FONDO CASSA</option>
                        <option value="raccolta_fondo">RACCOLTA FONDO</option>
                        <option value="storico">STORICO</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                        ▼
                    </div>
                </div>

                {(newAcqType === "storico" || newAcqType === "importo_cassa") && (
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 font-bold mb-1">
                            DATA {newAcqType === "storico" ? "TRANSAZIONE" : "INSERIMENTO"}
                        </label>
                        <input
                            type="date"
                            className="w-full bg-black p-3 rounded border border-gray-700 text-white focus:border-blue-500 outline-none"
                            value={newAcqDate}
                            onChange={(e) => setNewAcqDate(e.target.value)}
                            required
                        />
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder={
                            newAcqType === "raccolta_fondo"
                                ? "Quota a Testa"
                                : (newAcqType === "acquisto" ? "Prezzo Unitario" : "Prezzo")
                        }
                        className="w-full bg-black p-3 rounded border border-gray-700 text-white focus:border-blue-500 outline-none"
                        value={newAcq.prezzo}
                        onChange={(e) => setNewAcq({ ...newAcq, prezzo: e.target.value })}
                    />
                    {newAcqType !== "raccolta_fondo" &&
                        newAcqType !== "spesa_fondo" &&
                        newAcqType !== "storico" &&
                        newAcqType !== "importo_cassa" && (
                            <input
                                type="number"
                                placeholder="Acconto"
                                className="w-full bg-black p-3 rounded border border-gray-700 text-blue-300 focus:border-blue-500 outline-none"
                                value={newAcq.acconto}
                                onChange={(e) =>
                                    setNewAcq({ ...newAcq, acconto: e.target.value })
                                }
                            />
                        )}
                </div>

                {newAcqType !== "spesa_fondo" && newAcqType !== "storico" && newAcqType !== "importo_cassa" && (
                    <div className="flex gap-2">
                        <button
                            onClick={onOpenMemberSelector}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 p-3 rounded font-bold transition flex justify-between items-center text-sm"
                        >
                            <span>Manuale:</span>
                            <span className="text-white bg-gray-900 px-2 py-1 rounded">
                                {selectedMemberCount === 0
                                    ? "TUTTI"
                                    : `${selectedMemberCount} Scelti`}
                            </span>
                        </button>
                        <button
                            onClick={onOpenImportWizard}
                            className="bg-green-800 hover:bg-green-700 text-white px-4 rounded font-bold border border-green-600 flex items-center justify-center"
                            title="Importa da Excel Banca"
                        >
                            <FileSpreadsheet size={20} />
                        </button>
                    </div>
                )}

                <button
                    onClick={handleCreate}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded font-bold transition"
                >
                    CREA
                </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {acquisti.map((a) => (
                    <div
                        key={a.id}
                        onClick={() => onSelectAcquisto(a)}
                        className={`p-4 rounded border cursor-pointer flex justify-between items-center transition ${selectedAcquistoId === a.id
                            ? "border-blue-500 bg-blue-900/20"
                            : "border-gray-800 bg-gray-900 hover:bg-gray-800"
                            }`}
                    >
                        <div>
                            <p className="font-bold text-white">{a.nome_acquisto}</p>
                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                {formatCurrency(a.prezzo_unitario)}
                                {a.tipo === "spesa_fondo" && (
                                    <span className="text-xs bg-purple-900 text-purple-300 px-1 rounded flex items-center">
                                        <Wallet size={10} className="mr-1" /> SPESA DIRETTA
                                    </span>
                                )}
                                {a.tipo === "importo_cassa" && (
                                    <span className="text-xs bg-blue-900 text-blue-300 px-1 rounded flex items-center">
                                        <Wallet size={10} className="mr-1" /> IMPORTO FONDO CASSA
                                    </span>
                                )}
                                {a.tipo === "storico" && (
                                    <span className="text-xs bg-orange-900 text-orange-300 px-1 rounded flex items-center">
                                        <Wallet size={10} className="mr-1" /> STORICO
                                    </span>
                                )}
                                {a.tipo === "acquisto" && (
                                    <span className="text-xs bg-red-900 text-red-300 px-1 rounded flex items-center">
                                        <Wallet size={10} className="mr-1" /> ACQUISTO
                                    </span>
                                )}
                                {a.tipo === "raccolta_fondo" && (
                                    <span className="text-xs bg-green-900 text-green-300 px-1 rounded flex items-center">
                                        <PiggyBank size={10} className="mr-1" /> RACCOLTA FONDI
                                    </span>
                                )}
                            </p>
                        </div>
                        {/* 'completato' is optional in Purchase interface */}
                        {a.completato ? (
                            <CheckCircle className="text-green-500" size={20} />
                        ) : (
                            <AlertCircle className="text-yellow-500" size={20} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PurchaseCreation;
