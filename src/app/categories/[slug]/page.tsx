"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, use } from "react";

interface Space {
    id: string;
    title: string;
    description: string;
    location: string;
    price_per_hour: number;
    capacity: number;
    type: string;
    amenities: string[];
    images: string[];
    rating: number;
    reviews_count: number;
}

const CATEGORY_META: Record<string, { label: string; count: string; desc: string; icon: string }> = {
    villa: { label: "Villas", count: "120+", desc: "exclusive villas available", icon: "🏡" },
    studio: { label: "Studios", count: "85+", desc: "professional studios available", icon: "🎨" },
    cafe: { label: "Cafes", count: "210+", desc: "unique cafe spaces available", icon: "☕" },
    rooftop: { label: "Rooftops", count: "45+", desc: "rooftop venues available", icon: "🌇" },
    flat: { label: "Flats", count: "320+", desc: "flat spaces available", icon: "🏢" },
    bungalow: { label: "Bungalows", count: "60+", desc: "bungalows available", icon: "🏘" },
    workshop: { label: "Workshops", count: "110+", desc: "workshop spaces available", icon: "🛠" },
    event: { label: "Event Spaces", count: "95+", desc: "event spaces available", icon: "🎉" },
};

const FILTERS = ["Price Range", "Capacity", "Amenities", "Instant Book"];

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const meta = CATEGORY_META[slug] ?? { label: slug.charAt(0).toUpperCase() + slug.slice(1), count: "100+", desc: "spaces available", icon: "🏠" };
    
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);
    const [shown, setShown] = useState(8);

    useEffect(() => {
        const fetchSpaces = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("spaces")
                .select("*")
                .ilike("type", slug); 

            if (!error && data) {
                setSpaces(data);
            }
            setLoading(false);
        };

        fetchSpaces();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-[#2F2BFF]/20 border-t-[#2F2BFF] rounded-full animate-spin" />
            </div>
        );
    }

    const visible = spaces.slice(0, shown);

    return (
        <div className="bg-[#F8FAFF] min-h-screen">
            <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-10 py-8">

                {/* Page Hero */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 border-b border-[#2F2BFF]/5 pb-8">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[#2F2BFF] font-semibold text-sm uppercase tracking-wider">
                            <span>{meta.icon}</span>
                            <span>Category: {meta.label}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                            {meta.label} for your next event
                        </h1>
                        <p className="text-slate-500 text-lg">
                            {spaces.length} {meta.desc} in your selected area
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/categories"
                            className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 border-2 border-slate-200 text-slate-700 font-bold hover:border-[#2F2BFF] hover:text-[#2F2BFF] transition-all text-sm"
                        >
                            ← All Categories
                        </Link>
                        <Link
                            href={`/search?type=${slug}`}
                            className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-brand-gradient text-white font-bold hover:bg-[#1614cc] transition-all shadow-lg shadow-[#2F2BFF]/20 text-sm"
                        >
                            View All Spaces
                        </Link>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
                    {FILTERS.map((f) => (
                        <button key={f} className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#2F2BFF]/20 bg-white px-5 text-sm font-semibold hover:border-[#2F2BFF] transition-colors whitespace-nowrap">
                            {f}
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    ))}
                    <div className="h-10 w-px bg-[#2F2BFF]/10 mx-2" />
                    <button className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-slate-100 px-5 text-sm font-semibold whitespace-nowrap">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                        </svg>
                        Sort: Featured
                    </button>
                </div>

                {/* Results Grid */}
                {visible.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                        {visible.map((item, i) => (
                            <Link key={item.id} href={`/spaces/${item.id}`} className="group flex flex-col gap-4 cursor-pointer">
                                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl">
                                    {/* Favorite */}
                                    <button
                                        onClick={(e) => e.preventDefault()}
                                        className="absolute top-3 right-3 z-10 text-white drop-shadow-md hover:scale-110 transition-transform"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                    {/* Badge */}
                                    {i === 0 ? (
                                        <div className="absolute top-3 left-3 z-10 bg-[#2F2BFF]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                                            Popular
                                        </div>
                                    ) : null}
                                    {(() => {
                                        const typeFallbacks: { [key: string]: string } = {
                                            villa: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                                            studio: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
                                            cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
                                            rooftop: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88",
                                            default: "https://images.unsplash.com/photo-1497366216548-37526070297c"
                                        };
                                        const fallback = (typeFallbacks[item.type?.toLowerCase()] || typeFallbacks.default) + "?q=80&w=400&auto=format&fit=crop";
                                        const displayImg = (item.images && item.images.length > 0 && !item.images[0].startsWith('blob:')) 
                                            ? item.images[0] 
                                            : fallback;
                                        return (
                                            <img
                                                src={displayImg}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                                            />
                                        );
                                    })()}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-base text-slate-900 leading-tight group-hover:text-[#2F2BFF] transition-colors">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-1 font-semibold text-sm ml-2 flex-shrink-0">
                                            <svg className="w-3.5 h-3.5 text-[#2F2BFF] fill-[#2F2BFF]" viewBox="0 0 24 24">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                            <span>{item.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-sm">{item.location}</p>
                                    <p className="text-slate-400 text-sm">Up to {item.capacity} guests</p>
                                    <div className="mt-1 flex items-baseline gap-1">
                                        <span className="text-base font-black text-slate-900">₹{item.price_per_hour.toLocaleString()}</span>
                                        <span className="text-slate-400 text-sm">/ hr</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-100">
                        <div className="text-5xl mb-4">{meta.icon}</div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">No {meta.label} yet</h3>
                        <p className="text-slate-500 max-w-sm font-medium">We're onboarding spaces in this category. Check back soon!</p>
                        <Link href="/categories" className="mt-6 px-6 py-3 bg-brand-gradient text-white font-bold rounded-xl hover:bg-[#1614cc] transition-all text-sm">
                            Browse Other Categories
                        </Link>
                    </div>
                )}

                {/* Load More */}
                {shown < spaces.length && (
                    <div className="mt-20 flex flex-col items-center gap-4">
                        <p className="text-slate-500 text-sm">Showing {shown} of {spaces.length} {meta.label.toLowerCase()}</p>
                        <button
                            onClick={() => setShown(shown + 8)}
                            className="px-8 py-3 rounded-xl border-2 border-[#2F2BFF] text-[#2F2BFF] font-bold hover:bg-brand-gradient hover:border-transparent hover:text-white transition-all"
                        >
                            Load more spaces
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
