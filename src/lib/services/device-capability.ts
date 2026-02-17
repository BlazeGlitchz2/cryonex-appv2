import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";

export type DeviceTier = "low" | "high";

export interface DeviceCapabilities {
    tier: DeviceTier;
    memory?: number;
    cores?: number;
    isHighEnd: boolean;
}

class DeviceCapabilityService {
    private capabilities: DeviceCapabilities | null = null;

    async getCapabilities(): Promise<DeviceCapabilities> {
        if (this.capabilities) return this.capabilities;

        let tier: DeviceTier = "low";
        let memory: number | undefined;
        let cores: number | undefined;

        try {
            // 1. Check Hardware Concurrency (Cores)
            if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
                cores = navigator.hardwareConcurrency;
            }

            // 2. Check Memory (RAM) via Capacitor Device Info
            const info = await Device.getInfo();
            const memInfo = await Device.getLanguageCode(); // Placeholder, Device plugin needs 'getMemoryUsage' often via custom plugin or we infer

            // Inference Logic:
            // iOS: iPhone 13 Pro+ (6GB RAM) -> High
            // Android: > 8GB RAM -> High

            // Since we can't easily get exact RAM on standard web/capacitor without a specific plugin:
            // We'll use a heuristic based on cores and platform

            if (cores && cores >= 8) {
                tier = "high";
            }

            // iOS Check: older iPhones have fewer cores/RAM. 
            // iPhone 15 Pro = 6 Cores (2P+4E). Wait, hardwareConcurrency often returns 2-4 on iOS web.
            // Let's be conservative.

            const isIOS = Capacitor.getPlatform() === 'ios';
            if (isIOS) {
                // Assume High Tier for newer devices if we can (hard to detect model exactly without plugin)
                // For now, default to "low" (Tiny Model) for safety on iOS unless user opts-in via UI
                tier = "low";
            }

        } catch (e) {
            console.warn("Failed to detect device capabilities", e);
        }

        this.capabilities = {
            tier,
            memory,
            cores,
            isHighEnd: tier === "high"
        };

        return this.capabilities;
    }

    isHighEnd(): boolean {
        return this.capabilities?.tier === "high";
    }
}

export const deviceCapabilities = new DeviceCapabilityService();
