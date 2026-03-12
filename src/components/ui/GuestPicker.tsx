"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Minus } from "lucide-react";

interface Guests {
    adults: number;
    children: number;
    infants: number;
}

interface Props {
    value: Guests;
    onChange: (guests: Guests) => void;
    onClose: () => void;
}

export default function GuestPicker({ value, onChange, onClose }: Props) {
    const [localGuests, setLocalGuests] = useState<Guests>(value);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    function updateCount(type: keyof Guests, delta: number) {
        setLocalGuests(prev => {
            const newValue = Math.max(0, prev[type] + delta);
            // Ensure at least 1 adult if there are children or infants
            if (type === 'adults' && newValue === 0 && (prev.children > 0 || prev.infants > 0)) {
                return prev;
            }
            return { ...prev, [type]: newValue };
        });
    }

    function handleApply() {
        onChange(localGuests);
        onClose();
    }

    function handleClear() {
        const reset = { adults: 1, children: 0, infants: 0 };
        setLocalGuests(reset);
        onChange(reset);
    }

    return (
        <div
            ref={ref}
            className="w-full flex flex-col gap-6 text-left p-6 md:p-8"
            onClick={e => e.stopPropagation()}
        >
            {/* Adults */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-slate-900 font-bold text-lg">Adults</span>
                    <span className="text-sm text-slate-500">Ages 13 or above</span>
                </div>
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => updateCount('adults', -1)}
                        disabled={localGuests.adults <= 1 && (localGuests.children > 0 || localGuests.infants > 0)}
                        className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#1d1aff] hover:text-[#1d1aff] transition-all active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-6 text-center font-black text-slate-900 text-lg">{localGuests.adults}</span>
                    <button
                        onClick={() => updateCount('adults', 1)}
                        className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#1d1aff] hover:text-[#1d1aff] transition-all active:scale-90"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="h-px bg-slate-100"></div>

            {/* Children */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-slate-900 font-bold text-lg">Children</span>
                    <span className="text-sm text-slate-500">Ages 2 – 12</span>
                </div>
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => updateCount('children', -1)}
                        disabled={localGuests.children === 0}
                        className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#1d1aff] hover:text-[#1d1aff] transition-all active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-6 text-center font-black text-slate-900 text-lg">{localGuests.children}</span>
                    <button
                        onClick={() => updateCount('children', 1)}
                        className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#1d1aff] hover:text-[#1d1aff] transition-all active:scale-90"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="h-px bg-slate-100"></div>

            {/* Infants */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-slate-900 font-bold text-lg">Infants</span>
                    <span className="text-sm text-slate-500">Under 2</span>
                </div>
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => updateCount('infants', -1)}
                        disabled={localGuests.infants === 0}
                        className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#1d1aff] hover:text-[#1d1aff] transition-all active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-6 text-center font-black text-slate-900 text-lg">{localGuests.infants}</span>
                    <button
                        onClick={() => updateCount('infants', 1)}
                        className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#1d1aff] hover:text-[#1d1aff] transition-all active:scale-90"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6">
                <button
                    onClick={handleClear}
                    className="text-sm font-bold text-slate-400 hover:text-slate-900 underline underline-offset-8 decoration-slate-200"
                >
                    Clear all
                </button>
                <button
                    onClick={handleApply}
                    className="bg-[#1d1aff] hover:bg-[#1614cc] text-white px-10 py-3 rounded-2xl text-base font-black shadow-xl shadow-[#1d1aff]/20 active:scale-95 transition-all"
                >
                    Apply
                </button>
            </div>
        </div>
    );
}
