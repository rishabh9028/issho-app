"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HostSidebar from "@/components/host/HostSidebar";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Space {
    id: string;
    title: string;
    location: string;
    price_per_hour: number;
    capacity: number;
    images: string[];
    type: string;
    status?: string;
}

export default function HostSpaces() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");
    const [spaces, setSpaces] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        if (user.role !== "host" && user.role !== "admin") {
            router.push("/become-a-host");
            return;
        }

        const fetchData = async () => {
            // Fetch Host's Spaces
            const { data: spacesData, error: spacesError } = await supabase
                .from("spaces")
                .select("*")
                .eq("host_id", user.id);

            if (!spacesError && spacesData) {
                setSpaces(spacesData);
                
                if (spacesData.length > 0) {
                    const spaceIds = spacesData.map(s => s.id);
                    // Fetch Bookings for these spaces
                    const { data: bookingsData } = await supabase
                        .from("bookings")
                        .select("*")
                        .in("space_id", spaceIds);
                    
                    if (bookingsData) setBookings(bookingsData);
                }
            }
            setLoading(false);
        };

        fetchData();
    }, [user, router]);

    if (!user || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-[#2F2BFF]/20 border-t-[#2F2BFF] rounded-full animate-spin" />
            </div>
        );
    }

    const filteredSpaces = spaces.filter(s => {
        if (activeTab === "all") return true;
        if (activeTab === "active") return true; 
        if (activeTab === "paused") return false;
        return true;
    });

    const totalRevenue = bookings
        .filter(b => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + Number(b.total_price), 0);

    const totalReviews = spaces.reduce((sum, s) => sum + (s.reviews_count || 0), 0);
    const avgRating = spaces.length > 0 
        ? (spaces.reduce((sum, s) => sum + (Number(s.rating) || 0), 0) / spaces.length).toFixed(2)
        : "0.00";

    const handleDelete = async (spaceId: string) => {
        if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;

        try {
            const { error } = await supabase
                .from("spaces")
                .delete()
                .eq("id", spaceId);

            if (error) throw error;

            // Optimistic Update
            setSpaces(spaces.filter(s => s.id !== spaceId));
        } catch (error) {
            console.error("Error deleting space:", error);
            alert("Failed to delete the space. Please try again.");
        }
    };

    return (
        <div className="w-full bg-[#F8FAFF] min-h-screen pb-24 md:pb-0">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <HostSidebar user={user} currentPage="spaces" />

                    <div className="flex-1">
                        {/* Header Section */}
                        <header className="mb-10 flex flex-wrap justify-between items-end gap-4">
                            <div className="flex flex-col gap-2 text-left">
                                <h1 className="text-slate-900 text-4xl font-black tracking-tight">My Listings</h1>
                                <p className="text-slate-500 text-lg font-medium">Manage and monitor your Japanese-inspired property performance.</p>
                            </div>
                            <Link
                                href="/host/spaces/new"
                                className="inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-8 py-4 text-sm font-black text-white hover:brightness-110 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined font-black">add</span>
                                Add New Listing
                            </Link>
                        </header>

                        {/* Tabs */}
                        <div className="flex gap-8 mb-8 border-b border-slate-200">
                            {[
                                { id: "all", label: "All Listings", count: spaces.length },
                                { id: "active", label: "Active", count: spaces.length },
                                { id: "paused", label: "Paused", count: 0 },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 text-sm font-black transition-all relative ${activeTab === tab.id ? "text-[#2F2BFF]" : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    {tab.label} <span className="ml-1 opacity-50 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full font-bold">{tab.count}</span>
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gradient"></div>}
                                </button>
                            ))}
                        </div>

                        {/* Listings Table Layout */}
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-10">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Property</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Price/Hour</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Capacity</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredSpaces.map((space) => (
                                            <tr key={space.id} className="group hover:bg-slate-50/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-20 w-32 rounded-2xl overflow-hidden shrink-0 shadow-inner bg-slate-100 border border-slate-100">
                                                            {(() => {
                                                                const typeFallbacks: { [key: string]: string } = {
                                                                    villa: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                                                                    studio: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
                                                                    cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
                                                                    rooftop: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88",
                                                                    default: "https://images.unsplash.com/photo-1497366216548-37526070297c"
                                                                };
                                                                const fallback = (typeFallbacks[space.type?.toLowerCase()] || typeFallbacks.default) + "?q=80&w=400&auto=format&fit=crop";
                                                                const displayImg = (space.images && space.images.length > 0 && !space.images[0].startsWith('blob:')) 
                                                                    ? space.images[0] 
                                                                    : fallback;
                                                                return (
                                                                    <img 
                                                                        src={displayImg} 
                                                                        alt={space.title} 
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                                                        onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                                                                    />
                                                                );
                                                            })()}
                                                        </div>
                                                        <div className="text-left">
                                                            <h4 className="font-black text-slate-900 text-base leading-tight mb-1">{space.title}</h4>
                                                            <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                                                {space.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-500 border-emerald-100`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full bg-emerald-500`}></span>
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="font-black text-slate-900">₹{space.price_per_hour?.toLocaleString() || "0"}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-bold text-slate-500">{space.capacity} guests</span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/host/spaces/${space.id}/edit`}
                                                            className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#2F2BFF] transition-all"
                                                            title="Edit Space"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">edit</span>
                                                        </Link>
                                                        <Link
                                                            href={`/spaces/${space.id}`}
                                                            className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#2F2BFF] transition-all"
                                                            title="View Public Listing"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">visibility</span>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(space.id)}
                                                            className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all"
                                                            title="Delete Listing"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-400">Showing {filteredSpaces.length} of {spaces.length} properties</p>
                            </div>
                        </div>

                        {/* Insights Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-emerald-500/5 group-hover:scale-125 transition-transform duration-700"></div>
                                <div className="flex flex-col gap-4 relative z-10 text-left">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <span className="material-symbols-outlined font-black filled-icon text-xl">account_balance_wallet</span>
                                    </div>
                                    <h4 className="text-base font-black text-slate-900 tracking-tight">Revenue</h4>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 leading-none mb-2">₹{totalRevenue.toLocaleString()}</h3>
                                        <p className="text-xs font-bold text-slate-400">Total earnings from all spaces</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-amber-500/5 group-hover:scale-125 transition-transform duration-700"></div>
                                <div className="flex flex-col gap-4 relative z-10 text-left">
                                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <span className="material-symbols-outlined font-black filled-icon text-xl">star</span>
                                    </div>
                                    <h4 className="text-base font-black text-slate-900 tracking-tight">Avg. Rating</h4>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 leading-none mb-2">{avgRating} <span className="text-amber-500 text-2xl">★</span></h3>
                                        <p className="text-xs font-bold text-slate-400">Based on {totalReviews} reviews</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="mt-20 border-t border-slate-200 py-8 text-center px-4">
                <p className="text-slate-400 text-xs font-bold">© 2024 Isshō. All rights reserved.</p>
            </footer>
        </div>
    );
}
