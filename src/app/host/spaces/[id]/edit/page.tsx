"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import spacesData from "@/data/spaces.json";

export default function EditSpacePage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const space = spacesData.find(s => s.id === id);

    // Form State
    const [formData, setFormData] = useState({
        title: space?.title || "",
        type: space?.type || "Villa",
        capacity: space?.capacity.toString() || "2",
        description: space?.description || "",
        address: "482 Creative Lane, Suite 204", // Mock location for demo
        city: "Tokyo",
        state: "Tokyo",
        zip: "100-0001",
        price: space?.price_per_hour.toString() || "45.00",
        smartPricing: true,
        availability: {
            monday: { open: true, start: "09:00 AM", end: "05:00 PM" },
            tuesday: { open: true, start: "09:00 AM", end: "05:00 PM" },
            wednesday: { open: true, start: "09:00 AM", end: "05:00 PM" },
            thursday: { open: true, start: "09:00 AM", end: "05:00 PM" },
            friday: { open: true, start: "09:00 AM", end: "05:00 PM" },
            saturday: { open: false, start: "10:00 AM", end: "04:00 PM" },
            sunday: { open: false, start: "10:00 AM", end: "04:00 PM" },
        }
    });

    useEffect(() => {
        if (!user) router.push("/auth/login");
        else if (user.role !== "host" && user.role !== "admin") router.push("/");
        else if (!space) router.push("/host/spaces");
    }, [user, router, space]);

    if (!user || !space) return null;

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Mock API call for updating
        await new Promise(r => setTimeout(r, 2000));
        setIsSubmitting(false);
        router.push("/host/spaces");
    };

    const renderStepHeader = () => {
        const stepTitles = ["Basics", "Location", "Pricing", "Photos", "Review"];
        const progress = (step / 5) * 100;

        return (
            <div className="mb-12">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1d1aff]">Editing Step {step} of 5</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stepTitles[step - 1]}: {Math.round(progress)}% Complete</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1d1aff] transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
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
                                    className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold placeholder:font-medium placeholder:text-slate-300 focus:outline-none focus:border-[#1d1aff] focus:ring-4 focus:ring-[#1d1aff]/5 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Space Type</label>
                                    <div className="relative">
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold appearance-none focus:outline-none focus:border-[#1d1aff] transition-all"
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
                                            className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#1d1aff] transition-all"
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
                                    className="w-full bg-white border border-slate-200 rounded-3xl p-6 text-base font-bold placeholder:font-medium placeholder:text-slate-300 focus:outline-none focus:border-[#1d1aff] transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                // Similar to NewSpaceFlow location step
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-left">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Property Location</h1>
                            <p className="text-lg text-slate-500 font-medium">Verify your property's address and map pin location.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="h-64 w-full bg-slate-100 rounded-[32px] overflow-hidden border border-slate-200 relative">
                                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1474&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 grayscale" alt="Map" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-10 w-10 bg-[#1d1aff] rounded-full border-4 border-white shadow-xl"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Street Address</label>
                                    <input type="text" value={formData.address} className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#1d1aff] transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">City</label>
                                    <input type="text" value={formData.city} className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#1d1aff] transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">State</label>
                                        <input type="text" value={formData.state} className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#1d1aff] transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">ZIP</label>
                                        <input type="text" value={formData.zip} className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#1d1aff] transition-all" />
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
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg group-focus-within:text-[#1d1aff] transition-colors">$</span>
                                        <input
                                            type="text"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full h-16 bg-white border border-slate-200 rounded-2xl pl-12 pr-16 text-xl font-black text-slate-900 focus:outline-none focus:border-[#1d1aff] transition-all"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">/ hr</span>
                                    </div>
                                </div>

                                <div className="bg-[#1d1aff]/5 p-8 rounded-[32px] border border-[#1d1aff]/10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[#1d1aff] shadow-sm">
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
                                            <p className="text-2xl font-black text-slate-900">$2,450.00</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Payout</p>
                                            <p className="text-2xl font-black text-[#1d1aff]">${(parseFloat(formData.price) * 0.97).toFixed(2)}/hr</p>
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
                                {space.images.map((img, i) => (
                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 relative group">
                                        <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="p" />
                                        <button className="absolute top-2 right-2 h-8 w-8 bg-black/50 text-white rounded-lg backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                ))}
                                <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-[#1d1aff] hover:text-[#1d1aff] cursor-pointer transition-all">
                                    <span className="material-symbols-outlined text-3xl mb-2">add_photo_alternate</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Add more</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Review & Save</h1>
                            <p className="text-lg text-slate-500 font-medium">Verify your changes before updating the listing.</p>
                        </div>

                        <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="h-24 w-24 rounded-2xl overflow-hidden shadow-inner">
                                    <img src={space.images[0]} className="w-full h-full object-cover" alt="p" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">{formData.title}</h3>
                                    <p className="text-sm font-bold text-slate-400">{formData.city}, {formData.state}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10 pt-8 border-t border-slate-50">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New Hourly Rate</p>
                                    <p className="text-2xl font-black text-slate-900">${formData.price}/hr</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                                    <p className="text-2xl font-black text-slate-900">{formData.capacity} Guests</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 rounded-[32px] p-8 border border-amber-100 flex items-start gap-4">
                            <span className="material-symbols-outlined text-amber-500 font-black">info</span>
                            <div>
                                <p className="text-amber-900 font-black text-sm mb-1">Wait for verification</p>
                                <p className="text-amber-700/70 text-xs font-medium leading-relaxed">Changes to price and title are reviewed by our team and usually approved within 2 hours. Your listing will remain active during this time.</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-[#f8f6f6] min-h-screen pb-20 overflow-hidden relative">
            <header className="sticky top-0 z-50 w-full bg-[#f8f6f6]/80 backdrop-blur-lg px-8 py-5 border-b border-white flex justify-between items-center">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/host/spaces")}>
                    <div className="bg-[#1d1aff] rounded-xl p-2.5 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-white text-xl font-black">edit_square</span>
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">Isshō <span className="text-slate-400 font-bold ml-px">Editor</span></span>
                </div>
                <div className="flex items-center gap-8">
                    <button onClick={() => router.push("/host/spaces")} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors">Discard Changes</button>
                    <div className="h-10 w-10 rounded-full border border-white shadow-sm overflow-hidden shrink-0">
                        <img src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBdfPNMucMuSUNyDYhe7_lidlIxF3soI4WtCAt-b-PdtD4zRJyMcIcueyUuRBCjhKyUGNaozNOiMKqY5CfZype_fWp9wV18HYPgIl2cBXI9R62ScAAcbfkl19fVp1HEQSD0PLECtOpYc5q-sdoGOAXxEb3fNt6LjLoIEw4062phXaRA5v8rDlCW5NvCJnmQeiKBTHxDI3WWNIitEoSooW7TQS_CRR_kqQp-6KAuhRe7HC00gS9lD-DmBdAaXMcP7AMUssYLNqLafQ"} alt="U" className="w-full h-full object-cover" />
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12">
                {renderStepHeader()}

                <div className="min-h-[500px]">
                    {renderStepContent()}
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-[#f8f6f6]/80 backdrop-blur-lg border-t border-white py-6 z-50">
                    <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
                        <button
                            onClick={prevStep}
                            disabled={step === 1}
                            className={`flex items-center gap-2 text-sm font-black text-slate-900 transition-all ${step === 1 ? "opacity-0 pointer-events-none" : "hover:scale-105 active:scale-95"}`}
                        >
                            <span className="material-symbols-outlined font-black">arrow_back</span>
                            Back
                        </button>

                        {step < 5 ? (
                            <button
                                onClick={nextStep}
                                className="bg-[#1d1aff] text-white h-14 px-10 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                            >
                                Continue to {step === 1 ? "Location" : step === 2 ? "Pricing" : step === 3 ? "Photos" : "Review"}
                                <span className="material-symbols-outlined font-black text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-[#1d1aff] text-white h-14 px-12 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70"
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
