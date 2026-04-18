export type OfflineModelTier = "tiny" | "small";
export type OfflineModelMode = "web" | "native";

export const NATIVE_MODEL_PATH_KEY = "cryonex_native_model_path";
export const NATIVE_MODEL_TIER_KEY = "cryonex_native_model_tier";

export interface OfflineModelStateSnapshot {
  isInitialized: boolean;
  isDownloading: boolean;
  isModelLoading: boolean;
  progress: number;
  progressText: string;
  error: string | null;
  mode: OfflineModelMode;
  currentTier: OfflineModelTier;
  hasCachedModel: boolean;
  cachedModelPath: string | null;
}

export interface LocalAIStateSnapshot {
  isModelDownloaded: boolean;
  downloadProgress: number;
  downloadText: string;
  isInitializing: boolean;
  isModelLoading: boolean;
  error: string | null;
  currentTier: OfflineModelTier;
}

export function createDefaultOfflineModelState(
  overrides: Partial<OfflineModelStateSnapshot> = {},
): OfflineModelStateSnapshot {
  const cachedModelPath =
    typeof localStorage === "undefined"
      ? null
      : localStorage.getItem(NATIVE_MODEL_PATH_KEY);
  const cachedTier =
    typeof localStorage === "undefined"
      ? null
      : localStorage.getItem(NATIVE_MODEL_TIER_KEY);

  return {
    isInitialized: false,
    isDownloading: false,
    isModelLoading: false,
    progress: 0,
    progressText: "",
    error: null,
    mode: "web",
    currentTier: getEffectiveOfflineModelTier(undefined, cachedTier, "tiny"),
    hasCachedModel: !!cachedModelPath,
    cachedModelPath,
    ...overrides,
  };
}

export function getEffectiveOfflineModelTier(
  requestedTier?: OfflineModelTier | null,
  cachedTier?: string | null,
  fallbackTier: OfflineModelTier = "tiny",
): OfflineModelTier {
  if (requestedTier) return requestedTier;
  if (cachedTier === "tiny" || cachedTier === "small") return cachedTier;
  return fallbackTier;
}

export function mapOfflineStateToLocalAIState(
  state: Pick<
    OfflineModelStateSnapshot,
    | "isInitialized"
    | "isDownloading"
    | "isModelLoading"
    | "progress"
    | "progressText"
    | "error"
    | "currentTier"
    | "hasCachedModel"
  >,
): LocalAIStateSnapshot {
  return {
    isModelDownloaded: state.isInitialized || state.hasCachedModel,
    downloadProgress: state.progress,
    downloadText: state.progressText,
    isInitializing: state.isDownloading || state.isModelLoading,
    isModelLoading: state.isModelLoading,
    error: state.error,
    currentTier: state.currentTier,
  };
}

export function getLocalAIAvailability({
  isNativePlatform,
}: {
  isNativePlatform: boolean;
}): { isAvailable: boolean; reason: string | null } {
  if (isNativePlatform) {
    return {
      isAvailable: true,
      reason: null,
    };
  }

  return {
    isAvailable: false,
    reason: "On-device local AI is available only in the iOS and Android app.",
  };
}
