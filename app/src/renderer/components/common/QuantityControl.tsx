import React from "react";
import { Minus, Plus } from "lucide-react";

interface QuantityControlProps {
    value: number;
    onChange: (newVal: number) => void;
    disabled?: boolean;
}

const QuantityControl: React.FC<QuantityControlProps> = ({
    value,
    onChange,
    disabled,
}) => (
    <div
        className={`flex items-center bg-gray-950 border border-gray-600 rounded-lg overflow-hidden w-40 h-10 shadow-lg ${disabled ? "opacity-50 pointer-events-none" : ""
            }`}
    >
        <button
            onClick={() => value > 1 && onChange(value - 1)}
            className="h-full px-4 bg-gray-800 hover:bg-red-900/50 text-white border-r border-gray-600 transition flex items-center justify-center"
            type="button"
        >
            <Minus size={20} />
        </button>
        <div className="flex-1 text-center font-bold text-white text-xl bg-black/40 h-full flex items-center justify-center">
            {value}
        </div>
        <button
            onClick={() => onChange(value + 1)}
            className="h-full px-4 bg-gray-800 hover:bg-green-900/50 text-white border-l border-gray-600 transition flex items-center justify-center"
            type="button"
        >
            <Plus size={20} />
        </button>
    </div>
);

export default QuantityControl;
