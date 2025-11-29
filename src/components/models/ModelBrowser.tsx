import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChatStore } from "@/lib/stores/chat-store";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo } from "react";
import { Search, Sparkles, Image as ImageIcon, Video, CheckCircle2, Lock, Zap, MessageSquare, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  AVAILABLE_MODELS, 
  IMAGE_MODELS, 
  VIDEO_MODELS, 
  Model,
  ModelProvider,
  getModelDisplayMeta
} from "@/lib/utils/model-utils";

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
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9891 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a1.54 1.54 0 0 1 .7279 1.3161v5.3832a4.4814 4.4814 0 0 1-5.1844 3.4301zM23 14.2251a4.4717 4.4717 0 0 1-3.3522 1.8533v-5.6514l-.0115-.0224-4.739-2.7348 2.9396-1.6974a1.5603 1.5603 0 0 1 1.5824.0369l4.6833 2.7065a1.5459 1.5459 0 0 1 .7829 1.3354v2.8158a4.4643 4.4643 0 0 1-1.8855 1.3571zm-1.8657-8.1198-4.7926 2.7666V12.49a.7899.7899 0 0 0 .3927.6813l5.8333 3.3685.0276.0161a4.4872 4.4872 0 0 1-1.1178 2.8657 4.452 4.452 0 0 1-4.2877 1.1286V13.46a1.5453 1.5453 0 0 1-.7733-1.3354V9.3082l4.6833-2.7065a1.5416 1.5416 0 0 1 .0344-.0203zm-10.2362-.7027 2.0386-1.1768 4.7926 2.7666-2.9492 1.7028a1.5558 1.5558 0 0 1-1.5728-.0323l-4.6737-2.7118a1.54 1.54 0 0 1-.7925-1.3301V6.3205a4.489 4.489 0 0 1 3.157-2.3174zM4.1099 6.8325a4.4852 4.4852 0 0 1 3.0918-1.4572v5.6514l.0115.0224 4.739 2.7348-2.9396 1.6974a1.5603 1.5603 0 0 1-1.5824-.0369l-4.6833-2.7065a1.5459 1.5459 0 0 1-.7829-1.3354V8.5866A4.4643 4.4643 0 0 1 4.1099 6.8325zm-1.5504 7.3475.0276-.0161 5.8333-3.3685a.7899.7899 0 0 0 .3927-.6813V3.4003a4.4872 4.4872 0 0 1 1.1178-2.8657 4.452 4.452 0 0 1 4.2877-1.1286v7.0903a1.5453 1.5453 0 0 1 .7733 1.3354v2.8158l-4.6833 2.7065a1.5416 1.5416 0 0 1-.0344.0203l-2.0386 1.1768a4.4755 4.4755 0 0 1-5.6761-2.3684zm12.0358 6.5733-2.0386 1.1768-4.7926-2.7666 2.9492-1.7028a1.5558 1.5558 0 0 1 1.5728.0323l4.6737 2.7118a1.54 1.54 0 0 1 .7925 1.3301v2.1926a4.489 4.489 0 0 1-3.157 2.3174z"/>
      </svg>
    );
  }

  if (p.includes("anthropic") || n.includes("claude")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-400">
         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
    );
  }

  if (p.includes("google") || n.includes("gemini") || n.includes("gemma")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-400">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    );
  }

  if (p.includes("meta") || n.includes("llama")) {
     return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-500">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
     );
  }
  
  if (p.includes("mistral") || n.includes("mistral") || n.includes("mixtral")) {
      return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.95 1.477 2.95-1.477L12 14.09l-5.9-3.09L12 11zm0 3.82L2 10v7l10 5 10-5v-7l-10 4.82z"/>
          </svg>
      )
  }

  if (n.includes("deepseek")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2zm0-10h2v6h-2z"/>
      </svg>
    );
  }

  if (n.includes("glm")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-purple-500">
        <path d="M12 2L2 22h20L12 2zm0 4l6 12H6l6-12z"/>
      </svg>
    );
  }

  if (n.includes("kimi")) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-pink-500">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
      </svg>
    );
  }

  return <Bot className="w-5 h-5 text-muted-foreground" />;
}

