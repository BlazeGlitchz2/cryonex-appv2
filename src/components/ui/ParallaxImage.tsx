import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export function ParallaxImage({
  src,
  alt,
  className,
  aspectRatio = "16/9",
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden rounded-2xl", className)}
      style={{ aspectRatio }}
    >
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 h-[120%] w-full"
      >
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </motion.div>
    </div>
  );
}
