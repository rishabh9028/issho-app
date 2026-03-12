"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import bookingsData from "@/data/bookings.json";
import spacesData from "@/data/spaces.json";
import Link from "next/link";
import HostSidebar from "@/components/host/HostSidebar";

export default function HostDashboard() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "host" && user.role !== "admin") {
            router.push("/guest/dashboard");
        }
    }, [user, router]);

    if (!user) return null;

    // Mock fetching host data
    const mySpaces = spacesData.filter(s => s.host_id === user.id);
    const mySpaceIds = mySpaces.map(s => s.id);
    const allIncomingBookings = bookingsData.filter(b => mySpaceIds.includes(b.space_id));

    const pendingRequests = allIncomingBookings.filter(b => b.status === "pending");
    const upcomingBookings = allIncomingBookings.filter(b => b.status === "confirmed");

    // Calculate mock stats
    const totalEarnings = allIncomingBookings.filter(b => b.status === "confirmed" || b.status === "completed").reduce((sum, b) => sum + b.total_price, 0);

    return (
        <div className="w-full bg-[#f8f6f6] min-h-screen">
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
                                    className="flex items-center gap-2 rounded-2xl bg-[#1d1aff] px-6 py-3.5 text-sm font-black text-white hover:brightness-110 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined font-black">add_circle</span>
                                    Add New Space
                                </Link>
                            </div>
                        </header>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-[#1d1aff]/5 group-hover:scale-125 transition-transform duration-700"></div>
                                <div className="flex flex-col gap-4 relative z-10">
                                    <div className="h-12 w-12 rounded-2xl bg-[#1d1aff]/10 flex items-center justify-center text-[#1d1aff]">
                                        <span className="material-symbols-outlined font-black filled-icon">payments</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-[#1d1aff]">Total Earnings</p>
                                        <h3 className="text-3xl font-black text-slate-900 mt-1">${totalEarnings.toLocaleString()}</h3>
                                    </div>
                                    <p className="text-xs font-bold text-green-500 flex items-center gap-1 bg-green-50 w-fit px-2 py-1 rounded-full border border-green-100">
                                        <span className="material-symbols-outlined text-[14px]">trending_up</span> +14% this month
                                    </p>
                                </div>
                            </div>

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
                                        <Link href="/host/bookings" className="text-[#1d1aff] text-sm font-black hover:underline">View all</Link>
                                    </div>

                                    {pendingRequests.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {pendingRequests.map((b) => {
                                                const space = mySpaces.find(s => s.id === b.space_id);
                                                return (
                                                    <div key={b.id} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col sm:flex-row items-center gap-6">
                                                        <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-inner border border-slate-100 bg-slate-50 shrink-0">
                                                            <img src={`https://i.pravatar.cc/150?u=${b.user_id}`} alt="Guest" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 text-center sm:text-left">
                                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                                                <h4 className="font-black text-slate-900 leading-tight">Guest Request · {space?.title}</h4>
                                                                <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-100">New</span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-slate-500">
                                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">calendar_today</span> {new Date(b.date).toLocaleDateString()}</span>
                                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {b.start_time}-{b.end_time}</span>
                                                                <span className="font-black text-[#1d1aff] text-sm">${b.total_price}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 shrink-0">
                                                            <button className="h-10 px-6 rounded-xl bg-[#1d1aff] text-white text-xs font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Approve</button>
                                                            <button className="h-10 px-6 rounded-xl bg-slate-50 text-slate-400 text-xs font-black border border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all">Decline</button>
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
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Reservations</h2>
                                        <Link href="/host/bookings" className="text-[#1d1aff] text-sm font-black hover:underline">Go to Bookings</Link>
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
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {upcomingBookings.length > 0 ? (
                                                        upcomingBookings.map(b => (
                                                            <tr key={b.id} className="hover:bg-slate-50/30 transition-colors">
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-3">
                                                                        <img src={`https://i.pravatar.cc/150?u=${b.user_id}`} alt="G" className="w-8 h-8 rounded-full border border-slate-100 shadow-sm" />
                                                                        <span className="font-black text-slate-900">Guest User</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5">
                                                                    <span className="font-bold text-slate-600">{mySpaces.find(s => s.id === b.space_id)?.title}</span>
                                                                </td>
                                                                <td className="px-8 py-5 text-slate-500 font-bold">
                                                                    {new Date(b.date).toLocaleDateString()} · <span className="text-xs italic">{b.start_time}</span>
                                                                </td>
                                                                <td className="px-8 py-5 text-right font-black text-slate-900">${b.total_price}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-medium italic">No upcoming reservations yet.</td>
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
                                        <Link href="/host/spaces" className="text-[#1d1aff] text-[10px] font-black uppercase tracking-widest">Edit all</Link>
                                    </div>
                                    {mySpaces.length > 0 ? (
                                        <div className="space-y-4">
                                            {mySpaces.map(s => (
                                                <div key={s.id} className="bg-white rounded-[24px] p-3 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex items-center gap-4">
                                                    <div className="h-20 w-20 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                                                        <img src={s.images[0]} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                    </div>
                                                    <div className="flex-1 py-1 pr-2">
                                                        <h4 className="font-black text-sm text-slate-900 line-clamp-1 mb-1">{s.title}</h4>
                                                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">location_on</span> {s.location}</p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <p className="text-xs font-black text-[#1d1aff]">${s.price_per_hour}/hr</p>
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
                                            <Link href="/host/spaces/new" className="bg-[#1d1aff] text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-blue-500/10 active:scale-95 transition-all">Create Listing</Link>
                                        </div>
                                    )}
                                </section>

                                {/* Performance Prompt */}
                                <div className="rounded-[32px] bg-white border border-slate-100 p-8 shadow-sm relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 h-32 w-32 bg-[#1d1aff]/5 rounded-bl-full transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                                    <h4 className="text-lg font-black text-slate-900 leading-tight mb-3">Maximize Your Bookings</h4>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6">Hosts who respond within 1 hour get up to 3x more bookings. Enable push notifications to stay on top.</p>
                                    <button className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-black hover:bg-[#1d1aff] shadow-xl shadow-slate-900/10 transition-all active:scale-95 relative z-10">Enable Notifications</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
