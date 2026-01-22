import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Download,
    Share2,
    Palette,
    Video,
    Sparkles,
    Maximize2,
    MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";

interface StudioCanvasProps {
    activeTab: "image" | "video";
    generatedAsset: string | null;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    setPrompt: (prompt: string) => void;
}

export function StudioCanvas({
    activeTab,
    generatedAsset,
    setPrompt
}: StudioCanvasProps) {
    return (
        <div className="flex-1 flex items-center justify-center overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none" />

            <AnimatePresence mode="wait">
                {generatedAsset ? (
                    <motion.div
                        key={generatedAsset}
                        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="relative max-w-[90%] max-h-[85%] group"
                    >
                        {/* Asset Container */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black/50 backdrop-blur-sm">
                            {activeTab === "image" && (
                                <img src={generatedAsset} alt="Generated" className="max-w-full max-h-[80vh] object-contain" />
                            )}
                            {activeTab === "video" && (
                                <video src={generatedAsset} controls autoPlay loop className="max-w-full max-h-[80vh]" />
                            )}

                            {/* Overlay Actions */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md">
                                    <Maximize2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 flex items-center justify-center gap-3">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md px-6 h-10 font-medium"
                                    onClick={() => {
                                        if (!generatedAsset) return;
                                        window.open(generatedAsset, '_blank');
                                        toast.success("Opening asset...");
                                    }}
                                >
                                    <Download className="w-4 h-4 mr-2" /> Download
                                </Button>
                                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md">
                                    <Share2 className="w-4 h-4" />
                                </Button>
                                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-8 max-w-lg relative z-10 px-4"
                    >
                        <div className="relative w-40 h-40 mx-auto group cursor-default">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-[60px] rounded-full animate-pulse" />
                            <div className="relative w-full h-full rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-white/[0.01] border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
                                {activeTab === "image" && <Palette className="w-16 h-16 text-white/20 group-hover:text-purple-400/50 transition-colors duration-500" />}
                                {activeTab === "video" && <Video className="w-16 h-16 text-white/20 group-hover:text-blue-400/50 transition-colors duration-500" />}

                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-md animate-bounce duration-[3000ms]">
                                    <Sparkles className="w-4 h-4 text-yellow-200" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Create</span> Something New
                            </h2>
                            <p className="text-muted-foreground/80 text-base leading-relaxed max-w-sm mx-auto font-light">
                                Select a mode, describe your vision, and watch as AI brings your imagination to life in seconds.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2.5 pt-6">
                            {["Cyberpunk City", "Abstract Oil Painting", "Cinematic Portrait", "Drone Footage"].map((suggestion, i) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setPrompt(suggestion)}
                                    className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10"
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
    );
}
