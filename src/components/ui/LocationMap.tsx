"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface LocationMapProps {
    lat: number;
    lng: number;
    zoom?: number;
    className?: string;
    interactive?: boolean;
    onPinChange?: (lat: number, lng: number) => void;
}

// Component to handle map clicks/pin movement
const MapEvents = ({ onPinChange, interactive }: { onPinChange?: (lat: number, lng: number) => void, interactive: boolean }) => {
    useMapEvents({
        click(e) {
            if (interactive && onPinChange) {
                onPinChange(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
};

// Component to handle programatic center updates
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

const LocationMap: React.FC<LocationMapProps> = ({ 
    lat, 
    lng, 
    zoom = 15, 
    className = "",
    interactive = false,
    onPinChange
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={`flex items-center justify-center bg-slate-50 animate-pulse ${className}`}>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Map...</div>
            </div>
        );
    }

    const position: [number, number] = [lat || 19.0760, lng || 72.8777];

    return (
        <div className={`location-map-container overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-sm relative ${className}`}>
            <MapContainer 
                center={position} 
                zoom={zoom} 
                scrollWheelZoom={interactive}
                zoomControl={interactive}
                attributionControl={false}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={position} icon={icon} />
                <MapEvents onPinChange={onPinChange} interactive={interactive} />
                <ChangeView center={position} zoom={zoom} />
            </MapContainer>
            
            {!interactive && (
                <div className="absolute inset-0 z-[10] cursor-default"></div>
            )}
        </div>
    );
};

export default LocationMap;
