"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { signup } from "@/actions/auth";

export default function SignupPage() {
    const router = useRouter();
    const [role, setRole] = useState<"guest" | "host">("host");
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isGoldHost, setIsGoldHost] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('name', name);
        formData.append('role', role);
        formData.append('isGoldHost', isGoldHost.toString());

        const result = await signup(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        if (result?.success) {
            setSuccess(true);
            setLoading(false);
            
            // Redirect after a delay
            setTimeout(() => router.push("/auth/login"), 3000);
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center px-4 py-12 bg-[#F8FAFF] min-h-screen flex-col">
            <div className="w-full max-w-[480px] bg-white shadow-xl border border-[#2F2BFF]/10 overflow-hidden rounded-xl">

                {/* Main Card Body */}
                <div className="p-8 pb-4">

                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-8 justify-center">
                        <img src="/logo2.png" alt="Isshō" className="h-10 w-auto object-contain" />
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black leading-tight tracking-tight mb-2 text-slate-900">Create your account</h1>
                        <p className="text-slate-500">Join the premium community of creators.</p>
                    </div>

                    <div className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        {success ? (
                            <div className="bg-green-50 border border-green-100 text-green-700 p-8 rounded-xl text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-black">Verify your email</h2>
                                <p className="text-sm font-medium">We've sent a magic link to <span className="font-bold">{email}</span>. Please check your inbox to complete registration.</p>
                                <p className="text-xs text-green-600/70 pt-4">Redirecting to login...</p>
                            </div>
                        ) : (
                            <>

                                {/* Host / Guest Toggle */}
                                <div className="flex gap-2 p-1 bg-slate-100 mb-6 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setRole("host")}
                                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === "host" ? "bg-white shadow-sm text-[#2F2BFF]" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Host
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole("guest")}
                                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === "guest" ? "bg-white shadow-sm text-[#2F2BFF]" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Guest
                                    </button>
                                </div>

                                {/* Fields */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-slate-700">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 h-12 border border-slate-200 bg-white focus:ring-2 focus:ring-[#2F2BFF] focus:border-[#2F2BFF] outline-none transition-all placeholder:text-slate-400 rounded-lg text-sm font-medium"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-slate-700">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 h-12 border border-slate-200 bg-white focus:ring-2 focus:ring-[#2F2BFF] focus:border-[#2F2BFF] outline-none transition-all placeholder:text-slate-400 rounded-lg text-sm font-medium"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-slate-700">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 h-12 border border-slate-200 bg-white focus:ring-2 focus:ring-[#2F2BFF] focus:border-[#2F2BFF] outline-none transition-all placeholder:text-slate-400 pr-12 rounded-lg text-sm font-medium"
                                                placeholder="Min. 8 characters"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Gold Host Promotion - Only for Hosts */}
                                    {role === "host" && (
                                        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                            <div className="flex items-start gap-3">
                                                <div className="pt-0.5">
                                                    <input
                                                        id="goldHost"
                                                        type="checkbox"
                                                        checked={isGoldHost}
                                                        onChange={(e) => setIsGoldHost(e.target.checked)}
                                                        className="h-5 w-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label htmlFor="goldHost" className="block text-sm font-black text-amber-900 group cursor-pointer selection:bg-amber-200">
                                                        Become a <span className="text-amber-600">Gold Host</span> 🌟
                                                    </label>
                                                    <p className="text-[11px] font-medium text-amber-700 leading-relaxed mt-1">
                                                        Get prioritized in search results, exclusive badges, and 2x more visibility for just <span className="font-bold">₹200/month</span>.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Terms */}
                                    <div className="flex items-start gap-3 py-2">
                                        <input
                                            id="terms"
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            className="mt-1 rounded border-slate-300 text-[#2F2BFF] focus:ring-[#2F2BFF] h-4 w-4"
                                        />
                                        <label htmlFor="terms" className="text-sm text-slate-500 leading-tight">
                                            I agree to the{" "}
                                            <a href="#" className="text-[#2F2BFF] hover:underline">Terms of Service</a>
                                            {" "}and{" "}
                                            <a href="#" className="text-[#2F2BFF] hover:underline">Privacy Policy</a>.
                                        </label>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={!agreed || loading}
                                        className="w-full h-12 bg-brand-gradient hover:bg-[#1614cc] disabled:opacity-60 text-white font-bold shadow-lg shadow-[#2F2BFF]/20 transition-all active:scale-[0.98] rounded-lg flex items-center justify-center"
                                    >
                                        {loading ? (
                                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        ) : "Create Account"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer stripe */}
                <div className="bg-slate-50 p-6 text-center border-t border-slate-100 mt-4">
                    <p className="text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-bold text-[#2F2BFF] hover:underline">Log in</Link>
                    </p>
                </div>
            </div>

            {/* Page footer */}
            <footer className="p-8 text-center">
                <p className="text-xs text-slate-400 font-medium">© 2025 Isshō Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}
