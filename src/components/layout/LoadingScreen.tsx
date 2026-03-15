"use client";
 
import Image from "next/image";

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-[#F8FAFF] flex flex-col items-center justify-center z-[9999]">
            <div className="relative">
                {/* Outer Glow */}
                <div className="absolute -inset-4 bg-[#2F2BFF]/10 rounded-full blur-xl animate-pulse"></div>
                
                {/* Main Logo Container */}
                <div className="relative bg-white rounded-3xl p-6 shadow-2xl shadow-[#2F2BFF]/10 border border-slate-100/50">
                    <Image 
                        src="/logo2.png" 
                        alt="Isshō" 
                        width={120}
                        height={40}
                        className="h-10 w-auto object-contain animate-bounce" 
                        priority
                    />
                </div>
                
                {/* Modern Spinner */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-brand-gradient animate-[bounce_1s_infinite_0ms]"></div>
                        <div className="w-2 h-2 rounded-full bg-brand-gradient animate-[bounce_1s_infinite_200ms]"></div>
                        <div className="w-2 h-2 rounded-full bg-brand-gradient animate-[bounce_1s_infinite_400ms]"></div>
                    </div>
                </div>
            </div>
            
            <p className="mt-16 text-[10px] font-black uppercase tracking-[0.2em] text-[#2F2BFF]/60 animate-pulse">
                Setting up your connection...
            </p>
        </div>
    );
}
