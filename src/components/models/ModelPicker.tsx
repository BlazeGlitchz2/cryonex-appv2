import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  Code,
  Filter,
  LayoutGrid,
  X,
} from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import {
  AVAILABLE_MODELS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
  Model,
} from "@/lib/utils/model-utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileModelPicker } from "./MobileModelPicker";
import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModelIcon } from "@/components/models/ModelIcon";
import { LocalAIChat } from "@/components/LocalAIChat";

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
  icon: typeof Sparkles;
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
    color: "text-cyan-400",
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
    color: "text-emerald-400",
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
  const [showLocalAI, setShowLocalAI] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
      setShowLocalAI(false);
    }
  }, [open]);

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

  const filteredModels = useMemo(() => {
    return baseModels
      .filter((model) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          model.name.toLowerCase().includes(searchLower) ||
          model.provider.toLowerCase().includes(searchLower) ||
          model.tags?.some((tag) => tag.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;

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
      <DialogContent
        showCloseButton={false}
        className="!flex !grid-cols-none max-w-[1100px] h-[82vh] bg-[#08080c] border border-white/[0.06] p-0 overflow-hidden shadow-2xl shadow-black/90 rounded-2xl gap-0"
      >
        {/* Accessibility: visually hidden title */}
        <DialogTitle className="sr-only">
          Select AI Model
        </DialogTitle>

        {showLocalAI ? (
          <div className="w-full h-full">
            <LocalAIChat onBack={() => setShowLocalAI(false)} />
          </div>
        ) : (
          <>
            {/* Subtle ambient gradient — no heavy blurs */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-cyan-950/10" />
            </div>

            {/* ─── LEFT SIDEBAR ─── */}
            <div className="w-60 shrink-0 bg-white/[0.02] border-r border-white/[0.05] flex flex-col z-10 relative">
              {/* Sidebar Header */}
              <div className="px-5 pt-5 pb-4 border-b border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      Model Hub
                    </h2>
                    <p className="text-[10px] text-white/30 leading-tight">
                      Choose your engine
                    </p>
                  </div>
                </div>
              </div>

              {/* Category List */}
              <div className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto custom-scrollbar min-h-0">
                {CATEGORIES.map((category) => {
                  const isSelected = selectedCategory === category.id;
                  const CategoryIcon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200 group relative ${isSelected
                        ? "bg-white/[0.08] text-white"
                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                        }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-400"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isSelected
                          ? "bg-white/[0.08]"
                          : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                          }`}
                      >
                        <CategoryIcon
                          className={`w-3.5 h-3.5 ${isSelected ? category.color : "text-white/40"}`}
                        />
                      </div>
                      <span className="text-[13px] font-medium truncate">
                        {category.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Local AI */}
              <div className="px-2.5 pb-2">
                <button
                  onClick={() => setShowLocalAI(true)}
                  className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200 text-blue-300/70 hover:text-blue-200 hover:bg-blue-500/[0.06] border border-transparent hover:border-blue-500/10"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/[0.08] flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium">Local AI</div>
                    <div className="text-[10px] opacity-50">Run Gemma 3 Offline</div>
                  </div>
                </button>
              </div>

              {/* Pro Tip */}
              <div className="px-3 pb-3 border-t border-white/[0.04] pt-3">
                <div className="px-3 py-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/[0.08]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Brain className="w-3 h-3 text-indigo-300/60" />
                    <span className="text-[10px] font-semibold text-indigo-200/60">
                      Pro Tip
                    </span>
                  </div>
                  <p className="text-[10px] text-indigo-200/40 leading-relaxed">
                    Press{" "}
                    <kbd className="bg-black/40 px-1 rounded text-white/60 text-[9px]">
                      ⌘K
                    </kbd>{" "}
                    for quick model switching.
                  </p>
                </div>
              </div>
            </div>

            {/* ─── MAIN CONTENT ─── */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
              {/* Search Header */}
              <div className="h-16 shrink-0 border-b border-white/[0.05] flex items-center px-5 gap-3 bg-white/[0.01]">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${selectedCategory !== "all" ? selectedCategory + " " : ""}models...`}
                    className="pl-9 h-9 bg-white/[0.03] border-white/[0.06] text-white text-sm placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[11px] text-white/35 tabular-nums">
                  <Filter className="w-3 h-3" />
                  <span>{filteredModels.length} models</span>
                </div>
              </div>

              {/* Model Grid */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-5 min-h-0">
                <motion.div
                  layout
                  className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredModels.map((model, index) => {
                      const isActive = currentActiveModelId === model.id;
                      const isHovered = hoveredModel === model.id;

                      return (
                        <motion.div
                          key={model.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{
                            duration: 0.3,
                            delay: Math.min(index * 0.015, 0.3),
                            ease: [0.23, 1, 0.32, 1],
                          }}
                          onClick={() => handleSelectModel(model.id)}
                          onMouseEnter={() => setHoveredModel(model.id)}
                          onMouseLeave={() => setHoveredModel(null)}
                          className={`relative group cursor-pointer rounded-2xl border transition-all duration-300 ${isActive
                            ? "bg-indigo-500/[0.08] border-indigo-500/30 ring-1 ring-indigo-500/10"
                            : "bg-white/[0.015] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.12]"
                            }`}
                        >
                          <div className="p-4 flex flex-col gap-3">
                            {/* Top: Icon + Name + Check */}
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isActive
                                  ? "bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20"
                                  : "bg-white/[0.04] text-white/60 border border-white/[0.06] group-hover:border-white/[0.12]"
                                  } ${isHovered && !isActive ? "scale-105" : ""}`}
                              >
                                <ModelIcon
                                  provider={model.provider}
                                  name={model.name}
                                  logoUrl={model.logo}
                                  className="w-6 h-6"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3
                                  className={`font-semibold text-[14px] leading-tight truncate transition-colors ${isActive
                                    ? "text-white"
                                    : "text-white/80 group-hover:text-white"
                                    }`}
                                >
                                  {model.name}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[11px] text-white/30">
                                    {model.provider}
                                  </span>
                                  {model.showcase && (
                                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                      <Star className="w-2 h-2 fill-amber-400" />
                                      Top
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${isActive
                                  ? "border-indigo-400 bg-indigo-500/20 text-indigo-300"
                                  : "border-white/[0.08] group-hover:border-white/20"
                                  }`}
                              >
                                {isActive && (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-[12px] text-white/35 line-clamp-2 leading-relaxed group-hover:text-white/50 transition-colors">
                              {model.description}
                            </p>

                            {/* Footer: Tags + Context Window */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.04]">
                              <div className="flex items-center gap-1 overflow-hidden">
                                {model.tags?.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] font-medium text-white/25 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.04] whitespace-nowrap"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              {model.contextWindow > 0 && (
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-cyan-400/50 bg-cyan-400/[0.04] px-2 py-0.5 rounded-md border border-cyan-400/[0.06] shrink-0 tabular-nums">
                                  <Cpu className="w-2.5 h-2.5" />
                                  {model.contextWindow >= 1000000
                                    ? `${(model.contextWindow / 1000000).toFixed(1)}M`
                                    : `${Math.round(model.contextWindow / 1000)}k`}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Hover indicator */}
                          <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                            <ChevronRight className="w-3.5 h-3.5 text-white/15" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>

                {filteredModels.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-white/15" />
                    </div>
                    <h3 className="text-white/80 font-medium text-sm mb-1">
                      No models found
                    </h3>
                    <p className="text-white/30 text-xs max-w-[240px]">
                      Try adjusting your search or category filters.
                    </p>
                    <Button
                      variant="link"
                      className="text-indigo-400 mt-2 text-xs"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
