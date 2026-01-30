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
    Type
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioControlsProps {
    activeTab: "image";
    setActiveTab: (tab: "image") => void;
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
    className?: string;
}

export function StudioControls({
    prompt,
    setPrompt,
    isGenerating,
    handleGenerate,
    setIsModelPickerOpen,
    selectedModel,
    aspectRatio,
    setAspectRatio,
    className
}: StudioControlsProps) {
    return (
        <div className={cn("flex flex-col h-full bg-black/20 backdrop-blur-2xl border-r border-white/5", className)}>
            {/* Header */}
            <div className="p-6 pb-4 shrink-0">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight leading-none">Studio</h1>
                            <p className="text-[11px] text-muted-foreground font-medium mt-1">AI Image Generation</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] px-2 h-5">BETA</Badge>
                </div>

                {/* Mode Header - Image Only */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Image Generation</span>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-2 custom-scrollbar space-y-8">
                {/* Model Selection */}
                <div className="space-y-3">
                    <label className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Model
                    </label>
                    <Button
                        variant="outline"
                        className="w-full justify-between bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white h-12 rounded-xl group transition-all"
                        onClick={() => setIsModelPickerOpen(true)}
                    >
                        <span className="flex items-center gap-2.5 truncate">
                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                                AI
                            </div>
                            <span className="group-hover:text-purple-300 transition-colors">
                                {selectedModel?.name || "Select Model"}
                            </span>
                        </span>
                        <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </div>

                {/* Prompt Input */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-2">
                            <Type className="w-3 h-3" /> Prompt
                        </label>
                        <button className="text-[10px] font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20 hover:bg-purple-500/20">
                            <Wand2 className="w-3 h-3" /> Enhance
                        </button>
                    </div>
                    <div className="relative group">
                        <Textarea
                            placeholder="A futuristic city with neon lights..."
                            className="min-h-[140px] resize-none bg-black/40 border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 text-sm leading-relaxed rounded-xl placeholder:text-muted-foreground/30 p-4 transition-all group-hover:border-white/20"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                        <button className="absolute bottom-3 right-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                            <Mic className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                    <label className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-2">
                        <Settings2 className="w-3 h-3" /> Settings
                    </label>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-5">
                        {/* Aspect Ratio */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-white/60 flex items-center gap-1.5">
                                    <Ratio className="w-3.5 h-3.5" /> Aspect Ratio
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {["1:1", "16:9", "9:16"].map(ratio => (
                                    <button
                                        key={ratio}
                                        onClick={() => setAspectRatio(ratio)}
                                        className={cn(
                                            "px-2 py-2.5 rounded-lg text-xs font-medium transition-all border",
                                            aspectRatio === ratio
                                                ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                                                : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:text-white"
                                        )}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Guidance Scale */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-white/60 flex items-center gap-1.5">
                                    <Maximize2 className="w-3.5 h-3.5" /> Guidance
                                </span>
                                <span className="text-white/40 font-mono text-[10px]">7.5</span>
                            </div>
                            <Slider defaultValue={[75]} max={100} step={1} className="py-2" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-white/5 bg-black/20 backdrop-blur-xl shrink-0">
                <Button
                    className={cn(
                        "w-full h-12 text-sm font-semibold rounded-xl transition-all duration-300",
                        isGenerating
                            ? "bg-white/5 text-white/50 cursor-not-allowed"
                            : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
                    )}
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                >
                    {isGenerating ? (
                        <>
                            <Sparkles className="w-4 h-4 mr-2 animate-spin" /> Creating Magic...
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4 mr-2 fill-current" /> Generate Image
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}