export function ModelBrowser({ open, onOpenChange }: ModelBrowserProps) {
  const { activeModel, activeModelProvider, setActiveModel, setActiveModelProvider, activeImageModel, setActiveImageModel, activeVideoModel, setActiveVideoModel } = useChatStore();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("text");
  const [selectedProvider, setSelectedProvider] = useState("all");

  const getFilteredModels = () => {
    let models: Model[] = [];
    
    switch (activeTab) {
      case "text":
        models = AVAILABLE_MODELS;
        break;
      case "image":
        models = IMAGE_MODELS;
        break;
      case "video":
        models = VIDEO_MODELS;
        break;
    }

    return models.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.provider.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProvider = selectedProvider === "all" || m.provider.toLowerCase() === selectedProvider.toLowerCase();
      return matchesSearch && matchesProvider;
    });
  };

  // Memoize filtered models
  const filteredTextModels = useMemo(() => {
    return getFilteredModels();
  }, [searchQuery, activeTab, selectedProvider]);

  const handleSelectModel = async (modelId: string, type: string, providerLabel: string) => {
    if (type === "text") {
      setActiveModel(modelId);
    } else if (type === "image") {
      setActiveImageModel(modelId);
    } else if (type === "video") {
      setActiveVideoModel(modelId);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] sm:h-[80vh] p-0 bg-[#0a0a0a] border-white/10 w-[95vw] sm:w-full backdrop-blur-3xl">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-white/5 bg-black/20">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
            Select AI Model
          </DialogTitle>
          <div className="relative mt-3 sm:mt-4">
            <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="pl-9 bg-white/5 border-white/5 text-white placeholder:text-white/30 text-sm sm:text-base h-9 sm:h-10 focus:bg-white/10 transition-colors rounded-xl"
            />
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-white/5">
            <TabsList className="bg-white/5 border border-white/5 grid grid-cols-3 w-full sm:w-auto rounded-lg p-1 h-auto">
                <TabsTrigger value="text" className="gap-2 data-[state=active]:bg-white/10 text-xs sm:text-sm py-2 rounded-md transition-all">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Text</span>
                </TabsTrigger>
                <TabsTrigger value="image" className="gap-2 data-[state=active]:bg-white/10 text-xs sm:text-sm py-2 rounded-md transition-all">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Image</span>
                </TabsTrigger>
                <TabsTrigger value="video" className="gap-2 data-[state=active]:bg-white/10 text-xs sm:text-sm py-2 rounded-md transition-all">
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Video</span>
                </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-3 sm:py-4 bg-black/20">
            {activeTab === "text" && (
                  <div className="space-y-2 pb-4">
                {filteredTextModels.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => handleSelectModel(model.id, "text", model.provider)}
                    className={`group flex items-center gap-4 p-3 sm:p-4 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                      activeModel === model.id
                        ? "bg-white/10 border-primary/50 ring-1 ring-primary/30"
                        : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                    }`}
                  >
                     <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black/40 border border-white/10 shrink-0">
                        <ModelIcon provider={model.provider} name={model.name} />
                     </div>
                     
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-white text-sm sm:text-base truncate">{model.name}</h3>
                            {activeModel === model.id && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-white/70 line-clamp-1">{model.description}</p>
                     </div>

                     <Badge variant="outline" className="hidden sm:flex bg-white/5 text-white/60 border-white/5 text-[10px] h-6 px-2">
                        {model.provider}
                     </Badge>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab !== "text" && (
              <div className="flex flex-col items-center justify-center h-full text-white/40 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                   <Lock className="h-6 w-6" />
                </div>
                <p>Coming soon</p>
              </div>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}