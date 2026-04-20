import React, { useState, useMemo } from "react";
import { ListChecks, X, CheckCircle } from "lucide-react";
import { Member } from "../../../types";

interface SelectMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    membri: Member[];
    initialSelection: number[];
    onConfirm: (selectedIds: number[]) => void;
}

const SelectMembersModal: React.FC<SelectMembersModalProps> = ({
    isOpen,
    onClose,
    membri,
    initialSelection,
    onConfirm,
}) => {
    const [currentList, setCurrentList] = useState<number[]>(initialSelection);
    const [search, setSearch] = useState("");

    // Sync initial selection when modal opens
    React.useEffect(() => {
        if (isOpen) setCurrentList(initialSelection);
    }, [isOpen]);

    const filteredMembri = useMemo(
        () =>
            membri.filter((m) =>
                (m.nome + " " + m.cognome + " " + (m.matricola || ""))
                    .toUpperCase()
                    .includes(search.toUpperCase())
            ),
        [membri, search]
    );

    const toggleMember = (id: number) => {
        setCurrentList((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (currentList.length === membri.length) {
            setCurrentList([]);
        } else {
            setCurrentList(membri.map((m) => m.id));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-2xl h-[80vh] rounded-2xl border border-gray-700 flex flex-col shadow-2xl">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                    <h3 className="font-bold text-xl flex items-center">
                        <ListChecks className="mr-2" /> Seleziona Destinatari
                    </h3>
                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                <div className="p-4 bg-gray-800/50 flex gap-2 border-b border-gray-700">
                    <button
                        onClick={toggleAll}
                        className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-xs font-bold"
                    >
                        {currentList.length === membri.length ? "DESELEZIONA" : "TUTTI"}
                    </button>
                    <input
                        className="bg-black border border-gray-600 rounded-full px-10 py-2 text-sm w-full outline-none"
                        placeholder="Cerca..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {filteredMembri.map((m) => (
                        <div
                            key={m.id}
                            onClick={() => toggleMember(m.id)}
                            className={`flex items-center p-3 rounded cursor-pointer border transition ${currentList.includes(m.id)
                                    ? "bg-blue-900/40 border-blue-500"
                                    : "bg-gray-800 border-transparent hover:bg-gray-700"
                                }`}
                        >
                            <div
                                className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${currentList.includes(m.id)
                                        ? "bg-blue-500 border-blue-500"
                                        : "border-gray-500"
                                    }`}
                            >
                                {currentList.includes(m.id) && (
                                    <CheckCircle size={14} className="text-white" />
                                )}
                            </div>
                            <span className="font-bold">
                                {m.cognome} {m.nome}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-800 flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                        Selezionati: <b className="text-white">{currentList.length}</b>
                    </span>
                    <button
                        onClick={() => onConfirm(currentList)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold"
                    >
                        CONFERMA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectMembersModal;
