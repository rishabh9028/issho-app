"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GuestSidebar from "@/components/guest/GuestSidebar";
import Link from "next/link";

interface Space {
    id: string;
    title: string;
    location: string;
    price_per_hour: number;
    rating: number;
    type: string;
    images: string[];
}

interface Favorite {
    id: string;
    space_id: string;
    spaces: Space;
}

export default function Favorites() {
    const { user } = useAuth();
    const router = useRouter();
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "guest" && user.role !== "admin") {
            router.push("/host/dashboard");
        }
    }, [user, router]);

    useEffect(() => {
        if (!user) return;
        const fetchFavorites = async () => {
            const { data, error } = await supabase
                .from("favorites")
                .select(`id, space_id, spaces:space_id (id, title, location, price_per_hour, rating, type, images)`)
                .eq("user_id", user.id);

            if (!error && data) {
                const formattedFavorites = (data as any[]).map(fav => ({
                    ...fav,
                    spaces: Array.isArray(fav.spaces) ? fav.spaces[0] : fav.spaces
                }));
                setFavorites(formattedFavorites as Favorite[]);
            }
            setLoading(false);
        };
        fetchFavorites();
    }, [user]);

    const removeFavorite = async (favoriteId: string) => {
        await supabase.from("favorites").delete().eq("id", favoriteId);
        setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    };

    if (!user) return null;

    return (
        <div className="w-full bg-[#f8f6f6] min-h-screen">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <GuestSidebar user={user} currentPage="favorites" />

                    <div className="flex-1">
                        {/* Header */}
                        <header className="mb-10 flex flex-wrap justify-between items-end gap-4">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-slate-900 text-4xl font-black tracking-tight">Favorites</h1>
                                <p className="text-slate-500 text-lg font-medium">Your saved spaces and studios</p>
                            </div>
                            <Link
                                href="/"
                                className="flex items-center gap-2 rounded-xl bg-[#1d1aff] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#1d1aff]/20 hover:scale-[1.02] transition-transform"
                            >
                                <span className="material-symbols-outlined text-lg">search</span>
                                Browse Spaces
                            </Link>
                        </header>

                        {/* Skeleton */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-72 rounded-3xl bg-white animate-pulse border border-slate-100" />
                                ))}
                            </div>
                        ) : favorites.length === 0 ? (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center py-28 text-center">
                                <div className="h-24 w-24 rounded-full bg-[#1d1aff]/5 flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-5xl text-[#1d1aff]/30">favorite</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">No favorites yet</h2>
                                <p className="text-slate-400 font-medium max-w-xs mb-8">
                                    Save spaces you love by tapping the heart icon on any listing. They'll appear here.
                                </p>
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 rounded-2xl bg-[#1d1aff] px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-[#1d1aff]/20 hover:scale-[1.02] transition-transform"
                                >
                                    <span className="material-symbols-outlined text-lg">search</span>
                                    Explore Spaces
                                </Link>
                            </div>
                        ) : (
                            /* Favorites Grid */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {favorites.map((fav) => {
                                    const space = fav.spaces;
                                    return (
                                        <div key={fav.id} className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                                {space.images?.[0] ? (
                                                    <img
                                                        src={space.images[0]}
                                                        alt={space.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-slate-300">
                                                        <span className="material-symbols-outlined text-5xl">image</span>
                                                    </div>
                                                )}
                                                {/* Unfavorite button */}
                                                <button
                                                    onClick={() => removeFavorite(fav.id)}
                                                    className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-[#1d1aff] shadow-lg hover:scale-110 active:scale-90 transition-all"
                                                    title="Remove from favorites"
                                                >
                                                    <span className="material-symbols-outlined font-black" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                                </button>
                                                <div className="absolute bottom-4 left-4">
                                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                                                        {space.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-6 flex flex-col gap-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{space.title}</h3>
                                                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                                            {space.location}
                                                        </p>
                                                    </div>
                                                    {space.rating > 0 && (
                                                        <div className="flex items-center gap-1 bg-[#1d1aff]/5 px-2 py-1 rounded-lg">
                                                            <span className="material-symbols-outlined text-xs text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                            <span className="text-xs font-black text-[#1d1aff]">{space.rating.toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                                    <p className="text-xl font-black text-slate-900">
                                                        ₹{space.price_per_hour.toLocaleString()}
                                                        <span className="text-slate-400 font-bold text-sm">/hr</span>
                                                    </p>
                                                    <Link
                                                        href={`/spaces/${space.id}`}
                                                        className="px-5 py-2.5 bg-[#1d1aff] text-white text-xs font-black rounded-xl hover:brightness-110 transition-all shadow-md shadow-blue-500/10 active:scale-95"
                                                    >
                                                        Book Now
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
