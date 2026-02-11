import { Capacitor } from "@capacitor/core";
import { CapgoLLM } from "@capgo/capacitor-llm";
import { useOfflineModelStore } from "../stores/offline-model-store";

// Model URLs from Cryonex CDN (Gemma 3 270M - pre-downloaded from Kaggle)
const CDN_BASE = "https://cryonex-ai.b-cdn.net/gemma-3-tflite-gemma-3-270m-it-int8-v1";
const ANDROID_MODEL_URL = `${CDN_BASE}/gemma-3-270m-it-int8.task`;
const ANDROID_COMPANION_URL = `${CDN_BASE}/gemma-3-270m-it-int8.litertlm`;

// Storage key for cached model path
const MODEL_PATH_KEY = "cryonex_native_model_path";

const PLUGIN_TIMEOUT = 5000;
function withTimeout<T>(promise: Promise<T>, timeoutMs = PLUGIN_TIMEOUT, name = "Plugin call"): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${name} timed out after ${timeoutMs}ms`)), timeoutMs))
    ]);
}

// ─── In-app log capture ─────────────────────────────────────────
const MAX_LOGS = 200;
const logEntries: { time: string; level: string; msg: string }[] = [];

function llmLog(level: "info" | "warn" | "error", ...args: any[]) {
    const msg = args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
    const time = new Date().toLocaleTimeString("en-US", { hour12: false, fractionalSecondDigits: 3 });
    logEntries.push({ time, level, msg });
    if (logEntries.length > MAX_LOGS) logEntries.shift();

    if (level === "error") console.error("Native LLM:", ...args);
    else if (level === "warn") console.warn("Native LLM:", ...args);
    else console.log("Native LLM:", ...args);
}

/** Get all captured log entries */
export function getNativeLLMLogs() {
    return [...logEntries];
}

/** Clear all captured logs */
export function clearNativeLLMLogs() {
    logEntries.length = 0;
}

// ─── Service ─────────────────────────────────────────────────────
export class NativeLLMService {
    private isInitialized = false;
    private currentChatId: string | null = null;
    private modelPath: string | null = null;

    /** Check if the model is loaded and ready to chat */
    isModelReady(): boolean {
        return this.isInitialized;
    }

    /** Check if a cached model path exists on disk */
    hasCachedModel(): boolean {
        return !!localStorage.getItem(MODEL_PATH_KEY);
    }

    /** Get detailed status information */
    getStatus() {
        const cachedPath = localStorage.getItem(MODEL_PATH_KEY);
        return {
            isInitialized: this.isInitialized,
            hasCachedModel: !!cachedPath,
            cachedModelPath: cachedPath,
            currentChatId: this.currentChatId,
            modelPath: this.modelPath,
            platform: Capacitor.getPlatform(),
            isNative: Capacitor.isNativePlatform(),
        };
    }

    /** Delete cached model and reset state */
    async clearCache() {
        llmLog("info", "Clearing model cache...");
        localStorage.removeItem(MODEL_PATH_KEY);
        this.isInitialized = false;
        this.currentChatId = null;
        this.modelPath = null;
        const store = useOfflineModelStore.getState();
        store.reset();
        llmLog("info", "Cache cleared. Model will re-download on next use.");
    }

    /** Query plugin readiness directly */
    async queryReadiness(): Promise<string> {
        try {
            const { readiness } = await withTimeout(CapgoLLM.getReadiness(), 2000, "getReadiness");
            return readiness;
        } catch (e: any) {
            return "error: " + e.message;
        }
    }

    /** Query plugin version */
    async queryVersion(): Promise<string> {
        try {
            const { version } = await withTimeout(CapgoLLM.getPluginVersion(), 2000, "getPluginVersion");
            return version;
        } catch (e: any) {
            return "error: " + e.message;
        }
    }

    async initialize(forceRedownload = false) {
        if (this.isInitialized && !forceRedownload) return;

        const { setDownloading, setProgress, setInitialized, setError, setModelLoading } = useOfflineModelStore.getState();
        setError(null);

        try {
            const platform = Capacitor.getPlatform();
            llmLog("info", "=== Initialize START ===");
            llmLog("info", "Platform:", platform, "| Force:", forceRedownload);

            // iOS: Just use Apple Intelligence
            if (platform === "ios") {
                llmLog("info", "Using Apple Intelligence on iOS");
                setModelLoading(true);
                setProgress(0, "Connecting to Apple Intelligence...");
                await withTimeout(CapgoLLM.setModel({ path: "Apple Intelligence" }), PLUGIN_TIMEOUT, "setModel iOS");
                this.modelPath = "Apple Intelligence";
                await this.setupChat();
                this.isInitialized = true;
                setInitialized(true);
                setModelLoading(false);
                setProgress(100, "Ready");
                llmLog("info", "iOS init complete");
                return;
            }

            // Android: Check for cached model path first
            const cachedPath = localStorage.getItem(MODEL_PATH_KEY);
            llmLog("info", "Cached path:", cachedPath || "(none)");

            if (cachedPath && !forceRedownload) {
                try {
                    llmLog("info", "Loading cached model...");
                    setModelLoading(true);
                    setProgress(0, "Loading AI model from storage...");

                    await withTimeout(CapgoLLM.setModel({
                        path: cachedPath,
                        maxTokens: 2048,
                        topk: 40,
                        temperature: 0.8
                    }), 15000, "setModel cached"); // Loading model might take longer

                    // Verify model actually loaded
                    const readiness = await withTimeout(CapgoLLM.getReadiness(), 2000, "getReadiness cache");
                    llmLog("info", "Readiness after cached setModel:", readiness.readiness);

                    if (readiness.readiness === "ready") {
                        llmLog("info", "Cached model loaded OK");
                        this.modelPath = cachedPath;
                        await this.setupChat();
                        this.isInitialized = true;
                        setInitialized(true);
                        setModelLoading(false);
                        setProgress(100, "Ready");
                        return;
                    } else {
                        throw new Error("Readiness: " + readiness.readiness);
                    }
                } catch (cacheError: any) {
                    llmLog("warn", "Cached model failed:", cacheError?.message);
                    localStorage.removeItem(MODEL_PATH_KEY);
                    setModelLoading(false);
                }
            }

            // No cached model or cache failed - need to download
            llmLog("info", "Starting download...");
            llmLog("info", ".task URL:", ANDROID_MODEL_URL);
            llmLog("info", ".litertlm URL:", ANDROID_COMPANION_URL);

            setDownloading(true);
            setProgress(0, "Downloading AI Model (~480MB)...");

            // Listen for progress
            const progressListener = await CapgoLLM.addListener('downloadProgress', (event) => {
                const progress = Math.round(event.progress || 0);
                if (progress % 10 === 0) llmLog("info", `Download: ${progress}%`);
                setProgress(progress, `Downloading... ${progress}%`);
            });

            const result = await CapgoLLM.downloadModel({
                url: ANDROID_MODEL_URL,
                companionUrl: ANDROID_COMPANION_URL,
                filename: "gemma-3-270m-it-int8.task"
            });

            progressListener.remove();

            llmLog("info", "Download complete. Path:", result.path);
            llmLog("info", "Companion:", result.companionPath || "(none)");

            if (!result.path) {
                throw new Error("Download completed but no path returned.");
            }

            this.modelPath = result.path;
            localStorage.setItem(MODEL_PATH_KEY, result.path);

            // Set the model
            llmLog("info", "Calling setModel with path:", result.path);
            setDownloading(false);
            setModelLoading(true);
            setProgress(0, "Loading AI model into memory...");

            await withTimeout(CapgoLLM.setModel({
                path: result.path,
                maxTokens: 2048,
                topk: 40,
                temperature: 0.8
            }), 20000, "setModel fresh"); // Give plenty of time for fresh load

            // Verify model loaded
            const readiness = await withTimeout(CapgoLLM.getReadiness(), 2000, "getReadiness fresh");
            llmLog("info", "Readiness after setModel:", readiness.readiness);

            if (readiness.readiness !== "ready") {
                throw new Error("Model load failed. Readiness: " + readiness.readiness);
            }

            // Setup chat session
            await this.setupChat();

            this.isInitialized = true;
            setInitialized(true);
            setModelLoading(false);
            setProgress(100, "Ready");
            llmLog("info", "=== Initialize COMPLETE ===");

        } catch (error: any) {
            llmLog("error", "Init FAILED:", error?.message, error?.stack);
            setError(`Failed to initialize: ${error.message}`);
            setDownloading(false);
            setModelLoading(false);
            throw error;
        }
    }

    private async setupChat() {
        const { readiness } = await withTimeout(CapgoLLM.getReadiness(), 2000, "getReadiness setupChat");
        llmLog("info", "setupChat readiness:", readiness);

        if (readiness !== "ready") {
            throw new Error("Cannot create chat - model not ready: " + readiness);
        }

        const { id } = await withTimeout(CapgoLLM.createChat(), PLUGIN_TIMEOUT, "createChat");
        this.currentChatId = id;
        llmLog("info", "Chat session created:", id);
    }

    async chat(messages: any[], onStream: (chunk: string) => void) {
        if (!this.isInitialized || !this.currentChatId) {
            llmLog("info", "Chat: not initialized, calling initialize()");
            await this.initialize();
        }

        // Double-check readiness
        const { readiness } = await withTimeout(CapgoLLM.getReadiness(), 2000, "getReadiness chat");
        llmLog("info", "Chat: readiness =", readiness);

        if (readiness !== "ready") {
            llmLog("warn", "Chat: Model not ready, reinitializing...");
            this.isInitialized = false;
            this.currentChatId = null;
            await this.initialize(true);
        }

        if (!this.currentChatId) {
            throw new Error("Failed to create chat session");
        }

        const lastMessage = messages[messages.length - 1]?.content;
        if (!lastMessage) throw new Error("No message content");

        llmLog("info", "Chat: Sending to", this.currentChatId, "msg:", lastMessage.substring(0, 80));

        return new Promise<void>(async (resolve, reject) => {
            let hasFinished = false;
            let receivedAnyText = false;
            let textListener: { remove: () => Promise<void> } | null = null;
            let finishListener: { remove: () => Promise<void> } | null = null;

            const cleanup = () => {
                textListener?.remove();
                finishListener?.remove();
            };

            const timeout = setTimeout(() => {
                if (!hasFinished) {
                    hasFinished = true;
                    llmLog("error", "Chat TIMEOUT (120s). receivedText:", receivedAnyText);
                    cleanup();
                    this.currentChatId = null;
                    if (receivedAnyText) resolve();
                    else reject(new Error("AI did not respond within 120s. Check logs in Settings > Offline AI."));
                }
            }, 120000);

            try {
                textListener = await CapgoLLM.addListener('textFromAi', (event) => {
                    if (event.chatId === this.currentChatId && event.text) {
                        receivedAnyText = true;
                        llmLog("info", "Chunk:", event.text.substring(0, 40));
                        onStream(event.text);
                    }
                });

                finishListener = await CapgoLLM.addListener('aiFinished', (event) => {
                    if (event.chatId === this.currentChatId && !hasFinished) {
                        hasFinished = true;
                        llmLog("info", "AI finished");
                        clearTimeout(timeout);
                        cleanup();
                        resolve();
                    }
                });

                await withTimeout(CapgoLLM.sendMessage({
                    chatId: this.currentChatId!,
                    message: lastMessage
                }), PLUGIN_TIMEOUT, "sendMessage");

                llmLog("info", "sendMessage dispatched OK");

            } catch (error: any) {
                if (!hasFinished) {
                    hasFinished = true;
                    clearTimeout(timeout);
                    cleanup();
                    llmLog("error", "sendMessage error:", error?.message);

                    if (error?.message?.includes("not ready") || error?.message?.includes("not found")) {
                        this.isInitialized = false;
                        this.currentChatId = null;
                        localStorage.removeItem(MODEL_PATH_KEY); // Also maybe clear bad path
                    }
                    reject(error);
                }
            }
        });
    }
}

export const nativeLLM = new NativeLLMService();
