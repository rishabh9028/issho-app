"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GuestSidebar from "@/components/guest/GuestSidebar";
import Link from "next/link";

const FAVORITES = [
    {
        id: "1",
        title: "Zen Garden Studio",
        location: "Shinjuku, Tokyo",
        rating: "4.9",
        price: "25",
        premium: true,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1GVrejrvj9eZFSi0fFaAUI0d5MnVtRhJfvyj5WF_QZ3Yjtv0RK2EI2JYZ1pL4Knjyrz8ZDykno84iOG7Cw0d6yD4Nj4zv-qGR64T4z7VZ5KvWGhr-lYzfR5_SAfjm8Q8tlw5wmsDk_dh0774lVtr9mJ_WoonZDgITbWD3d5JIuOFuLeDZUdFLSvjJJ0JON5a3Ejb0MIsqpY646i8mVqcrBkKIm01v1d4QbeOyfK5Fu3Z4__yCFaDwaJm-Vwktl23WNmy_L7UpgQ"
    },
    {
        id: "2",
        title: "Industrial Loft",
        location: "Brooklyn, NY",
        rating: "4.8",
        price: "40",
        premium: false,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDW7x7PS00rvkyAjxEMO6c_LaHXGbnEQbKBl7092Q0hXu7UShmog05UcQL-LvSdotX8VoiUTXoa0kop2Ic8hghue07AMO9XSomMq6XAcGqAninlC4997WttN1oNVRRw7cXS4XvOoXlEEQcSaFTGZKoWtQp2HdJi9A6VFzOVDAE_v3WTvIez3Ef3Dr5C01xKp8cp7SNJVM4BywKK6sLSZsXm7F8ohp9xwc8pkamF2y9BScCKgFpwlxm8pvCf6j8ugpFNEXV5ug96DA"
    },
    {
        id: "3",
        title: "Minimalist Hub",
        location: "Mitte, Berlin",
        rating: "4.7",
        price: "18",
        premium: false,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5pdyimRVl1MHoKGw8hA9Vx40BZSu2vguzaXQBuZaRv05qCj--AAg9FbRuT9dPY45XENDwEohBcNwpTrB4q__V3WbKByNXsNy1gDj7kMWaBAwrUJ_0bjov6gObZhWYBvI-WemjVvwg0zACibIF_Subbas2YKsEA_GBv8NGt_LBkfUZADO_wZXBt7bLlXtzKaZFgO_HT1pKYJGRt1v9aVCWHprCzc-y1Qip3JccV2Z9iFZ6oV4OT2NrLIOVepPqphvHUQcwt5EGKQ"
    },
    {
        id: "4",
        title: "Creative Corner",
        location: "Shoreditch, London",
        rating: "4.9",
        price: "35",
        premium: false,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNrUjFZBtYQRWdBxnYWmuhUHOKud6OUF0rv0CtJdt6COC2eXG1e004uUDOZ7-nvJiijLHD3XN1inUO-bqlpwNZ0cJuVOEDWFp1e2a9FTcS7IyB5XFyDIrrnlOwB0L_pk_yaQC3wBVPqdor1vXQPoE9Ik5eXN9x-KirSvkPtSJNtDFkWuS9drtplt5VxZj-qmJLSTCN3iujZ1p__7z4tCP_BysnHMfSoo5_uK2h6ycvIHlfvLUjtDIv9riRS2tegxVeX8i6VA5jwA"
    }
];

