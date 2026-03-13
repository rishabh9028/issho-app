"use client";

import Link from "next/link";

export default function BecomeHost() {
    return (
        <div className="min-h-screen bg-[#f8f6f6]">
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Visual Side */}
                    <div className="flex-1 w-full order-2 lg:order-1">
                        <div className="relative aspect-square max-w-[500px] mx-auto">
                            <div className="absolute inset-0 bg-[#1d1aff]/10 rounded-[60px] transform -rotate-6"></div>
                            <img 
                                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
                                alt="Studio Space" 
                                className="relative z-10 w-full h-full object-cover rounded-[50px] shadow-2xl"
                            />
                            <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-3xl shadow-xl z-20 hidden md:block border border-slate-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <span className="material-symbols-outlined filled-icon">payments</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Potential Earnings</p>
                                        <p className="text-xl font-black text-slate-900">₹85,000<span className="text-xs text-slate-400 font-bold"> /mo</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <p className="text-xs font-bold text-slate-500">High demand in your area</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="flex-1 space-y-10 order-1 lg:order-2 text-center lg:text-left">
                        <div className="space-y-4">
                            <span className="inline-block px-4 py-1.5 bg-[#1d1aff]/10 text-[#1d1aff] text-xs font-black uppercase tracking-widest rounded-full">
                                Host your space
                            </span>
                            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">
                                Turn your space into <span className="text-[#1d1aff]">earnings.</span>
                            </h1>
                            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                                Join our premium community of hosts. List your studio, cafe, or office and share it with creators around India.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-left">
                                <span className="material-symbols-outlined text-[#1d1aff] bg-[#1d1aff]/5 p-2 rounded-lg">verified_user</span>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm">Secure Bookings</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Verified guests and secure payment processing.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-left">
                                <span className="material-symbols-outlined text-[#1d1aff] bg-[#1d1aff]/5 p-2 rounded-lg">calendar_month</span>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm">Total Control</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-1">You choose your prices, schedule, and guest rules.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                            <Link
                                href="/auth/signup"
                                className="w-full sm:w-auto px-10 py-5 bg-[#1d1aff] text-white rounded-3xl font-black text-lg transition-all shadow-2xl shadow-blue-500/20 active:scale-[0.98] hover:brightness-110 flex items-center justify-center gap-3"
                            >
                                Join the Community
                            </Link>
                            <Link 
                                href="/#how-it-works"
                                className="text-slate-500 font-black text-sm uppercase tracking-widest hover:text-slate-900 px-8 py-5"
                            >
                                Learn More
                            </Link>
                        </div>
                        
                        <p className="text-xs text-slate-400 font-medium">No hidden fees. Free to list. 15% service fee per booking.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
