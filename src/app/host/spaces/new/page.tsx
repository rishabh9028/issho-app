"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NewSpaceFlow() {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        type: "Villa",
        capacity: "2",
        description: "",
        address: "482 Creative Lane, Suite 204",
        city: "San Francisco",
        state: "CA",
        zip: "94107",
        price: "45.00",
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
    }, [user, router]);

    if (!user) return null;

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Mock API call
        await new Promise(r => setTimeout(r, 2000));
        setIsSubmitting(false);
        router.push("/host/dashboard");
    };

    const renderStepHeader = () => {
        const stepTitles = ["Basics", "Location", "Pricing", "Photos", "Review"];
        const progress = (step / 5) * 100;

        return (
            <div className="mb-12">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1d1aff]">Step {step} of 5</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stepTitles[step - 1]}: {Math.round(progress)}% Complete</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
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
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Tell us about your space</h1>
                            <p className="text-lg text-slate-500 font-medium">Help travelers find exactly what they're looking for with clear details.</p>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Space Title</label>
                                <input
                                    type="text"
                                    defaultValue={formData.title}
                                    placeholder="e.g. Modern Minimalist Loft in Shibuya"
                                    className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold placeholder:font-medium placeholder:text-slate-300 focus:outline-none focus:border-[#1d1aff] focus:ring-4 focus:ring-[#1d1aff]/5 transition-all"
                                />
                                <p className="mt-2 text-[10px] font-bold text-slate-400">Catchy titles work best. Limit to 50 characters.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Space Type</label>
                                    <div className="relative">
                                        <select className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold appearance-none focus:outline-none focus:border-[#1d1aff] transition-all">
                                            <option>Villa</option>
                                            <option>Studio</option>
                                            <option>Rooftop</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_content</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Guest Capacity</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            defaultValue={formData.capacity}
                                            className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#1d1aff] transition-all"
                                        />
                                        <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">groups</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Description</label>
                                <textarea
                                    rows={5}
                                    placeholder="What makes your space unique? Mention the neighborhood, special amenities, and the vibe."
                                    className="w-full bg-white border border-slate-200 rounded-3xl p-6 text-base font-bold placeholder:font-medium placeholder:text-slate-300 focus:outline-none focus:border-[#1d1aff] transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Where's your space located?</h1>
                            <p className="text-lg text-slate-500 font-medium">Your address is only shared with guests after they book.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="h-64 w-full bg-slate-100 rounded-[32px] overflow-hidden border border-slate-200 relative">
                                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1474&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 grayscale" alt="Map" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-10 w-10 bg-[#1d1aff] rounded-full border-4 border-white shadow-xl"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Street Address</label>
                                    <input type="text" defaultValue={formData.address} className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#1d1aff] transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">City</label>
                                    <input type="text" defaultValue={formData.city} className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#1d1aff] transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">State</label>
                                        <input type="text" defaultValue={formData.state} className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#1d1aff] transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">ZIP</label>
                                        <input type="text" defaultValue={formData.zip} className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#1d1aff] transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-blue-500/5">
                            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Set your pricing and photos</h2>
                            <p className="text-base text-slate-500 font-medium mb-10">Help guests visualize your space and set a fair rate.</p>

                            <div className="space-y-10">
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-base font-black text-slate-900">Upload Photos</label>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1d1aff] bg-[#1d1aff]/5 px-2.5 py-1 rounded-md">Required</span>
                                    </div>
                                    <div className="border-2 border-dashed border-[#1d1aff]/20 rounded-[32px] p-16 flex flex-col items-center justify-center text-center bg-[#1d1aff]/[0.02] hover:bg-[#1d1aff]/[0.05] transition-all group cursor-pointer">
                                        <div className="h-16 w-16 rounded-full bg-[#1d1aff] flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-3xl font-black">cloud_upload</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">Drag and drop your photos here</h3>
                                        <p className="max-w-xs text-sm text-slate-400 font-medium leading-relaxed mb-8">Upload at least 5 high-quality photos (JPG or PNG, max 10MB each) to attract more guests.</p>
                                        <button className="bg-[#1d1aff] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Browse Files</button>
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row gap-10">
                                    <div className="flex-1 space-y-6">
                                        <h3 className="text-xl font-black text-slate-900 mb-2">Pricing</h3>
                                        <div>
                                            <label className="text-xs font-black text-slate-500 mb-3 block">Hourly Rate</label>
                                            <div className="relative group">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg group-focus-within:text-[#1d1aff] transition-colors">$</span>
                                                <input
                                                    type="text"
                                                    defaultValue={formData.price}
                                                    className="w-full h-16 bg-white border border-slate-200 rounded-2xl pl-12 pr-16 text-xl font-black text-slate-900 focus:outline-none focus:border-[#1d1aff] transition-all"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">/ hr</span>
                                            </div>
                                        </div>
                                        <div className="bg-[#1d1aff]/5 p-6 rounded-[24px] border border-[#1d1aff]/10 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#1d1aff] shadow-sm">
                                                    <span className="material-symbols-outlined font-black">auto_awesome</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">Smart Pricing</p>
                                                    <p className="text-[10px] font-bold text-slate-500 leading-tight">Automatically adjust your rates based on local demand.</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" defaultChecked={formData.smartPricing} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1d1aff]"></div>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="w-full lg:w-80 bg-slate-50 rounded-3xl p-8 border border-slate-100">
                                        <h4 className="text-base font-black text-slate-900 mb-6">Fee Breakdown</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm font-bold text-slate-500">
                                                <span>Your hourly rate</span>
                                                <span className="text-slate-900">${formData.price}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-bold text-slate-500">
                                                <span>Service fee (3%)</span>
                                                <span className="text-rose-400">-${(parseFloat(formData.price) * 0.03).toFixed(2)}</span>
                                            </div>
                                            <div className="h-px bg-slate-200 my-4"></div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-base font-black text-slate-900">You'll earn</span>
                                                <span className="text-3xl font-black text-[#1d1aff]">${(parseFloat(formData.price) * 0.97).toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex gap-3">
                                            <span className="material-symbols-outlined text-slate-400 text-sm">info</span>
                                            <p className="text-[10px] font-bold text-slate-400 leading-relaxed">Isshō fees help us run the platform and provide support.</p>
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
                        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-blue-500/5">
                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Set your availability</h2>
                                    <p className="text-base text-slate-500 font-medium max-w-lg">Define the weekly schedule for your space. You can change this anytime later.</p>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">80% Complete</span>
                            </div>

                            <div className="space-y-3">
                                {Object.entries(formData.availability).map(([day, data]) => (
                                    <div key={day} className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${data.open ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50 border-transparent opacity-60"}`}>
                                        <div className="flex items-center gap-6">
                                            <label className="relative inline-flex items-center cursor-pointer scale-110">
                                                <input type="checkbox" defaultChecked={data.open} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1d1aff]"></div>
                                            </label>
                                            <div>
                                                <p className="text-base font-black text-slate-900 capitalize leading-tight">{day}</p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${data.open ? "text-[#1d1aff]" : "text-slate-400"}`}>{data.open ? "Open" : "Closed"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-xs text-slate-900">{data.open ? data.start : "--:--"}</div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">to</span>
                                                <div className="h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-xs text-slate-900">{data.open ? data.end : "--:--"}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 p-8 rounded-[32px] bg-[#1d1aff]/5 border border-[#1d1aff]/10 flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-[#1d1aff] shadow-lg shadow-blue-500/5 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-2xl font-black">sync_alt</span>
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-slate-900">Sync with external calendar</p>
                                        <p className="text-xs font-bold text-slate-500">Google, Outlook, and iCal support coming soon.</p>
                                    </div>
                                </div>
                                <span className="px-4 py-2 bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm border border-slate-100">Coming soon</span>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Review your listing</h1>
                            <p className="text-lg text-slate-500 font-medium">Final check before your space goes live. You can always edit these details later.</p>
                        </div>

                        <div className="space-y-12">
                            <section>
                                <h3 className="text-xl font-black text-slate-900 mb-6">How guests will see it</h3>
                                <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-2xl shadow-blue-500/5 flex flex-col md:flex-row group max-w-3xl mx-auto">
                                    <div className="h-64 md:h-auto md:w-1/2 overflow-hidden shrink-0">
                                        <img src="https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1532&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Preview" />
                                    </div>
                                    <div className="p-10 flex flex-col justify-between flex-1">
                                        <div>
                                            <span className="inline-block px-3 py-1 bg-[#1d1aff]/5 text-[#1d1aff] text-[10px] font-black uppercase tracking-[0.2em] rounded-md mb-4 border border-[#1d1aff]/10 shadow-sm">New Space</span>
                                            <h3 className="text-2xl font-black text-slate-900">{formData.title}</h3>
                                            <p className="text-sm font-bold text-slate-400">{formData.city}, {formData.state}</p>
                                        </div>
                                        <div className="mt-10 flex justify-between items-end">
                                            <div>
                                                <p className="text-2xl font-black text-slate-900 leading-none mb-1">${formData.price}<span className="text-sm font-bold text-slate-400 tracking-normal">/hour</span></p>
                                                <p className="text-[10px] font-black text-amber-500 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs filled-icon">star</span> New
                                                </p>
                                            </div>
                                            <button className="h-12 px-8 bg-[#1d1aff] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-blue-500/20">Full Preview</button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative group">
                                    <button className="absolute top-6 right-8 text-[#1d1aff] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 group-hover:scale-105 transition-transform"><span className="material-symbols-outlined text-xs">edit</span> Edit</button>
                                    <h4 className="text-base font-black text-slate-900 mb-6">Space Details</h4>
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                                            <p className="text-sm font-bold text-slate-900">Creative Studio / Workshop</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                                            <p className="text-sm font-bold text-slate-900">Up to 12 people</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</p>
                                            <p className="text-sm font-bold text-slate-900 line-clamp-2">A sun-drenched minimalist studio designed for focus and collaboration. Features high ceilings, industrial windows,...</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative group">
                                    <button className="absolute top-6 right-8 text-[#1d1aff] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 group-hover:scale-105 transition-transform"><span className="material-symbols-outlined text-xs">edit</span> Edit</button>
                                    <h4 className="text-base font-black text-slate-900 mb-6">Location</h4>
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><span className="material-symbols-outlined text-base text-[#1d1aff]">location_on</span> 482 Creative Lane, Suite 204, San Francisco, CA 94107</p>
                                        <div className="h-40 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative grayscale opacity-60">
                                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1474&auto=format&fit=crop" className="w-full h-full object-cover" alt="Map Preview" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="h-8 w-8 bg-[#1d1aff] rounded-full border-2 border-white shadow-lg"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative group">
                                    <button className="absolute top-6 right-8 text-[#1d1aff] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 group-hover:scale-105 transition-transform"><span className="material-symbols-outlined text-xs">edit</span> Edit</button>
                                    <h4 className="text-base font-black text-slate-900 mb-6">Pricing & Media</h4>
                                    <div className="space-y-6">
                                        <div className="p-4 bg-[#1d1aff]/5 rounded-2xl border border-[#1d1aff]/10 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-[#1d1aff] uppercase tracking-widest mb-0.5">Standard Rate</p>
                                                <p className="text-xl font-black text-slate-900">${formData.price}/hr</p>
                                            </div>
                                            <span className="material-symbols-outlined text-2xl text-[#1d1aff] font-black">payments</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100"><img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1374&auto=format&fit=crop" className="w-full h-full object-cover" alt="p" /></div>
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100"><img src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1470&auto=format&fit=crop" className="w-full h-full object-cover" alt="p" /></div>
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100"><img src="https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1532&auto=format&fit=crop" className="w-full h-full object-cover" alt="p" /></div>
                                            <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">+5</div>
                                            <span className="text-[10px] font-black text-slate-400 self-center ml-2 uppercase tracking-widest">8 Photos total</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative group">
                                    <button className="absolute top-6 right-8 text-[#1d1aff] font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 group-hover:scale-105 transition-transform"><span className="material-symbols-outlined text-xs">edit</span> Edit</button>
                                    <h4 className="text-base font-black text-slate-900 mb-6">Availability</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-500">Mon - Fri</span>
                                            <span className="font-black text-slate-900">08:00 AM - 08:00 PM</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-500">Saturday</span>
                                            <span className="font-black text-slate-900">10:00 AM - 04:00 PM</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs opacity-40">
                                            <span className="font-bold text-slate-500">Sunday</span>
                                            <span className="font-black text-slate-900 italic">Unavailable</span>
                                        </div>
                                        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 text-center italic">"Auto-approve requests from verified guests enabled."</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-[#f8f6f6] min-h-screen pb-20 overflow-hidden relative">
            {/* Nav Header */}
            <header className="sticky top-0 z-50 w-full bg-[#f8f6f6]/80 backdrop-blur-lg px-8 py-5 border-b border-white flex justify-between items-center">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/host/dashboard")}>
                    <div className="bg-[#1d1aff] rounded-xl p-2.5 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-white text-xl font-black">corporate_fare</span>
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">Isshō <span className="text-slate-400 font-bold ml-px">Host</span></span>
                </div>
                <div className="flex items-center gap-8">
                    <button onClick={() => router.push("/host/dashboard")} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors">Save & Exit</button>
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

                {/* Footer Nav */}
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
                                Continue to {step === 1 ? "Location" : step === 2 ? "Pricing" : step === 3 ? "Availability" : "Review"}
                                <span className="material-symbols-outlined font-black text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-[#1d1aff] text-white h-14 px-12 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70"
                            >
                                {isSubmitting ? "Publishing..." : "Publish Listing"}
                                {!isSubmitting && <span className="material-symbols-outlined font-black text-lg">rocket_launch</span>}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Background floating help button */}
            <div className="fixed bottom-24 right-8 z-40">
                <button className="h-14 w-14 rounded-full bg-white text-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all border border-slate-50">
                    <span className="text-2xl font-black">?</span>
                </button>
            </div>
        </div>
    );
}
