"use client";

import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import HostSidebar from "@/components/host/HostSidebar";
import Link from "next/link";

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string;
}

interface Space {
    id: string;
    title: string;
    location: string;
    images: string[];
}

interface Booking {
    id: string;
    space_id: string;
    user_id: string;
    start_time: string;
    end_time: string;
    total_price: number;
    status: string;
    spaces: Space;
    profiles: Profile | Profile[];
}

export default function HostBookingDetails() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [guestReviewRating, setGuestReviewRating] = useState(5);
    const [guestReviewComment, setGuestReviewComment] = useState("");
    const [submittingGuestReview, setSubmittingGuestReview] = useState(false);
    const [existingGuestReview, setExistingGuestReview] = useState<any>(null);
    const [guestAverageRating, setGuestAverageRating] = useState<number | null>(null);

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "host" && user.role !== "admin") {
            router.push("/guest/dashboard");
        }
    }, [user, router]);

    const fetchGuestReview = async (bookingId: string) => {
        const { data } = await supabase
            .from("guest_reviews")
            .select("*")
            .eq("booking_id", bookingId)
            .maybeSingle();
        if (data) setExistingGuestReview(data);
    };

    const fetchGuestAverageRating = async (guestId: string) => {
        const { data, error } = await supabase
            .from("guest_reviews")
            .select("rating")
            .eq("guest_id", guestId);
        
        if (!error && data && data.length > 0) {
            const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
            setGuestAverageRating(sum / data.length);
        }
    };

    useEffect(() => {
        const fetchBookingData = async () => {
            if (!user || !params.id) return;
            setLoading(true);
            
            try {
                const { data: bookingData, error: bookingError } = await supabase
                    .from("bookings")
                    .select(`
                        *,
                        spaces!inner (*),
                        profiles:user_id (*)
                    `)
                    .eq("id", params.id)
                    .eq("spaces.host_id", user.id)
                    .single();

                if (!bookingError && bookingData) {
                    setBooking(bookingData as any);
                    
                    // Fetch guest specific data in parallel
                    const [reviewRes, ratingRes] = await Promise.all([
                        supabase
                            .from("guest_reviews")
                            .select("*")
                            .eq("booking_id", bookingData.id)
                            .maybeSingle(),
                        supabase
                            .from("guest_reviews")
                            .select("rating")
                            .eq("guest_id", bookingData.user_id)
                    ]);

                    if (reviewRes.data) setExistingGuestReview(reviewRes.data);
                    
                    if (!ratingRes.error && ratingRes.data && ratingRes.data.length > 0) {
                        const sum = ratingRes.data.reduce((acc, curr) => acc + curr.rating, 0);
                        setGuestAverageRating(sum / ratingRes.data.length);
                    }
                }
            } catch (err) {
                console.error("Error fetching booking details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingData();

        // Real-time listener for this specific booking
        const channel = supabase
            .channel(`host_booking_detail_${params.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `id=eq.${params.id}`
                },
                () => {
                    fetchBookingData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, params.id]);

    const updateStatus = async (newStatus: string) => {
        if (!booking) return;
        const { error } = await supabase
            .from("bookings")
            .update({ status: newStatus })
            .eq("id", booking.id);
        
        if (!error) {
            setBooking({ ...booking, status: newStatus });
        }
    };

    const handleGuestReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !booking) return;

        setSubmittingGuestReview(true);
        const { error } = await supabase
            .from("guest_reviews")
            .insert([
                {
                    booking_id: booking.id,
                    host_id: user.id,
                    guest_id: booking.user_id,
                    rating: guestReviewRating,
                    comment: guestReviewComment
                }
            ]);

        if (!error) {
            fetchGuestReview(booking.id);
        }
        setSubmittingGuestReview(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F2BFF]"></div>
        </div>
    );

    if (!booking) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
                <h1 className="text-2xl font-black text-slate-900">Booking not found</h1>
                <Link href="/host/bookings" className="text-[#2F2BFF] font-black hover:underline">Back to bookings</Link>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "confirmed": return "bg-emerald-50 text-emerald-500 shadow-emerald-500/10";
            case "pending": return "bg-rose-50 text-rose-500 shadow-rose-500/10";
            case "cancelled": return "bg-slate-100 text-slate-400";
            default: return "bg-slate-50 text-slate-400";
        }
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    return (
        <div className="w-full bg-[#F8FAFF] min-h-screen">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <HostSidebar user={user!} currentPage="bookings" />

                    <div className="flex-1 space-y-8">
                        {/* Header Navigation */}
                        <div className="flex items-center justify-between">
                            <Link href="/host/bookings" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors">
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back to Bookings
                            </Link>
                            <div className="flex gap-3">
                                <button className="h-11 px-6 rounded-2xl bg-white border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 active:scale-95 transition-all">Support</button>
                                <button className="h-11 px-6 rounded-2xl bg-slate-900 border border-slate-900 text-sm font-black text-white hover:bg-slate-800 active:scale-95 transition-all">Download Receipt</button>
                            </div>
                        </div>

                        {/* Top Snapshot Section */}
                        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-10 items-center">
                            <div className="h-48 w-72 rounded-[32px] overflow-hidden shadow-2xl shrink-0 group">
                                <img src={booking.spaces.images[0] || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"} alt="Space" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            </div>
                            <div className="flex-1 text-center lg:text-left">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                                    <h1 className="text-3xl font-black text-slate-900 leading-tight">{booking.spaces.title}</h1>
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest self-center lg:self-auto border ${getStatusStyle(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <p className="text-slate-500 font-bold text-lg mb-6 flex items-center justify-center lg:justify-start gap-2">
                                    <span className="material-symbols-outlined text-rose-500">location_on</span>
                                    {booking.spaces.location}
                                </p>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                    <div className="px-6 py-4 bg-slate-50 rounded-[20px] border border-slate-100 min-w-[140px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check In</p>
                                        <p className="font-black text-slate-900">{new Date(booking.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                                        <p className="text-xs font-bold text-slate-500">{formatTime(booking.start_time)}</p>
                                    </div>
                                    <div className="px-6 py-4 bg-slate-50 rounded-[20px] border border-slate-100 min-w-[140px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check Out</p>
                                        <p className="font-black text-slate-900">{new Date(booking.end_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                                        <p className="text-xs font-bold text-slate-500">{formatTime(booking.end_time)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Guest Details */}
                            <div className="lg:col-span-2 space-y-8">
                                <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Guest Personal Details</h2>
                                    <div className="flex items-center gap-8 mb-10 pb-10 border-b border-slate-50">
                                        <div className="h-24 w-24 rounded-[32px] overflow-hidden shadow-inner border border-slate-100 shrink-0">
                                            {(() => {
                                                const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles;
                                                const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.user_id}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                                                return (
                                                    <img src={avatarUrl} alt="Guest" className="w-full h-full object-cover" />
                                                );
                                            })()}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-1">{(Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles)?.full_name || "Guest User"}</h3>
                                            <p className="text-slate-500 font-bold flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-[#2F2BFF]/5 text-[#2F2BFF] text-[10px] font-black uppercase tracking-widest rounded-md">Verified Account</span>
                                                <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                                Member since 2024
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                                                    <span className="material-symbols-outlined text-slate-400">mail</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                                    <p className="font-bold text-slate-900">guest@example.com</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                                                    <span className="material-symbols-outlined text-slate-400">call</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                                                    <p className="font-bold text-slate-900">+91 98XXX XXXXX</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                                                    <span className="material-symbols-outlined text-slate-400">star</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guest Rating</p>
                                                    <p className="font-bold text-slate-900">
                                                        {guestAverageRating ? `${guestAverageRating.toFixed(1)} / 5.0` : "No ratings yet"}
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="h-11 w-full rounded-2xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-600 hover:bg-[#2F2BFF]/5 hover:text-[#2F2BFF] hover:border-[#2F2BFF]/10 transition-all">Send Message to Guest</button>
                                        </div>
                                    </div>
                                </section>

                                {/* Guest Review Section */}
                                {booking.status === "confirmed" && (
                                    <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Rate your Guest</h2>
                                        {existingGuestReview ? (
                                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-1 mb-3">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span key={star} className={`material-symbols-outlined text-xl ${existingGuestReview.rating >= star ? "text-amber-500 fill-1" : "text-slate-200"}`}>star</span>
                                                    ))}
                                                </div>
                                                <p className="text-slate-600 font-medium italic">"{existingGuestReview.comment}"</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Submitted on {new Date(existingGuestReview.created_at).toLocaleDateString()}</p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleGuestReviewSubmit} className="space-y-6">
                                                <div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Select Rating</p>
                                                    <div className="flex gap-3">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setGuestReviewRating(star)}
                                                                className={`material-symbols-outlined text-3xl transition-all ${guestReviewRating >= star ? "text-amber-500 fill-1 scale-110" : "text-slate-200 hover:text-slate-300"}`}
                                                            >
                                                                star
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Private Feedback (Optional)</p>
                                                    <textarea
                                                        value={guestReviewComment}
                                                        onChange={(e) => setGuestReviewComment(e.target.value)}
                                                        placeholder="How was your experience with this guest?"
                                                        className="w-full h-32 rounded-2xl border-slate-200 bg-slate-50 p-4 text-sm font-medium focus:ring-[#2F2BFF] focus:border-[#2F2BFF] transition-all"
                                                    ></textarea>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={submittingGuestReview}
                                                    className="h-14 px-8 rounded-[20px] bg-slate-900 text-white font-black hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
                                                >
                                                    {submittingGuestReview ? "Submitting..." : "Submit Review"}
                                                </button>
                                            </form>
                                        )}
                                    </section>
                                )}

                                {booking.status === "pending" && (
                                    <section className="bg-rose-50/50 rounded-[40px] p-10 border border-rose-100 shadow-sm flex flex-col items-center text-center gap-6">
                                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center border border-rose-100 shadow-sm text-rose-500">
                                            <span className="material-symbols-outlined text-3xl">notifications_active</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2">Review Reservation Request</h3>
                                            <p className="text-slate-500 font-medium max-w-md">This booking is currently pending your approval. Guests appreciate quick responses.</p>
                                        </div>
                                        <div className="flex gap-4 w-full max-w-sm">
                                            <button onClick={() => updateStatus("confirmed")} className="flex-1 h-14 rounded-[20px] bg-brand-gradient text-white font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Approve Booking</button>
                                            <button onClick={() => updateStatus("cancelled")} className="flex-1 h-14 rounded-[20px] bg-white border border-slate-200 text-rose-500 font-black hover:bg-rose-50 active:scale-95 transition-all">Decline</button>
                                        </div>
                                    </section>
                                )}
                            </div>

                            {/* Payment Summary Box */}
                            <div className="space-y-6">
                                <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                                    <h4 className="text-lg font-black mb-8 relative z-10">Financial Overview</h4>
                                    
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex justify-between items-center text-slate-400">
                                            <span className="text-xs font-bold">Space Rate</span>
                                            <span className="font-bold text-white">₹{(booking.total_price * 0.9).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-400">
                                            <span className="text-xs font-bold">Host Service Fee (10%)</span>
                                            <span className="font-bold text-white">₹{(booking.total_price * 0.1).toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-white/10 w-full my-4"></div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF]">Net Payout</span>
                                                <span className="text-3xl font-black leading-none text-white">₹{booking.total_price.toLocaleString()}</span>
                                            </div>
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Secured</span>
                                        </div>
                                    </div>

                                    <div className="mt-10 p-5 bg-white/5 rounded-[24px] border border-white/5 relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="material-symbols-outlined text-emerald-400 text-lg">verified_user</span>
                                            <p className="text-xs font-black">Guaranteed Payment</p>
                                        </div>
                                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed">Funds are held by Isshō and will be released 24 hours after check-in.</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                                    <h4 className="text-sm font-black text-slate-900 mb-6">Booking Details</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-xs py-1">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Booking ID</span>
                                            <span className="font-black text-slate-900 uppercase">#{booking.id.slice(0, 8)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Reference</span>
                                            <span className="font-black text-slate-900">ISS-{booking.id.slice(-4)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Cancellation</span>
                                            <span className="font-black text-rose-500">Moderate</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
