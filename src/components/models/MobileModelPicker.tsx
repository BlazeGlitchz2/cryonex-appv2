import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CheckCircle2,
  Sparkles,
  Zap,
  Brain,
  Cpu,
  ChevronRight,
  Search,
  X,
  Star,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Music,
} from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import {
  AVAILABLE_MODELS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
  Model,
} from "@/lib/utils/model-utils";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { hapticFeedback } from "@/lib/mobile";
import { ModelIcon } from "@/components/models/ModelIcon";
import { LocalAIChat } from "@/components/LocalAIChat";

interface MobileModelPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "text" | "image" | "video" | "audio";
}

type ModelCategory = "all" | "fast" | "reasoning";

export function MobileModelPicker({
  open,
  onOpenChange,
  type = "text",
}: MobileModelPickerProps) {
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

  const [selectedCategory, setSelectedCategory] =
    useState<ModelCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLocalAI, setShowLocalAI] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeMainCategory, setActiveMainCategory] =
    useState<string>("showcase");

  // Sync active category with type prop on open
  useEffect(() => {
    if (open) {
      if (type === "image") setActiveMainCategory("image");
      else if (type === "video") setActiveMainCategory("video");
      else if (type === "audio") setActiveMainCategory("audio");
      else setActiveMainCategory("showcase"); // Default to showcase for text
    }
  }, [open, type]);

  const handleSelectModel = (model: Model) => {
    hapticFeedback("light");
    if (model.isImage) setActiveImageModel(model.id);
    else if (model.isVideo) setActiveVideoModel(model.id);
    else if (model.isAudio) setActiveAudioModel(model.id);
    else setActiveModel(model.id);

    onOpenChange(false);
  };

  const getModelsByCategory = () => {
    switch (activeMainCategory) {
      case "showcase":
        return [
          ...AVAILABLE_MODELS.filter((m) => m.showcase),
          ...IMAGE_MODELS.filter((m) => m.showcase),
          ...VIDEO_MODELS.filter((m) => m.showcase),
          ...AUDIO_MODELS.filter((m) => m.showcase),
        ];
      case "text":
        return AVAILABLE_MODELS;
      case "image":
        return IMAGE_MODELS;
      case "video":
        return VIDEO_MODELS;
      case "audio":
        return AUDIO_MODELS;
      default:
        return AVAILABLE_MODELS;
    }
  };

  const models = getModelsByCategory();

  // Filter models by search
  const filteredModels = searchQuery
    ? models.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : models;

  const currentActiveModel =
    type === "image"
      ? activeImageModel
      : type === "video"
        ? activeVideoModel
        : type === "audio"
          ? activeAudioModel
          : activeModel;

  // Apply sub-category filter (Fast/Smart) if selected
  // Note: "All" means no filter.
  // We can interpret "Fast" as contextWindow < 100k perhaps, or just ignored for now as tags are better.
  // Actually, let's filter by tags if "fast" or "reasoning" is selected
  const getFinalFilteredModels = () => {
    let m = filteredModels;
    if (selectedCategory === "fast") {
      m = m.filter(
        (model) =>
          model.tags?.some((t) => t.toLowerCase().includes("fast")) ||
          model.contextWindow < 20000,
      );
    } else if (selectedCategory === "reasoning") {
      m = m.filter((model) =>
        model.tags?.some(
          (t) =>
            t.toLowerCase().includes("reasoning") ||
            t.toLowerCase().includes("smart") ||
            t.toLowerCase().includes("complex"),
        ),
      );
    }
    return m;
  };

  const finalModels = getFinalFilteredModels();

  const mainCategories = [
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

  const subCategories = [
    { id: "all" as ModelCategory, label: "All", icon: Brain },
    { id: "fast" as ModelCategory, label: "Fast", icon: Zap },
    { id: "reasoning" as ModelCategory, label: "Smart", icon: Cpu },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-[2.5rem] bg-[#05050A]/95 backdrop-blur-3xl border-t border-white/5 p-0 flex flex-col"
      >
        {showLocalAI ? (
          <div className="flex-1 h-full overflow-hidden rounded-t-[2.5rem]">
            <LocalAIChat onBack={() => setShowLocalAI(false)} />
          </div>
        ) : (
          <>
            {/* Drag Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-white/10" />
            </div>

            {/* Header */}
            <SheetHeader className="px-6 pb-6 space-y-5">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                    Models
                  </span>
                </SheetTitle>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center active:scale-95 transition-all border border-white/5"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find a model..."
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/[0.03] border border-white/5 text-white placeholder:text-white/20 text-[16px] focus:outline-none focus:bg-white/[0.05] focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all"
                />
              </div>

              {/* Main Categories (Tabs) */}
              <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
                {mainCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      hapticFeedback("light");
                      setActiveMainCategory(cat.id);
                      setSelectedCategory("all"); // Reset sub-filter
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeMainCategory === cat.id
                      ? "bg-white/10 text-white border border-white/20"
                      : "bg-white/5 text-white/50 border border-transparent"
                      }`}
                  >
                    <cat.icon
                      className={`w-3.5 h-3.5 ${activeMainCategory === cat.id ? cat.color : ""}`}
                    />
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sub Category Chips */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    hapticFeedback("medium");
                    setShowLocalAI(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  Gemma 3
                </button>

                {subCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      hapticFeedback("light");
                      setSelectedCategory(cat.id);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${selectedCategory === cat.id
                      ? "bg-purple-500 text-white"
                      : "bg-white/[0.03] text-white/50 border border-white/5"
                      }`}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </SheetHeader>

            {/* Models List */}
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto px-4 pb-8 space-y-2 overscroll-contain mobile-scroll-hidden"
            >
              <AnimatePresence mode="popLayout">
                {finalModels.map((model, index) => {
                  const isActive = currentActiveModel === model.id;

                  return (
                    <motion.button
                      key={model.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      onClick={() => {
                        hapticFeedback("medium");
                        handleSelectModel(model);
                      }}
                      className={`w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all active:scale-[0.97] text-left border ${isActive
                        ? "bg-purple-500/10 border-purple-500/40"
                        : "bg-white/[0.03] border-white/5 active:bg-white/10"
                        }`}
                    >
                      {/* Model Icon */}
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 ${isActive ? "scale-105 bg-purple-500" : "bg-white/10 border border-white/5"
                          }`}
                      >
                        <ModelIcon
                          provider={model.provider}
                          name={model.name}
                          logoUrl={model.logo}
                          className="w-8 h-8"
                        />
                      </div>

                      {/* Model Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[15px] font-bold line-clamp-2 leading-tight ${isActive ? "text-white" : "text-white/90"}`}>
                            {model.name}
                          </span>
                          {model.showcase && (
                            <div className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[8px] font-black uppercase tracking-tighter">
                              Top
                            </div>
                          )}
                        </div>
                        <p className="text-[12px] text-white/40 line-clamp-1 mb-2 leading-tight">
                          {model.description}
                        </p>
                        <div className="flex items-center gap-3">

                          {model.contextWindow > 0 && (
                            <span className="text-[10px] text-cyan-400/60 flex items-center gap-1 font-bold">
                              <Cpu className="w-3 h-3" />
                              {model.contextWindow >= 1000000
                                ? `${(model.contextWindow / 1000000).toFixed(1)}M`
                                : `${Math.round(model.contextWindow / 1000)}k`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Active Check */}
                      {isActive && (
                        <div className="shrink-0">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-purple-400" />
                          </div>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>

              {finalModels.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-white/30">
                  <Search className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No models found</p>
                </div>
              )}
            </div>


          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
