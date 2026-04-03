import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { ArrowDown } from "lucide-react";
import { useThemeStore } from "@/lib/stores/theme-store";

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

    return (
      <div
        ref={ref}
        className={cn(
          "left-0 right-0 pointer-events-none transition-all duration-300",
          isHero
            ? "relative z-10 bg-transparent px-0 pb-0 pt-0"
            : cn(
                isLight
                  ? "bg-gradient-to-t from-[#fff7fb] via-[#fff7fb]/94 to-transparent"
                  : "bg-gradient-to-t from-[#050218] via-[#050218]/94 to-transparent",
                useTouchShell
                  ? isTablet
                    ? "px-5 pb-5 pt-6"
                    : "px-3 pb-4 pt-4"
                  : "px-3 pb-4 pt-4 md:px-4 md:pb-8 md:pt-24",
              ),
          !isHero && useTouchShell
            ? isTablet
              ? "fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40"
              : "fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40"
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
          <div className="pointer-events-auto">
            <PromptInputBox
              onSend={onSend}
              onStop={onStop}
              isLoading={isStreaming}
              className={cn(
                "border border-white/[0.06] bg-[linear-gradient(180deg,rgba(10,6,37,0.88),rgba(8,5,25,0.94))] shadow-[0_24px_72px_rgba(4,2,18,0.42)] gradient-border relative",
                "after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[0_0_20px_-8px_rgba(210,68,255,0.3)] after:pointer-events-none",
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
                  ? "mt-4 text-slate-600"
                  : "mt-4 text-white/38"
                : isLight
                  ? "mt-2 text-slate-500 md:mt-3"
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
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 rounded-full border border-white/10 bg-[#11161d]/90 p-2 text-white shadow-lg transition-all animate-in fade-in zoom-in duration-200 z-50 cursor-pointer pointer-events-auto hover:bg-[#161d26]"
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
