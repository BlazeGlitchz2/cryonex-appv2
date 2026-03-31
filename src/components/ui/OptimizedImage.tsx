import { useState, useEffect, useRef, ImgHTMLAttributes } from "react";
import { useOptimization } from "@/components/SmartOptimizer";
import { usePerformanceStore } from "@/lib/stores/performance-store";
import {
  getOptimizedImageUrl,
  generateSrcSet,
  getPreferredImageFormat,
  createLazyLoader,
} from "@/lib/utils/cdn-optimizer";
import { cn } from "@/lib/utils";

interface OptimizedImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  blurPlaceholder?: boolean;
  imgClassName?: string;
  onLoadComplete?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality,
  fill = false,
  blurPlaceholder = true,
  className,
  imgClassName,
  onLoadComplete,
  ...props
}: OptimizedImageProps) {
  const { tier } = useOptimization();
  const { imageQuality } = usePerformanceStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Get quality based on tier
  const effectiveQuality =
    quality ??
    (imageQuality === "low" ? 50 : imageQuality === "medium" ? 70 : 85);

  // Get preferred format
  const format = getPreferredImageFormat();

  // Generate optimized URL
  const optimizedSrc = getOptimizedImageUrl(src, {
    width: width || (tier === "lite" ? 640 : undefined),
    height,
    quality: effectiveQuality,
    format: format === "auto" ? "webp" : format,
  });

  // Generate srcset for responsive images
  const srcSet = width ? undefined : generateSrcSet(src, effectiveQuality);

  // Blur placeholder data URL (tiny transparent pixel)
  const placeholderSrc =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3Crect fill="%23111" width="1" height="1"/%3E%3C/svg%3E';

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (priority || isInView) return;

    const observer = createLazyLoader((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer?.unobserve(entry.target);
        }
      });
    });

    if (observer && imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fill && "absolute inset-0",
        className,
      )}
      style={!fill ? { width, height } : undefined}
    >
      {/* Blur placeholder */}
      {blurPlaceholder && !isLoaded && (
        <div
          className="absolute inset-0 bg-gray-900/50 animate-pulse"
          style={{
            backgroundImage: `url(${placeholderSrc})`,
            backgroundSize: "cover",
            filter: "blur(20px)",
          }}
        />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? optimizedSrc : placeholderSrc}
        srcSet={isInView ? srcSet : undefined}
        sizes={
          srcSet
            ? "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
            : undefined
        }
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        className={cn(
          "transition-opacity duration-300",
          fill && "absolute inset-0 w-full h-full object-cover",
          imgClassName,
          isLoaded ? "opacity-100" : "opacity-0",
        )}
        {...props}
      />
    </div>
  );
}

/**
 * Optimized background image component
 */
interface OptimizedBackgroundProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
}

export function OptimizedBackground({
  src,
  className,
  children,
  overlay = false,
  overlayOpacity = 0.5,
}: OptimizedBackgroundProps) {
  const { tier } = useOptimization();
  const { imageQuality } = usePerformanceStore();

  const quality =
    imageQuality === "low" ? 40 : imageQuality === "medium" ? 60 : 80;
  const format = getPreferredImageFormat();

  const optimizedSrc = getOptimizedImageUrl(src, {
    width: tier === "lite" ? 1280 : 1920,
    quality,
    format: format === "auto" ? "webp" : format,
  });

  return (
    <div
      className={cn("relative bg-cover bg-center bg-no-repeat", className)}
      style={{ backgroundImage: `url(${optimizedSrc})` }}
    >
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      {children}
    </div>
  );
}
