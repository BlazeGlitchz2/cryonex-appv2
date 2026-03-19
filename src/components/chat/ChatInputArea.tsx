import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { ArrowDown } from "lucide-react";

interface ChatInputAreaProps {
  isMobile: boolean;
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
      isMobile,
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
    return (
      <div
        ref={ref}
        className={cn(
          "left-0 right-0 pointer-events-none transition-all duration-300",
          isHero
            ? "relative z-10 bg-transparent px-0 pb-0 pt-0"
            : "px-3 md:px-4 pb-4 md:pb-8 pt-4 md:pt-24 bg-gradient-to-t from-[#050218] via-[#050218]/94 to-transparent",
          !isHero && isMobile
            ? "fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40"
            : !isHero
              ? "absolute bottom-0 z-50"
              : "",
          isMobile && isMobileSidebarOpen
            ? "hidden pointer-events-none opacity-0"
            : "opacity-100",
        )}
      >
        <div
          className={cn(
            "mx-auto w-full pointer-events-auto",
            isHero ? "max-w-[42rem]" : "max-w-3xl",
          )}
        >
          <PromptInputBox
            onSend={onSend}
            onStop={onStop}
            isLoading={isStreaming}
            className={cn(
              "border border-white/[0.06] bg-[linear-gradient(180deg,rgba(10,6,37,0.88),rgba(8,5,25,0.94))] shadow-[0_24px_72px_rgba(4,2,18,0.42)] gradient-border",
              isHero
                ? "rounded-[2rem] border-white/[0.07] shadow-[0_18px_54px_rgba(4,2,18,0.34)]"
                : "rounded-[1.5rem] md:rounded-[2rem]",
            )}
          />
          <p
            className={cn(
              "text-center text-[10px] font-medium hidden sm:block",
              isHero ? "mt-4 text-white/38" : "mt-2 md:mt-3 text-white/30",
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
