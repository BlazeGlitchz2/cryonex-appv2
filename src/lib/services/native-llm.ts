import { Capacitor } from "@capacitor/core";
import { CapgoLLM } from "@capgo/capacitor-llm";
import { useOfflineModelStore } from "../stores/offline-model-store";
import { deviceCapabilities } from "./device-capability";

// ─── Model Configs ───────────────────────────────────────────────
export type ModelTier = "tiny" | "small";

interface ModelConfig {
    id: ModelTier;
    name: string;
    filename: string;
    url: string;
    companionUrl: string;
    size: string;
}

const CDN_BASE = "https://cryonex-ai.b-cdn.net/gemma-3-tflite-gemma-3-270m-it-int8-v1"; // Using same base for simplicity, adjust for 2B if distinct

export const MODEL_TIERS: Record<ModelTier, ModelConfig> = {
    tiny: {
        id: "tiny",
        name: "Gemma 3 270M (Fast)",
        filename: "gemma-3-270m-it-int8.task",
        url: `${CDN_BASE}/gemma-3-270m-it-int8.task`,
        companionUrl: `${CDN_BASE}/gemma-3-270m-it-int8.litertlm`,
        size: "~300 MB"
    },
    small: {
        id: "small",
        name: "Gemma 2 2B (Smart)",
        filename: "gemma-2-2b-it-int8.task",
        url: `${CDN_BASE}/gemma-2-2b-it-int8.task`, // Placeholder - 2B model URL needs verification
        companionUrl: `${CDN_BASE}/gemma-2-2b-it-int8.litertlm`,
        size: "~1.4 GB"
    }
};

// Storage key for cached model path
const MODEL_PATH_KEY = "cryonex_native_model_path";
const MODEL_TIER_KEY = "cryonex_native_model_tier";

