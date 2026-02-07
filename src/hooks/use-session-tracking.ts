import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";

// Parse user agent to get device info
function getDeviceInfo() {
  const ua = navigator.userAgent;

  // Detect browser
  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  // Detect OS
  let os = "Unknown";
  if (ua.includes("Windows NT 10")) os = "Windows 10";
  else if (
    ua.includes("Windows NT 11") ||
    (ua.includes("Windows NT 10") && ua.includes("rv:"))
  )
    os = "Windows 11";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  // Detect device type
  let device = "Desktop";
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    device = /iPad/i.test(ua) ? "Tablet" : "Mobile";
  }

  return { browser, os, device, userAgent: ua };
}

// Fetch IP and geolocation from a public API
async function getLocationInfo(): Promise<{
  ip?: string;
  country?: string;
  city?: string;
  region?: string;
  lat?: number;
  lon?: number;
} | null> {
  try {
    // Using ipapi.co - free tier, no API key needed
    const response = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      ip: data.ip,
      country: data.country_name,
      city: data.city,
      region: data.region,
      lat: data.latitude,
      lon: data.longitude,
    };
  } catch (error) {
    console.warn("[Session] Failed to get location:", error);
    return null;
  }
}

/**
 * Hook to track user sessions/devices.
 * Call this in a top-level component that renders when user is logged in.
 */
export function useSessionTracking() {
  const { user } = useAuth();
  const logSession = useMutation(api.admin.logSession);
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    // Only log session once per mount, and only if user is logged in
    if (!user || hasLoggedRef.current) return;

    const trackSession = async () => {
      try {
        hasLoggedRef.current = true;

        const deviceInfo = getDeviceInfo();
        const locationInfo = await getLocationInfo();

        await logSession({
          deviceInfo,
          ip: locationInfo?.ip,
          location: locationInfo
            ? {
                country: locationInfo.country,
                city: locationInfo.city,
                region: locationInfo.region,
                lat: locationInfo.lat,
                lon: locationInfo.lon,
              }
            : undefined,
        });

        console.log("[Session] Logged session successfully");
      } catch (error) {
        console.error("[Session] Failed to log session:", error);
        hasLoggedRef.current = false; // Allow retry
      }
    };

    trackSession();
  }, [user, logSession]);
}

export { getDeviceInfo, getLocationInfo };
