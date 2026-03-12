"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HostSidebar from "@/components/host/HostSidebar";

export default function HostSettings() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "host" && user.role !== "admin") {
            router.push("/guest/dashboard");
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="w-full bg-[#f8f6f6] min-h-screen">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <HostSidebar user={user} currentPage="settings" />

                    <div className="flex-1">
                        <header className="mb-10 flex flex-col gap-2">
                            <h1 className="text-slate-900 text-4xl font-black tracking-tight">Host Settings</h1>
                            <p className="text-slate-500 text-lg font-medium">Manage your personal information, security, and hosting preferences.</p>
                        </header>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Settings Tabs */}
                            <div className="w-full lg:w-64 shrink-0 space-y-2">
                                {[
                                    { id: "profile", label: "Public Profile", icon: "person" },
                                    { id: "security", label: "Security & Login", icon: "shield" },
                                    { id: "payouts", label: "Payout Methods", icon: "payments" },
                                    { id: "notifications", label: "Notifications", icon: "notifications" },
                                    { id: "privacy", label: "Privacy & Sharing", icon: "visibility_off" },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === tab.id ? "bg-[#1d1aff] text-white shadow-xl shadow-blue-500/20" : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                                    >
                                        <span className={`material-symbols-outlined text-lg ${activeTab === tab.id ? "filled-icon font-black" : "text-slate-400"}`}>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Settings Content Card */}
                            <div className="flex-1 bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                                {activeTab === "profile" && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 mb-2">Public Profile</h2>
                                            <p className="text-sm font-medium text-slate-400">This information will be shown to guests before they book.</p>
                                        </div>

                                        <div className="flex items-center gap-8 pb-10 border-b border-slate-50">
                                            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-[#1d1aff]/5 relative group">
                                                <img src={user.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Avatar" />
                                                <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                    <span className="material-symbols-outlined text-white text-2xl">edit</span>
                                                </button>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900">{user.name}</h3>
                                                <p className="text-sm font-bold text-slate-400 mb-4">Superhost since 2022</p>
                                                <button className="text-xs font-black text-[#1d1aff] hover:underline uppercase tracking-widest">Remove Photo</button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[#1d1aff] mb-3 block">Display Name</label>
                                                <input type="text" defaultValue={user.name} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 focus:outline-none focus:border-[#1d1aff] transition-all" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Professional Title</label>
                                                <input type="text" placeholder="e.g. Architect & Host" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 focus:outline-none focus:border-[#1d1aff] transition-all" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">About you</label>
                                                <textarea rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#1d1aff] transition-all resize-none" defaultValue={user.bio}></textarea>
                                                <p className="mt-3 text-[10px] font-bold text-slate-400 italic">Tell guests about your background, hobbies, or what makes your spaces unique.</p>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-50 flex justify-end gap-3">
                                            <button className="text-slate-400 font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-slate-50">Cancel</button>
                                            <button className="bg-[#1d1aff] text-white px-10 py-3.5 rounded-2xl font-black text-xs shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Save Profile</button>
                                        </div>
                                    </div>
                                )}

                                {activeTab !== "profile" && (
                                    <div className="h-96 flex flex-col items-center justify-center text-center opacity-40">
                                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-3xl font-thin">construction</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2 capitalize">{activeTab} coming soon</h3>
                                        <p className="max-w-xs text-sm font-medium text-slate-500">We're building a more premium experience for your host settings.</p>
                                    </div>
                                )}
                            </div>
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
