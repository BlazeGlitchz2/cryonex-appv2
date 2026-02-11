import {
  Dialog,
  DialogContent,
  DialogHeader,
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
  LayoutGrid,
  Code,
  Crown,
  Filter,
} from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import {
  AVAILABLE_MODELS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
  Model,
  CATEGORIES,
  CategoryId,
} from "@/lib/utils/model-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileModelPicker } from "./MobileModelPicker";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModelIcon } from "@/components/models/ModelIcon";
import { cn } from "@/lib/utils";

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

        // Exact category matching based on tags or specialized logic
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
          return (
            model.tags?.some((t) =>
              ["Fast", "Turbo", "Flash", "Instant"].some((k) =>
                t.includes(k),
              ),
            ) ||
            model.name.toLowerCase().includes("fast") ||
            model.name.toLowerCase().includes("flash") ||
            model.name.toLowerCase().includes("turbo")
          );

        if (selectedCategory === "free")
          return (
            model.tags?.some((t) => ["Free"].some((k) => t.includes(k))) ||
            model.contextWindow === 0
          );

        return true;
      })
      .sort((a, b) => {
        // Custom Sorting: Showcase first
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
      <DialogContent className="max-w-[70rem] h-[85vh] p-0 gap-0 bg-[#0a0a0a] border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row">

        {/* SIDEBAR */}
        <div className="w-full md:w-64 bg-black/40 border-b md:border-b-0 md:border-r border-white/5 flex flex-col shrink-0 z-20 backdrop-blur-xl">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 ring-1 ring-white/10">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-none">Models</h2>
                <p className="text-xs text-white/40 mt-1">Select your engine</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 group relative overflow-hidden",
                    selectedCategory === category.id
                      ? "bg-white/10 text-white shadow-inner ring-1 ring-white/5"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div
                    className={cn(
                      "relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                      selectedCategory === category.id
                        ? "bg-white/10"
                        : "bg-white/5 group-hover:bg-white/10"
                    )}
                  >
                    <category.icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        selectedCategory === category.id ? category.color : "text-white/50 group-hover:text-white"
                      )}
                    />
                  </div>
                  <div className="flex-1 relative z-10">
                    <div className="text-sm font-medium">{category.label}</div>
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
          </ScrollArea>

          <div className="p-4 mt-auto border-t border-white/5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/20 relative overflow-hidden group">
              <div className="relative z-10 flex items-start gap-3">
                <div className="mt-0.5">
                  <Brain className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-purple-100 mb-0.5">Pro Tip</div>
                  <p className="text-[10px] text-purple-200/70 leading-relaxed">
                    Press <kbd className="bg-black/30 px-1 rounded text-white font-sans">K</kbd> to open command palette.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-h-0 relative z-10 bg-gradient-to-br from-[#0a0a0a] to-[#121212]">

          {/* Header & Search */}
          <div className="h-20 border-b border-white/5 flex items-center px-6 gap-6 bg-white/[0.02] shrink-0">
            <div className="relative flex-1 max-w-lg group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-400 transition-colors" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${selectedCategory === 'all' ? '' : selectedCategory + ' '}models...`}
                className="pl-10 h-11 bg-black/20 border-white/5 text-white placeholder:text-white/20 focus-visible:ring-purple-500/50 rounded-xl transition-all hover:bg-black/30 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-white/50 flex items-center gap-2">
                <Filter className="w-3 h-3" />
                {filteredModels.length} Models
              </div>
            </div>
          </div>

          {/* Scrollable Grid */}
          <ScrollArea className="flex-1 p-0">
            <div className="p-6 md:p-8">
              <motion.div
                layout
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-10"
              >
                <AnimatePresence mode="popLayout">
                  {filteredModels.map((model, index) => {
                    const isActive = currentActiveModelId === model.id;
                    const isHovered = hoveredModel === model.id;

                    return (
                      <motion.div
                        key={model.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        onClick={() => handleSelectModel(model.id)}
                        onMouseEnter={() => setHoveredModel(model.id)}
                        onMouseLeave={() => setHoveredModel(null)}
                        className={cn(
                          "relative group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col",
                          isActive
                            ? "bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/20"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-xl hover:-translate-y-0.5"
                        )}
                      >
                        <div className="p-4 flex gap-4 items-start">
                          {/* Icon */}
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500",
                            isActive
                              ? "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30 text-white scale-105"
                              : "bg-white/5 border border-white/5 text-white/60 group-hover:scale-110 group-hover:text-white"
                          )}>
                            <ModelIcon
                              provider={model.provider}
                              name={model.name}
                              logoUrl={model.logo}
                              className="w-6 h-6"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className={cn(
                                    "text-sm font-bold leading-tight transition-colors",
                                    isActive ? "text-white" : "text-white/90 group-hover:text-white"
                                  )}>
                                    {model.name}
                                  </h3>
                                  {model.showcase && (
                                    <span className="px-1.5 py-0.5 rounded-[4px] bg-amber-500/90 text-[9px] font-black text-black uppercase tracking-wider shadow-sm shadow-amber-500/20">
                                      TOP
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-white/50 mt-1 line-clamp-2 leading-relaxed group-hover:text-white/70 transition-colors">
                                  {model.description}
                                </p>
                              </div>

                              {isActive && (
                                <div className="shrink-0">
                                  <CheckCircle2 className="w-5 h-5 text-purple-400 fill-purple-400/10" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Footer Tags */}
                        <div className="mt-auto px-4 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 overflow-hidden fade-mask-r">
                            {model.tags?.slice(0, 3).map(tag => (
                              <div key={tag} className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-medium text-white/40 whitespace-nowrap">
                                {tag}
                              </div>
                            ))}
                          </div>

                          {model.contextWindow > 0 && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-cyan-400/80 shrink-0">
                              <Cpu className="w-3 h-3" />
                              {model.contextWindow >= 1000000
                                ? `${(model.contextWindow / 1000000).toFixed(0)}M`
                                : `${Math.round(model.contextWindow / 1000)}k`}
                            </div>
                          )}
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 border-2 border-purple-500/0 rounded-2xl group-hover:border-purple-500/10 transition-all pointer-events-none" />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              {filteredModels.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-white/20" />
                  </div>
                  <h3 className="text-white font-medium mb-1">No models found</h3>
                  <p className="text-white/40 text-sm max-w-xs mx-auto">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <Button
                    variant="link"
                    className="text-purple-400 mt-2"
                    onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
