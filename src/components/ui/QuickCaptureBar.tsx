import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic, Plus, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSafeAreaInsets,
  hapticFeedback,
  hapticSelection,
  isIOS,
  isIPadOS,
} from "@/lib/mobile";
import { useNavigate } from "react-router";

export function QuickCaptureBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState(() =>
    isIOS() ? getSafeAreaInsets() : { top: 0, right: 0, bottom: 0, left: 0 },
  );
  const navigate = useNavigate();
  const isIOSDevice = isIOS();
  const isIPad = isIPadOS();
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(false);
  const deviceContextLabel = isIPad
    ? "iPad"
    : isIOSDevice
      ? "iPhone"
      : "mobile";
  const capturePanelWidthClass = isLandscapeTablet
    ? "w-[min(640px,90vw)]"
    : isIPad
      ? "min-w-[260px]"
      : isIOSDevice
        ? "min-w-[240px]"
        : "min-w-[220px]";
  const actionButtonPadding = isLandscapeTablet
    ? "min-h-[3.25rem] rounded-[1.4rem] px-4 py-3"
    : isIPad
      ? "min-h-[3.75rem] rounded-[1.5rem] px-4 py-3"
      : isIOSDevice
        ? "min-h-[3.5rem] rounded-[1.4rem] p-3.5"
        : "min-h-[3.2rem] rounded-[1.3rem] p-3";
  const iconSizeClass =
    isLandscapeTablet || isIPad || isIOSDevice
      ? "h-6 w-6"
      : "h-[22px] w-[22px]";
  const panelDirectionClass = isLandscapeTablet
    ? "flex-row items-center justify-between gap-3"
    : "flex-col gap-3";

  useEffect(() => {
    if (!isIOSDevice) return;

    const updateInsets = () => setSafeAreaInsets(getSafeAreaInsets());
    updateInsets();

    window.addEventListener("resize", updateInsets);
    window.addEventListener("orientationchange", updateInsets);
    window.visualViewport?.addEventListener("resize", updateInsets);
    window.visualViewport?.addEventListener("scroll", updateInsets);
    return () => {
      window.removeEventListener("resize", updateInsets);
      window.removeEventListener("orientationchange", updateInsets);
      window.visualViewport?.removeEventListener("resize", updateInsets);
      window.visualViewport?.removeEventListener("scroll", updateInsets);
    };
  }, [isIOSDevice]);

  useEffect(() => {
    if (!isIPad || typeof window === "undefined") return;

    const query = "(orientation: landscape) and (min-width: 768px)";
    const mediaQuery = window.matchMedia(query);
    const updateOrientation = (event?: MediaQueryListEvent) => {
      setIsLandscapeTablet(event ? event.matches : mediaQuery.matches);
    };

    updateOrientation();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateOrientation);
    } else {
      mediaQuery.addListener(updateOrientation);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", updateOrientation);
      } else {
        mediaQuery.removeListener(updateOrientation);
      }
    };
  }, [isIPad]);

  const triggerHaptics = async (
    mode: "selection" | "light" | "medium" = "light",
  ) => {
    try {
      if (mode === "selection") {
        await hapticSelection();
      } else {
        await hapticFeedback(mode);
      }
    } catch {
      // Haptics are optional.
    }
  };

  const closeBar = () => setIsOpen(false);

  const openStudyLane = (target: "scan" | "voice" | "assistant") => {
    void triggerHaptics("medium");
    if (target === "assistant") {
      navigate("/app");
    } else {
      navigate(`/study/dashboard?action=${target}#mobile-capture-lane`);
    }
    closeBar();
  };

  const actions = [
    {
      id: "scan",
      label: isIOSDevice ? "Import Photo" : "Capture Photo",
      icon: Camera,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      onClick: () => openStudyLane("scan"),
    },
    {
      id: "voice",
      label: isIOSDevice ? "Voice Note" : "Voice Memo",
      icon: Mic,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      onClick: () => openStudyLane("voice"),
    },
    {
      id: "ai-chat",
      label: isIOSDevice ? "Quick Assist" : "Turbo AI Focus",
      icon: Sparkles,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      onClick: () => openStudyLane("assistant"),
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBar}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity"
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[70] flex justify-center px-4 pointer-events-none",
          isIOSDevice
            ? "pb-6"
            : "pb-[calc(env(safe-area-inset-bottom,16px)+16px)]",
        )}
        style={
          isIOSDevice
            ? {
                paddingBottom: `calc(${safeAreaInsets.bottom}px + 20px)`,
              }
            : undefined
        }
      >
        <div className="relative pointer-events-auto">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                className={cn(
                  "absolute bottom-full right-1/2 mb-4 flex translate-x-1/2",
                  panelDirectionClass,
                  capturePanelWidthClass,
                )}
                role="menu"
                aria-label="Quick capture actions"
                style={
                  isLandscapeTablet ? { width: "min(640px,90vw)" } : undefined
                }
              >
                {actions.map((action, idx) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ delay: idx * 0.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={action.onClick}
                    className={cn(
                      "group relative flex items-center gap-3 overflow-hidden border text-left touch-feedback",
                      "border-white/[0.08] bg-[#121217]/95 backdrop-blur-2xl shadow-xl hover:border-white/[0.2] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]",
                      actionButtonPadding,
                    )}
                  >
                    <div className="absolute inset-0 pointer-events-none -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent group-hover:animate-shimmer" />

                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-[0.85rem] border shadow-inner",
                        action.bg,
                        action.border,
                        isIOSDevice && "h-12 w-12 rounded-[1rem]",
                        isLandscapeTablet && "flex-1 justify-center",
                      )}
                      aria-label={`${action.label} ${deviceContextLabel} mode`}
                    >
                      <action.icon
                        className={cn(iconSizeClass, action.color)}
                      />
                    </div>
                    <span className="text-[15px] font-semibold tracking-wide text-white">
                      {action.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={async () => {
              await triggerHaptics("selection");
              setIsOpen((prev) => !prev);
            }}
            className={cn(
              "relative flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
              "backdrop-blur-2xl transition-all duration-300 group haptic-press",
              isIOSDevice
                ? "border-white/25 bg-[linear-gradient(135deg,rgba(19,23,45,0.95),rgba(77,50,143,0.86))] shadow-[0_12px_30px_rgba(18,16,44,0.38)]"
                : isOpen
                  ? "bg-white/10 border-white/20 rotate-45"
                  : "bg-gradient-to-br from-cyan-500 via-primary to-purple-600 border-white/30 hover:shadow-cyan-400/25 hover:border-white/50",
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-70" />
            {isOpen ? (
              <X className="relative z-10 h-7 w-7 text-white" />
            ) : (
              <Plus className="relative z-10 h-8 w-8 text-white drop-shadow-md" />
            )}
          </motion.button>
        </div>
      </div>
    </>
  );
}
