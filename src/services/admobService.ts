/**
 * AdMob Service for Capacitor
 * Handles rewarded ads on Android/iOS platforms
 */

import { Capacitor } from '@capacitor/core';
import { AdMob, AdmobConsentStatus, RewardAdOptions, RewardAdPluginEvents } from '@capacitor-community/admob';

// AdMob Configuration
const ADMOB_CONFIG = {
    // Your real AdMob App ID (configured in AndroidManifest.xml)
    appId: 'ca-app-pub-3635462983246862~2187680916',

    // Use Google's TEST rewarded ad ID for development
    // Real ads can take 24-48 hours to start serving for new ad units
    // Switch to your real ad unit ID when ready for production:
    // Production: 'ca-app-pub-3635462983246862/6689188810'
    rewardedAdUnitId: 'ca-app-pub-3940256099942544/5224354917', // Google Test Rewarded Ad

    // Set to true to use test ads during development
    useTesting: true,
};

let isInitialized = false;
let adPrepared = false;

/**
 * Initialize AdMob SDK
 * Call this once when the app starts
 */
export async function initializeAdMob(): Promise<boolean> {
    // Only run on native platforms (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
        console.log('[AdMob] Not a native platform, skipping initialization');
        return false;
    }

    if (isInitialized) {
        return true;
    }

    try {
        // Initialize AdMob
        await AdMob.initialize({
            initializeForTesting: ADMOB_CONFIG.useTesting,
        });

        // Check consent status (GDPR compliance)
        try {
            const consentInfo = await AdMob.requestConsentInfo();

            if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
                await AdMob.showConsentForm();
            }
        } catch (consentError) {
            console.log('[AdMob] Consent check skipped:', consentError);
        }

        isInitialized = true;
        console.log('[AdMob] Initialized successfully');
        return true;
    } catch (error) {
        console.error('[AdMob] Initialization failed:', error);
        return false;
    }
}

/**
 * Prepare a rewarded ad
 * This loads the ad so it's ready to show
 */
export async function prepareRewardedAd(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
        return false;
    }

    // Make sure AdMob is initialized
    if (!isInitialized) {
        await initializeAdMob();
    }

    try {
        const options: RewardAdOptions = {
            adId: ADMOB_CONFIG.rewardedAdUnitId,
            isTesting: ADMOB_CONFIG.useTesting,
        };

        await AdMob.prepareRewardVideoAd(options);
        adPrepared = true;
        console.log('[AdMob] Rewarded ad prepared successfully');
        return true;
    } catch (error) {
        console.error('[AdMob] Failed to prepare rewarded ad:', error);
        adPrepared = false;
        return false;
    }
}

/**
 * Show a rewarded ad
 * Returns true if the user earned the reward
 */
export async function showRewardedAd(): Promise<{ success: boolean; rewarded: boolean; error?: string }> {
    if (!Capacitor.isNativePlatform()) {
        // On web, simulate watching an ad (fallback behavior)
        console.log('[AdMob] Not a native platform, simulating ad view');
        return { success: true, rewarded: true };
    }

    // Make sure we have an ad prepared
    if (!adPrepared) {
        console.log('[AdMob] No ad prepared, preparing now...');
        const prepared = await prepareRewardedAd();
        if (!prepared) {
            return { success: false, rewarded: false, error: 'Failed to load ad. Please try again.' };
        }
    }

    return new Promise(async (resolve) => {
        let wasRewarded = false;
        let resolved = false;

        const cleanup = async (rewardListener: any, dismissListener: any, failedListener: any) => {
            try {
                await rewardListener?.remove();
                await dismissListener?.remove();
                await failedListener?.remove();
            } catch (e) {
                console.log('[AdMob] Error cleaning up listeners:', e);
            }
        };

        // Set up event listeners (these return Promises, so we need to await them)
        const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
            console.log('[AdMob] User earned reward!');
            wasRewarded = true;
        });

        const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
            console.log('[AdMob] Ad dismissed, rewarded:', wasRewarded);
            if (!resolved) {
                resolved = true;
                await cleanup(rewardListener, dismissListener, failedListener);
                adPrepared = false; // Need to prepare a new ad
                resolve({ success: true, rewarded: wasRewarded });
            }
        });

        const failedListener = await AdMob.addListener(RewardAdPluginEvents.FailedToShow, async (error) => {
            console.error('[AdMob] Failed to show ad:', error);
            if (!resolved) {
                resolved = true;
                await cleanup(rewardListener, dismissListener, failedListener);
                adPrepared = false;
                resolve({ success: false, rewarded: false, error: 'Ad failed to display. Please try again.' });
            }
        });

        try {
            // Show the ad
            await AdMob.showRewardVideoAd();
            console.log('[AdMob] Showing rewarded ad...');
        } catch (error: any) {
            console.error('[AdMob] Error showing ad:', error);
            if (!resolved) {
                resolved = true;
                await cleanup(rewardListener, dismissListener, failedListener);
                adPrepared = false;
                resolve({
                    success: false,
                    rewarded: false,
                    error: error.message || 'No ad available. Please try again later.'
                });
            }
        }
    });
}

/**
 * Check if running on a native platform (Android/iOS)
 */
export function isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
}

/**
 * Get the current platform
 */
export function getPlatform(): string {
    return Capacitor.getPlatform();
}
