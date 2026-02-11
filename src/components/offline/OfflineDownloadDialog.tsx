import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useOfflineModelStore } from "@/lib/stores/offline-model-store";
import { Download, WifiOff, Wifi, AlertTriangle, CheckCircle2, Loader2, BrainCircuit } from "lucide-react";
import { useState, useEffect } from "react";
import { offlineLLM, WebGpuDiagnostics } from "@/lib/services/offline-llm";
import { nativeLLM } from "@/lib/services/native-llm";
import { Capacitor } from "@capacitor/core";

export function OfflineDownloadDialog() {
    const { isDownloading, isModelLoading, progress, progressText, error, setError } = useOfflineModelStore();
    const [diagnostics, setDiagnostics] = useState<WebGpuDiagnostics | null>(null);
    const [networkStatus, setNetworkStatus] = useState<{ connected: boolean; type: string } | null>(null);
    const isNative = Capacitor.isNativePlatform();

    useEffect(() => {
        if (isDownloading || error) {
            offlineLLM.runDiagnostics().then(setDiagnostics);
        }
        // Check network status on native
        if (isNative && (isDownloading || isModelLoading || error)) {
            setNetworkStatus({ connected: navigator.onLine, type: 'unknown' });
        }
    }, [isDownloading, isModelLoading, error, isNative]);

    const isChromeAndroid = navigator.userAgent.includes("Android") && navigator.userAgent.includes("Chrome");

    const isOpen = isDownloading || isModelLoading || !!error;
    const title = error ? "Setup Failed" : (isModelLoading ? "Initializing AI Brain" : "Downloading Offline Model");

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) setError(null); }}>
            <DialogContent className="glass-panel border-white/10 text-white w-[95vw] max-w-sm sm:max-w-[425px] rounded-[2rem] p-6 focus:outline-none">
                <DialogHeader className="items-center text-center space-y-4">
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-2 ${error ? "bg-red-500/10" : "bg-purple-500/10"
                        }`}>
                        {error ? (
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                        ) : isModelLoading ? (
                            <BrainCircuit className="h-8 w-8 text-purple-400 animate-pulse" />
                        ) : (
                            <Download className="h-8 w-8 text-purple-400 animate-pulse" />
                        )}
                    </div>
                    <DialogTitle className="text-2xl font-bold">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Diagnostic Info - Only show when downloading or error */}
                    {diagnostics && !isModelLoading && (
                        <div className="bg-white/5 rounded-xl p-3 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-white/60">GPU:</span>
                                <span className="text-white/90 font-mono">{diagnostics.adapterName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60">Status:</span>
                                <span className={diagnostics.isSupported ? "text-green-400" : "text-red-400"}>
                                    {diagnostics.isSupported ? "Supported" : "Unsupported"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Network Status Badge (native only) */}
                    {isNative && networkStatus && (
                        <div className="flex items-center justify-center gap-2 text-xs">
                            {networkStatus.connected ? (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                    <Wifi className="h-3 w-3" />
                                    {networkStatus.type === 'cellular' ? 'Mobile Data' : 'Online'}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                                    <WifiOff className="h-3 w-3" />
                                    Offline
                                </span>
                            )}
                            {!networkStatus.connected && offlineLLM.hasCachedModel() && (
                                <span className="text-emerald-400/70">• Using cached model</span>
                            )}
                        </div>
                    )}

                    {error ? (
                        <div className="space-y-3">
                            <p className="text-sm text-red-300 text-center bg-red-950/30 p-3 rounded-lg border border-red-500/20">
                                {error}
                            </p>

                            <Button
                                onClick={() => offlineLLM.initialize(true)}
                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                                variant="outline"
                            >
                                Retry Download
                            </Button>

                            {isChromeAndroid && !diagnostics?.isSupported && (
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-left space-y-2">
                                    <h4 className="text-sm font-semibold text-blue-200 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        How to fix on Android:
                                    </h4>
                                    <ol className="text-xs text-blue-100/70 space-y-2 list-decimal list-inside">
                                        <li>Open <b>chrome://flags</b> in address bar</li>
                                        <li>Search for <b>"WebGPU"</b></li>
                                        <li>Set it to <b>Enabled</b></li>
                                        <li>Restart Chrome completely</li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-purple-400">
                                    {isModelLoading ? "Loading Model..." : "Installation Progress"}
                                </span>
                                {!isModelLoading && <span className="text-white/80">{Math.round(progress)}%</span>}
                            </div>

                            {isModelLoading ? (
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-1/3 animate-[shimmer_1.5s_infinite_linear] rounded-full"
                                        style={{ width: '100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                                </div>
                            ) : (
                                <Progress value={progress} className="h-2 bg-white/10" indicatorClassName="bg-purple-500" />
                            )}

                            <p className="text-xs text-white/40 text-center h-4 flex items-center justify-center gap-2">
                                {isModelLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                                {progressText || (isModelLoading ? "Loading large AI model into memory. This may take a minute..." : "")}
                            </p>
                        </div>
                    )}

                    {!error && (
                        <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
                            <WifiOff className="h-5 w-5 text-white/60 shrink-0 mt-0.5" />
                            <div className="space-y-1 text-left">
                                <h4 className="text-sm font-medium text-white/90">
                                    {isNative ? 'Smart Offline AI' : 'Why download?'}
                                </h4>
                                <p className="text-xs text-white/50 leading-relaxed">
                                    {isNative
                                        ? 'Downloads once, works forever offline. Your AI model is stored locally on your device.'
                                        : 'Use Cryonex locally on your tablet. No internet required.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
