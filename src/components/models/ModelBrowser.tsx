import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/lib/stores/chat-store";
import { useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  Zap,
  Brain,
  Music,
  Star,
  MessageSquare,
  Bot,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AVAILABLE_MODELS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
  Model,
} from "@/lib/utils/model-utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileModelPicker } from "@/components/models/MobileModelPicker";
import { ModelIcon } from "@/components/models/ModelIcon";

interface ModelBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Simple SVG Icons for Models

const ModelBrowserContent = ({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) => {
  const {
    activeModel,
    setActiveModel,
    activeImageModel,
    setActiveImageModel,
    activeVideoModel,
    setActiveVideoModel,
    activeAudioModel,
    setActiveAudioModel,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("showcase");

  const categories = [
    { id: "showcase", label: "Showcase", icon: Star, color: "text-yellow-400" },
    {
      id: "text",
      label: "Text",
      icon: MessageSquare,
      color: "text-emerald-400",
    },
    { id: "image", label: "Image", icon: ImageIcon, color: "text-purple-400" },
    { id: "video", label: "Video", icon: Video, color: "text-blue-400" },
    { id: "audio", label: "Audio", icon: Music, color: "text-orange-400" },
  ];

  const getFilteredModels = () => {
    let models: Model[] = [];

    switch (activeCategory) {
      case "showcase":
        models = [
          ...AVAILABLE_MODELS.filter((m) => m.showcase),
          ...IMAGE_MODELS.filter((m) => m.showcase),
          ...VIDEO_MODELS.filter((m) => m.showcase),
          ...AUDIO_MODELS.filter((m) => m.showcase),
        ];
        break;
      case "text":
        models = AVAILABLE_MODELS;
        break;
      case "image":
        models = IMAGE_MODELS;
        break;
      case "video":
        models = VIDEO_MODELS;
        break;
      case "audio":
        models = AUDIO_MODELS;
        break;
    }

    if (searchQuery) {
      models = models.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.tags?.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    return models;
  };

  const filteredModels = useMemo(
    () => getFilteredModels(),
    [searchQuery, activeCategory],
  );

  const handleSelectModel = (model: Model) => {
    if (model.isImage) {
      setActiveImageModel(model.id);
    } else if (model.isVideo) {
      setActiveVideoModel(model.id);
    } else if (model.isAudio) {
      setActiveAudioModel(model.id);
    } else {
      setActiveModel(model.id);
    }
    onOpenChange(false);
  };

  const isModelActive = (model: Model) => {
    if (model.isImage) return activeImageModel === model.id;
    if (model.isVideo) return activeVideoModel === model.id;
    if (model.isAudio) return activeAudioModel === model.id;
    return activeModel === model.id;
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Mobile Header with Search */}
      <div className="flex sm:hidden flex-col border-b border-white/5 bg-black/40 safe-top shrink-0">
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-white">Model Hub</span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="pl-9 bg-white/5 border-white/5 text-white placeholder:text-white/30 h-10 text-sm focus:bg-white/10 rounded-xl"
            />
          </div>
        </div>

        {/* Mobile Category Pills */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/5 text-white/60 border border-transparent hover:bg-white/10"
              }`}
            >
              <cat.icon
                className={`w-3.5 h-3.5 ${activeCategory === cat.id ? cat.color : "opacity-60"}`}
              />
              {cat.label}
              {cat.id === "showcase" && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar - Hidden on Mobile */}
        <div className="hidden sm:flex w-64 bg-black/40 border-r border-white/5 flex-col shrink-0">
          <div className="p-6 border-b border-white/5">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Model Hub
            </DialogTitle>
            <p className="text-xs text-white/40 mt-1">
              Select the perfect AI for your task
            </p>
          </div>

          <div className="p-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-white/10 text-white shadow-lg shadow-black/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <cat.icon
                  className={`w-4 h-4 ${activeCategory === cat.id ? cat.color : "opacity-50"}`}
                />
                {cat.label}
                {cat.id === "showcase" && (
                  <span className="ml-auto flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 bg-black/20">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="pl-9 bg-white/5 border-white/5 text-white placeholder:text-white/30 h-9 text-sm focus:bg-white/10 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white/[0.02]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
              {/* Desktop Header */}
              <div className="hidden sm:block mb-6">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {categories.find((c) => c.id === activeCategory)?.label}
                </h3>
                <p className="text-white/50 text-sm">
                  {filteredModels.length} models available
                </p>
              </div>

              {/* Mobile Model Count */}
              <div className="flex sm:hidden mb-4">
                <span className="text-xs text-white/40">
                  {filteredModels.length}{" "}
                  {categories.find((c) => c.id === activeCategory)?.label}{" "}
                  available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pb-20 sm:pb-4">
                <AnimatePresence mode="popLayout">
                  {filteredModels.map((model) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={model.id}
                      onClick={() => handleSelectModel(model)}
                      className={`group relative flex flex-col p-4 sm:p-5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all duration-300 active:scale-[0.98] sm:hover:-translate-y-1 overflow-hidden ${
                        isModelActive(model)
                          ? "bg-white/10 border-primary/50 ring-1 ring-primary/30 shadow-xl shadow-primary/10"
                          : "bg-black/40 border-white/5 hover:border-white/10 hover:bg-white/5 hover:shadow-lg hover:shadow-black/40"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div
                          className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-white/5 ${
                            isModelActive(model)
                              ? "bg-primary/20"
                              : "bg-white/5 group-hover:bg-white/10"
                          }`}
                        >
                          <ModelIcon
                            provider={model.provider}
                            name={model.name}
                            logoUrl={model.logo}
                          />
                        </div>
                        {isModelActive(model) && (
                          <div className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            ACTIVE
                          </div>
                        )}
                        {model.showcase && !isModelActive(model) && (
                          <div className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-yellow-500/20">
                            <Star className="w-3 h-3 fill-yellow-500" />
                            TOP
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold mb-1 group-hover:text-primary transition-colors truncate text-sm sm:text-base">
                          {model.name}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-white/60 line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
                          {model.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-auto pt-3 sm:pt-4 border-t border-white/5">
                        <Badge
                          variant="outline"
                          className="bg-white/5 border-white/5 text-white/50 text-[9px] sm:text-[10px] h-5 px-1.5 hover:bg-white/10"
                        >
                          {model.provider}
                        </Badge>
                        {model.contextWindow > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-white/5 border-white/5 text-white/50 text-[9px] sm:text-[10px] h-5 px-1.5 hover:bg-white/10"
                          >
                            {Math.round(model.contextWindow / 1000)}k ctx
                          </Badge>
                        )}
                        {model.tags?.slice(0, 1).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="bg-white/5 border-white/5 text-white/50 text-[9px] sm:text-[10px] h-5 px-1.5 hover:bg-white/10 hidden sm:flex"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredModels.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-white/40">
                  <Search className="w-12 h-12 mb-4 opacity-20" />
                  <p>No models found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ModelBrowser({ open, onOpenChange }: ModelBrowserProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileModelPicker open={open} onOpenChange={onOpenChange} />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[100vw] sm:max-w-5xl h-[100dvh] sm:h-[85vh] p-0 bg-[#0a0a0a] border-0 sm:border sm:border-white/10 backdrop-blur-3xl overflow-hidden flex flex-col rounded-none sm:rounded-2xl"
        showCloseButton={false}
      >
        <ModelBrowserContent onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
