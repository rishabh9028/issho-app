"use client";

import { useState } from "react";
import Image from "next/image";
import { sendContactEmail } from "@/app/actions/contact";

export default function ContactPage() {
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            const result = await sendContactEmail(formData);
            if (result.success) {
                setStatus("success");
                setFormData({ name: "", email: "", message: "" });
                // Clear status after 5 seconds
                setTimeout(() => setStatus("idle"), 5000);
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error("Failed to send email:", error);
            setStatus("error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-[#F8FAFF] min-h-screen py-20 px-6 md:px-10 lg:px-20">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                
                {/* Left Side: Text and Contact Info */}
                <div className="flex-1 w-full text-center lg:text-left">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2F2BFF] mb-4">
                        WE'RE HERE TO HELP YOU
                    </p>
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] mb-8">
                        Discuss Your <br />
                        <span className="text-[#2F2BFF]">Space Needs</span>
                    </h1>
                    <p className="text-lg font-medium text-slate-500 max-w-lg mb-12">
                        Are you looking for top-quality curated spaces tailored to your needs? Reach out to us and we'll help you find the perfect match.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-8">
                        <div className="flex items-center gap-6 justify-center lg:justify-start">
                            <div className="w-16 h-16 rounded-2xl bg-[#2F2BFF] flex items-center justify-center shadow-lg shadow-[#2F2BFF]/20">
                                <span className="material-symbols-outlined text-white text-3xl">mail</span>
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">E-mail</p>
                                <a href="mailto:contact@issho.in" className="text-xl font-black text-slate-900 hover:text-[#2F2BFF] transition-colors underline decoration-[#2F2BFF]/20 decoration-2 underline-offset-4">
                                    contact@issho.in
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Contact Form Card */}
                <div className="w-full lg:w-[500px]">
                    <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl shadow-[#2F2BFF]/5 border border-slate-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your name"
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#2F2BFF] focus:ring-0 text-slate-900 font-bold placeholder:text-slate-300 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Email</label>
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="yourname@email.com"
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#2F2BFF] focus:ring-0 text-slate-900 font-bold placeholder:text-slate-300 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Message</label>
                                <textarea 
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Tell us what you're looking for..."
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#2F2BFF] focus:ring-0 text-slate-900 font-bold placeholder:text-slate-300 transition-all resize-none"
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full h-16 flex items-center justify-between px-8 rounded-full font-black text-lg transition-all transform active:scale-[0.98] ${
                                    status === "success" 
                                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30" 
                                    : "bg-[#2F2BFF] text-white shadow-xl shadow-[#2F2BFF]/20 hover:bg-[#1e1bc8]"
                                }`}
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </span>
                                ) : status === "success" ? (
                                    <span className="flex items-center gap-3 w-full justify-center">
                                        <span className="material-symbols-outlined">check_circle</span>
                                        Sent!
                                    </span>
                                ) : (
                                    <>
                                        Get a Solution
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                            <span className="material-symbols-outlined text-white">east</span>
                                        </div>
                                    </>
                                )}
                            </button>
                            
                            {status === "error" && (
                                <p className="text-red-500 text-xs font-bold text-center animate-in fade-in slide-in-from-top-2">
                                    Something went wrong. Please try again.
                                </p>
                            )}
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
