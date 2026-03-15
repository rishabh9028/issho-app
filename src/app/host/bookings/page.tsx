"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HostSidebar from "@/components/host/HostSidebar";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string;
}

interface Space {
    id: string;
    title: string;
    location: string;
    images: string[];
}

interface Booking {
    id: string;
    space_id: string;
    user_id: string;
    start_time: string;
    end_time: string;
    total_price: number;
    status: string;
    spaces: Space;
    profiles: Profile | Profile[];
}

export default function HostBookings() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "host" && user.role !== "admin") {
            router.push("/become-a-host");
        }
    }, [user, router]);

    const fetchBookings = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("bookings")
            .select(`
                *,
                spaces!inner (*),
                profiles:user_id (*)
            `)
            .eq("spaces.host_id", user.id)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setBookings(data as any);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();

        // Real-time bookings
        const channel = supabase
            .channel(`host_bookings_${user?.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings'
                },
                () => {
                    fetchBookings();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const updateBookingStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from("bookings")
            .update({ status: newStatus })
            .eq("id", id);
        
        if (!error) {
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        }
    };

    if (!user) return null;

    const filteredBookings = bookings.filter(b => {
        if (activeTab === "all") return true;
        if (activeTab === "pending") return b.status === "pending";
        if (activeTab === "upcoming") return b.status === "confirmed";
        if (activeTab === "completed") return b.status === "completed";
        if (activeTab === "cancelled") return b.status === "cancelled";
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

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    return (
        <div className="w-full bg-[#F8FAFF] min-h-screen pb-24 md:pb-0">
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
                        <div className="flex items-center gap-8 mb-8 border-b border-slate-200 overflow-x-auto whitespace-nowrap hide-scrollbar pb-1">
                            {[
                                { id: "all", label: "All Bookings", count: bookings.length },
                                { id: "pending", label: "Pending", count: bookings.filter(b => b.status === "pending").length },
                                { id: "upcoming", label: "Upcoming", count: bookings.filter(b => b.status === "confirmed").length },
                                { id: "completed", label: "Completed", count: bookings.filter(b => b.status === "completed").length },
                                { id: "cancelled", label: "Cancelled", count: bookings.filter(b => b.status === "cancelled").length }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 text-sm font-black transition-all relative ${activeTab === tab.id ? "text-[#2F2BFF]" : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    {tab.label} <span className="ml-1 opacity-50 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full font-bold">{tab.count}</span>
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gradient"></div>}
                                </button>
                            ))}
                        </div>

                        {/* Booking List */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(n => (
                                        <div key={n} className="h-40 w-full bg-slate-100 animate-pulse rounded-[32px]" />
                                    ))}
                                </div>
                            ) : filteredBookings.length > 0 ? (
                                filteredBookings.map((b) => {
                                    const space = b.spaces;
                                    const guest = b.profiles;
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
                                                    {(() => {
                                                        const profile = Array.isArray(guest) ? guest[0] : guest;
                                                        const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${b.user_id}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                                                        return (
                                                            <img src={avatarUrl} alt="Guest" className="w-full h-full object-cover" />
                                                        );
                                                    })()}
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="font-black text-xl text-slate-900 leading-tight mb-1">
                                                        {(Array.isArray(guest) ? guest[0] : guest)?.full_name || "Guest User"}
                                                    </h4>
                                                    <p className="text-[10px] font-black text-[#2F2BFF] uppercase tracking-widest bg-[#2F2BFF]/5 px-2 py-0.5 rounded-md inline-block">Verified Guest</p>
                                                </div>
                                            </div>

                                            {/* Space Info */}
                                            <div className="flex-1 lg:border-l lg:border-slate-50 lg:pl-8 text-left">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Space Details</h5>
                                                <p className="font-black text-slate-900 text-lg mb-1">{space?.title}</p>
                                                <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">location_on</span> {space?.location}</p>
                                            </div>

                                            {/* Schedule Info */}
                                            <div className="flex-1 lg:border-l lg:border-slate-50 lg:pl-8 text-left">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Staying On</h5>
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-black text-slate-900 text-base">{new Date(b.start_time).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                                                    <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {formatTime(b.start_time)} - {formatTime(b.end_time)}</p>
                                                </div>
                                            </div>

                                            {/* Revenue Info */}
                                            <div className="flex-1 lg:border-l lg:border-slate-50 lg:pl-8 text-left">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                    {b.status === "completed" ? "Final Payout" : b.status === "cancelled" ? "Payout Forfeited" : "Expected Payout"}
                                                </h5>
                                                {b.status === "cancelled" ? (
                                                    <p className="font-black text-2xl text-slate-400">₹0</p>
                                                ) : (
                                                    <p className="font-black text-2xl text-slate-900">₹{Number(b.total_price).toLocaleString()}</p>
                                                )}
                                                
                                                {b.status === "completed" && (
                                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Ready for release</p>
                                                )}
                                                {(b.status === "pending" || b.status === "confirmed") && (
                                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Pending Stay</p>
                                                )}
                                                {b.status === "cancelled" && (
                                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1">Booking Cancelled</p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex lg:flex-col gap-2 shrink-0 lg:pl-8">
                                                {b.status === "pending" ? (
                                                    <>
                                                        <button 
                                                            onClick={() => updateBookingStatus(b.id, "confirmed")}
                                                            className="h-12 px-8 rounded-xl bg-brand-gradient text-white text-xs font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => updateBookingStatus(b.id, "cancelled")}
                                                            className="h-12 px-8 rounded-xl bg-slate-50 text-slate-400 text-xs font-black border border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all"
                                                        >
                                                            Decline
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link href={`/host/bookings/${b.id}`} className="h-12 px-8 w-full block text-center leading-[3rem] rounded-xl bg-slate-900 border border-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-all">View Details</Link>
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
                                    <button onClick={() => setActiveTab("all")} className="text-[#2F2BFF] font-black text-sm hover:underline">Clear all filters</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="mt-20 border-t border-slate-200 py-8 text-center px-4">
                <p className="text-slate-400 text-xs font-bold">© 2024 Isshō. All rights reserved.</p>
            </footer>
        </div>
    );
}
