"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const { user, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();


    return (
        <header className="sticky top-0 z-50 w-full bg-[#F8FAFF]/80 backdrop-blur-lg">
            {/* Brand Accent Line */}
            <div className="h-1 w-full bg-brand-gradient" />
            <div className="container-custom flex items-center justify-between py-2 border-b border-[#2F2BFF]/10">

                {/* Left: Brand */}
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo2.png" alt="Isshō Logo" className="h-12 w-auto object-contain" />
                </Link>

                {/* Center: Nav Links */}
                <nav className="hidden md:flex flex-1 justify-center gap-10">
                    <Link href="/search" className={cn("text-sm font-semibold hover:text-[#2F2BFF] transition-colors", pathname === "/search" ? "text-[#2F2BFF]" : "text-slate-700")}>
                        Find Space
                    </Link>
                    <Link href="/#how-it-works" className={cn("text-sm font-semibold hover:text-[#2F2BFF] transition-colors", pathname === "/about" ? "text-[#2F2BFF]" : "text-slate-700")}>
                        How it Works
                    </Link>
                    <Link href="/contact" className={cn("text-sm font-semibold hover:text-[#2F2BFF] transition-colors", pathname === "/contact" ? "text-[#2F2BFF]" : "text-slate-700")}>
                        Contact
                    </Link>
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-2">
                            {user.role === "host" ? (
                                pathname.startsWith("/host") ? (
                                    <Link
                                        href="/start-traveling"
                                        className="hidden sm:flex px-4 py-2 text-xs font-black uppercase tracking-widest text-[#2F2BFF] hover:bg-[#2F2BFF]/5 rounded-xl transition-all"
                                    >
                                        Switch to Traveling
                                    </Link>
                                ) : (
                                    <Link
                                        href="/host/dashboard"
                                        className="hidden sm:flex px-4 py-2 text-xs font-black uppercase tracking-widest text-[#2F2BFF] hover:bg-[#2F2BFF]/5 rounded-xl transition-all"
                                    >
                                        Switch to Hosting
                                    </Link>
                                )
                            ) : (
                                <Link
                                    href="/become-a-host"
                                    className="hidden sm:flex px-4 py-2 text-xs font-black uppercase tracking-widest text-[#2F2BFF] hover:bg-[#2F2BFF]/5 rounded-xl transition-all"
                                >
                                    Become a Host
                                </Link>
                            )}
                            <Link
                                href={user.role === "host" && pathname.startsWith("/host") ? "/host/dashboard" : user.role === "host" ? "/host/dashboard" : "/guest/dashboard"}
                                className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#2F2BFF]/10 hover:border-[#2F2BFF] transition-all"
                            >
                                <img 
                                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                                    className="w-full h-full object-cover" 
                                    alt="Profile" 
                                />
                            </Link>
                            <button
                                onClick={signOut}
                                className="btn-airbnb-outline"
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/auth/signup"
                                className="hidden sm:flex btn-airbnb-primary"
                            >
                                List your space
                            </Link>
                            <Link
                                href="/auth/login"
                                className="btn-airbnb-outline"
                            >
                                Login
                            </Link>
                        </>
                    )}

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-slate-700"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-1">
                    <Link 
                        href="/search" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-[#2F2BFF] hover:bg-slate-50 rounded-lg"
                    >
                        Find Space
                    </Link>
                    <Link 
                        href="/#how-it-works" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-[#2F2BFF] hover:bg-slate-50 rounded-lg"
                    >
                        How it Works
                    </Link>
                    <Link 
                        href="/contact" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-[#2F2BFF] hover:bg-slate-50 rounded-lg"
                    >
                        Contact
                    </Link>
                    {!user ? (
                        <>
                            <Link 
                                href="/auth/login" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                            >
                                Login
                            </Link>
                            <Link 
                                href="/auth/signup" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 text-sm font-semibold text-[#2F2BFF] hover:bg-slate-50 rounded-lg"
                            >
                                List your space
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link 
                                href={user.role === "host" ? "/host/dashboard" : "/guest/dashboard"} 
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                            >
                                Dashboard
                            </Link>
                            <button 
                                onClick={() => {
                                    signOut();
                                    setMobileMenuOpen(false);
                                }} 
                                className="block w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                Log out
                            </button>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
