import { useState } from "react";
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
    Command
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function MediaStudio() {
    const [activeTab, setActiveTab] = useState<"image" | "video" | "audio">("image");
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);

    const handleGenerate = () => {
        if (!prompt) return;
        setIsGenerating(true);
        // Simulate generation
        setTimeout(() => {
            setIsGenerating(false);
            const newImage = `https://source.unsplash.com/random/1024x1024/?${encodeURIComponent(prompt)},art,${Date.now()}`;
            setGeneratedImage(newImage);
            setHistory(prev => [newImage, ...prev]);
            toast.success("Generation complete!");
        }, 3000);
    };

    return (
        <div className="h-full flex bg-[#050505] overflow-hidden font-sans text-foreground selection:bg-purple-500/30">
            {/* Sidebar Controls */}
            <div className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col h-full z-20">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2 text-white tracking-tight">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            Creative Studio
                        </h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">AI Asset Suite</p>
                    </div>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/5 text-[10px] px-2 py-0.5">BETA</Badge>
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
                                        onClick={() => setActiveTab(mode.id as any)}
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

                        {/* Prompt Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Prompt</label>
                                <button className="text-[10px] font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">
                                    <Wand2 className="w-3 h-3" /> Enhance
                                </button>
                            </div>
                            <div className="relative group">
                                <Textarea
                                    placeholder={activeTab === "image" ? "Describe your image in detail..." : activeTab === "video" ? "Describe the motion and scene..." : "Describe the sound or music..."}
                                    className="min-h-[140px] resize-none bg-black/40 border-white/10 focus:border-purple-500/50 text-sm leading-relaxed rounded-xl placeholder:text-muted-foreground/40 p-4 transition-all group-hover:border-white/20"
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

                        {/* Settings */}
                        <div className="space-y-6">
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

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-xs text-white/70 font-medium">Negative Prompt</span>
                                    <Switch className="scale-75" />
                                </div>
                            </div>
                        </div>
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
                                <Sparkles className="w-4 h-4 mr-2 animate-spin text-purple-600" /> Generating...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4 mr-2 fill-current" /> Generate Asset
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050505] to-[#050505] pointer-events-none" />
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
                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5 mr-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/5 rounded-md">
                                <Maximize2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/5 rounded-md">
                                <Command className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                        <Button size="sm" className="h-9 bg-purple-600 hover:bg-purple-500 text-white border-0 rounded-lg shadow-lg shadow-purple-900/20">
                            <Download className="w-3.5 h-3.5 mr-2" /> Export
                        </Button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 p-8 flex items-center justify-center overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {generatedImage ? (
                            <motion.div
                                key={generatedImage}
                                initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="relative max-w-full max-h-full shadow-2xl rounded-xl overflow-hidden group ring-1 ring-white/10"
                            >
                                <img src={generatedImage} alt="Generated" className="max-w-full max-h-[75vh] object-contain rounded-xl" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-8 gap-3 backdrop-blur-[2px]">
                                    <Button variant="secondary" size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md">
                                        <Download className="w-4 h-4 mr-2" /> Save Asset
                                    </Button>
                                    <Button variant="secondary" size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md">
                                        <Share2 className="w-4 h-4 mr-2" /> Share
                                    </Button>
                                    <Button variant="secondary" size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md">
                                        <MoreHorizontal className="w-4 h-4" />
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
                                    <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full animate-pulse" />
                                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center backdrop-blur-sm shadow-2xl">
                                        <Palette className="w-12 h-12 text-white/30" />
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
                        {history.map((img, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => setGeneratedImage(img)}
                                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 group ${generatedImage === img ? "border-purple-500 shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)] scale-105" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"}`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
