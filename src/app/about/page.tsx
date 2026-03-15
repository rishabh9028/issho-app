export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFF]">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-100/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
                        <span className="h-2 w-2 rounded-full bg-[#2F2BFF] animate-pulse"></span>
                        <span className="text-xs font-black tracking-widest uppercase text-slate-600">The Isshō Vision</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8">
                        Rethinking how we<br />
                        <span className="text-transparent bg-clip-text bg-brand-gradient">share spaces.</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Isshō is a modern marketplace designed to bring people together by unlocking access to unique, underutilized spaces around the city. Whether you need a private rooftop for a birthday, a quiet studio for a photoshoot, or a premium villa for a weekend retreat, we make finding and booking the perfect space effortless.
                    </p>
                </div>
            </div>

            {/* Core Values Section */}
            <div className="max-w-7xl mx-auto px-4 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Mission */}
                    <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2F2BFF]/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="h-16 w-16 bg-[#2F2BFF]/10 text-[#2F2BFF] rounded-2xl flex items-center justify-center mb-8">
                            <span className="material-symbols-outlined text-3xl">public</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4">Our Mission</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">To democratize access to premium spaces and empower hosts to monetize their properties with complete control and flexibility.</p>
                    </div>

                    {/* Guests */}
                    <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="h-16 w-16 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mb-8">
                            <span className="material-symbols-outlined text-3xl">luggage</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4">For Guests</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">Discover uniquely curated spaces with flexible hourly booking, instant confirmation, and verified quality standards.</p>
                    </div>

                    {/* Hosts */}
                    <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="h-16 w-16 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center mb-8">
                            <span className="material-symbols-outlined text-3xl">home_work</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4">For Hosts</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">Turn your unused space into a flexible revenue stream. Manage bookings effortlessly with our powerful host tools.</p>
                    </div>
                </div>
            </div>
            {/* Stats/Proof Section */}
            <div className="border-t border-slate-200 bg-white py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16 text-center">
                        <div>
                            <p className="text-5xl font-black text-slate-900 mb-2">10k+</p>
                            <p className="text-[10px] font-black tracking-widest text-[#2F2BFF] uppercase">Bookings Completed</p>
                        </div>
                        <div>
                            <p className="text-5xl font-black text-slate-900 mb-2">500+</p>
                            <p className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">Verified Hosts</p>
                        </div>
                        <div>
                            <p className="text-5xl font-black text-slate-900 mb-2">4.9</p>
                            <p className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Average Rating</p>
                        </div>
                        <div>
                            <p className="text-5xl font-black text-slate-900 mb-2">24/7</p>
                            <p className="text-[10px] font-black tracking-widest text-rose-500 uppercase">Dedicated Support</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
