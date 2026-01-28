import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
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
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AVAILABLE_MODELS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
  Model
} from "@/lib/utils/model-utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ModelBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Simple SVG Icons for Models
const ModelIcon = ({ provider, name }: { provider: string, name: string }) => {
  const p = provider.toLowerCase();
  const n = name.toLowerCase();

  if (p.includes("openai") || n.includes("gpt")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-400">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9891 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a1.54 1.54 0 0 1 .7279 1.3161v5.3832a4.4814 4.4814 0 0 1-5.1844 3.4301zM23 14.2251a4.4717 4.4717 0 0 1-3.3522 1.8533v-5.6514l-.0115-.0224-4.739-2.7348 2.9396-1.6974a1.5603 1.5603 0 0 1 1.5824.0369l4.6833 2.7065a1.5459 1.5459 0 0 1 .7829 1.3354v2.8158a4.4643 4.4643 0 0 1-1.8855 1.3571zm-1.8657-8.1198-4.7926 2.7666V12.49a.7899.7899 0 0 0 .3927.6813l5.8333 3.3685.0276.0161a4.4872 4.4872 0 0 1-1.1178 2.8657 4.452 4.452 0 0 1-4.2877 1.1286V13.46a1.5453 1.5453 0 0 1-.7733-1.3354V9.3082l4.6833-2.7065a1.5416 1.5416 0 0 1 .0344-.0203zm-10.2362-.7027 2.0386-1.1768 4.7926 2.7666-2.9492 1.7028a1.5558 1.5558 0 0 1-1.5728-.0323l-4.6737-2.7118a1.54 1.54 0 0 1-.7925-1.3301V6.3205a4.489 4.489 0 0 1 3.157-2.3174zM4.1099 6.8325a4.4852 4.4852 0 0 1 3.0918-1.4572v5.6514l.0115.0224 4.739 2.7348-2.9396 1.6974a1.5603 1.5603 0 0 1-1.5824-.0369l-4.6833-2.7065a1.5459 1.5459 0 0 1-.7829-1.3354V8.5866A4.4643 4.4643 0 0 1 4.1099 6.8325zm-1.5504 7.3475.0276-.0161 5.8333-3.3685a.7899.7899 0 0 0 .3927-.6813V3.4003a4.4872 4.4872 0 0 1 1.1178-2.8657 4.452 4.452 0 0 1 4.2877-1.1286v7.0903a1.5453 1.5453 0 0 1 .7733 1.3354v2.8158l-4.6833 2.7065a1.5416 1.5416 0 0 1-.0344.0203l-2.0386 1.1768a4.4755 4.4755 0 0 1-5.6761-2.3684zm12.0358 6.5733-2.0386 1.1768-4.7926-2.7666 2.9492-1.7028a1.5558 1.5558 0 0 1 1.5728.0323l4.6737 2.7118a1.54 1.54 0 0 1 .7925 1.3301v2.1926a4.489 4.489 0 0 1-3.157 2.3174z" />
      </svg>
    );
  }

  if (p.includes("anthropic") || n.includes("claude")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-400">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
      </svg>
    );
  }

  if (p.includes("google") || n.includes("gemini") || n.includes("gemma")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-400">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    );
  }

  if (p.includes("meta") || n.includes("llama")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-500">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
      </svg>
    );
  }

  if (p.includes("mistral") || n.includes("mistral") || n.includes("mixtral")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.95 1.477 2.95-1.477L12 14.09l-5.9-3.09L12 11zm0 3.82L2 10v7l10 5 10-5v-7l-10 4.82z" />
      </svg>
    )
  }

  if (n.includes("deepseek")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2zm0-10h2v6h-2z" />
      </svg>
    );
  }

  if (n.includes("qwen")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-600">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
      </svg>
    );
  }

  if (n.includes("glm")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-purple-500">
        <path d="M12 2L2 22h20L12 2zm0 4l6 12H6l6-12z" />
      </svg>
    );
  }

  if (n.includes("kimi")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-pink-500">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
      </svg>
    );
  }

  if (p.includes("sambanova")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-600">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M6 12h12" stroke="black" strokeWidth="2" />
      </svg>
    );
  }

  if (p.includes("bytez")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-500">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.95 1.477 2.95-1.477L12 14.09l-5.9-3.09L12 11zm0 3.82L2 10v7l10 5 10-5v-7l-10 4.82z" />
      </svg>
    );
  }

  return <Bot className="w-5 h-5 text-muted-foreground" />;
}

