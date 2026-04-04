import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import SearchClient from "./SearchClient";

// This is a Server Component
export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const location = (resolvedParams.location as string) || "";
    const type = (resolvedParams.type as string) || "All";
    const sortBy = (resolvedParams.sort as string) || "recommended";
    const amenities = (resolvedParams.amenities as string)?.split(",") || [];
    const pets = resolvedParams.pets === "true";
    const minPrice = resolvedParams.minPrice as string;
    const maxPrice = resolvedParams.maxPrice as string;
    const minCapacity = resolvedParams.minCapacity as string;
    const minRating = Number(resolvedParams.rating) || 0;

    const supabase = await createClient();

    // Initial query on the server to avoid client-side waterfall
    let query = supabase
        .from("spaces")
        .select("id, title, location, price_per_hour, capacity, type, amenities, images, rating, is_pet_friendly, host_id");

    if (location) query = query.ilike("location", `%${location}%`);
    if (type !== "All") query = query.ilike("type", type);
    if (pets) query = query.eq("is_pet_friendly", true);
    if (amenities.length > 0) query = query.contains("amenities", amenities);
    if (minPrice) query = query.gte("price_per_hour", parseFloat(minPrice));
    if (maxPrice) query = query.lte("price_per_hour", parseFloat(maxPrice));
    if (minCapacity) query = query.gte("capacity", parseInt(minCapacity));
    if (minRating > 0) query = query.gte("rating", minRating);

    // Sorting
    if (sortBy === "price_asc") query = query.order("price_per_hour", { ascending: true });
    else if (sortBy === "price_desc") query = query.order("price_per_hour", { ascending: false });
    else if (sortBy === "rating") query = query.order("rating", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    let enrichedSpaces: any[] = [];
    if (data && data.length > 0) {
        const hostIds = [...new Set(data.map((s: any) => s.host_id).filter(Boolean))];
        let goldHostSet = new Set<string>();
        
        if (hostIds.length > 0) {
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, is_gold_host")
                .in("id", hostIds)
                .eq("is_gold_host", true);
            if (profiles) {
                goldHostSet = new Set(profiles.map((p: any) => p.id));
            }
        }

        enrichedSpaces = data.map((s: any) => ({
            ...s,
            profiles: { is_gold_host: goldHostSet.has(s.host_id) }
        })).sort((a, b) => {
            const aGold = a.profiles?.is_gold_host ? 1 : 0;
            const bGold = b.profiles?.is_gold_host ? 1 : 0;
            return bGold - aGold;
        });
    }

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#F8FAFF]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#2F2BFF]/20 border-t-[#2F2BFF] rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium text-sm">Finding spaces...</p>
                </div>
            </div>
        }>
            <SearchClient 
                initialSpaces={enrichedSpaces} 
                initialLocation={location} 
            />
        </Suspense>
    );
}
