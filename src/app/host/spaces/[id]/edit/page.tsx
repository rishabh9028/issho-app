"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Upload, X, MapPin, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("@/components/ui/LocationMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-zinc-100 animate-pulse rounded-xl flex items-center justify-center"><span className="material-symbols-outlined text-zinc-300">map</span></div>
});
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import Link from "next/link";

export default function EditSpacePage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        type: "Villa",
        capacity: "2",
        description: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        price: "0.00",
        images: [] as string[],
        availability: {
            monday: { open: true, start: "09:00 AM", end: "05:00 PM" },
            tuesday: { open: true, start: "09:00 AM", end: "05:00 PM" },
            wednesday: { open: true, start: "09:00 AM", end: "05:00 PM" },
            thursday: { open: true, start: "09:00 AM", end: "05:00 PM" },
            friday: { open: true, start: "09:00 AM", end: "05:00 PM" },
            saturday: { open: false, start: "10:00 AM", end: "04:00 PM" },
            sunday: { open: false, start: "10:00 AM", end: "04:00 PM" },
        },
        allowExtraGuests: false,
        extraGuestPrice: "0.00",
        maxExtraGuests: "0",
        amenities: [] as string[],
        isPetFriendly: false,
        lat: 0,
        lng: 0
    });

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
            return;
        }
        
        if (user.role !== "host" && user.role !== "admin") {
            router.push("/");
            return;
        }

        const fetchSpace = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { data, error } = await supabase
                .from("spaces")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                console.error("Error fetching space:", error);
                router.push("/host/spaces");
                return;
            }

            // Parse location (Street, City, State Zip)
            // Example: "123 Main St, San Francisco, CA 94107"
            const locParts = data.location.split(", ");
            const stateZip = locParts[2]?.split(" ") || ["", ""];

            setFormData({
                title: data.title,
                type: data.type.charAt(0).toUpperCase() + data.type.slice(1),
                capacity: data.capacity.toString(),
                description: data.description || "",
                address: locParts[0] || "",
                city: locParts[1] || "",
                state: stateZip[0] || "",
                zip: stateZip[1] || "",
                price: data.price_per_hour.toString(),
                images: data.images || [],
                availability: data.availability || formData.availability,
                allowExtraGuests: data.allow_extra_guests || false,
                extraGuestPrice: (data.extra_guest_price || 0).toString(),
                maxExtraGuests: (data.max_extra_guests || 0).toString(),
                amenities: data.amenities || [],
                isPetFriendly: data.is_pet_friendly || false,
                lat: data.lat || 0,
                lng: data.lng || 0
            });
            setLoading(false);
        };

        fetchSpace();
    }, [user, router, id]);

    if (!user || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F8FAFF]">
                <div className="w-10 h-10 border-4 border-[#2F2BFF]/20 border-t-[#2F2BFF] rounded-full animate-spin" />
            </div>
        );
    }

    const nextStep = () => setStep(s => Math.min(s + 1, 6));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const updateHours = (day: string, type: 'start' | 'end', value: string) => {
        setFormData(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day as keyof typeof prev.availability],
                    [type]: value
                }
            }
        }));
    };

    const timeSlots = [
        "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
        "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"
    ];

    const removeImage = (index: number) => {
        const imageUrl = formData.images[index];
        
        // If it's a new upload (blob), we need to remove it from uploadedFiles too
        if (imageUrl.startsWith('blob:')) {
            // Find its relative index among blob images
            const blobImages = formData.images.filter(img => img.startsWith('blob:'));
            const blobIndex = blobImages.indexOf(imageUrl);
            setUploadedFiles(prev => prev.filter((_, i) => i !== blobIndex));
        }

        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setUploadedFiles(prev => [...prev, ...files]);
            
            // Generate local preview URLs
            const newImageUrls = files.map(file => URL.createObjectURL(file));
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImageUrls]
            }));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            // Upload actual new files to Supabase Storage
            const uploadImagesToSupabase = async (files: File[]) => {
                const urls = [];
                for (const file of files) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError, data } = await supabase.storage
                        .from('spaces')
                        .upload(filePath, file);

                    if (uploadError) {
                        console.error('Upload error:', uploadError);
                        continue;
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('spaces')
                        .getPublicUrl(filePath);
                    
                    urls.push(publicUrl);
                }
                return urls;
            };

            const newPublicUrls = await uploadImagesToSupabase(uploadedFiles);
            
            // Merge existing permanent URLs with the new uploaded URLs
            // We need to preserve the order from formData.images
            let uploadCount = 0;
            const finalImages = formData.images.map(img => {
                if (img.startsWith('blob:')) {
                    return newPublicUrls[uploadCount++] || img;
                }
                return img;
            });

            const { error } = await supabase
                .from("spaces")
                .update({
                    title: formData.title,
                    description: formData.description,
                    price_per_hour: parseFloat(formData.price),
                    location: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`,
                    capacity: parseInt(formData.capacity),
                    type: formData.type.toLowerCase(),
                    images: finalImages,
                    availability: formData.availability,
                    allow_extra_guests: formData.allowExtraGuests,
                    extra_guest_price: parseFloat(formData.extraGuestPrice),
                    max_extra_guests: parseInt(formData.maxExtraGuests.toString()),
                    amenities: formData.amenities,
                    is_pet_friendly: formData.isPetFriendly,
                    lat: formData.lat,
                    lng: formData.lng
                })
                .eq("id", id);

            if (error) throw error;
            router.push("/host/spaces");
        } catch (error) {
            console.error("Error updating space:", error);
            alert("Failed to update the listing. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleDay = (day: string) => {
        setFormData(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day as keyof typeof prev.availability],
                    open: !prev.availability[day as keyof typeof prev.availability].open
                }
            }
        }));
    };

    const renderStepHeader = () => {
        const stepTitles = ["Basics", "Location", "Pricing", "Photos", "Availability", "Review"];
        const progress = (step / 6) * 100;

        return (
            <div className="mb-12">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2F2BFF]">Step {step} of 6</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stepTitles[step - 1]}: {Math.round(progress)}% Complete</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-gradient transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between mt-4">
                    {stepTitles.map((t, i) => (
                        <span key={t} className={`text-[10px] font-black uppercase tracking-widest ${i + 1 <= step ? "text-slate-900" : "text-slate-300"}`}>
                            {i + 1}. {t}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-left">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Update your space details</h1>
                            <p className="text-lg text-slate-500 font-medium">Review and adjust the core information about your listing.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="text-left">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Space Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold placeholder:font-medium placeholder:text-slate-300 focus:outline-none focus:border-[#2F2BFF] focus:ring-4 focus:ring-[#2F2BFF]/5 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Space Type</label>
                                    <div className="relative">
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold appearance-none focus:outline-none focus:border-[#2F2BFF] transition-all"
                                        >
                                            <option>Villa</option>
                                            <option>Studio</option>
                                            <option>Rooftop</option>
                                            <option>Cafe</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_content</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Guest Capacity</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                            className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#2F2BFF] transition-all"
                                        />
                                        <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">groups</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-left">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Description</label>
                                <textarea
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-3xl p-6 text-base font-bold placeholder:font-medium placeholder:text-slate-300 focus:outline-none focus:border-[#2F2BFF] transition-all resize-none"
                                ></textarea>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-base font-black text-slate-900">Allow Extra Guests</h3>
                                        <p className="text-xs text-slate-500 font-medium">Charge a fee for guests exceeding standard capacity.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer scale-110">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.allowExtraGuests} 
                                            onChange={(e) => setFormData({ ...formData, allowExtraGuests: e.target.checked })}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gradient"></div>
                                    </label>
                                </div>

                                {formData.allowExtraGuests && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Price per extra guest</label>
                                            <div className="relative group">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg group-focus-within:text-[#2F2BFF] transition-colors">₹</span>
                                                <input
                                                    type="text"
                                                    value={formData.extraGuestPrice}
                                                    onChange={e => setFormData({...formData, extraGuestPrice: e.target.value})}
                                                    className="w-full h-16 bg-white border border-slate-200 rounded-2xl pl-12 pr-16 text-xl font-black text-slate-900 focus:outline-none focus:border-[#2F2BFF] transition-all"
                                                    placeholder="0.00"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">/ guest</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Max extra guests allowed</label>
                                            <div className="relative group">
                                                <input
                                                    type="number"
                                                    value={formData.maxExtraGuests}
                                                    onChange={e => setFormData({...formData, maxExtraGuests: e.target.value})}
                                                    className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-xl font-black text-slate-900 focus:outline-none focus:border-[#2F2BFF] transition-all"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">groups_3</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Amenities */}
                            <div className="space-y-6">
                                <div className="text-left">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Facilities available</h3>
                                    <p className="text-sm text-slate-500 font-medium mb-6">Select all the amenities your space offers.</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { id: 'wifi', label: 'Fast WiFi', icon: 'wifi' },
                                        { id: 'parking', label: 'Free Parking', icon: 'local_parking' },
                                        { id: 'ac', label: 'Air Conditioning', icon: 'ac_unit' },
                                        { id: 'power', label: 'Power Backup', icon: 'battery_charging_full' },
                                        { id: 'kitchen', label: 'Kitchen', icon: 'countertops' },
                                        { id: 'coffee', label: 'Coffee', icon: 'coffee' },
                                        { id: 'tv', label: 'TV', icon: 'tv' },
                                        { id: 'projector', label: 'Projector', icon: 'videocam' },
                                        { id: 'whiteboard', label: 'Whiteboard', icon: 'edit_note' },
                                        { id: 'cctv', label: 'Security CCTV', icon: 'videocam' }
                                    ].map((amenity) => (
                                        <button
                                            key={amenity.id}
                                            type="button"
                                            onClick={() => {
                                                const current = formData.amenities;
                                                const updated = current.includes(amenity.id)
                                                    ? current.filter(id => id !== amenity.id)
                                                    : [...current, amenity.id];
                                                setFormData({ ...formData, amenities: updated });
                                            }}
                                            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3 ${
                                                formData.amenities.includes(amenity.id)
                                                    ? "border-[#2F2BFF] bg-[#2F2BFF]/5 text-[#2F2BFF]"
                                                    : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                                            }`}
                                        >
                                            <span className={`material-symbols-outlined text-2xl ${formData.amenities.includes(amenity.id) ? "fill-1" : ""}`}>
                                                {amenity.icon}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest tracking-tight text-center">{amenity.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pet Friendly */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-orange-500">pets</span>
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <h3 className="text-base font-black text-slate-900">Pet Friendly</h3>
                                            <p className="text-xs text-slate-500 font-medium">Are furry friends allowed in your space?</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer scale-110">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.isPetFriendly} 
                                            onChange={(e) => setFormData({ ...formData, isPetFriendly: e.target.checked })}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                // Real location step for edit
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-left">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Property Location</h1>
                            <p className="text-lg text-slate-500 font-medium">Verify your property's address and map pin location.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="h-80 w-full overflow-hidden border border-slate-100 rounded-[2.5rem] shadow-sm">
                                <LocationMap 
                                    lat={formData.lat || 19.0760} 
                                    lng={formData.lng || 72.8777} 
                                    zoom={formData.lat ? 17 : 4}
                                    interactive={true}
                                    onPinChange={(lat, lng) => setFormData({ ...formData, lat, lng })}
                                    className="h-full w-full"
                                />
                            </div>
                            <div className="space-y-6">
                                <div className="text-left">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Street Address</label>
                                    <AddressAutocomplete
                                        value={formData.address ? { label: formData.address, value: formData.address } : null}
                                        onSelect={(data) => {
                                            // Extract components
                                            let city = "";
                                            let state = "";
                                            let zip = "";
                                            
                                            data.addressComponents.forEach(comp => {
                                                if (comp.types.includes("locality")) city = comp.long_name;
                                                if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
                                                if (comp.types.includes("postal_code")) zip = comp.long_name;
                                            });

                                            setFormData({
                                                ...formData,
                                                address: data.label,
                                                city,
                                                state,
                                                zip,
                                                lat: data.coordinates.lat,
                                                lng: data.coordinates.lng
                                            });
                                        }}
                                        placeholder="Verify your address..."
                                        className="address-autocomplete-host"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">City</label>
                                        <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-base font-bold text-slate-600 cursor-not-allowed" disabled />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">State</label>
                                            <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-base font-bold text-slate-600 cursor-not-allowed" disabled />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">ZIP</label>
                                            <input type="text" value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-base font-bold text-slate-600 cursor-not-allowed" disabled />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-blue-500/5 text-left">
                            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Pricing & Finance</h2>
                            <p className="text-base text-slate-500 font-medium mb-10">Adjust your hourly rate and explore revenue estimates.</p>

                            <div className="space-y-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Hourly Rate</h3>
                                    <div className="relative group max-w-sm">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg group-focus-within:text-[#2F2BFF] transition-colors">₹</span>
                                        <input
                                            type="text"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full h-16 bg-white border border-slate-200 rounded-2xl pl-12 pr-16 text-xl font-black text-slate-900 focus:outline-none focus:border-[#2F2BFF] transition-all"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">/ hr</span>
                                    </div>
                                </div>

                                <div className="bg-[#2F2BFF]/5 p-8 rounded-[32px] border border-[#2F2BFF]/10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[#2F2BFF] shadow-sm">
                                                <span className="material-symbols-outlined font-black">finance_mode</span>
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-900">Revenue Estimation</p>
                                                <p className="text-sm font-medium text-slate-500">Based on your new rate and historical demand.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Goal</p>
                                            <p className="text-2xl font-black text-slate-900">₹2,450.00</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Payout</p>
                                            <p className="text-2xl font-black text-[#2F2BFF]">₹{(parseFloat(formData.price) * 0.97).toFixed(2)}/hr</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-blue-500/5 text-left">
                            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Gallery Management</h2>
                            <p className="text-base text-slate-500 font-medium mb-10">Update your photos to keep your listing fresh and attractive.</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {formData.images.map((img, i) => (
                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 relative group">
                                        <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="p" />
                                        <button 
                                            onClick={() => removeImage(i)}
                                            className="absolute top-2 right-2 h-8 w-8 bg-black/50 text-white rounded-lg backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                ))}
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-[#2F2BFF] hover:text-[#2F2BFF] cursor-pointer transition-all"
                                >
                                    <span className="material-symbols-outlined text-3xl mb-2">add_photo_alternate</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Add more</span>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-blue-500/5 text-left">
                            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Set your availability</h2>
                            <p className="text-base text-slate-500 font-medium max-w-lg mb-10">Define the weekly schedule for your space.</p>

                            <div className="space-y-3">
                                {Object.entries(formData.availability).map(([day, data]) => (
                                    <div key={day} className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${data.open ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50 border-transparent opacity-60"}`}>
                                        <div className="flex items-center gap-6">
                                            <label className="relative inline-flex items-center cursor-pointer scale-110">
                                                <input 
                                                    type="checkbox" 
                                                    checked={data.open} 
                                                    onChange={() => toggleDay(day)}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gradient"></div>
                                            </label>
                                            <div>
                                                <p className="text-base font-black text-slate-900 capitalize leading-tight">{day}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    {data.open ? `${data.start} - ${data.end}` : "Closed for bookings"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {data.open && (
                                                <div className="flex items-center gap-2">
                                                    <select 
                                                        value={data.start}
                                                        onChange={(e) => updateHours(day, 'start', e.target.value)}
                                                        className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-900 focus:outline-none focus:border-[#2F2BFF]"
                                                    >
                                                        {timeSlots.map(t => <option key={t}>{t}</option>)}
                                                    </select>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">to</span>
                                                    <select 
                                                        value={data.end}
                                                        onChange={(e) => updateHours(day, 'end', e.target.value)}
                                                        className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-900 focus:outline-none focus:border-[#2F2BFF]"
                                                    >
                                                        {timeSlots.map(t => <option key={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Review your listing</h1>
                            <p className="text-lg text-slate-500 font-medium">Verify your changes before updating the listing.</p>
                        </div>

                        <div className="space-y-12">
                            {/* Big Photo Preview Gallery */}
                            <div className="rounded-[40px] overflow-hidden border border-white shadow-2xl shadow-blue-500/5 bg-white p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[500px]">
                                    {/* Main Large Image */}
                                    <div className="md:col-span-2 h-full rounded-[28px] overflow-hidden bg-slate-50 shadow-inner group relative">
                                        {formData.images.length > 0 ? (
                                            <img src={formData.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Featured" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                                <span className="material-symbols-outlined text-5xl mb-4">image</span>
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">No Photos</span>
                                            </div>
                                        )}
                                        <div className="absolute top-6 left-6 px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl text-white text-[10px] font-black uppercase tracking-widest border border-white/20">Featured Cover</div>
                                    </div>

                                    {/* Secondary Grid */}
                                    <div className="hidden md:grid grid-cols-1 gap-4 h-full">
                                        {[1, 2].map((idx) => (
                                            <div key={idx} className="h-full rounded-[24px] overflow-hidden bg-slate-50 shadow-inner group relative border border-slate-50">
                                                {formData.images[idx] ? (
                                                    <img src={formData.images[idx]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`Preview ${idx}`} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                        <span className="material-symbols-outlined text-2xl opacity-40">add_photo_alternate</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="hidden md:grid grid-cols-1 gap-4 h-full">
                                        {[3, 4].map((idx) => (
                                            <div key={idx} className="h-full rounded-[24px] overflow-hidden bg-slate-50 shadow-inner group relative border border-slate-50">
                                                {formData.images[idx] ? (
                                                    <>
                                                        <img src={formData.images[idx]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`Preview ${idx}`} />
                                                        {idx === 4 && formData.images.length > 5 && (
                                                            <div className="absolute inset-0 bg-brand-gradient/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                                                <span className="text-2xl font-black">+{formData.images.length - 5}</span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Photos</span>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                        <span className="material-symbols-outlined text-2xl opacity-40">add_photo_alternate</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative group">
                                    <button onClick={() => setStep(1)} className="absolute top-6 right-8 text-[#2F2BFF] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 group-hover:scale-105 transition-transform"><span className="material-symbols-outlined text-xs">edit</span> Edit</button>
                                    <h4 className="text-base font-black text-slate-900 mb-6">Space Details</h4>
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                                            <p className="text-sm font-bold text-slate-900 capitalize">{formData.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                                            <p className="text-sm font-bold text-slate-900">{formData.capacity} Guests</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</p>
                                            <p className="text-sm font-bold text-slate-900 line-clamp-2">{formData.description || "No description provided."}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative group">
                                    <button onClick={() => setStep(2)} className="absolute top-6 right-8 text-[#2F2BFF] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 group-hover:scale-105 transition-transform"><span className="material-symbols-outlined text-xs">edit</span> Edit</button>
                                    <h4 className="text-base font-black text-slate-900 mb-6">Location</h4>
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><span className="material-symbols-outlined text-base text-[#2F2BFF]">location_on</span> {formData.address}, {formData.city}, {formData.state} {formData.zip}</p>
                                        <div className="h-40 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative grayscale opacity-60">
                                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1474&auto=format&fit=crop" className="w-full h-full object-cover" alt="Map Preview" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="h-8 w-8 bg-brand-gradient rounded-full border-2 border-white shadow-lg"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative group">
                                    <button onClick={() => setStep(3)} className="absolute top-6 right-8 text-[#2F2BFF] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 group-hover:scale-105 transition-transform"><span className="material-symbols-outlined text-xs">edit</span> Edit</button>
                                    <h4 className="text-base font-black text-slate-900 mb-6">Pricing & Media</h4>
                                    <div className="space-y-6">
                                        <div className="p-4 bg-[#2F2BFF]/5 rounded-2xl border border-[#2F2BFF]/10 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hourly Rate</p>
                                                <p className="text-sm font-bold text-slate-900">₹{formData.price}/hr</p>
                                            </div>
                                            <button onClick={() => setStep(3)} className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF]">Edit</button>
                                        </div>
                                        <div className="p-4 bg-[#2F2BFF]/5 rounded-2xl border border-[#2F2BFF]/10 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Photos</p>
                                                    <p className="text-sm font-bold text-slate-900">{formData.images.length} photos in gallery</p>
                                                </div>
                                                <button onClick={() => setStep(4)} className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF]">Edit</button>
                                            </div>
                                            {formData.images.length > 0 && (
                                                <div className="flex gap-2 overflow-hidden">
                                                    {formData.images.slice(0, 4).map((img, i) => (
                                                        <div key={i} className="h-12 w-12 rounded-lg overflow-hidden border border-white shadow-sm flex-shrink-0 relative">
                                                            <img src={img} className="w-full h-full object-cover" alt="Preview" />
                                                            {i === 3 && formData.images.length > 4 && (
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                                    <span className="text-[10px] font-black text-white">+{formData.images.length - 4}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative group">
                                    <button onClick={() => setStep(5)} className="absolute top-6 right-8 text-[#2F2BFF] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 group-hover:scale-105 transition-transform"><span className="material-symbols-outlined text-xs">edit</span> Edit</button>
                                    <h4 className="text-base font-black text-slate-900 mb-6">Availability</h4>
                                    <div className="space-y-3">
                                        {Object.entries(formData.availability).map(([day, data]) => (
                                            <div key={day} className="flex justify-between items-center">
                                                <p className="text-sm font-bold text-slate-900 capitalize">{day}</p>
                                                <p className="text-sm font-bold text-slate-500">{data.open ? `${data.start} - ${data.end}` : "Closed"}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-[#F8FAFF] min-h-screen pb-20 overflow-hidden relative">

            <div className="max-w-4xl mx-auto px-6 py-12">
                {renderStepHeader()}

                <div className="min-h-[500px]">
                    {renderStepContent()}
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-[#F8FAFF]/80 backdrop-blur-lg border-t border-white py-6 z-50">
                    <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
                        <button
                            onClick={prevStep}
                            disabled={step === 1}
                            className={`flex items-center gap-2 text-sm font-black text-slate-900 transition-all ${step === 1 ? "opacity-0 pointer-events-none" : "hover:scale-105 active:scale-95"}`}
                        >
                            <span className="material-symbols-outlined font-black">arrow_back</span>
                            Back
                        </button>

                        {step < 6 ? (
                            <button
                                onClick={nextStep}
                                className="bg-brand-gradient text-white h-14 px-10 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                            >
                                Continue to {step === 1 ? "Location" : step === 2 ? "Pricing" : step === 3 ? "Photos" : step === 4 ? "Availability" : "Review"}
                                <span className="material-symbols-outlined font-black text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-brand-gradient text-white h-14 px-12 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70"
                            >
                                {isSubmitting ? "Saving..." : "Update Listing"}
                                {!isSubmitting && <span className="material-symbols-outlined font-black text-lg">check_circle</span>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
