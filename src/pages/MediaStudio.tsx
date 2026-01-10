import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Download,
    History,
    Layers,
    Settings2,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { ModelPicker } from "@/components/models/ModelPicker";
import { useChatStore } from "@/lib/stores/chat-store";
import { getModelById } from "@/lib/utils/model-utils";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StudioControls } from "@/components/studio/StudioControls";
import { StudioCanvas } from "@/components/studio/StudioCanvas";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useThemeStore } from "@/lib/stores/theme-store";
import { IconImage, IconVideo, IconAudio, IconWand, IconStudio } from "@/components/ui/icons/Web3Icons";

export default function MediaStudio() {
    const { theme } = useThemeStore();
    const [activeTab, setActiveTab] = useState<"image">("image");
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedAsset, setGeneratedAsset] = useState<string | null>(null);
    const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
    const { activeImageModel } = useChatStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [aspectRatio, setAspectRatio] = useState("16:9");

    const activeModel = activeImageModel;
    const selectedModel = getModelById(activeModel);
    const generate = useAction(api.replicate.generate);
    const generateHf = useAction(api.huggingface.generate);
    const saveAsset = useMutation(api.assets.saveAsset);
    const assets = useQuery(api.assets.listAssets, { type: "image" });

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        try {
            let resultUrl = "";
            let metadata = {};

            if (activeModel.startsWith("huggingface/")) {
                const output = await generateHf({
                    model: activeModel,
                    prompt,
                    width: aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 1216 : 832,
                    height: aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 832 : 1216,
                });
                resultUrl = output;
            } else {
                const input: any = { prompt, aspect_ratio: aspectRatio, output_format: "png" };
                const output = await generate({ model: activeModel, input });
                if (Array.isArray(output)) resultUrl = output[0];
                else if (typeof output === "string") resultUrl = output;
                else if (typeof output === "object" && output !== null) resultUrl = (output as any).image || JSON.stringify(output);
            }

            if (resultUrl) {
                setGeneratedAsset(resultUrl);
                await saveAsset({ type: "image", url: resultUrl, prompt, model: activeModel, metadata });
                toast.success("Asset forged successfully!");
            } else {
                throw new Error("No output URL received");
            }
        } catch (error: any) {
            console.error("Generation error:", error);
            toast.error(error.message || "Failed to generate asset");
        } finally {
            setIsGenerating(false);
        }
    };

    const controlsProps = {
        activeTab,
        setActiveTab: (tab: any) => setActiveTab(tab),
        prompt,
        setPrompt,
        isGenerating,
        handleGenerate,
        isModelPickerOpen,
        setIsModelPickerOpen,
        selectedModel,
        aspectRatio,
        setAspectRatio,
        setGeneratedAsset,
    };

    return (
        <div className="h-full flex flex-col md:flex-row bg-transparent overflow-hidden font-sans text-foreground selection:bg-primary/30 relative">
            {/* Global Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-[#030010] to-[#030010] pointer-events-none z-0" />

            {/* Desktop Control Deck */}
            <div className="hidden md:flex w-[340px] flex-col h-full z-20 p-4">
                <div className="flex-1 rounded-[2.5rem] bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <IconStudio className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight">Creative Forge</h2>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">v2.0 Online</p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <StudioControls {...controlsProps} />
                    </div>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden h-16 border-b border-white/10 flex items-center justify-between px-4 z-20 shrink-0 bg-black/40 backdrop-blur-xl">
                <span className="font-bold text-white flex items-center gap-2 text-lg">
                    <IconStudio className="w-5 h-5 text-purple-400" />
                    Forge
                </span>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-10 px-4 rounded-xl">
                            <Settings2 className="w-4 h-4 mr-2" /> Controls
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90vh] bg-[#0A0A0B] border-t border-white/10 p-0 overflow-hidden rounded-t-[2rem]">
                        <StudioControls {...controlsProps} className="h-full" />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col h-full relative min-h-0 z-10">
                {/* Toolbar */}
                <div className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/5">
                        <Button variant="ghost" size="sm" className="h-9 md:h-10 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <History className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">History</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-9 md:h-10 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <Layers className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Layers</span>
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" className="h-9 md:h-11 px-4 md:px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] text-sm font-bold transition-all hover:scale-105">
                            <Download className="w-4 h-4 mr-2" /> Export Asset
                        </Button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 relative px-4 md:px-8 pb-4 md:pb-8 flex flex-col min-h-0">
                    <div className="flex-1 rounded-[2rem] border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden relative shadow-2xl">
                        <StudioCanvas
                            activeTab={activeTab}
                            generatedAsset={generatedAsset}
                            isPlaying={isPlaying}
                            setIsPlaying={setIsPlaying}
                            setPrompt={setPrompt}
                        />
                    </div>

                    {/* Bottom Asset Reel */}
                    {assets && assets.length > 0 && (
                        <div className="h-24 mt-4 flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
                            {assets.map((item, i) => (
                                <motion.button
                                    key={item._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setGeneratedAsset(item.url)}
                                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 group ${generatedAsset === item.url ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-105" : "border-white/5 opacity-60 hover:opacity-100 hover:scale-105 hover:border-white/20"}`}
                                >
                                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ModelPicker
                open={isModelPickerOpen}
                onOpenChange={setIsModelPickerOpen}
                type={activeTab}
            />
        </div>
    );
}