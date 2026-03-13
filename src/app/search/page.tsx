"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const TYPES = ["All", "Studio", "Rooftop", "Villa", "Cafe", "Event Space"];

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

function SearchContent() {
    const searchParams = useSearchParams();
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [location, setLocation] = useState(searchParams.get("location") || "");
    const [type, setType] = useState("All");
    const [sortBy, setSortBy] = useState("recommended");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpaces = async () => {
            setLoading(true);
            let query = supabase
                .from("spaces")
                .select("*");

            if (location) {
                query = query.ilike("location", `%${location}%`);
            }

            if (type !== "All") {
                query = query.eq("type", type);
            }

            // Sorting
            if (sortBy === "price_asc") {
                query = query.order("price_per_hour", { ascending: true });
            } else if (sortBy === "price_desc") {
                query = query.order("price_per_hour", { ascending: false });
            } else if (sortBy === "rating") {
                query = query.order("rating", { ascending: false });
            } else {
                query = query.order("created_at", { ascending: false });
            }

            const { data, error } = await query;

            if (!error && data) {
                setSpaces(data);
            }
            setLoading(false);
        };

        fetchSpaces();
    }, [location, type, sortBy]);

    return (
        <div className="bg-[#f8f6f6] min-h-screen">

            {/* Search Header Bar */}
            <div className="bg-white border-b border-slate-100 py-5">
                <div className="container-custom">
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        {/* Location Input */}
                        <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#1d1aff] transition-colors">
                            <svg className="w-5 h-5 text-[#1d1aff] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-transparent outline-none border-none text-slate-900 placeholder:text-slate-400 text-sm font-medium"
                                placeholder="Search by city or neighborhood..."
                            />
                        </div>

                        {/* Sort Select */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-none focus:border-[#1d1aff] transition-colors cursor-pointer"
                        >
                            <option value="recommended">Recommended</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>

                    {/* Type Filter Pills */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                        {TYPES.map((t) => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${type === t
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="container-custom py-8">
                {/* Count + heading */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-slate-100 animate-pulse rounded-xl aspect-[4/5]" />
                        ))}
                    </div>
                ) : spaces.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {spaces.map((space) => (
                            <Link
                                key={space.id}
                                href={`/spaces/${space.id}`}
                                className="group bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                {/* Image */}
                                <div className="relative overflow-hidden aspect-[4/3]">
                                    <img
                                        src={space.images[0]}
                                        alt={space.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-white text-slate-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                            {space.type}
                                        </span>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-[#1d1aff] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                            ₹{space.price_per_hour}/hr
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-[#222222] text-sm mb-0.5 leading-tight group-hover:text-slate-600 transition-colors">
                                        {space.title}
                                    </h3>
                                    <div className="flex items-center gap-1 text-slate-500 text-[13px] mb-2">
                                        {space.location}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                            <span className="text-sm font-bold text-slate-900">{space.rating}</span>
                                            <span className="text-sm text-slate-400 font-medium">({space.reviews_count})</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Up to {space.capacity} guests
                                        </div>
                                    </div>

                                    {/* Amenities */}
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {space.amenities.slice(0, 3).map((amenity: string) => (
                                            <span key={amenity} className="text-[11px] font-semibold px-2 py-1 bg-[#1d1aff]/5 text-[#1d1aff] rounded-md">
                                                {amenity}
                                            </span>
                                        ))}
                                        {space.amenities.length > 3 && (
                                            <span className="text-[11px] font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                                                +{space.amenities.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-100">
                        <div className="w-16 h-16 rounded-full bg-[#1d1aff]/10 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-[#1d1aff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">No spaces found</h3>
                        <p className="text-slate-500 max-w-sm font-medium">Try adjusting your filters or searching a different location.</p>
                        <button
                            onClick={() => { setLocation(""); setType("All"); }}
                            className="mt-6 px-6 py-3 bg-[#1d1aff] text-white font-bold rounded-xl hover:bg-[#1614cc] transition-all text-sm"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#f8f6f6]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#1d1aff]/20 border-t-[#1d1aff] rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium text-sm">Finding spaces...</p>
                </div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
