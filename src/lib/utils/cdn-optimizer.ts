import { ImageQuality } from '@/lib/stores/performance-store';
import { getAssetUrl } from '@/lib/utils';

const BUNNY_CDN_BASE = 'https://cryonex-cdn.b-cdn.net';

interface ImageOptimizationOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
    fit?: 'cover' | 'contain' | 'fill';
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

/**
 * Generate an optimized image URL using Bunny CDN's image optimization
 * 
 * Bunny CDN supports these query parameters:
 * - width: Target width
 * - height: Target height
 * - quality: 1-100
 * - format: webp, avif, or auto
 * - fit: cover, contain, fill
 */
export function getOptimizedImageUrl(
    path: string,
    options: ImageOptimizationOptions = {}
): string {
    // If it's already a full URL not from our CDN, return as-is
    if (path.startsWith('http') && !path.includes('b-cdn.net')) {
        return path;
    }

    // Build the base URL
    let baseUrl: string;
    if (path.startsWith('http')) {
        baseUrl = path;
    } else {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        baseUrl = `${BUNNY_CDN_BASE}${normalizedPath}`;
    }

    // Build query parameters
    const params = new URLSearchParams();

    if (options.width) {
        params.set('width', options.width.toString());
    }
    if (options.height) {
        params.set('height', options.height.toString());
    }
    if (options.quality) {
        params.set('quality', options.quality.toString());
    }
    if (options.format) {
        params.set('format', options.format);
    }
    if (options.fit) {
        params.set('fit', options.fit);
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
    aspectRatio?: number
): string {
    const preset = QUALITY_PRESETS[tier];

    const options: ImageOptimizationOptions = {
        width: preset.maxWidth,
        quality: preset.quality,
        format: 'webp',
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
    options: VideoOptimizationOptions = {}
): string {
    const { quality = 'high' } = options;

    // If it's already a full URL not from our CDN, return as-is
    if (path.startsWith('http') && !path.includes('b-cdn.net')) {
        return path;
    }

    // Build the base URL first
    let baseUrl: string;
    if (path.startsWith('http')) {
        baseUrl = path;
    } else {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        baseUrl = `${BUNNY_CDN_BASE}${normalizedPath}`;
    }

    // For lower quality, check if a lower quality variant exists
    // This assumes you have uploaded lower quality versions with suffixes
    if (quality === 'low') {
        // Try 480p variant
        const lowQualityUrl = baseUrl.replace(/(\.\w+)$/, '_480p$1');
        return lowQualityUrl;
    } else if (quality === 'medium') {
        // Try 720p variant
        const mediumQualityUrl = baseUrl.replace(/(\.\w+)$/, '_720p$1');
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
    widths: number[] = [320, 640, 960, 1280, 1920]
): string {
    return widths
        .map((w) => {
            const url = getOptimizedImageUrl(path, { width: w, quality, format: 'webp' });
            return `${url} ${w}w`;
        })
        .join(', ');
}

/**
 * Preload critical assets based on performance tier
 */
export function preloadCriticalAssets(tier: ImageQuality): void {
    const criticalAssets: string[] = [];

    // Define critical assets per tier
    if (tier === 'high') {
        criticalAssets.push(
            '/assets/cryonex-logo-official.png',
            '/spline/hero.splinecode'
        );
    } else {
        // For lower tiers, only preload essential images
        criticalAssets.push('/assets/cryonex-logo-official.png');
    }

    // Create preload links
    criticalAssets.forEach((asset) => {
        const link = document.createElement('link');
        link.rel = 'preload';

        if (asset.endsWith('.splinecode')) {
            // Spline loader usually fetches the raw URL without params
            link.href = getAssetUrl(asset);
            link.as = 'fetch';
            link.crossOrigin = 'anonymous'; // Spline loads with CORS
        } else {
            // For images, match the exact params used by OptimizedImage
            const preset = QUALITY_PRESETS[tier];
            link.href = getOptimizedImageUrl(asset, {
                quality: preset.quality,
                width: preset.maxWidth, // Preload the max width version to be safe, or maybe just the logo size?
                format: 'webp' // OptimizedImage defaults to webp
            });
            link.as = 'image';
        }

        document.head.appendChild(link);
    });
}

/**
 * Check if browser supports modern image formats
 */
export function getPreferredImageFormat(): 'avif' | 'webp' | 'auto' {
    if (typeof document === 'undefined') return 'auto';

    // Check AVIF support
    const avifSupport = document.createElement('canvas').toDataURL('image/avif').startsWith('data:image/avif');
    if (avifSupport) return 'avif';

    // Check WebP support (most modern browsers)
    const webpSupport = document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp');
    if (webpSupport) return 'webp';

    return 'auto';
}

/**
 * Lazy load images using Intersection Observer
 */
export function createLazyLoader(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
): IntersectionObserver | null {
    if (typeof IntersectionObserver === 'undefined') {
        return null;
    }

    return new IntersectionObserver(callback, {
        rootMargin: '50px 0px',
        threshold: 0.01,
        ...options,
    });
}
/**
 * Generate a Bunny Stream HLS URL
 */
export function getBunnyStreamUrl(videoId: string, libraryId: string = '584516'): string {
    return `https://iframe.mediadelivery.net/playlist/${libraryId}/${videoId}/playlist.m3u8`;
}
