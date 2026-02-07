import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle2, Sparkles, Zap, Brain, Cpu, ChevronRight, Search, X, Star, MessageSquare, Image as ImageIcon, Video, Music } from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import {
    AVAILABLE_MODELS,
    IMAGE_MODELS,
    VIDEO_MODELS,
    AUDIO_MODELS,
    Model
} from "@/lib/utils/model-utils";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { hapticFeedback } from "@/lib/mobile";
import { ModelIcon } from "@/components/models/ModelIcon";

interface MobileModelPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type?: "text" | "image" | "video" | "audio";
}

type ModelCategory = "all" | "fast" | "reasoning";

export function MobileModelPicker({ open, onOpenChange, type = "text" }: MobileModelPickerProps) {
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
    const [searchQuery, setSearchQuery] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const [activeMainCategory, setActiveMainCategory] = useState<string>("showcase");

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
        hapticFeedback('light');
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
                    ...AVAILABLE_MODELS.filter(m => m.showcase),
                    ...IMAGE_MODELS.filter(m => m.showcase),
                    ...VIDEO_MODELS.filter(m => m.showcase),
                    ...AUDIO_MODELS.filter(m => m.showcase),
                ];
            case "text": return AVAILABLE_MODELS;
            case "image": return IMAGE_MODELS;
            case "video": return VIDEO_MODELS;
            case "audio": return AUDIO_MODELS;
            default: return AVAILABLE_MODELS;
        }
    };

    const models = getModelsByCategory();

    // Filter models by search
    const filteredModels = searchQuery
        ? models.filter(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.provider.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : models;

    const currentActiveModel = type === "image" ? activeImageModel :
        type === "video" ? activeVideoModel :
            type === "audio" ? activeAudioModel :
                activeModel;

    // Apply sub-category filter (Fast/Smart) if selected
    // Note: "All" means no filter. 
    // We can interpret "Fast" as contextWindow < 100k perhaps, or just ignored for now as tags are better.
    // Actually, let's filter by tags if "fast" or "reasoning" is selected
    const getFinalFilteredModels = () => {
        let m = filteredModels;
        if (selectedCategory === "fast") {
            m = m.filter(model => model.tags?.some(t => t.toLowerCase().includes("fast")) || model.contextWindow < 20000);
        } else if (selectedCategory === "reasoning") {
            m = m.filter(model => model.tags?.some(t => t.toLowerCase().includes("reasoning") || t.toLowerCase().includes("smart") || t.toLowerCase().includes("complex")));
        }
        return m;
    };

    const finalModels = getFinalFilteredModels();

    const mainCategories = [
        { id: "showcase", label: "Showcase", icon: Star, color: "text-yellow-400" },
        { id: "text", label: "Text", icon: MessageSquare, color: "text-emerald-400" },
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
                className="h-[85vh] rounded-t-[2.5rem] bg-[#05050A]/95 backdrop-blur-3xl border-t border-white/5 p-0 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            >
                {/* Drag Handle */}
                <div className="flex justify-center pt-4 pb-2">
                    <div className="w-12 h-1.5 rounded-full bg-white/10" />
                </div>

                {/* Header */}
                <SheetHeader className="px-6 pb-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 ring-1 ring-white/10">
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
                            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/[0.03] border border-white/5 text-white placeholder:text-white/20 text-[16px] focus:outline-none focus:bg-white/[0.05] focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all shadow-inner"
                        />
                    </div>

                    {/* Main Categories (Tabs) */}
                    <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
                        {mainCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    hapticFeedback('light');
                                    setActiveMainCategory(cat.id);
                                    setSelectedCategory("all"); // Reset sub-filter
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeMainCategory === cat.id
                                    ? "bg-white/10 text-white border border-white/20"
                                    : "bg-white/5 text-white/50 border border-transparent"
                                    }`}
                            >
                                <cat.icon className={`w-3.5 h-3.5 ${activeMainCategory === cat.id ? cat.color : ""}`} />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Sub Category Chips */}
                    <div className="flex gap-2">
                        {subCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    hapticFeedback('light');
                                    setSelectedCategory(cat.id);
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${selectedCategory === cat.id
                                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
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
                                    transition={{ duration: 0.2, delay: index * 0.02 }}
                                    onClick={() => handleSelectModel(model)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] text-left ${isActive
                                        ? "bg-purple-500/10 border border-purple-500/30"
                                        : "bg-white/[0.02] border border-transparent active:bg-white/5"
                                        }`}
                                >
                                    {/* Model Icon */}
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isActive
                                        ? "bg-purple-500/20"
                                        : "bg-white/5"
                                        }`}>
                                        <ModelIcon provider={model.provider} name={model.name} />
                                    </div>

                                    {/* Model Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`font-semibold text-[15px] truncate ${isActive ? "text-white" : "text-white/85"
                                                }`}>
                                                {model.name}
                                            </span>
                                            {model.showcase && (
                                                <span className="px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-500 text-[9px] font-bold flex items-center gap-0.5">
                                                    <Star className="w-2.5 h-2.5 fill-yellow-500" />
                                                    TOP
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[13px] text-white/40 line-clamp-1 mb-1.5">
                                            {model.description}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-white/30 bg-white/5 px-2 py-0.5 rounded-md">
                                                {model.provider}
                                            </span>
                                            {model.contextWindow > 0 && (
                                                <span className="text-[11px] text-white/30 flex items-center gap-1">
                                                    <Zap className="w-3 h-3" />
                                                    {Math.round(model.contextWindow / 1000)}k
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Active Check */}
                                    {isActive && (
                                        <div className="shrink-0">
                                            <CheckCircle2 className="w-5 h-5 text-purple-400" />
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

                {/* View All Footer */}
                <div className="px-4 py-4 border-t border-white/5 bg-[#0a0a0f] safe-bottom">
                    <button
                        onClick={() => {
                            hapticFeedback('light');
                            onOpenChange(false);
                            useChatStore.getState().setModelBrowserOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white/[0.03] border border-white/5 text-white/60 font-medium active:scale-[0.98] transition-transform"
                    >
                        <span>Browse All Models</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
