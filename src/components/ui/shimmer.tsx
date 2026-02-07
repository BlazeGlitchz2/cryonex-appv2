import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

export function Shimmer({
  width = "100%",
  height = "1rem",
  className,
  ...props
}: ShimmerProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded bg-white/5", className)}
      style={{ width, height }}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
