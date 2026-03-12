"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HostSidebar from "@/components/host/HostSidebar";
import bookingsData from "@/data/bookings.json";
import spacesData from "@/data/spaces.json";

export default function HostEarnings() {
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

    // Filter logic
    const mySpaces = spacesData.filter(s => s.host_id === user.id);
    const mySpaceIds = mySpaces.map(s => s.id);
    const myConfirmedBookings = bookingsData.filter(b => mySpaceIds.includes(b.space_id) && (b.status === "confirmed" || b.status === "completed"));

    const totalEarnings = myConfirmedBookings.reduce((sum, b) => sum + b.total_price, 0);
    const pendingPayout = myConfirmedBookings.filter(b => b.status === "confirmed").reduce((sum, b) => sum + b.total_price, 0);

    // Mock monthly data
    const monthlyData = [
        { month: "Jan", amount: 1200 },
        { month: "Feb", amount: 1900 },
        { month: "Mar", amount: totalEarnings },
    ];

    return (
        <div className="w-full bg-[#f8f6f6] min-h-screen">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <HostSidebar user={user} currentPage="earnings" />

                    <div className="flex-1">
                        {/* Header Section */}
                        <header className="mb-10 flex flex-wrap justify-between items-end gap-4">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-slate-900 text-4xl font-black tracking-tight">Earnings & Finance</h1>
                                <p className="text-slate-500 text-lg font-medium">Track your revenue, payouts, and financial performance over time.</p>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 rounded-2xl bg-[#1d1aff] px-8 py-4 text-sm font-black text-white hover:brightness-110 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                                    <span className="material-symbols-outlined font-black">account_balance_wallet</span>
                                    Withdraw Funds
                                </button>
                            </div>
                        </header>

                        {/* Top Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-[#1d1aff]/5 group-hover:scale-125 transition-transform duration-700"></div>
                                <div className="flex flex-col gap-4 relative z-10">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1d1aff]">Available for Payout</h4>
                                    <h3 className="text-4xl font-black text-slate-900 leading-none">${(totalEarnings - pendingPayout).toLocaleString()}</h3>
                                    <p className="text-xs font-bold text-slate-400">Next payout scheduled for Monday</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group text-white bg-slate-900">
                                <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-700"></div>
                                <div className="flex flex-col gap-4 relative z-10">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Lifetime Revenue</h4>
                                    <h3 className="text-4xl font-black leading-none">${(totalEarnings + 5400).toLocaleString()}</h3>
                                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">trending_up</span> +22% from last year
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-emerald-500/5 group-hover:scale-125 transition-transform duration-700"></div>
                                <div className="flex flex-col gap-4 relative z-10">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Pending Clear</h4>
                                    <h3 className="text-4xl font-black text-slate-900 leading-none">${pendingPayout.toLocaleString()}</h3>
                                    <p className="text-xs font-bold text-slate-400">Currently in escrow for active stays</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions & Chart Area */}
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 space-y-8">
                                <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-10">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Revenue History</h2>
                                        <div className="flex gap-2">
                                            <button className="px-4 py-1.5 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">Month</button>
                                            <button className="px-4 py-1.5 rounded-full bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">Year</button>
                                        </div>
                                    </div>

                                    <div className="h-64 flex items-end justify-between gap-4 px-4 mb-6">
                                        {[40, 65, 45, 90, 55, 100, 75, 60, 85, 40, 70, 95].map((h, i) => (
                                            <div key={i} className="flex-1 group relative">
                                                <div
                                                    className="w-full bg-[#1d1aff]/10 group-hover:bg-[#1d1aff] rounded-t-lg transition-all duration-300"
                                                    style={{ height: `${h}%` }}
                                                ></div>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    ${h * 20}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                                        <span>Jan</span>
                                        <span>Feb</span>
                                        <span>Mar</span>
                                        <span>Apr</span>
                                        <span>May</span>
                                        <span>Jun</span>
                                        <span>Jul</span>
                                        <span>Aug</span>
                                        <span>Sep</span>
                                        <span>Oct</span>
                                        <span>Nov</span>
                                        <span>Dec</span>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Transactions</h2>
                                        <button className="text-[#1d1aff] text-[10px] font-black uppercase tracking-widest hover:underline">Download all</button>
                                    </div>
                                    <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50/50 border-b border-slate-50">
                                                    <tr>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {[
                                                        { id: "TX-48291", date: "Mar 22, 2024", desc: "Payout to Bank Account • • • 4821", amount: -2450.00, status: "completed" },
                                                        { id: "TX-48288", date: "Mar 20, 2024", desc: "Booking Payment (Zen Garden Studio)", amount: 120.00, status: "completed" },
                                                        { id: "TX-48282", date: "Mar 18, 2024", desc: "Booking Payment (Modern Rooftop Lounge)", amount: 250.00, status: "completed" },
                                                        { id: "TX-48275", date: "Mar 15, 2024", desc: "Payout to Bank Account • • • 4821", amount: -1500.00, status: "completed" },
                                                    ].map((t) => (
                                                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-8 py-5 text-sm font-bold text-slate-900">{t.id}</td>
                                                            <td className="px-8 py-5 text-sm font-medium text-slate-500">{t.date}</td>
                                                            <td className="px-8 py-5 text-sm font-bold text-slate-700">{t.desc}</td>
                                                            <td className={`px-8 py-5 text-sm font-black text-right ${t.amount < 0 ? "text-slate-900" : "text-emerald-500"}`}>
                                                                {t.amount < 0 ? `-$${Math.abs(t.amount).toLocaleString()}` : `+$${t.amount.toLocaleString()}`}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <aside className="w-full lg:w-80 space-y-6">
                                <div className="bg-[#1d1aff] rounded-[40px] p-8 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                                    <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                                    <h4 className="text-xl font-black mb-2 relative z-10">Isshō Pro Host</h4>
                                    <p className="text-sm font-medium opacity-80 mb-8 relative z-10">Unlock premium withdrawal rates and detailed tax reporting.</p>
                                    <button className="w-full py-4 rounded-2xl bg-white text-[#1d1aff] text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all relative z-10">Upgrade Now</button>
                                </div>

                                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                                    <h4 className="text-base font-black text-slate-900 mb-6">Payout Methods</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-slate-100">
                                                    <span className="material-symbols-outlined text-[#1d1aff] font-black">account_balance</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">Bank ·•• 4821</p>
                                                    <p className="text-[10px] font-bold text-slate-400 capitalize">Primary</p>
                                                </div>
                                            </div>
                                            <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                        </div>
                                        <button className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">+ Add Account</button>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-sm overflow-hidden relative group">
                                    <div className="absolute right-0 top-0 h-24 w-24 bg-rose-500/20 rounded-bl-full transform translate-x-1/2 -translate-y-1/2"></div>
                                    <h4 className="text-base font-black mb-4">Tax Center</h4>
                                    <p className="text-xs opacity-60 font-medium mb-6">Download your 2023 1099-K documents and tax summaries.</p>
                                    <button className="w-full py-4 rounded-2xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Go to Tax Center</button>
                                </div>
                            </aside>
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