export default function Favorites() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
        } else if (user.role !== "guest" && user.role !== "admin") {
            router.push("/host/dashboard");
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="w-full bg-[#f8f6f6] min-h-screen">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    <GuestSidebar user={user} currentPage="favorites" />

                    <div className="flex-1">
                        {/* Header Section */}
                        <header className="mb-10 flex flex-wrap justify-between items-end gap-4">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-slate-900 text-4xl font-black tracking-tight">Favorites</h1>
                                <p className="text-slate-500 text-lg font-medium">Your curated selection of saved workspaces and studios</p>
                            </div>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                                <button
                                    onClick={() => setActiveTab("all")}
                                    className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "all" ? "bg-[#1d1aff] text-white shadow-md shadow-blue-500/20" : "text-slate-500 hover:text-slate-900"
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveTab("workspaces")}
                                    className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "workspaces" ? "bg-[#1d1aff] text-white shadow-md shadow-blue-500/20" : "text-slate-500 hover:text-slate-900"
                                        }`}
                                >
                                    Workspaces
                                </button>
                                <button
                                    onClick={() => setActiveTab("studios")}
                                    className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "studios" ? "bg-[#1d1aff] text-white shadow-md shadow-blue-500/20" : "text-slate-500 hover:text-slate-900"
                                        }`}
                                >
                                    Studios
                                </button>
                            </div>
                        </header>

                        {/* Grid of Saved Spaces */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {FAVORITES.map((space) => (
                                <div key={space.id} className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img
                                            src={space.image}
                                            alt={space.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <button className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-[#1d1aff] shadow-lg hover:scale-110 active:scale-90 transition-all">
                                            <span className="material-symbols-outlined font-black filled-icon">favorite</span>
                                        </button>
                                        {space.premium && (
                                            <div className="absolute bottom-4 left-4">
                                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">Premium</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{space.title}</h3>
                                                <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">location_on</span> {space.location}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-[#1d1aff]/5 px-2 py-1 rounded-lg">
                                                <span className="material-symbols-outlined text-xs text-yellow-500 filled-icon font-black">star</span>
                                                <span className="text-xs font-black text-[#1d1aff]">{space.rating}</span>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                            <p className="text-xl font-black text-slate-900">${space.price}<span className="text-slate-400 font-bold text-sm">/hr</span></p>
                                            <button className="px-5 py-2.5 bg-[#1d1aff] text-white text-xs font-black rounded-xl hover:brightness-110 transition-all shadow-md shadow-blue-500/10 active:scale-95">Book Now</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Suggested for you section */}
                        <section className="mt-20">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Suggested for you</h2>
                                <Link className="text-[#1d1aff] font-black text-sm hover:underline" href="/search">See all recommendations</Link>
                            </div>
                            <div className="bg-[#1d1aff]/5 rounded-[32px] p-8 flex flex-col lg:flex-row gap-8 items-center border border-[#1d1aff]/10">
                                <div className="w-full lg:w-1/3 aspect-video rounded-3xl overflow-hidden shadow-xl shadow-blue-500/5 group">
                                    <img
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDA9Ws-EAPZ-G3qqKy47RqyAC4rBil5xZDMi23iTHM_ta1-5yZ_e4HbHIeap0HYfl6qITFHDTtHogiDpjGE6uFvaPqBzN4r46IA59hI0lEzkei-k3lo4h-PTQ2Tekx9ic3KMV1MiQiwSFdjNuqSLCOUqy6PbgzZI8UGk3K3E8Ck1mkVNEGGKs_piesCT0yNOPlRaa9LTPjtJ6PTAaGm0w_2YBYTc4Zsw_mXcQXcgKAc68RQKzSp1du-KbuvejKsR5yBhGYutgs4CQ"
                                        alt="The Library Lounge"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col gap-4">
                                    <span className="text-[#1d1aff] text-[10px] font-black uppercase tracking-widest bg-white px-3 py-1 w-fit rounded-full shadow-sm">New Arrival</span>
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 leading-tight mb-2">The Library Lounge</h3>
                                        <p className="text-slate-500 font-medium leading-relaxed">Based on your love for Zen Garden Studio, you might enjoy this whisper-quiet library lounge in Aoyama.</p>
                                    </div>
                                    <div className="flex gap-6 items-center">
                                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                            <span className="material-symbols-outlined text-[#1d1aff]">wifi</span>
                                            Gigabit Fiber
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                            <span className="material-symbols-outlined text-[#1d1aff]">coffee</span>
                                            Specialty Coffee
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:pl-6">
                                    <Link
                                        href="/spaces/library-lounge"
                                        className="bg-[#1d1aff] text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all inline-block"
                                    >
                                        View Space
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
