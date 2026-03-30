import React from 'react';

const Slider = ({ value, onChange, min, max, label, prefix = '', suffix = '' }) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="w-full py-2">
            <div className="flex justify-between mb-4">
                {label && <span className="text-gray-500 font-medium">{label}</span>}
                <span className="text-xl font-bold text-secondary">
                    {prefix}{value.toLocaleString()}{suffix}
                </span>
            </div>
            <div className="relative w-full h-2">
                <div className="absolute w-full h-full bg-gray-200 rounded-full"></div>
                <div
                    className="absolute h-full bg-primary rounded-full"
                    style={{ width: `${percentage}%` }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                    className="absolute w-6 h-6 bg-white border-2 border-primary rounded-full shadow-lg top-1/2 -translate-y-1/2 pointer-events-none transition-all z-20"
                    style={{ left: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>{prefix}{min}{suffix}</span>
                <span>{prefix}{max}+{suffix}</span>
            </div>
        </div>
    );
};

export default Slider;
