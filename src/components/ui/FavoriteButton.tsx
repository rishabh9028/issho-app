"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
    spaceId: string;
    className?: string;
}

export default function FavoriteButton({ spaceId, className = "" }: FavoriteButtonProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const checkFavoriteStatus = async () => {
            const { data, error } = await supabase
                .from("user_favorites")
                .select("id")
                .eq("user_id", user.id)
                .eq("space_id", spaceId)
                .single();

            if (data) {
                setIsFavorite(true);
            }
            setLoading(false);
        };

        checkFavoriteStatus();
    }, [user, spaceId]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if this is inside a Link
        e.stopPropagation(); // Prevent triggering parent onClick events
        
        if (!user) {
            router.push("/auth/login");
            return;
        }

        const currentStatus = isFavorite;
        // Optimistic UI update
        setIsFavorite(!currentStatus);

        try {
            if (currentStatus) {
                // Remove from favorites
                const { error } = await supabase
                    .from("user_favorites")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("space_id", spaceId);
                
                if (error) throw error;
            } else {
                // Add to favorites
                const { error } = await supabase
                    .from("user_favorites")
                    .insert([{ user_id: user.id, space_id: spaceId }]);
                
                if (error) throw error;
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            // Revert on error
            setIsFavorite(currentStatus);
        }
    };

    if (loading) return <div className={`w-8 h-8 animate-pulse bg-slate-100 rounded-full ${className}`} />;

    return (
        <button
            onClick={toggleFavorite}
            className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 ${className}`}
            aria-label={isFavorite ? "Remove from saved" : "Save space"}
        >
            <Heart
                className={`w-4 h-4 transition-colors ${
                    isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-400"
                }`}
            />
        </button>
    );
}
