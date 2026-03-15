"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, MapPin, Calendar, Users, X } from "lucide-react";
import DateRangePicker from "@/components/ui/DateRangePicker";
import GuestPicker from "@/components/ui/GuestPicker";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";

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
            <div className="flex flex-col md:flex-row items-center bg-white rounded-2xl md:rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-50 p-1.5 gap-0">
                {/* Where */}
                <div className="flex-1 w-full flex items-center gap-2.5 px-6 py-2.5 md:border-r border-slate-100 hover:bg-slate-50 transition-all rounded-t-2xl md:rounded-l-full md:rounded-tr-none cursor-pointer group outline-none relative">
                    <MapPin className="w-4 h-4 text-[#2F2BFF] flex-shrink-0" />
                    <div className="flex flex-col w-full text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 group-hover:text-[#2F2BFF] transition-colors">Where</span>
                        <AddressAutocomplete
                            value={location ? { label: location, value: location } : null}
                            onSelect={(data) => setLocation(data.label)}
                            placeholder="Search destinations"
                            className="w-full"
                            variant="bare"
                        />
                    </div>
                </div>

                {/* Dates */}
                <div
                    onClick={() => { setShowCal(!showCal); setShowGuests(false); }}
                    className={`flex-1 w-full flex items-center gap-2.5 px-6 py-2.5 md:border-r border-slate-100 cursor-pointer transition-all hover:bg-slate-50 group outline-none ${showCal ? 'bg-white ring-1 ring-slate-900 rounded-full z-20' : ''}`}
                >
                    <Calendar className={`w-4 h-4 ${showCal ? 'text-[#2F2BFF]' : 'text-slate-400 group-hover:text-[#2F2BFF]'}`} />
                    <div className="flex flex-col w-full text-left">
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 transition-colors text-left ${showCal ? 'text-[#2F2BFF]' : 'text-slate-400 group-hover:text-[#2F2BFF]'}`}>Dates</span>
                        <span className={`text-sm font-semibold transition-colors text-left ${dateLabel ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                            {dateLabel || "Add dates"}
                        </span>
                    </div>
                </div>

                {/* Who */}
                <div
                    onClick={() => { setShowGuests(!showGuests); setShowCal(false); }}
                    className={`flex-1 w-full flex items-center gap-2.5 px-6 py-2.5 bg-white hover:bg-slate-50 transition-all cursor-pointer group relative outline-none ${showGuests ? 'ring-1 ring-slate-900 rounded-full z-20' : ''}`}
                >
                    <Users className={`w-4 h-4 ${showGuests ? 'text-[#2F2BFF]' : 'text-slate-400 group-hover:text-[#2F2BFF]'}`} />
                    <div className="flex flex-col w-full text-left">
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 transition-colors text-left ${showGuests ? 'text-[#2F2BFF]' : 'text-slate-400 group-hover:text-[#2F2BFF]'}`}>Guests</span>
                        <div className="flex items-center justify-between pointer-events-none">
                            <span className={`text-sm font-semibold transition-colors text-left ${guestLabel !== "Add guests" ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                                {guestLabel}
                            </span>
                            <ChevronDown className={`w-3.4 h-3.4 text-[#2F2BFF] transition-transform ${showGuests ? 'rotate-180' : ''}`} />
                        </div>
                    </div>
                </div>

                {/* Search Button */}
                <div className="w-full md:w-auto p-1.5">
                    <button
                        onClick={handleSearch}
                        className="bg-brand-gradient hover:opacity-90 text-white w-full md:w-auto px-8 h-[48px] rounded-full transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-[#2F2BFF]/20"
                    >
                        <Search className="w-4.5 h-4.5 text-white" />
                        <span className="text-sm font-bold text-white uppercase tracking-wider">Search</span>
                    </button>
                </div>
            </div>

            {/* Date Picker Dropdown/Drawer */}
            {showCal && (
                <div className="fixed inset-0 md:absolute md:inset-auto md:top-[calc(100%+12px)] md:left-1/2 md:-translate-x-1/2 w-full max-w-none md:max-w-[820px] bg-white rounded-none md:rounded-3xl shadow-2xl border-none md:border border-slate-100 z-[100] animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-top-2 duration-300 md:duration-300 flex flex-col">
                    {/* Mobile Header */}
                    <div className="flex md:hidden items-center justify-between p-6 border-b border-slate-100">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Select Dates</h3>
                        <button onClick={() => setShowCal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                            <X className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        <DateRangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            onClose={() => setShowCal(false)}
                        />
                    </div>
                </div>
            )}

            {/* Guest Picker Dropdown/Drawer */}
            {showGuests && (
                <div className="fixed inset-0 md:absolute md:inset-auto md:top-[calc(100%+12px)] md:right-0 w-full md:w-96 bg-white rounded-none md:rounded-3xl shadow-2xl border-none md:border border-slate-100 z-[100] animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-top-2 duration-300 flex flex-col">
                    {/* Mobile Header */}
                    <div className="flex md:hidden items-center justify-between p-6 border-b border-slate-100 text-left">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Add Guests</h3>
                        <button onClick={() => setShowGuests(false)} className="p-2 hover:bg-slate-100 rounded-full">
                            <X className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <GuestPicker
                            value={guests}
                            onChange={setGuests}
                            onClose={() => setShowGuests(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
