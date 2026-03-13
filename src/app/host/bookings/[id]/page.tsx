"use client";

import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import HostSidebar from "@/components/host/HostSidebar";
import Link from "next/link";

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
    date: string;
    spaces: Space;
    profiles: Profile;
}

export default function HostBookingDetails() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "host" && user.role !== "admin") {
            router.push("/guest/dashboard");
        }
    }, [user, router]);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!user || !params.id) return;
            setLoading(true);
            const { data, error } = await supabase
                .from("bookings")
                .select(`
                    *,
                    spaces!inner (*),
                    profiles:user_id (*)
                `)
                .eq("id", params.id)
                .eq("spaces.host_id", user.id)
                .single();

            if (!error && data) {
                setBooking(data as any);
            }
            setLoading(false);
        };

        fetchBooking();
    }, [user, params.id]);

    const updateStatus = async (newStatus: string) => {
        if (!booking) return;
        const { error } = await supabase
            .from("bookings")
            .update({ status: newStatus })
            .eq("id", booking.id);
        
        if (!error) {
            setBooking({ ...booking, status: newStatus });
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d1aff]"></div>
        </div>
    );

    if (!booking) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
                <h1 className="text-2xl font-black text-slate-900">Booking not found</h1>
                <Link href="/host/bookings" className="text-[#1d1aff] font-black hover:underline">Back to bookings</Link>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "confirmed": return "bg-emerald-50 text-emerald-500 shadow-emerald-500/10";
            case "pending": return "bg-rose-50 text-rose-500 shadow-rose-500/10";
            default: return "bg-slate-50 text-slate-400";
        }
    };

    return (
        <div className="w-full bg-[#f8f6f6] min-h-screen">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <HostSidebar user={user!} currentPage="bookings" />

                    <div className="flex-1 space-y-8">
                        {/* Header Navigation */}
                        <div className="flex items-center justify-between">
                            <Link href="/host/bookings" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors">
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back to Bookings
                            </Link>
                            <div className="flex gap-3">
                                <button className="h-11 px-6 rounded-2xl bg-white border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 active:scale-95 transition-all">Support</button>
                                <button className="h-11 px-6 rounded-2xl bg-slate-900 border border-slate-900 text-sm font-black text-white hover:bg-slate-800 active:scale-95 transition-all">Download Receipt</button>
                            </div>
                        </div>

                        {/* Top Snapshot Section */}
                        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-10 items-center">
                            <div className="h-48 w-72 rounded-[32px] overflow-hidden shadow-2xl shrink-0 group">
                                <img src={booking.spaces.images[0] || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"} alt="Space" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            </div>
                            <div className="flex-1 text-center lg:text-left">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                                    <h1 className="text-3xl font-black text-slate-900 leading-tight">{booking.spaces.title}</h1>
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest self-center lg:self-auto border ${getStatusStyle(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <p className="text-slate-500 font-bold text-lg mb-6 flex items-center justify-center lg:justify-start gap-2">
                                    <span className="material-symbols-outlined text-rose-500">location_on</span>
                                    {booking.spaces.location}
                                </p>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                    <div className="px-6 py-4 bg-slate-50 rounded-[20px] border border-slate-100 min-w-[140px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check In</p>
                                        <p className="font-black text-slate-900">{new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                                        <p className="text-xs font-bold text-slate-500">{booking.start_time}</p>
                                    </div>
                                    <div className="px-6 py-4 bg-slate-50 rounded-[20px] border border-slate-100 min-w-[140px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check Out</p>
                                        <p className="font-black text-slate-900">{new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                                        <p className="text-xs font-bold text-slate-500">{booking.end_time}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Guest Details */}
                            <div className="lg:col-span-2 space-y-8">
                                <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Guest Personal Details</h2>
                                    <div className="flex items-center gap-8 mb-10 pb-10 border-b border-slate-50">
                                        <div className="h-24 w-24 rounded-[32px] overflow-hidden shadow-inner border border-slate-100 shrink-0">
                                            <img src={booking.profiles.avatar_url || `https://i.pravatar.cc/150?u=${booking.user_id}`} alt="Guest" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-1">{booking.profiles.full_name || "Guest User"}</h3>
                                            <p className="text-slate-500 font-bold flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-[#1d1aff]/5 text-[#1d1aff] text-[10px] font-black uppercase tracking-widest rounded-md">Verified Account</span>
                                                <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                                Member since 2024
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                                                    <span className="material-symbols-outlined text-slate-400">mail</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                                    <p className="font-bold text-slate-900">guest@example.com</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                                                    <span className="material-symbols-outlined text-slate-400">call</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                                                    <p className="font-bold text-slate-900">+91 98XXX XXXXX</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                                                    <span className="material-symbols-outlined text-slate-400">history</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guest History</p>
                                                    <p className="font-bold text-slate-900">12 successfully completed stays</p>
                                                </div>
                                            </div>
                                            <button className="h-11 w-full rounded-2xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-600 hover:bg-[#1d1aff]/5 hover:text-[#1d1aff] hover:border-[#1d1aff]/10 transition-all">Send Message to Guest</button>
                                        </div>
                                    </div>
                                </section>

                                {booking.status === "pending" && (
                                    <section className="bg-rose-50/50 rounded-[40px] p-10 border border-rose-100 shadow-sm flex flex-col items-center text-center gap-6">
                                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center border border-rose-100 shadow-sm text-rose-500">
                                            <span className="material-symbols-outlined text-3xl">notifications_active</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2">Review Reservation Request</h3>
                                            <p className="text-slate-500 font-medium max-w-md">This booking is currently pending your approval. Guests appreciate quick responses.</p>
                                        </div>
                                        <div className="flex gap-4 w-full max-w-sm">
                                            <button onClick={() => updateStatus("confirmed")} className="flex-1 h-14 rounded-[20px] bg-[#1d1aff] text-white font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Approve Booking</button>
                                            <button onClick={() => updateStatus("cancelled")} className="flex-1 h-14 rounded-[20px] bg-white border border-slate-200 text-rose-500 font-black hover:bg-rose-50 active:scale-95 transition-all">Decline</button>
                                        </div>
                                    </section>
                                )}
                            </div>

                            {/* Payment Summary Box */}
                            <div className="space-y-6">
                                <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                                    <h4 className="text-lg font-black mb-8 relative z-10">Financial Overview</h4>
                                    
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex justify-between items-center text-slate-400">
                                            <span className="text-xs font-bold">Space Rate</span>
                                            <span className="font-bold text-white">₹{(booking.total_price * 0.9).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-400">
                                            <span className="text-xs font-bold">Host Service Fee (10%)</span>
                                            <span className="font-bold text-white">₹{(booking.total_price * 0.1).toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-white/10 w-full my-4"></div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#1d1aff]">Net Payout</span>
                                                <span className="text-3xl font-black leading-none text-white">₹{booking.total_price.toLocaleString()}</span>
                                            </div>
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Secured</span>
                                        </div>
                                    </div>

                                    <div className="mt-10 p-5 bg-white/5 rounded-[24px] border border-white/5 relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="material-symbols-outlined text-emerald-400 text-lg">verified_user</span>
                                            <p className="text-xs font-black">Guaranteed Payment</p>
                                        </div>
                                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed">Funds are held by Isshō and will be released 24 hours after check-in.</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                                    <h4 className="text-sm font-black text-slate-900 mb-6">Booking Details</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-xs py-1">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Booking ID</span>
                                            <span className="font-black text-slate-900 uppercase">#{booking.id.slice(0, 8)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Reference</span>
                                            <span className="font-black text-slate-900">ISS-{booking.id.slice(-4)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Cancellation</span>
                                            <span className="font-black text-rose-500">Moderate</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
