"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LocationMap from "@/components/ui/LocationMap";
import { calculatePricing, PricingBreakdown } from "@/lib/pricing";

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
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
    availability?: any;
    allow_extra_guests?: boolean;
    extra_guest_price?: number;
    max_extra_guests?: number;
    is_pet_friendly?: boolean;
    lat?: number;
    lng?: number;
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
    const [checkInTime, setCheckInTime] = useState("10:00 AM");
    const [numberOfGuests, setNumberOfGuests] = useState(1);


    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [dateBookings, setDateBookings] = useState<any[]>([]);
    const [pricingOptions, setPricingOptions] = useState<any[]>([]);
    const [selectedPricing, setSelectedPricing] = useState<string>("non-refundable");

    const fetchReviews = async () => {
        const { data, error } = await supabase
            .from("reviews")
            .select(`
                *,
                profiles:user_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq("space_id", spaceId)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setReviews(data);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!spaceId) return;
            console.time(`load-space-${spaceId}`);
            setLoading(true);
            
            try {
                // Fetch everything needed for initial render in parallel
                console.time('supabase-parallel-fetch');
                const [year, month, day] = checkInDate.split('-').map(Number);
                const startOfDay = `${checkInDate}T00:00:00.000Z`;
                const endOfDay = `${checkInDate}T23:59:59.999Z`;

                const [spaceRes, reviewsRes, bookingsRes] = await Promise.all([
                    supabase
                        .from("spaces")
                        .select(`
                            *,
                            profiles:host_id (
                                full_name,
                                avatar_url
                            )
                        `)
                        .eq("id", spaceId)
                        .single(),
                    supabase
                        .from("reviews")
                        .select(`
                            *,
                            profiles:user_id (
                                full_name,
                                avatar_url
                            )
                        `)
                        .eq("space_id", spaceId)
                        .order("created_at", { ascending: false }),
                    supabase
                        .from("bookings")
                        .select("*")
                        .eq("space_id", spaceId)
                        .eq("status", "confirmed")
                        .gte("start_time", startOfDay)
                        .lte("start_time", endOfDay)
                ]);
                console.timeEnd('supabase-parallel-fetch');

                if (spaceRes.data) setSpace(spaceRes.data as Space);
                if (reviewsRes.data) setReviews(reviewsRes.data);
                if (bookingsRes.data) setDateBookings(bookingsRes.data);
            } catch (error) {
                console.error("Error fetching space data:", error);
            } finally {
                setLoading(false);
                console.timeEnd(`load-space-${spaceId}`);
            }
        };

        fetchData();

        // Real-time reviews
        const channel = supabase
            .channel(`public:reviews:space_id=eq.${spaceId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'reviews',
                    filter: `space_id=eq.${spaceId}`
                },
                () => {
                    fetchReviews();
                    // We don't necessarily need to re-fetch the whole space on every review change
                    // unless we want to update the aggregate rating immediately.
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [spaceId]);

    // Refetch bookings when date changes (after initial load)
    useEffect(() => {
        const fetchDateBookings = async () => {
            if (!spaceId || !checkInDate || loading) return;

            console.time(`fetch-bookings-${checkInDate}`);
            const startOfDay = `${checkInDate}T00:00:00.000Z`;
            const endOfDay = `${checkInDate}T23:59:59.999Z`;

            const { data, error } = await supabase
                .from("bookings")
                .select("*")
                .eq("space_id", spaceId)
                .eq("status", "confirmed")
                .gte("start_time", startOfDay)
                .lte("start_time", endOfDay);

            if (!error && data) {
                setDateBookings(data);
            }
            console.timeEnd(`fetch-bookings-${checkInDate}`);
        };

        fetchDateBookings();
    }, [spaceId, checkInDate, loading]);

    // Handle time reset and pricing update when date/time changes
    useEffect(() => {
        if (!space) return;
        
        // Robust date parsing to avoid timezone shifts (checkInDate is YYYY-MM-DD)
        const [year, month, day] = checkInDate.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        const availability = space.availability || {};
        const dayAvailability = availability[dayOfWeek];
        
        if (dayAvailability?.open) {
            // Helper to parse time
            const parseTime = (t: string) => {
                const [time, period] = t.split(' ');
                let [h] = time.split(':').map(Number);
                if (period === 'PM' && h !== 12) h += 12;
                if (period === 'AM' && h === 12) h = 0;
                return h;
            };

            const startH = parseTime(dayAvailability.start);
            const formatTime = (h: number) => {
                const period = h >= 12 ? 'PM' : 'AM';
                let displayH = h % 12;
                if (displayH === 0) displayH = 12;
                return `${displayH.toString().padStart(2, '0')}:00 ${period}`;
            };
            
            // Generate valid slots considering buffer
            const bookedHours = dateBookings.map(b => {
                const start = new Date(b.start_time).getHours();
                const end = new Date(b.end_time).getHours();
                return { start, end };
            });

            let firstValidH = -1;
            const endH = parseTime(dayAvailability.end);
            for (let h = startH; h < endH; h++) {
                const isBooked = bookedHours.some(b => h >= b.start && h < b.end);
                const isBuffer = bookedHours.some(b => h === b.end); // 1-hour buffer after booking
                if (!isBooked && !isBuffer) {
                    firstValidH = h;
                    break;
                }
            }

            if (firstValidH !== -1) {
                setCheckInTime(formatTime(firstValidH));
            } else {
                setCheckInTime("");
            }
        } else {
            setCheckInTime("");
        }
    }, [checkInDate, space?.availability, dateBookings]);

    // Calculate dynamic pricing options
    useEffect(() => {
        if (!checkInTime || !space) return;

        const parts = checkInTime.split(' ');
        let [hours] = parts[0].split(':').map(Number);
        const period = parts[1];
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        const bookingStartTime = new Date(`${checkInDate}T${hours.toString().padStart(2, '0')}:00:00`);
        const now = new Date();
        const leadTimeHours = (bookingStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        const extraGuestsCount = Math.max(0, numberOfGuests - (space.capacity || 0));
        const extraGuestFee = extraGuestsCount * (space.extra_guest_price || 0) * duration;
        const rawBasePrice = (space.price_per_hour * duration) + extraGuestFee;
        
        const options = [];

        if (leadTimeHours < 2) {
            const pricing = calculatePricing(rawBasePrice);
            options.push({
                id: 'non-refundable',
                label: 'Last Minute (Non-refundable)',
                pricing: pricing,
                refundable: false
            });
        } else if (leadTimeHours >= 3 && leadTimeHours <= 5) {
            const pricingNonRef = calculatePricing(rawBasePrice * 0.95);
            options.push({
                id: 'non-refundable',
                label: 'Save 5% (Non-refundable)',
                pricing: pricingNonRef,
                refundable: false
            });
            
            const pricingRef = calculatePricing(rawBasePrice * 1.1);
            options.push({
                id: 'refundable',
                label: 'Flexible (Refundable + 10% Fee)',
                pricing: pricingRef,
                refundable: true
            });
        } else {
            const pricingStandard = calculatePricing(rawBasePrice);
            options.push({
                id: 'non-refundable',
                label: 'Standard (Non-refundable)',
                pricing: pricingStandard,
                refundable: false
            });
        }

        setPricingOptions(options);
        if (options.length > 0 && !options.find(o => o.id === selectedPricing)) {
            setSelectedPricing(options[0].id);
        }
    }, [checkInDate, checkInTime, duration, space, numberOfGuests]);

    const handleBooking = async () => {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        if (!space) return;
        if (!checkInTime) {
            alert("Please select a valid time.");
            return;
        }

        setBookingLoading(true);
        
        try {
            // Parse the selected check-in time
            const parts = checkInTime.split(' ');
            if (parts.length < 2) throw new Error("Invalid time format");
            
            const [time, period] = parts;
            let [hours, minutes] = time.split(':').map(Number);
            
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const startTime = new Date(`${checkInDate}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
            
            // Check if booking is in the past
            if (startTime.getTime() < new Date().getTime()) {
                alert("You cannot book a time in the past. Please select a future time.");
                setBookingLoading(false);
                return;
            }

            const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

            const selectedOption = pricingOptions.find(o => o.id === selectedPricing) || pricingOptions[0];

            const { error } = await supabase
                .from("bookings")
                .insert([
                    {
                        space_id: space.id,
                        user_id: user.id,
                        start_time: startTime.toISOString(),
                        end_time: endTime.toISOString(),
                        total_price: selectedOption.pricing.totalGuestPrice,
                        base_price: selectedOption.pricing.basePrice,
                        guest_service_fee: selectedOption.pricing.guestServiceFee,
                        host_gst_amount: selectedOption.pricing.hostGstAmount,
                        platform_commission_from_host: selectedOption.pricing.platformCommissionFromHost,
                        platform_gst_on_commission: selectedOption.pricing.platformGstOnCommission,
                        host_payout_amount: selectedOption.pricing.hostPayoutAmount,
                        platform_net_earnings: selectedOption.pricing.platformNetEarnings,
                        status: 'pending',
                        metadata: {
                            refundable: selectedOption.refundable,
                            pricing_label: selectedOption.label,
                            guests: numberOfGuests
                        }
                    }
                ]);

            if (error) {
                console.error("Booking error:", error);
                alert("Could not process booking: " + error.message);
            } else {
                setBookingSuccess(true);
            }
        } catch (err: any) {
            console.error("Booking fatal error:", err);
            alert("An error occurred: " + err.message);
        } finally {
            setBookingLoading(false);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push("/auth/login");
            return;
        }

        setSubmittingReview(true);
        const { error } = await supabase
            .from("reviews")
            .insert([
                {
                    space_id: spaceId,
                    user_id: user.id,
                    rating: reviewRating,
                    comment: reviewComment
                }
            ]);

        if (!error) {
            setReviewComment("");
            setReviewRating(5);
        }
        setSubmittingReview(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-[#2F2BFF]/20 border-t-[#2F2BFF] rounded-full animate-spin" />
            </div>
        );
    }

    if (!space) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                <h1 className="text-2xl font-black mb-4">Space not found</h1>
                <Link href="/search" className="text-[#2F2BFF] font-bold hover:underline">Back to search</Link>
            </div>
        );
    }
    return (
        <div className="bg-[#F8FAFF] min-h-screen text-slate-900">
            <main className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-20 py-8">
                {/* Hero Section / Image Gallery */}
                <section className="mb-10 grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[500px]">
                    {(() => {
                        const typeFallbacks: { [key: string]: string } = {
                            villa: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                            studio: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
                            cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
                            rooftop: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88",
                            default: "https://images.unsplash.com/photo-1497366216548-37526070297c"
                        };
                        const fallback = (typeFallbacks[space.type.toLowerCase()] || typeFallbacks.default) + "?q=80&w=1000&auto=format&fit=crop";
                        
                        // Main Image
                        const mainImg = (space.images && space.images.length > 0 && !space.images[0].startsWith('blob:')) 
                            ? space.images[0] 
                            : fallback;

                        // Grid Images (up to 4 more)
                        const gridImages = (space.images || []).slice(1, 5).filter(img => !img.startsWith('blob:'));
                        const hasMoreImages = gridImages.length > 0;
                        
                        return (
                            <>
                                <div className={`${hasMoreImages ? 'md:col-span-2' : 'md:col-span-4'} md:row-span-2 relative overflow-hidden rounded-xl bg-slate-200`}>
                                    <img
                                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                        alt={space.title}
                                        src={mainImg}
                                        onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                                    />
                                    <button className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm hover:bg-white transition-colors">
                                        <span className="material-symbols-outlined text-sm">grid_view</span> View all photos
                                    </button>
                                </div>
                                {gridImages.length > 0 && gridImages.map((img, idx) => (
                                    <div key={idx} className="hidden md:block overflow-hidden rounded-xl bg-slate-200">
                                        <img 
                                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" 
                                            alt={`${space.title} ${idx + 2}`} 
                                            src={img}
                                            onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                                        />
                                    </div>
                                ))}
                            </>
                        );
                    })()}
                </section>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content Column */}
                    <div className="flex-1">
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{space.title}</h1>
                                <button className="p-2 rounded-full hover:bg-[#2F2BFF]/10 border border-slate-200 transition-colors">
                                    <span className="material-symbols-outlined">share</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[#2F2BFF] text-lg fill-1">star</span> {Number(space.rating).toFixed(1)} · {space.reviews_count} reviews
                                </span>
                                <span>·</span>
                                <span className="flex items-center gap-1 hover:text-[#2F2BFF] transition-colors cursor-pointer" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(space.location)}`, '_blank')}>
                                    <span className="material-symbols-outlined text-lg">location_on</span> {space.location}
                                </span>
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-200 my-8"></div>

                        {/* Host Section */}
                        <div className="flex items-center gap-4 mb-8">
                            <div
                                className="h-14 w-14 rounded-full bg-cover bg-center border border-slate-100 shadow-sm bg-slate-100 overflow-hidden"
                            >
                                <img 
                                    src={
                                        (Array.isArray(space.profiles) ? space.profiles[0]?.avatar_url : space.profiles?.avatar_url) || 
                                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${(Array.isArray(space.profiles) ? space.profiles[0]?.full_name : space.profiles?.full_name) || 'Host'}`
                                    } 
                                    alt={(Array.isArray(space.profiles) ? space.profiles[0]?.full_name : space.profiles?.full_name) || 'Host'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { 
                                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${(Array.isArray(space.profiles) ? space.profiles[0]?.full_name : space.profiles?.full_name) || 'Host'}`; 
                                    }}
                                />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900">Hosted by {(Array.isArray(space.profiles) ? space.profiles[0]?.full_name : space.profiles?.full_name) || 'Host'}</p>
                                <p className="text-sm text-slate-500 font-medium">Joined in 2024</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-10">
                            <p className="text-lg leading-relaxed text-slate-600 font-medium">
                                {space.description}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div className="mb-12">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#2F2BFF]">category</span>
                                Facilities & Amenities
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                {space.amenities && space.amenities.map((amenityId: string) => {
                                    const amenitiesMap: { [key: string]: { label: string, icon: string } } = {
                                        wifi: { label: 'Fast WiFi', icon: 'wifi' },
                                        parking: { label: 'Free Parking', icon: 'local_parking' },
                                        ac: { label: 'Air Conditioning', icon: 'ac_unit' },
                                        power: { label: 'Power Backup', icon: 'battery_charging_full' },
                                        kitchen: { label: 'Kitchen', icon: 'countertops' },
                                        coffee: { label: 'Coffee', icon: 'coffee' },
                                        tv: { label: 'TV', icon: 'tv' },
                                        projector: { label: 'Projector', icon: 'videocam' },
                                        whiteboard: { label: 'Whiteboard', icon: 'edit_note' },
                                        cctv: { label: 'Security CCTV', icon: 'videocam' }
                                    };
                                    const amenity = amenitiesMap[amenityId];
                                    if (!amenity) return null;
                                    return (
                                        <div key={amenityId} className="flex items-center gap-4 group">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-[#2F2BFF]/5 group-hover:border-[#2F2BFF]/20 transition-all">
                                                <span className="material-symbols-outlined text-slate-500 group-hover:text-[#2F2BFF] transition-colors">{amenity.icon}</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{amenity.label}</span>
                                        </div>
                                    );
                                })}

                                {space.is_pet_friendly && (
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 group-hover:bg-orange-100 transition-all">
                                            <span className="material-symbols-outlined text-orange-500">pets</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Pet Friendly</span>
                                    </div>
                                )}
                            </div>
                            {(!space.amenities || space.amenities.length === 0) && !space.is_pet_friendly && (
                                <p className="text-sm font-medium text-slate-400">No specific amenities listed for this space.</p>
                            )}
                        </div>

                        {/* Location Map */}
                        <div className="mb-12">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#2F2BFF]">location_on</span>
                                Location
                            </h3>
                            <div className="h-80 w-full overflow-hidden border border-slate-200 rounded-3xl shadow-sm bg-slate-100">
                                <LocationMap 
                                    lat={space.lat || 19.0760} 
                                    lng={space.lng || 72.8777} 
                                    zoom={space.lat ? 15 : 12}
                                    className="h-full w-full"
                                />
                            </div>
                            <p className="mt-4 text-sm font-medium text-slate-500">
                                Exact location provided after booking.
                            </p>
                        </div>



                        <div className="h-px w-full bg-slate-200 my-8"></div>

                        {/* Reviews Section */}
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-8">
                                <span className="material-symbols-outlined text-[#2F2BFF] text-2xl fill-1">star</span>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{Number(space.rating).toFixed(1)} · {space.reviews_count} reviews</h3>
                            </div>

                            {/* Review Form */}
                            {user && (
                                <div className="mb-12 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                    <h4 className="text-lg font-bold mb-4">Leave a review</h4>
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className="mb-4">
                                            <div className="flex gap-2 mb-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setReviewRating(star)}
                                                        className={`material-symbols-outlined text-2xl transition-colors ${reviewRating >= star ? "text-amber-500 fill-1" : "text-slate-300"}`}
                                                    >
                                                        star
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <textarea
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Tell us about your experience..."
                                            className="w-full rounded-xl border-slate-200 focus:ring-[#2F2BFF] focus:border-[#2F2BFF] min-h-[100px] mb-4 text-sm font-medium"
                                            required
                                        ></textarea>
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-gradient transition-colors disabled:opacity-50"
                                        >
                                            {submittingReview ? "Submitting..." : "Submit Review"}
                                        </button>
                                    </form>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <div key={review.id} className="flex flex-col gap-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-10 w-10 rounded-full bg-slate-200 bg-cover bg-center border border-slate-100"
                                                    style={{ backgroundImage: `url('${review.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${review.user_id}`}')` }}
                                                ></div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{review.profiles?.full_name || 'Guest'}</p>
                                                    <p className="text-xs text-slate-500 font-medium">
                                                        {new Date(review.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5 mb-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span key={i} className={`material-symbols-outlined text-xs ${i < review.rating ? "text-amber-500 fill-1" : "text-slate-200"}`}>star</span>
                                                ))}
                                            </div>
                                            <p className="text-slate-600 leading-relaxed font-medium">"{review.comment}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                                        <p className="text-slate-400 font-bold">No reviews yet. Be the first to review!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sticky Booking Widget */}
                    <aside className="w-full lg:w-96">
                        <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-[#2F2BFF]/5">
                            {bookingSuccess ? (
                                <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                        <span className="material-symbols-outlined text-4xl font-black">check_circle</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Booking Requested!</h3>
                                    <p className="text-slate-500 font-medium mb-8">The host has been notified. You can track your request in your dashboard.</p>
                                    <Link 
                                        href="/guest/dashboard" 
                                        className="inline-block w-full py-4 bg-brand-gradient text-white font-black rounded-xl hover:opacity-90 active:scale-95 shadow-lg shadow-[#2F2BFF]/20 transition-all text-center"
                                    >
                                        Go to Dashboard
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-end gap-1 mb-6">
                                        <span className="text-3xl font-black text-[#2F2BFF]">₹{space.price_per_hour.toLocaleString()}</span>
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
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => setCheckInDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="p-3 hover:bg-slate-50 transition-colors">
                                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Start Time</label>
                                                {(() => {
                                                    const dateObj = new Date(checkInDate + 'T00:00:00');
                                                    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                                                    const dayAvailability = (space.availability || {})[dayOfWeek];
                                                    
                                                    if (!dayAvailability || !dayAvailability.open) {
                                                        return <div className="text-sm font-bold text-red-500 italic">Closed</div>;
                                                    }

                                                    const parseTime = (t: string) => {
                                                        const [time, period] = t.split(' ');
                                                        let [h] = time.split(':').map(Number);
                                                        if (period === 'PM' && h !== 12) h += 12;
                                                        if (period === 'AM' && h === 12) h = 0;
                                                        return h;
                                                    };

                                                    const formatTime = (h: number) => {
                                                        const period = h >= 12 ? 'PM' : 'AM';
                                                        let displayH = h % 12;
                                                        if (displayH === 0) displayH = 12;
                                                        return `${displayH.toString().padStart(2, '0')}:00 ${period}`;
                                                    };

                                                    const startH = parseTime(dayAvailability.start);
                                                    const endH = parseTime(dayAvailability.end);
                                                    const now = new Date();
                                                    const todayStr = now.toISOString().split('T')[0];
                                                    const currentH = now.getHours();

                                                    const bookedHours = dateBookings.map(b => ({
                                                        start: new Date(b.start_time).getHours(),
                                                        end: new Date(b.end_time).getHours()
                                                    }));

                                                    const availableSlots = [];
                                                    for (let h = startH; h < endH; h++) {
                                                        if (checkInDate === todayStr && h <= currentH) continue;
                                                        const isBooked = bookedHours.some(b => h >= b.start && h < b.end);
                                                        const isBuffer = bookedHours.some(b => h === b.end);
                                                        if (!isBooked && !isBuffer) {
                                                            availableSlots.push(formatTime(h));
                                                        }
                                                    }

                                                    if (availableSlots.length === 0) return <div className="text-xs font-bold text-red-500">None</div>;

                                                    return (
                                                        <select 
                                                            className="w-full border-none p-0 text-sm font-bold bg-transparent focus:ring-0 text-slate-900"
                                                            value={checkInTime}
                                                            onChange={(e) => setCheckInTime(e.target.value)}
                                                        >
                                                            {availableSlots.map(slot => (
                                                                <option key={slot} value={slot}>{slot}</option>
                                                            ))}
                                                        </select>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        {(() => {
                                            const dateObj = new Date(checkInDate + 'T00:00:00');
                                            const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                                            const dayAvailability = (space.availability || {})[dayOfWeek];
                                            if (dayAvailability?.open) {
                                                return (
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
                                                );
                                            }
                                            return null;
                                        })()}
                                        
                                        <div className="p-3 border-t border-slate-300 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Guests</label>
                                                    <div className="text-sm font-bold text-slate-900">{numberOfGuests} {numberOfGuests === 1 ? 'Guest' : 'Guests'}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
                                                        className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">remove</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => setNumberOfGuests(prev => {
                                                            const max = space.allow_extra_guests 
                                                                ? space.capacity + (space.max_extra_guests || 0) 
                                                                : space.capacity;
                                                            return Math.min(max, prev + 1);
                                                        })}
                                                        className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">add</span>
                                                    </button>
                                                </div>
                                            </div>
                                            {numberOfGuests > space.capacity && (
                                                <p className="mt-2 text-[10px] font-bold text-[#2F2BFF]">
                                                    + ₹{space.extra_guest_price?.toLocaleString()} per extra guest / hour
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pricing Options UI */}
                                    {pricingOptions.length > 0 && (
                                        <div className="mb-6 space-y-3">
                                            <p className="text-[10px] font-black uppercase text-slate-500">Choice of Rate</p>
                                            <div className="flex flex-col gap-2">
                                                {pricingOptions.map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => setSelectedPricing(option.id)}
                                                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                                                            selectedPricing === option.id
                                                                ? "border-[#2F2BFF] bg-[#2F2BFF]/5"
                                                                : "border-slate-100 hover:border-slate-200"
                                                        }`}
                                                    >
                                                        <div className="text-left">
                                                            <p className={`text-xs font-black ${selectedPricing === option.id ? "text-[#2F2BFF]" : "text-slate-900"}`}>{option.label}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold">{option.refundable ? "Full refund if cancelled" : "No refund once confirmed"}</p>
                                                        </div>
                                                        <p className="text-sm font-black text-slate-900">₹{option.pricing.totalGuestPrice.toLocaleString()}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(() => {
                                        const dateObj = new Date(checkInDate + 'T00:00:00');
                                        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                                        const dayAvailability = (space.availability || {})[dayOfWeek];
                                        const isOpen = dayAvailability?.open;
                                        const currentPricing = (pricingOptions.find(o => o.id === selectedPricing) || pricingOptions[0])?.pricing;

                                        return (
                                            <>
                                                <button 
                                                    onClick={handleBooking}
                                                    disabled={bookingLoading || !isOpen}
                                                    className={`w-full rounded-xl py-4 text-center font-black text-white transition-all shadow-lg transform active:scale-[0.98] flex items-center justify-center gap-2 ${
                                                        isOpen 
                                                        ? "bg-brand-gradient hover:brightness-110 shadow-[#2F2BFF]/30" 
                                                        : "bg-slate-300 cursor-not-allowed shadow-none"
                                                    }`}
                                                >
                                                    {bookingLoading ? (
                                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                    ) : isOpen ? (
                                                        "Request to Book"
                                                    ) : (
                                                        "Not Available on this Day"
                                                    )}
                                                </button>

                                                {isOpen && currentPricing && (
                                                    <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-slate-500 font-medium">₹{space.price_per_hour.toLocaleString()} x {duration} hrs</span>
                                                            <span className="font-bold text-slate-900">₹{currentPricing.basePrice.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <div className="flex items-center gap-1 group relative">
                                                                <span className="text-slate-500 font-medium border-b border-dashed border-slate-300">Service fee</span>
                                                                <span className="material-symbols-outlined text-[14px] text-slate-300 cursor-help">info</span>
                                                            </div>
                                                            <span className="font-bold text-slate-900">+ ₹{currentPricing.guestServiceFee.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-slate-500 font-medium border-b border-dashed border-slate-300">Taxes (GST)</span>
                                                            </div>
                                                            <span className="font-bold text-slate-900">+ ₹{currentPricing.hostGstAmount.toLocaleString()}</span>
                                                        </div>
                                                        <div className="h-px bg-slate-100 my-2"></div>
                                                        <div className="flex justify-between items-center font-black text-xl text-slate-900">
                                                            <span>Total</span>
                                                            <span className="text-[#2F2BFF]">₹{currentPricing.totalGuestPrice.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}

                                    <div className="mt-8 flex items-center gap-4 p-4 rounded-xl bg-[#2F2BFF]/5 text-[#2F2BFF] border border-[#2F2BFF]/10">
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
