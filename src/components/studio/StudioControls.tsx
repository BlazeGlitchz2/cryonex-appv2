import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
    Image as ImageIcon,
    Video,
    Sparkles,
    Wand2,
    Settings2,
    Music,
    Mic,
    Zap,
    ChevronDown,
    Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioControlsProps {
    activeTab: "image" | "video" | "audio";
    setActiveTab: (tab: "image" | "video" | "audio") => void;
    prompt: string;
    setPrompt: (prompt: string) => void;
    isGenerating: boolean;
    handleGenerate: () => void;
    isModelPickerOpen: boolean;
    setIsModelPickerOpen: (open: boolean) => void;
    selectedModel: any;
    audioDuration?: number[];
    setAudioDuration?: (val: number[]) => void;
    audioMood?: string;
    setAudioMood?: (mood: string) => void;
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
    setGeneratedAsset: (asset: string | null) => void;
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
    audioDuration,
    setAudioDuration,
    audioMood,
    setAudioMood,
    aspectRatio,
    setAspectRatio,
    setGeneratedAsset,
    className
}: StudioControlsProps) {
    return (
        <div className={cn("flex flex-col h-full bg-background/95 backdrop-blur-xl", className)}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 z-10 bg-inherit">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white tracking-tight">
                        <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        Creative Studio
                    </h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1 font-medium">AI Asset Suite</p>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[10px] px-2 py-0.5">BETA</Badge>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar overscroll-contain">
                <div className="space-y-8 pb-10">
                    {/* Mode Selection */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Generation Mode</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: "image", icon: ImageIcon, label: "Image", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                                { id: "video", icon: Video, label: "Video", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", locked: true },
                                { id: "audio", icon: Music, label: "Audio", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    disabled={mode.locked}
                                    onClick={() => {
                                        if (mode.locked) return;
                                        setActiveTab(mode.id as any);
                                        setGeneratedAsset(null);
                                    }}
                                    className={`relative flex flex-col items-center justify-center py-4 md:py-5 rounded-xl text-sm font-medium transition-all duration-300 border touch-manipulation ${activeTab === mode.id
                                        ? `${mode.bg} ${mode.border} ${mode.color} shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)]`
                                        : mode.locked
                                            ? "bg-white/5 border-transparent text-muted-foreground/40 cursor-not-allowed"
                                            : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    {mode.locked && (
                                        <div className="absolute top-2 right-2">
                                            <Lock className="w-3 h-3 text-white/20" />
                                        </div>
                                    )}
                                    <mode.icon className={`w-6 h-6 mb-2 ${activeTab === mode.id ? "scale-110" : "opacity-70"} transition-transform`} />
                                    {mode.label}
                                    {mode.locked && (
                                        <span className="text-[10px] text-primary mt-1 font-bold">Coming Soon</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Model</label>
                        <Button
                            variant="outline"
                            className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 text-white h-12 md:h-14 text-base"
                            onClick={() => setIsModelPickerOpen(true)}
                        >
                            <span className="flex items-center gap-2 truncate">
                                <Sparkles className="w-5 h-5 text-primary" />
                                {selectedModel?.name || "Select Model"}
                            </span>
                            <ChevronDown className="w-5 h-5 opacity-50" />
                        </Button>
                        <p className="text-[10px] text-muted-foreground/60 px-1 mt-2">
                            * Pollinations.ai models are free and do not require an API key.
                        </p>
                    </div>

                    {/* Prompt Input */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Prompt</label>
                            <button className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 touch-manipulation">
                                <Wand2 className="w-3.5 h-3.5" /> Enhance
                            </button>
                        </div>
                        <div className="relative group">
                            <Textarea
                                placeholder={
                                    activeTab === "image" ? "Describe your image in detail..." :
                                        activeTab === "video" ? "Describe the motion and scene..." :
                                            "Describe the sound, mood, and instruments..."
                                }
                                className="min-h-[160px] resize-none bg-black/40 border-white/10 focus:border-primary/50 text-base leading-relaxed rounded-xl placeholder:text-muted-foreground/40 p-5 transition-all group-hover:border-white/20"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors touch-manipulation">
                                    <Mic className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Audio Specific Settings */}
                    {activeTab === "audio" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Settings2 className="w-4 h-4" /> Audio Settings
                            </label>

                            <div className="space-y-6 p-5 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/70 font-medium">Duration</span>
                                        <span className="text-white/40 font-mono">{audioDuration}s</span>
                                    </div>
                                    <Slider
                                        value={audioDuration}
                                        onValueChange={(val) => setAudioDuration?.(val)}
                                        max={60}
                                        step={5}
                                        className="py-4"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <span className="text-sm text-white/70 font-medium">Mood</span>
                                    <div className="flex flex-wrap gap-3">
                                        {["Cinematic", "Lo-Fi", "Upbeat", "Dark", "Ambient", "Phonk", "Rap", "Underground Rap"].map(mood => (
                                            <button
                                                key={mood}
                                                onClick={() => setAudioMood?.(mood)}
                                                className={`px-4 py-2 rounded-lg text-sm transition-all touch-manipulation ${audioMood === mood
                                                    ? "bg-primary text-white"
                                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                                    }`}
                                            >
                                                {mood}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image/Video Settings */}
                    {activeTab !== "audio" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Settings2 className="w-4 h-4" /> Configuration
                            </label>

                            <div className="space-y-6 p-5 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/70 font-medium">Aspect Ratio</span>
                                        <span className="text-white/40 font-mono">{aspectRatio}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {["1:1", "16:9", "9:16"].map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => setAspectRatio(ratio)}
                                                className={`px-3 py-3 rounded-lg border text-sm transition-all touch-manipulation ${aspectRatio === ratio
                                                    ? "bg-primary/20 border-primary text-white"
                                                    : "bg-black/20 border-white/10 text-white/60 hover:bg-white/5 hover:border-white/20 hover:text-white"
                                                    }`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/70 font-medium">Guidance Scale</span>
                                        <span className="text-white/40 font-mono">7.5</span>
                                    </div>
                                    <Slider defaultValue={[75]} max={100} step={1} className="py-4" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-xl shrink-0 z-10 bg-inherit">
                <Button
                    className="w-full h-14 text-base font-semibold bg-white text-black hover:bg-white/90 shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl touch-manipulation"
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                >
                    {isGenerating ? (
                        <>
                            <Sparkles className="w-5 h-5 mr-2 animate-spin text-primary" /> Generating...
                        </>
                    ) : (
                        <>
                            <Zap className="w-5 h-5 mr-2 fill-current" /> Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}