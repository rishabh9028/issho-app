"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import GuestSidebar from "@/components/guest/GuestSidebar";
import { MapPin, Users, Heart } from "lucide-react";
import Image from "next/image";
import FavoriteButton from "@/components/ui/FavoriteButton";

interface FavoriteSpace {
    id: string; // The favorite ID, not the space ID
    space_id: string;
    spaces: {
        id: string;
        title: string;
        location: string;
        price_per_hour: number;
        capacity: number;
        type: string;
        images: string[];
        rating: number;
        reviews_count: number;
    } | any; // Type override since postgrest-js might infer it as an array
}

export default function GuestFavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [favorites, setFavorites] = useState<FavoriteSpace[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "guest" && user.role !== "admin") {
            router.push("/host/dashboard");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;

        const fetchFavorites = async () => {
            const { data, error } = await supabase
                .from("user_favorites")
                .select(`
                    id,
                    space_id,
                    spaces (
                        id, title, location, price_per_hour, capacity, type, images, rating, reviews_count
                    )
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (!error && data) {
                // Filter out any where the join failed (e.g. space was deleted)
                setFavorites(data.filter((f: any) => f.spaces) as FavoriteSpace[]);
            }
            setLoading(false);
        };

        fetchFavorites();

        // Real-time subscription to catch unfavorites from this page
        const channel = supabase
            .channel(`public:user_favorites:user_id=eq.${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_favorites',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
                    fetchFavorites();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    if (!user) return null;

    return (
        <div className="w-full bg-[#F8FAFF] min-h-screen py-8 pb-24 md:pb-8">
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <GuestSidebar user={user} currentPage="favorites" />

                    <div className="flex-1 space-y-8">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">
                                Saved Spaces
                            </h1>
                            <p className="text-slate-500 mt-1">
                                {loading ? "Loading your favorites..." : `You have ${favorites.length} saved space${favorites.length === 1 ? '' : 's'}.`}
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="bg-slate-200/50 animate-pulse rounded-[2.5rem] aspect-[4/4]" />
                                ))}
                            </div>
                        ) : favorites.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
                                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Heart className="w-8 h-8 text-rose-500" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">No saved spaces yet</h3>
                                <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
                                    Click the heart icon on any space you like to save it here for later.
                                </p>
                                <Link
                                    href="/search"
                                    className="px-8 py-3.5 bg-brand-gradient text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all w-fit mx-auto shadow-[#2F2BFF]/20"
                                >
                                    Start Exploring
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favorites.map(({ spaces: space }) => {
                                    const typeFallbacks: { [key: string]: string } = {
                                        villa: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                                        studio: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
                                        cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
                                        rooftop: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88",
                                        default: "https://images.unsplash.com/photo-1497366216548-37526070297c"
                                    };
                                    const fallback = (typeFallbacks[space.type?.toLowerCase() || ''] || typeFallbacks.default) + "?q=80&w=800&auto=format&fit=crop";
                                    const displayImg = (space.images && space.images.length > 0 && !space.images[0].startsWith('blob:')) 
                                        ? space.images[0] 
                                        : fallback;

                                    return (
                                        <Link
                                            key={space.id}
                                            href={`/spaces/${space.id}`}
                                            className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                        >
                                            <div className="relative overflow-hidden aspect-[4/3]">
                                                <Image
                                                    src={displayImg}
                                                    alt={space.title}
                                                    fill
                                                    unoptimized
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                                <div className="absolute top-4 right-4 z-20">
                                                    <FavoriteButton spaceId={space.id} />
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF] bg-[#2F2BFF]/5 px-2 py-1 rounded-md">
                                                        {space.type}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-amber-400 text-base fill-1">star</span>
                                                        <span className="text-sm font-black text-slate-900">{space.rating || 'New'}</span>
                                                    </div>
                                                </div>
                                                <h3 className="font-black text-slate-900 text-lg mb-1 leading-tight group-hover:text-[#2F2BFF] transition-colors line-clamp-1">
                                                    {space.title}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-3">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span className="line-clamp-1">{space.location}</span>
                                                </div>
                                                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                                                    <div className="flex items-center gap-1 font-black text-slate-900">
                                                        ₹{space.price_per_hour} <span className="text-xs text-slate-400 font-medium">/hr</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                                        <Users className="w-3.5 h-3.5" />
                                                        Up to {space.capacity}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
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
