"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import GuestSidebar from "@/components/guest/GuestSidebar";

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
    start_time: string;
    end_time: string;
    status: "pending" | "confirmed" | "cancelled";
    total_price: number;
    spaces?: Space;
}

export default function GuestDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [dataLoading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return; // wait for auth to resolve before redirecting
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "guest" && user.role !== "admin") {
            router.push("/host/dashboard");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;
        
        const fetchBookings = async () => {
            const { data, error } = await supabase
                .from("bookings")
                .select(`
                    *,
                    spaces:space_id (
                        id, title, location, images, type
                    )
                `)
                .eq("user_id", user.id)
                .order("start_time", { ascending: false });

            if (!error && data) setBookings(data as Booking[]);
            setLoading(false);
        };

        fetchBookings();

        // Real-time subscription
        const channel = supabase
            .channel(`public:bookings:user_id=eq.${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `user_id=eq.${user.id}`
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

    if (!user) return null;

    const now = new Date();
    const upcoming = bookings.filter(
        (b) => new Date(b.end_time) >= now && b.status !== "cancelled"
    );
    const past = bookings.filter(
        (b) => new Date(b.end_time) < now && b.status !== "cancelled"
    );

    // Stats
    const totalSpent = past
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + b.total_price, 0);
    const totalHours = past
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => {
            const hours = (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / (1000 * 60 * 60);
            return sum + hours;
        }, 0);

    const statusColors: Record<string, string> = {
        confirmed: "bg-green-500",
        pending: "bg-brand-gradient",
        cancelled: "bg-red-400",
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    const formatTime = (d: string) =>
        new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="w-full bg-[#F8FAFF] min-h-screen py-8 pb-24 md:pb-8">
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <GuestSidebar user={user} currentPage="dashboard" />

                    {/* Dashboard Content */}
                    <div className="flex-1 space-y-8">
                        {/* Welcome Header */}
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                                    Welcome back, {(user.name || "Guest").split(" ")[0]}
                                </h1>
                                <p className="text-slate-500">
                                    {upcoming.length > 0
                                        ? `You have ${upcoming.length} upcoming booking${upcoming.length > 1 ? "s" : ""}.`
                                        : "No upcoming bookings. Find your next space!"}
                                </p>
                            </div>
                            <Link
                                href="/"
                                className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#2F2BFF]/20 hover:scale-[1.02] transition-transform"
                            >
                                <span className="material-symbols-outlined text-lg text-white">add</span>
                                Book New Space
                            </Link>
                        </div>

                        {/* Upcoming Bookings */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold">Upcoming Bookings</h2>
                                <Link className="text-sm font-semibold text-[#2F2BFF] hover:underline" href="/guest/bookings">
                                    View all
                                </Link>
                            </div>

                            {dataLoading ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="h-56 rounded-2xl bg-white animate-pulse border border-slate-100" />
                                    ))}
                                </div>
                            ) : upcoming.length === 0 ? (
                                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
                                    <p className="mt-3 font-black text-slate-400">No upcoming bookings</p>
                                    <p className="text-sm text-slate-400">When you book a space, it'll appear here.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {upcoming.map((b) => (
                                        <div key={b.id} className="group overflow-hidden rounded-2xl border border-[#2F2BFF]/5 bg-white shadow-sm">
                                            <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                                                {(() => {
                                                    const typeFallbacks: { [key: string]: string } = {
                                                        villa: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                                                        studio: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
                                                        cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
                                                        rooftop: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88",
                                                        default: "https://images.unsplash.com/photo-1497366216548-37526070297c"
                                                    };
                                                    const fallback = (typeFallbacks[b.spaces?.type?.toLowerCase() || ''] || typeFallbacks.default) + "?q=80&w=400&auto=format&fit=crop";
                                                    const displayImg = (b.spaces?.images && b.spaces.images.length > 0 && !b.spaces.images[0].startsWith('blob:')) 
                                                        ? b.spaces.images[0] 
                                                        : fallback;
                                                    return (
                                                        <img
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            alt={b.spaces?.title || "Space"}
                                                            src={displayImg}
                                                            onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                                                        />
                                                    );
                                                })()}
                                                <div className={`absolute right-3 top-3 rounded-full ${statusColors[b.status] || "bg-slate-400"} px-3 py-1 text-[10px] font-bold text-white uppercase`}>
                                                    {b.status}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-bold">{b.spaces?.title || "Space"}</h3>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                                            {b.spaces?.location || "—"}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-[#2F2BFF]">
                                                            {formatDate(b.start_time)}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {formatTime(b.start_time)} – {formatTime(b.end_time)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                                                    <span className="text-sm font-black text-slate-900">₹{b.total_price.toLocaleString()}</span>
                                                    <Link
                                                        href={`/guest/bookings/${b.id}`}
                                                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-brand-gradient hover:text-white transition-colors"
                                                    >
                                                        Manage
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Past Bookings */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold">Past Bookings</h2>
                            </div>

                            {dataLoading ? (
                                <div className="space-y-3">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="h-20 rounded-2xl bg-white animate-pulse border border-slate-100" />
                                    ))}
                                </div>
                            ) : past.length === 0 ? (
                                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300">history</span>
                                    <p className="mt-3 font-black text-slate-400">No past bookings yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {past.slice(0, 5).map((b) => (
                                        <div key={b.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-100 flex-shrink-0">
                                                    {(() => {
                                                        const typeFallbacks: { [key: string]: string } = {
                                                            villa: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                                                            studio: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
                                                            cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
                                                            rooftop: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88",
                                                            default: "https://images.unsplash.com/photo-1497366216548-37526070297c"
                                                        };
                                                        const fallback = (typeFallbacks[b.spaces?.type?.toLowerCase() || ''] || typeFallbacks.default) + "?q=80&w=200&auto=format&fit=crop";
                                                        const displayImg = (b.spaces?.images && b.spaces.images.length > 0 && !b.spaces.images[0].startsWith('blob:')) 
                                                            ? b.spaces.images[0] 
                                                            : fallback;
                                                        return (
                                                            <img 
                                                                className="h-full w-full object-cover" 
                                                                alt={b.spaces?.title || "Space"} 
                                                                src={displayImg} 
                                                                onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold">{b.spaces?.title || "Space"}</h4>
                                                    <p className="text-xs text-slate-500">
                                                        {formatDate(b.start_time)} – {formatDate(b.end_time)} • {b.spaces?.location}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-sm text-slate-900 hidden sm:block">₹{b.total_price.toLocaleString()}</span>
                                                <Link
                                                    href={`/guest/bookings/${b.id}`}
                                                    className="rounded-lg border border-[#2F2BFF]/20 px-4 py-2 text-xs font-bold text-[#2F2BFF] hover:bg-[#2F2BFF]/5"
                                                >
                                                    View Receipt
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Stats */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100/50">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Spent</p>
                                <h3 className="text-2xl font-black mt-1">₹{totalSpent.toLocaleString()}</h3>
                                <div className="mt-2 flex items-center text-[10px] font-bold text-slate-400">
                                    <span className="material-symbols-outlined text-sm">payments</span>
                                    &nbsp;On confirmed bookings
                                </div>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100/50">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hours Booked</p>
                                <h3 className="text-2xl font-black mt-1">{Math.round(totalHours)}</h3>
                                <div className="mt-2 flex items-center text-[10px] font-bold text-slate-400">
                                    <span className="material-symbols-outlined text-sm">history</span>
                                    &nbsp;Lifetime total
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
