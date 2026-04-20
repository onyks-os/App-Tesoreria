import React, { useState, useEffect } from "react";
import CustomModal from "../../common/CustomModal";
import { Purchase } from "../../../types";

interface EditPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalAcquisto: Purchase | null;
    onSave: (data: any) => Promise<void>;
    onOpenMemberSelector: () => void;
    selectedMemberCount: number;
}

const EditPurchaseModal: React.FC<EditPurchaseModalProps> = ({
    isOpen,
    onClose,
    originalAcquisto,
    onSave,
    onOpenMemberSelector,
    selectedMemberCount,
}) => {
    const [editingAcq, setEditingAcq] = useState<any>({
        nome: "",
        prezzo: "",
        acconto: "",
        date: "",
        tipo: "acquisto",
    });

    useEffect(() => {
        if (originalAcquisto) {
            setEditingAcq({
                id: originalAcquisto.id,
                nome: originalAcquisto.nome_acquisto,
                prezzo: String(originalAcquisto.prezzo_unitario),
                acconto: String(originalAcquisto.acconto_fornitore || 0),
                date: originalAcquisto.data_creazione
                    ? new Date(originalAcquisto.data_creazione).toISOString().split("T")[0]
                    : "",
                tipo: originalAcquisto.tipo,
            });
        }
    }, [originalAcquisto]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            ...editingAcq,
            prezzo: parseFloat(editingAcq.prezzo),
            acconto: parseFloat(editingAcq.acconto || 0),
        });
        onClose();
    };

    return (
        <CustomModal
            isOpen={isOpen}
            title="Modifica Dati Movimento"
            onClose={onClose}
            variant="neutral"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    value={editingAcq.nome}
                    onChange={(e) =>
                        setEditingAcq({ ...editingAcq, nome: e.target.value })
                    }
                    className="w-full bg-black p-3 rounded border border-gray-700 text-white"
                    placeholder="Nome"
                    required
                />
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">
                        Data (Opzionale)
                    </label>
                    <input
                        type="date"
                        value={editingAcq.date || ""}
                        onChange={(e) =>
                            setEditingAcq({ ...editingAcq, date: e.target.value })
                        }
                        className="w-full bg-black p-3 rounded border border-gray-700 text-white"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold">
                            Importo
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={editingAcq.prezzo}
                            onChange={(e) =>
                                setEditingAcq({ ...editingAcq, prezzo: e.target.value })
                            }
                            className="w-full bg-black p-3 rounded border border-gray-700 text-white"
                            required
                        />
                    </div>
                    {editingAcq.tipo !== "storico" && editingAcq.tipo !== "importo_cassa" && editingAcq.tipo !== "raccolta_fondo" && (
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">
                                Acconto
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={editingAcq.acconto}
                                onChange={(e) =>
                                    setEditingAcq({ ...editingAcq, acconto: e.target.value })
                                }
                                className="w-full bg-black p-3 rounded border border-gray-700 text-blue-300"
                            />
                        </div>
                    )}
                </div>
                {originalAcquisto?.tipo !== "spesa_fondo" &&
                    originalAcquisto?.tipo !== "storico" && (
                        <button
                            type="button"
                            onClick={onOpenMemberSelector}
                            className="w-full bg-gray-800 text-gray-300 p-3 rounded font-bold flex justify-between items-center text-sm border border-gray-600 hover:bg-gray-700"
                        >
                            <span>Modifica Destinatari:</span>
                            <span className="text-white bg-gray-900 px-2 py-1 rounded">
                                {selectedMemberCount} Selezionati
                            </span>
                        </button>
                    )}
                <button className="w-full bg-blue-600 p-3 rounded font-bold hover:bg-blue-500">
                    SALVA DATI
                </button>
            </form>
        </CustomModal>
    );
};

export default EditPurchaseModal;
