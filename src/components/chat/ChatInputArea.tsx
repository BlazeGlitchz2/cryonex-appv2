import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { ArrowDown } from "lucide-react";

interface ChatInputAreaProps {
    isMobile: boolean;
    isMobileSidebarOpen: boolean;
    isStreaming: boolean;
    showScrollButton: boolean;
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
            onSend,
            onStop,
            scrollToBottom,
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "left-0 right-0 px-3 md:px-4 pb-4 md:pb-8 pt-4 md:pt-24 bg-gradient-to-t from-[#030005] via-[#030005]/95 to-transparent pointer-events-none transition-all duration-300",
                    isMobile
                        ? "fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40"
                        : "absolute bottom-0 z-50",
                    isMobile && isMobileSidebarOpen ? "hidden pointer-events-none opacity-0" : "opacity-100"
                )}
            >
                <div className="max-w-3xl mx-auto w-full pointer-events-auto">
                    <PromptInputBox
                        onSend={onSend}
                        onStop={onStop}
                        isLoading={isStreaming}
                        className="glass-panel border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-[1.5rem] md:rounded-[2rem]"
                    />
                    <p className="text-center text-[10px] text-white/30 mt-2 md:mt-3 font-medium hidden sm:block">
                        Cryonex AI can make mistakes. Please verify important information.
                    </p>
                </div>

                {showScrollButton && (
                    <button
                        onClick={() => scrollToBottom(false)}
                        className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-full p-2 shadow-lg hover:bg-black/80 transition-all animate-in fade-in zoom-in duration-200 z-50 cursor-pointer pointer-events-auto"
                        aria-label="Scroll to bottom"
                    >
                        <ArrowDown className="h-4 w-4" />
                    </button>
                )}
            </div>
        );
    }
);
ChatInputArea.displayName = "ChatInputArea";
