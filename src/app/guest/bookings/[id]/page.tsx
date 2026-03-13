"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GuestSidebar from "@/components/guest/GuestSidebar";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
    date: string;
    spaces: Space;
}

export default function BookingDetailsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "guest" && user.role !== "admin") {
            router.push("/host/dashboard");
        }
    }, [user, router]);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!user || !id) return;
            setLoading(true);
            const { data, error } = await supabase
                .from("bookings")
                .select(`
                    *,
                    spaces (
                        id,
                        title,
                        location,
                        images
                    )
                `)
                .eq("id", id)
                .single();

            if (!error && data) {
                setBooking(data as any);
            }
            setLoading(false);
        };

        fetchBooking();
    }, [user, id]);

    if (!user || loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-10 h-10 border-4 border-[#1d1aff]/20 border-t-[#1d1aff] rounded-full animate-spin" />
        </div>
    );

    if (!booking) {
         router.push("/guest/bookings");
         return null;
    }

    const space = booking.spaces;

    return (
        <div className="w-full bg-[#f8f6f6] min-h-screen">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <GuestSidebar user={user} currentPage="bookings" />

                    <div className="flex-1">
                        {/* Header */}
                        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div className="text-left">
                                <Link href="/guest/bookings" className="text-[#1d1aff] text-sm font-black mb-4 flex items-center gap-2 hover:underline">
                                    <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
                                    Back to Bookings
                                </Link>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Booking Details</h1>
                                <p className="text-slate-500 font-medium mt-1">Order #{booking.id}</p>
                            </div>
                            <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border 
                                ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                                {booking.status === 'confirmed' ? 'Confirmed Stay' : 'Awaiting Approval'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Space Card */}
                                <section className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-xl group">
                                    <div className="aspect-[21/9] overflow-hidden relative">
                                        <img src={space.images[0]} alt={space.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    </div>
                                    <div className="p-10">
                                        <div className="flex justify-between items-start gap-4 mb-6">
                                            <div className="text-left">
                                                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{space.title}</h2>
                                                <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[#1d1aff] text-lg font-bold">location_on</span>
                                                    {space.location}
                                                </p>
                                            </div>
                                            <Link href={`/spaces/${space.id}`} className="text-[#1d1aff] text-[10px] font-black uppercase tracking-widest hover:underline shrink-0 px-4 py-2 bg-blue-50 rounded-xl">View Page</Link>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-slate-50">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in</p>
                                                <p className="font-black text-slate-900">{new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                                                <p className="text-xs font-bold text-slate-500">{booking.start_time}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-out</p>
                                                <p className="font-black text-slate-900">{new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                                                <p className="text-xs font-bold text-slate-500">{booking.end_time}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guest</p>
                                                <p className="font-black text-slate-900">{user.name}</p>
                                                <p className="text-xs font-bold text-slate-500">Scheduled Visit</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                                                <p className="font-black text-slate-900 text-xl">₹{booking.total_price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* House Rules / Info */}
                                <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-900 mb-6">Important Information</h3>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                                    <span className="material-symbols-outlined">description</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 mb-1">Self Check-in</p>
                                                    <p className="text-xs font-medium text-slate-500">Check-in instructions will be available 24 hours before your stay.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                                    <span className="material-symbols-outlined">wifi</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 mb-1">WiFi Credentials</p>
                                                    <p className="text-xs font-medium text-slate-500">Access codes are provided upon arrival at the property.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                                    <span className="material-symbols-outlined">info</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 mb-1">Host Support</p>
                                                    <p className="text-xs font-medium text-slate-500">Your host is available via Ishhō Messages for any immediate needs.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Content */}
                            <aside className="space-y-8">
                                {/* Actions Card */}
                                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                    <h4 className="text-lg font-black text-slate-900 mb-6">Management Actions</h4>
                                    <div className="space-y-3">
                                        <Link href="/messages" className="w-full flex items-center justify-center gap-2 bg-[#1d1aff] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                                            <span className="material-symbols-outlined filled-icon text-lg">chat_bubble</span>
                                            Message Host
                                        </Link>
                                        <button className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-4 rounded-2xl font-black text-sm border border-slate-100 hover:bg-slate-100 active:scale-95 transition-all">
                                            <span className="material-symbols-outlined text-lg">map</span>
                                            Get Directions
                                        </button>
                                        <button className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-4 rounded-2xl font-black text-sm border border-slate-100 hover:bg-slate-100 active:scale-95 transition-all">
                                            <span className="material-symbols-outlined text-lg">download</span>
                                            Download Receipt
                                        </button>
                                        <div className="pt-4 mt-4 border-t border-slate-50">
                                            <button className="w-full text-rose-500 font-black text-[10px] uppercase tracking-widest hover:underline">Cancel Booking</button>
                                            <p className="text-[10px] font-bold text-slate-400 text-center mt-2 px-6">Free cancellation until 48 hours before stay.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Support Card */}
                                <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 h-24 w-24 bg-white/5 rounded-bl-full group-hover:scale-150 transition-transform duration-1000"></div>
                                    <h4 className="text-lg font-black mb-2 relative z-10">Need Help?</h4>
                                    <p className="text-xs font-medium text-slate-400 mb-6 relative z-10">Our 24/7 support team is here to help with any stay issues.</p>
                                    <Link href="/help" className="flex items-center gap-2 text-[#1d1aff] text-[10px] font-black uppercase tracking-widest hover:underline relative z-10">
                                        Contact Support <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
                                    </Link>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
