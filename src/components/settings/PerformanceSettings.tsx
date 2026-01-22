import { usePerformanceStore, type ImageQuality } from "@/lib/stores/performance-store";
import { usePerformance, type PerformanceTier } from "@/hooks/use-performance";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Zap,
    Sparkles,
    Gauge,
    Monitor,
    Cpu,
    HardDrive,
    RefreshCw,
    Eye,
    EyeOff,
    Layers,
    Box,
    Image as ImageIcon,
    type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const tierConfig: Record<PerformanceTier | 'auto', { label: string; description: string; icon: LucideIcon; color: string }> = {
    auto: { label: "Auto", description: "Automatically detect", icon: Gauge, color: "text-blue-400" },
    full: { label: "Full", description: "Maximum quality", icon: Sparkles, color: "text-purple-400" },
    balanced: { label: "Balanced", description: "Best for most PCs", icon: Zap, color: "text-yellow-400" },
    lite: { label: "Lite", description: "For low-end devices", icon: Monitor, color: "text-green-400" },
};

export function PerformanceSettings() {
    const { tier: detectedTier, metrics, isDetecting, rerunBenchmark } = usePerformance();
    const {
        qualityTier,
        disableShaders,
        disableParticles,
        disable3D,
        reducedMotion,
        imageQuality,
        setQualityTier,
        setDisableShaders,
        setDisableParticles,
        setDisable3D,
        setReducedMotion,
        setImageQuality,
        resetToAuto,
        getEffectiveTier,
    } = usePerformanceStore();

    const effectiveTier = getEffectiveTier();

    return (
        <div className="space-y-6">
            {/* Quality Tier Selector */}
            <Card className="bg-black/40 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Gauge className="h-5 w-5" />
                        Performance Mode
                    </CardTitle>
                    <CardDescription>
                        Choose a quality preset or let Cryonex auto-detect the best setting for your device.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(['auto', 'full', 'balanced', 'lite'] as const).map((tier) => {
                            const config = tierConfig[tier];
                            const isActive = qualityTier === tier;
                            const Icon = config.icon;
                            return (
                                <button
                                    key={tier}
                                    onClick={() => setQualityTier(tier)}
                                    className={cn(
                                        "relative p-4 rounded-xl border transition-all text-left",
                                        isActive
                                            ? "bg-white/10 border-white/20 shadow-lg"
                                            : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5"
                                    )}
                                >
                                    <Icon className={cn("h-6 w-6 mb-2", config.color)} />
                                    <div className="font-medium text-white">{config.label}</div>
                                    <div className="text-xs text-white/50">{config.description}</div>
                                    {isActive && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {qualityTier === 'auto' && detectedTier && (
                        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-sm text-blue-300">
                                <span className="font-medium">Auto-detected:</span> {tierConfig[detectedTier].label} mode
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Individual Toggles */}
            <Card className="bg-black/40 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        Fine-tune Effects
                    </CardTitle>
                    <CardDescription>
                        Manually toggle individual visual effects for granular control.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                            <div>
                                <Label className="text-white">Shader Effects</Label>
                                <p className="text-xs text-white/50">WebGL background animations</p>
                            </div>
                        </div>
                        <Switch
                            checked={!disableShaders}
                            onCheckedChange={(checked) => setDisableShaders(!checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-5 w-5 text-yellow-400" />
                            <div>
                                <Label className="text-white">Particle Effects</Label>
                                <p className="text-xs text-white/50">Sparkles and floating particles</p>
                            </div>
                        </div>
                        <Switch
                            checked={!disableParticles}
                            onCheckedChange={(checked) => setDisableParticles(!checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Box className="h-5 w-5 text-cyan-400" />
                            <div>
                                <Label className="text-white">3D Elements</Label>
                                <p className="text-xs text-white/50">Spline scenes and 3D models</p>
                            </div>
                        </div>
                        <Switch
                            checked={!disable3D}
                            onCheckedChange={(checked) => setDisable3D(!checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {reducedMotion ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-green-400" />}
                            <div>
                                <Label className="text-white">Reduce Motion</Label>
                                <p className="text-xs text-white/50">Minimize animations system-wide</p>
                            </div>
                        </div>
                        <Switch
                            checked={reducedMotion}
                            onCheckedChange={setReducedMotion}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Image Quality */}
            <Card className="bg-black/40 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Image Quality
                    </CardTitle>
                    <CardDescription>
                        Lower quality uses less bandwidth and loads faster.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        {(['low', 'medium', 'high'] as ImageQuality[]).map((quality) => (
                            <button
                                key={quality}
                                onClick={() => setImageQuality(quality)}
                                className={cn(
                                    "flex-1 py-3 px-4 rounded-xl border transition-all capitalize",
                                    imageQuality === quality
                                        ? "bg-white/10 border-white/20"
                                        : "bg-black/20 border-white/5 hover:border-white/10"
                                )}
                            >
                                <span className="text-white font-medium">{quality}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Detected Hardware Info */}
            <Card className="bg-black/40 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Cpu className="h-5 w-5" />
                            Detected Hardware
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={rerunBenchmark}
                            disabled={isDetecting}
                            className="text-white/60 hover:text-white"
                        >
                            <RefreshCw className={cn("h-4 w-4 mr-2", isDetecting && "animate-spin")} />
                            Re-detect
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-xs text-white/50 mb-1">GPU Tier</p>
                            <p className="text-sm font-medium text-white capitalize">{metrics.gpuTier}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-xs text-white/50 mb-1">Memory</p>
                            <p className="text-sm font-medium text-white">
                                {metrics.deviceMemory ? `${metrics.deviceMemory} GB` : 'Unknown'}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-xs text-white/50 mb-1">CPU Cores</p>
                            <p className="text-sm font-medium text-white">
                                {metrics.cpuCores ?? 'Unknown'}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-xs text-white/50 mb-1">Measured FPS</p>
                            <p className="text-sm font-medium text-white">
                                {metrics.fps ? `${metrics.fps} fps` : 'Not tested'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reset Button */}
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={resetToAuto}
                    className="border-white/10 text-white hover:bg-white/10"
                >
                    Reset to Auto
                </Button>
            </div>
        </div>
    );
}
