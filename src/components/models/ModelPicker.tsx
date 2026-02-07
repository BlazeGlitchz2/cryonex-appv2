import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Sparkles,
  Zap,
  Brain,
  Cpu,
  ChevronRight,
  Search,
  Star,
  Crown,
  Clock,
  Code,
  Filter,
  LayoutGrid,
} from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import {
  AVAILABLE_MODELS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
  Model,
  ModelProvider,
} from "@/lib/utils/model-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileModelPicker } from "./MobileModelPicker";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModelIcon } from "@/components/models/ModelIcon";

interface ModelPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "text" | "image" | "video" | "audio";
}

export function ModelPicker({
  open,
  onOpenChange,
  type = "text",
}: ModelPickerProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileModelPicker open={open} onOpenChange={onOpenChange} type={type} />
    );
  }

  return (
    <DesktopModelPicker open={open} onOpenChange={onOpenChange} type={type} />
  );
}

// Categories configuration
type CategoryId = "all" | "premium" | "reasoning" | "fast" | "coding" | "free";

interface Category {
  id: CategoryId;
  label: string;
  icon: any;
  color: string;
  description: string;
}

const CATEGORIES: Category[] = [
  {
    id: "all",
    label: "All Models",
    icon: LayoutGrid,
    color: "text-white",
    description: "View all available models",
  },
  {
    id: "premium",
    label: "Premium / Top",
    icon: Crown,
    color: "text-amber-400",
    description: "High-performance, showcase models",
  },
  {
    id: "reasoning",
    label: "Reasoning",
    icon: Brain,
    color: "text-purple-400",
    description: "Best for logic and complex tasks",
  },
  {
    id: "coding",
    label: "Coding",
    icon: Code,
    color: "text-blue-400",
    description: "Optimized for programming",
  },
  {
    id: "fast",
    label: "Fast & Turbo",
    icon: Zap,
    color: "text-yellow-400",
    description: "Quick responses, lower latency",
  },
  {
    id: "free",
    label: "Free Tier",
    icon: Sparkles,
    color: "text-green-400",
    description: "Great models at no cost",
  },
];

