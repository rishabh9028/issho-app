import Link from "next/link";

const CATEGORIES = [
    {
        label: "Villas",
        count: "120+ Spaces",
        img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2670&auto=format&fit=crop",
        type: "Villa",
    },
    {
        label: "Studios",
        count: "85+ Spaces",
        img: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2670&auto=format&fit=crop",
        type: "Studio",
    },
    {
        label: "Cafes",
        count: "210+ Spaces",
        img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2670&auto=format&fit=crop",
        type: "Cafe",
    },
    {
        label: "Rooftops",
        count: "45+ Spaces",
        img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2670&auto=format&fit=crop",
        type: "Rooftop",
    },
    {
        label: "Flats",
        count: "320+ Spaces",
        img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2670&auto=format&fit=crop",
        type: "Flat",
    },
    {
        label: "Bungalows",
        count: "60+ Spaces",
        img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2670&auto=format&fit=crop",
        type: "Bungalow",
    },
    {
        label: "Workshops",
        count: "110+ Spaces",
        img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=2670&auto=format&fit=crop",
        type: "Workshop",
    },
    {
        label: "Event Spaces",
        count: "95+ Spaces",
        img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2670&auto=format&fit=crop",
        type: "Event",
    },
];

export default function CategoriesPage() {
    return (
        <div className="bg-[#F8FAFF] min-h-screen">
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-10 py-12">

                {/* Hero / Intro */}
                <section className="mb-12">
                    <div className="max-w-3xl">
                        <h1 className="text-slate-900 text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
                            Explore by Category
                        </h1>
                        <p className="text-slate-600 text-lg md:text-xl font-normal max-w-2xl">
                            Find the perfect venue for any occasion, from creative studios to luxury villas. Hourly bookings for any style of event.
                        </p>
                    </div>
                </section>

                {/* Category Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.label}
                            href={`/categories/${cat.type.toLowerCase()}`}
                            className="group relative overflow-hidden rounded-xl aspect-[4/5] bg-slate-200 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 block"
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                style={{
                                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%), url("${cat.img}")`,
                                }}
                            />
                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <h3 className="text-white text-2xl font-bold mb-1">{cat.label}</h3>
                                <p className="text-white/80 text-sm font-medium">{cat.count}</p>
                            </div>
                        </Link>
                    ))}
                </section>

                {/* Concierge CTA */}
                <section className="mt-24 mb-12 rounded-2xl bg-slate-100 p-8 md:p-12 text-center border border-slate-200/50">
                    <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
                        <h2 className="text-slate-900 text-3xl font-bold leading-tight">
                            Can&apos;t find what you&apos;re looking for?
                        </h2>
                        <p className="text-slate-600 text-lg font-normal">
                            Our concierge team can help you find exclusive, off-market spaces tailored to your exact needs.
                        </p>
                        <Link
                            href="/contact"
                            className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-12 px-8 bg-brand-gradient text-white text-base font-bold shadow-lg shadow-[#2F2BFF]/30 hover:scale-[1.02] transition-transform"
                        >
                            Contact Concierge
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
