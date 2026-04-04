"use client";

import Link from "next/link";
import { MapPin, Users, Star, Heart } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CuratedCardProps {
  id: string;
  title: string;
  location: string;
  pricePerHour: number;
  capacity: number;
  imageUrl: string;
  rating?: number;
  reviewsCount?: number;
  isFavorite?: boolean;
}

export function CuratedCard({
  id,
  title,
  location,
  pricePerHour,
  capacity,
  imageUrl,
  rating = 4.9,
  reviewsCount = 12,
  isFavorite = false,
}: CuratedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group relative"
    >
      <Link href={`/spaces/${id}`} className="block">
        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-100 shadow-premium group-hover:shadow-premium-hover transition-all duration-500">
          <Image
            src={imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <div className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-slate-900">{rating}</span>
            </div>
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-900 hover:text-red-500 transition-colors shadow-sm">
              <Heart className={cn("w-5 h-5", isFavorite && "fill-red-500 text-red-500")} />
            </button>
          </div>

          {/* Bottom Info (Overlaid on Image) */}
          <div className="absolute bottom-6 left-6 right-6 text-white z-10">
            <p className="flex items-center gap-1.5 text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">
              <MapPin className="w-3 h-3" />
              {location}
            </p>
            <h3 className="text-xl font-bold leading-tight mb-3 line-clamp-1 group-hover:text-white transition-colors">
              {title}
            </h3>
            <div className="flex items-center justify-between">
                <p className="flex items-baseline gap-1">
                    <span className="text-2xl font-black">${pricePerHour}</span>
                    <span className="text-white/70 text-xs font-medium">/ hour</span>
                </p>
                <div className="glass px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-900" />
                    <span className="text-xs font-bold text-slate-900">{capacity}</span>
                </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
