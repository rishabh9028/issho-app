"use client";

import { useAuth, Role } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
    const { loginAs } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>("guest");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate a short loading delay for realism
        await new Promise((r) => setTimeout(r, 800));

        loginAs(selectedRole);
        router.push(selectedRole === "host" ? "/host/dashboard" : "/guest/dashboard");
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-[#f8f6f6] min-h-[calc(100vh-73px)]">
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-blue-500/5 border border-slate-100 p-12">

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Welcome Back</h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Enter your credentials to access your account.
                    </p>
                </div>

                {/* Role Selector */}
                <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 relative">
                    <button
                        onClick={() => setSelectedRole("guest")}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all relative z-10 ${selectedRole === "guest" ? "text-[#1d1aff]" : "text-slate-400"
                            }`}
                    >
                        Guest Login
                    </button>
                    <button
                        onClick={() => setSelectedRole("host")}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all relative z-10 ${selectedRole === "host" ? "text-[#1d1aff]" : "text-slate-400"
                            }`}
                    >
                        Host Login
                    </button>
                    <div
                        className="absolute h-[calc(100%-12px)] top-1.5 bg-white rounded-xl shadow-sm transition-all duration-300 ease-out z-0"
                        style={{
                            width: "calc(50% - 6px)",
                            left: selectedRole === "guest" ? "6px" : "calc(50%)"
                        }}
                    ></div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-slate-200 bg-white focus-within:border-[#1d1aff] focus-within:ring-4 focus-within:ring-[#1d1aff]/5 transition-all">
                            <span className="material-symbols-outlined text-slate-300 text-xl font-black">mail</span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-300 text-sm font-bold"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Password</label>
                        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-slate-200 bg-white focus-within:border-[#1d1aff] focus-within:ring-4 focus-within:ring-[#1d1aff]/5 transition-all">
                            <span className="material-symbols-outlined text-slate-300 text-xl font-black">lock</span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-300 text-sm font-bold"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pr-2">
                        <a href="#" className="text-xs text-[#1d1aff] font-black uppercase tracking-widest hover:underline">
                            Forgot?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1d1aff] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 mt-6 shadow-xl shadow-blue-500/20"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span className="text-sm font-black uppercase tracking-widest">Sign In as {selectedRole}</span>
                                <span className="material-symbols-outlined font-black text-lg">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">or continue with</span>
                    <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Google */}
                <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-[10px] font-black uppercase tracking-widest text-slate-600">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                    Google Account
                </button>

                {/* Footer */}
                <p className="mt-10 text-center text-sm text-slate-400 font-medium">
                    New to Isshō?{" "}
                    <Link href="/auth/signup" className="text-[#1d1aff] font-black hover:underline uppercase tracking-widest text-xs ml-1">
                        Sign up free
                    </Link>
                </p>
            </div>

            <Link href="/" className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
                Back to explore
            </Link>
        </div>
    );
}
