"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GuestSidebar from "@/components/guest/GuestSidebar";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
}

export default function BookingDetailsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "guest" && user.role !== "admin") {
            router.push("/host/dashboard");
        }
    }, [user, router]);

    useEffect(() => {
        if (!user || !id) return;
        
        const fetchBooking = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("bookings")
                .select(`
                    *,
                    spaces (
                        id,
                        title,
                        location,
                        images
                    )
                `)
                .eq("id", id)
                .single();

            if (!error && data) {
                setBooking(data as any);
                
                // Check if already reviewed
                const { data: reviewData } = await supabase
                    .from("reviews")
                    .select("id")
                    .eq("booking_id", id)
                    .single();
                
                if (reviewData) setAlreadyReviewed(true);
            }
            setLoading(false);
            setReviewLoading(false);
        };

        fetchBooking();

        // Real-time listener for this specific booking
        const channel = supabase
            .channel(`booking_detail_${id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `id=eq.${id}`
                },
                (payload) => {
                    // Refresh data when the status changes
                    fetchBooking();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, id]);

    if (!user || loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-10 h-10 border-4 border-[#2F2BFF]/20 border-t-[#2F2BFF] rounded-full animate-spin" />
        </div>
    );

    if (!booking) {
         router.push("/guest/bookings");
         return null;
    }

    const space = booking.spaces;

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    };

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        
        try {
            const { error } = await supabase
                .from("bookings")
                .update({ status: "cancelled" })
                .eq("id", booking.id);
            
            if (error) throw error;
            alert("Booking cancelled successfully.");
        } catch (error: any) {
            alert("Error cancelling booking: " + error.message);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !booking) return;

        setSubmittingReview(true);
        try {
            const { error } = await supabase
                .from("reviews")
                .insert([
                    {
                        space_id: booking.space_id,
                        user_id: user.id,
                        booking_id: booking.id,
                        rating: reviewRating,
                        comment: reviewComment
                    }
                ]);

            if (error) throw error;
            
            setAlreadyReviewed(true);
            alert("Thank you for your review!");
        } catch (error: any) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review: " + error.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'confirmed':
                return {
                    label: 'Confirmed Stay',
                    styles: 'bg-emerald-50 text-emerald-500 border-emerald-100'
                };
            case 'cancelled':
                return {
                    label: 'Cancelled',
                    styles: 'bg-slate-100 text-slate-500 border-slate-200'
                };
            default:
                return {
                    label: 'Awaiting Approval',
                    styles: 'bg-yellow-50 text-yellow-600 border-yellow-100'
                };
        }
    };

    const statusInfo = getStatusInfo(booking.status);

    return (
        <div className="w-full bg-[#F8FAFF] min-h-screen">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <GuestSidebar user={user} currentPage="bookings" />

                    <div className="flex-1">
                        {/* Header */}
                        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div className="text-left">
                                <Link href="/guest/bookings" className="text-[#2F2BFF] text-sm font-black mb-4 flex items-center gap-2 hover:underline">
                                    <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
                                    Back to Bookings
                                </Link>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Booking Details</h1>
                                <p className="text-slate-500 font-medium mt-1">Order #{booking.id}</p>
                            </div>
                            <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${statusInfo.styles}`}>
                                {statusInfo.label}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Space Card */}
                                <section className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-xl group">
                                    <div className="aspect-[21/9] overflow-hidden relative">
                                        <img src={space.images[0]} alt={space.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    </div>
                                    <div className="p-10">
                                        <div className="flex justify-between items-start gap-4 mb-6">
                                            <div className="text-left">
                                                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{space.title}</h2>
                                                <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[#2F2BFF] text-lg font-bold">location_on</span>
                                                    {space.location}
                                                </p>
                                            </div>
                                            <Link href={`/spaces/${space.id}`} className="text-[#2F2BFF] text-[10px] font-black uppercase tracking-widest hover:underline shrink-0 px-4 py-2 bg-blue-50 rounded-xl">View Page</Link>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-slate-50">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in</p>
                                                <p className="font-black text-slate-900">{formatDate(booking.start_time)}</p>
                                                <p className="text-xs font-bold text-slate-500">{formatTime(booking.start_time)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-out</p>
                                                <p className="font-black text-slate-900">{formatDate(booking.end_time)}</p>
                                                <p className="text-xs font-bold text-slate-500">{formatTime(booking.end_time)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guest</p>
                                                <p className="font-black text-slate-900">{user.name}</p>
                                                <p className="text-xs font-bold text-slate-500">Scheduled Visit</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                                                <p className="font-black text-slate-900 text-xl">₹{booking.total_price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* House Rules / Info */}
                                <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-900 mb-6">Important Information</h3>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                                    <span className="material-symbols-outlined">description</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 mb-1">Self Check-in</p>
                                                    <p className="text-xs font-medium text-slate-500">Check-in instructions will be available 24 hours before your stay.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                                    <span className="material-symbols-outlined">wifi</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 mb-1">WiFi Credentials</p>
                                                    <p className="text-xs font-medium text-slate-500">Access codes are provided upon arrival at the property.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Review Section */}
                                {booking.status === 'confirmed' && new Date(booking.end_time) < new Date() && !alreadyReviewed && !reviewLoading && (
                                    <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                                                <span className="material-symbols-outlined text-2xl font-black">rate_review</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900">How was your stay?</h3>
                                                <p className="text-sm font-medium text-slate-500">Share your experience with the community.</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Your Rating</label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setReviewRating(star)}
                                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                                                reviewRating >= star 
                                                                    ? "bg-amber-500 text-white shadow-lg shadow-amber-200" 
                                                                    : "bg-slate-50 text-slate-300 hover:bg-slate-100"
                                                            }`}
                                                        >
                                                            <span className={`material-symbols-outlined text-2xl ${reviewRating >= star ? 'fill-1' : ''}`}>star</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Your Experience</label>
                                                <textarea
                                                    value={reviewComment}
                                                    onChange={(e) => setReviewComment(e.target.value)}
                                                    placeholder="Tell us what you liked (or didn't like) about the space..."
                                                    className="w-full rounded-[20px] border-slate-200 focus:ring-[#2F2BFF] focus:border-[#2F2BFF] min-h-[120px] text-sm font-medium p-4 transition-all"
                                                    required
                                                ></textarea>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={submittingReview}
                                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-brand-gradient shadow-lg shadow-slate-200 transition-all disabled:opacity-50 active:scale-95"
                                            >
                                                {submittingReview ? "Submitting..." : "Submit Review"}
                                            </button>
                                        </form>
                                    </section>
                                )}

                                {alreadyReviewed && (
                                    <section className="bg-emerald-50 rounded-[40px] p-10 border border-emerald-100 shadow-sm flex items-center gap-6">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50">
                                            <span className="material-symbols-outlined text-2xl font-black">verified</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900">Review Submitted</h3>
                                            <p className="text-sm font-medium text-slate-600">Thank you for sharing your thoughts! Your review is now live on the property page.</p>
                                        </div>
                                    </section>
                                )}
                            </div>

                            {/* Right Content */}
                            <aside className="space-y-8">
                                {/* Actions Card */}
                                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                    <h4 className="text-lg font-black text-slate-900 mb-6">Management Actions</h4>
                                    <div className="space-y-3">
                                        <button className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-4 rounded-2xl font-black text-sm border border-slate-100 hover:bg-slate-100 active:scale-95 transition-all">
                                            <span className="material-symbols-outlined text-lg">map</span>
                                            Get Directions
                                        </button>
                                        <button className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-4 rounded-2xl font-black text-sm border border-slate-100 hover:bg-slate-100 active:scale-95 transition-all">
                                            <span className="material-symbols-outlined text-lg">download</span>
                                            Download Receipt
                                        </button>
                                        {booking.status !== 'cancelled' && (
                                            <div className="pt-4 mt-4 border-t border-slate-50">
                                                <button onClick={handleCancel} className="w-full text-rose-500 font-black text-[10px] uppercase tracking-widest hover:underline">Cancel Booking</button>
                                                <p className="text-[10px] font-bold text-slate-400 text-center mt-2 px-6">Free cancellation until 48 hours before stay.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
