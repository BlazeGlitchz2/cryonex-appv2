import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, BookOpen, Zap, X, Upload } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useChatStore } from "@/lib/stores/chat-store";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { cn } from "@/lib/utils";
import { useDeviceType } from "@/hooks/use-mobile";

export function QuickActionsBar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const deviceType = useDeviceType();
  const isTablet = deviceType === "tablet";
  const isCompactDevice = deviceType !== "desktop";
  const location = useLocation();
  const navigate = useNavigate();
  const { setModelBrowserOpen } = useChatStore();

  if (!isCompactDevice) return null;
  const isAssistantRoute =
    location.pathname === "/app" ||
    location.pathname.startsWith("/app/") ||
    location.pathname.startsWith("/study/copilot");
  const dockBottom = isTablet
    ? "calc(env(safe-area-inset-bottom, 0px) + 7.5rem)"
    : "calc(env(safe-area-inset-bottom, 0px) + 6.75rem)";

  const handleAction = async (action: () => void) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Ignore haptic failure
    }
    action();
    setIsOpen(false);
  };

  const actions = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Copilot",
      color: "from-indigo-500 to-purple-500",
      onClick: () =>
        handleAction(() => {
          navigate("/study/copilot");
          setModelBrowserOpen(true);
        }),
    },
    {
      icon: <Upload className="w-5 h-5" />,
      label: "Upload",
      color: "from-cyan-500 to-blue-500",
      onClick: () => handleAction(() => navigate("/study/dashboard")),
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Library",
      color: "from-emerald-500 to-teal-500",
      onClick: () => handleAction(() => navigate("/library")),
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: "Focus",
      color: "from-orange-500 to-amber-500",
      onClick: () => handleAction(() => navigate("/study/dashboard")),
    },
  ];

  return (
    <div
      className={cn(
        "fixed z-[100]",
        isTablet ? "right-5" : "right-4",
        isAssistantRoute ? (isTablet ? "bottom-6" : "bottom-5") : "bottom-0",
      )}
      style={
        isAssistantRoute
          ? { transform: "translateZ(0)" }
          : {
              paddingBottom: dockBottom,
              transform: "translateZ(0)",
            }
      }
    >
      <AnimatePresence initial={false}>
        {isOpen && (
          <div className="relative">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]"
            />

            {/* Action Buttons */}
            <div className="mb-3 flex flex-col-reverse items-end gap-2.5">
              {actions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 8 }}
                  transition={{ duration: 0.16, delay: index * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <span
                    className={cn(
                      "rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md shadow-xl",
                      isTablet ? "text-[11px]" : "text-[10px]",
                    )}
                  >
                    {action.label}
                  </span>
                  <button
                    onClick={action.onClick}
                    className={cn(
                      "flex items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br text-white shadow-2xl",
                      isTablet ? "h-12 w-12" : "h-11 w-11",
                      action.color,
                    )}
                  >
                    {action.icon}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={async () => {
          try {
            await Haptics.impact({ style: ImpactStyle.Heavy });
          } catch {
            // Ignore haptic failure
          }
          setIsOpen(!isOpen);
        }}
        className={cn(
          "flex items-center justify-center rounded-[1.35rem] border border-white/20 text-white shadow-[0_8px_24px_rgb(0,0,0,0.42)] transition-all duration-200",
          isTablet ? "h-[3.5rem] w-[3.5rem]" : "h-[3.25rem] w-[3.25rem]",
          isOpen
            ? "bg-slate-800 rotate-45"
            : "bg-gradient-to-br from-indigo-600 to-blue-700 hover:shadow-indigo-500/25",
        )}
      >
        {isOpen ? (
          <X className={isTablet ? "h-6 w-6" : "h-5 w-5"} />
        ) : (
          <Plus className={isTablet ? "h-7 w-7" : "h-6 w-6"} />
        )}
      </motion.button>
    </div>
  );
}