function DesktopModelPicker({
  open,
  onOpenChange,
  type = "text",
}: ModelPickerProps) {
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

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

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

  // Get base models based on type
  const baseModels = useMemo(() => {
    switch (type) {
      case "image":
        return IMAGE_MODELS;
      case "video":
        return VIDEO_MODELS;
      case "audio":
        return AUDIO_MODELS;
      default:
        return AVAILABLE_MODELS;
    }
  }, [type]);

  // Filter and Sort Models
  const filteredModels = useMemo(() => {
    return baseModels
      .filter((model) => {
        // Search Filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          model.name.toLowerCase().includes(searchLower) ||
          model.provider.toLowerCase().includes(searchLower) ||
          model.tags?.some((tag) => tag.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;

        // Category Filter
        if (selectedCategory === "all") return true;
        if (selectedCategory === "premium")
          return model.showcase || model.tags?.includes("Premium");
        if (selectedCategory === "reasoning")
          return model.tags?.some((t) =>
            ["Reasoning", "Smart", "Complex", "DeepSeek", "Thinking"].some(
              (k) => t.includes(k),
            ),
          );
        if (selectedCategory === "coding")
          return model.tags?.some((t) =>
            ["Coding", "Code", "Dev", "Programming"].some((k) => t.includes(k)),
          );
        if (selectedCategory === "fast")
          return model.tags?.some((t) =>
            ["Fast", "Turbo", "Flash", "Instant"].some((k) => t.includes(k)),
          );
        if (selectedCategory === "free")
          return (
            model.tags?.some((t) => ["Free"].some((k) => t.includes(k))) ||
            model.contextWindow === 0
          );

        return true;
      })
      .sort((a, b) => {
        // Custom Sorting: Showcase first, then by context window or name
        if (a.showcase && !b.showcase) return -1;
        if (!a.showcase && b.showcase) return 1;
        return 0;
      });
  }, [baseModels, searchQuery, selectedCategory]);

  const currentActiveModelId =
    type === "image"
      ? activeImageModel
      : type === "video"
        ? activeVideoModel
        : type === "audio"
          ? activeAudioModel
          : activeModel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 p-0 overflow-hidden shadow-2xl shadow-black/80 rounded-3xl flex gap-0">
        {/* Visual Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10" />
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] opacity-20" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] opacity-20" />
        </div>

        {/* LEFT SIDEBAR - Categories */}
        <div className="w-64 bg-black/40 border-r border-white/5 flex flex-col z-10 relative backdrop-blur-md">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Models
              </h2>
            </div>
            <p className="text-xs text-white/40 pl-10">Select your engine</p>
          </div>

          <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 group relative overflow-hidden ${selectedCategory === category.id
                  ? "bg-white/10 text-white shadow-inner border border-white/5"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div
                  className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${selectedCategory === category.id
                    ? "bg-white/10"
                    : "bg-white/5 group-hover:bg-white/10"
                    }`}
                >
                  <category.icon
                    className={`w-4 h-4 ${selectedCategory === category.id ? category.color : "text-white/50 group-hover:text-white"}`}
                  />
                </div>
                <div className="flex-1 relative z-10">
                  <div className="text-sm font-medium">{category.label}</div>
                  <div className="text-[10px] opacity-50 truncate leading-tight">
                    {category.description}
                  </div>
                </div>

                {selectedCategory === category.id && (
                  <motion.div
                    layoutId="category-active"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 bg-black/20">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-white/10 relative overflow-hidden group hover:border-purple-500/30 transition-colors cursor-help">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-3 h-3 text-purple-300" />
                  <span className="text-xs font-semibold text-purple-100">
                    Pro Tip
                  </span>
                </div>
                <p className="text-[10px] text-purple-200/80 leading-relaxed">
                  Press{" "}
                  <kbd className="bg-black/30 px-1 rounded text-white/90 font-sans">
                    K
                  </kbd>{" "}
                  to open command palette for quick switching.
                </p>
              </div>
              <div className="absolute inset-0 bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors" />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT - Grid */}
        <div className="flex-1 flex flex-col relative z-10">
          {/* Header */}
          <div className="h-20 border-b border-white/5 flex items-center px-6 gap-4 bg-white/[0.02]">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-400 transition-colors" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${selectedCategory === "all" ? "" : selectedCategory + " "}models...`}
                className="pl-10 h-10 bg-black/20 border-white/5 text-white placeholder:text-white/20 focus-visible:ring-purple-500/50 rounded-full transition-all focus-visible:bg-black/40 hover:bg-black/30"
              />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-white/50">
                <Filter className="w-3 h-3" />
                <span>{filteredModels.length} models</span>
              </div>
            </div>
          </div>

          {/* Scrollable Grid */}
          <ScrollArea className="flex-1 p-6">
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 pb-10"
            >
              <AnimatePresence mode="popLayout">
                {filteredModels.map((model, index) => {
                  const isActive = currentActiveModelId === model.id;
                  const isHovered = hoveredModel === model.id;

                  return (
                    <motion.div
                      key={model.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      onClick={() => handleSelectModel(model.id)}
                      onMouseEnter={() => setHoveredModel(model.id)}
                      onMouseLeave={() => setHoveredModel(null)}
                      className={`relative group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden ${isActive
                        ? "bg-purple-900/20 border-purple-500/50 shadow-[0_0_20px_-10px_rgba(168,85,247,0.4)]"
                        : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 hover:shadow-xl hover:shadow-black/20"
                        }`}
                    >
                      {/* Glow Effect on Active */}
                      {isActive && (
                        <div className="absolute inset-0 bg-purple-500/5 z-0 animate-pulse-slow" />
                      )}

                      <div className="p-4 relative z-10 flex flex-col h-full gap-3">
                        {/* Card Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 ${isHovered ? "scale-110" : ""} ${isActive ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30" : "bg-white/10 text-white/70"}`}
                            >
                              {/* We can use ModelIcon but we might need to fallback to simple icons if not available, keeping it safe with ModelIcon component */}
                              <ModelIcon
                                provider={model.provider}
                                name={model.name}
                                logoUrl={model.logo}
                                className="w-6 h-6"
                              />
                            </div>
                            <div>
                              <h3
                                className={`font-semibold text-sm leading-tight mb-0.5 ${isActive ? "text-purple-100" : "text-white"}`}
                              >
                                {model.name}
                              </h3>

                              {model.showcase && (
                                <span className="flex items-center gap-0.5 text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                                  <Star className="w-2 h-2 fill-amber-500" />
                                  TOP
                                </span>
                              )}

                            </div>
                          </div>

                          {/* Selection Radio / Check */}
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isActive
                              ? "border-purple-500 bg-purple-500 text-white scale-100"
                              : "border-white/10 bg-transparent group-hover:border-white/30"
                              }`}
                          >
                            {isActive && (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-white/50 line-clamp-2 min-h-[2.5em]">
                          {model.description}
                        </p>

                        {/* Chips / Stats */}
                        <div className="mt-auto flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
                          {model.contextWindow > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-white/40 bg-white/5 px-2 py-1 rounded-md">
                              <Brain className="w-3 h-3" />
                              <span>
                                {Math.round(model.contextWindow / 1000)}k
                              </span>
                            </div>
                          )}
                          {model.tags?.slice(0, 2).map((tag) => (
                            <div
                              key={tag}
                              className="flex items-center gap-1 text-[10px] text-white/40 bg-white/5 px-2 py-1 rounded-md border border-white/5"
                            >
                              {tag}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {filteredModels.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-white font-medium mb-1">No models found</h3>
                <p className="text-white/40 text-sm max-w-xs">
                  Try adjusting your search or category filters.
                </p>
                <Button
                  variant="link"
                  className="text-purple-400 mt-2"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent >
    </Dialog >
  );
}
