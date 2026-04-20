import React, { useState, useMemo } from "react";
import { Trash2, FileSpreadsheet, Download, Edit2 } from "lucide-react";
import { Member } from "../../types";
import { cleanInput } from "../../utils/helpers";

/**
 * MembersList Props
 * @property {Member[]} membri - List of members
 * @property {function} onAdd - Handler to add a new member
 * @property {function} onUpdate - Handler to update an existing member
 * @property {function} onDelete - Handler to delete a member
 * @property {function} onDeleteAll - Handler to delete ALL members (danger)
 * @property {function} onExport - Handler to export members to Excel
 * @property {function} onImport - Handler to import members from Excel
 */
interface MembersListProps {
    membri: Member[];
    onAdd: (m: Omit<Member, "id">) => Promise<void>;
    onUpdate: (id: number, m: Omit<Member, "id">) => Promise<void>;
    onDelete: (id: number) => void;
    onDeleteAll: () => void;
    onExport: () => void;
    onImport: () => void;
}

/**
 * Members List Component
 * Manages the CRUD operations for members.
 * Includes a search filter and a form for adding/editing members.
 */
const MembersList: React.FC<MembersListProps> = ({
    membri,
    onAdd,
    onUpdate,
    onDelete,
    onDeleteAll,
    onExport,
    onImport,
}) => {
    const [newMembro, setNewMembro] = useState({
        nome: "",
        cognome: "",
        matricola: "",
    });
    const [editingMembroId, setEditingMembroId] = useState<number | null>(null);
    const [searchMembri, setSearchMembri] = useState("");

    const filteredMembri = useMemo(
        () =>
            membri.filter((m) =>
                (m.nome + " " + m.cognome + " " + (m.matricola || ""))
                    .toUpperCase()
                    .includes(searchMembri.toUpperCase())
            ),
        [membri, searchMembri]
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMembro.nome || !newMembro.cognome) return;
        if (editingMembroId) {
            await onUpdate(editingMembroId, newMembro);
        } else {
            await onAdd(newMembro);
        }
        setNewMembro({ nome: "", cognome: "", matricola: "" });
        setEditingMembroId(null);
    };

    const startEdit = (m: Member) => {
        setNewMembro({
            nome: m.nome,
            cognome: m.cognome,
            matricola: m.matricola || "",
        });
        setEditingMembroId(m.id);
    };

    const cancelEdit = () => {
        setNewMembro({ nome: "", cognome: "", matricola: "" });
        setEditingMembroId(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-white">Membri</h2>
                    <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold border border-blue-500/30">
                        {filteredMembri.length} {filteredMembri.length === 1 ? 'risultato' : 'risultati'}
                        {searchMembri && ` su ${membri.length}`}
                    </span>
                </div>
                <div className="flex gap-2">

                    <div className="relative mr-4">
                        <input
                            className="bg-black border border-gray-600 rounded-full px-4 py-2 text-sm w-64 outline-none focus:border-blue-500 text-white"
                            placeholder="Cerca membro..."
                            value={searchMembri}
                            onChange={(e) => setSearchMembri(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={onDeleteAll}
                        className="bg-red-900/30 border border-red-900 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded flex items-center font-bold text-xs"
                    >
                        <Trash2 className="mr-2" size={16} /> ELIMINA TUTTI
                    </button>

                    <button
                        onClick={onExport}
                        className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center font-bold"
                    >
                        <FileSpreadsheet className="mr-2" size={18} /> Esporta Lista
                    </button>

                    <button
                        onClick={onImport}
                        className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center font-bold"
                    >
                        <Download className="mr-2" size={18} /> Importa Excel
                    </button>
                </div>
            </div>
            <form
                onSubmit={handleSave}
                className={`p-6 rounded-xl border mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end transition-colors ${editingMembroId
                    ? "bg-blue-900/20 border-blue-500"
                    : "bg-gray-900 border-gray-800"
                    }`}
            >
                <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">
                        MATRICOLA
                    </label>
                    <input
                        className="w-full bg-black p-3 rounded border border-gray-700 text-blue-300 font-mono focus:border-blue-500 outline-none"
                        value={newMembro.matricola}
                        onChange={(e) =>
                            setNewMembro({
                                ...newMembro,
                                matricola: cleanInput(e.target.value),
                            })
                        }
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">
                        COGNOME
                    </label>
                    <input
                        required
                        className="w-full bg-black p-3 rounded border border-gray-700 text-white focus:border-blue-500 outline-none"
                        value={newMembro.cognome}
                        onChange={(e) =>
                            setNewMembro({
                                ...newMembro,
                                cognome: cleanInput(e.target.value),
                            })
                        }
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">
                        NOME
                    </label>
                    <input
                        required
                        className="w-full bg-black p-3 rounded border border-gray-700 text-white focus:border-blue-500 outline-none"
                        value={newMembro.nome}
                        onChange={(e) =>
                            setNewMembro({
                                ...newMembro,
                                nome: cleanInput(e.target.value),
                            })
                        }
                    />
                </div>
                <div className="flex gap-2">
                    {editingMembroId && (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded font-bold flex-1"
                        >
                            ANNULLA
                        </button>
                    )}
                    <button
                        type="submit"
                        className={`${editingMembroId
                            ? "bg-blue-600 hover:bg-blue-500"
                            : "bg-green-600 hover:bg-green-500"
                            } text-white p-3 rounded font-bold flex-1`}
                    >
                        {editingMembroId ? "SALVA" : "AGGIUNGI"}
                    </button>
                </div>
            </form>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="p-4">Matricola</th>
                            <th className="p-4">Nome</th>
                            <th className="p-4 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembri.map((m) => (
                            <tr
                                key={m.id}
                                className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                            >
                                <td className="p-4 font-mono text-blue-300">{m.matricola}</td>
                                <td className="p-4 font-bold text-white">
                                    {m.cognome} {m.nome}
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => startEdit(m)}
                                        className="text-gray-400 hover:text-blue-400 p-2"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(m.id)}
                                        className="text-gray-400 hover:text-red-400 p-2"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MembersList;
