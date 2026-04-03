import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, BookOpen, Zap, X, Upload } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useChatStore } from "@/lib/stores/chat-store";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { cn } from "@/lib/utils";
import { useDeviceType } from "@/hooks/use-mobile";
import { isAssistantRoute } from "@/lib/mobile-shell";

export function QuickActionsBar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const deviceType = useDeviceType();
  const location = useLocation();
  const navigate = useNavigate();
  const { setModelBrowserOpen } = useChatStore();

  if (deviceType !== "phone") return null;
  const isAssistantPath = isAssistantRoute(location.pathname);
  const dockBottom = "calc(env(safe-area-inset-bottom, 0px) + 6.75rem)";
  const collapsedLabel = isAssistantPath ? "Create" : "Actions";

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
      description: "Open a guided study chat",
      iconSurface: "bg-indigo-500/16 text-indigo-100",
      onClick: () =>
        handleAction(() => {
          navigate("/app");
          setModelBrowserOpen(true);
        }),
    },
    {
      icon: <Upload className="w-5 h-5" />,
      label: "Import",
      description: "Add notes, photos, or PDFs",
      iconSurface: "bg-cyan-500/16 text-cyan-100",
      onClick: () => handleAction(() => navigate("/study/dashboard")),
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Library",
      description: "Jump back to saved material",
      iconSurface: "bg-emerald-500/16 text-emerald-100",
      onClick: () => handleAction(() => navigate("/library")),
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: "Focus",
      description: "Return to your study dashboard",
      iconSurface: "bg-amber-500/16 text-amber-100",
      onClick: () => handleAction(() => navigate("/study/dashboard")),
    },
  ];

  return (
    <div
      className={cn("fixed z-[100] right-4 bottom-0")}
      style={{
        paddingBottom: dockBottom,
        transform: "translateZ(0)",
      }}
    >
      <AnimatePresence initial={false}>
        {isOpen && (
          <div className="relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]"
            />
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="mb-3 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 rounded-[1.65rem] border border-white/[0.08] bg-[rgba(9,12,30,0.92)] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
            >
              {actions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.98, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 8 }}
                  transition={{ duration: 0.16, delay: index * 0.04 }}
                >
                  <button
                    onClick={action.onClick}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[1.35rem] border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-left text-white transition-colors hover:bg-white/[0.06]",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem]",
                        action.iconSurface,
                      )}
                    >
                      {action.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {action.label}
                      </p>
                      <p className="text-[11px] leading-5 text-white/48">
                        {action.description}
                      </p>
                    </div>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
          "flex h-14 items-center gap-2.5 rounded-full border px-4 text-white shadow-[0_10px_28px_rgba(0,0,0,0.4)] transition-all duration-200",
          isOpen
            ? "border-white/16 bg-[rgba(22,26,43,0.96)]"
            : "border-white/14 bg-[linear-gradient(135deg,rgba(24,29,49,0.94),rgba(44,63,122,0.92))]",
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08]">
          {isOpen ? <X className="h-4 w-4" /> : <Plus className="h-5 w-5" />}
        </div>
        <span className="pr-0.5 text-sm font-semibold tracking-[0.01em]">
          {isOpen ? "Close" : collapsedLabel}
        </span>
      </motion.button>
    </div>
  );
}
