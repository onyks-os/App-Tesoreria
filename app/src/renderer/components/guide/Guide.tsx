import React from "react";
import { Book, Users, ShoppingCart, Wallet, Lock, Info } from "lucide-react";

const Guide = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom duration-500 pb-10">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 text-white flex items-center justify-center">
                    <Book className="mr-3" size={40} /> Manuale d'Uso
                </h2>
                <p className="text-xl text-gray-400">
                    Benvenuto nel gestionale Tesoreria. Qui troverai tutte le informazioni
                    per utilizzare al meglio l'applicazione.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
                    <div className="flex items-center mb-4 text-blue-400">
                        <Users size={32} className="mr-3" />
                        <h3 className="text-2xl font-bold">1. Gestione Membri</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                        Nella sezione <b>Membri</b> puoi aggiungere, modificare ed eliminare
                        i partecipanti. È consigliabile inserire sempre un numero di
                        matricola univoco. Puoi anche importare una lista massiva tramite
                        file Excel, o esportare la lista corrente.
                    </p>
                </div>

                <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
                    <div className="flex items-center mb-4 text-green-400">
                        <ShoppingCart size={32} className="mr-3" />
                        <h3 className="text-2xl font-bold">2. Movimenti & Quote</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                        La sezione <b>Movimenti</b> è il cuore pulsante. Crea un nuovo
                        acquisto, assegnalo a tutti i membri o solo ad una selezione.
                        Potrai monitorare chi ha pagato e chi no. Usa la funzione{" "}
                        <b>Importa Excel Banca</b> per saldare automaticamente le quote
                        tramite la causale dei bonifici.
                    </p>
                </div>

                <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
                    <div className="flex items-center mb-4 text-yellow-400">
                        <Wallet size={32} className="mr-3" />
                        <h3 className="text-2xl font-bold">3. Fondo Cassa</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                        Il <b>Fondo Cassa</b> viene calcolato automaticamente in base alle
                        entrate (Quote versate) e uscite (Spese dirette). Puoi creare
                        movimenti di tipo "Spesa Fondo" per registrare uscite che non
                        richiedono quote dai membri, o "Raccolta Fondo" per entrate extra.
                    </p>
                </div>

                <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
                    <div className="flex items-center mb-4 text-red-400">
                        <Lock size={32} className="mr-3" />
                        <h3 className="text-2xl font-bold">4. Sicurezza & Dati</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                        I dati sono salvati localmente. Il sistema effettua backup
                        automatici giornalieri ogni volta che chiudi un movimento o
                        modifichi i membri. Puoi forzare un backup manuale dalle{" "}
                        <b>Impostazioni</b>.
                    </p>
                </div>
            </div>

            <div className="border-t border-gray-800 pt-12">
                <h3 className="text-2xl font-bold mb-6 text-gray-500 flex items-center">
                    <Info className="mr-2" /> Privacy Policy & Termini
                </h3>
                <div className="bg-black/30 p-6 rounded-xl border border-gray-800 text-sm text-gray-400 space-y-4">
                    <p>
                        Questa applicazione è progettata per uso interno e gestionale. Tutti
                        i dati inseriti (anagrafiche, importi, transazioni) sono memorizzati
                        esclusivamente sul dispositivo locale in formato JSON crittografato
                        o protetto dal sistema operativo.
                    </p>
                    <p>
                        Non viene effettuato alcun invio di dati verso server esterni, cloud
                        o terze parti. Lo sviluppatore non ha accesso ai tuoi dati. La
                        responsabilità della custodia dei backup e della protezione
                        dell'accesso al computer è dell'utente.
                    </p>
                    <p>
                        L'analisi dei file Excel bancari avviene interamente in memoria RAM
                        e nessun dato bancario viene salvato in modo permanente, se non
                        l'importo e la data associata alla quota saldata.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Guide;
