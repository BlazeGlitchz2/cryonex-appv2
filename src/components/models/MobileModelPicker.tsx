import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle2, Sparkles, Zap, Brain, Cpu, ChevronRight, Search, X, Star } from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import {
    AVAILABLE_MODELS,
    IMAGE_MODELS,
    VIDEO_MODELS,
    AUDIO_MODELS,
} from "@/lib/utils/model-utils";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { hapticFeedback } from "@/lib/mobile";

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

    const handleSelectModel = (modelId: string) => {
        hapticFeedback('light');
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

    const categories = [
        { id: "all" as ModelCategory, label: "All", icon: Brain },
        { id: "fast" as ModelCategory, label: "Fast", icon: Zap },
        { id: "reasoning" as ModelCategory, label: "Smart", icon: Cpu },
    ];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="h-[85vh] rounded-t-[2rem] bg-[#0a0a0f] border-t border-white/5 p-0 flex flex-col"
            >
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1 rounded-full bg-white/15" />
                </div>

                {/* Header */}
                <SheetHeader className="px-5 pb-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            Models
                        </SheetTitle>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <X className="w-5 h-5 text-white/50" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search models..."
                            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/[0.03] border border-white/5 text-white placeholder:text-white/25 text-[16px] focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all"
                        />
                    </div>

                    {/* Category Chips */}
                    <div className="flex gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    hapticFeedback('light');
                                    setSelectedCategory(cat.id);
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${selectedCategory === cat.id
                                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                                    : "bg-white/[0.03] text-white/50 border border-white/5"
                                    }`}
                            >
                                <cat.icon className="w-4 h-4" />
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
                        {filteredModels.map((model, index) => {
                            const isActive = currentActiveModel === model.id;
                            return (
                                <motion.button
                                    key={model.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: index * 0.02 }}
                                    onClick={() => handleSelectModel(model.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] text-left ${isActive
                                        ? "bg-purple-500/10 border border-purple-500/30"
                                        : "bg-white/[0.02] border border-transparent active:bg-white/5"
                                        }`}
                                >
                                    {/* Model Icon */}
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isActive
                                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                                        : "bg-white/5 text-white/40"
                                        }`}>
                                        <Sparkles className="w-5 h-5" />
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
                                            <span className="text-[11px] text-white/30 flex items-center gap-1">
                                                <Zap className="w-3 h-3" />
                                                {Math.round(model.contextWindow / 1000)}k
                                            </span>
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

                    {filteredModels.length === 0 && (
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
