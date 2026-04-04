"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { X, SlidersHorizontal, ChevronDown, Check, Star } from "lucide-react";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { cn } from "@/lib/utils";

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
    profiles?: {
        is_gold_host: boolean;
    };
}

interface SearchClientProps {
    initialSpaces: Space[];
    initialLocation: string;
}

export default function SearchClient({ initialSpaces, initialLocation }: SearchClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
    const [location, setLocation] = useState(initialLocation);
    const [type, setType] = useState(searchParams.get("type") || "All");
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recommended");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(searchParams.get("amenities")?.split(",") || []);
    const [petFriendlyOnly, setPetFriendlyOnly] = useState(searchParams.get("pets") === "true");
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
    const [minCapacity, setMinCapacity] = useState(searchParams.get("minCapacity") || "");
    const [minRating, setMinRating] = useState(Number(searchParams.get("rating")) || 0);
    const [loading, setLoading] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Sync filters to URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (location) params.set("location", location); else params.delete("location");
        if (type !== "All") params.set("type", type); else params.delete("type");
        if (sortBy !== "recommended") params.set("sort", sortBy); else params.delete("sort");
        if (selectedAmenities.length > 0) params.set("amenities", selectedAmenities.join(",")); else params.delete("amenities");
        if (petFriendlyOnly) params.set("pets", "true"); else params.delete("pets");
        if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
        if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
        if (minCapacity) params.set("minCapacity", minCapacity); else params.delete("minCapacity");
        if (minRating > 0) params.set("rating", minRating.toString()); else params.delete("rating");
        
        // Use shallow routing to avoid full page reload but update the URL
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }, [location, type, sortBy, selectedAmenities, petFriendlyOnly, minPrice, maxPrice, minCapacity, minRating]);

    const fetchSpaces = async () => {
        setLoading(true);
        let query = supabase
            .from("spaces")
            .select("id, title, location, price_per_hour, capacity, type, amenities, images, rating, is_pet_friendly, host_id");

        if (location) query = query.ilike("location", `%${location}%`);
        if (type !== "All") query = query.ilike("type", type);
        if (petFriendlyOnly) query = query.eq("is_pet_friendly", true);
        if (selectedAmenities.length > 0) query = query.contains("amenities", selectedAmenities);
        if (minPrice) query = query.gte("price_per_hour", parseFloat(minPrice));
        if (maxPrice) query = query.lte("price_per_hour", parseFloat(maxPrice));
        if (minCapacity) query = query.gte("capacity", parseInt(minCapacity));
        if (minRating > 0) query = query.gte("rating", minRating);

        if (sortBy === "price_asc") query = query.order("price_per_hour", { ascending: true });
        else if (sortBy === "price_desc") query = query.order("price_per_hour", { ascending: false });
        else if (sortBy === "rating") query = query.order("rating", { ascending: false });
        else query = query.order("created_at", { ascending: false });

        const { data, error } = await query;
        if (error || !data) {
            setSpaces([]);
            setLoading(false);
            return;
        }

        const hostIds = [...new Set(data.map((s: any) => s.host_id).filter(Boolean))];
        let goldHostSet = new Set<string>();
        if (hostIds.length > 0) {
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, is_gold_host")
                .in("id", hostIds)
                .eq("is_gold_host", true);
            if (profiles) goldHostSet = new Set(profiles.map((p: any) => p.id));
        }

        const enriched = data.map((s: any) => ({
            ...s,
            profiles: { is_gold_host: goldHostSet.has(s.host_id) }
        }));
        
        const sorted = [...enriched].sort((a, b) => {
            const aGold = a.profiles?.is_gold_host ? 1 : 0;
            const bGold = b.profiles?.is_gold_host ? 1 : 0;
            return bGold - aGold;
        });

        setSpaces(sorted);
        setLoading(false);
    };

    // Re-fetch only when user interacts (not on mount since we have initialSpaces)
    // We compare with length to avoid initial mount fetch if spaces are passed
    useEffect(() => {
        if (spaces !== initialSpaces) {
            fetchSpaces();
        }
    }, [location, type, sortBy, selectedAmenities, petFriendlyOnly, minPrice, maxPrice, minCapacity, minRating]);

    return (
        <div className="bg-[#F8FAFF] min-h-screen pb-12">
            {/* Search Header Bar */}
            <div className="bg-white border-b border-slate-100 py-4 sticky top-0 z-40 backdrop-blur-md bg-white/80">
                <div className="container-custom">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            {/* Location Input */}
                            <div className="flex-1 w-full px-5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus-within:border-[#2F2BFF] focus-within:bg-white transition-all relative z-20 shadow-sm">
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
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Sort By</span>
                                <div className="relative flex-1 sm:flex-initial">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none w-full px-5 py-2.5 pr-10 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-[#2F2BFF] transition-all cursor-pointer shadow-sm min-w-[150px]"
                                    >
                                        <option value="recommended">Best Match</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="rating">Highest Rated</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Horizontal Filter Bar */}
                        <div className="flex items-center justify-end">
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 bg-white hover:border-slate-900 transition-all shadow-sm group"
                            >
                                <SlidersHorizontal className="w-4 h-4 text-slate-600 group-hover:text-[#2F2BFF]" />
                                <span className="text-xs font-bold text-slate-700">Filters</span>
                                {(type !== "All" || selectedAmenities.length > 0 || petFriendlyOnly || minPrice || maxPrice || minCapacity || minRating > 0) && (
                                    <div className="w-2 h-2 rounded-full bg-[#2F2BFF]"></div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                <div className="flex flex-col gap-8">
                    {/* Mobile Filters Drawer */}
                    {showMobileFilters && (
                        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
                                <div className="sticky top-0 bg-white border-b border-slate-100 flex items-center justify-between p-6 z-10">
                                    <div className="flex items-center gap-2">
                                        <SlidersHorizontal className="w-5 h-5 text-[#2F2BFF]" />
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Filters</h2>
                                    </div>
                                    <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-slate-500" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-10">
                                    {/* Property Type */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 block">Property Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {TYPES.map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setType(t)}
                                                    className={cn(
                                                        "px-4 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between",
                                                        type === t
                                                            ? "bg-[#2F2BFF]/5 text-[#2F2BFF] border-[#2F2BFF]"
                                                            : "bg-white text-slate-600 border-slate-100 hover:border-slate-200"
                                                    )}
                                                >
                                                    {t}
                                                    {type === t && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Range */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 block">Price / Hour (₹)</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-400 px-1">Min Price</span>
                                                <input
                                                    type="number"
                                                    placeholder="₹ 0"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(e.target.value)}
                                                    className="w-full h-12 bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#2F2BFF] rounded-xl px-4 text-sm font-bold outline-none transition-all shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-400 px-1">Max Price</span>
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={maxPrice}
                                                    onChange={(e) => setMaxPrice(e.target.value)}
                                                    className="w-full h-12 bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#2F2BFF] rounded-xl px-4 text-sm font-bold outline-none transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Min Guests */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 block">Minimum Capacity</label>
                                        <input
                                            type="number"
                                            placeholder="Number of guests"
                                            value={minCapacity}
                                            onChange={(e) => setMinCapacity(e.target.value)}
                                            className="w-full h-12 bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#2F2BFF] rounded-xl px-4 text-sm font-bold outline-none transition-all shadow-sm"
                                        />
                                    </div>

                                    {/* Rating */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 block">Minimum Rating</label>
                                        <div className="flex gap-2 justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setMinRating(minRating === star ? 0 : star)}
                                                    className="transition-transform active:scale-90"
                                                >
                                                    <Star className={cn(
                                                        "w-7 h-7 transition-colors leading-none",
                                                        minRating >= star ? "text-amber-400 fill-amber-400" : "text-slate-300"
                                                    )} />
                                                </button>
                                            ))}
                                            <span className="text-xs font-black text-slate-400 min-w-[3rem] text-right">
                                                {minRating > 0 ? `${minRating}+ Stars` : "Any"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Facilities */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 block text-xs">Facilities</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {AMENITIES.map((amenity) => (
                                                <button
                                                    key={amenity.id}
                                                    onClick={() => {
                                                        const updated = selectedAmenities.includes(amenity.id)
                                                            ? selectedAmenities.filter(a => a !== amenity.id)
                                                            : [...selectedAmenities, amenity.id];
                                                        setSelectedAmenities(updated);
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                                                        selectedAmenities.includes(amenity.id)
                                                            ? "border-[#2F2BFF] bg-[#2F2BFF]/5 text-[#2F2BFF] shadow-xs"
                                                            : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                                                    )}
                                                >
                                                    <span className="material-symbols-outlined text-base">{amenity.icon}</span>
                                                    <span className="text-[11px] font-bold truncate">{amenity.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pet Friendly */}
                                    <div className="pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => setPetFriendlyOnly(!petFriendlyOnly)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-4 rounded-2xl transition-all border",
                                                petFriendlyOnly ? "bg-orange-50 border-orange-200 shadow-sm" : "border-slate-100 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                    petFriendlyOnly ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-500"
                                                )}>
                                                    <span className="material-symbols-outlined text-lg fill-1">pets</span>
                                                </div>
                                                <div className="text-left">
                                                    <span className={cn(
                                                        "text-[11px] font-black uppercase tracking-widest block",
                                                        petFriendlyOnly ? "text-orange-900" : "text-slate-600"
                                                    )}>
                                                        Pet Friendly
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Allow furry friends</span>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-10 h-5 rounded-full relative transition-colors",
                                                petFriendlyOnly ? "bg-orange-500" : "bg-slate-200"
                                            )}>
                                                <div className={cn(
                                                    "absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all",
                                                    petFriendlyOnly ? "translate-x-5" : ""
                                                )} />
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 flex gap-4 z-10">
                                    <button
                                        onClick={() => {
                                            setType("All");
                                            setSelectedAmenities([]);
                                            setPetFriendlyOnly(false);
                                            setMinPrice("");
                                            setMaxPrice("");
                                            setMinCapacity("");
                                            setMinRating(0);
                                        }}
                                        className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={() => setShowMobileFilters(false)}
                                        className="flex-[2] px-6 py-4 rounded-2xl bg-brand-gradient text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#2F2BFF]/20"
                                    >
                                        Show Results
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Area */}
                    <main className="w-full">
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
                                {spaces.map((space, idx) => (
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
                                                    <Image
                                                        src={displayImg}
                                                        alt={space.title}
                                                        fill
                                                        priority={idx < 3}
                                                        unoptimized
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                );
                                            })()}
                                            <div className="absolute top-5 right-5 flex flex-col items-end gap-2 z-20">
                                                <FavoriteButton spaceId={space.id} />
                                                <span className="bg-brand-gradient text-white text-xs font-black px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md">
                                                    ₹{space.price_per_hour}/hr
                                                </span>
                                                {space.profiles?.is_gold_host && (
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
