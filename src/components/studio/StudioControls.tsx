import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Settings2,
  Mic,
  Zap,
  ChevronDown,
  Maximize2,
  Ratio,
  Type,
  Video,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioControlsProps {
  activeTab: "image" | "video";
  setActiveTab: (tab: "image" | "video") => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  handleGenerate: () => void;
  isModelPickerOpen: boolean;
  setIsModelPickerOpen: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedModel: any;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  setGeneratedAsset: (asset: string | null) => void;
  imageRef: File | null;
  setImageRef: (file: File | null) => void;
  refStrength: number;
  setRefStrength: (strength: number) => void;
  videoDuration: number;
  setVideoDuration: (duration: number) => void;
  videoWithAudio: boolean;
  setVideoWithAudio: (enabled: boolean) => void;
  estimatedCost?: number;
  className?: string;
}

export function StudioControls({
  activeTab,
  setActiveTab,
  prompt,
  setPrompt,
  isGenerating,
  handleGenerate,
  setIsModelPickerOpen,
  selectedModel,
  aspectRatio,
  setAspectRatio,
  imageRef,
  setImageRef,
  refStrength,
  setRefStrength,
  videoDuration,
  setVideoDuration,
  videoWithAudio,
  setVideoWithAudio,
  estimatedCost,
  className,
}: StudioControlsProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageRef(file);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-black/40 backdrop-blur-3xl border-r border-white/5",
        className,
      )}
    >
      {/* Header */}
      <div className="p-8 pb-6 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-blue-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">
                Studio
              </h1>
              <p className="text-[11px] text-blue-400/60 font-semibold mt-1.5 uppercase tracking-widest">
                Creative Engine
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] px-2.5 h-5.5 font-bold tracking-wider"
          >
            PRO
          </Badge>
        </div>

        {/* Mode Toggles - Modernized */}
        <div className="flex p-1 bg-white/[0.03] rounded-2xl border border-white/5 shadow-inner">
          <button
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300",
              activeTab === "image"
                ? "bg-white/10 text-white shadow-lg border border-white/10"
                : "text-white/40 hover:text-white/70",
            )}
            onClick={() => setActiveTab("image")}
          >
            <ImageIcon className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wide">Image</span>
          </button>
          <button
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300",
              activeTab === "video"
                ? "bg-white/10 text-white shadow-lg border border-white/10"
                : "text-white/40 hover:text-white/70",
            )}
            onClick={() => setActiveTab("video")}
          >
            <Video className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Video</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-2 custom-scrollbar space-y-10">
        {/* Model Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-500/50" /> Intelligence
            </label>
          </div>
          <Button
            variant="outline"
            className="w-full justify-between bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white h-14 rounded-2xl group transition-all duration-500 px-5 shadow-sm"
            onClick={() => setIsModelPickerOpen(true)}
          >
            <span className="flex items-center gap-3.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-600 flex items-center justify-center text-[11px] font-black text-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                AI
              </div>
              <span className="font-bold text-sm tracking-tight group-hover:text-blue-300 transition-colors duration-300">
                {selectedModel?.name || "Select Creative Model"}
              </span>
            </span>
            <ChevronDown className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all duration-300" />
          </Button>
        </div>

        {/* Image Reference - NEW & MODERN */}
        {activeTab === "image" && (
          <div className="space-y-4">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
            <Layers className="w-3 h-3 text-blue-500/50" /> Reference
          </label>
          <div className="relative group/ref">
            {imageRef ? (
              <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl bg-black/40 p-2 group">
                <img
                  src={URL.createObjectURL(imageRef)}
                  alt="Reference"
                  className="w-full h-32 object-cover rounded-xl brightness-75 group-hover:brightness-90 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <button
                  onClick={() => setImageRef(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white shadow-lg transition-all transform scale-90 hover:scale-105"
                >
                  <Zap className="w-3.5 h-3.5 rotate-180" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-bold text-white/70">
                  <span className="flex items-center gap-1.5 backdrop-blur-md bg-black/40 px-2 py-1 rounded-md border border-white/10 uppercase tracking-wider">
                    <Maximize2 className="w-3 h-3" /> {Math.round(imageRef.size / 1024)} KB
                  </span>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="w-full h-32 rounded-2xl border-2 border-dashed border-white/5 hover:border-blue-500/40 bg-white/[0.02] hover:bg-blue-500/[0.05] transition-all duration-500 flex flex-col items-center justify-center gap-3 group/box relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover/box:opacity-100 transition-opacity duration-1000 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/[0.03] via-transparent to-transparent" />
                  <div className="p-3 rounded-full bg-white/5 border border-white/5 group-hover/box:bg-blue-500/10 group-hover/box:border-blue-500/20 group-hover/box:scale-110 transition-all duration-500">
                    <ImageIcon className="w-5 h-5 text-white/20 group-hover/box:text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-white/40 group-hover/box:text-white/60 transition-colors uppercase tracking-widest">Add Reference</p>
                    <p className="text-[10px] text-white/20 font-medium mt-1">Enhance generation with images</p>
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          {imageRef && (
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  Strength
                </label>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {Math.round(refStrength * 100)}%
                </span>
              </div>
              <Slider
                value={[refStrength * 100]}
                onValueChange={(v) => setRefStrength(v[0] / 100)}
                max={100}
                step={1}
                className="py-1"
              />
            </div>
          )}
          </div>
        )}

        {/* Prompt Input - Modernized */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
              <Type className="w-3 h-3 text-orange-500/50" /> Creative Prompt
            </label>
            <button className="text-[10px] font-bold text-white/60 hover:text-white flex items-center gap-1.5 transition-all bg-white/[0.05] hover:bg-white/[0.1] px-3 py-1.5 rounded-xl border border-white/5 hover:border-white/10 shadow-sm group">
              <Wand2 className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
              <span>Magic Refine</span>
            </button>
          </div>
          <div className="relative group/prompt">
            <Textarea
              placeholder={
                activeTab === "video"
                  ? "A cinematic drone shot flying through neon cyberpunk streets at night..."
                  : "A cosmic masterpiece of a cyberpunk city floating in a nebula..."
              }
              className="min-h-[160px] resize-none bg-white/[0.02] border border-white/10 focus:border-blue-500/40 focus:ring-0 text-sm leading-relaxed rounded-2xl placeholder:text-white/10 p-5 transition-all duration-500 shadow-xl group-hover/prompt:border-white/20 group-hover/prompt:bg-white/[0.04]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/20 hover:text-white transition-all transform hover:scale-105 border border-transparent hover:border-white/10">
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings - Reorganized */}
        <div className="space-y-5 pt-2">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
            <Settings2 className="w-3 h-3 text-emerald-500/50" /> Specifications
          </label>

          <div className="grid grid-cols-1 gap-4">
            {/* Aspect Ratio */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 hover:bg-white/[0.04] transition-colors duration-500 border-l-2 border-l-blue-500/20">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Ratio className="w-3.5 h-3.5" /> Dimensions
                </span>
                <span className="text-[10px] font-mono text-white/20">{aspectRatio}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["1:1", "16:9", "9:16"].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={cn(
                      "px-2 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-500 border uppercase",
                      aspectRatio === ratio
                        ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-[1.05] z-10"
                        : "bg-black/20 border-white/5 text-white/40 hover:text-white hover:border-white/20"
                    )}
                  >
                    {ratio === "1:1" ? "Square" : ratio === "16:9" ? "Wide" : "Tall"}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "video" && (
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 hover:bg-white/[0.04] transition-colors duration-500 border-l-2 border-l-blue-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Duration
                  </span>
                  <span className="text-[10px] font-mono text-blue-300/80">
                    {videoDuration}s
                  </span>
                </div>
                <Slider
                  value={[videoDuration]}
                  onValueChange={(v) => setVideoDuration(v[0])}
                  min={2}
                  max={10}
                  step={1}
                  className="py-1"
                />
                <button
                  onClick={() => setVideoWithAudio(!videoWithAudio)}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                    videoWithAudio
                      ? "bg-blue-500/15 border-blue-400/30 text-blue-200"
                      : "bg-black/20 border-white/10 text-white/50 hover:text-white/80",
                  )}
                >
                  {videoWithAudio ? "Audio Enabled" : "Audio Disabled"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Action - PREMIUM BUTTON */}
      <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-3xl shrink-0 group">
        <Button
          className={cn(
            "w-full h-14 text-[13px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-500 relative overflow-hidden shadow-2xl group",
            isGenerating
              ? "bg-white/[0.05] text-white/30 cursor-not-allowed border border-white/5"
              : "bg-white text-black hover:scale-[1.02] active:scale-[0.98] border border-white"
          )}
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Forging Masterpiece</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 relative z-10">
              <Zap className="w-4 h-4 fill-black" />
              <span>{activeTab === "video" ? "Forge Video" : "Forge Vision"}</span>
            </div>
          )}
          {!isGenerating && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-400 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity duration-1000" />
          )}
        </Button>
        {typeof estimatedCost === "number" && (
          <p className="mt-3 text-center text-[10px] font-semibold tracking-wider uppercase text-white/45">
            Estimated Cost: {estimatedCost.toFixed(2)} Credits
          </p>
        )}
        <div className="mt-5 flex items-center justify-center gap-2 opacity-30 select-none">
          <div className="h-px w-8 bg-white/20" />
          <p className="text-[9px] text-white font-black uppercase tracking-[0.3em] whitespace-nowrap">
            Cryonex Studio v2.0
          </p>
          <div className="h-px w-8 bg-white/20" />
        </div>
      </div>
    </div>
  );
}
