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
        { id: "messages", label: "Messages", icon: "chat_bubble", href: "/messages" },
        { id: "favorites", label: "Favorites", icon: "favorite", href: "/favorites" },
        { id: "payments", label: "Payments", icon: "payments", href: "/payments" },
        { id: "settings", label: "Settings", icon: "settings", href: "/settings" },
        { id: "help", label: "Help Center", icon: "help", href: "/help" },
    ];

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <div className="flex flex-col gap-6">
                <div className="rounded-xl border border-[#1d1aff]/5 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-[#1d1aff]/5 pb-4">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-[#1d1aff]/10">
                            <img className="h-full w-full object-cover" alt="User avatar detail" src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuATxg4DfFPnAgU7XZS-TzPOuMeZX-cUUu3LNGSEjf-kF7ddg05r-Yu8AZeub6FrcsBZirqHn_gcLW2v5AuhlL6tXHfzkJmfsNOjk4yDPPk_AdOa5Ga16s9fBkuUi7-Slh3iS1b_iP0rzywL6zdj01MkzaZU6cNuxV2Fl4ypufyaagIe0gtuj0n7YHGOyNX1mz3BiVQWgyfhgROchSyHcQbRCLrv4ccSCZXTrEyTRlaYYx1cJXMqBKeeeJpsnssMTfZFB2kagUUXYQ"} />
                        </div>
                        <div>
                            <p className="text-sm font-bold">{user?.name}</p>
                            <p className="text-xs text-slate-500">Pro Guest • 12 Stays</p>
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

                {/* Promo Card */}
                <div className="rounded-xl bg-[#1d1aff] p-5 text-white shadow-lg shadow-[#1d1aff]/20">
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-80 text-white">Refer & Earn</p>
                    <p className="mt-2 text-sm font-medium text-white">Invite a friend and get $50 off your next booking.</p>
                    <button className="mt-4 w-full rounded-lg bg-white py-2 text-xs font-bold text-[#1d1aff] hover:bg-slate-50 transition-colors">Invite Friends</button>
                </div>

                {/* Help Center Button (from the new mockup) */}
                <button className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600 text-sm font-bold">
                    <span className="material-symbols-outlined text-lg">help</span>
                    Help Center
                </button>
            </div>
        </aside>
    );
}
