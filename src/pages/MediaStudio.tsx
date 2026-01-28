import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
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
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { IconStudio } from "@/components/ui/icons/Web3Icons";

export default function MediaStudio() {
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
    const generatePollinations = useAction(api.pollinations.generate);
    const saveAsset = useMutation(api.assets.saveAsset);
    const assets = useQuery(api.assets.listAssets, { type: "image" });

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        try {
            let resultUrl: string = "";
            const metadata = {};

            if (activeModel.startsWith("pollinations/") || activeModel === "auto") {
                const modelName = activeModel === "auto" ? "flux" : activeModel.replace("pollinations/", "") || "flux";
                const width = aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 1216 : 832;
                const height = aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 832 : 1216;

                const output = await generatePollinations({
                    model: modelName,
                    prompt,
                    width,
                    height,
                });
                resultUrl = output || "";
            } else if (activeModel.startsWith("huggingface/")) {
                const output = await generateHf({
                    model: activeModel,
                    prompt,
                    width: aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 1216 : 832,
                    height: aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 832 : 1216,
                });
                resultUrl = output || "";
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const input: any = { prompt, aspect_ratio: aspectRatio, output_format: "png" };
                const output = await generate({ model: activeModel, input });
                if (Array.isArray(output)) resultUrl = output[0];
                else if (typeof output === "string") resultUrl = output;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                else if (typeof output === "object" && output !== null) resultUrl = (output as any).image || JSON.stringify(output);
            }

            if (resultUrl) {
                setGeneratedAsset(resultUrl);
                await saveAsset({ type: "image", url: resultUrl, prompt, model: activeModel, metadata });
                toast.success("Asset forged successfully!");
            } else {
                throw new Error("No output URL received");
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Generation error:", error);
            toast.error(error.message || "Failed to generate asset");
        } finally {
            setIsGenerating(false);
        }
    };

    const controlsProps = {
        activeTab,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <div className="h-full flex bg-[#030014] overflow-hidden font-sans text-foreground selection:bg-purple-500/30 relative">
            {/* Global Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-[#030014] to-[#030014] pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none z-0" />

            {/* Desktop Sidebar Controls */}
            <div id="studio-controls" className="hidden md:flex w-[380px] flex-col h-full z-20 relative border-r border-white/5 bg-black/20 backdrop-blur-xl">
                <StudioControls {...controlsProps} />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden absolute top-0 left-0 right-0 h-16 border-b border-white/10 flex items-center justify-between px-4 z-50 bg-black/60 backdrop-blur-xl">
                <span className="font-bold text-white flex items-center gap-2 text-lg">
                    <IconStudio className="w-5 h-5 text-purple-400" />
                    Studio
                </span>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
                            <Settings2 className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[85vh] bg-[#0A0A0B] border-t border-white/10 p-0 overflow-hidden rounded-t-[2rem]">
                        <StudioControls {...controlsProps} className="h-full border-none" />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col h-full relative min-h-0 z-10">
                <OnboardingTour
                    tourId="media-studio"
                    steps={[
                        {
                            targetId: "studio-controls",
                            title: "Studio Controls",
                            description: "Configure your generation settings, models, and dimensions here.",
                            position: "right"
                        },
                        {
                            targetId: "studio-canvas",
                            title: "Creative Canvas",
                            description: "Your generated media appears here. Interact with it directly.",
                            position: "left"
                        },
                        {
                            targetId: "studio-history",
                            title: "Asset History",
                            description: "Quickly access your recently generated assets.",
                            position: "bottom"
                        }
                    ]}
                />
                {/* Top Toolbar */}
                <div className="h-16 flex items-center justify-between px-6 shrink-0 z-20">
                    <div className="flex items-center gap-2">
                        {/* Breadcrumbs or Title could go here */}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button id="studio-history" variant="ghost" size="sm" className="h-9 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                            <History className="w-3.5 h-3.5 mr-2" /> Recent
                        </Button>
                        <Button variant="ghost" size="sm" className="h-9 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                            <Layers className="w-3.5 h-3.5 mr-2" /> Layers
                        </Button>
                    </div>
                </div>

                {/* Canvas */}
                <div id="studio-canvas" className="flex-1 relative flex flex-col min-h-0">
                    <StudioCanvas
                        activeTab={activeTab}
                        generatedAsset={generatedAsset}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        setPrompt={setPrompt}
                    />

                    {/* Bottom Asset Reel */}
                    <AnimatePresence>
                        {assets && assets.length > 0 && (
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="absolute bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 max-w-[90%] w-auto h-20 p-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center gap-2 overflow-x-auto custom-scrollbar shadow-2xl z-30"
                            >
                                {assets.map((item, i) => (
                                    <motion.button
                                        key={item._id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setGeneratedAsset(item.url)}
                                        className={`relative w-16 h-16 rounded-xl overflow-hidden border transition-all flex-shrink-0 group ${generatedAsset === item.url ? "border-purple-500 ring-2 ring-purple-500/20 scale-105" : "border-white/10 opacity-70 hover:opacity-100 hover:scale-105 hover:border-white/30"}`}
                                    >
                                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
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