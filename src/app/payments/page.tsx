"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GuestSidebar from "@/components/guest/GuestSidebar";

export default function GuestPayments() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) router.push("/auth/login");
    }, [user, router]);

    if (!user) return null;

    const mockTransactions = [
        { id: "BK-9921", date: "Mar 20, 2024", space: "Modern Zen Studio", amount: 120.00, status: "Completed" },
        { id: "BK-9918", date: "Mar 15, 2024", space: "Traditional Ryokan Suite", amount: 180.00, status: "Completed" },
        { id: "BK-9905", date: "Feb 28, 2024", space: "Cyberpunk Neon Studio", amount: 95.00, status: "Completed" },
    ];

    return (
        <div className="w-full bg-[#F8FAFF] min-h-screen">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <GuestSidebar user={user} currentPage="payments" />

                    <div className="flex-1">
                        <header className="mb-10 flex flex-col gap-2">
                            <h1 className="text-slate-900 text-4xl font-black tracking-tight">Payments & Receipts</h1>
                            <p className="text-slate-500 text-lg font-medium">Manage your payment methods and review your transaction history.</p>
                        </header>

                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 space-y-8">
                                <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
                                    <div className="absolute -right-20 -top-20 h-64 w-64 bg-[#2F2BFF]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                                    <div className="flex justify-between items-center mb-8 relative z-10">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Methods</h2>
                                        <button className="text-[#2F2BFF] text-[10px] font-black uppercase tracking-widest hover:underline">+ Add New</button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group/card max-w-sm">
                                            <div className="absolute right-0 top-0 h-32 w-32 bg-white/10 rounded-bl-full transform translate-x-1/2 -translate-y-1/2"></div>
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="h-10 w-16 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                                                    <span className="material-symbols-outlined text-white text-3xl font-thin italic">credit_card</span>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md">Primary</span>
                                            </div>
                                            <p className="text-xl font-black mb-1">•••• •••• •••• 4821</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expires 12/26</p>
                                        </div>

                                        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-all cursor-pointer group/add max-w-sm">
                                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover/add:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-2xl">add</span>
                                            </div>
                                            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Add Payment Method</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
                                        <button className="text-[#2F2BFF] text-[10px] font-black uppercase tracking-widest hover:underline">View All</button>
                                    </div>
                                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50/50">
                                                    <tr>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Space</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {mockTransactions.map((tx) => (
                                                        <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                                                            <td className="px-8 py-5 font-black text-slate-900 text-sm">{tx.id}</td>
                                                            <td className="px-8 py-5 font-medium text-slate-500 text-sm">{tx.date}</td>
                                                            <td className="px-8 py-5 font-bold text-slate-700 text-sm">{tx.space}</td>
                                                            <td className="px-8 py-5 font-black text-slate-900 text-sm text-right">-${tx.amount.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <aside className="w-full lg:w-80 space-y-6">
                                <div className="bg-[#2F2BFF]/5 rounded-[40px] p-8 border border-[#2F2BFF]/10">
                                    <h4 className="text-lg font-black text-slate-900 mb-4">Refund Policy</h4>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6">Learn more about our flexible cancellation options and how we protect your bookings.</p>
                                    <button className="text-[#2F2BFF] text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2">Read Policy <span className="material-symbols-outlined text-xs">arrow_forward</span></button>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
