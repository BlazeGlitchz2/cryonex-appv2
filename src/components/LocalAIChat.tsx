import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Cpu,
  Download,
  Loader2,
  Send,
  WifiOff,
} from "lucide-react";
import { Capacitor } from "@capacitor/core";

import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/mobile";
import { useDeviceInfo, useDeviceType } from "@/hooks/use-mobile";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useOfflineModelStore } from "@/lib/stores/offline-model-store";
import {
  getNativeModelSupportProfile,
  nativeLLM,
} from "@/lib/services/native-llm";
import { getLocalAIAvailability } from "@/lib/services/offline-model-state";
import { MobileMessageRenderer } from "./chat/MobileMessageRenderer";

interface LocalAIChatProps {
  onBack: () => void;
}

interface LocalMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export function LocalAIChat({ onBack }: LocalAIChatProps) {
  const {
    isInitialized,
    isDownloading,
    isModelLoading,
    progress,
    progressText,
    error,
    setError,
    currentTier,
    hasCachedModel,
  } = useOfflineModelStore();
  const { isLowPowerDevice, isIOS } = useDeviceInfo();
  const deviceType = useDeviceType();
  const isDesktop = deviceType === "desktop";
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isOnline } = useNetworkStatus();

  const supportProfile = useMemo(
    () =>
      getNativeModelSupportProfile(
        Capacitor.getPlatform() as "android" | "ios" | "web",
      ),
    [],
  );
  const modelTierLabel =
    currentTier === "small" ? "Gemma 2 2B" : "Gemma 3 270M";
  const canInstallHere = supportProfile.canDownloadCustomModel;
  const isReady = isInitialized;
  const availability = useMemo(
    () =>
      getLocalAIAvailability({
        isNativePlatform: Capacitor.isNativePlatform(),
      }),
    [],
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleInstall = async () => {
    try {
      await nativeLLM.initialize();
    } catch {
      // Shared offline store owns the error state.
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const text = input.trim();
    setInput("");
    void hapticFeedback("light");

    const nextMessages: LocalMessage[] = [
      ...messages,
      {
        role: "user",
        content: text,
        timestamp: Date.now(),
      },
      {
        role: "assistant",
        content: "",
        timestamp: Date.now() + 1,
      },
    ];

    setMessages(nextMessages);
    setIsGenerating(true);
    setError(null);

    try {
      if (!nativeLLM.isModelReady()) {
        await nativeLLM.initialize();
      }

      let fullContent = "";
      await nativeLLM.chat(nextMessages, (chunk) => {
        fullContent += chunk;
        setMessages((current) => {
          const updated = [...current];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex]?.role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: fullContent,
            };
          }
          return updated;
        });
      });
    } catch (sendError: any) {
      setError(sendError?.message || "Failed to generate offline response.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!availability.isAvailable) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#030010] p-6 text-center animate-in fade-in">
        <div className="mb-8 relative">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
            <AlertTriangle className="h-10 w-10 text-amber-400" />
          </div>
        </div>

        <h2 className="mb-2 text-xl font-bold text-white">
          On-Device AI Lives In The App
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-white/60">
          {availability.reason}
        </p>
        <button
          onClick={onBack}
          className="mt-6 rounded-xl bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          Back
        </button>
      </div>
    );
  }

  if (!canInstallHere && !hasCachedModel) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#030010] p-6 text-center animate-in fade-in">
        <div className="mb-8 relative">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
            <AlertTriangle className="h-10 w-10 text-amber-400" />
          </div>
        </div>

        <h2 className="mb-2 text-xl font-bold text-white">
          On-Device AI Not Packaged Yet
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-white/60">
          This build can run local AI on Android, but this Apple build still
          needs its packaged native model path before offline install works
          reliably.
        </p>
        <p className="mt-3 max-w-xs text-xs text-white/35">
          {supportProfile.offlineLabel}
        </p>
        <button
          onClick={onBack}
          className="mt-6 rounded-xl bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          Back
        </button>
      </div>
    );
  }

  if (!isReady || isDownloading || isModelLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#030010] p-6 text-center animate-in fade-in">
        <div className="mb-8 relative">
          {!isLowPowerDevice && (
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-[40px] animate-pulse" />
          )}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
            <Cpu className="h-10 w-10 text-blue-400" />
          </div>
        </div>

        <h2 className="mb-2 text-xl font-bold text-white">On-Device AI</h2>

        {!isDownloading && !isModelLoading && !isReady ? (
          <div className="max-w-xs space-y-4">
            <p className="text-sm text-white/60">
              Install the local model so you can chat securely on your device,
              even when the network drops.
            </p>
            <p className="text-xs text-white/40">
              {supportProfile.installationLabel}
            </p>
            <button
              onClick={handleInstall}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-500"
            >
              <Download className="h-4 w-4" />
              Install On-Device AI
            </button>
            <button
              onClick={onBack}
              className="mt-4 text-sm text-white/40 transition-colors hover:text-white"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="w-full max-w-xs space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-blue-300/80">
                <span>{progressText || "Initializing..."}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-xs font-medium text-white/40 animate-pulse">
                Do not close the app
              </p>
              <p className="text-[10px] text-white/20">
                {isOnline
                  ? "This may take a few minutes depending on your connection."
                  : "Connection dropped. Resume once the device is back online."}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="safe-top safe-bottom flex h-full flex-col bg-[#030010]">
      <div
        className={cn(
          "sticky top-0 z-10 flex items-center border-b border-white/5 px-4 py-3",
          isLowPowerDevice
            ? "bg-black"
            : isDesktop
              ? "bg-black/60 backdrop-blur-xl supports-[backdrop-filter]:bg-black/40"
              : "bg-black/20 backdrop-blur-md",
        )}
      >
        <button
          onClick={onBack}
          className="rounded-full p-2 -ml-2 transition-colors hover:bg-white/5"
        >
          <ArrowLeft className="h-5 w-5 text-white/70" />
        </button>
        <div
          className={cn(
            "ml-2 flex-1",
            isIOS && "mr-8 flex flex-col items-center",
          )}
        >
          <h3 className="text-sm font-semibold text-white">Local AI</h3>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
              {modelTierLabel} · On-device
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm("Clear chat history?")) setMessages([]);
          }}
          className="ml-auto rounded-lg px-3 py-1.5 text-xs text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
        >
          Clear
        </button>
      </div>

      <div
        ref={scrollRef}
        className="mobile-scroll-thin flex-1 space-y-4 overflow-y-auto px-4 py-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="mt-[-40px] flex h-full flex-col items-center justify-center px-6 text-center opacity-30">
            <Cpu className="mb-4 h-12 w-12 text-white" />
            <p className="text-sm font-medium text-white">
              Running entirely on your device.
            </p>
            <p className="mt-2 max-w-[200px] text-xs text-white/60">
              No data leaves your phone. Perfect for private queries and
              low-connectivity moments.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex w-full flex-col px-1",
                message.role === "user" ? "items-end" : "items-start",
              )}
            >
              <MobileMessageRenderer
                role={message.role as "user" | "assistant"}
                content={message.content}
                timestamp={message.timestamp}
              />
            </div>
          ))
        )}
        {error && (
          <div className="mx-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-400">
            Error: {error}
          </div>
        )}
        <div className="h-4" />
      </div>

      <div
        className={cn(
          "safe-bottom border-t border-white/5 p-3",
          isLowPowerDevice
            ? "bg-black"
            : isDesktop
              ? "bg-black/60 backdrop-blur-xl supports-[backdrop-filter]:bg-black/40"
              : "bg-black/40 backdrop-blur-lg",
        )}
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && void handleSend()}
            placeholder="Type a message..."
            disabled={isGenerating}
            className={cn(
              "w-full rounded-full bg-white/10 py-3 pl-4 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50",
              isIOS ? "text-[16px]" : "text-sm",
            )}
            style={{ fontSize: isIOS ? "16px" : undefined }}
          />
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || isGenerating}
            className="absolute right-1.5 rounded-full bg-blue-600 p-2 text-white transition-all hover:scale-105 active:scale-95 disabled:bg-transparent disabled:text-white/20"
          >
            {isGenerating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        {!isOnline && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-[11px] text-white/45">
            <WifiOff className="h-3.5 w-3.5" />
            Working in offline mode
          </div>
        )}
      </div>
    </div>
  );
}
