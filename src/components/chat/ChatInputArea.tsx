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
            : "px-3 md:px-4 pb-4 md:pb-8 pt-4 md:pt-24 bg-gradient-to-t from-[#0a0f16] via-[#0b1017]/94 to-transparent",
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
            isHero ? "max-w-[50rem]" : "max-w-[56rem]",
          )}
        >
          <PromptInputBox
            onSend={onSend}
            onStop={onStop}
            isLoading={isStreaming}
            className={cn(
              "border border-white/[0.08] bg-[linear-gradient(180deg,rgba(20,27,39,0.94),rgba(15,20,31,0.96))] shadow-[0_24px_72px_rgba(0,0,0,0.28)]",
              isHero
                ? "rounded-[2rem] border-white/[0.09] shadow-[0_18px_54px_rgba(0,0,0,0.22)]"
                : "rounded-[1.5rem] md:rounded-[2rem]",
            )}
          />
          <p
            className={cn(
              "text-center text-[10px] font-medium hidden sm:block",
              isHero ? "mt-4 text-white/38" : "mt-2 md:mt-3 text-white/30",
            )}
          >
            Cryonex can structure the work fast, but you should still verify
            final answers and high-stakes facts.
          </p>
        </div>

        {!isHero && showScrollButton && (
          <button
            onClick={() => scrollToBottom(false)}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 rounded-full border border-white/10 bg-[#161d28]/92 p-2 text-white shadow-lg transition-all animate-in fade-in zoom-in duration-200 z-50 cursor-pointer pointer-events-auto hover:bg-[#1b2330]"
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