const ModelBrowserContent = ({
  onOpenChange
}: {
  onOpenChange: (open: boolean) => void
}) => {
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

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("showcase");

  const categories = [
    { id: "showcase", label: "Showcase", icon: Star, color: "text-yellow-400" },
    { id: "text", label: "Text", icon: MessageSquare, color: "text-emerald-400" },
    { id: "image", label: "Image", icon: ImageIcon, color: "text-purple-400" },
    { id: "video", label: "Video", icon: Video, color: "text-blue-400" },
    { id: "audio", label: "Audio", icon: Music, color: "text-orange-400" },
  ];

  const getFilteredModels = () => {
    let models: Model[] = [];

    switch (activeCategory) {
      case "showcase":
        models = [
          ...AVAILABLE_MODELS.filter(m => m.showcase),
          ...IMAGE_MODELS.filter(m => m.showcase),
          ...VIDEO_MODELS.filter(m => m.showcase),
          ...AUDIO_MODELS.filter(m => m.showcase),
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
      models = models.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return models;
  };

  const filteredModels = useMemo(() => getFilteredModels(), [searchQuery, activeCategory]);

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
    <>
      {/* Mobile Header with Search */}
      <div className="flex sm:hidden flex-col border-b border-white/5 bg-black/40 safe-top">
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
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${activeCategory === cat.id
                ? "bg-white/10 text-white border border-white/20"
                : "bg-white/5 text-white/60 border border-transparent hover:bg-white/10"
                }`}
            >
              <cat.icon className={`w-3.5 h-3.5 ${activeCategory === cat.id ? cat.color : "opacity-60"}`} />
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
            <p className="text-xs text-white/40 mt-1">Select the perfect AI for your task</p>
          </div>

          <div className="p-3 space-y-1 flex-1 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeCategory === cat.id
                  ? "bg-white/10 text-white shadow-lg shadow-black/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? cat.color : "opacity-50"}`} />
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
              {/* Desktop Header */}
              <div className="hidden sm:block mb-6">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {categories.find(c => c.id === activeCategory)?.label}
                </h3>
                <p className="text-white/50 text-sm">
                  {filteredModels.length} models available
                </p>
              </div>

              {/* Mobile Model Count */}
              <div className="flex sm:hidden mb-4">
                <span className="text-xs text-white/40">
                  {filteredModels.length} {categories.find(c => c.id === activeCategory)?.label} available
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
                      className={`group relative flex flex-col p-4 sm:p-5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all duration-300 active:scale-[0.98] sm:hover:-translate-y-1 overflow-hidden ${isModelActive(model)
                        ? "bg-white/10 border-primary/50 ring-1 ring-primary/30 shadow-xl shadow-primary/10"
                        : "bg-black/40 border-white/5 hover:border-white/10 hover:bg-white/5 hover:shadow-lg hover:shadow-black/40"
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-white/5 ${isModelActive(model) ? "bg-primary/20" : "bg-white/5 group-hover:bg-white/10"
                          }`}>
                          <ModelIcon provider={model.provider} name={model.name} />
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
                        <Badge variant="outline" className="bg-white/5 border-white/5 text-white/50 text-[9px] sm:text-[10px] h-5 px-1.5 hover:bg-white/10">
                          {model.provider}
                        </Badge>
                        {model.contextWindow > 0 && (
                          <Badge variant="outline" className="bg-white/5 border-white/5 text-white/50 text-[9px] sm:text-[10px] h-5 px-1.5 hover:bg-white/10">
                            {Math.round(model.contextWindow / 1000)}k ctx
                          </Badge>
                        )}
                        {model.tags?.slice(0, 1).map(tag => (
                          <Badge key={tag} variant="outline" className="bg-white/5 border-white/5 text-white/50 text-[9px] sm:text-[10px] h-5 px-1.5 hover:bg-white/10 hidden sm:flex">
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
    </>
  );
};

export function ModelBrowser({ open, onOpenChange }: ModelBrowserProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[95vh] bg-[#0a0a0a] border-t border-white/10 rounded-t-[2rem]">
          <div className="flex flex-col h-full bg-[#0a0a0a]">
            {/* Header Handle - specific to drawer */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/10 mt-4 mb-2" />

            <div className="flex-1 min-h-0 relative">
              <ModelBrowserContent onOpenChange={onOpenChange} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
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