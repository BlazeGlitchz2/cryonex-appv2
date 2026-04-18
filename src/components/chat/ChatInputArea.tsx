import React, { forwardRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { ArrowDown, X, Sparkles } from "lucide-react";
import { useThemeStore } from "@/lib/stores/theme-store";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputAreaProps {
  usesTouchShell?: boolean;
  isTablet?: boolean;
  isMobile?: boolean;
  isMobileSidebarOpen: boolean;
  isStreaming: boolean;
  showScrollButton: boolean;
  isHero?: boolean;
  onSend: (text: string, files?: File[]) => void;
  onStop: () => void;
  scrollToBottom: (smooth?: boolean) => void;
}

export const ChatInputArea = forwardRef<HTMLDivElement, ChatInputAreaProps>(
  (
    {
      usesTouchShell = false,
      isTablet = false,
      isMobile = false,
      isMobileSidebarOpen,
      isStreaming,
      showScrollButton,
      isHero = false,
      onSend,
      onStop,
      scrollToBottom,
    },
    ref,
  ) => {
    const useTouchShell = usesTouchShell || isMobile;
    const mode = useThemeStore((state) => state.mode);
    const isLight = mode === "light";
    const [showTopicPopup, setShowTopicPopup] = useState(false);

    useEffect(() => {
      const handleShowPopup = () => {
        setShowTopicPopup(true);
      };
      window.addEventListener('cryonex-show-topic-popup', handleShowPopup);
      return () => window.removeEventListener('cryonex-show-topic-popup', handleShowPopup);
    }, []);

    const handleSendWithPopupClose = (text: string, files?: File[]) => {
      setShowTopicPopup(false);
      onSend(text, files);
    };

    return (
      <div
        ref={ref}
        style={
          !isHero && useTouchShell
            ? {
                bottom:
                  "var(--phone-composer-bottom, calc(env(safe-area-inset-bottom, 0px) + 16px))",
              }
            : undefined
        }
        className={cn(
          "left-0 right-0 pointer-events-none transition-all duration-300",
          isHero
            ? "relative z-10 bg-transparent px-0 pb-0 pt-0"
            : cn(
                isLight
                  ? "bg-gradient-to-t from-background via-background/76 to-transparent"
                  : "bg-gradient-to-t from-[#050218] via-[#050218]/94 to-transparent",
                useTouchShell
                  ? isTablet
                    ? "px-5 pb-5 pt-6"
                    : "px-3 pb-4 pt-4"
                  : "px-3 pb-4 pt-4 md:px-4 md:pb-8 md:pt-24",
              ),
          !isHero && useTouchShell
            ? "fixed z-40"
            : !isHero
              ? "absolute bottom-0 z-50"
              : "",
          useTouchShell && isMobileSidebarOpen
            ? "hidden pointer-events-none opacity-0"
            : "opacity-100",
        )}
      >
        <div
          className={cn(
            "mx-auto w-full",
            isHero
              ? isTablet
                ? "max-w-[62rem]"
                : "max-w-[56rem]"
              : isTablet
                ? "max-w-[70rem]"
                : "max-w-[64rem]",
          )}
        >
          <div className="pointer-events-auto relative">
            <AnimatePresence>
              {showTopicPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={cn(
                    "absolute -top-14 left-0 z-[60] flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl transition-all",
                    isLight
                      ? "border-emerald-200 bg-white/95 text-emerald-900 shadow-emerald-200/20"
                      : "border-emerald-500/30 bg-[#0a0625]/90 text-emerald-100 shadow-emerald-500/10"
                  )}
                >
                  <div className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg",
                    isLight ? "bg-emerald-100" : "bg-emerald-500/20"
                  )}>
                    <Sparkles className={cn("h-4 w-4", isLight ? "text-emerald-600" : "text-emerald-400")} />
                  </div>
                  <span className="text-[13px] font-semibold tracking-tight">Provide your topic here</span>
                  <button
                    onClick={() => setShowTopicPopup(false)}
                    className={cn(
                      "ml-2 rounded-full p-1 transition-colors",
                      isLight ? "hover:bg-slate-100 text-slate-400" : "hover:bg-white/10 text-white/40"
                    )}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {/* Triangle Arrow */}
                  <div className={cn(
                    "absolute -bottom-1.5 left-8 h-3 w-3 rotate-45 border-b border-r",
                    isLight ? "border-emerald-200 bg-white/95" : "border-emerald-500/30 bg-[#0a0625]/90"
                  )} />
                </motion.div>
              )}
            </AnimatePresence>

            <PromptInputBox
              onSend={handleSendWithPopupClose}
              onStop={onStop}
              isLoading={isStreaming}
              className={cn(
                useTouchShell && isLight
                  ? "border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-[0_18px_42px_rgba(15,23,42,0.08)]"
                  : useTouchShell
                    ? "border border-white/[0.06] bg-[linear-gradient(180deg,rgba(14,23,38,0.96),rgba(9,14,26,0.94))] shadow-[0_22px_52px_rgba(2,6,23,0.32)]"
                  : isLight
                  ? "border border-border/50 bg-background shadow-lg"
                  : "border border-white/[0.06] bg-[linear-gradient(180deg,rgba(37,99,235,0.06),rgba(6,182,212,0.02))] shadow-[0_24px_72px_rgba(4,2,18,0.42)] gradient-border relative",
                useTouchShell
                  ? "after:content-[''] after:absolute after:inset-x-5 after:top-0 after:h-px after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] after:pointer-events-none"
                  : "after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[0_0_20px_-8px_rgba(37,99,235,0.3)] after:pointer-events-none",
                isHero
                  ? "rounded-[2rem] border-white/[0.07] shadow-[0_18px_54px_rgba(4,2,18,0.34)]"
                  : "rounded-[1.5rem] md:rounded-[2rem]",
              )}
            />
          </div>
          <p
            className={cn(
              "text-center text-[10px] font-medium hidden sm:block",
              isHero
                ? isLight
                  ? "mt-4 text-muted-foreground"
                  : "mt-4 text-white/38"
                : isLight
                  ? "mt-2 text-muted-foreground/80 md:mt-3"
                  : "mt-2 text-white/30 md:mt-3",
            )}
          >
            Cryonex can help structure the work, but you should still verify
            high-stakes facts and final answers.
          </p>
        </div>

        {!isHero && showScrollButton && (
          <button
            onClick={() => scrollToBottom(false)}
            className={cn(
              "mobile-native-button absolute -top-12 left-1/2 transform -translate-x-1/2 rounded-full border p-2 shadow-lg transition-all animate-in fade-in zoom-in duration-200 z-50 cursor-pointer pointer-events-auto hover:scale-105",
              isLight
                ? "border-border bg-background text-foreground hover:bg-accent"
                : "border-white/10 bg-[#11161d]/90 text-white hover:bg-[#161d26]",
            )}
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  },
);
ChatInputArea.displayName = "ChatInputArea";
