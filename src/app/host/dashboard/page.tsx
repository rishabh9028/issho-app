"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HostSidebar from "@/components/host/HostSidebar";

interface Space {
    id: string;
    title: string;
    location: string;
    price_per_hour: number;
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
    profiles?: {
        full_name: string;
        avatar_url: string;
    } | {
        full_name: string;
        avatar_url: string;
    }[];
    spaces?: {
        title: string;
    };
}

export default function HostDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [mySpaces, setMySpaces] = useState<Space[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        if (user.role !== "host" && user.role !== "admin") {
            router.push("/become-a-host");
            return;
        }

        const fetchData = async () => {
            // Fetch Host's Spaces
            const { data: spacesData, error: spacesError } = await supabase
                .from("spaces")
                .select("*")
                .eq("host_id", user.id);

            if (spacesError) {
                console.error("Error fetching spaces for user:", user.id, {
                    message: spacesError.message,
                    details: spacesError.details,
                    hint: spacesError.hint,
                    code: spacesError.code
                });
            } else {
                setMySpaces(spacesData || []);
                
                if (spacesData && spacesData.length > 0) {
                    const spaceIds = spacesData.map(s => s.id);
                    
                    // Fetch Bookings for these spaces
                    const { data: bookingsData, error: bookingsError } = await supabase
                        .from("bookings")
                        .select(`
                            *,
                            profiles:user_id (*),
                            spaces:space_id (*)
                        `)
                        .in("space_id", spaceIds)
                        .order("created_at", { ascending: false });

                    if (bookingsError) {
                        console.error("Error fetching bookings:", bookingsError);
                    } else {
                        setBookings(bookingsData as Booking[] || []);
                    }
                }
            }
            setLoading(false);
        };

        fetchData();
    }, [user, router]);

    const handleStatusUpdate = async (bookingId: string, status: 'confirmed' | 'cancelled' | 'completed') => {
        try {
            const { error } = await supabase
                .from("bookings")
                .update({ status })
                .eq("id", bookingId);

            if (error) {
                console.error("Error updating booking status:", error);
                alert("Could not update status: " + error.message);
            } else {
                // Optimistically update local state
                setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
            }
        } catch (err: any) {
            console.error("Fatal error updating status:", err);
            alert("An error occurred: " + err.message);
        }
    };

    const getGuestAvatar = (booking: Booking) => {
        const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles;
        if (profile?.avatar_url) return profile.avatar_url;
        // Fallback to stylized DiceBear avatar
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.user_id}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    };

    const getGuestName = (booking: Booking) => {
        const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles;
        return profile?.full_name || 'Guest Request';
    };

    if (!user || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-[#2F2BFF]/20 border-t-[#2F2BFF] rounded-full animate-spin" />
            </div>
        );
    }

    const pendingRequests = bookings.filter(b => b.status === "pending");
    const activeBookings = bookings.filter(b => b.status === "confirmed");
    const completedBookings = bookings.filter(b => b.status === "completed");
    const totalEarnings = bookings
        .filter(b => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + b.total_price, 0);

    return (
        <div className="w-full bg-[#F8FAFF] min-h-screen pb-24 md:pb-0">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <HostSidebar user={user} currentPage="overview" />

                    <div className="flex-1">
                        {/* Header Section */}
                        <header className="mb-10 flex flex-wrap justify-between items-end gap-4">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-slate-900 text-4xl font-black tracking-tight">Host Overview</h1>
                                <p className="text-slate-500 text-lg font-medium">Manage your spaces, bookings, and performance data</p>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    href="/host/spaces/new"
                                    className="flex items-center gap-2 rounded-2xl bg-brand-gradient px-6 py-3.5 text-sm font-black text-white hover:brightness-110 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined font-black">add_circle</span>
                                    Add New Space
                                </Link>
                            </div>
                        </header>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-rose-500/5 group-hover:scale-125 transition-transform duration-700"></div>
                                <div className="flex flex-col gap-4 relative z-10">
                                    <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                        <span className="material-symbols-outlined font-black filled-icon">pending_actions</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-rose-500">Pending Requests</p>
                                        <h3 className="text-3xl font-black text-slate-900 mt-1">{pendingRequests.length}</h3>
                                    </div>
                                    <p className="text-xs font-bold text-rose-400 bg-rose-50 px-2.5 py-1 rounded-full w-fit border border-rose-100">Action Required</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-emerald-500/5 group-hover:scale-125 transition-transform duration-700"></div>
                                <div className="flex flex-col gap-4 relative z-10">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <span className="material-symbols-outlined font-black filled-icon">corporate_fare</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Active Listings</p>
                                        <h3 className="text-3xl font-black text-slate-900 mt-1">{mySpaces.length}</h3>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 flex items-center gap-1 bg-slate-50 w-fit px-2.5 py-1 rounded-full border border-slate-100">
                                        <span className="material-symbols-outlined text-[14px]">location_on</span> Live and Booking
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Main Content: Pending Requests & Upcoming */}
                            <div className="flex-1 space-y-8">
                                <section>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Booking Requests</h2>
                                        <Link href="/host/bookings" className="text-[#2F2BFF] text-sm font-black hover:underline">View all</Link>
                                    </div>

                                    {pendingRequests.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {pendingRequests.map((b) => {
                                                const space = mySpaces.find(s => s.id === b.space_id);
                                                return (
                                                    <div key={b.id} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col sm:flex-row items-center gap-6">
                                                        <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-inner border border-slate-100 bg-slate-50 shrink-0">
                                                            <img src={getGuestAvatar(b)} alt="Guest" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 text-center sm:text-left">
                                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                                                <h4 className="font-black text-slate-900 leading-tight">{getGuestName(b)} · {b.spaces?.title}</h4>
                                                                <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-100">New</span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-slate-500">
                                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">calendar_today</span> {new Date(b.start_time).toLocaleDateString()}</span>
                                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                <span className="font-black text-[#2F2BFF] text-sm">₹{b.total_price.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 shrink-0">
                                                            <button 
                                                                onClick={() => handleStatusUpdate(b.id, 'confirmed')}
                                                                className="h-10 px-6 rounded-xl bg-brand-gradient text-white text-xs font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                                                                className="h-10 px-6 rounded-xl bg-slate-50 text-slate-400 text-xs font-black border border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all"
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-[32px] p-12 border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-3">
                                            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                <span className="material-symbols-outlined text-3xl font-thin">notifications_off</span>
                                            </div>
                                            <div>
                                                <p className="text-slate-900 font-black">No pending requests</p>
                                                <p className="text-slate-400 text-sm font-medium">Sit back and relax while we grow your business.</p>
                                            </div>
                                        </div>
                                    )}
                                </section>

                                <section>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Bookings</h2>
                                        <Link href="/host/bookings" className="text-[#2F2BFF] text-sm font-black hover:underline">Go to Bookings</Link>
                                    </div>
                                    <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left border-collapse">
                                                <thead className="bg-slate-50/50">
                                                    <tr>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Guest</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Space</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Schedule</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Revenue</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {activeBookings.length > 0 ? (
                                                        activeBookings.map(b => (
                                                            <tr key={b.id} className="hover:bg-slate-50/30 transition-colors">
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-3">
                                                                        <img src={getGuestAvatar(b)} alt="G" className="w-8 h-8 rounded-full border border-slate-100 shadow-sm" />
                                                                        <span className="font-black text-slate-900">{getGuestName(b)}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <span className="font-bold text-slate-600">{b.spaces?.title}</span>
                                                                </td>
                                                                <td className="px-8 py-5 text-slate-500 font-bold">
                                                                    {new Date(b.start_time).toLocaleDateString()} · <span className="text-xs italic">{new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </td>
                                                                <td className="px-8 py-5 text-right font-black text-slate-900">₹{b.total_price.toLocaleString()}</td>
                                                                <td className="px-8 py-5 text-right">
                                                                    <button 
                                                                        onClick={() => handleStatusUpdate(b.id, 'completed')}
                                                                        className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF] hover:bg-[#2F2BFF]/5 px-3 py-1.5 rounded-lg transition-all"
                                                                    >
                                                                        Complete
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-medium italic">No active reservations yet.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Completed Bookings</h2>
                                    </div>
                                    <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm opacity-80">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left border-collapse">
                                                <thead className="bg-slate-50/50">
                                                    <tr>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Guest</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Space</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Ended On</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Earnings</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {completedBookings.length > 0 ? (
                                                        completedBookings.map(b => (
                                                            <tr key={b.id} className="grayscale hover:grayscale-0 transition-all duration-500">
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-3">
                                                                        <img src={getGuestAvatar(b)} alt="G" className="w-8 h-8 rounded-full border border-slate-100 shadow-sm" />
                                                                        <span className="font-black text-slate-900">{getGuestName(b)}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <span className="font-bold text-slate-600">{b.spaces?.title}</span>
                                                                </td>
                                                                <td className="px-8 py-5 text-slate-400 font-bold">
                                                                    {new Date(b.end_time).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-8 py-5 text-right font-black text-emerald-600">₹{b.total_price.toLocaleString()}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="px-8 py-10 text-center text-slate-300 font-medium italic">Your history will appear here once bookings are completed.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Sidebar: My Listings */}
                            <div className="w-full lg:w-80 space-y-6">
                                <section>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Listings</h2>
                                        <Link href="/host/spaces" className="text-[#2F2BFF] text-[10px] font-black uppercase tracking-widest">Edit all</Link>
                                    </div>
                                    {mySpaces.length > 0 ? (
                                        <div className="space-y-4">
                                            {mySpaces.map(s => (
                                                <div key={s.id} className="bg-white rounded-[24px] p-3 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex items-center gap-4">
                                                    <div className="h-20 w-20 rounded-2xl overflow-hidden shrink-0 shadow-inner bg-slate-100 border border-slate-100">
                                                        {(() => {
                                                            const typeFallbacks: { [key: string]: string } = {
                                                                villa: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                                                                studio: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
                                                                cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
                                                                rooftop: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88",
                                                                default: "https://images.unsplash.com/photo-1497366216548-37526070297c"
                                                            };
                                                            const fallback = (typeFallbacks[s.type.toLowerCase()] || typeFallbacks.default) + "?q=80&w=200&auto=format&fit=crop";
                                                            const displayImg = (s.images && s.images.length > 0 && !s.images[0].startsWith('blob:')) 
                                                                ? s.images[0] 
                                                                : fallback;
                                                            return (
                                                                <img 
                                                                    src={displayImg} 
                                                                    alt={s.title} 
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                                                    onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                                                                />
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="flex-1 py-1 pr-2">
                                                        <h4 className="font-black text-sm text-slate-900 line-clamp-1 mb-1">{s.title}</h4>
                                                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">location_on</span> {s.location}</p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <p className="text-xs font-black text-[#2F2BFF]">₹{s.price_per_hour}/hr</p>
                                                            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-[24px] border-2 border-dashed border-slate-200 p-8 text-center flex flex-col items-center gap-4">
                                            <span className="material-symbols-outlined text-4xl text-slate-200 font-thin">corporate_fare</span>
                                            <p className="text-xs font-black text-slate-400 leading-tight">You haven't listed any spaces yet.</p>
                                            <Link href="/host/spaces/new" className="bg-brand-gradient text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-blue-500/10 active:scale-95 transition-all">Create Listing</Link>
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
