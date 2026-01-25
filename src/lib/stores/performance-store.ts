import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PerformanceTier } from '@/hooks/use-performance';

export type ImageQuality = 'low' | 'medium' | 'high';

interface PerformanceState {
    // Auto-detected or manual override
    qualityTier: PerformanceTier | 'auto';

    // Individual toggles
    disableShaders: boolean;
    disableParticles: boolean;
    disable3D: boolean;
    reducedMotion: boolean;

    // Study Mode (quick toggle for focus)
    studyMode: boolean;

    // Asset quality
    imageQuality: ImageQuality;
    videoQuality: ImageQuality;

    // Auto-detected tier (stored separately from override)
    detectedTier: PerformanceTier | null;
}

interface PerformanceActions {
    setQualityTier: (tier: PerformanceTier | 'auto') => void;
    setDisableShaders: (disabled: boolean) => void;
    setDisableParticles: (disabled: boolean) => void;
    setDisable3D: (disabled: boolean) => void;
    setReducedMotion: (reduced: boolean) => void;
    setStudyMode: (enabled: boolean) => void;
    setImageQuality: (quality: ImageQuality) => void;
    setVideoQuality: (quality: ImageQuality) => void;
    setDetectedTier: (tier: PerformanceTier) => void;
    resetToAuto: () => void;

    // Computed getters
    getEffectiveTier: () => PerformanceTier;
    shouldDisableHeavyEffects: () => boolean;
}

export type PerformanceStore = PerformanceState & PerformanceActions;

const initialState: PerformanceState = {
    qualityTier: 'auto',
    disableShaders: false,
    disableParticles: false,
    disable3D: false,
    reducedMotion: false,
    studyMode: false,
    imageQuality: 'high',
    videoQuality: 'high',
    detectedTier: null,
};

export const usePerformanceStore = create<PerformanceStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setQualityTier: (tier) => {
                const updates: Partial<PerformanceState> = { qualityTier: tier };

                // Auto-configure based on tier
                if (tier === 'lite') {
                    updates.disableShaders = true;
                    updates.disableParticles = true;
                    updates.disable3D = true;
                    updates.imageQuality = 'low';
                    updates.videoQuality = 'low';
                } else if (tier === 'balanced') {
                    updates.disableShaders = false;
                    updates.disableParticles = true;
                    updates.disable3D = false;
                    updates.imageQuality = 'medium';
                    updates.videoQuality = 'medium';
                } else if (tier === 'full') {
                    updates.disableShaders = false;
                    updates.disableParticles = false;
                    updates.disable3D = false;
                    updates.imageQuality = 'high';
                    updates.videoQuality = 'high';
                }

                set(updates);
            },

            setDisableShaders: (disabled) => set({ disableShaders: disabled }),
            setDisableParticles: (disabled) => set({ disableParticles: disabled }),
            setDisable3D: (disabled) => set({ disable3D: disabled }),
            setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
            setStudyMode: (enabled) => {
                if (enabled) {
                    set({
                        studyMode: true,
                        reducedMotion: true,
                        disableParticles: true
                    });
                } else {
                    set({ studyMode: false });
                }
            },
            setImageQuality: (quality) => set({ imageQuality: quality }),
            setVideoQuality: (quality) => set({ videoQuality: quality }),

            setDetectedTier: (tier) => {
                const state = get();
                set({ detectedTier: tier });

                // If on auto, apply the detected tier settings
                if (state.qualityTier === 'auto') {
                    get().setQualityTier(tier);
                    set({ qualityTier: 'auto' }); // Reset back to auto after applying settings
                }
            },

            resetToAuto: () => {
                const detectedTier = get().detectedTier;
                set({ ...initialState, detectedTier });

                if (detectedTier) {
                    get().setQualityTier(detectedTier);
                    set({ qualityTier: 'auto' });
                }
            },

            getEffectiveTier: () => {
                const state = get();
                if (state.qualityTier === 'auto') {
                    return state.detectedTier || 'balanced';
                }
                return state.qualityTier;
            },

            shouldDisableHeavyEffects: () => {
                const state = get();
                const effectiveTier = get().getEffectiveTier();
                return (
                    effectiveTier === 'lite' ||
                    state.disableShaders ||
                    state.disableParticles ||
                    state.reducedMotion
                );
            },
        }),
        {
            name: 'performance-store',
            partialize: (state) => ({
                qualityTier: state.qualityTier,
                disableShaders: state.disableShaders,
                disableParticles: state.disableParticles,
                disable3D: state.disable3D,
                reducedMotion: state.reducedMotion,
                imageQuality: state.imageQuality,
                videoQuality: state.videoQuality,
            }),
        }
    )
);

// Check for OS-level reduced motion preference
if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (mediaQuery.matches) {
        usePerformanceStore.getState().setReducedMotion(true);
    }

    mediaQuery.addEventListener('change', (e) => {
        usePerformanceStore.getState().setReducedMotion(e.matches);
    });
}
