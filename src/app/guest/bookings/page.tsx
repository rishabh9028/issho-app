"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GuestSidebar from "@/components/guest/GuestSidebar";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Space {
    id: string;
    title: string;
    location: string;
    images: string[];
    type: string;
}

interface Booking {
    id: string;
    space_id: string;
    user_id: string;
    start_time: string;
    end_time: string;
    total_price: number;
    status: string;
    date: string;
    spaces: Space;
}

export default function GuestBookings() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "guest" && user.role !== "admin") {
            router.push("/host/dashboard");
        }
    }, [user, router]);

    useEffect(() => {
        if (!user) return;
        
        const fetchBookings = async (silent = false) => {
            if (!silent) setLoading(true);
            const { data, error } = await supabase
                .from("bookings")
                .select(`
                    *,
                    spaces (
                        id,
                        title,
                        location,
                        images,
                        type
                    )
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (!error && data) {
                setBookings(data as any);
            }
            if (!silent) setLoading(false);
        };

        fetchBookings();

        // Real-time subscription
        const channel = supabase
            .channel(`public:bookings:bookings_realtime`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
                    fetchBookings(true);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    if (!user) return null;

    const filteredBookings = bookings.filter(b => {
        if (activeTab === "all") return true;
        return b.status === activeTab;
    });

    return (
        <div className="w-full bg-[#F8FAFF] min-h-screen pb-24 md:pb-0">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <GuestSidebar user={user} currentPage="bookings" />

                    <div className="flex-1">
                        {/* Manage Stays Section */}
                        <div className="mb-8 text-left">
                            <h2 className="text-4xl font-black text-slate-900 mb-2">Manage Stays</h2>
                            <p className="text-slate-500 font-medium tracking-tight">Keep track of your upcoming travel plans and property details.</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-8 border-b border-slate-200 mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar pb-1">
                            {[
                                { id: "all", label: `All Stays (${bookings.length})` },
                                { id: "confirmed", label: `Upcoming (${bookings.filter(b => b.status === 'confirmed').length})` },
                                { id: "pending", label: `Pending (${bookings.filter(b => b.status === 'pending').length})` },
                                { id: "completed", label: `Completed (${bookings.filter(b => b.status === 'completed').length})` },
                                { id: "cancelled", label: `Cancelled (${bookings.filter(b => b.status === 'cancelled').length})` }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 px-1 text-sm font-bold transition-all relative ${activeTab === tab.id
                                        ? "text-[#2F2BFF]"
                                        : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-gradient rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Bookings List */}
                        <div className="flex flex-col gap-6">
                            {loading ? (
                                <div className="flex flex-col gap-4">
                                    {[1, 2].map(n => (
                                        <div key={n} className="h-48 w-full bg-slate-100 animate-pulse rounded-3xl" />
                                    ))}
                                </div>
                            ) : filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => {
                                    const space = booking.spaces;
                                    return (
                                        <div key={booking.id} className="flex flex-col lg:flex-row bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                                            {/* Image Column */}
                                            <div className="relative w-full lg:w-[320px] aspect-[4/3] lg:aspect-auto overflow-hidden">
                                                {(() => {
                                                    const typeFallbacks: { [key: string]: string } = {
                                                        villa: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                                                        studio: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
                                                        cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
                                                        rooftop: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88",
                                                        default: "https://images.unsplash.com/photo-1497366216548-37526070297c"
                                                    };
                                                    const fallback = (typeFallbacks[space?.type?.toLowerCase() || ''] || typeFallbacks.default) + "?q=80&w=400&auto=format&fit=crop";
                                                    const displayImg = (space?.images && space.images.length > 0 && !space.images[0].startsWith('blob:')) 
                                                        ? space.images[0] 
                                                        : fallback;
                                                    return (
                                                        <img
                                                            src={displayImg}
                                                            alt={space?.title || "Space"}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                                                        />
                                                    );
                                                })()}
                                                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm 
                                                    ${booking.status === 'confirmed' ? 'bg-green-500 text-white' : 
                                                      booking.status === 'cancelled' ? 'bg-slate-500 text-white' : 'bg-yellow-400 text-black'}`}>
                                                    {booking.status}
                                                </div>
                                            </div>

                                            {/* Info Column */}
                                            <div className="flex-1 p-6 flex flex-col justify-between gap-6">
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                    <div className="text-left">
                                                        <h3 className="text-2xl font-black text-slate-900 leading-tight mb-1">{space?.title}</h3>
                                                        <p className="text-sm font-bold text-slate-500">{space?.location}</p>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL</p>
                                                        <p className="text-3xl font-black text-slate-900">₹{booking.total_price.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-x-8 gap-y-2 items-center text-sm font-bold text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[#2F2BFF] font-bold">calendar_today</span>
                                                        {new Date(booking.start_time).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                                    </div>
                                                    <div className="flex items-center gap-2 font-bold text-slate-400">
                                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">schedule</span>
                                                        {new Date(booking.start_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} - {new Date(booking.end_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <Link
                                                        href={`/guest/bookings/${booking.id}`}
                                                        className="flex-1 flex items-center justify-center bg-brand-gradient hover:bg-blue-700 text-white py-3.5 px-6 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                                                    >
                                                        Manage Booking
                                                    </Link>
                                                    <Link
                                                        href={`/spaces/${booking.space_id}`}
                                                        className="flex-none sm:px-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 py-3.5 px-6 rounded-2xl font-black text-sm transition-all active:scale-[0.98] border border-slate-100"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
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
                                        <h3 className="text-xl font-black text-slate-900 mb-2">No stays found</h3>
                                        <p className="text-slate-400 text-sm font-medium">You don't have any bookings matching this criteria yet.</p>
                                    </div>
                                    <button onClick={() => setActiveTab("all")} className="text-[#2F2BFF] font-black text-sm hover:underline">View all bookings</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
