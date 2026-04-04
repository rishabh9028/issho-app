"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, MapPin, Calendar, Users, X } from "lucide-react";
import DateRangePicker from "@/components/ui/DateRangePicker";
import GuestPicker from "@/components/ui/GuestPicker";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumButton } from "@/components/ui/PremiumButton";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatRange(start: Date | null, end: Date | null) {
  if (!start) return "";
  const s = `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()}`;
  if (!end) return s;
  const e = `${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}`;
  return `${s} – ${e}`;
}

export function PremiumHeroSearch() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const dateLabel = formatRange(dateRange.start, dateRange.end);

  const guestLabel = (() => {
    const total = guests.adults + guests.children;
    if (total === 0) return "Add guests";
    return `${total} Guest${total > 1 ? 's' : ''}${guests.infants > 0 ? `, ${guests.infants} Infant${guests.infants > 1 ? 's' : ''}` : ''}`;
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="relative w-full max-w-5xl z-[60]"
    >
      <div className="glass p-2 rounded-[2.5rem] md:rounded-full flex flex-col md:flex-row items-center gap-1 border border-white/40 shadow-premium">
        {/* Where */}
        <div 
          onClick={() => setActiveTab(activeTab === "location" ? null : "location")}
          className={cn(
            "flex-1 w-full flex items-center gap-4 px-8 py-4 rounded-full transition-all cursor-pointer group",
            activeTab === "location" ? "bg-white shadow-lg" : "hover:bg-white/40"
          )}
        >
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary transition-colors group-hover:bg-primary/10">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">Location</span>
            <AddressAutocomplete
              value={location ? { label: location, value: location } : null}
              onSelect={(data) => setLocation(data.label)}
              placeholder="Where to?"
              className="w-full"
              variant="bare"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-10 bg-slate-200/50" />

        {/* Dates */}
        <div
          onClick={() => setActiveTab(activeTab === "dates" ? null : "dates")}
          className={cn(
            "flex-1 w-full flex items-center gap-4 px-8 py-4 rounded-full transition-all cursor-pointer group",
            activeTab === "dates" ? "bg-white shadow-lg" : "hover:bg-white/40"
          )}
        >
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary transition-colors group-hover:bg-primary/10">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors text-left">Dates</span>
            <span className={cn("text-sm font-bold truncate text-left", dateLabel ? "text-slate-900" : "text-slate-400")}>
              {dateLabel || "Add dates"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-10 bg-slate-200/50" />

        {/* Guests */}
        <div
          onClick={() => setActiveTab(activeTab === "guests" ? null : "guests")}
          className={cn(
            "flex-1 w-full flex items-center gap-4 px-8 py-4 rounded-full transition-all cursor-pointer group",
            activeTab === "guests" ? "bg-white shadow-lg" : "hover:bg-white/40"
          )}
        >
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary transition-colors group-hover:bg-primary/10">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors text-left">Guests</span>
            <span className={cn("text-sm font-bold truncate text-left", guestLabel !== "Add guests" ? "text-slate-900" : "text-slate-400")}>
              {guestLabel}
            </span>
          </div>
        </div>

        {/* Search Button */}
        <div className="p-1 w-full md:w-auto">
          <PremiumButton
            onClick={handleSearch}
            variant="primary"
            className="w-full md:w-14 h-14 md:h-14 rounded-full md:p-0"
          >
            <Search className="w-6 h-6 md:w-5 md:h-5" />
            <span className="md:hidden">Search Spaces</span>
          </PremiumButton>
        </div>
      </div>

      {/* Popovers */}
      <AnimatePresence>
        {activeTab === "dates" && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-[calc(100%+16px)] left-0 md:left-1/2 md:-translate-x-1/2 w-full md:w-[850px] bg-white rounded-3xl shadow-premium border border-slate-100 p-4 z-[100]"
          >
             <div className="flex items-center justify-between p-4 border-b border-slate-50 md:hidden">
              <h3 className="font-black">Select Dates</h3>
              <button onClick={() => setActiveTab(null)}><X className="w-5 h-5"/></button>
            </div>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              onClose={() => setActiveTab(null)}
            />
          </motion.div>
        )}

        {activeTab === "guests" && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-[calc(100%+16px)] right-0 w-full md:w-80 bg-white rounded-3xl shadow-premium border border-slate-100 p-6 z-[100]"
          >
            <div className="flex items-center justify-between mb-6 md:hidden">
              <h3 className="font-black">Add Guests</h3>
              <button onClick={() => setActiveTab(null)}><X className="w-5 h-5"/></button>
            </div>
            <GuestPicker
              value={guests}
              onChange={setGuests}
              onClose={() => setActiveTab(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

import { cn } from "@/lib/utils";
