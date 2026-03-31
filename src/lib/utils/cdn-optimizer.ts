import { ImageQuality } from "@/lib/stores/performance-store";

const EDGE_ASSET_BASE_URL = (
  import.meta.env.VITE_ASSET_BASE_URL ?? ""
).trim().replace(/\/$/, "");
const USES_REMOTE_TRANSFORM_CDN = /^https?:\/\//.test(EDGE_ASSET_BASE_URL);

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "auto";
  fit?: "cover" | "contain" | "fill";
}

interface VideoOptimizationOptions {
  quality?: ImageQuality;
}

/**
 * Quality presets for different performance tiers
 */
const QUALITY_PRESETS = {
  low: { quality: 50, maxWidth: 640 },
  medium: { quality: 70, maxWidth: 1280 },
  high: { quality: 85, maxWidth: 1920 },
} as const;

function isRemoteUrl(path: string) {
  return /^https?:\/\//.test(path);
}

function isManagedRemoteUrl(path: string) {
  if (!isRemoteUrl(path)) {
    return false;
  }

  if (!EDGE_ASSET_BASE_URL) {
    return false;
  }

  return path.startsWith(EDGE_ASSET_BASE_URL);
}

function normalizeAssetPath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function getEdgeAssetBaseUrl(path: string) {
  if (isRemoteUrl(path)) {
    return path;
  }

  const normalizedPath = normalizeAssetPath(path);
  return USES_REMOTE_TRANSFORM_CDN
    ? `${EDGE_ASSET_BASE_URL}${normalizedPath}`
    : normalizedPath;
}

/**
 * Generate an optimized image URL using the configured edge asset host.
 *
 * When no remote transform CDN is configured, local assets stay same-origin so
 * Vercel's edge cache can serve them directly without generating redundant
 * query-string variants for identical files.
 */
export function getOptimizedImageUrl(
  path: string,
  options: ImageOptimizationOptions = {},
): string {
  if (isRemoteUrl(path) && !isManagedRemoteUrl(path)) {
    return path;
  }

  const baseUrl = getEdgeAssetBaseUrl(path);

  if (!USES_REMOTE_TRANSFORM_CDN) {
    return baseUrl;
  }

  const params = new URLSearchParams();

  if (options.width) {
    params.set("width", options.width.toString());
  }
  if (options.height) {
    params.set("height", options.height.toString());
  }
  if (options.quality) {
    params.set("quality", options.quality.toString());
  }
  if (options.format) {
    params.set("format", options.format);
  }
  if (options.fit) {
    params.set("fit", options.fit);
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Get an optimized image URL based on the current quality tier
 */
export function getOptimizedImageForTier(
  path: string,
  tier: ImageQuality,
  aspectRatio?: number,
): string {
  const preset = QUALITY_PRESETS[tier];

  const options: ImageOptimizationOptions = {
    width: preset.maxWidth,
    quality: preset.quality,
    format: "webp",
  };

  if (aspectRatio) {
    options.height = Math.round(preset.maxWidth / aspectRatio);
  }

  return getOptimizedImageUrl(path, options);
}

/**
 * Get video URL with quality variant
 * Assumes video files are named like: video.mp4, video_720p.mp4, video_480p.mp4
 */
export function getOptimizedVideoUrl(
  path: string,
  options: VideoOptimizationOptions = {},
): string {
  const { quality = "high" } = options;

  if (isRemoteUrl(path) && !isManagedRemoteUrl(path)) {
    return path;
  }

  const baseUrl = getEdgeAssetBaseUrl(path);

  if (!USES_REMOTE_TRANSFORM_CDN) {
    return baseUrl;
  }

  if (quality === "low") {
    const lowQualityUrl = baseUrl.replace(/(\.\w+)$/, "_480p$1");
    return lowQualityUrl;
  } else if (quality === "medium") {
    const mediumQualityUrl = baseUrl.replace(/(\.\w+)$/, "_720p$1");
    return mediumQualityUrl;
  }

  return baseUrl;
}

/**
 * Generate responsive image srcset for different screen sizes
 */
export function generateSrcSet(
  path: string,
  quality: number = 80,
  widths: number[] = [320, 640, 960, 1280, 1920],
): string | undefined {
  if (!USES_REMOTE_TRANSFORM_CDN) {
    return undefined;
  }

  return widths
    .map((w) => {
      const url = getOptimizedImageUrl(path, {
        width: w,
        quality,
        format: "webp",
      });
      return `${url} ${w}w`;
    })
    .join(", ");
}

/**
 * Preload critical assets based on performance tier
 */
export function preloadCriticalAssets(_tier: ImageQuality): void {
  void _tier;
}

/**
 * Check if browser supports modern image formats
 */
export function getPreferredImageFormat(): "avif" | "webp" | "auto" {
  if (typeof document === "undefined") return "auto";

  // Check AVIF support
  const avifSupport = document
    .createElement("canvas")
    .toDataURL("image/avif")
    .startsWith("data:image/avif");
  if (avifSupport) return "avif";

  // Check WebP support (most modern browsers)
  const webpSupport = document
    .createElement("canvas")
    .toDataURL("image/webp")
    .startsWith("data:image/webp");
  if (webpSupport) return "webp";

  return "auto";
}

/**
 * Lazy load images using Intersection Observer
 */
export function createLazyLoader(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {},
): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: "50px 0px",
    threshold: 0.01,
    ...options,
  });
}
/**
 * Generate a stream URL using the configured edge hostname.
 */
export function getBunnyStreamUrl(videoId: string): string {
  const normalizedPath = normalizeAssetPath(`${videoId}/playlist.m3u8`);
  return USES_REMOTE_TRANSFORM_CDN
    ? `${EDGE_ASSET_BASE_URL}${normalizedPath}`
    : normalizedPath;
}

/**
 * Generate a direct edge-cached asset URL.
 */
export function getBunnyStorageUrl(path: string): string {
  return getEdgeAssetBaseUrl(path);
}
