"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HostSidebar from "@/components/host/HostSidebar";
import bookingsData from "@/data/bookings.json";
import spacesData from "@/data/spaces.json";
import Link from "next/link";

export default function HostBookings() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "host" && user.role !== "admin") {
            router.push("/guest/dashboard");
        }
    }, [user, router]);

    if (!user) return null;

    // Filter logic
    const mySpaces = spacesData.filter(s => s.host_id === user.id);
    const mySpaceIds = mySpaces.map(s => s.id);
    const allIncomingBookings = bookingsData.filter(b => mySpaceIds.includes(b.space_id));

    const filteredBookings = allIncomingBookings.filter(b => {
        if (activeTab === "all") return true;
        if (activeTab === "pending") return b.status === "pending";
        if (activeTab === "upcoming") return b.status === "confirmed";
        if (activeTab === "completed") return b.status === "completed" || b.status === "cancelled";
        return true;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "confirmed": return "bg-emerald-50 text-emerald-500 border-emerald-100";
            case "pending": return "bg-rose-50 text-rose-500 border-rose-100";
            case "completed": return "bg-slate-50 text-slate-400 border-slate-100";
            case "cancelled": return "bg-slate-100 text-slate-400 border-slate-200";
            default: return "bg-slate-50 text-slate-500 border-slate-100";
        }
    };

    return (
        <div className="w-full bg-[#f8f6f6] min-h-screen">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <HostSidebar user={user} currentPage="bookings" />

                    <div className="flex-1">
                        {/* Header Section */}
                        <header className="mb-10 flex flex-wrap justify-between items-end gap-4">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-slate-900 text-4xl font-black tracking-tight">Booking Management</h1>
                                <p className="text-slate-500 text-lg font-medium">Coordinate your stays, handle requests, and review history.</p>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-3.5 text-sm font-black text-slate-700 hover:bg-slate-50 shadow-sm active:scale-95 transition-all">
                                    <span className="material-symbols-outlined font-black">download</span>
                                    Export CSV
                                </button>
                            </div>
                        </header>

                        {/* Tabs */}
                        <div className="flex gap-8 mb-8 border-b border-slate-200">
                            {[
                                { id: "all", label: "All Bookings", count: allIncomingBookings.length },
                                { id: "pending", label: "Pending", count: allIncomingBookings.filter(b => b.status === "pending").length },
                                { id: "upcoming", label: "Upcoming", count: allIncomingBookings.filter(b => b.status === "confirmed").length },
                                { id: "completed", label: "History", count: allIncomingBookings.filter(b => b.status === "completed" || b.status === "cancelled").length }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 text-sm font-black transition-all relative ${activeTab === tab.id ? "text-[#1d1aff]" : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    {tab.label} <span className="ml-1 opacity-50 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full font-bold">{tab.count}</span>
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d1aff]"></div>}
                                </button>
                            ))}
                        </div>

                        {/* Booking List */}
                        <div className="space-y-4">
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((b) => {
                                    const space = mySpaces.find(s => s.id === b.space_id);
                                    return (
                                        <div key={b.id} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col lg:flex-row items-start lg:items-center gap-8 relative overflow-hidden">
                                            {/* Status Badge Overhang */}
                                            <div className="absolute top-0 right-0">
                                                <span className={`px-6 py-2 rounded-bl-[20px] text-[10px] font-black uppercase tracking-widest border-l border-b ${getStatusStyle(b.status)}`}>
                                                    {b.status === "confirmed" ? "Upcoming" : b.status}
                                                </span>
                                            </div>

                                            {/* Guest Info */}
                                            <div className="flex items-center gap-6 shrink-0">
                                                <div className="h-20 w-20 rounded-[24px] overflow-hidden shadow-inner border border-slate-100 bg-slate-50 relative group-hover:scale-105 transition-transform duration-700">
                                                    <img src={`https://i.pravatar.cc/150?u=${b.user_id}`} alt="Guest" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-xl text-slate-900 leading-tight mb-1">Guest User</h4>
                                                    <p className="text-[10px] font-black text-[#1d1aff] uppercase tracking-widest bg-[#1d1aff]/5 px-2 py-0.5 rounded-md inline-block">Verified Guest</p>
                                                </div>
                                            </div>

                                            {/* Space Info */}
                                            <div className="flex-1 lg:border-l lg:border-slate-50 lg:pl-8">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Space Details</h5>
                                                <p className="font-black text-slate-900 text-lg mb-1">{space?.title}</p>
                                                <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">location_on</span> {space?.location}</p>
                                            </div>

                                            {/* Schedule Info */}
                                            <div className="flex-1 lg:border-l lg:border-slate-50 lg:pl-8">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Staying On</h5>
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-black text-slate-900 text-base">{new Date(b.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                                                    <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {b.start_time} - {b.end_time}</p>
                                                </div>
                                            </div>

                                            {/* Revenue Info */}
                                            <div className="flex-1 lg:border-l lg:border-slate-50 lg:pl-8">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expected Payout</h5>
                                                <p className="font-black text-2xl text-slate-900">${b.total_price}</p>
                                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ready for release</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex lg:flex-col gap-2 shrink-0 lg:pl-8">
                                                {b.status === "pending" ? (
                                                    <>
                                                        <button className="h-12 px-8 rounded-xl bg-[#1d1aff] text-white text-xs font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Approve</button>
                                                        <button className="h-12 px-8 rounded-xl bg-slate-50 text-slate-400 text-xs font-black border border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all">Decline</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="h-12 px-8 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-[#1d1aff] transition-colors active:scale-95">Message Guest</button>
                                                        <button className="h-12 px-8 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black hover:bg-slate-50 transition-all">View Details</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-white rounded-[40px] p-24 border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-6">
                                    <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                        <span className="material-symbols-outlined text-4xl font-thin">calendar_today</span>
                                    </div>
                                    <div className="max-w-xs">
                                        <h3 className="text-xl font-black text-slate-900 mb-2">No bookings found</h3>
                                        <p className="text-slate-400 text-sm font-medium">There are no bookings matching this criteria yet.</p>
                                    </div>
                                    <button onClick={() => setActiveTab("all")} className="text-[#1d1aff] font-black text-sm hover:underline">Clear all filters</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="mt-20 border-t border-slate-200 py-8 text-center px-4">
                <p className="text-slate-400 text-xs font-bold">© 2024 Isshō Host. All rights reserved.</p>
            </footer>
        </div>
    );
}
