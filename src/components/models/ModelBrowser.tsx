import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChatStore } from "@/lib/stores/chat-store";
import { ModelProvider, BYTEZ_MODELS } from "@/lib/utils/model-utils";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo } from "react";
import { Search, Sparkles, Image, Video, CheckCircle2, Lock, Zap, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ModelBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModelBrowser({ open, onOpenChange }: ModelBrowserProps) {
  const { activeModel, activeModelProvider, setActiveModel, setActiveModelProvider } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("text");

  const filteredModels = useMemo(() => {
    return BYTEZ_MODELS.filter(model => 
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelectModel = (modelId: string) => {
    setActiveModel(modelId, "bytez");
    setActiveModelProvider("bytez");
    onOpenChange(false);
    toast.success(`Selected ${modelId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] sm:h-[80vh] p-0 bg-[#0f0f0f] border-[#2a2a2a] w-[95vw] sm:w-full">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-[#2a2a2a]">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
            Browse Models
            <span className="text-sm font-normal text-[#6b6b6b]">Bytez API</span>
          </DialogTitle>
          <div className="relative mt-3 sm:mt-4">
            <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-[#6b6b6b]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models (e.g. Qwen, GPT-4, DeepSeek)..."
              className="pl-9 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#6b6b6b] text-sm sm:text-base h-9 sm:h-10"
            />
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 sm:mx-6 mt-3 sm:mt-4 bg-[#1a1a1a] border border-[#2a2a2a] grid grid-cols-1 w-auto">
            <TabsTrigger value="text" className="gap-1 sm:gap-2 data-[state=active]:bg-[#2a2a2a] text-xs sm:text-sm px-2 sm:px-3">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Text Models</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredModels.map((model) => (
                <motion.div
                  key={model.id}
                  layoutId={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className={`group relative p-3 sm:p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
                    activeModel === model.id
                      ? "bg-[#1a1a1a] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                      : "bg-[#111] border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#161616]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-[#222] flex items-center justify-center">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                    </div>
                    {activeModel === model.id && (
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                    )}
                  </div>
                  
                  <h3 className="font-medium text-white text-sm sm:text-base mb-1 truncate" title={model.name}>
                    {model.name}
                  </h3>
                  <p className="text-xs text-[#888] line-clamp-2 mb-3 h-8">
                    {model.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="bg-[#222] text-[#aaa] hover:bg-[#2a2a2a] text-[10px] sm:text-xs border-0">
                      {model.provider}
                    </Badge>
                    {model.tags?.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-[#222] text-[#aaa] hover:bg-[#2a2a2a] text-[10px] sm:text-xs border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}