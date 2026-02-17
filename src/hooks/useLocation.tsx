import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface GeoLocation {
    lat: number;
    lng: number;
    accuracy?: number;
    error?: string;
}

export const useLocation = () => {
    const [location, setLocation] = useState<GeoLocation | null>(null);
    const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState<PermissionState | "unknown">("unknown");

    useEffect(() => {
        checkPermission();
    }, []);

    const checkPermission = async () => {
        try {
            const result = await navigator.permissions.query({ name: "geolocation" });
            setPermission(result.state);
            result.onchange = () => setPermission(result.state);
        } catch (e) {
            // Browser might not support permissions query
            setPermission("unknown");
        }
    };

    const requestLocation = () => {
        setLoading(true);
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
                setLoading(false);
            },
            (error) => {
                let errorMessage = "Unable to retrieve your location";
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = "Location permission denied";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = "Location information is unavailable";
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = "The request to get user location timed out";
                }

                setLocation({ lat: 0, lng: 0, error: errorMessage });
                toast.error(errorMessage);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return { location, loading, permission, requestLocation };
};
