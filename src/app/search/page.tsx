"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";

const TYPES = ["All", "Studio", "Rooftop", "Villa", "Cafe", "Event Space", "Warehouse", "Gallery", "Garden", "Co-working"];
const AMENITIES = [
    { id: 'wifi', label: 'WiFi', icon: 'wifi' },
    { id: 'parking', label: 'Parking', icon: 'local_parking' },
    { id: 'ac', label: 'AC', icon: 'ac_unit' },
    { id: 'kitchen', label: 'Kitchen', icon: 'countertops' },
    { id: 'power', label: 'Power', icon: 'battery_charging_full' },
    { id: 'coffee', label: 'Coffee', icon: 'coffee' },
    { id: 'tv', label: 'TV', icon: 'tv' },
    { id: 'projector', label: 'Projector', icon: 'videocam' },
    { id: 'whiteboard', label: 'Whiteboard', icon: 'edit_note' },
    { id: 'cctv', label: 'CCTV', icon: 'videocam' }
];

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
    is_pet_friendly: boolean;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [location, setLocation] = useState(searchParams.get("location") || "");
    const [type, setType] = useState("All");
    const [sortBy, setSortBy] = useState("recommended");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [petFriendlyOnly, setPetFriendlyOnly] = useState(false);
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [minCapacity, setMinCapacity] = useState<string>("");
    const [minRating, setMinRating] = useState<number>(0);
    const [showAllTypes, setShowAllTypes] = useState(false);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpaces = async () => {
            setLoading(true);
            let query = supabase
                .from("spaces")
                .select(`
                    *,
                    profiles:host_id (is_gold_host)
                `);

            if (location) {
                query = query.ilike("location", `%${location}%`);
            }

            if (type !== "All") {
                query = query.eq("type", type);
            }

            if (petFriendlyOnly) {
                query = query.eq("is_pet_friendly", true);
            }

            if (selectedAmenities.length > 0) {
                query = query.contains("amenities", selectedAmenities);
            }

            if (minPrice) {
                query = query.gte("price_per_hour", parseFloat(minPrice));
            }

            if (maxPrice) {
                query = query.lte("price_per_hour", parseFloat(maxPrice));
            }

            if (minCapacity) {
                query = query.gte("capacity", parseInt(minCapacity));
            }

            if (minRating > 0) {
                query = query.gte("rating", minRating);
            }

            // Always prioritize Gold Hosts first
            query = query.order('is_gold_host', { foreignTable: 'profiles', ascending: false });

            // Secondary Sorting
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
    }, [location, type, sortBy, selectedAmenities, petFriendlyOnly, minPrice, maxPrice, minCapacity, minRating]);

    return (
        <div className="bg-[#F8FAFF] min-h-screen pb-12">
            {/* Search Header Bar */}
            <div className="bg-white border-b border-slate-100 py-6 sticky top-0 z-40 backdrop-blur-md bg-white/80">
                <div className="container-custom">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        {/* Location Input */}
                        <div className="flex-1 px-5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus-within:border-[#2F2BFF] focus-within:bg-white transition-all relative z-20 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#2F2BFF]">location_on</span>
                                <AddressAutocomplete
                                    value={location ? { label: location, value: location } : null}
                                    onSelect={(data) => setLocation(data.label)}
                                    placeholder="Where are you going?"
                                    className="w-full"
                                    variant="bare"
                                />
                            </div>
                        </div>

                        {/* Sort Select */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Sort By</span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none px-6 py-3 pr-12 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:border-[#2F2BFF] transition-all cursor-pointer shadow-sm min-w-[180px]"
                                >
                                    <option value="recommended">Best Match</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Sidebar Filters */}
                    <aside className="lg:col-span-3">
                        <div className="sticky top-28 space-y-4">
                            
                            {/* Filter Header */}
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-900 text-xl font-black">tune</span>
                                    <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">Filters</h3>
                                </div>
                                {(type !== "All" || selectedAmenities.length > 0 || petFriendlyOnly || minPrice || maxPrice || minCapacity || minRating > 0) && (
                                    <button 
                                        onClick={() => {
                                            setType("All");
                                            setSelectedAmenities([]);
                                            setPetFriendlyOnly(false);
                                            setMinPrice("");
                                            setMaxPrice("");
                                            setMinCapacity("");
                                            setShowAllTypes(false);
                                            setShowAllAmenities(false);
                                        }}
                                        className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF] hover:underline"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* Main Filter Container */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                
                                {/* Section: Property Type (Expandable) */}
                                <div className="p-4 border-b border-slate-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Property Type</label>
                                        <button 
                                            onClick={() => setShowAllTypes(!showAllTypes)}
                                            className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF] hover:underline"
                                        >
                                            {showAllTypes ? "Less" : "More"}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 transition-all duration-300">
                                        {(showAllTypes ? TYPES : TYPES.slice(0, 5)).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setType(t)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                    type === t 
                                                    ? "bg-[#2F2BFF] text-white shadow-md shadow-[#2F2BFF]/20" 
                                                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Price Range (Compact) */}
                                <div className="p-4 border-b border-slate-50">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Price / Hour (₹)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input 
                                            type="number" 
                                            placeholder="Min" 
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full h-9 bg-slate-50 border-transparent focus:bg-white focus:border-[#2F2BFF] rounded-lg px-3 text-xs font-bold outline-none transition-all shadow-sm"
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Max" 
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full h-9 bg-slate-50 border-transparent focus:bg-white focus:border-[#2F2BFF] rounded-lg px-3 text-xs font-bold outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* Section: Capacity & Rating (Stacked) */}
                                <div className="p-4 border-b border-slate-50 space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Min Guests</label>
                                        <input 
                                            type="number" 
                                            placeholder="0+" 
                                            value={minCapacity}
                                            onChange={(e) => setMinCapacity(e.target.value)}
                                            className="w-full h-9 bg-slate-50 border-transparent focus:bg-white focus:border-[#2F2BFF] rounded-lg px-3 text-xs font-bold outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Min Rating</label>
                                        <div className="flex gap-1 justify-between px-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button 
                                                    key={star}
                                                    onClick={() => setMinRating(minRating === star ? 0 : star)}
                                                    className={`material-symbols-outlined text-[22px] transition-colors leading-none ${
                                                        minRating >= star ? "text-amber-400 fill-1" : "text-slate-200 hover:text-slate-300"
                                                    }`}
                                                >
                                                    star
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Facilities (Expandable Grid) */}
                                <div className="p-4 border-b border-slate-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Facilities</label>
                                        <button 
                                            onClick={() => setShowAllAmenities(!showAllAmenities)}
                                            className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF] hover:underline"
                                        >
                                            {showAllAmenities ? "Less" : "More"}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 transition-all duration-300">
                                        {(showAllAmenities ? AMENITIES : AMENITIES.slice(0, 4)).map((amenity) => (
                                            <button
                                                key={amenity.id}
                                                onClick={() => {
                                                    const updated = selectedAmenities.includes(amenity.id)
                                                        ? selectedAmenities.filter(a => a !== amenity.id)
                                                        : [...selectedAmenities, amenity.id];
                                                    setSelectedAmenities(updated);
                                                }}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                                                    selectedAmenities.includes(amenity.id)
                                                    ? "border-[#2F2BFF] bg-[#2F2BFF]/5 text-[#2F2BFF] shadow-sm"
                                                    : "border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100"
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-base leading-none">{amenity.icon}</span>
                                                <span className="text-[10px] font-bold truncate">{amenity.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Pet Friendly (Toggle Row) */}
                                <button
                                    onClick={() => setPetFriendlyOnly(!petFriendlyOnly)}
                                    className={`w-full flex items-center justify-between p-4 transition-all ${
                                        petFriendlyOnly ? "bg-orange-50/50" : "hover:bg-slate-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                            petFriendlyOnly ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-500"
                                        }`}>
                                            <span className="material-symbols-outlined text-base fill-1">pets</span>
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${petFriendlyOnly ? "text-orange-900" : "text-slate-600"}`}>
                                            Pet Friendly
                                        </span>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${
                                        petFriendlyOnly ? "bg-orange-500" : "bg-slate-200"
                                    }`}>
                                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                                            petFriendlyOnly ? "translate-x-4" : ""
                                        }`} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Results Area */}
                    <main className="lg:col-span-9">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {loading ? "Finding spaces..." : `${spaces.length} spaces found`}
                                </h1>
                                {location && (
                                    <p className="text-slate-500 font-medium flex items-center gap-1 mt-1">
                                        Showing results for <span className="text-[#2F2BFF] font-bold">{location}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="bg-slate-200/50 animate-pulse rounded-[2.5rem] aspect-[4/5]" />
                                ))}
                            </div>
                        ) : spaces.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {spaces.map((space) => (
                                    <Link
                                        key={space.id}
                                        href={`/spaces/${space.id}`}
                                        className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                                    >
                                        <div className="relative overflow-hidden aspect-[4/4]">
                                            {space.is_pet_friendly && (
                                                <div className="absolute top-5 left-5 z-10 px-4 py-2 bg-white/95 backdrop-blur-md rounded-2xl flex items-center gap-2 shadow-xl">
                                                    <span className="material-symbols-outlined text-orange-500 text-lg fill-1">pets</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Pet Friendly</span>
                                                </div>
                                            )}
                                            {(() => {
                                                const typeFallbacks: { [key: string]: string } = {
                                                    villa: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                                                    studio: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
                                                    cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
                                                    rooftop: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88",
                                                    default: "https://images.unsplash.com/photo-1497366216548-37526070297c"
                                                };
                                                const fallback = (typeFallbacks[space.type.toLowerCase()] || typeFallbacks.default) + "?q=80&w=1000&auto=format&fit=crop";
                                                const displayImg = (space.images && space.images.length > 0 && !space.images[0].startsWith('blob:')) 
                                                    ? space.images[0] 
                                                    : fallback;

                                                return (
                                                    <img
                                                        src={displayImg}
                                                        alt={space.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = fallback;
                                                        }}
                                                    />
                                                );
                                            })()}
                                            <div className="absolute top-5 right-5 flex flex-col items-end gap-2">
                                                <span className="bg-brand-gradient text-white text-xs font-black px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md">
                                                    ₹{space.price_per_hour}/hr
                                                </span>
                                                {(space as any).profiles?.is_gold_host && (
                                                    <span className="bg-amber-500 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-1 uppercase tracking-widest border border-amber-400/50">
                                                        <span className="material-symbols-outlined text-[12px] filled-icon">stars</span>
                                                        Gold Host
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF] bg-[#2F2BFF]/5 px-3 py-1 rounded-lg">
                                                    {space.type}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-amber-400 text-lg fill-1">star</span>
                                                    <span className="text-sm font-black text-slate-900">{space.rating}</span>
                                                </div>
                                            </div>
                                            <h3 className="font-black text-[#0F172A] text-lg mb-2 leading-tight group-hover:text-[#2F2BFF] transition-colors line-clamp-1">
                                                {space.title}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-4">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                <span className="line-clamp-1">{space.location}</span>
                                            </div>

                                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex gap-1">
                                                    {space.amenities.slice(0, 2).map((amenity: string) => (
                                                        <span key={amenity} className="material-symbols-outlined text-slate-400 text-lg" title={amenity}>
                                                            {amenity === 'wifi' ? 'wifi' : amenity === 'parking' ? 'local_parking' : amenity === 'ac' ? 'ac_unit' : 'category'}
                                                        </span>
                                                    ))}
                                                    {space.amenities.length > 2 && (
                                                        <span className="text-[10px] font-black text-slate-400 flex items-center">+{space.amenities.length - 2}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                                    <span className="material-symbols-outlined text-sm">groups</span>
                                                    {space.capacity} Guests
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                                <div className="w-24 h-24 rounded-full bg-[#2F2BFF]/5 flex items-center justify-center mb-8">
                                    <span className="material-symbols-outlined text-4xl text-[#2F2BFF]">search_off</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No spaces match your criteria</h3>
                                <p className="text-slate-500 max-w-sm font-medium text-lg px-8">Try adjusting your filters or searching in a different area to find what you're looking for.</p>
                                <button
                                    onClick={() => { setLocation(""); setType("All"); setSelectedAmenities([]); setPetFriendlyOnly(false); }}
                                    className="mt-10 px-10 py-4 bg-brand-gradient text-white font-black rounded-2xl hover:shadow-2xl hover:scale-105 transition-all text-sm uppercase tracking-widest"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#F8FAFF]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#2F2BFF]/20 border-t-[#2F2BFF] rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium text-sm">Finding spaces...</p>
                </div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
