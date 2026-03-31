import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAssetUrl(path: string) {
  // If it's already a full URL, return it
  if (path.startsWith("http")) return path;

  const assetCdnUrl =
    import.meta.env.VITE_ASSET_BASE_URL || import.meta.env.VITE_ASSET_CDN_URL;

  // Keep interactive scenes local so previews and deployments do not depend
  // on third-party CORS or transform behavior.
  if (path.includes("/spline/")) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  if (assetCdnUrl) {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const cleanCdnUrl = assetCdnUrl.endsWith("/")
      ? assetCdnUrl.slice(0, -1)
      : assetCdnUrl;
    return `${cleanCdnUrl}/${cleanPath}`;
  }

  return path;
}
