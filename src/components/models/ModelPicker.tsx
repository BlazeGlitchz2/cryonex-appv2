import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Zap, Brain, Cpu, ChevronRight } from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import {
  AVAILABLE_MODELS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
} from "@/lib/utils/model-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileModelPicker } from "./MobileModelPicker";

interface ModelPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "text" | "image" | "video" | "audio";
}

export function ModelPicker({ open, onOpenChange, type = "text" }: ModelPickerProps) {
  const isMobile = useIsMobile();

  // Use dedicated mobile component on mobile devices
  if (isMobile) {
    return <MobileModelPicker open={open} onOpenChange={onOpenChange} type={type} />;
  }

  // Desktop version
  return <DesktopModelPicker open={open} onOpenChange={onOpenChange} type={type} />;
}

// Desktop-only Model Picker
function DesktopModelPicker({ open, onOpenChange, type = "text" }: ModelPickerProps) {
  const {
    activeModel,
    setActiveModel,
    activeImageModel,
    setActiveImageModel,
    activeVideoModel,
    setActiveVideoModel,
    activeAudioModel,
    setActiveAudioModel
  } = useChatStore();

  const handleSelectModel = (modelId: string) => {
    switch (type) {
      case "image":
        setActiveImageModel(modelId);
        break;
      case "video":
        setActiveVideoModel(modelId);
        break;
      case "audio":
        setActiveAudioModel(modelId);
        break;
      default:
        setActiveModel(modelId);
    }
    onOpenChange(false);
  };

  const getModels = () => {
    switch (type) {
      case "image": return IMAGE_MODELS;
      case "video": return VIDEO_MODELS;
      case "audio": return AUDIO_MODELS;
      default: return AVAILABLE_MODELS;
    }
  };

  const models = getModels();

  const currentActiveModel = type === "image" ? activeImageModel :
    type === "video" ? activeVideoModel :
      type === "audio" ? activeAudioModel :
        activeModel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-[#0a0a0a]/95 backdrop-blur-2xl border-white/10 p-0 overflow-hidden shadow-2xl shadow-black/50 rounded-2xl">
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 bg-black/20 border-r border-white/5 p-6 flex flex-col">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                AI Models
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">Select the perfect intelligence for your task.</p>
            </DialogHeader>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Categories</div>
              <Button variant="ghost" className="w-full justify-start text-sm bg-white/5 text-white hover:bg-white/10">
                <Brain className="w-4 h-4 mr-2 text-purple-400" /> All Models
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm text-white/70 hover:text-white hover:bg-white/5">
                <Zap className="w-4 h-4 mr-2 text-yellow-400" /> Fast & Efficient
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm text-white/70 hover:text-white hover:bg-white/5">
                <Cpu className="w-4 h-4 mr-2 text-blue-400" /> Reasoning
              </Button>
            </div>

            <div className="mt-auto">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/5">
                <div className="text-xs font-medium text-white mb-1">Pro Tip</div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Use "Reasoning" models for complex logic and coding tasks.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-white/[0.02]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="text-sm font-medium text-white">Available Models</div>
              <Badge variant="outline" className="border-white/10 text-xs">
                {models.length} Models
              </Badge>
            </div>

            <ScrollArea className="flex-1 p-4 max-h-[400px]">
              <div className="grid gap-3 pb-4">
                {models.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => handleSelectModel(model.id)}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${currentActiveModel === model.id
                      ? "bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_-10px_rgba(168,85,247,0.3)]"
                      : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
                      }`}
                  >
                    <div className={`mt-1 h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${currentActiveModel === model.id ? "bg-purple-500 text-white" : "bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white"
                      }`}>
                      <Sparkles className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold text-sm ${currentActiveModel === model.id ? "text-white" : "text-white/90"}`}>
                          {model.name}
                        </h3>
                        {currentActiveModel === model.id && (
                          <CheckCircle2 className="h-4 w-4 text-purple-500" />
                        )}
                      </div>
                      <p className="text-xs text-white/70 line-clamp-2 mb-3">
                        {model.description}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-white/60 bg-white/5 px-2 py-0.5 rounded-full">
                          <Zap className="w-3 h-3" />
                          <span>Fast</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-white/60 bg-white/5 px-2 py-0.5 rounded-full">
                          <Brain className="w-3 h-3" />
                          <span>128k Context</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/5 bg-black/20">
              <Button
                variant="ghost"
                className="w-full text-xs text-muted-foreground hover:text-white hover:bg-white/5 justify-between group"
                onClick={() => {
                  onOpenChange(false);
                  useChatStore.getState().setModelBrowserOpen(true);
                }}
              >
                <span>View All Models in Browser</span>
                <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}