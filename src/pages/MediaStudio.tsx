import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { History, Layers, Settings2 } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState<string | null>(null);
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const { activeImageModel, activeVideoModel } = useChatStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("16:9");

  // Image Reference State
  const [imageRef, setImageRef] = useState<File | null>(null);
  const [refStrength, setRefStrength] = useState(0.5);
  const [videoDuration, setVideoDuration] = useState(6);
  const [videoWithAudio, setVideoWithAudio] = useState(false);

  const activeModel = activeTab === "video" ? activeVideoModel : activeImageModel;
  const selectedModel = getModelById(activeModel);
  const generate = useAction(api.replicate.generate);
  const generateHf = useAction(api.huggingface.generate);
  const generateHfVideo = useAction(api.huggingface.generateVideo);
  const generatePollinations = useAction(api.pollinations.generate);
  const editPollinations = useAction(api.pollinations.edit);
  const generatePollinationsVideo = useAction(
    (api as any).pollinations.generateVideo,
  );
  const chargeGeneration = useMutation((api as any).credits.chargeGeneration);
  const refundGenerationCharge = useMutation(
    (api as any).credits.refundGenerationCharge,
  );

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getPublicUrl = useMutation(api.files.getPublicUrl);

  const saveAsset = useMutation(api.assets.saveAsset);
  const estimatedGeneration = useQuery(
    (api as any).credits.estimateGenerationCost,
    {
      mediaType: activeTab,
      model:
        activeModel === "auto"
          ? activeTab === "video"
            ? "pollinations/grok-video"
            : "pollinations/flux"
          : activeModel,
      width: aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 1216 : 832,
      height: aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 832 : 1216,
      duration: videoDuration,
      audio: videoWithAudio,
      hasReference: !!imageRef,
    },
  );
  const assets = useQuery(api.assets.listAssets, { type: activeTab });

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    let chargeUsageId: string | null = null;
    try {
      let resultUrl: string = "";
      const metadata = {};

      const width =
        aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 1216 : 832;
      const height =
        aspectRatio === "1:1" ? 1024 : aspectRatio === "16:9" ? 832 : 1216;

      // Handle Image Reference if present
      let uploadedImageUrl = "";
      if (activeTab === "image" && imageRef) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": imageRef.type },
          body: imageRef,
        });
        const { storageId } = await result.json();
        uploadedImageUrl = (await getPublicUrl({ storageId })) || "";
      }

      const chargeResult = await chargeGeneration({
        mediaType: activeTab,
        model:
          activeModel === "auto"
            ? activeTab === "video"
              ? "pollinations/grok-video"
              : "pollinations/flux"
            : activeModel,
        width,
        height,
        duration: videoDuration,
        audio: videoWithAudio,
        hasReference: !!uploadedImageUrl,
        promptLength: prompt.length,
      });
      chargeUsageId = chargeResult?.usageId || null;

      if (activeTab === "video") {
        if (activeModel.startsWith("pollinations/") || activeModel === "auto") {
          const videoModel =
            activeModel === "auto"
              ? "grok-video"
              : activeModel.replace("pollinations/", "") || "grok-video";
          resultUrl = (await generatePollinationsVideo({
            model: videoModel,
            prompt,
            duration: videoDuration,
            aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9",
            audio: videoWithAudio,
            image: uploadedImageUrl || undefined,
          })) || "";
        } else if (activeModel.startsWith("huggingface/")) {
          resultUrl = (await generateHfVideo({
            model: activeModel,
            prompt,
          })) || "";
        } else {
          const output = await generate({
            model: activeModel,
            input: {
              prompt,
              image: uploadedImageUrl || undefined,
            },
          });
          if (Array.isArray(output)) resultUrl = output[0];
          else if (typeof output === "string") resultUrl = output;
        }
      } else if (activeModel.startsWith("pollinations/") || activeModel === "auto") {
        const modelName =
          activeModel === "auto"
            ? "flux"
            : activeModel.replace("pollinations/", "") || "flux";

        if (uploadedImageUrl) {
          resultUrl = (await editPollinations({
            model: "kontext", // Kontext is best for image-to-image/editing
            prompt,
            image: uploadedImageUrl,
            width,
            height,
          })) || "";
        } else {
          resultUrl = (await generatePollinations({
            model: modelName,
            prompt,
            width,
            height,
          })) || "";
        }
      } else if (activeModel.startsWith("huggingface/")) {
        const output = await generateHf({
          model: activeModel,
          prompt,
          width,
          height,
        });
        resultUrl = output || "";
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const input: any = {
          prompt,
          aspect_ratio: aspectRatio,
          output_format: "png",
        };
        // Replicate models usually support image-to-image via 'image' or 'mask' fields
        if (uploadedImageUrl) {
          input.image = uploadedImageUrl;
          input.prompt_strength = refStrength;
        }

        const output = await generate({ model: activeModel, input });
        if (Array.isArray(output)) resultUrl = output[0];
        else if (typeof output === "string") resultUrl = output;
         
        else if (typeof output === "object" && output !== null)
          resultUrl = (output as any).image || JSON.stringify(output);
      }

      if (resultUrl) {
        setGeneratedAsset(resultUrl);
        await saveAsset({
          type: activeTab,
          url: resultUrl,
          prompt,
          model: activeModel,
          metadata,
        });
        toast.success(
          activeTab === "video"
            ? "Video forged successfully!"
            : "Asset forged successfully!",
        );
      } else {
        throw new Error("No output URL received");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (chargeUsageId) {
        try {
          await refundGenerationCharge({
            usageId: chargeUsageId as any,
            reason: "Generation request failed",
          });
        } catch (refundError) {
          console.error("Failed to refund generation charge:", refundError);
        }
      }
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
    imageRef,
    setImageRef,
    refStrength,
    setRefStrength,
    videoDuration,
    setVideoDuration,
    videoWithAudio,
    setVideoWithAudio,
    estimatedCost: estimatedGeneration?.amount,
  };

  return (
    <div className="h-full flex bg-[#030014] overflow-hidden font-sans text-foreground selection:bg-blue-500/30 relative">
      {/* Global Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#030014] to-[#030014] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none z-0" />

      {/* Desktop Sidebar Controls */}
      <div
        id="studio-controls"
        className="hidden md:flex w-[400px] flex-col h-full z-20 relative border-r border-white/5 bg-black/40 backdrop-blur-2xl"
      >
        <StudioControls {...controlsProps} />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 border-b border-white/10 flex items-center justify-between px-4 z-50 bg-black/60 backdrop-blur-xl">
        <span className="font-bold text-white flex items-center gap-2 text-lg">
          <IconStudio className="w-5 h-5 text-blue-400" />
          Studio
        </span>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <Settings2 className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="h-[85vh] bg-[#0A0A0B] border-t border-white/10 p-0 overflow-hidden rounded-t-[2rem]"
          >
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
              description:
                "Configure your generation settings, models, and dimensions here.",
              position: "right",
            },
            {
              targetId: "studio-canvas",
              title: "Creative Canvas",
              description:
                "Your generated media appears here. Interact with it directly.",
              position: "left",
            },
            {
              targetId: "studio-history",
              title: "Asset History",
              description: "Quickly access your recently generated assets.",
              position: "bottom",
            },
          ]}
        />
        {/* Top Toolbar */}
        <div className="h-16 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-2">
            {/* Breadcrumbs or Title could go here */}
          </div>
          <div className="flex items-center gap-2">
            <Button
              id="studio-history"
              variant="ghost"
              size="sm"
              className="h-9 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <History className="w-3.5 h-3.5 mr-2" /> Recent
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <Layers className="w-3.5 h-3.5 mr-2" /> Layers
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div
          id="studio-canvas"
          className="flex-1 relative flex flex-col min-h-0"
        >
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
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border transition-all flex-shrink-0 group ${generatedAsset === item.url ? "border-blue-500 ring-2 ring-blue-500/20 scale-105" : "border-white/10 opacity-70 hover:opacity-100 hover:scale-105 hover:border-white/30"}`}
                  >
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
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
