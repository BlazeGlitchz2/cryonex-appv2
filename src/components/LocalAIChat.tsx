import { useEffect, useRef, useState } from "react";
import { useLocalAIStore } from "@/lib/stores/local-ai-store";
import { Send, ArrowLeft, Loader2, Cpu, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/mobile";
import { CapgoLLM } from "@capgo/capacitor-llm";
import { useDeviceInfo, useDeviceType } from "@/hooks/use-mobile";
import { MobileMessageRenderer } from "./chat/MobileMessageRenderer";

interface LocalAIChatProps {
    onBack: () => void;
}

export function LocalAIChat({ onBack }: LocalAIChatProps) {
    const {
        messages,
        isModelDownloaded,
        downloadProgress,
        downloadText,
        isInitializing,
        isGenerating,
        error,
        downloadModel,
        sendMessage,
        resetChat,
        updateLastMessage
    } = useLocalAIStore();

    const { isLowPowerDevice, isIOS } = useDeviceInfo();
    const deviceType = useDeviceType();
    const isDesktop = deviceType === "desktop";
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isGenerating]);

    // Setup AI Event Listeners
    useEffect(() => {
        let textListener: any;
        let finishListener: any;

        const setupListeners = async () => {
            textListener = await CapgoLLM.addListener('textFromAi', (event) => {
                if (event.text) {
                    updateLastMessage(event.text, false);
                }
            });

            finishListener = await CapgoLLM.addListener('aiFinished', () => {
                updateLastMessage("", true); // Finish generation
            });
        };

        setupListeners();

        return () => {
            if (textListener) textListener.remove();
            if (finishListener) finishListener.remove();
        };
    }, []);

    // Handle send
    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;
        const text = input.trim();
        setInput("");
        hapticFeedback("light");
        await sendMessage(text);
    };

    // Render initialization/download screen
    if (!isModelDownloaded || isInitializing) {
        return (
            <div className="flex flex-col h-full bg-[#030010] p-6 items-center justify-center text-center animate-in fade-in">
                <div className="mb-8 relative">
                    {!isLowPowerDevice && (
                        <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full animate-pulse" />
                    )}
                    <div className="relative w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                        <Cpu className="h-10 w-10 text-blue-400" />
                    </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">
                    Local AI Model
                </h2>

                {!isInitializing && !isModelDownloaded ? (
                    <div className="space-y-4 max-w-xs">
                        <p className="text-white/60 text-sm">
                            Download the custom <b>Gemma 3 270M</b> model to chat securely on your device, even offline.
                        </p>
                        <p className="text-white/40 text-xs">
                            Size: ~300 MB · Ultra-fast & lightweight
                        </p>
                        <button
                            onClick={() => downloadModel()}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download Model
                        </button>
                        <button
                            onClick={onBack}
                            className="mt-4 text-white/40 text-sm hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 w-full max-w-xs">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-blue-300/80 font-medium">
                                <span>{downloadText || "Initializing..."}</span>
                                <span>{Math.round(downloadProgress)}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                    style={{ width: `${downloadProgress}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-white/40 text-xs animate-pulse font-medium">
                                Do not close the app
                            </p>
                            <p className="text-white/20 text-[10px]">
                                This may take a few minutes depending on your connection.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Render Chat Interface
    return (
        <div className="flex flex-col h-full bg-[#030010] safe-top safe-bottom">
            {/* Header */}
            <div className={cn(
                "flex items-center px-4 py-3 border-b border-white/5 sticky top-0 z-10",
                isLowPowerDevice ? "bg-black" : isDesktop ? "bg-black/60 backdrop-blur-xl supports-[backdrop-filter]:bg-black/40" : "bg-black/20 backdrop-blur-md"
            )}>
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-white/70" />
                </button>
                <div className={cn(
                    "ml-2 flex-1",
                    isIOS && "flex flex-col items-center mr-8" // Center title on iOS, mr-8 compensates for back button width
                )}>
                    <h3 className="text-white font-semibold text-sm">Local AI</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                            Gemma 3 · On-Device
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (confirm("Clear chat history?")) resetChat();
                    }}
                    className="ml-auto text-xs text-white/30 hover:text-white/60 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                    Clear
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth mobile-scroll-thin"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-30 mt-[-40px]">
                        <Cpu className="h-12 w-12 text-white mb-4" />
                        <p className="text-sm font-medium text-white">
                            Running entirely on your device.
                        </p>
                        <p className="text-xs text-white/60 mt-2 max-w-[200px]">
                            No data leaves your phone. Perfect for private queries or offline use.
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex flex-col w-full px-1",
                                msg.role === "user" ? "items-end" : "items-start",
                            )}
                        >
                            <MobileMessageRenderer
                                role={msg.role as "user" | "assistant"}
                                content={msg.content}
                                timestamp={msg.timestamp}
                            />
                        </div>
                    ))
                )}
                {error && (
                    <div className="p-3 mx-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                        Error: {error}
                    </div>
                )}
                <div className="h-4" /> {/* Bottom spacer */}
            </div>

            {/* Input Area */}
            <div className={cn(
                "p-3 border-t border-white/5 safe-bottom",
                isLowPowerDevice ? "bg-black" : isDesktop ? "bg-black/60 backdrop-blur-xl supports-[backdrop-filter]:bg-black/40" : "bg-black/40 backdrop-blur-lg"
            )}>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type a message..."
                        disabled={isGenerating}
                        className={cn(
                            "w-full bg-white/10 text-white rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-white/30 disabled:opacity-50",
                            isIOS ? "text-[16px]" : "text-sm" // iOS needs 16px to prevent zoom
                        )}
                        style={{ fontSize: isIOS ? "16px" : undefined }} // Explicit inline style enforcement
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isGenerating}
                        className="absolute right-1.5 p-2 rounded-full bg-blue-600 text-white disabled:bg-transparent disabled:text-white/20 transition-all hover:scale-105 active:scale-95"
                    >
                        {isGenerating ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
