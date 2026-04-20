import React from "react";
import { X, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface CustomModalProps {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    actions?: React.ReactNode;
    variant?: "neutral" | "danger" | "success" | "warning";
}

const CustomModal: React.FC<CustomModalProps> = ({
    isOpen,
    title,
    children,
    onClose,
    actions,
    variant = "neutral",
}) => {
    if (!isOpen) return null;

    const styles = {
        neutral: {
            border: "border-gray-700",
            bgHead: "bg-gray-800",
            textHead: "text-white",
            icon: null,
        },
        danger: {
            border: "border-red-900",
            bgHead: "bg-red-900/40",
            textHead: "text-red-200",
            icon: <AlertTriangle className="mr-2" size={24} />,
        },
        success: {
            border: "border-green-900",
            bgHead: "bg-green-900/40",
            textHead: "text-green-200",
            icon: <CheckCircle className="mr-2" size={24} />,
        },
        warning: {
            border: "border-yellow-900",
            bgHead: "bg-yellow-900/40",
            textHead: "text-yellow-200",
            icon: <AlertCircle className="mr-2" size={24} />,
        },
    };

    const s = styles[variant] || styles.neutral;

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className={`w-full max-w-lg bg-gray-950 rounded-2xl shadow-2xl border ${s.border} flex flex-col overflow-hidden scale-100`}
            >
                <div
                    className={`px-6 py-4 flex justify-between items-center border-b ${s.border} ${s.bgHead}`}
                >
                    <h3 className={`text-xl font-bold flex items-center ${s.textHead}`}>
                        {s.icon}
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-black/20 text-white/70 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 text-gray-300 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
                {actions && (
                    <div
                        className={`px-6 py-4 bg-gray-900/50 border-t ${s.border} flex justify-end space-x-3`}
                    >
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomModal;
