import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useOfflineModelStore } from "@/lib/stores/offline-model-store";
import { nativeLLM, getNativeLLMLogs, clearNativeLLMLogs } from "@/lib/services/native-llm";
import { Capacitor } from "@capacitor/core";
import {
    BrainCircuit,
    Download,
    Trash2,
    RefreshCw,
    ScrollText,
    CheckCircle2,
    XCircle,
    Loader2,
    Copy,
    ChevronDown,
    ChevronUp,
    Wifi,
    HardDrive,
    Info,
} from "lucide-react";

export function OfflineModelSettings() {
    const store = useOfflineModelStore();
    const [status, setStatus] = useState(nativeLLM.getStatus());
    const [readiness, setReadiness] = useState<string>("...");
    const [pluginVersion, setPluginVersion] = useState<string>("...");
    const [showLogs, setShowLogs] = useState(false);
    const [logs, setLogs] = useState(getNativeLLMLogs());
    const [isWorking, setIsWorking] = useState(false);

    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();

    const refreshStatus = useCallback(async () => {
        setStatus(nativeLLM.getStatus());
        setLogs(getNativeLLMLogs());
        if (isNative) {
            const r = await nativeLLM.queryReadiness();
            setReadiness(r);
            const v = await nativeLLM.queryVersion();
            setPluginVersion(v);
        }
    }, [isNative]);

    useEffect(() => {
        refreshStatus();
        const interval = setInterval(refreshStatus, 3000);
        return () => clearInterval(interval);
    }, [refreshStatus]);

    const handleDownload = async () => {
        setIsWorking(true);
        try {
            await nativeLLM.initialize(false);
            await refreshStatus();
        } catch {
            // Error handled by store
        } finally {
            setIsWorking(false);
        }
    };

    const handleReinstall = async () => {
        setIsWorking(true);
        try {
            await nativeLLM.clearCache();
            await nativeLLM.initialize(true);
            await refreshStatus();
        } catch {
            // Error handled by store
        } finally {
            setIsWorking(false);
        }
    };

    const handleClearCache = async () => {
        await nativeLLM.clearCache();
        await refreshStatus();
    };

    const handleClearLogs = () => {
        clearNativeLLMLogs();
        setLogs([]);
    };

    const handleCopyLogs = async () => {
        const text = logs
            .map((l) => `[${l.time}] [${l.level}] ${l.msg}`)
            .join("\n");
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // Fallback for native
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }
    };

    if (!isNative) {
        return (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <BrainCircuit className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white">Offline AI</h3>
                        <p className="text-sm text-white/50">Not available on web</p>
                    </div>
                </div>
                <p className="text-sm text-white/40">
                    Offline AI is only available on Android and iOS. Use the mobile app
                    to download and run AI models locally on your device.
                </p>
            </div>
        );
    }

    const isReady = status.isInitialized && readiness === "ready";
    const hasCache = status.hasCachedModel;

    return (
        <div className="space-y-4">
            {/* Status Card */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2.5 rounded-xl ${isReady
                                    ? "bg-green-500/10 border border-green-500/20"
                                    : "bg-purple-500/10 border border-purple-500/20"
                                }`}
                        >
                            <BrainCircuit
                                className={`h-5 w-5 ${isReady ? "text-green-400" : "text-purple-400"
                                    }`}
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                Offline AI Model
                            </h3>
                            <p className="text-xs text-white/40">
                                Gemma 3 270M • On-device inference
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshStatus}
                        className="text-white/40 hover:text-white"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            {isReady ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                                <XCircle className="h-3.5 w-3.5 text-orange-400" />
                            )}
                            <span className="text-xs font-medium text-white/60">
                                Status
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-white">
                            {store.isDownloading
                                ? "Downloading..."
                                : store.isModelLoading
                                    ? "Loading..."
                                    : isReady
                                        ? "Ready"
                                        : hasCache
                                            ? "Not loaded"
                                            : "Not installed"}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <HardDrive className="h-3.5 w-3.5 text-white/40" />
                            <span className="text-xs font-medium text-white/60">
                                Cache
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-white">
                            {hasCache ? "Downloaded" : "Empty"}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Wifi className="h-3.5 w-3.5 text-white/40" />
                            <span className="text-xs font-medium text-white/60">
                                Readiness
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-white truncate">
                            {readiness}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Info className="h-3.5 w-3.5 text-white/40" />
                            <span className="text-xs font-medium text-white/60">
                                Plugin
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-white">
                            v{pluginVersion}
                        </p>
                    </div>
                </div>

                {/* Model Path */}
                {status.cachedModelPath && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-xs text-white/40 block mb-1">
                            Model Path
                        </span>
                        <p className="text-xs text-white/70 font-mono break-all">
                            {status.cachedModelPath}
                        </p>
                    </div>
                )}

                {/* Error */}
                {store.error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-300">{store.error}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                    Actions
                </h4>

                <div className="flex flex-wrap gap-2">
                    {!hasCache && !store.isDownloading && (
                        <Button
                            onClick={handleDownload}
                            disabled={isWorking || store.isDownloading}
                            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {isWorking ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            Download Model
                        </Button>
                    )}

                    <Button
                        onClick={handleReinstall}
                        disabled={isWorking || store.isDownloading}
                        variant="outline"
                        className="gap-2 border-white/10 text-white hover:bg-white/10"
                    >
                        {isWorking ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Reinstall Model
                    </Button>

                    {hasCache && (
                        <Button
                            onClick={handleClearCache}
                            disabled={isWorking}
                            variant="outline"
                            className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Cache
                        </Button>
                    )}
                </div>

                {store.isDownloading && (
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                                style={{ width: `${store.progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-white/50">{store.progressText}</p>
                    </div>
                )}
            </div>

            {/* Debug Logs */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => { setShowLogs(!showLogs); setLogs(getNativeLLMLogs()); }}
                        className="flex items-center gap-2 text-sm font-semibold text-white/70 uppercase tracking-wider hover:text-white transition-colors"
                    >
                        <ScrollText className="h-4 w-4" />
                        Debug Logs ({logs.length})
                        {showLogs ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </button>

                    {showLogs && (
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyLogs}
                                className="text-white/40 hover:text-white h-7 px-2"
                            >
                                <Copy className="h-3.5 w-3.5 mr-1" />
                                Copy
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearLogs}
                                className="text-red-400/60 hover:text-red-400 h-7 px-2"
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Clear
                            </Button>
                        </div>
                    )}
                </div>

                {showLogs && (
                    <div className="max-h-80 overflow-y-auto rounded-xl bg-black/40 border border-white/5 p-3 font-mono text-xs space-y-0.5">
                        {logs.length === 0 ? (
                            <p className="text-white/30 text-center py-4">
                                No logs yet. Try downloading or loading the model.
                            </p>
                        ) : (
                            logs.map((log, i) => (
                                <div
                                    key={i}
                                    className={`py-0.5 ${log.level === "error"
                                            ? "text-red-400"
                                            : log.level === "warn"
                                                ? "text-yellow-400"
                                                : "text-white/60"
                                        }`}
                                >
                                    <span className="text-white/30">{log.time}</span>{" "}
                                    <span
                                        className={`px-1 rounded text-[10px] uppercase ${log.level === "error"
                                                ? "bg-red-500/20 text-red-400"
                                                : log.level === "warn"
                                                    ? "bg-yellow-500/20 text-yellow-400"
                                                    : "bg-white/5 text-white/40"
                                            }`}
                                    >
                                        {log.level}
                                    </span>{" "}
                                    {log.msg}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Technical Info */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-[11px] text-white/30 leading-relaxed">
                    Platform: {platform} • Plugin: @capgo/capacitor-llm v{pluginVersion}
                    • Model: gemma-3-270m-it-int8 ~480MB (.task + .litertlm)
                    • CDN: cryonex-ai.b-cdn.net
                </p>
            </div>
        </div>
    );
}
