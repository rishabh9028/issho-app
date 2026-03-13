"use client";

import Link from "next/link";

interface GuestSidebarProps {
    user: any;
    currentPage: "dashboard" | "bookings" | "messages" | "favorites" | "payments" | "settings" | "help";
}

export default function GuestSidebar({ user, currentPage }: GuestSidebarProps) {
    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: "grid_view", href: "/guest/dashboard" },
        { id: "bookings", label: "My Bookings", icon: "calendar_today", href: "/guest/bookings" },
        { id: "favorites", label: "Favorites", icon: "favorite", href: "/favorites" },
        { id: "settings", label: "Settings", icon: "settings", href: "/settings" },
    ];

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <div className="flex flex-col gap-6">
                <div className="rounded-xl border border-[#1d1aff]/5 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-[#1d1aff]/5 pb-4">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-[#1d1aff]/10">
                            <img className="h-full w-full object-cover" alt="User avatar detail" src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Guest'}`} />
                        </div>
                        <div>
                            <p className="text-sm font-bold">{user?.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{user?.role || "Member"}</p>
                        </div>
                    </div>
                    <nav className="mt-4 flex flex-col gap-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.id}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${currentPage === item.id
                                    ? "bg-[#1d1aff]/10 text-[#1d1aff] font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-[#1d1aff]"
                                    }`}
                                href={item.href}
                            >
                                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>



            </div>
        </aside>
    );
}
