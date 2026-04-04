import {
  usePerformanceStore,
  type ImageQuality,
} from "@/lib/stores/performance-store";
import { usePerformance, type PerformanceTier } from "@/hooks/use-performance";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tierConfig: Record<
  PerformanceTier | "auto",
  { label: string; description: string; icon: LucideIcon; color: string }
> = {
  auto: {
    label: "Auto",
    description: "Automatically detect",
    icon: Gauge,
    color: "text-blue-400",
  },
  full: {
    label: "Full",
    description: "Maximum quality",
    icon: Sparkles,
    color: "text-blue-400",
  },
  lite: {
    label: "Focus",
    description: "Deep work mode",
    icon: Monitor,
    color: "text-cyan-400",
  },
};

export function PerformanceSettings() {
  const {
    tier: detectedTier,
    metrics,
    isDetecting,
    rerunBenchmark,
  } = usePerformance();
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
      <Card className="bg-card/80 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Performance Mode
          </CardTitle>
          <CardDescription>
            Choose a quality preset or let Cryonex auto-detect the best setting
            for your device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {(["auto", "full", "lite"] as const).map((tier) => {
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
                      ? "bg-primary/10 border-primary/25 shadow-lg"
                      : "bg-background/50 border-border/60 hover:border-border hover:bg-accent/50",
                  )}
                >
                  <Icon className={cn("h-6 w-6 mb-2", config.color)} />
                  <div className="font-medium text-foreground">{config.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {config.description}
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400" />
                  )}
                </button>
              );
            })}
          </div>

          {qualityTier === "auto" && detectedTier && (
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300">
                <span className="font-medium">Auto-detected:</span>{" "}
                {tierConfig[detectedTier].label} mode
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Toggles */}
      <Card className="bg-card/80 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
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
              <Sparkles className="h-5 w-5 text-blue-400" />
              <div>
                <Label className="text-foreground">Shader Effects</Label>
                <p className="text-xs text-muted-foreground">
                  WebGL background animations
                </p>
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
                <Label className="text-foreground">Particle Effects</Label>
                <p className="text-xs text-muted-foreground">
                  Sparkles and floating particles
                </p>
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
                <Label className="text-foreground">3D Elements</Label>
                <p className="text-xs text-muted-foreground">
                  Spline scenes and 3D models
                </p>
              </div>
            </div>
            <Switch
              checked={!disable3D}
              onCheckedChange={(checked) => setDisable3D(!checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {reducedMotion ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-green-400" />
              )}
              <div>
                <Label className="text-foreground">Reduce Motion</Label>
                <p className="text-xs text-muted-foreground">
                  Minimize animations system-wide
                </p>
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
      <Card className="bg-card/80 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Image Quality
          </CardTitle>
          <CardDescription>
            Lower quality uses less bandwidth and loads faster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {(["low", "medium", "high"] as ImageQuality[]).map((quality) => (
              <button
                key={quality}
                onClick={() => setImageQuality(quality)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl border transition-all capitalize",
                  imageQuality === quality
                    ? "bg-primary/10 border-primary/25"
                    : "bg-background/50 border-border/60 hover:border-border",
                )}
              >
                <span className="text-foreground font-medium">{quality}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detected Hardware Info */}
      <Card className="bg-card/80 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Detected Hardware
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={rerunBenchmark}
              disabled={isDetecting}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isDetecting && "animate-spin")}
              />
              Re-detect
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-background/55">
              <p className="text-xs text-muted-foreground mb-1">GPU Tier</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {metrics.gpuTier}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background/55">
              <p className="text-xs text-muted-foreground mb-1">Memory</p>
              <p className="text-sm font-medium text-foreground">
                {metrics.deviceMemory
                  ? `${metrics.deviceMemory} GB`
                  : "Unknown"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background/55">
              <p className="text-xs text-muted-foreground mb-1">CPU Cores</p>
              <p className="text-sm font-medium text-foreground">
                {metrics.cpuCores ?? "Unknown"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background/55">
              <p className="text-xs text-muted-foreground mb-1">Measured FPS</p>
              <p className="text-sm font-medium text-foreground">
                {metrics.fps ? `${metrics.fps} fps` : "Not tested"}
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
          className="border-border text-foreground hover:bg-accent"
        >
          Reset to Auto
        </Button>
      </div>
    </div>
  );
}
