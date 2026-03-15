"use client";

import Link from "next/link";

interface HostSidebarProps {
    user: any;
    currentPage: "overview" | "spaces" | "bookings" | "calendar" | "earnings" | "settings";
}

export default function HostSidebar({ user, currentPage }: HostSidebarProps) {
    const menuItems = [
        { id: "overview", label: "Overview", icon: "dashboard", href: "/host/dashboard" },
        { id: "spaces", label: "My Spaces", icon: "corporate_fare", href: "/host/spaces" },
        { id: "bookings", label: "Bookings", icon: "calendar_today", href: "/host/bookings" },
        { id: "settings", label: "Settings", icon: "settings", href: "/host/settings" },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0">
                <div className="flex flex-col gap-6 sticky top-24">
                    <div className="rounded-[32px] border border-[#2F2BFF]/5 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-[#2F2BFF]/5 pb-6">
                            <div className="h-12 w-12 overflow-hidden rounded-full bg-[#2F2BFF]/10 border border-[#2F2BFF]/10 shadow-inner">
                                <img
                                    className="h-full w-full object-cover"
                                    alt="Host avatar"
                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Host'}`}
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-black text-slate-900 leading-tight">{user?.name || "Host"}</p>
                                    {user?.is_gold_host && (
                                        <span className="material-symbols-outlined text-[14px] text-amber-500 filled-icon font-black" title="Gold Host">stars</span>
                                    )}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-[#2F2BFF] bg-[#2F2BFF]/5 px-2 py-0.5 rounded-full w-fit mt-1">{user?.role || "Host"}</p>
                            </div>
                        </div>
                        <nav className="mt-6 flex flex-col gap-1.5">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.id}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${currentPage === item.id
                                        ? "bg-brand-gradient text-white shadow-lg shadow-blue-500/20"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-[#2F2BFF]"
                                        }`}
                                    href={item.href}
                                >
                                    <span className={`material-symbols-outlined text-lg ${currentPage === item.id ? "filled-icon font-black" : ""}`}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {!user?.is_gold_host && (
                        <div className="rounded-[32px] bg-amber-50 border border-amber-100 p-6 shadow-sm overflow-hidden relative group">
                            <div className="absolute -right-6 -bottom-6 h-20 w-20 bg-amber-200/20 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                            <h4 className="text-xs font-black text-amber-900 mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] filled-icon">stars</span>
                                Gold Host
                            </h4>
                            <p className="text-[10px] font-medium text-amber-700 leading-relaxed mb-4">
                                Get prioritized in search and 2x more bookings for ₹200/mo.
                            </p>
                            <Link 
                                href="/host/settings?upgrade=gold" 
                                className="block w-full text-center py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                            >
                                Upgrade Now
                            </Link>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0,05)]">
                <nav className="flex items-center justify-around">
                    {menuItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 transition-all ${currentPage === item.id ? "text-[#2F2BFF]" : "text-slate-400"
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-all ${currentPage === item.id ? "bg-[#2F2BFF]/10" : ""}`}>
                                <span className={`material-symbols-outlined text-2xl ${currentPage === item.id ? "filled-icon font-black" : ""}`}>
                                    {item.icon}
                                </span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
}
