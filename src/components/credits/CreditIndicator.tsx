import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { RefuelModal } from "./RefuelModal";
import { Zap, Fuel, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditIndicatorProps {
  type: "main" | "study";
  className?: string;
}

export function CreditIndicator({ type, className }: CreditIndicatorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const balance =
    useQuery(
      type === "main" ? api.credits.getBalance : api.credits.getStudyBalance,
    ) ?? 0;

  const maxCredits = 100;
  const percentage = Math.min((balance / maxCredits) * 100, 100);
  const isLow = percentage < 20;
  const isCritical = percentage < 10;

  const getGradientColor = () => {
    if (isCritical) return "from-red-500 via-red-400 to-orange-500";
    if (isLow) return "from-orange-500 via-amber-400 to-yellow-500";
    return "from-white/40 via-white/20 to-white/10";
  };

  const getGlowColor = () => {
    return "shadow-[0_0_20px_rgba(0,0,0,0.8)]";
  };

  const getIconColor = () => {
    return "text-blue-500"; // Always blue for the "thunder thing"
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl",
          "bg-black border border-white/10",
          "hover:border-white/20 hover:bg-black/90",
          "transition-all duration-300 cursor-pointer",
          "shadow-2xl",
          getGlowColor(),
          isLow && "animate-pulse",
          className,
        )}
      >
        {/* Subtle background glow */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl opacity-5 blur-xl transition-opacity duration-300",
            "bg-white",
            "group-hover:opacity-10",
          )}
        />

        {/* Icon with blue glow */}
        <div className="relative">
          <div
            className={cn(
              "absolute inset-0 blur-md opacity-40",
              getIconColor(),
            )}
          >
            {type === "main" ? (
              <Zap className="w-5 h-5" />
            ) : (
              <Fuel className="w-5 h-5" />
            )}
          </div>
          <div className={cn("relative", getIconColor())}>
            {type === "main" ? (
              <Zap className="w-5 h-5 fill-current" />
            ) : (
              <Fuel className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Credit display */}
        <div className="relative flex flex-col items-start">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white tabular-nums">
              {typeof balance === "number" ? balance.toFixed(2) : balance}
            </span>
            <span className="text-xs text-white/50 font-medium">
              {type === "main" ? "credits" : "energy"}
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                "bg-gradient-to-r",
                getGradientColor(),
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Sparkle effect on hover */}
        <Sparkles
          className={cn(
            "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "text-white/40",
          )}
        />

        {/* Low credit warning indicator */}
        {isLow && (
          <div className="absolute -top-1 -right-1 w-3 h-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </div>
        )}
      </button>

      <RefuelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
      />
    </>
  );
}
