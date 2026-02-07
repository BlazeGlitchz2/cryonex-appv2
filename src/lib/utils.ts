import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAssetUrl(path: string) {
  // If it's already a full URL, return it
  if (path.startsWith("http")) return path;

  // Specific heavy assets to serve from BunnyCDN
  const cdnAssets = ["/assets/video/", "/spline/", "/assets/sequence/"];

  const shouldServeFromCdn = cdnAssets.some((assetPath) =>
    path.includes(assetPath),
  );

  if (shouldServeFromCdn) {
    const cdnUrl = "https://cryonex-cdn.b-cdn.net";
    // Ensure path starts with /
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${cdnUrl}${normalizedPath}`;
  }

  const cdnUrl = import.meta.env.VITE_CDN_URL;
  if (cdnUrl) {
    // Remove leading slash from path if present to avoid double slashes
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    // Remove trailing slash from cdnUrl if present
    const cleanCdnUrl = cdnUrl.endsWith("/") ? cdnUrl.slice(0, -1) : cdnUrl;
    return `${cleanCdnUrl}/${cleanPath}`;
  }
  return path;
}
