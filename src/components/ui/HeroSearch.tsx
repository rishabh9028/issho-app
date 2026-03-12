"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, MapPin, Calendar, Users } from "lucide-react";
import DateRangePicker from "@/components/ui/DateRangePicker";
import GuestPicker from "@/components/ui/GuestPicker";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatRange(start: Date | null, end: Date | null) {
    if (!start) return "";
    const s = `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()}`;
    if (!end) return s;
    const e = `${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}`;
    return `${s} – ${e}`;
}

export function HeroSearch() {
    const router = useRouter();
    const [location, setLocation] = useState("");
    const [showCal, setShowCal] = useState(false);
    const [showGuests, setShowGuests] = useState(false);

    // Dates State
    const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

    // Guests State
    const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0 });

    const containerRef = useRef<HTMLDivElement>(null);

    const dateLabel = formatRange(dateRange.start, dateRange.end);

    const guestLabel = (() => {
        const parts = [];
        if (guests.adults > 0) parts.push(`${guests.adults} Adult${guests.adults > 1 ? 's' : ''}`);
        if (guests.children > 0) parts.push(`${guests.children} Child${guests.children > 1 ? 'ren' : ''}`);
        if (guests.infants > 0) parts.push(`${guests.infants} Infant${guests.infants > 1 ? 's' : ''}`);
        return parts.length > 0 ? parts.join(", ") : "Add guests";
    })();

    function handleSearch() {
        const params = new URLSearchParams();
        if (location) params.set("location", location);
        if (dateRange.start) params.set("checkin", dateRange.start.toISOString());
        if (dateRange.end) params.set("checkout", dateRange.end.toISOString());
        params.set("adults", guests.adults.toString());
        params.set("children", guests.children.toString());
        params.set("infants", guests.infants.toString());

        router.push(`/search?${params.toString()}`);
    }

    return (
        <div ref={containerRef} className="relative w-full max-w-4xl mx-auto z-[60]">
            <div className="flex flex-col md:flex-row items-center bg-white rounded-2xl md:rounded-full shadow-2xl border border-slate-100 p-1.5 gap-0">
                {/* Where */}
                <div className="flex-1 w-full flex items-center gap-2.5 px-6 py-2.5 md:border-r border-slate-100 hover:bg-slate-50 transition-all rounded-t-2xl md:rounded-l-full md:rounded-tr-none cursor-pointer group outline-none">
                    <MapPin className="w-4 h-4 text-[#1d1aff]" />
                    <div className="flex flex-col w-full text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 group-hover:text-[#1d1aff] transition-colors">Where</span>
                        <input
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSearch()}
                            className="bg-transparent border-none outline-none p-0 text-sm font-semibold text-[#222222] placeholder:text-slate-400 w-full focus:ring-0"
                            placeholder="Search destinations"
                        />
                    </div>
                </div>

                {/* Dates */}
                <div
                    onClick={() => { setShowCal(!showCal); setShowGuests(false); }}
                    className={`flex-1 w-full flex items-center gap-2.5 px-6 py-2.5 md:border-r border-slate-100 cursor-pointer transition-all hover:bg-slate-50 group outline-none ${showCal ? 'bg-white ring-1 ring-slate-900 rounded-full z-20' : ''}`}
                >
                    <Calendar className={`w-4 h-4 ${showCal ? 'text-[#1d1aff]' : 'text-slate-400 group-hover:text-[#1d1aff]'}`} />
                    <div className="flex flex-col w-full text-left">
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 transition-colors text-left ${showCal ? 'text-[#1d1aff]' : 'text-slate-400 group-hover:text-[#1d1aff]'}`}>Dates</span>
                        <span className={`text-sm font-semibold transition-colors text-left ${dateLabel ? 'text-[#222222]' : 'text-slate-400'}`}>
                            {dateLabel || "Add dates"}
                        </span>
                    </div>
                </div>

                {/* Who */}
                <div
                    onClick={() => { setShowGuests(!showGuests); setShowCal(false); }}
                    className={`flex-1 w-full flex items-center gap-2.5 px-6 py-2.5 bg-white hover:bg-slate-50 transition-all cursor-pointer group relative outline-none ${showGuests ? 'ring-1 ring-slate-900 rounded-full z-20' : ''}`}
                >
                    <Users className={`w-4 h-4 ${showGuests ? 'text-[#1d1aff]' : 'text-slate-400 group-hover:text-[#1d1aff]'}`} />
                    <div className="flex flex-col w-full text-left">
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 transition-colors text-left ${showGuests ? 'text-[#1d1aff]' : 'text-slate-400 group-hover:text-[#1d1aff]'}`}>Guests</span>
                        <div className="flex items-center justify-between pointer-events-none">
                            <span className={`text-sm font-semibold transition-colors text-left ${guestLabel !== "Add guests" ? 'text-[#222222]' : 'text-slate-400'}`}>
                                {guestLabel}
                            </span>
                            <ChevronDown className={`w-3.4 h-3.4 text-[#1d1aff] transition-transform ${showGuests ? 'rotate-180' : ''}`} />
                        </div>
                    </div>
                </div>

                {/* Search Button */}
                <div className="w-full md:w-auto p-1.5">
                    <button
                        onClick={handleSearch}
                        className="bg-[#1d1aff] hover:bg-[#1614cc] text-white w-full md:w-auto px-6 h-[48px] rounded-full transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Search className="w-4.5 h-4.5 text-white" />
                        <span className="text-sm font-bold text-white">Search</span>
                    </button>
                </div>
            </div>

            {/* Date Picker Dropdown */}
            {showCal && (
                <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-full max-w-[820px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                    <DateRangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        onClose={() => setShowCal(false)}
                    />
                </div>
            )}

            {/* Guest Picker Dropdown */}
            {showGuests && (
                <div className="absolute top-[calc(100%+12px)] right-0 w-full md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                    <GuestPicker
                        value={guests}
                        onChange={setGuests}
                        onClose={() => setShowGuests(false)}
                    />
                </div>
            )}
        </div>
    );
}
