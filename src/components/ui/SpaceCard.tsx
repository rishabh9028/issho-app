import Link from "next/link";
import { MapPin, Users, Star } from "lucide-react";

interface SpaceCardProps {
    id: string;
    title: string;
    location: string;
    pricePerHour: number;
    capacity: number;
    imageUrl: string;
    rating?: number;
    reviewsCount?: number;
}

export function SpaceCard({ id, title, location, pricePerHour, capacity, imageUrl, rating, reviewsCount }: SpaceCardProps) {
    return (
        <Link href={`/spaces/${id}`} className="group block">
            <div className="card-premium overflow-hidden border-0">
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-zinc-100 dark:bg-zinc-800">
                    {/* Using img for MVP, would use next/image in prod */}
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{rating}</span>
                        <span className="text-zinc-500 font-normal">({reviewsCount})</span>
                    </div>
                </div>

                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-semibold text-lg text-foreground line-clamp-1">{title}</h3>
                            <p className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {location}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                        <div className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-300">
                            <span className="font-bold text-base text-foreground">${pricePerHour}</span>
                            <span>/ hr</span>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                            <Users className="w-3.5 h-3.5" />
                            <span>Up to {capacity}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
