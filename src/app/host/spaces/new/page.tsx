"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function NewSpaceFlow() {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pinPos, setPinPos] = useState({ x: 50, y: 50 });
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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
        },
        images: [] as string[]
    });

    useEffect(() => {
        if (!user) router.push("/auth/login");
        else if (user.role !== "host" && user.role !== "admin") router.push("/");
    }, [user, router]);

    if (!user) return null;

    const nextStep = () => setStep(s => Math.min(s + 1, 6));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

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

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            
            const typeImages: { [key: string]: string[] } = {
                villa: [
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1475&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop"
                ],
                studio: [
                    "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1470&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1469&auto=format&fit=crop"
                ],
                cafe: [
                    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1447&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1471&auto=format&fit=crop"
                ],
                rooftop: [
                    "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1469&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1470&auto=format&fit=crop"
                ]
            };

            const selectedType = formData.type.toLowerCase();
            const spaceImages = typeImages[selectedType] || typeImages.studio;

            // Upload actual files to Supabase Storage
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

            const persistentImages = await uploadImagesToSupabase(uploadedFiles);

            const { error } = await supabase
                .from('spaces')
                .insert({
                    host_id: user?.id,
                    title: formData.title,
                    description: formData.description,
                    price_per_hour: parseFloat(formData.price),
                    location: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`,
                    capacity: parseInt(formData.capacity),
                    images: persistentImages.length > 0 ? persistentImages : spaceImages,
                    type: formData.type.toLowerCase(),
                    amenities: ['wifi', 'parking', 'kitchen'],
                    availability: formData.availability
                });

            if (error) throw error;
            router.push("/host/dashboard");
        } catch (error) {
            console.error("Error creating space:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPinPos({ x, y });
        
        // Populate mock data on map click
        setFormData(prev => ({
            ...prev,
            address: "123 Ocean View Drive",
            city: "Malibu",
            state: "CA",
            zip: "90265"
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

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
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
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Tell us about your space</h1>
                            <p className="text-lg text-slate-500 font-medium">Help travelers find exactly what they're looking for with clear details.</p>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Space Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Modern Minimalist Loft in Shibuya"
                                    className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold placeholder:font-medium placeholder:text-slate-300 focus:outline-none focus:border-[#2F2BFF] focus:ring-4 focus:ring-[#2F2BFF]/5 transition-all"
                                />
                                <p className="mt-2 text-[10px] font-bold text-slate-400">Catchy titles work best. Limit to 50 characters.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Space Type</label>
                                    <div className="relative">
                                        <select 
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold appearance-none focus:outline-none focus:border-[#2F2BFF] transition-all"
                                        >
                                            <option value="Villa">Villa</option>
                                            <option value="Studio">Studio</option>
                                            <option value="Rooftop">Rooftop</option>
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

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Description</label>
                                <textarea
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What makes your space unique? Mention the neighborhood, special amenities, and the vibe."
                                    className="w-full bg-white border border-slate-200 rounded-3xl p-6 text-base font-bold placeholder:font-medium placeholder:text-slate-300 focus:outline-none focus:border-[#2F2BFF] transition-all resize-none"
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
                        </div>
                        <div className="space-y-6">
                            <div 
                                className="h-64 w-full bg-slate-100 rounded-[32px] overflow-hidden border border-slate-200 relative cursor-crosshair"
                                onClick={handleMapClick}
                            >
                                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1474&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 grayscale" alt="Map" />
                                <div 
                                    className="absolute -translate-x-1/2 -translate-y-full transition-all duration-300 ease-out"
                                    style={{ left: `${pinPos.x}%`, top: `${pinPos.y}%` }}
                                >
                                    <div className="h-10 w-10 bg-brand-gradient rounded-full border-4 border-white shadow-xl relative animate-bounce">
                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#2F2BFF]"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Street Address</label>
                                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#2F2BFF] transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">City</label>
                                    <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#2F2BFF] transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">State</label>
                                        <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#2F2BFF] transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">ZIP</label>
                                        <input type="text" value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-base font-bold focus:outline-none focus:border-[#2F2BFF] transition-all" />
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
                            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Pricing</h2>
                            <p className="text-base text-slate-500 font-medium mb-10">Set a fair hourly rate for your space.</p>

                            <div className="flex flex-col lg:flex-row gap-10">
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <label className="text-xs font-black text-slate-500 mb-3 block">Hourly Rate</label>
                                        <div className="relative group">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-lg group-focus-within:text-[#2F2BFF] transition-colors">₹</span>
                                            <input
                                                type="text"
                                                value={formData.price}
                                                onChange={e => setFormData({...formData, price: e.target.value})}
                                                className="w-full h-16 bg-white border border-slate-200 rounded-2xl pl-12 pr-16 text-xl font-black text-slate-900 focus:outline-none focus:border-[#2F2BFF] transition-all"
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">/ hr</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full lg:w-80 bg-slate-50 rounded-3xl p-8 border border-slate-100">
                                    <h4 className="text-base font-black text-slate-900 mb-6">Fee Breakdown</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm font-bold text-slate-500">
                                            <span>Your hourly rate</span>
                                            <span className="text-slate-900">₹{formData.price}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-slate-500">
                                            <span>Service fee (3%)</span>
                                            <span className="text-rose-400">-₹{(parseFloat(formData.price || "0") * 0.03).toFixed(2)}</span>
                                        </div>
                                        <div className="h-px bg-slate-200 my-4"></div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-base font-black text-slate-900">You'll earn</span>
                                            <span className="text-3xl font-black text-[#2F2BFF]">₹{(parseFloat(formData.price || "0") * 0.97).toFixed(2)}</span>
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
                            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Photos</h2>
                            <p className="text-base text-slate-500 font-medium mb-10">Help guests visualize your space with high-quality photos.</p>

                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-base font-black text-slate-900">Upload Photos</label>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF] bg-[#2F2BFF]/5 px-2.5 py-1 rounded-md">Required</span>
                                </div>
                                <div 
                                    className="border-2 border-dashed border-[#2F2BFF]/20 rounded-[32px] p-16 flex flex-col items-center justify-center text-center bg-[#2F2BFF]/[0.02] hover:bg-[#2F2BFF]/[0.05] transition-all group cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="h-16 w-16 rounded-full bg-brand-gradient flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-3xl font-black">cloud_upload</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Drag and drop your photos here</h3>
                                    <p className="max-w-xs text-sm text-slate-400 font-medium leading-relaxed mb-8">Upload beautiful photos to attract more guests.</p>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    <button className="bg-brand-gradient text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Browse Files</button>
                                </div>

                                {formData.images.length > 0 && (
                                    <div className="mt-10">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Added Photos ({formData.images.length})</h4>
                                            <button 
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, images: [] }));
                                                    setUploadedFiles([]);
                                                }}
                                                className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {formData.images.map((img, i) => (
                                                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 relative group animate-in zoom-in-95 duration-300">
                                                    <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={`Preview ${i}`} />
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeImage(i);
                                                        }}
                                                        className="absolute top-2 right-2 h-8 w-8 bg-black/50 text-white rounded-lg backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <span className="material-symbols-outlined text-sm font-black">delete</span>
                                                    </button>
                                                    {i === 0 && (
                                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-[#2F2BFF] text-white text-[8px] font-black uppercase tracking-widest rounded-md">Main</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 5:
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
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${data.open ? "text-[#2F2BFF]" : "text-slate-400"}`}>{data.open ? "Open" : "Closed"}</p>
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
                                            {!data.open && <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Unavailable</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 p-8 rounded-[32px] bg-[#2F2BFF]/5 border border-[#2F2BFF]/10 flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-[#2F2BFF] shadow-lg shadow-blue-500/5 group-hover:scale-110 transition-transform">
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
            case 6:
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Review your listing</h1>
                            <p className="text-lg text-slate-500 font-medium">Final check before your space goes live. You can always edit these details later.</p>
                        </div>

                        <div className="space-y-12">
                            {/* Big Photo Preview Gallery */}
                            <div className="rounded-[40px] overflow-hidden border border-white shadow-2xl shadow-blue-500/5 bg-white p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[500px]">
                                    {/* Main Large Image */}
                                    <div className="md:col-span-2 h-full rounded-[28px] overflow-hidden bg-slate-50 shadow-inner group relative">
                                        {uploadedFiles.length > 0 ? (
                                            <img src={URL.createObjectURL(uploadedFiles[0])} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Featured" />
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
                                                {uploadedFiles[idx] ? (
                                                    <img src={URL.createObjectURL(uploadedFiles[idx])} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`Preview ${idx}`} />
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
                                                {uploadedFiles[idx] ? (
                                                    <>
                                                        <img src={URL.createObjectURL(uploadedFiles[idx])} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`Preview ${idx}`} />
                                                        {idx === 4 && uploadedFiles.length > 5 && (
                                                            <div className="absolute inset-0 bg-brand-gradient/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                                                <span className="text-2xl font-black">+{uploadedFiles.length - 5}</span>
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
                                            <p className="text-sm font-bold text-slate-900">{formData.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                                            <p className="text-sm font-bold text-slate-900">Up to {formData.capacity} people</p>
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
                                                    <p className="text-sm font-bold text-slate-900">{uploadedFiles.length} photos uploaded</p>
                                                </div>
                                                <button onClick={() => setStep(4)} className="text-[10px] font-black uppercase tracking-widest text-[#2F2BFF]">Edit</button>
                                            </div>
                                            {uploadedFiles.length > 0 && (
                                                <div className="flex gap-2 overflow-hidden">
                                                    {uploadedFiles.slice(0, 4).map((file, i) => (
                                                        <div key={i} className="h-12 w-12 rounded-lg overflow-hidden border border-white shadow-sm flex-shrink-0 relative">
                                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                                                            {i === 3 && uploadedFiles.length > 4 && (
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                                    <span className="text-[10px] font-black text-white">+{uploadedFiles.length - 4}</span>
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
                                    <div className="space-y-4">
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

                {/* Footer Nav */}
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
                                {isSubmitting ? "Publishing..." : "Publish Listing"}
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
