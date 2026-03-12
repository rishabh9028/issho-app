export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-4xl font-extrabold text-foreground mb-6">About Isshō</h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                Isshō is a modern marketplace designed to bring people together by unlocking access to unique, underutilized spaces around the city. Whether you need a private rooftop for a birthday, a quiet studio for a photoshoot, or a premium villa for a weekend retreat, we make finding and booking the perfect space effortless.
            </p>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card-premium p-6">
                    <h3 className="font-bold text-lg mb-2 text-primary-600">Our Mission</h3>
                    <p className="text-zinc-500 text-sm">To democratize access to premium spaces and empower hosts to monetize their properties.</p>
                </div>
                <div className="card-premium p-6">
                    <h3 className="font-bold text-lg mb-2 text-rose-500">For Guests</h3>
                    <p className="text-zinc-500 text-sm">Discover uniquely curated spaces with flexible hourly booking and instant confirmation.</p>
                </div>
                <div className="card-premium p-6">
                    <h3 className="font-bold text-lg mb-2 text-emerald-500">For Hosts</h3>
                    <p className="text-zinc-500 text-sm">Turn your unused space into a flexible revenue stream with full control over scheduling.</p>
                </div>
            </div>
        </div>
    );
}
