"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";

type FallingPatternProps = {
  colors?: string[];
  duration?: number;
  blur?: number;
  density?: number;
  paused?: boolean;
};

export const FallingPattern = ({
  colors = ["#8B5CF6", "#EC4899", "#3B82F6"],
  duration = 20,
  blur = 10,
  density = 30,
  paused = false,
}: FallingPatternProps) => {
  const particles = useMemo(() => {
    return Array.from({ length: density }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      delay: Math.random() * duration,
      animDuration: duration + Math.random() * 10,
    }));
  }, [density, colors, duration]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            filter: `blur(${blur}px)`,
            opacity: 0.6,
          }}
          initial={{ y: "-10vh", opacity: 0 }}
          animate={
            paused
              ? { y: "-10vh", opacity: 0 }
              : {
                  y: ["-10vh", "110vh"],
                  opacity: [0, 0.8, 0.8, 0],
                }
          }
          transition={{
            duration: particle.animDuration,
            delay: particle.delay,
            repeat: paused ? 0 : Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};