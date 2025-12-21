import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Download,
    Share2,
    Palette,
    Video,
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
    isPlaying,
    setIsPlaying,
    setPrompt
}: StudioCanvasProps) {
    return (
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-hidden relative">
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

                        <div className="flex justify-center gap-3 mt-4 md:absolute md:inset-0 md:bg-gradient-to-t md:from-black/80 md:via-transparent md:to-transparent md:opacity-0 md:group-hover:opacity-100 md:transition-all md:duration-300 md:items-end md:pb-8 backdrop-blur-[2px] pointer-events-none">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md pointer-events-auto"
                                onClick={() => {
                                    if (!generatedAsset) return;
                                    window.open(generatedAsset, '_blank');
                                    toast.success("Opening asset...");
                                }}
                            >
                                <Download className="w-4 h-4 mr-2" /> Download
                            </Button>
                            <Button variant="secondary" size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md pointer-events-auto">
                                <Share2 className="w-4 h-4 mr-2" /> Share
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-8 max-w-lg relative z-10 px-4"
                    >
                        <div className="relative w-32 h-32 mx-auto">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                            <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center backdrop-blur-sm shadow-2xl">
                                {activeTab === "image" && <Palette className="w-12 h-12 text-white/30" />}
                                {activeTab === "video" && <Video className="w-12 h-12 text-white/30" />}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Start Creating</h2>
                            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                                Unleash your creativity with our advanced AI models. Select a mode, describe your vision, and watch it come to life.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 pt-4">
                            {["Cyberpunk City", "Abstract Oil Painting", "Cinematic Portrait", "Drone Footage"].map((suggestion, i) => (
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
    );
}
