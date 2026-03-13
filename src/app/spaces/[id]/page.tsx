"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
    host_id: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    }
}

export default function SpaceDetail() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const spaceId = params.id as string;
    const [space, setSpace] = useState<Space | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
    const [duration, setDuration] = useState(4);

    useEffect(() => {
        const fetchSpace = async () => {
            const { data, error } = await supabase
                .from("spaces")
                .select(`
                    *,
                    profiles:host_id (
                        full_name,
                        avatar_url
                    )
                `)
                .eq("id", spaceId)
                .single();

            if (!error && data) {
                setSpace(data as Space);
            }
            setLoading(false);
        };

        if (spaceId) {
            fetchSpace();
        }
    }, [spaceId]);

    const handleBooking = async () => {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        if (!space) return;

        setBookingLoading(true);
        const startTime = new Date(`${checkInDate}T10:00:00`); // Mocking 10 AM start for now
        const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

        const { error } = await supabase
            .from("bookings")
            .insert([
                {
                    space_id: space.id,
                    user_id: user.id,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    total_price: space.price_per_hour * duration,
                    status: 'pending'
                }
            ]);

        if (!error) {
            setBookingSuccess(true);
        }
        setBookingLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-[#1d1aff]/20 border-t-[#1d1aff] rounded-full animate-spin" />
            </div>
        );
    }

    if (!space) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                <h1 className="text-2xl font-black mb-4">Space not found</h1>
                <Link href="/search" className="text-[#1d1aff] font-bold hover:underline">Back to search</Link>
            </div>
        );
    }
    return (
        <div className="bg-[#f8f6f6] min-h-screen text-slate-900">
            <main className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-20 py-8">
                {/* Hero Section / Image Gallery */}
                <section className="mb-10 grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[500px]">
                    <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-xl bg-slate-200">
                        {space.images[0] && (
                            <img
                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                alt={space.title}
                                src={space.images[0]}
                            />
                        )}
                        <button className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm hover:bg-white transition-colors">
                            <span className="material-symbols-outlined text-sm">grid_view</span> View all photos
                        </button>
                    </div>
                    {space.images.slice(1, 5).map((img, idx) => (
                        <div key={idx} className="hidden md:block overflow-hidden rounded-xl bg-slate-200">
                            <img 
                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" 
                                alt={`${space.title} ${idx + 2}`} 
                                src={img} 
                            />
                        </div>
                    ))}
                    {/* Placeholder for missing small images if less than 5 */}
                    {Array.from({ length: Math.max(0, 4 - space.images.length + 1) }).map((_, idx) => (
                        <div key={`placeholder-${idx}`} className="hidden md:block overflow-hidden rounded-xl bg-slate-100 border border-slate-200" />
                    ))}
                </section>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content Column */}
                    <div className="flex-1">
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{space.title}</h1>
                                <button className="p-2 rounded-full hover:bg-[#1d1aff]/10 border border-slate-200 transition-colors">
                                    <span className="material-symbols-outlined">share</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[#1d1aff] text-lg fill-1">star</span> {space.rating} · {space.reviews_count} reviews
                                </span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-lg">location_on</span> {space.location}
                                </span>
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-200 my-8"></div>

                        {/* Host Section */}
                        <div className="flex items-center gap-4 mb-8">
                            <div
                                className="h-14 w-14 rounded-full bg-cover bg-center border border-slate-100 shadow-sm bg-slate-100"
                                style={{ backgroundImage: `url('${space.profiles?.avatar_url || 'https://i.pravatar.cc/150'}')` }}
                            ></div>
                            <div>
                                <p className="text-lg font-bold text-slate-900">Hosted by {space.profiles?.full_name || 'Host'}</p>
                                <p className="text-sm text-slate-500 font-medium">Joined in 2024</p>
                            </div>
                            <button className="ml-auto rounded-xl border-2 border-[#1d1aff] px-5 py-2 text-sm font-bold text-[#1d1aff] hover:bg-[#1d1aff] hover:text-white transition-all transform active:scale-95">
                                Message Host
                            </button>
                        </div>

                        {/* Description */}
                        <div className="mb-10">
                            <p className="text-lg leading-relaxed text-slate-600 font-medium">
                                {space.description}
                            </p>
                        </div>

                        {/* Amenities Section */}
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">What this space offers</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6">
                                {space.amenities.map((amenity) => (
                                    <div key={amenity} className="flex items-center gap-4 group">
                                        <span className="material-symbols-outlined text-[#1d1aff] text-2xl group-hover:scale-110 transition-transform">check_circle</span>
                                        <span className="text-slate-700 font-bold">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-200 my-8"></div>

                        {/* Reviews Section */}
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-8">
                                <span className="material-symbols-outlined text-[#1d1aff] text-2xl fill-1">star</span>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">4.9 · 124 reviews</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-full bg-slate-200 bg-cover bg-center border border-slate-100"
                                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuASWt8frwknyiWzE33PB3FJC5TxpduLqQ9P1SNoOc3Qsavjf3Ye6_h_MAuFrph_-ezLPUi3jasZZOckT2F4syXyXVYwx8PH0sQk2dz1gZH0VztHQi5mWYrVmNkf6Pix6jPz1hDUcpNV7NmsiNJScLivg3SnWOyZsK3Kf8qCYu2KBAxWiO0-rQVP1QeHnxtYaRE3xvac2N0yDjNwA-U3PvKJBHKt82nyHvOdKUSC5Te1-e63p-bmGVtyZMkRt-M2UR9YpEDo14RVtg')" }}
                                        ></div>
                                        <div>
                                            <p className="font-bold text-slate-900">Kenji Tanaka</p>
                                            <p className="text-xs text-slate-500 font-medium">October 2023</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed font-medium">"The lighting in this space is incredible. We used it for a brand photoshoot and didn't need half our lighting rig. Yuki was a fantastic host."</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-full bg-slate-200 bg-cover bg-center border border-slate-100"
                                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBOIS0xmIhUr6qRMFPcbj_9q3clinHqOunSuk08WDDxJqJSiq7dSdBPn1NNQVbSYR7O8d2yfahfMxI6sUac5W0oTmdQ-R2rVNOQLxeTmjPDM1ZzXMfhPp2OONRpx_Akna6UjhMjQHmamKMRY7cNC8V8caE9UUMAAdESPMnYBkqhT-9NuQzE5jHE0VnlnnTNmaAIhL7h8OH7LDGjH9cfGdpDPBvzMBu4TquXh2QoVJZ3bVGDFZk6Tjy27qg_fCP-ERsQ_Jnj_qBTPg')" }}
                                        ></div>
                                        <div>
                                            <p className="font-bold text-slate-900">Sarah Williams</p>
                                            <p className="text-xs text-slate-500 font-medium">September 2023</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed font-medium">"Perfect for our team workshop. The pool area is great for breaks, and the minimalist aesthetic really helped our team stay focused."</p>
                                </div>
                            </div>
                            <button className="mt-8 rounded-xl border border-slate-900 px-6 py-3 font-bold hover:bg-slate-900 hover:text-white transition-all transform active:scale-95">
                                Show all reviews
                            </button>
                        </div>
                    </div>

                    {/* Sticky Booking Widget */}
                    <aside className="w-full lg:w-96">
                        <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-[#1d1aff]/5">
                            {bookingSuccess ? (
                                <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                        <span className="material-symbols-outlined text-4xl font-black">check_circle</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Booking Requested!</h3>
                                    <p className="text-slate-500 font-medium mb-8">The host has been notified. You can track your request in your dashboard.</p>
                                    <Link 
                                        href="/guest/dashboard" 
                                        className="inline-block w-full py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all"
                                    >
                                        Go to Dashboard
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-end gap-1 mb-6">
                                        <span className="text-3xl font-black text-[#1d1aff]">₹{space.price_per_hour.toLocaleString()}</span>
                                        <span className="text-slate-500 font-bold mb-1">/ hour</span>
                                    </div>

                                    <div className="rounded-xl border border-slate-300 overflow-hidden mb-4">
                                        <div className="grid grid-cols-2 border-b border-slate-300">
                                            <div className="p-3 border-r border-slate-300 hover:bg-slate-50 transition-colors">
                                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Date</label>
                                                <input 
                                                    className="w-full border-none p-0 text-sm font-bold bg-transparent focus:ring-0 text-slate-900" 
                                                    type="date" 
                                                    value={checkInDate}
                                                    onChange={(e) => setCheckInDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="p-3 hover:bg-slate-50 transition-colors">
                                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Start Time</label>
                                                <select className="w-full border-none p-0 text-sm font-bold bg-transparent focus:ring-0 text-slate-900">
                                                    <option>10:00 AM</option>
                                                    <option>11:00 AM</option>
                                                    <option>12:00 PM</option>
                                                    <option>01:00 PM</option>
                                                    <option>02:00 PM</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="p-3 hover:bg-slate-50 transition-colors">
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Duration</label>
                                            <select 
                                                className="w-full border-none p-0 text-sm font-bold bg-transparent focus:ring-0 text-slate-900"
                                                value={duration}
                                                onChange={(e) => setDuration(Number(e.target.value))}
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                                                    <option key={h} value={h}>{h} {h === 1 ? 'hour' : 'hours'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleBooking}
                                        disabled={bookingLoading}
                                        className="w-full rounded-xl bg-[#1d1aff] py-4 text-center font-black text-white hover:brightness-110 disabled:opacity-70 transition-all shadow-lg shadow-[#1d1aff]/30 transform active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {bookingLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            "Request to Book"
                                        )}
                                    </button>
                                    <p className="mt-4 text-center text-xs text-slate-500 font-bold">You won't be charged yet</p>

                                    <div className="mt-6 space-y-3">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="underline decoration-slate-300 text-slate-600">₹{space.price_per_hour.toLocaleString()} x {duration} hours</span>
                                            <span className="font-bold text-slate-900">₹{(space.price_per_hour * duration).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="underline decoration-slate-300 text-slate-600">Service fee</span>
                                            <span className="font-bold text-slate-900">₹{Math.round(space.price_per_hour * duration * 0.1).toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-slate-200 my-2"></div>
                                        <div className="flex justify-between font-black text-xl text-slate-900">
                                            <span>Total</span>
                                            <span>₹{Math.round(space.price_per_hour * duration * 1.1).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center gap-4 p-4 rounded-xl bg-[#1d1aff]/5 text-[#1d1aff] border border-[#1d1aff]/10">
                                        <span className="material-symbols-outlined font-bold">verified_user</span>
                                        <span className="text-xs font-bold leading-tight">Isshō Guarantee: We protect your booking against cancellations.</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
