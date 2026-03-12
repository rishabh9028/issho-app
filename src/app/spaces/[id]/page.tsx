"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import spacesData from "@/data/spaces.json";

export default function SpaceDetail() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const spaceId = params.id as string;

    // Use mock data or fallback
    const space = spacesData.find((s) => s.id === spaceId) || spacesData[0];

    return (
        <div className="bg-[#f8f6f6] min-h-screen text-slate-900">
            <main className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-20 py-8">
                {/* Hero Section / Image Gallery */}
                <section className="mb-10 grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[500px]">
                    <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-xl">
                        <img
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            alt="Main exterior view of minimalist luxury villa"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9v0QwNRPRV6R5fjvaqfcypaZW6pYGhLljgu1fprm2TTgGoN4CgIwwL5tfDsqVct5vGC_58mdoZha3hoaNiO31etwp9-lZVU71EjOcNmyMsLfgUxvQXz_Xsk-HJUL-q2v4ahgXVVwQ6mZ2hE5j22W0jWHoKqRZUTM6qG7bg9heEk32dX3KtLYCtYybk4oo11ibo802o5rWZnGvJRJuIssZod0pHZrGMA54faGPueCa6vxzpWKDJuRUcghn_-eNbtOx3v7YqU0UxQ"
                        />
                        <button className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm hover:bg-white transition-colors">
                            <span className="material-symbols-outlined text-sm">grid_view</span> View all photos
                        </button>
                    </div>
                    <div className="hidden md:block overflow-hidden rounded-xl">
                        <img className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" alt="Modern living room" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8Ia_jOnWI69bLqRlHz1rcVADAk05DyaiCMJjygLqleukx1_w7ocDeOc-kCU7XiRuLOkWjnbg03WXKj4pP3H7mLGwrtqN8UVhr6dmpt-Z-hFhkj-brCwphARfKnyhK8-eprkrmKEHdtk07qWtCCxMZUJ5qCyMSxfuf4uWwJ8pNZEOaVCpDN4rtuUiH3fSkJkS1D0Ko99km70AHsOHvazhckIs7ukvVx8khY-m_yZB8meEm1Kv2c1abkw3WheDTFLsSc6rzCE-T2Q" />
                    </div>
                    <div className="hidden md:block overflow-hidden rounded-xl">
                        <img className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" alt="Minimalist bedroom" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRoiwkirnileHBivCxpXpz-yhHS2s_kO1MLalMQnFEE0-LRoLDC9Ej1V7vTM97rP_984uDfuJrtgFNTBeD-Sba1gwr_2Fagb-gbOSAStYUFPlMSiyK5k0VtTXL0nBoZ0DIMQnpTSFExxHTBcyALbN5VZOoTiV3kqy3X2Ot6HIctGW0AjzSP-qhn4ptoSP1Yar62UvWfg4hQxPHmHkkcoof3MGpIc95PHRPo2MNjX67mtVM1LnNP8d81XRxVid4iuXBX9r615LmBw" />
                    </div>
                    <div className="hidden md:block overflow-hidden rounded-xl">
                        <img className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" alt="Infinity pool" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT1e0WcieGDXaUpsoF2GvCGnMRrL6JfcHPgl_RUTCZpYsj-3NYVNZ2uFdmEb280q67r7OxJ7fH5PG5bVzmoQ9aFUnXjqVDH4pxIww5bIA6mmmrdT3ZmZzZVQHpOa5SllQ-CyYTup2GdFsSla8tPrm52huSvGGFWrbUAj249XadX_IFwwHMFEkGYOobJ9HsBh67NS50DVmcuadvQiZJlmh26BTmu2e2wtlRjhOm7qOh9gtrjpHktmNHnUBjKaElipdePzdylYMniA" />
                    </div>
                    <div className="hidden md:block overflow-hidden rounded-xl">
                        <img className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" alt="Elegant kitchen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm7yFAMISAB160D_e0TA4MghmQQ-5JfIRFfyVpJQlsGDoteSPqosJfWpZw5oFJLbHs19DKoakhBdrWDSiamezktTpbG2OktBCxEQ_RvHF-g3f_nuWGF3iVZOFC7TuMOFkQkaKCB8WWNwV9RwgmYXSHVIxRrRaLgKhCwYB0pxeg7nAvPRwUnCqTjgfdzGTjwePVu1y1q2gnC0RnUhvpxUK6xCK7I8Ju7MShi5CHFh_sCQj59ic5sXhK_PvJV35bSUbWus9Wt487qg" />
                    </div>
                </section>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content Column */}
                    <div className="flex-1">
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{space.title || "Modern Minimalist Villa with Private Pool"}</h1>
                                <button className="p-2 rounded-full hover:bg-[#1d1aff]/10 border border-slate-200 transition-colors">
                                    <span className="material-symbols-outlined">share</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[#1d1aff] text-lg fill-1">star</span> 4.9 · 124 reviews
                                </span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-lg">location_on</span> {space.location || "Shibuya, Tokyo"}
                                </span>
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-200 my-8"></div>

                        {/* Host Section */}
                        <div className="flex items-center gap-4 mb-8">
                            <div
                                className="h-14 w-14 rounded-full bg-cover bg-center border border-slate-100 shadow-sm"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdfPNMucMuSUNyDYhe7_lidlIxF3soI4WtCAt-b-PdtD4zRJyMcIcueyUuRBCjhKyUGNaozNOiMKqY5CfZype_fWp9wV18HYPgIl2cBXI9R62ScAAcbfkl19fVp1HEQSD0PLECtOpYc5q-sdoGOAXxEb3fNt6LjLoIEw4062phXaRA5v8rDlCW5NvCJnmQeiKBTHxDI3WWNIitEoSooW7TQS_CRR_kqQp-6KAuhRe7HC00gS9lD-DmBdAaXMcP7AMUssYLNqLafQ')" }}
                            ></div>
                            <div>
                                <p className="text-lg font-bold text-slate-900">Hosted by Yuki</p>
                                <p className="text-sm text-slate-500 font-medium">Superhost · Joined in 2021</p>
                            </div>
                            <button className="ml-auto rounded-xl border-2 border-[#1d1aff] px-5 py-2 text-sm font-bold text-[#1d1aff] hover:bg-[#1d1aff] hover:text-white transition-all transform active:scale-95">
                                Message Host
                            </button>
                        </div>

                        {/* Description */}
                        <div className="mb-10">
                            <p className="text-lg leading-relaxed text-slate-600 font-medium">
                                Experience the pinnacle of Japanese minimalism in this architectural masterpiece located in the heart of Shibuya. Designed with clean lines and a focus on natural light, this villa offers a serene escape from the urban hustle.
                            </p>
                            <p className="text-lg leading-relaxed text-slate-600 font-medium mt-4">
                                The space features double-height ceilings and floor-to-ceiling glass walls that seamlessly blend indoor and outdoor living. Perfectly suited for creative workshops, high-end photoshoots, or executive retreats.
                            </p>
                        </div>

                        {/* Amenities Section */}
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">What this space offers</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6">
                                <div className="flex items-center gap-4 group">
                                    <span className="material-symbols-outlined text-[#1d1aff] text-2xl group-hover:scale-110 transition-transform">wifi</span>
                                    <span className="text-slate-700 font-bold">Fast Wi-Fi (500Mbps+)</span>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <span className="material-symbols-outlined text-[#1d1aff] text-2xl group-hover:scale-110 transition-transform">coffee</span>
                                    <span className="text-slate-700 font-bold">Premium Coffee Station</span>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <span className="material-symbols-outlined text-[#1d1aff] text-2xl group-hover:scale-110 transition-transform">light_mode</span>
                                    <span className="text-slate-700 font-bold">Abundant Natural Light</span>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <span className="material-symbols-outlined text-[#1d1aff] text-2xl group-hover:scale-110 transition-transform">pool</span>
                                    <span className="text-slate-700 font-bold">Private Heated Pool</span>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <span className="material-symbols-outlined text-[#1d1aff] text-2xl group-hover:scale-110 transition-transform">groups</span>
                                    <span className="text-slate-700 font-bold">Capacity up to 20 people</span>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <span className="material-symbols-outlined text-[#1d1aff] text-2xl group-hover:scale-110 transition-transform">videocam</span>
                                    <span className="text-slate-700 font-bold">Professional Gear Support</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-200 my-8"></div>

                        {/* Reviews Section */}
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-8">
                                <span className="material-symbols-outlined text-[#1d1aff] text-2xl fill-1">star</span>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">4.9 · 124 reviews</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-full bg-slate-200 bg-cover bg-center border border-slate-100"
                                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuASWt8frwknyiWzE33PB3FJC5TxpduLqQ9P1SNoOc3Qsavjf3Ye6_h_MAuFrph_-ezLPUi3jasZZOckT2F4syXyXVYwx8PH0sQk2dz1gZH0VztHQi5mWYrVmNkf6Pix6jPz1hDUcpNV7NmsiNJScLivg3SnWOyZsK3Kf8qCYu2KBAxWiO0-rQVP1QeHnxtYaRE3xvac2N0yDjNwA-U3PvKJBHKt82nyHvOdKUSC5Te1-e63p-bmGVtyZMkRt-M2UR9YpEDo14RVtg')" }}
                                        ></div>
                                        <div>
                                            <p className="font-bold text-slate-900">Kenji Tanaka</p>
                                            <p className="text-xs text-slate-500 font-medium">October 2023</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed font-medium">"The lighting in this space is incredible. We used it for a brand photoshoot and didn't need half our lighting rig. Yuki was a fantastic host."</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-full bg-slate-200 bg-cover bg-center border border-slate-100"
                                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBOIS0xmIhUr6qRMFPcbj_9q3clinHqOunSuk08WDDxJqJSiq7dSdBPn1NNQVbSYR7O8d2yfahfMxI6sUac5W0oTmdQ-R2rVNOQLxeTmjPDM1ZzXMfhPp2OONRpx_Akna6UjhMjQHmamKMRY7cNC8V8caE9UUMAAdESPMnYBkqhT-9NuQzE5jHE0VnlnnTNmaAIhL7h8OH7LDGjH9cfGdpDPBvzMBu4TquXh2QoVJZ3bVGDFZk6Tjy27qg_fCP-ERsQ_Jnj_qBTPg')" }}
                                        ></div>
                                        <div>
                                            <p className="font-bold text-slate-900">Sarah Williams</p>
                                            <p className="text-xs text-slate-500 font-medium">September 2023</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed font-medium">"Perfect for our team workshop. The pool area is great for breaks, and the minimalist aesthetic really helped our team stay focused."</p>
                                </div>
                            </div>
                            <button className="mt-8 rounded-xl border border-slate-900 px-6 py-3 font-bold hover:bg-slate-900 hover:text-white transition-all transform active:scale-95">
                                Show all reviews
                            </button>
                        </div>
                    </div>

                    {/* Sticky Booking Widget */}
                    <aside className="w-full lg:w-96">
                        <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-[#1d1aff]/5">
                            <div className="flex items-end gap-1 mb-6">
                                <span className="text-3xl font-black text-[#1d1aff]">¥5,000</span>
                                <span className="text-slate-500 font-bold mb-1">/ hour</span>
                            </div>

                            <div className="rounded-xl border border-slate-300 overflow-hidden mb-4">
                                <div className="grid grid-cols-2 border-b border-slate-300">
                                    <div className="p-3 border-r border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer">
                                        <label className="block text-[10px] font-black uppercase text-slate-500">Date</label>
                                        <input className="w-full border-none p-0 text-sm font-bold bg-transparent focus:ring-0 text-slate-900" type="text" defaultValue="2023-11-24" />
                                    </div>
                                    <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                                        <label className="block text-[10px] font-black uppercase text-slate-500">Start Time</label>
                                        <select className="w-full border-none p-0 text-sm font-bold bg-transparent focus:ring-0 text-slate-900">
                                            <option>10:00 AM</option>
                                            <option>02:00 PM</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                                    <label className="block text-[10px] font-black uppercase text-slate-500">Duration</label>
                                    <select className="w-full border-none p-0 text-sm font-bold bg-transparent focus:ring-0 text-slate-900">
                                        <option>4 hours</option>
                                        <option>8 hours</option>
                                        <option>Full day</option>
                                    </select>
                                </div>
                            </div>

                            <button className="w-full rounded-xl bg-[#1d1aff] py-4 text-center font-black text-white hover:brightness-110 transition-all shadow-lg shadow-[#1d1aff]/30 transform active:scale-[0.98]">
                                Request to Book
                            </button>
                            <p className="mt-4 text-center text-xs text-slate-500 font-bold">You won't be charged yet</p>

                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="underline decoration-slate-300 text-slate-600">¥5,000 x 4 hours</span>
                                    <span className="font-bold text-slate-900">¥20,000</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="underline decoration-slate-300 text-slate-600">Service fee</span>
                                    <span className="font-bold text-slate-900">¥1,200</span>
                                </div>
                                <div className="h-px bg-slate-200 my-2"></div>
                                <div className="flex justify-between font-black text-xl text-slate-900">
                                    <span>Total</span>
                                    <span>¥21,200</span>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-4 p-4 rounded-xl bg-[#1d1aff]/5 text-[#1d1aff] border border-[#1d1aff]/10">
                                <span className="material-symbols-outlined font-bold">verified_user</span>
                                <span className="text-xs font-bold leading-tight">Isshō Guarantee: We protect your booking against cancellations.</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
