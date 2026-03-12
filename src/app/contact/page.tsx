export default function ContactPage() {
    return (
        <div className="bg-[#f8f6f6] min-h-screen py-16 px-6 md:px-10">
            <div className="max-w-[1200px] mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Get in Touch</h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">
                        Have questions about hosting or booking? Our team is here to help.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                    {/* Contact Info */}
                    <div className="space-y-5">
                        {[
                            {
                                title: "Email Us",
                                desc: "hello@issho.com",
                                icon: (
                                    <svg className="w-6 h-6 text-[#1d1aff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                ),
                            },
                            {
                                title: "Call Us",
                                desc: "+91 98765 43210",
                                icon: (
                                    <svg className="w-6 h-6 text-[#1d1aff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                ),
                            },
                            {
                                title: "Our Office",
                                desc: "Bengaluru, Karnataka, India",
                                icon: (
                                    <svg className="w-6 h-6 text-[#1d1aff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                ),
                            },
                        ].map((item) => (
                            <div key={item.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#1d1aff]/10 flex items-center justify-center flex-shrink-0">
                                    {item.icon}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 mb-0.5">{item.title}</div>
                                    <div className="text-slate-500 text-sm font-medium">{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-xl shadow-xl border border-[#1d1aff]/5 p-8">
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700">Full Name</label>
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#1d1aff] transition-colors">
                                    <svg className="w-5 h-5 text-[#1d1aff] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <input type="text" className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 text-sm font-medium" placeholder="John Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700">Email Address</label>
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#1d1aff] transition-colors">
                                    <svg className="w-5 h-5 text-[#1d1aff] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <input type="email" className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 text-sm font-medium" placeholder="name@company.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700">Message</label>
                                <textarea
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-[#1d1aff] outline-none text-slate-900 placeholder:text-slate-400 text-sm font-medium resize-none transition-colors"
                                    placeholder="How can we help?"
                                />
                            </div>
                            <button
                                type="button"
                                className="w-full h-12 bg-[#1d1aff] hover:bg-[#1614cc] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#1d1aff]/20 active:scale-[0.98]"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
