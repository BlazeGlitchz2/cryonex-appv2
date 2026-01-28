import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Zap, Brain, Cpu, ChevronRight, X } from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import {
  AVAILABLE_MODELS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
} from "@/lib/utils/model-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface ModelPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "text" | "image" | "video" | "audio";
}

type ModelCategory = "all" | "fast" | "reasoning";

export function ModelPicker({ open, onOpenChange, type = "text" }: ModelPickerProps) {
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

  const [selectedCategory, setSelectedCategory] = useState<ModelCategory>("all");

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

  // Filter models by category (you could add category tags to models for real filtering)
  const filteredModels = models;

  const currentActiveModel = type === "image" ? activeImageModel :
    type === "video" ? activeVideoModel :
      type === "audio" ? activeAudioModel :
        activeModel;

  const categories = [
    { id: "all" as ModelCategory, label: "All Models", icon: Brain, color: "text-purple-400" },
    { id: "fast" as ModelCategory, label: "Fast & Efficient", icon: Zap, color: "text-yellow-400" },
    { id: "reasoning" as ModelCategory, label: "Reasoning", icon: Cpu, color: "text-blue-400" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[100vw] sm:max-w-3xl h-[100dvh] sm:h-[600px] bg-[#0a0a0a]/98 backdrop-blur-2xl border-0 sm:border sm:border-white/10 p-0 overflow-hidden shadow-2xl shadow-black/50 rounded-none sm:rounded-2xl"
        showCloseButton={false}
      >
        {/* Mobile Header */}
        <div className="flex sm:hidden items-center justify-between p-4 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-lg font-bold text-white">AI Models</span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Mobile Category Pills */}
        <div className="flex sm:hidden gap-2 p-4 pb-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${selectedCategory === cat.id
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/5 text-white/60 border border-transparent hover:bg-white/10"
                }`}
            >
              <cat.icon className={`w-4 h-4 ${selectedCategory === cat.id ? cat.color : "opacity-60"}`} />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row h-[calc(100%-120px)] sm:h-full">
          {/* Desktop Sidebar - Hidden on Mobile */}
          <div className="hidden sm:flex w-64 bg-black/20 border-r border-white/5 p-6 flex-col">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                AI Models
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">Select the perfect intelligence for your task.</p>
            </DialogHeader>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Categories</div>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant="ghost"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full justify-start text-sm ${selectedCategory === cat.id
                      ? "bg-white/5 text-white hover:bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <cat.icon className={`w-4 h-4 mr-2 ${cat.color}`} />
                  {cat.label}
                </Button>
              ))}
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
          <div className="flex-1 flex flex-col bg-white/[0.02] min-h-0">
            {/* Desktop Header */}
            <div className="hidden sm:flex p-4 border-b border-white/5 items-center justify-between">
              <div className="text-sm font-medium text-white">Available Models</div>
              <Badge variant="outline" className="border-white/10 text-xs">
                {filteredModels.length} Models
              </Badge>
            </div>

            {/* Mobile Model Count */}
            <div className="flex sm:hidden px-4 py-2">
              <span className="text-xs text-white/40">{filteredModels.length} models available</span>
            </div>

            <ScrollArea className="flex-1 px-3 sm:px-4">
              <div className="grid gap-3 py-3 sm:py-4 pb-20 sm:pb-4">
                {filteredModels.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => handleSelectModel(model.id)}
                    className={`group relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-300 cursor-pointer active:scale-[0.98] ${currentActiveModel === model.id
                        ? "bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_-10px_rgba(168,85,247,0.3)]"
                        : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
                      }`}
                  >
                    <div className={`mt-0.5 h-10 w-10 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${currentActiveModel === model.id
                        ? "bg-purple-500 text-white"
                        : "bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white"
                      }`}>
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h3 className={`font-semibold text-sm truncate ${currentActiveModel === model.id ? "text-white" : "text-white/90"
                          }`}>
                          {model.name}
                        </h3>
                        {currentActiveModel === model.id && (
                          <CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-white/70 line-clamp-2 mb-2 sm:mb-3">
                        {model.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
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

            {/* Footer - View All Button */}
            <div className="p-3 sm:p-4 border-t border-white/5 bg-black/20 safe-bottom">
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