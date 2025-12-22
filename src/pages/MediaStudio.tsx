import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Download,
    History,
    Layers,
    Settings2,
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

export default function MediaStudio() {
    const { theme } = useThemeStore();
    const isLiquid = theme === 'liquid';
    const [activeTab, setActiveTab] = useState<"image" | "video">("image");
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedAsset, setGeneratedAsset] = useState<string | null>(null);
    const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);

    const { activeImageModel, activeVideoModel } = useChatStore();
    const [isPlaying, setIsPlaying] = useState(false);

    // Configuration state
    const [aspectRatio, setAspectRatio] = useState("16:9");

    // Determine active model based on tab
    const activeModel = activeTab === "image" ? activeImageModel : activeVideoModel;

    const selectedModel = getModelById(activeModel);
    const generate = useAction(api.replicate.generate);
    const generateHf = useAction(api.huggingface.generate);
    const generateHfVideo = useAction(api.huggingface.generateVideo);

    // New Convex hooks
    const saveAsset = useMutation(api.assets.saveAsset);
    const assets = useQuery(api.assets.listAssets, { type: activeTab });

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);

        try {
            let resultUrl = "";
            let metadata = {};

            if (activeModel.startsWith("huggingface/")) {
                if (activeTab === "image") {
                    // Hugging Face Image Generation
                    const output = await generateHf({
                        model: activeModel,
                        prompt,
                        width: aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 1216 : 832,
                        height: aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 832 : 1216,
                    });
                    resultUrl = output;
                    toast.success("Image generated successfully via Hugging Face!");
                } else if (activeTab === "video") {
                    // Hugging Face Video Generation
                    const output = await generateHfVideo({
                        model: activeModel,
                        prompt,
                    });
                    resultUrl = output;
                    toast.success("Video generated successfully via Hugging Face!");
                }
            } else {
                // Existing Replicate logic
                const input: any = { prompt };

                if (activeTab === "image") {
                    input.aspect_ratio = aspectRatio;
                    input.output_format = "png";
                } else if (activeTab === "video") {
                    // Video specific optimizations
                    if (activeModel.includes("minimax")) {
                        input.prompt_optimizer = true;
                    } else if (activeModel.includes("ltx")) {
                        input.aspect_ratio = aspectRatio;
                    }
                }

                const output = await generate({
                    model: activeModel,
                    input
                });

                if (Array.isArray(output)) {
                    resultUrl = output[0];
                } else if (typeof output === "string") {
                    resultUrl = output;
                } else if (typeof output === "object" && output !== null) {
                    resultUrl = (output as any).audio || (output as any).video || (output as any).image || JSON.stringify(output);
                }

                if (resultUrl) {
                    toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} generated successfully!`);
                } else {
                    throw new Error("No output URL received");
                }
            }

            if (resultUrl) {
                setGeneratedAsset(resultUrl);
                // Save to DB
                await saveAsset({
                    type: activeTab,
                    url: resultUrl,
                    prompt,
                    model: activeModel,
                    metadata
                });
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
        setActiveTab,
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
        <div className="h-full flex flex-col md:flex-row bg-[#030304] overflow-hidden font-sans text-foreground selection:bg-primary/30">
            {/* Desktop Sidebar Controls */}
            <div className={`hidden md:block w-80 border-r h-full z-20 ${isLiquid
                ? 'glass-sidebar border-white/20'
                : 'border-white/5 bg-black/40 backdrop-blur-xl'
                }`}>
                <StudioControls {...controlsProps} />
            </div>

            {/* Mobile Header & Controls Trigger */}
            <div className={`md:hidden h-16 border-b flex items-center justify-between px-4 z-20 shrink-0 ${isLiquid
                ? 'glass-panel border-white/20'
                : 'border-white/5 bg-black/40 backdrop-blur-xl'
                }`}>
                <span className="font-bold text-white flex items-center gap-2 text-lg">
                    <Settings2 className="w-5 h-5 text-primary" />
                    Studio
                </span>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-10 px-4">
                            <Settings2 className="w-4 h-4 mr-2" /> Controls
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90vh] bg-[#0A0A0B] border-t border-white/10 p-0 overflow-hidden">
                        <StudioControls {...controlsProps} className="h-full" />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col h-full relative min-h-0">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-[#030304] to-[#030304] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

                {/* Toolbar */}
                <div className={`h-16 md:h-20 border-b flex items-center justify-between px-4 md:px-6 z-10 shrink-0 ${isLiquid
                    ? 'glass-panel border-white/20'
                    : 'border-white/5 bg-black/20 backdrop-blur-sm'
                    }`}>
                    <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/5">
                        <Button variant="ghost" size="sm" className="h-9 md:h-10 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg">
                            <History className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">History</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-9 md:h-10 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg">
                            <Layers className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Layers</span>
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" className="h-9 md:h-11 px-4 md:px-6 bg-primary hover:bg-primary/90 text-white border-0 rounded-xl shadow-lg shadow-primary/20 text-sm font-medium">
                            <Download className="w-4 h-4 mr-2" /> Export
                        </Button>
                    </div>
                </div>

                {/* Canvas */}
                <StudioCanvas
                    activeTab={activeTab}
                    generatedAsset={generatedAsset}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    setPrompt={setPrompt}
                />

                {/* Bottom Filmstrip (History from DB) */}
                {assets && assets.length > 0 && (
                    <div className={`h-28 md:h-32 border-t p-4 flex items-center gap-4 overflow-x-auto z-20 shrink-0 ${isLiquid
                        ? 'glass-panel border-white/20'
                        : 'border-white/5 bg-black/40 backdrop-blur-xl'
                        }`}>
                        {assets.map((item, i) => (
                            <motion.button
                                key={item._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => {
                                    setGeneratedAsset(item.url);
                                    setActiveTab(item.type as any);
                                }}
                                className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 group touch-manipulation ${generatedAsset === item.url ? "border-primary shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)] scale-105" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"}`}
                            >
                                {item.type === "image" && <img src={item.url} alt="" className="w-full h-full object-cover" />}
                                {item.type === "video" && <video src={item.url} className="w-full h-full object-cover" />}
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