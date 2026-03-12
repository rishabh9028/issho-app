"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import GuestSidebar from "@/components/guest/GuestSidebar";
import HostSidebar from "@/components/host/HostSidebar";

export default function HelpCenter() {
    const { user } = useAuth();
    const isHost = user?.role === "host";

    return (
        <div className="w-full bg-[#f8f6f6] min-h-screen">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    {isHost ? (
                        <HostSidebar user={user} currentPage="help" />
                    ) : (
                        <GuestSidebar user={user} currentPage="help" />
                    )}

                    <div className="flex-1">
                        <header className="mb-10 text-center max-w-2xl mx-auto">
                            <h1 className="text-slate-900 text-5xl font-black tracking-tight mb-4">How can we help?</h1>
                            <p className="text-slate-500 text-lg font-medium">Search our knowledge base or get in touch with our specialist team.</p>
                            <div className="mt-8 relative">
                                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 text-2xl">search</span>
                                <input
                                    type="text"
                                    placeholder="Search for 'cancellation policy' or 'payouts'..."
                                    className="w-full h-16 bg-white border border-slate-100 rounded-[28px] pl-16 pr-8 text-sm font-bold shadow-xl shadow-slate-200/50 focus:outline-none focus:border-[#1d1aff] transition-all"
                                />
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                            {[
                                { title: "Getting Started", icon: "rocket_launch", count: 12 },
                                { title: "Account & Security", icon: "shield_person", count: 8 },
                                { title: "Payment & Payouts", icon: "payments", count: 15 },
                                { title: "Hosting Basics", icon: "cottage", count: 22 },
                                { title: "Guest Policies", icon: "assignment", count: 10 },
                                { title: "Troubleshooting", icon: "build", count: 6 },
                            ].map(cat => (
                                <button key={cat.title} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group text-red">
                                    <div className="h-14 w-14 rounded-2xl bg-[#1d1aff]/5 flex items-center justify-center mb-6 group-hover:bg-[#1d1aff] group-hover:text-white transition-all">
                                        <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">{cat.title}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cat.count} Articles</p>
                                </button>
                            ))}
                        </div>

                        <section className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent"></div>
                            <div className="relative z-10 max-w-xl">
                                <h2 className="text-3xl font-black mb-4">Still need assistance?</h2>
                                <p className="text-slate-400 font-medium mb-8">Out support specialists are available 24/7 to help you with any issues or questions about your Ishhō experience.</p>
                                <div className="flex flex-wrap gap-4">
                                    <button className="bg-[#1d1aff] text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl shadow-blue-500/20 hover:brightness-110 transition-all">Chat with Support</button>
                                    <button className="bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-xs border border-white/10 hover:bg-white/20 transition-all">Contact us by Phone</button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
