"use client";

import Link from "next/link";

interface HostSidebarProps {
    user: any;
    currentPage: "overview" | "spaces" | "bookings" | "calendar" | "messages" | "earnings" | "settings" | "help";
}

export default function HostSidebar({ user, currentPage }: HostSidebarProps) {
    const menuItems = [
        { id: "overview", label: "Overview", icon: "dashboard", href: "/host/dashboard" },
        { id: "spaces", label: "My Spaces", icon: "corporate_fare", href: "/host/spaces" },
        { id: "bookings", label: "Bookings", icon: "calendar_today", href: "/host/bookings" },
        { id: "settings", label: "Settings", icon: "settings", href: "/host/settings" },
    ];

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <div className="flex flex-col gap-6">
                <div className="rounded-[24px] border border-[#1d1aff]/5 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-[#1d1aff]/5 pb-5">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-[#1d1aff]/10 border border-[#1d1aff]/10 shadow-inner">
                            <img
                                className="h-full w-full object-cover"
                                alt="Host avatar"
                                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Host'}`}
                            />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 leading-tight">{user?.name || "Yuki"}</p>
                            <p className="text-[10px] font-black uppercase tracking-wider text-[#1d1aff] bg-[#1d1aff]/5 px-2 py-0.5 rounded-full w-fit mt-1 capitalize">{user?.role || "Host"}</p>
                        </div>
                    </div>
                    <nav className="mt-5 flex flex-col gap-1.5">
                        {menuItems.map((item) => (
                            <Link
                                key={item.id}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${currentPage === item.id
                                    ? "bg-[#1d1aff] text-white shadow-lg shadow-blue-500/20"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-[#1d1aff]"
                                    }`}
                                href={item.href}
                            >
                                <span className={`material-symbols-outlined text-lg ${currentPage === item.id ? "filled-icon font-black" : ""}`}>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </aside>
    );
}
