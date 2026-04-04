import { useOfflineStore } from "@/lib/stores/offline-store";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { LocalAIChat } from "@/components/LocalAIChat";
import { WifiOff, RefreshCw, MessageSquare, Clock, Cpu } from "lucide-react";
import { Network } from "@capacitor/network";
import { Capacitor } from "@capacitor/core";
import { hapticFeedback, hapticNotification } from "@/lib/mobile";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Full-screen offline experience for iPhone.
 * Shows animated WiFi-off icon, cached chats list, and retry button.
 * Designed with iOS-native look & feel.
 */
export function OfflinePage() {
    const { isOnline } = useNetworkStatus();
    const cachedChats = useOfflineStore((s) => s.cachedChats);
    const pendingMessages = useOfflineStore((s) => s.pendingMessages);
    const [isRetrying, setIsRetrying] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [showLocalAI, setShowLocalAI] = useState(false);

    const selectedChat = selectedChatId
        ? cachedChats.find((c) => c.chatId === selectedChatId)
        : null;

    const handleRetry = useCallback(async () => {
        setIsRetrying(true);
        hapticFeedback("medium");

        try {
            if (Capacitor.isNativePlatform()) {
                const status = await Network.getStatus();
                if (status.connected) {
                    hapticNotification("success");
                    toast.success("Connection restored!", { id: "offline-retry" });
                } else {
                    hapticNotification("error");
                    toast.error("Still offline. Try again later.", {
                        id: "offline-retry",
                    });
                }
            } else {
                // Web fallback
                if (navigator.onLine) {
                    toast.success("Connection restored!", { id: "offline-retry" });
                } else {
                    toast.error("Still offline", { id: "offline-retry" });
                }
            }
        } catch {
            toast.error("Connection check failed", { id: "offline-retry" });
        } finally {
            setIsRetrying(false);
        }
    }, []);

    // Don't show if online
    if (isOnline) return null;

    // Local AI View
    if (showLocalAI) {
        return <LocalAIChat onBack={() => setShowLocalAI(false)} />;
    }

    // If viewing a cached chat
    if (selectedChat) {
        return (
            <div className="fixed inset-0 z-[9998] bg-[#030010] flex flex-col safe-top safe-bottom">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                    <button
                        onClick={() => {
                            setSelectedChatId(null);
                            hapticFeedback("light");
                        }}
                        className="text-blue-400 text-sm font-medium active:opacity-70 transition-opacity"
                    >
                        ← Back
                    </button>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-white/90 text-sm font-semibold truncate">
                            {selectedChat.title}
                        </h2>
                        <p className="text-white/30 text-[10px]">
                            Cached · Read-only
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mobile-scroll-thin px-4 py-4 space-y-3">
                    {selectedChat.messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "max-w-[85%] rounded-2xl px-4 py-3",
                                msg.role === "user"
                                    ? "ml-auto bg-blue-600/30 border border-blue-500/20"
                                    : "mr-auto bg-white/5 border border-white/5",
                            )}
                        >
                            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                                {msg.content.length > 500
                                    ? msg.content.slice(0, 500) + "..."
                                    : msg.content}
                            </p>
                            {msg.model && (
                                <p className="text-white/20 text-[10px] mt-1.5">{msg.model}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Read-only footer */}
                <div className="px-4 py-3 border-t border-white/5 safe-bottom">
                    <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/3 border border-white/5">
                        <WifiOff className="h-3.5 w-3.5 text-white/25" />
                        <span className="text-white/30 text-xs">
                            Read-only while offline
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Main offline page
    return (
        <div className="fixed inset-0 z-[9998] bg-[#030010] flex flex-col items-center safe-top safe-bottom animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Background gradient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/3 left-1/3 w-60 h-60 bg-red-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 w-full max-w-md">
                {/* Animated icon */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-red-500/15 rounded-full blur-[40px] animate-pulse" />
                    <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/15 flex items-center justify-center backdrop-blur-sm shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                        <WifiOff className="h-10 w-10 text-red-400/80" />
                    </div>
                </div>

                {/* Text */}
                <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                    You're Offline
                </h1>
                <p className="text-white/40 text-sm text-center mb-2 max-w-xs leading-relaxed">
                    No internet connection. You can browse cached chats below or retry
                    when you're back in range.
                    No internet connection. You can browse cached chats below or retry
                    when you're back in range.
                </p>

                {/* Local AI Button */}
                <button
                    onClick={() => {
                        setShowLocalAI(true);
                        hapticFeedback("light");
                    }}
                    className="w-full mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 active:scale-95 transition-all"
                >
                    <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Cpu className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-white font-semibold text-sm">Chat with Local AI</h3>
                        <p className="text-white/40 text-xs">Run Gemma 3 on-device</p>
                    </div>
                </button>

                {/* Pending messages badge */}
                {pendingMessages.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/15 mb-6">
                        <Clock className="h-3 w-3 text-amber-400" />
                        <span className="text-amber-300/80 text-xs font-medium">
                            {pendingMessages.length} message{pendingMessages.length !== 1 ? "s" : ""} queued
                        </span>
                    </div>
                )}

                {/* Retry button */}
                <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className={cn(
                        "flex items-center gap-2.5 px-6 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95",
                        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]",
                        "hover:shadow-[0_6px_30px_rgba(139,92,246,0.4)]",
                        isRetrying && "opacity-60",
                    )}
                >
                    <RefreshCw
                        className={cn("h-4 w-4", isRetrying && "animate-spin")}
                    />
                    {isRetrying ? "Checking..." : "Retry Connection"}
                </button>
            </div>

            {/* Cached chats section */}
            <div className="relative z-10 w-full px-4 pb-6">
                {cachedChats.length > 0 ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2 mb-3">
                            <MessageSquare className="h-3.5 w-3.5 text-white/25" />
                            <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider">
                                Cached Chats
                            </h3>
                        </div>
                        <div className="space-y-1 max-h-[35vh] overflow-y-auto mobile-scroll-thin rounded-2xl bg-white/[0.02] border border-white/5 divide-y divide-white/5">
                            {cachedChats.map((chat) => (
                                <button
                                    key={chat.chatId}
                                    onClick={() => {
                                        setSelectedChatId(chat.chatId);
                                        hapticFeedback("light");
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 active:bg-white/8 transition-colors"
                                >
                                    <p className="text-white/80 text-sm font-medium truncate">
                                        {chat.title}
                                    </p>
                                    <p className="text-white/25 text-[11px] mt-0.5">
                                        {chat.messages.length} messages ·{" "}
                                        {formatCacheAge(chat.cachedAt)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 rounded-2xl bg-white/[0.02] border border-white/5">
                        <MessageSquare className="h-5 w-5 text-white/15 mx-auto mb-2" />
                        <p className="text-white/25 text-xs">
                            No cached chats available
                        </p>
                        <p className="text-white/15 text-[10px] mt-1">
                            Chats will be cached automatically when you're online
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatCacheAge(timestamp: number): string {
    const diffMs = Date.now() - timestamp;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
}
