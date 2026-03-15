import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Loader2, Navigation } from "lucide-react";

// Fix Leaflet generic marker icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapWidgetProps {
    location?: { lat: number; lng: number; name?: string };
    query?: string;
    className?: string;
}

const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], 13, { animate: true });
    }, [lat, lng, map]);
    return null;
};

// Places search utilizing OpenStreetMap (Nominatim)
const searchPlaces = async (query: string): Promise<Array<{ lat: number; lon: number; display_name: string }>> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        return await response.json();
    } catch (e) {
        console.error("Map search failed", e);
        return [];
    }
};

export const MapWidget: React.FC<MapWidgetProps> = ({
    location,
    query,
    className,
}) => {
    // Default: Paris Coordinates
    const DEFAULT_COORDS = { lat: 48.8566, lng: 2.3522 };

    const [coords, setCoords] = useState<{ lat: number; lng: number }>(
        location || DEFAULT_COORDS
    );
    const [markers, setMarkers] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInteracting, setIsInteracting] = useState(false);

    useEffect(() => {
        const initMap = async () => {
            // 1. Explicit Location Provided
            if (location) {
                setCoords(location);
                setMarkers([{ lat: location.lat, lng: location.lng, name: location.name || "Location" }]);
                return;
            }

            // 2. Query Provided (Search or "My Location")
            if (query) {
                setLoading(true);
                setError(null);

                // 2a. "My Location" Query
                if (
                    query.toLowerCase().includes("where am i") ||
                    query.toLowerCase().includes("my location") ||
                    query.toLowerCase().includes("current location")
                ) {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                const userCoords = {
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude,
                                };
                                setCoords(userCoords);
                                setMarkers([{ ...userCoords, name: "You are here" }]);
                                setLoading(false);
                            },
                            (err) => {
                                console.error("Error getting location:", err);
                                setError("Location access denied or unavailable.");
                                setLoading(false);
                            }
                        );
                    } else {
                        setError("Geolocation is not supported by your browser.");
                        setLoading(false);
                    }
                    return;
                }

                // 2b. General Place Search (e.g. "Restaurants in London")
                try {
                    const results = await searchPlaces(query);
                    if (results && results.length > 0) {
                        // Take the first result as the center
                        const first = results[0];
                        const lat = parseFloat(String(first.lat));
                        const lng = parseFloat(String(first.lon));

                        setCoords({ lat, lng });

                        // Add markers for top 5 results
                        const newMarkers = results.slice(0, 5).map(r => ({
                            lat: parseFloat(String(r.lat)),
                            lng: parseFloat(String(r.lon)),
                            name: r.display_name
                        }));
                        setMarkers(newMarkers);
                    } else {
                        setError(`No results found for "${query}"`);
                    }
                } catch (e) {
                    setError("Failed to load map data.");
                } finally {
                    setLoading(false);
                }
            }
        };

        initMap();
    }, [location, query]);

    return (
        <div
            className={`relative w-full h-[300px] rounded-xl overflow-hidden border border-white/10 shadow-lg my-4 group ${className}`}
            onMouseLeave={() => setIsInteracting(false)}
        >
            <MapContainer
                center={[coords.lat, coords.lng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                attributionControl={false}
                dragging={isInteracting}
                touchZoom={isInteracting}
                scrollWheelZoom={isInteracting}
                doubleClickZoom={isInteracting}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark mode map tiles
                />

                {markers.map((marker, idx) => (
                    <Marker key={idx} position={[marker.lat, marker.lng]}>
                        <Popup className="text-black text-xs font-medium">
                            {marker.name}
                        </Popup>
                    </Marker>
                ))}

                <RecenterMap lat={coords.lat} lng={coords.lng} />
            </MapContainer>

            {/* Tap to Interact Overlay (Prevents Scroll Trap on Mobile) */}
            {!isInteracting && !loading && !error && (
                <div
                    className="absolute inset-0 z-[600] bg-black/10 flex items-center justify-center cursor-pointer transition-opacity hover:bg-black/20"
                    onClick={() => setIsInteracting(true)}
                    onTouchStart={() => setIsInteracting(true)}
                >
                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg transform transition-transform hover:scale-105 active:scale-95">
                        <span className="text-xs text-white font-medium flex items-center gap-2">
                            <Navigation className="h-3 w-3 text-cyan-400" />
                            Tap to interact
                        </span>
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-[700] bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
                        <span className="text-xs text-white/70">Finding location...</span>
                    </div>
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 z-[700] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 text-center">
                    <span className="text-sm text-red-400 font-medium">{error}</span>
                </div>
            )}

            {/* Premium Overlay Elements */}
            <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-xl ring-1 ring-white/5 z-[400]"></div>

            {/* Header / Query Display */}
            {query && !loading && !error && (
                <div className="absolute top-3 left-3 z-[400] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 pointer-events-none">
                    <Navigation className="h-3 w-3 text-cyan-400" />
                    <span className="text-xs text-white/90 font-medium truncate max-w-[200px]">{query}</span>
                </div>
            )}

            {/* Coordinates Badge */}
            <div className="absolute bottom-3 right-3 z-[400] bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-[9px] text-white/50 font-mono pointer-events-none">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </div>
        </div>
    );
};
