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
        { id: "favorites", label: "Favorites", icon: "favorite", href: "/guest/favorites" },
        { id: "settings", label: "Settings", icon: "settings", href: "/settings" },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0">
                <div className="flex flex-col gap-6 sticky top-24">
                    <div className="rounded-2xl border border-[#2F2BFF]/5 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-[#2F2BFF]/5 pb-5">
                            <div className="h-12 w-12 overflow-hidden rounded-full bg-[#2F2BFF]/10 border border-[#2F2BFF]/10">
                                <img 
                                    className="h-full w-full object-cover" 
                                    alt="User avatar" 
                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Guest'}`} 
                                />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{user?.name || "Guest"}</p>
                                <p className="text-[10px] font-black uppercase tracking-wider text-[#2F2BFF] bg-[#2F2BFF]/5 px-2 py-0.5 rounded-full w-fit mt-1">{user?.role || "Member"}</p>
                            </div>
                        </div>
                        <nav className="mt-5 flex flex-col gap-1.5">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.id}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${currentPage === item.id
                                        ? "bg-brand-gradient text-white shadow-lg shadow-blue-500/20"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-[#2F2BFF]"
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
