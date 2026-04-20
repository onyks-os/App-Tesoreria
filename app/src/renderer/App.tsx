import React, { useState, useEffect } from "react";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import MembersList from "./components/members/MembersList";
import AccountingLayout from "./components/accounting/AccountingLayout";
import Settings from "./components/settings/Settings";
import Guide from "./components/guide/Guide";
import CustomModal from "./components/common/CustomModal";
import { useTesoreria } from "./hooks/useTesoreria";
import { Loader2 } from "lucide-react";

/**
 * Main Application Component.
 * Orchestrates the overall layout, routing (tabs), and global modals.
 * Uses 'useTesoreria' for data management.
 */
function App() {
  const {
    situazione,
    membri,
    acquisti,
    movimentiFondo,
    backups,
    isLoading,
    actions,
  } = useTesoreria();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [modal, setModal] = useState<{ view: string; data?: any }>({
    view: "none",
  });

  /**
   * Closes the application via IPC.
   * Also redirects to blank page for immediate visual feedback.
   */
  const handleQuit = () => {
    window.api.quitApp();
  };

  /* --- Global Action Wrappers with Error Handling/Modals --- */

  /**
   * Triggers a manual backup and shows a status modal.
   */
  const handleManualBackup = async () => {
    try {
      await actions.triggerManualBackup();
      setModal({
        view: "alert",
        data: {
          title: "Backup Completato",
          msg: "Il backup manuale è stato salvato con successo.",
          variant: "success",
        },
      });
    } catch (e: any) {
      setModal({
        view: "alert",
        data: { title: "Errore Backup", msg: e.message, variant: "danger" },
      });
    }
  };

  /**
   * Resets the accounting year (Funds/Movements). 
   * CAUTION: This operation is destructive.
   */
  const handleResetAnnual = async () => {
    try {
      await actions.resetAnnual();
      setModal({
        view: "alert",
        data: {
          title: "Anno Resettato",
          msg: "Il nuovo anno contabile è iniziato. Fondo cassa e movimenti azzerati.",
          variant: "success",
        },
      });
    } catch (e: any) {
      setModal({
        view: "alert",
        data: { title: "Errore Reset", msg: e.message, variant: "danger" },
      });
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    setModal({
      view: "confirm_restore",
      data: { filename },
    });
  };

  const confirmRestore = async () => {
    if (modal.data?.filename) {
      await actions.restoreBackup(modal.data.filename);
      setModal({
        view: "alert",
        data: {
          title: "Ripristino Completato",
          msg: "I dati sono stati ripristinati. L'applicazione verrà ricaricata.",
          variant: "success",
        },
      });
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const handleHardReset = async () => {
    setModal({
      view: "confirm_hard_reset",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-950 text-white flex-col gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-gray-400 animate-pulse">
          Caricamento Tesoreria...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden select-none">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuit={handleQuit}
      />

      <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        {activeTab === "dashboard" && (
          <Dashboard
            situazione={situazione}
            movimentiFondo={movimentiFondo}
            onToggleVisibility={(id) => actions.toggleMovementVisibility(id)}
          />
        )}

        {activeTab === "membri" && (
          <MembersList
            membri={membri}
            onAdd={actions.addMembro}
            onUpdate={actions.updateMembro}
            onDelete={(id) => setModal({ view: "confirm_delete_membro", data: { id } })}
            onDeleteAll={() => setModal({ view: "confirm_delete_all_membri" })}
            onExport={actions.exportMembri}
            onImport={() => actions.importMembriExcel()}
          />
        )}

        {activeTab === "movimenti" && (
          <AccountingLayout
            acquisti={acquisti}
            membri={membri}
            onCreateAcquisto={actions.createAcquisto}
            onUpdateAcquisto={actions.updateAcquisto}
            onDeleteAcquisto={actions.deleteAcquisto}
            onCompletaAcquisto={actions.completaAcquisto}
            onOpenGlobalModal={(view, data) => setModal({ view, data })}
          />
        )}

        {activeTab === "guida" && <Guide />}

        {activeTab === "settings" && (
          <Settings
            backups={backups}
            triggerManualBackup={handleManualBackup}
            onResetAnnual={() => setModal({ view: "confirm_reset_annual" })}
            onRestoreBackup={handleRestoreBackup}
            onHardReset={handleHardReset}
          />
        )}
      </main>

      {/* --- GLOBAL MODALS --- */}

      {(modal.view === "alert" || modal.view === "error") && (
        <CustomModal
          isOpen={true}
          title={modal.data?.title || "Avviso"}
          onClose={() => setModal({ view: "none" })}
          variant={modal.data?.variant || "neutral"}
          actions={
            <button
              onClick={() => setModal({ view: "none" })}
              className="bg-gray-700 px-4 py-2 rounded text-white"
            >
              Chiudi
            </button>
          }
        >
          <p>{modal.data?.msg}</p>
        </CustomModal>
      )}

      {modal.view === "confirm_restore" && (
        <CustomModal
          isOpen={true}
          title="Conferma Ripristino"
          variant="danger"
          onClose={() => setModal({ view: "none" })}
          actions={
            <>
              <button onClick={() => setModal({ view: "none" })} className="px-4 py-2">Annulla</button>
              <button onClick={confirmRestore} className="bg-red-600 px-4 py-2 rounded font-bold">RIPRISTINA</button>
            </>
          }
        >
          Sei sicuro di voler ripristinare il backup <b>{modal.data.filename}</b>?
          <br />Tutti i dati attuali verranno sovrascritti.
        </CustomModal>
      )}

      {modal.view === "confirm_reset_annual" && (
        <CustomModal
          isOpen={true}
          title="Conferma Nuovo Anno"
          variant="danger"
          onClose={() => setModal({ view: "none" })}
          actions={
            <>
              <button onClick={() => setModal({ view: "none" })} className="px-4 py-2">Annulla</button>
              <button onClick={() => { handleResetAnnual(); setModal({ view: "none" }); }} className="bg-red-600 px-4 py-2 rounded font-bold">PROCEDI</button>
            </>
          }
        >
          Attenzione: Questa operazione non è reversibile (se non tramite backup).
          <br />Verranno cancellati tutti i movimenti e azzerato il fondo cassa.
        </CustomModal>
      )}

      {modal.view === "confirm_hard_reset" && (
        <CustomModal
          isOpen={true}
          title="RESET TOTALE DI FABBRICA"
          onClose={() => setModal({ view: "none" })}
          variant="danger"
          actions={
            <>
              <button
                onClick={() => setModal({ view: "none" })}
                className="px-4 py-2 opacity-70 hover:opacity-100"
              >
                Annulla (Meno male)
              </button>
              <button
                onClick={async () => {
                  await window.api.hardResetDB();
                  setModal({ view: "none" });
                }}
                className="bg-red-600 px-4 py-2 rounded font-bold animate-pulse"
              >
                SI, CANCELLA TUTTO
              </button>
            </>
          }
        >
          <div className="text-center">
            <p className="text-xl font-bold text-red-500 mb-4">ATTENZIONE: AZIONE IRREVERSIBILE</p>
            <p>Stai per cancellare <b>OGNI SINGOLO DATO</b> del programma.</p>
            <ul className="list-disc list-inside mt-2 text-left bg-red-900/10 p-4 rounded border border-red-900/30 text-sm">
              <li>Tutti i Membri saranno eliminati.</li>
              <li>Tutti gli Acquisti e Quote saranno eliminati.</li>
              <li>Tutto il Fondo Cassa sarà azzerato.</li>
            </ul>
            <p className="mt-4">Il programma tornerà come appena installato.</p>
          </div>
        </CustomModal>
      )}

      {modal.view === "confirm_delete_membro" && (
        <CustomModal
          isOpen={true}
          title="Elimina Membro"
          variant="danger"
          onClose={() => setModal({ view: "none" })}
          actions={
            <>
              <button onClick={() => setModal({ view: "none" })} className="px-4 py-2">Annulla</button>
              <button onClick={async () => {
                await actions.deleteMembro(modal.data.id);
                setModal({ view: "none" });
              }} className="bg-red-600 px-4 py-2 rounded font-bold">ELIMINA</button>
            </>
          }
        >
          Sei sicuro di voler eliminare questo membro?
        </CustomModal>
      )}

      {modal.view === "confirm_delete_all_membri" && (
        <CustomModal
          isOpen={true}
          title="ELIMINAZIONE TOTALE"
          variant="danger"
          onClose={() => setModal({ view: "none" })}
          actions={
            <>
              <button onClick={() => setModal({ view: "none" })} className="px-4 py-2">Annulla</button>
              <button onClick={async () => {
                for (const m of membri) {
                  await actions.deleteMembro(m.id);
                }
                setModal({ view: "none" });
              }} className="bg-red-600 px-4 py-2 rounded font-bold">ELIMINA TUTTO</button>
            </>
          }
        >
          Attenzione! Stai per cancellare TUTTI i membri dal database.
        </CustomModal>
      )}

      {modal.view === "fondo" && (
        <CustomModal
          isOpen={true}
          title="Gestione Fondo Cassa"
          onClose={() => setModal({ view: "none" })}
          actions={null}
        >
          <div className="space-y-4">
            <button
              onClick={() => {
                setModal({ view: "none" });
                setActiveTab("movimenti");
              }}
              className="w-full bg-red-900/50 border border-red-500 p-4 rounded text-left hover:bg-red-900/80 transition"
            >
              <h4 className="font-bold text-red-400">Registra Uscita (Spesa)</h4>
              <p className="text-sm text-gray-400">Registra una spesa pagata direttamente dal fondo.</p>
            </button>

            <button
              onClick={() => {
                setModal({ view: "none" });
                setActiveTab("movimenti");
              }}
              className="w-full bg-green-900/50 border border-green-500 p-4 rounded text-left hover:bg-green-900/80 transition"
            >
              <h4 className="font-bold text-green-400">Registra Bigliettata / Entrata</h4>
              <p className="text-sm text-gray-400">Registra un'entrata extra nel fondo (es. Bigliettata).</p>
            </button>
          </div>
        </CustomModal>
      )}

    </div>
  );
}

export default App;
