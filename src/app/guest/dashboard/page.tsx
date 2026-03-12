"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import GuestSidebar from "@/components/guest/GuestSidebar";

export default function GuestDashboard() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "guest" && user.role !== "admin") {
            router.push("/host/dashboard");
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="w-full bg-[#f8f6f6] min-h-screen py-8">
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <GuestSidebar user={user} currentPage="dashboard" />


                    {/* Dashboard Content */}
                    <div className="flex-1 space-y-8">
                        {/* Welcome Header */}
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome back, {user.name.split(" ")[0]}</h1>
                                <p className="text-slate-500">You have 2 upcoming bookings this month.</p>
                            </div>
                            <button className="flex items-center gap-2 rounded-xl bg-[#1d1aff] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#1d1aff]/20 hover:scale-[1.02] transition-transform">
                                <span className="material-symbols-outlined text-lg text-white">add</span> Book New Space
                            </button>
                        </div>

                        {/* Upcoming Bookings Section */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold">Upcoming Bookings</h2>
                                <Link className="text-sm font-semibold text-[#1d1aff] hover:underline" href="/guest/bookings">View all</Link>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Booking Card 1 */}
                                <div className="group overflow-hidden rounded-2xl border border-[#1d1aff]/5 bg-white shadow-sm">
                                    <div className="relative h-40 w-full overflow-hidden">
                                        <img className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Modern Zen Studio" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-GKBsEuWKb78csb8cCLxoXYAKd3b-a7Y9z183k41RLaOWoejYD-Cm8hqkTH2fULxpajSYqAX2p1wSxA_wN76jI7BQZh03sylf4vRDduq--KcUnqakL9zxoKmmHf0FYDK37UzukXSEBmfohH6IR3pxbklv87-94Ys0Ck1f-BhGHIAXj0nw0iok_8adzFERqHoUlhGUvZqw4fshAxKmh5-boOZu9S4aV9rJFjXeQe2nhiJxiEoZVIaFCJCnRHp09Quxo5PfdRpFNg" />
                                        <div className="absolute right-3 top-3 rounded-full bg-green-500 px-3 py-1 text-[10px] font-bold text-white uppercase">Confirmed</div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold">Modern Zen Studio</h3>
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <span className="material-symbols-outlined text-sm">location_on</span> Shibuya, Tokyo
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-[#1d1aff]">Oct 12 - 15</p>
                                                <p className="text-[10px] text-slate-400">3 nights</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                                            <div className="flex -space-x-2">
                                                <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-200">
                                                    <img className="h-full w-full rounded-full object-cover" alt="Host avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnNBMlxHaSFYFkR74HqRu4pvrCIIfCaCcuh6gm7xdRJ56Ia_OBoIxs5roNrZ0moY6veaWJVWWjrw_KlxWmok2rK5br6jZYlT91ApdDrq7uzKGJcxR50NFdfLcwR8e9Qr5VN2CaXZvgeyj5O-6XwcCUS4BK_n6SNnYUIGUvnXrEFbsN2WiFG8NerVTt3X1Rm1FdeGixBQFmaRADmEPISWKe_KmCbQsBiGK7IZG8Lp_nh4mMpnzlrfwuRNu8ncCuWGL9bLp5FTB6ig" />
                                                </div>
                                                <div className="flex h-7 items-center px-4 text-[10px] text-slate-500">Hosted by Yuki</div>
                                            </div>
                                            <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#1d1aff] hover:text-white transition-colors">Manage</button>
                                        </div>
                                    </div>
                                </div>
                                {/* Booking Card 2 */}
                                <div className="group overflow-hidden rounded-2xl border border-[#1d1aff]/5 bg-white shadow-sm">
                                    <div className="relative h-40 w-full overflow-hidden">
                                        <img className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Creative Loft Space" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5HaP36SMkK5btfQphuNmPEEN_NG6yxw_bHHMzFIyOHA5TOaXCjP2oiVF1tq-chpzBtKEQwlGK7gyP5UWawLw-0xr78_AnSJCERbeRLLmUNhRjT5XjexKcPdH_gGCU3ZF6JsyV1sF9AccbvUKYZq2PhcYlhv7fd_mctbtEmb84ysm7LYzCSyMsujdN04q61chEJsYAPhUTuDvPa_YbsPbEPSg0ORfdef5rDbgK1OtOd_Yukf20erYRAzCkd2moJErvv6MCQhpzPQ" />
                                        <div className="absolute right-3 top-3 rounded-full bg-[#1d1aff] px-3 py-1 text-[10px] font-bold text-white uppercase">Pending</div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold">Creative Loft Space</h3>
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <span className="material-symbols-outlined text-sm">location_on</span> Arts District, LA
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-[#1d1aff]">Nov 02 - 04</p>
                                                <p className="text-[10px] text-slate-400">2 nights</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                                            <div className="flex -space-x-2">
                                                <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-200">
                                                    <img className="h-full w-full rounded-full object-cover" alt="Host avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU2msqdOe8hC3BeE5NEBVhdF9BJqSzqWyjEAHbb4L_4BzeoJBNRXU-Grl5PhQEgNcJLIhJ2xwk9VfkiOONtI85TEUaHDr3lOhXwtKoBSyIcH5x-i7iMoXNsw7iQMbkapY6BYthj89kbkLd4LvRBbJiK9FWC3fzyHLgwTHVba_tSS19wH1purblcCmGJEqaX3SWWxncFQiOZ5uAKwPeDf_oPg3za0bcawuK3lzuiy6udyQ_iLofi-8_k5cxODz5dYy27GgHLahSBw" />
                                                </div>
                                                <div className="flex h-7 items-center px-4 text-[10px] text-slate-500">Hosted by Mark</div>
                                            </div>
                                            <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#1d1aff] hover:text-white transition-colors">Details</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Past Bookings Section */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold">Past Bookings</h2>
                                <div className="flex gap-2">
                                    <button className="h-8 w-8 rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50">
                                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    </button>
                                    <button className="h-8 w-8 rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50">
                                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {/* Past Stay Item 1 */}
                                <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 overflow-hidden rounded-xl">
                                            <img className="h-full w-full object-cover" alt="Past stay image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAugFDuvvVWTmncj1zXsi-yfMqqCSBDC3i2xcuHkZFrIiiBZBaVVw4M2U2ZWvmMVEOLqNefcy0xZZ8-p4gDm_V_ONpgSRpImNSEYtPDfDpf_VaTbpq9Nrce9fAjm_yq25wYR9x3u9LfZwT2wKNgYhVeWnFLxuBLJImHA9NZ8UUNzlMm44Mq1OA4gqP8oKyJuE6C_siXkNTBf3sW7f00OE8JBDIa5N23IhlH9iuZgfN2fYGgXxblcK5TZ7N9LsMnYwPrlc6yhwp0ig" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold">Scandinavian Minimalist Apt</h4>
                                            <p className="text-xs text-slate-500">Sept 15 - 18 • Stockholm, SE</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="hidden sm:flex flex-col items-end">
                                            <div className="flex text-yellow-400">
                                                <span className="material-symbols-outlined text-sm">star</span>
                                                <span className="material-symbols-outlined text-sm">star</span>
                                                <span className="material-symbols-outlined text-sm">star</span>
                                                <span className="material-symbols-outlined text-sm">star</span>
                                                <span className="material-symbols-outlined text-sm">star</span>
                                            </div>
                                            <p className="text-[10px] font-medium text-slate-400">You rated 5.0</p>
                                        </div>
                                        <button className="rounded-lg border border-[#1d1aff]/20 px-4 py-2 text-xs font-bold text-[#1d1aff] hover:bg-[#1d1aff]/5">View Receipt</button>
                                    </div>
                                </div>
                                {/* Past Stay Item 2 */}
                                <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 overflow-hidden rounded-xl">
                                            <img className="h-full w-full object-cover" alt="Past stay image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz13xXyU0yRaQxUmORTbIrcKDAl9kq5HG94pIfJuAHGjEqgot3-V1xern4u-RirE1-LUScd6mE1WyLhsQeisUSASRHrp3qcu7AATFGv5KiH71f-vQMNzqG27scn9MpFOxF3j3HIfNPO2m6GTYwkaJeTVOCYU7gv4ncBVJ8WzQE5NP0EPCLUQcHcEXmJc7x1X1dKzcxNifgwro0aIaDRKOvfaIFE6OVGmaJSyJXc2dgGNAMc2oZTdMIYMwT_saQIZVb0f9GIcT_7w" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold">Industrial Chic Penthouse</h4>
                                            <p className="text-xs text-slate-500">Aug 22 - 25 • Berlin, DE</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="rounded-lg bg-[#1d1aff] px-4 py-2 text-xs font-bold text-white shadow-sm hover:scale-[1.02] transition-transform">Leave Review</button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Stats Section */}
                        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100/50">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Spent</p>
                                <h3 className="text-2xl font-black mt-1">$4,280</h3>
                                <div className="mt-2 flex items-center text-[10px] font-bold text-green-500">
                                    <span className="material-symbols-outlined text-sm">trending_up</span> 12% from last month
                                </div>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100/50">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nights Stayed</p>
                                <h3 className="text-2xl font-black mt-1">24</h3>
                                <div className="mt-2 flex items-center text-[10px] font-bold text-slate-400">
                                    <span className="material-symbols-outlined text-sm">history</span> Lifetime stats
                                </div>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100/50">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Badge Rank</p>
                                <h3 className="text-2xl font-black mt-1 text-[#1d1aff]">Gold Explorer</h3>
                                <div className="mt-2 flex items-center text-[10px] font-bold text-[#1d1aff]/70">
                                    <span className="material-symbols-outlined text-sm">verified</span> Verified Member
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
