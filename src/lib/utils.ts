import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAssetUrl(path: string) {
  // If it's already a full URL, return it
  if (path.startsWith("http")) return path;

  // Keep heavy media on the CDN but serve interactive scenes locally so
  // previews and deployments don't depend on third-party CORS headers.
  const cdnAssets = ["/assets/video/", "/assets/sequence/"];

  // Never route Spline files through CDN to avoid CORS issues
  if (path.includes("/spline/")) {
    return path.startsWith("/") ? path : `/${path}`;
  }

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
