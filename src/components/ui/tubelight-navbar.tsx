"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  name: string;
  link: string;
  icon?: LucideIcon;
};

export const NavBar = ({
  navItems,
  className,
}: {
  navItems: NavItem[];
  className?: string;
}) => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div
      className={cn("fixed top-4 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <div className="relative rounded-full border border-white/20 bg-white/10 backdrop-blur-md backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          {navItems.map((navItem: NavItem, idx: number) => (
            <a
              key={`link-${idx}`}
              href={navItem.link}
              className={cn(
                "relative px-4 py-2 rounded-full text-sm font-medium transition-colors",
                active === navItem.name
                  ? "text-white"
                  : "text-white/60 hover:text-white",
              )}
              onMouseEnter={() => setActive(navItem.name)}
              onMouseLeave={() => setActive(null)}
            >
              {active === navItem.name && (
                <motion.span
                  layoutId="tubelight"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                  className="absolute inset-0 bg-white/20 rounded-full"
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {navItem.icon && <navItem.icon className="h-4 w-4" />}
                {navItem.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
