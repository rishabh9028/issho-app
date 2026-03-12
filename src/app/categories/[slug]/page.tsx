"use client";

import Link from "next/link";
import { use, useState } from "react";
import spacesData from "@/data/spaces.json";

// Expanded mock listings per category
const MOCK_LISTINGS: Record<string, Array<{
    id: string; title: string; location: string; sublocation: string;
    guests: number; rooms: string; price: number; rating: number;
    badge?: string; img: string;
}>> = {
    villa: [
        { id: "v1", title: "The Private Hilltop Estate", location: "Alibaug, Maharashtra", sublocation: "Hilltop", guests: 20, rooms: "6 Rooms", price: 4200, rating: 4.98, badge: "Rare Find", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop" },
        { id: "v2", title: "Azure Infinity Villa", location: "Goa, India", sublocation: "Beachfront", guests: 12, rooms: "4 Rooms", price: 6500, rating: 4.85, img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop" },
        { id: "v3", title: "Forest Canopy Retreat", location: "Coorg, Karnataka", sublocation: "Riverside", guests: 8, rooms: "3 Rooms", price: 3200, rating: 5.0, img: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?q=80&w=800&auto=format&fit=crop" },
        { id: "v4", title: "Metropolis Sky Loft", location: "Mumbai, Maharashtra", sublocation: "Bandra West", guests: 25, rooms: "8 Rooms", price: 12000, rating: 4.92, img: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=800&auto=format&fit=crop" },
        { id: "v5", title: "Beachside Sanctuary", location: "Pondicherry, India", sublocation: "Seafront", guests: 10, rooms: "4 Rooms", price: 2800, rating: 4.79, img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop" },
        { id: "v6", title: "Wabi-Sabi Villa", location: "Udaipur, Rajasthan", sublocation: "Lake View", guests: 14, rooms: "5 Rooms", price: 3900, rating: 4.95, img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop" },
        { id: "v7", title: "Alpine Glass House", location: "Manali, Himachal Pradesh", sublocation: "Mountain Side", guests: 16, rooms: "6 Rooms", price: 7500, rating: 4.89, img: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=800&auto=format&fit=crop" },
        { id: "v8", title: "Valley Peak Estate", location: "Ooty, Tamil Nadu", sublocation: "Highland Area", guests: 20, rooms: "7 Rooms", price: 4800, rating: 4.82, img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=800&auto=format&fit=crop" },
    ],
    studio: [
        { id: "s1", title: "The Light Studio", location: "Bandra, Mumbai", sublocation: "Art District", guests: 15, rooms: "2000 sq ft", price: 1200, rating: 4.9, badge: "Top Rated", img: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800&auto=format&fit=crop" },
        { id: "s2", title: "Urban Creative Hub", location: "Indiranagar, Bengaluru", sublocation: "Ground Floor", guests: 25, rooms: "3500 sq ft", price: 1800, rating: 4.8, img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop" },
        { id: "s3", title: "Glasshouse Studio", location: "Hauz Khas, Delhi", sublocation: "Rooftop Access", guests: 10, rooms: "1200 sq ft", price: 900, rating: 5.0, img: "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?q=80&w=800&auto=format&fit=crop" },
        { id: "s4", title: "Minimal White Box", location: "Colaba, Mumbai", sublocation: "City View", guests: 8, rooms: "800 sq ft", price: 750, rating: 4.75, img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800&auto=format&fit=crop" },
    ],
    cafe: [
        { id: "c1", title: "Jardin Café Space", location: "Koramangala, Bengaluru", sublocation: "Garden Level", guests: 30, rooms: "Full Buyout", price: 800, rating: 4.8, badge: "Popular", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop" },
        { id: "c2", title: "The Attic Café", location: "Connaught Place, Delhi", sublocation: "Top Floor", guests: 20, rooms: "Partial Buyout", price: 600, rating: 4.6, img: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=800&auto=format&fit=crop" },
        { id: "c3", title: "Brew & Co Studio", location: "Fort, Mumbai", sublocation: "Heritage Zone", guests: 40, rooms: "Full Buyout", price: 1200, rating: 4.9, img: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop" },
        { id: "c4", title: "Patio Grounds", location: "Jubilee Hills, Hyderabad", sublocation: "Outdoor", guests: 50, rooms: "Full Buyout", price: 1500, rating: 4.7, img: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=800&auto=format&fit=crop" },
    ],
    rooftop: [
        { id: "r1", title: "Skyline Terrace", location: "South Mumbai, Mumbai", sublocation: "Sea Facing", guests: 60, rooms: "Open Air", price: 2500, rating: 4.9, badge: "Rare Find", img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop" },
        { id: "r2", title: "Sunset Heights", location: "Golf Course Road, Gurugram", sublocation: "City View", guests: 40, rooms: "Open Air", price: 1800, rating: 4.7, img: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop" },
        { id: "r3", title: "Garden Sky Lounge", location: "Whitefield, Bengaluru", sublocation: "Panoramic", guests: 80, rooms: "Open + Covered", price: 3200, rating: 4.85, img: "https://images.unsplash.com/photo-1574631410145-34a71a3dabb0?q=80&w=800&auto=format&fit=crop" },
        { id: "r4", title: "The Cloud Bar", location: "Andheri, Mumbai", sublocation: "Pool Deck", guests: 100, rooms: "Full Venue", price: 4500, rating: 4.95, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop" },
    ],
};

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
    const listings = MOCK_LISTINGS[slug] ?? [];
    const [shown, setShown] = useState(8);

    // Fall back to real spaces data filtered by type if no mock
    const spacesFallback = spacesData.filter(s => s.type.toLowerCase() === slug);

    const allItems: Array<{ id: string; title: string; location: string; sublocation: string; guests: number; rooms: string; price: number; rating: number; badge?: string; img: string }> =
        listings.length > 0 ? listings : spacesFallback.map(s => ({
            id: s.id,
            title: s.title,
            location: s.location,
            sublocation: s.type,
            guests: s.capacity,
            rooms: `${s.amenities.length} amenities`,
            price: s.price_per_hour,
            rating: s.rating,
            img: s.images[0],
        }));

    const visible = allItems.slice(0, shown);

    return (
        <div className="bg-[#f8f6f6] min-h-screen">
            <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-10 py-8">

                {/* Page Hero */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 border-b border-[#1d1aff]/5 pb-8">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[#1d1aff] font-semibold text-sm uppercase tracking-wider">
                            <span>{meta.icon}</span>
                            <span>Category: {meta.label}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                            {meta.label} for your next event
                        </h1>
                        <p className="text-slate-500 text-lg">
                            {meta.count} {meta.desc} in your selected area
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/categories"
                            className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 border-2 border-slate-200 text-slate-700 font-bold hover:border-[#1d1aff] hover:text-[#1d1aff] transition-all text-sm"
                        >
                            ← All Categories
                        </Link>
                        <Link
                            href={`/search?type=${slug}`}
                            className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-[#1d1aff] text-white font-bold hover:bg-[#1614cc] transition-all shadow-lg shadow-[#1d1aff]/20 text-sm"
                        >
                            View All Spaces
                        </Link>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
                    {FILTERS.map((f) => (
                        <button key={f} className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#1d1aff]/20 bg-white px-5 text-sm font-semibold hover:border-[#1d1aff] transition-colors whitespace-nowrap">
                            {f}
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    ))}
                    <div className="h-10 w-px bg-[#1d1aff]/10 mx-2" />
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
                                    {item.badge ? (
                                        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                                            {item.badge}
                                        </div>
                                    ) : i === 0 ? (
                                        <div className="absolute top-3 left-3 z-10 bg-[#1d1aff]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                                            Popular
                                        </div>
                                    ) : null}
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-base text-slate-900 leading-tight group-hover:text-[#1d1aff] transition-colors">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-1 font-semibold text-sm ml-2 flex-shrink-0">
                                            <svg className="w-3.5 h-3.5 text-[#1d1aff] fill-[#1d1aff]" viewBox="0 0 24 24">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                            <span>{item.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-sm">{item.location} · {item.sublocation}</p>
                                    <p className="text-slate-400 text-sm">Up to {item.guests} guests · {item.rooms}</p>
                                    <div className="mt-1 flex items-baseline gap-1">
                                        <span className="text-base font-black text-slate-900">₹{item.price.toLocaleString()}</span>
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
                        <Link href="/categories" className="mt-6 px-6 py-3 bg-[#1d1aff] text-white font-bold rounded-xl hover:bg-[#1614cc] transition-all text-sm">
                            Browse Other Categories
                        </Link>
                    </div>
                )}

                {/* Load More */}
                {shown < allItems.length && (
                    <div className="mt-20 flex flex-col items-center gap-4">
                        <p className="text-slate-500 text-sm">Showing {shown} of {allItems.length} {meta.label.toLowerCase()}</p>
                        <button
                            onClick={() => setShown(shown + 8)}
                            className="px-8 py-3 rounded-xl border-2 border-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all"
                        >
                            Load more spaces
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
