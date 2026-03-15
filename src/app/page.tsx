"use client";

import Link from "next/link";
import { HeroSearch } from "@/components/ui/HeroSearch";
import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2670&auto=format&fit=crop", // Birthdays
  "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?q=80&w=2670&auto=format&fit=crop", // Meetups
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2669&auto=format&fit=crop", // Celebrations
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2670&auto=format&fit=crop", // Villas/Escapes
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670&auto=format&fit=crop", // Creative Studios
];

const GUEST_HOW_IMAGES = [
  "https://images.unsplash.com/photo-1522158634129-4481613993d6?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2669&auto=format&fit=crop",
];

const HOST_HOW_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531973576160-7125cd663d86?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2674&auto=format&fit=crop",
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [guestImgIndex, setGuestImgIndex] = useState(0);
  const [hostImgIndex, setHostImgIndex] = useState(0);

  useEffect(() => {
    const heroTimer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    const guestTimer = setInterval(() => {
      setGuestImgIndex((prev) => (prev + 1) % GUEST_HOW_IMAGES.length);
    }, 4500);
    const hostTimer = setInterval(() => {
      setHostImgIndex((prev) => (prev + 1) % HOST_HOW_IMAGES.length);
    }, 5000);
    return () => {
      clearInterval(heroTimer);
      clearInterval(guestTimer);
      clearInterval(hostTimer);
    };
  }, []);

  return (
    <main className="flex-1 bg-[#F8FAFF]">

      {/* ─── Hero Section ─── */}
      <section className="relative section-spacing">
        <div className="container-custom">
          <div className="relative min-h-[400px] rounded-[40px] overflow-hidden group shadow-2xl">
            {/* Background Carousel */}
            {HERO_IMAGES.map((img, index) => (
              <div
                key={img}
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.85)), url("${img}")`,
                  opacity: index === currentImageIndex ? 1 : 0,
                  zIndex: index === currentImageIndex ? 1 : 0,
                }}
              />
            ))}
            
            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-6 py-8 text-center min-h-[380px]">
              <div className="max-w-[800px] flex flex-col gap-6 mb-2 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <h1 className="text-white text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
                  Private Spaces <br />
                  <span className="text-white/90">for every gathering</span>
                </h1>
                <p className="text-white text-lg md:text-xl font-medium opacity-90 max-w-2xl mx-auto leading-relaxed">
                  List or Book beautiful homes and venues by the hour for birthdays, celebrations, meetups, events, experiences and special moments.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Link 
                    href="/search" 
                    className="px-8 py-4 bg-brand-gradient text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-[#2F2BFF]/25 active:scale-95 text-base"
                  >
                    Find/Book your Space
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all active:scale-95 text-base"
                  >
                    List your Spaces
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Search Widget - Below and Separated */}
          <div className="relative z-30 mt-4 px-4 md:px-0 flex justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="section-spacing border-t border-slate-200 scroll-mt-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-slate-900 mb-4 text-4xl font-black">How Isshō Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">The simplest way to discover unique spaces and manage your bookings effortlessly.</p>
          </div>

          <div className="flex flex-col gap-16">
            {/* For Guests Section - 50/50 Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Image Block */}
              <div className="relative overflow-hidden rounded-[32px] shadow-2xl min-h-[450px]">
                {GUEST_HOW_IMAGES.map((img, idx) => (
                  <div
                    key={img}
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
                    style={{
                      backgroundImage: `url("${img}")`,
                      opacity: idx === guestImgIndex ? 1 : 0,
                    }}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Content Block */}
              <div className="bg-white p-10 md:p-14 rounded-[32px] shadow-xl border border-[#2F2BFF]/5 flex flex-col justify-between h-full">
                <div>
                  <div className="w-14 h-14 bg-brand-gradient rounded-2xl flex items-center justify-center text-white mb-8">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-black mb-4 text-slate-900">For Guests</h3>
                  <p className="text-slate-500 text-lg mb-10 max-w-xl">Find perfect spaces for every occasion or just a simple meetup and games dates etc.</p>
                  <div className="grid sm:grid-cols-3 gap-8">
                    {[
                      { num: "1", title: "Discover", desc: "Browse vetted spaces nearby." },
                      { num: "2", title: "Book", desc: "Instant booking with secure pay." },
                      { num: "3", title: "Enjoy", desc: "Enjoy your curated environment." },
                    ].map((step) => (
                      <div key={step.num} className="flex flex-col gap-3">
                        <span className="w-10 h-10 rounded-full bg-[#2F2BFF]/10 text-[#2F2BFF] flex items-center justify-center font-bold">{step.num}</span>
                        <p className="font-bold text-slate-800 text-sm">{step.title}</p>
                        <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Link href="/search" className="mt-12 w-full sm:w-fit px-12 py-4 rounded-2xl bg-brand-gradient text-white font-bold hover:opacity-90 transition-all text-center shadow-lg shadow-[#2F2BFF]/20 active:scale-95">
                  Start Exploring
                </Link>
              </div>
            </div>

            {/* For Hosts Section - 50/50 Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Content Block (Left on Desktop) */}
              <div className="bg-white p-10 md:p-14 rounded-[32px] shadow-xl border border-slate-100 flex flex-col justify-between h-full order-2 lg:order-1">
                <div>
                  <div className="w-14 h-14 bg-brand-gradient shadow-lg shadow-blue-500/20 rounded-2xl flex items-center justify-center text-white mb-8">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-black mb-4 text-slate-900">For Hosts</h3>
                  <p className="text-slate-500 text-lg mb-10 max-w-xl">Turn your Space into a place for memories. List your home villa or terrace, cafes event spaces and earn from curated gathering.</p>
                  <div className="grid sm:grid-cols-3 gap-8">
                    {[
                      { num: "1", title: "List Free", desc: "Set your rate in minutes." },
                      { num: "2", title: "Manage", desc: "Intuitive host dashboard." },
                      { num: "3", title: "Earn", desc: "Get paid directly for each booking." },
                    ].map((step) => (
                      <div key={step.num} className="flex flex-col gap-3">
                        <span className="w-10 h-10 rounded-full bg-brand-gradient text-white flex items-center justify-center font-bold">{step.num}</span>
                        <p className="font-bold text-slate-800 text-sm">{step.title}</p>
                        <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Link href="/auth/signup" className="mt-12 w-full sm:w-fit px-12 py-4 rounded-2xl bg-brand-gradient text-white font-bold hover:opacity-90 transition-all text-center shadow-lg shadow-blue-500/20 active:scale-95">
                  List Your Space
                </Link>
              </div>

              {/* Image Block (Right on Desktop) */}
              <div className="relative overflow-hidden rounded-[32px] shadow-2xl min-h-[450px] order-1 lg:order-2">
                {HOST_HOW_IMAGES.map((img, idx) => (
                  <div
                    key={img}
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
                    style={{
                      backgroundImage: `url("${img}")`,
                      opacity: idx === hostImgIndex ? 1 : 0,
                    }}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Browse by Category ─── */}
      <section className="section-spacing bg-white/50">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-slate-900 mb-1">Browse by Category</h2>
              <p className="text-slate-500 text-sm">Hand-picked spaces for every occasion</p>
            </div>
            <Link href="/categories" className="text-[#2F2BFF] font-bold flex items-center gap-1.5 hover:underline transition-all whitespace-nowrap text-sm">
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Villas", desc: "Perfect for off-sites and shoots", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop", slug: "villa" },
              { label: "Studios", desc: "Creative hubs for creators", img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2670&auto=format&fit=crop", slug: "studio" },
              { label: "Cafes", desc: "Unique venues for small events", img: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=2670&auto=format&fit=crop", slug: "cafe" },
            ].map((cat) => (
              <Link href={`/categories/${cat.slug}`} key={cat.label} className="group relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer block">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), transparent), url("${cat.img}")` }}
                />
                <div className="absolute bottom-0 p-6">
                  <h3 className="text-white text-2xl font-bold mb-1">{cat.label}</h3>
                  <p className="text-slate-300 text-sm">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
