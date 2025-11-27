import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: number;
  shadow?: boolean;
  glow?: boolean;
  draggable?: boolean;
  expandable?: boolean;
}

export const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  ({ className, blur = 12, shadow = true, glow = false, draggable = false, expandable = false, children, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const cardVariants = {
      initial: { scale: 1 },
      hover: { scale: 1.02 },
      expanded: { scale: 1.05 },
    };

    return (
      <>
        <svg className="absolute w-0 h-0">
          <defs>
            <filter id="liquid-distortion">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01"
                numOctaves="3"
                result="noise"
              >
                <animate
                  attributeName="baseFrequency"
                  dur="20s"
                  values="0.01;0.02;0.01"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        <motion.div
          ref={ref}
          drag={draggable ? true : false}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.1}
          variants={cardVariants}
          initial="initial"
          whileHover="hover"
          animate={isExpanded ? "expanded" : "initial"}
          onClick={() => expandable && setIsExpanded(!isExpanded)}
          className={cn(
            "relative rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md backdrop-saturate-150",
            "border border-white/20",
            shadow && "shadow-[0_8px_40px_rgba(0,0,0,0.35)]",
            glow && "shadow-[0_0_40px_rgba(255,255,255,0.1)]",
            draggable && "cursor-move",
            expandable && "cursor-pointer",
            className
          )}
          style={{
            backdropFilter: `blur(${blur}px) saturate(150%)`,
            WebkitBackdropFilter: `blur(${blur}px) saturate(150%)`,
          }}
        >
          {children}
        </motion.div>
      </>
    );
  }
);

LiquidGlassCard.displayName = "LiquidGlassCard";
