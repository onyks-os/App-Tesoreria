import React from "react";
import { Save, AlertTriangle, FileCode, FolderOpen } from "lucide-react";

/**
 * Settings Props
 * @property {any[]} backups - List of available backup files
 * @property {function} triggerManualBackup - Handler to trigger manual backup
 * @property {function} onResetAnnual - Handler to reset accounting year
 * @property {function} onRestoreBackup - Handler to restore a backup file
 */
interface SettingsProps {
    backups: any[];
    triggerManualBackup: () => void;
    onResetAnnual: () => void;
    onRestoreBackup: (filename: string) => void;
    onHardReset: () => void;
}

/**
 * Settings Component
 * Provides administrative functions: Backups, Annual Reset, and Logs.
 */
const Settings: React.FC<SettingsProps> = ({
    backups,
    triggerManualBackup,
    onResetAnnual,
    onRestoreBackup,
    onHardReset,
}) => {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-white">Amministrazione</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-2">Sicurezza Dati</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Esegui un backup manuale istantaneo prima di operazioni importanti.
                    </p>
                    <button
                        onClick={triggerManualBackup}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded font-bold transition flex items-center justify-center"
                    >
                        <Save className="mr-2" size={18} /> BACKUP ADESSO
                    </button>
                </div>

                <div className="bg-red-900/10 p-6 rounded-2xl border border-red-900/30">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Nuovo Anno</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Azzera movimenti e cassa per il nuovo anno. <b className="text-white">NON cancella i membri.</b>
                    </p>
                    <button
                        onClick={onResetAnnual}
                        className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 p-3 rounded font-bold transition flex items-center justify-center"
                    >
                        <AlertTriangle className="mr-2" size={18} /> NUOVO ANNO CONTABILE
                    </button>
                </div>

                <div className="bg-red-950/30 p-6 rounded-2xl border border-red-600/50 md:col-span-2">
                    <h3 className="text-xl font-bold text-red-500 mb-2 flex items-center">
                        <AlertTriangle className="mr-2" /> Zona Pericolo (Totale)
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Questa azione <b>CANCELLA TUTTO</b>: Membri, Acquisti, Quote, Fondo Cassa, cioè Ritorna allo stato iniziale (vuoto).
                    </p>
                    <button
                        onClick={onHardReset}
                        className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded font-bold transition flex items-center justify-center shadow-lg shadow-red-900/20"
                    >
                        RESET DATABASE (FABBRICA)
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-blue-400">
                        Storico Backup e Log
                    </h3>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => window.api.openLogFile()}
                            className="bg-gray-800 text-white px-4 py-2 rounded flex items-center hover:bg-gray-700 transition border border-gray-600"
                        >
                            <FileCode className="mr-2" size={18} /> Vedi Log
                        </button>
                        <button
                            onClick={() => window.api.openBackupFolder()}
                            className="bg-gray-800 text-white px-4 py-2 rounded flex items-center hover:bg-gray-700 transition border border-gray-600"
                        >
                            <FolderOpen className="mr-2" size={18} /> Apri Cartella
                        </button>
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-800 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="p-4">File</th>
                            <th className="p-4 text-right">Azione</th>
                        </tr>
                    </thead>
                    <tbody>
                        {backups.map((b: any) => (
                            <tr key={b.name} className="border-b border-gray-800">
                                <td className="p-4 font-mono text-green-400">{b.name}</td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => onRestoreBackup(b.name)}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-sm transition"
                                    >
                                        RIPRISTINA
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

export default Settings;
