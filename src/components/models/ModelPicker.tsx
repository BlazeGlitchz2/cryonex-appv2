import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  // const [showLocalAI, setShowLocalAI] = useState(false); // Removed
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
      // setShowLocalAI(false); // Removed
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

  const matchesCategory = (model: Model, category: CategoryId) => {
    if (category === "all") return true;
    if (category === "premium") {
      return !!(model.showcase || model.tags?.includes("Premium"));
    }
    if (category === "reasoning") {
      return !!model.tags?.some((t) =>
        ["Reasoning", "Smart", "Complex", "DeepSeek", "Thinking"].some((k) =>
          t.includes(k),
        ),
      );
    }
    if (category === "coding") {
      return !!model.tags?.some((t) =>
        ["Coding", "Code", "Dev", "Programming"].some((k) => t.includes(k)),
      );
    }
    if (category === "fast") {
      return !!model.tags?.some((t) =>
        ["Fast", "Turbo", "Flash", "Instant"].some((k) => t.includes(k)),
      );
    }
    if (category === "free") {
      return (
        !!model.tags?.some((t) => ["Free"].some((k) => t.includes(k))) ||
        model.contextWindow === 0
      );
    }

    return true;
  };

  const categoryCounts = useMemo(() => {
    return CATEGORIES.reduce(
      (acc, category) => {
        acc[category.id] = baseModels.filter((model) =>
          matchesCategory(model, category.id),
        ).length;
        return acc;
      },
      {} as Record<CategoryId, number>,
    );
  }, [baseModels]);

  const filteredModels = useMemo(() => {
    return baseModels
      .filter((model) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          model.name.toLowerCase().includes(searchLower) ||
          model.provider.toLowerCase().includes(searchLower) ||
          model.tags?.some((tag) => tag.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
        return matchesCategory(model, selectedCategory);
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

  const activeModelMeta = useMemo(
    () => baseModels.find((model) => model.id === currentActiveModelId) ?? null,
    [baseModels, currentActiveModelId],
  );

  const selectedCategoryMeta = CATEGORIES.find(
    (category) => category.id === selectedCategory,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="fixed left-1/2 top-[max(3.5rem,6vh)] !flex !grid-cols-none w-[min(1180px,calc(100vw-2rem))] max-w-none translate-x-[-50%] translate-y-0 gap-0 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#09090f] p-0 shadow-[0_32px_120px_rgba(0,0,0,0.72)] sm:max-w-none h-[min(76vh,720px)] max-h-[calc(100vh-5rem)] z-[100]"
      >
        {/* Accessibility: visually hidden title */}
        <DialogTitle className="sr-only">
          Select AI Model
        </DialogTitle>
        <DialogDescription className="sr-only">
          Browse and switch between available AI models.
        </DialogDescription>

        <>
          {/* Ambient frame */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.18),transparent_22%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
            <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle,rgba(255,255,255,0.9)_1px,transparent_1.2px)] [background-size:20px_20px]" />
          </div>

          {/* ─── LEFT SIDEBAR ─── */}
          <div className="relative z-10 flex w-[272px] shrink-0 flex-col border-r border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,18,27,0.98),rgba(11,11,17,0.94))]">
            {/* Sidebar Header */}
            <div className="border-b border-white/[0.06] px-5 pb-5 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_12px_32px_rgba(99,102,241,0.38)]">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
                    Model Browser
                  </p>
                  <h2 className="truncate text-base font-semibold tracking-tight text-white">
                    Model Hub
                  </h2>
                  <p className="text-[11px] leading-tight text-white/38">
                    Choose your engine
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.08] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-200/55">
                  Current Model
                </p>
                <div className="mt-2 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/75">
                    {activeModelMeta ? (
                      <ModelIcon
                        provider={activeModelMeta.provider}
                        name={activeModelMeta.name}
                        logoUrl={activeModelMeta.logo}
                        className="h-5 w-5"
                      />
                    ) : (
                      <Cpu className="h-4.5 w-4.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {activeModelMeta?.name ?? "No model selected"}
                    </p>
                    <p className="truncate text-[11px] text-white/42">
                      {activeModelMeta?.provider ?? "Workspace default"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category List */}
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3 custom-scrollbar">
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category.id;
                const CategoryIcon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group relative w-full rounded-2xl px-3 py-3 text-left transition-all duration-200 ${isSelected
                      ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      : "text-white/55 hover:bg-white/[0.04] hover:text-white/85"
                      }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-2xl border border-indigo-400/20"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${isSelected
                          ? "bg-white/[0.08]"
                          : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                          }`}
                      >
                        <CategoryIcon
                          className={`h-4 w-4 ${isSelected ? category.color : "text-white/40"}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13px] font-medium">
                            {category.label}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/40">
                            {categoryCounts[category.id]}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[11px] text-white/30">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-white/[0.05] px-3 pb-3 pt-3">
              <div className="rounded-2xl border border-indigo-500/[0.08] bg-indigo-950/30 px-3 py-3">
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
          <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
            {/* Search Header */}
            <div className="shrink-0 border-b border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] px-6 pb-5 pt-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/34">
                    Workspace Routing
                  </p>
                  <h3 className="mt-1 text-[22px] font-semibold tracking-tight text-white">
                    Pick the right model for this message
                  </h3>
                  <p className="mt-1 text-sm text-white/42">
                    {selectedCategoryMeta?.description ?? "Browse all available models."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white"
                  aria-label="Close model browser"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-3">
                <div className="relative min-w-0">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${selectedCategory !== "all" ? selectedCategory + " " : ""}models...`}
                    className="h-12 rounded-2xl border-white/[0.08] bg-white/[0.04] pl-10 text-sm text-white placeholder:text-white/22 focus-visible:ring-1 focus-visible:ring-indigo-500/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                    <Filter className="h-3 w-3" />
                    Results
                  </div>
                  <p className="mt-1 text-sm font-medium text-white">
                    {filteredModels.length} models
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                    Active
                  </div>
                  <p className="mt-1 max-w-[180px] truncate text-sm font-medium text-white">
                    {activeModelMeta?.name ?? "Auto"}
                  </p>
                </div>
              </div>
            </div>

            {/* Model Grid */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              <motion.div
                layout
                className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4"
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
                        className={`relative group cursor-pointer overflow-hidden rounded-[24px] border transition-all duration-300 ${isActive
                          ? "border-indigo-400/30 bg-[linear-gradient(180deg,rgba(99,102,241,0.16),rgba(14,16,26,0.92))] ring-1 ring-indigo-400/12 shadow-[0_18px_44px_rgba(79,70,229,0.18)]"
                          : "border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] hover:border-white/[0.14] hover:bg-white/[0.05]"
                          }`}
                      >
                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.09),transparent_28%)] opacity-60" />

                        <div className="relative flex flex-col gap-3 p-4">
                          {/* Top: Icon + Name + Check */}
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${isActive
                                ? "bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white shadow-[0_12px_32px_rgba(99,102,241,0.28)]"
                                : "border border-white/[0.06] bg-white/[0.04] text-white/60 group-hover:border-white/[0.12]"
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
                                className={`truncate text-[14px] font-semibold leading-tight transition-colors ${isActive
                                  ? "text-white"
                                  : "text-white/80 group-hover:text-white"
                                  }`}
                              >
                                {model.name}
                              </h3>
                              <div className="mt-0.5 flex items-center gap-1.5">
                                <span className="text-[11px] text-white/30">
                                  {model.provider}
                                </span>
                                {model.showcase && (
                                  <span className="flex items-center gap-0.5 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                                    <Star className="h-2 w-2 fill-amber-400" />
                                    Top
                                  </span>
                                )}
                              </div>
                            </div>

                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${isActive
                                ? "border-indigo-400 bg-indigo-500/20 text-indigo-300"
                                : "border-white/[0.08] group-hover:border-white/20"
                                }`}
                            >
                              {isActive && (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="line-clamp-2 text-[12px] leading-relaxed text-white/38 transition-colors group-hover:text-white/55">
                            {model.description}
                          </p>

                          {/* Footer: Tags + Context Window */}
                          <div className="flex items-center justify-between gap-2 border-t border-white/[0.05] pt-2">
                            <div className="flex items-center gap-1 overflow-hidden">
                              {model.tags?.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="whitespace-nowrap rounded-md border border-white/[0.04] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-white/25"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {model.contextWindow > 0 && (
                              <span className="flex shrink-0 items-center gap-1 rounded-md border border-cyan-400/[0.08] bg-cyan-400/[0.04] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-cyan-400/60">
                                <Cpu className="h-2.5 w-2.5" />
                                {model.contextWindow >= 1000000
                                  ? `${(model.contextWindow / 1000000).toFixed(1)}M`
                                  : `${Math.round(model.contextWindow / 1000)}k`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Hover indicator */}
                        <div className="absolute right-3 top-1/2 translate-x-1 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                          <ChevronRight className="h-3.5 w-3.5 text-white/15" />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              {filteredModels.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.03]">
                    <Search className="h-6 w-6 text-white/15" />
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
      </DialogContent>
    </Dialog>
  );
}
