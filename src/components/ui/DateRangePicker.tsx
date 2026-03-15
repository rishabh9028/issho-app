"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface Props {
    value: DateRange;
    onChange: (range: DateRange) => void;
    onClose: () => void;
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBetween(d: Date, start: Date, end: Date) {
    return d > start && d < end;
}
function formatDate(d: Date) {
    return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

function CalendarMonth({
    year, month, range, hover,
    onDayClick, onDayHover,
    onPrev, onNext, showPrev, showNext,
}: {
    year: number; month: number;
    range: DateRange; hover: Date | null;
    onDayClick: (d: Date) => void;
    onDayHover: (d: Date | null) => void;
    onPrev?: () => void; onNext?: () => void;
    showPrev: boolean; showNext: boolean;
}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const activeEnd = range.start && !range.end && hover ? hover : range.end;

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    return (
        <div className="flex-1 flex flex-col min-w-[280px]">
            <div className="flex items-center justify-between mb-8">
                {showPrev ? (
                    <button onClick={onPrev} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                ) : <div className="w-9 h-9" />}
                <h3 className="font-black text-slate-900 text-lg">{MONTHS[month]} {year}</h3>
                {showNext ? (
                    <button onClick={onNext} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                ) : <div className="w-9 h-9" />}
            </div>

            <div className="grid grid-cols-7 text-center gap-y-2">
                {DAYS.map(d => (
                    <span key={d} className="text-[10px] font-black text-slate-400 py-2 tracking-widest">{d}</span>
                ))}
                {cells.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} />;
                    const isPast = date < today;
                    const isStart = range.start && isSameDay(date, range.start);
                    const isEnd = activeEnd && isSameDay(date, activeEnd);
                    const inRange = range.start && activeEnd && range.start <= activeEnd
                        ? isBetween(date, range.start, activeEnd)
                        : false;
                    const isStartOfWeek = date.getDay() === 0;
                    const isEndOfWeek = date.getDay() === 6;

                    return (
                        <div
                            key={date.toISOString()}
                            className="relative"
                        >
                            {(inRange || (isStart && activeEnd) || (isEnd && range.start)) && (
                                <div className={`absolute inset-y-1 ${isStart ? "left-1/2 right-0" :
                                    isEnd ? "left-0 right-1/2" :
                                        "left-0 right-0"
                                    } ${isStartOfWeek && !isStart ? "rounded-l-full" : ""} ${isEndOfWeek && !isEnd ? "rounded-r-full" : ""} bg-[#2F2BFF]/10`} />
                            )}
                            <button
                                disabled={isPast}
                                onClick={() => !isPast && onDayClick(date)}
                                onMouseEnter={() => onDayHover(date)}
                                onMouseLeave={() => onDayHover(null)}
                                className={`relative z-10 h-11 w-full flex items-center justify-center text-sm rounded-full transition-all
                                    ${isPast ? "text-slate-300 cursor-not-allowed" : ""}
                                    ${isStart || isEnd
                                        ? "bg-brand-gradient text-white font-black shadow-lg shadow-[#2F2BFF]/30 scale-110"
                                        : inRange
                                            ? "text-[#2F2BFF] font-bold hover:bg-[#2F2BFF]/20"
                                            : isPast ? "" : "text-slate-900 font-medium hover:bg-slate-100"
                                    }`}
                            >
                                {date.getDate()}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function DateRangePicker({ value, onChange, onClose }: Props) {
    const today = new Date();
    const [leftYear, setLeftYear] = useState(today.getFullYear());
    const [leftMonth, setLeftMonth] = useState(today.getMonth());
    const [hover, setHover] = useState<Date | null>(null);
    const [localRange, setLocalRange] = useState<DateRange>(value);
    const [flexibility, setFlexibility] = useState<"exact" | "1" | "3">("exact");
    const ref = useRef<HTMLDivElement>(null);

    const rightMonth = (leftMonth + 1) % 12;
    const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    function handleDayClick(date: Date) {
        if (!localRange.start || (localRange.start && localRange.end)) {
            setLocalRange({ start: date, end: null });
        } else {
            if (date < localRange.start) {
                setLocalRange({ start: date, end: localRange.start });
            } else {
                setLocalRange({ start: localRange.start, end: date });
            }
        }
    }

    function handleApply() {
        onChange(localRange);
        onClose();
    }

    function handleClear() {
        setLocalRange({ start: null, end: null });
        onChange({ start: null, end: null });
    }

    function prevMonth() {
        if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y - 1); }
        else setLeftMonth(m => m - 1);
    }
    function nextMonth() {
        if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y + 1); }
        else setLeftMonth(m => m + 1);
    }

    const label = localRange.start && localRange.end
        ? `${formatDate(localRange.start)} – ${formatDate(localRange.end)}`
        : localRange.start ? `${formatDate(localRange.start)} – ...`
            : "";

    return (
        <div
            ref={ref}
            className="w-full flex flex-col bg-white"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex flex-col md:flex-row p-8 md:p-10 gap-12 justify-center">
                <CalendarMonth
                    year={leftYear} month={leftMonth}
                    range={localRange} hover={hover}
                    onDayClick={handleDayClick} onDayHover={setHover}
                    onPrev={prevMonth} showPrev={true} showNext={false}
                />
                <div className="hidden md:block w-px bg-slate-100 self-stretch" />
                <CalendarMonth
                    year={rightYear} month={rightMonth}
                    range={localRange} hover={hover}
                    onDayClick={handleDayClick} onDayHover={setHover}
                    onNext={nextMonth} showPrev={false} showNext={true}
                />
            </div>

            {/* Bottom bar */}
            <div className="border-t border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/50">
                <div className="flex gap-2">
                    {(["exact", "1", "3"] as const).map(v => (
                        <button
                            key={v}
                            onClick={() => setFlexibility(v)}
                            className={`px-5 py-2.5 text-xs font-black rounded-full border transition-all ${flexibility === v
                                ? "border-[#2F2BFF] text-[#2F2BFF] bg-[#2F2BFF]/5 shadow-sm"
                                : "border-slate-200 text-slate-500 hover:bg-white"
                                }`}
                        >
                            {v === "exact" ? "Exact dates" : `+/- ${v} day${v === "1" ? "" : "s"}`}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-6">
                    {label && <p className="text-sm font-black text-slate-900">{label}</p>}
                    <button onClick={handleClear} className="text-sm font-bold text-slate-400 hover:text-slate-900 underline underline-offset-8 decoration-slate-200">
                        Clear all
                    </button>
                    <button
                        onClick={handleApply}
                        className="bg-brand-gradient hover:bg-[#1614cc] text-white px-10 py-3 rounded-2xl text-base font-black shadow-xl shadow-[#2F2BFF]/20 active:scale-95 transition-all"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
