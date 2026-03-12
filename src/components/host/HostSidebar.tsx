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
        { id: "messages", label: "Messages", icon: "chat_bubble", href: "/host/messages" },
        { id: "earnings", label: "Earnings", icon: "payments", href: "/host/earnings" },
        { id: "settings", label: "Settings", icon: "settings", href: "/host/settings" },
        { id: "help", label: "Help Center", icon: "help", href: "/help" },
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
                                src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBdfPNMucMuSUNyDYhe7_lidlIxF3soI4WtCAt-b-PdtD4zRJyMcIcueyUuRBCjhKyUGNaozNOiMKqY5CfZype_fWp9wV18HYPgIl2cBXI9R62ScAAcbfkl19fVp1HEQSD0PLECtOpYc5q-sdoGOAXxEb3fNt6LjLoIEw4062phXaRA5v8rDlCW5NvCJnmQeiKBTHxDI3WWNIitEoSooW7TQS_CRR_kqQp-6KAuhRe7HC00gS9lD-DmBdAaXMcP7AMUssYLNqLafQ"}
                            />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 leading-tight">{user?.name || "Yuki"}</p>
                            <p className="text-[10px] font-black uppercase tracking-wider text-[#1d1aff] bg-[#1d1aff]/5 px-2 py-0.5 rounded-full w-fit mt-1">Superhost</p>
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

                {/* Performance Card */}
                <div className="rounded-[24px] bg-[#1d1aff]/5 p-6 border border-[#1d1aff]/10 text-slate-900 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#1d1aff]/10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#1d1aff] mb-1">Host Insights</p>
                    <p className="text-sm font-black text-slate-900 mb-3 leading-tight">Your response rate is 98% this week.</p>
                    <button className="w-full rounded-xl bg-white py-2.5 text-xs font-black text-[#1d1aff] hover:bg-[#1d1aff] hover:text-white transition-all shadow-md shadow-blue-500/5 active:scale-95 border border-[#1d1aff]/5">View Insights</button>
                </div>

                {/* Help Center Button */}
                <button className="flex items-center justify-center gap-2 w-full py-4 px-4 rounded-[20px] bg-slate-100 hover:bg-slate-200 transition-all text-slate-600 text-xs font-black tracking-tight transform active:scale-95">
                    <span className="material-symbols-outlined text-lg">help</span>
                    Support Center
                </button>
            </div>
        </aside>
    );
}
