import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Image as ImageIcon,
    Video,
    Sparkles,
    Download,
    Share2,
    Wand2,
    History,
    Settings2,
    Maximize2,
    MoreHorizontal,
    Layers,
    Palette,
    Music,
    Mic,
    Zap,
    Command,
    ChevronDown,
    Play,
    Pause,
    Volume2
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ModelPicker } from "@/components/models/ModelPicker";
import { useChatStore } from "@/lib/stores/chat-store";
import { getModelById } from "@/lib/utils/model-utils";

interface MediaAsset {
  _id: string;
  _creationTime: number;
  url: string;
  prompt: string;
  type: "image" | "video" | "audio"; // Update type definition to include audio
  status: "generating" | "completed" | "failed";
  model: string;
  dimensions?: string;
  duration?: string;
}

export default function MediaStudio() {
    const [activeTab, setActiveTab] = useState<"image" | "video" | "audio">("image");
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedAsset, setGeneratedAsset] = useState<string | null>(null);
    const [history, setHistory] = useState<{ type: string, url: string }[]>([]);
    const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
    const { activeModel } = useChatStore();
    const [isPlaying, setIsPlaying] = useState(false);

    // Audio specific state
    const [audioDuration, setAudioDuration] = useState([30]);
    const [audioMood, setAudioMood] = useState("Cinematic");

    const selectedModel = getModelById(activeModel);

    const handleGenerate = () => {
        if (!prompt) return;
        setIsGenerating(true);

        // Simulate generation based on type
        setTimeout(() => {
            setIsGenerating(false);
            let newAsset = "";

            if (activeTab === "image") {
                newAsset = `https://source.unsplash.com/random/1024x1024/?${encodeURIComponent(prompt)},art,${Date.now()}`;
            } else if (activeTab === "video") {
                // Placeholder for video
                newAsset = "https://cdn.coverr.co/videos/coverr-cloudy-sky-2765/1080p.mp4";
            } else {
                // Placeholder for audio
                newAsset = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
            }

            setGeneratedAsset(newAsset);
            setHistory(prev => [{ type: activeTab, url: newAsset }, ...prev]);
            toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} generated successfully!`);
        }, 3000);
    };

    return (
        <div className="h-full flex bg-[#030304] overflow-hidden font-sans text-foreground selection:bg-primary/30">
            {/* Sidebar Controls */}
            <div className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col h-full z-20">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2 text-white tracking-tight">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Creative Studio
                        </h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">AI Asset Suite</p>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[10px] px-2 py-0.5">BETA</Badge>
                </div>

                <ScrollArea className="flex-1 px-5 py-6">
                    <div className="space-y-8">
                        {/* Mode Selection */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Generation Mode</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "image", icon: ImageIcon, label: "Image", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                                    { id: "video", icon: Video, label: "Video", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                                    { id: "audio", icon: Music, label: "Audio", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" }
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => {
                                            setActiveTab(mode.id as any);
                                            setGeneratedAsset(null);
                                        }}
                                        className={`flex flex-col items-center justify-center py-3 rounded-xl text-xs font-medium transition-all duration-300 border ${activeTab === mode.id
                                            ? `${mode.bg} ${mode.border} ${mode.color} shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)]`
                                            : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:text-white"
                                            }`}
                                    >
                                        <mode.icon className={`w-5 h-5 mb-2 ${activeTab === mode.id ? "scale-110" : "opacity-70"} transition-transform`} />
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Model Selection */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Model</label>
                            <Button
                                variant="outline"
                                className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 text-white h-10"
                                onClick={() => setIsModelPickerOpen(true)}
                            >
                                <span className="flex items-center gap-2 truncate">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    {selectedModel?.name || "Select Model"}
                                </span>
                                <ChevronDown className="w-4 h-4 opacity-50" />
                            </Button>
                        </div>

                        {/* Prompt Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Prompt</label>
                                <button className="text-[10px] font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                                    <Wand2 className="w-3 h-3" /> Enhance
                                </button>
                            </div>
                            <div className="relative group">
                                <Textarea
                                    placeholder={
                                        activeTab === "image" ? "Describe your image in detail..." :
                                            activeTab === "video" ? "Describe the motion and scene..." :
                                                "Describe the sound, mood, and instruments..."
                                    }
                                    className="min-h-[140px] resize-none bg-black/40 border-white/10 focus:border-primary/50 text-sm leading-relaxed rounded-xl placeholder:text-muted-foreground/40 p-4 transition-all group-hover:border-white/20"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                                <div className="absolute bottom-3 right-3 flex gap-2">
                                    <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                                        <Mic className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Audio Specific Settings */}
                        {activeTab === "audio" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Settings2 className="w-3 h-3" /> Audio Settings
                                </label>

                                <div className="space-y-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-white/70 font-medium">Duration</span>
                                            <span className="text-white/40 font-mono">{audioDuration}s</span>
                                        </div>
                                        <Slider
                                            value={audioDuration}
                                            onValueChange={setAudioDuration}
                                            max={60}
                                            step={5}
                                            className="py-2"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <span className="text-xs text-white/70 font-medium">Mood</span>
                                        <div className="flex flex-wrap gap-2">
                                            {["Cinematic", "Lo-Fi", "Upbeat", "Dark", "Ambient"].map(mood => (
                                                <button
                                                    key={mood}
                                                    onClick={() => setAudioMood(mood)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${audioMood === mood
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
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Settings2 className="w-3 h-3" /> Configuration
                                </label>

                                <div className="space-y-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-white/70 font-medium">Aspect Ratio</span>
                                            <span className="text-white/40 font-mono">16:9</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {["1:1", "16:9", "9:16"].map(ratio => (
                                                <button key={ratio} className="px-2 py-2 rounded-lg bg-black/20 border border-white/10 text-xs text-white/60 hover:bg-white/5 hover:border-white/20 hover:text-white transition-all">
                                                    {ratio}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-white/70 font-medium">Guidance Scale</span>
                                            <span className="text-white/40 font-mono">7.5</span>
                                        </div>
                                        <Slider defaultValue={[75]} max={100} step={1} className="py-2" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-xl">
                    <Button
                        className="w-full h-12 text-sm font-semibold bg-white text-black hover:bg-white/90 shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt}
                    >
                        {isGenerating ? (
                            <>
                                <Sparkles className="w-4 h-4 mr-2 animate-spin text-primary" /> Generating...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4 mr-2 fill-current" /> Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-[#030304] to-[#030304] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

                {/* Toolbar */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-md">
                            <History className="w-3.5 h-3.5 mr-2" /> History
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-md">
                            <Layers className="w-3.5 h-3.5 mr-2" /> Layers
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" className="h-9 bg-primary hover:bg-primary/90 text-white border-0 rounded-lg shadow-lg shadow-primary/20">
                            <Download className="w-3.5 h-3.5 mr-2" /> Export
                        </Button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 p-8 flex items-center justify-center overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {generatedAsset ? (
                            <motion.div
                                key={generatedAsset}
                                initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="relative max-w-full max-h-full shadow-2xl rounded-xl overflow-hidden group ring-1 ring-white/10"
                            >
                                {activeTab === "image" && (
                                    <img src={generatedAsset} alt="Generated" className="max-w-full max-h-[75vh] object-contain rounded-xl" />
                                )}
                                {activeTab === "video" && (
                                    <video src={generatedAsset} controls autoPlay loop className="max-w-full max-h-[75vh] rounded-xl" />
                                )}
                                {activeTab === "audio" && (
                                    <div className="w-[500px] h-[300px] bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                                        {/* Visualizer Animation */}
                                        <div className="flex items-center gap-1 h-32 mb-8">
                                            {[...Array(20)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-2 bg-primary/50 rounded-full"
                                                    animate={{
                                                        height: isPlaying ? [20, Math.random() * 100 + 20, 20] : 20
                                                    }}
                                                    transition={{
                                                        duration: 0.5,
                                                        repeat: Infinity,
                                                        delay: i * 0.05
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-4 z-10">
                                            <Button
                                                size="icon"
                                                className="w-12 h-12 rounded-full bg-white text-black hover:bg-white/90"
                                                onClick={() => setIsPlaying(!isPlaying)}
                                            >
                                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                                            </Button>
                                            <div className="text-center">
                                                <h3 className="text-white font-medium">Generated Track</h3>
                                                <p className="text-xs text-white/50">{audioMood} • {audioDuration}s</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-8 gap-3 backdrop-blur-[2px]">
                                    <Button variant="secondary" size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md">
                                        <Download className="w-4 h-4 mr-2" /> Save Asset
                                    </Button>
                                    <Button variant="secondary" size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md">
                                        <Share2 className="w-4 h-4 mr-2" /> Share
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-8 max-w-lg relative z-10"
                            >
                                <div className="relative w-32 h-32 mx-auto">
                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center backdrop-blur-sm shadow-2xl">
                                        {activeTab === "image" && <Palette className="w-12 h-12 text-white/30" />}
                                        {activeTab === "video" && <Video className="w-12 h-12 text-white/30" />}
                                        {activeTab === "audio" && <Music className="w-12 h-12 text-white/30" />}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Start Creating</h2>
                                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                                        Unleash your creativity with our advanced AI models. Select a mode, describe your vision, and watch it come to life.
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 pt-4">
                                    {["Cyberpunk City", "Abstract Oil Painting", "Cinematic Portrait", "Lo-Fi Beats", "Drone Footage"].map((suggestion, i) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setPrompt(suggestion)}
                                            className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all hover:-translate-y-0.5"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Filmstrip (History) */}
                {history.length > 0 && (
                    <div className="h-28 border-t border-white/5 bg-black/40 backdrop-blur-xl p-4 flex items-center gap-4 overflow-x-auto z-20">
                        {history.map((item, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => {
                                    setGeneratedAsset(item.url);
                                    setActiveTab(item.type as any);
                                }}
                                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 group ${generatedAsset === item.url ? "border-primary shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)] scale-105" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"}`}
                            >
                                {item.type === "image" && <img src={item.url} alt="" className="w-full h-full object-cover" />}
                                {item.type === "video" && <video src={item.url} className="w-full h-full object-cover" />}
                                {item.type === "audio" && (
                                    <div className="w-full h-full bg-orange-500/20 flex items-center justify-center">
                                        <Music className="w-8 h-8 text-orange-500" />
                                    </div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>

            <ModelPicker
                open={isModelPickerOpen}
                onOpenChange={setIsModelPickerOpen}
                type={activeTab}
            />
        </div>
    );
}