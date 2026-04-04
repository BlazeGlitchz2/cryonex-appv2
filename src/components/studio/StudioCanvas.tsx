import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Share2,
  Palette,
  Video,
  Sparkles,
  Maximize2,
  MoreHorizontal,
  Wand2,
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
  setPrompt,
}: StudioCanvasProps) {
  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden relative p-8 md:p-12">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full animate-pulse duration-5000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {generatedAsset ? (
          <motion.div
            key={generatedAsset}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-full max-h-full group flex items-center justify-center"
          >
            {/* Outer Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-blue-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            {/* Asset Container */}
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] ring-1 ring-white/10 bg-black/40 backdrop-blur-md transition-transform duration-700 group-hover:scale-[1.01]">
              {activeTab === "image" && (
                <img
                  src={generatedAsset}
                  alt="Generated Masterpiece"
                  className="max-w-full max-h-[75vh] object-contain block select-none"
                />
              )}
              {activeTab === "video" && (
                <video
                  src={generatedAsset}
                  controls
                  autoPlay
                  loop
                  className="max-w-full max-h-[75vh] select-none"
                />
              )}

              {/* Top Floating Actions */}
              <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-11 w-11 rounded-2xl bg-black/60 hover:bg-black/90 text-white border border-white/10 backdrop-blur-xl transition-all hover:scale-105 active:scale-95"
                  onClick={() => window.open(generatedAsset, "_blank")}
                >
                  <Maximize2 className="w-5 h-5 shadow-sm" />
                </Button>
              </div>

              {/* Bottom Controller Bar - SLEEK GLASS */}
              <div className="absolute bottom-8 inset-x-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <div className="flex items-center gap-3 p-2 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-white hover:bg-white/10 px-6 h-10 font-bold uppercase tracking-[0.1em] text-[10px] transition-all"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedAsset;
                      link.download = `cryonex-${Date.now()}.${activeTab === "video" ? "mp4" : "png"}`;
                      link.click();
                      toast.success("Initiating download...");
                    }}
                  >
                    <Download className="w-3.5 h-3.5 mr-2" /> Download
                  </Button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedAsset);
                      toast.success("Link copied to clipboard");
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/10">
                  <Badge className="bg-blue-500 text-white border-none text-[9px] font-black tracking-widest uppercase py-1 px-3 rounded-lg">
                    {activeTab === "video" ? "Video Render" : "4K Render"}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-12 max-w-xl relative z-10 px-6"
          >
            <div className="relative w-48 h-48 mx-auto group perspective-1000">
              <div className="absolute inset-x-0 -bottom-12 h-24 bg-blue-500/20 blur-[60px] rounded-full animate-pulse opacity-50" />

              <motion.div
                animate={{
                  rotateY: [0, 15, 0, -15, 0],
                  rotateX: [0, -10, 0, 10, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="relative w-full h-full rounded-[3rem] bg-gradient-to-br from-white/[0.12] via-white/[0.04] to-transparent border border-white/20 flex items-center justify-center backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all duration-700 group-hover:scale-110 group-hover:border-blue-500/40"
              >
                {activeTab === "image" && (
                  <Palette className="w-20 h-20 text-white/10 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-700" />
                )}
                {activeTab === "video" && (
                  <Video className="w-20 h-20 text-white/10 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-700" />
                )}

                {/* Floating Particles/Icons */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/20 flex items-center justify-center shadow-2xl animate-bounce duration-[4000ms]">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-6 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl animate-pulse">
                  <Wand2 className="w-4 h-4 text-blue-300" />
                </div>
              </motion.div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-400 to-indigo-400">
                  Transcend
                </span>{" "}
                Imagination
              </h2>
              <p className="text-white/40 text-lg leading-relaxed max-w-md mx-auto font-medium tracking-tight">
                Unlock the power of neural engines. Describe a vision, and watch as our models forge it into reality.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {[
                "Ancient Cyber-ruins",
                "Hyper-realistic Astronaut",
                "Bio-luminescent Forest",
                "Abstract Glass Sculpture",
              ].map((suggestion, i) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="px-6 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] font-black uppercase tracking-[0.15em] text-white/30 hover:bg-white/[0.08] hover:text-white hover:border-blue-500/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(168,85,247,0.15)] shadow-sm"
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