const PLUGIN_TIMEOUT = 10000; // Increased timeout for heavier operations
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
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
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
    private currentTier: ModelTier = "tiny";

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
        const cachedTier = localStorage.getItem(MODEL_TIER_KEY);
        return {
            isInitialized: this.isInitialized,
            hasCachedModel: !!cachedPath,
            cachedModelPath: cachedPath,
            cachedTier,
            currentChatId: this.currentChatId,
            modelPath: this.modelPath,
            currentTier: this.currentTier,
            platform: Capacitor.getPlatform(),
            isNative: Capacitor.isNativePlatform(),
        };
    }

    /** Delete cached model and reset state */
    async clearCache() {
        llmLog("info", "Clearing model cache...");
        localStorage.removeItem(MODEL_PATH_KEY);
        localStorage.removeItem(MODEL_TIER_KEY);
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

    /** Initialize with Tier Selection */
    async initialize(tier: ModelTier = "tiny", forceRedownload = false): Promise<void> {
        if (this.isInitialized && !forceRedownload && this.currentTier === tier) return;

        const { setDownloading, setProgress, setInitialized, setError, setModelLoading } = useOfflineModelStore.getState();
        setError(null);
        this.currentTier = tier;

        try {
            const platform = Capacitor.getPlatform();
            llmLog("info", "=== Initialize START ===");
            llmLog("info", "Platform:", platform, "| Tier:", tier, "| Force:", forceRedownload);

            // Auto-detect tier if not explicitly set (logic could be expanded)
            // For now, we respect the passed 'tier' argument which UI controls

            // 1. Check Cache
            const cachedPath = localStorage.getItem(MODEL_PATH_KEY);
            const cachedTier = localStorage.getItem(MODEL_TIER_KEY);

            // If we have a cached path AND it matches the requested tier (or no tier change requested)
            const isCacheValid = cachedPath && (cachedTier === tier);

            if (isCacheValid && !forceRedownload) {
                try {
                    llmLog("info", "Loading cached model from:", cachedPath);
                    setModelLoading(true);
                    setProgress(0, `Loading ${MODEL_TIERS[tier].name}...`);

                    await withTimeout(CapgoLLM.setModel({
                        path: cachedPath,
                        maxTokens: 2048,
                        topk: 40,
                        temperature: 0.8
                    }), 30000, "setModel cached");

                    const readiness = await withTimeout(CapgoLLM.getReadiness(), 2000, "getReadiness cache");

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
                    // Fallthrough to download
                }
            }

            // 2. Download New Model
            const modelConfig = MODEL_TIERS[tier];
            llmLog("info", "Starting download for", modelConfig.name);
            llmLog("info", "URL:", modelConfig.url);

            setDownloading(true);
            setProgress(0, `Downloading ${modelConfig.name} (${modelConfig.size})...`);

            const progressListener = await CapgoLLM.addListener('downloadProgress', (event) => {
                const progress = Math.round(event.progress || 0);
                if (progress % 10 === 0) llmLog("info", `Download: ${progress}%`); // Log less frequently
                setProgress(progress, `Downloading... ${progress}%`);
            });

            const result = await CapgoLLM.downloadModel({
                url: modelConfig.url,
                companionUrl: modelConfig.companionUrl,
                filename: modelConfig.filename
            });

            progressListener.remove();

            if (!result.path) {
                throw new Error("Download completed but no path returned.");
            }

            llmLog("info", "Download complete at:", result.path);
            this.modelPath = result.path;

            // Update Cache
            localStorage.setItem(MODEL_PATH_KEY, result.path);
            localStorage.setItem(MODEL_TIER_KEY, tier);

            // 3. Load Model
            setDownloading(false);
            setModelLoading(true);
            setProgress(0, "Loading model into memory...");

            await withTimeout(CapgoLLM.setModel({
                path: result.path,
                maxTokens: 2048,
                topk: 40,
                temperature: 0.8
            }), 30000, "setModel fresh");

            const readiness = await withTimeout(CapgoLLM.getReadiness(), 2000, "getReadiness fresh");
            if (readiness.readiness !== "ready") {
                throw new Error("Model load failed. Readiness: " + readiness.readiness);
            }

            // 4. Setup Chat
            await this.setupChat();

            this.isInitialized = true;
            setInitialized(true);
            setModelLoading(false);
            setProgress(100, "Ready");
            llmLog("info", "=== Initialize COMPLETE ===");

        } catch (error: any) {
            const errString = error?.message || String(error);
            llmLog("error", "Init FAILED:", errString);

            // SELF-HEALING: Check for corrupt zip or bad file signatures
            if (
                (errString.includes("Unable to open zip archive") ||
                    errString.includes("Failed to load model") ||
                    errString.includes("bad zip"))
                && !forceRedownload
            ) {
                llmLog("warn", "CORRUPT MODEL DETECTED. Triggering self-healing...");
                await this.clearCache();
                llmLog("info", "Cache cleared. Retrying download...");
                // Retry initialization with forced download, but prevent infinite loop
                return this.initialize(tier, true);
            }

            setError(`Failed to initialize: ${errString}`);
            setDownloading(false);
            setModelLoading(false);
            throw error;
        }
    }

    private async setupChat() {
        const { readiness } = await withTimeout(CapgoLLM.getReadiness(), 2000, "getReadiness setupChat");
        if (readiness !== "ready") throw new Error("Model not ready for chat: " + readiness);

        const { id } = await withTimeout(CapgoLLM.createChat(), PLUGIN_TIMEOUT, "createChat");
        this.currentChatId = id;
        llmLog("info", "Chat session created:", id);
    }

    private isGenerating = false;

    async chat(messages: any[], onStream: (chunk: string) => void) {
        if (this.isGenerating) {
            llmLog("warn", "Chat blocked: Response generation already in progress");
            throw new Error("AI is busy thinking. Please wait.");
        }

        if (!this.isInitialized || !this.currentChatId) {
            await this.initialize(this.currentTier);
        }

        // Just in case check
        const { readiness } = await withTimeout(CapgoLLM.getReadiness(), 2000, "getReadiness chat");
        if (readiness !== "ready") {
            llmLog("warn", "Model lost readiness, reinitializing...");
            await this.initialize(this.currentTier, true);
        }

        if (!this.currentChatId) throw new Error("Failed to create chat session");

        const lastMessage = messages[messages.length - 1]?.content;
        if (!lastMessage) throw new Error("No message content");

        const normalizeId = (id: any) => String(id).trim();

        this.isGenerating = true;

        return new Promise<void>(async (resolve, reject) => {
            let hasFinished = false;
            let textListener: { remove: () => Promise<void> } | null = null;
            let finishListener: { remove: () => Promise<void> } | null = null;

            const safeResolve = () => {
                // Remove listeners immediately
                textListener?.remove();
                finishListener?.remove();

                // Cool-down: Wait 1500ms before unlocking and resolving
                // This prevents race conditions where native engine isn't fully reset
                setTimeout(() => {
                    this.isGenerating = false;
                    resolve();
                }, 1500);
            };

            const safeReject = (err: any) => {
                textListener?.remove();
                finishListener?.remove();
                this.isGenerating = false;
                reject(err);
            };

            const timeout = setTimeout(() => {
                if (!hasFinished) {
                    hasFinished = true;
                    safeReject(new Error("AI response timed out (120s)"));
                }
            }, 120000);

            try {
                textListener = await CapgoLLM.addListener('textFromAi', (event) => {
                    llmLog("info", "Event Text:", JSON.stringify(event));

                    if (normalizeId(event.chatId) === normalizeId(this.currentChatId) && event.text) {
                        onStream(event.text);
                    } else {
                        llmLog("warn", "Skipped text event - ID mismatch:", event.chatId, "vs", this.currentChatId);
                    }
                });

                finishListener = await CapgoLLM.addListener('aiFinished', (event) => {
                    llmLog("info", "Event Finished:", JSON.stringify(event));

                    if (normalizeId(event.chatId) === normalizeId(this.currentChatId) && !hasFinished) {
                        hasFinished = true;
                        clearTimeout(timeout);
                        safeResolve();
                    } else if (!hasFinished) {
                        llmLog("warn", "Skipped finish event - ID mismatch:", event.chatId, "vs", this.currentChatId);
                    }
                });

                await withTimeout(CapgoLLM.sendMessage({
                    chatId: this.currentChatId!,
                    message: lastMessage
                }), PLUGIN_TIMEOUT, "sendMessage");

            } catch (error: any) {
                if (!hasFinished) {
                    hasFinished = true;
                    clearTimeout(timeout);
                    // For errors, we also want to ensure we don't return too fast if it was a "busy" error
                    // But generally immediate rejection is fine for errors
                    safeReject(error);
                }
            }
        });
    }

    /** 
     * Get available tiers based on device capability 
     * If HighEnd -> Both available
     * If LowEnd -> Suggest Tiny 
     */
    async getRecommendedTier(): Promise<ModelTier> {
        const caps = await deviceCapabilities.getCapabilities();
        return caps.isHighEnd ? "small" : "tiny";
    }
}

export const nativeLLM = new NativeLLMService();
