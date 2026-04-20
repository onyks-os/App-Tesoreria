import React from "react";
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    Book,
    Settings,
    Save,
} from "lucide-react";

/**
 * Sidebar Props
 * @property {string} activeTab - Currently active tab identifier
 * @property {function} setActiveTab - Handler to switch tabs
 * @property {function} onQuit - Handler to close the application
 */
interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onQuit: () => void;
}

/**
 * Sidebar Navigation Component
 * Displays the main navigation menu and the 'Save & Exit' button.
 */
const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    setActiveTab,
    onQuit,
}) => {
    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-4">
            <h1 className="text-xl font-bold mb-8 px-2 text-green-500 flex items-center">
                <span className="bg-green-500 text-black w-8 h-8 flex items-center justify-center rounded-lg mr-2 font-bold">
                    T
                </span>{" "}
                Tesoreria
            </h1>
            <nav className="flex-1 space-y-2">
                {["dashboard", "movimenti", "membri"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center w-full p-3 rounded-lg transition capitalize ${activeTab === tab
                            ? "bg-blue-600 text-white shadow-lg"
                            : "text-gray-400 hover:bg-gray-800"
                            }`}
                    >
                        {tab === "dashboard" && (
                            <LayoutDashboard size={20} className="mr-3" />
                        )}
                        {tab === "membri" && <Users size={20} className="mr-3" />}
                        {tab === "movimenti" && <ShoppingCart size={20} className="mr-3" />}
                        {tab}
                    </button>
                ))}
                <button
                    onClick={() => setActiveTab("guida")}
                    className={`flex items-center w-full p-3 rounded-lg transition capitalize ${activeTab === "guida"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-400 hover:bg-gray-800"
                        }`}
                >
                    <Book size={20} className="mr-3" /> Guida & Privacy
                </button>
            </nav>
            <div className="mt-auto border-t border-gray-800 pt-4 space-y-2">
                <button
                    onClick={() => setActiveTab("settings")}
                    className={`flex items-center w-full p-3 rounded-lg transition ${activeTab === "settings"
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800"
                        }`}
                >
                    <Settings size={20} className="mr-3" /> Impostazioni
                </button>
                <button
                    onClick={onQuit}
                    className="flex items-center w-full p-3 rounded-lg bg-green-900/30 text-green-400 border border-green-900/50 hover:bg-green-900/50 transition"
                >
                    <Save size={20} className="mr-3" /> Salva ed Esci
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
