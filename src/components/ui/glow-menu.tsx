import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MenuItem {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

interface MenuBarProps {
  items: MenuItem[];
  className?: string;
}

export function MenuBar({ items, className }: MenuBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-1 rounded-full bg-white/10 backdrop-blur-xl backdrop-saturate-150 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-1",
        className,
      )}
    >
      {items.map((item, index) => (
        <motion.button
          key={index}
          onClick={item.onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
            item.active
              ? "bg-white/20 backdrop-blur-md text-white border border-white/30"
              : "text-white/70 hover:bg-white/10",
          )}
        >
          {item.active && (
            <motion.div
              layoutId="activeGlow"
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-blue-500/20 to-pink-500/20 blur-xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <motion.div
            animate={item.active ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            {item.icon}
          </motion.div>
          <span className="relative z-10 text-sm font-medium hidden sm:inline">
            {item.label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
