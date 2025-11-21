import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChatStore } from "@/lib/stores/chat-store";
import { ModelProvider } from "@/lib/utils/model-utils";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo } from "react";
import { Search, Sparkles, Image, Video, CheckCircle2, Lock, Zap, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ModelBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const textModels: any[] = [];

const imageModels: any[] = [];

const videoModels: any[] = [];

const providerKeyFromLabel = (label: string, modelId: string): ModelProvider => {
  return "auto";
};

export function ModelBrowser({ open, onOpenChange }: ModelBrowserProps) {
  const { activeModel, activeModelProvider, setActiveModel, setActiveModelProvider, activeImageModel, setActiveImageModel, activeVideoModel, setActiveVideoModel } = useChatStore();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("text");

  // Check if API key is configured
  const hasApiKey = !!import.meta.env.VITE_BYTEZ_API_KEY;

  // Helper function to check if a model requires authentication
  const requiresAuthentication = (modelId: string): boolean => {
    return false;
  };

  // Helper function to check if user can access a model
  const canAccessModel = (modelId: string): boolean => {
    return true;
  };

  // Memoize filtered models to avoid recalculation on every render
  const filteredTextModels = useMemo(() => {
    return [];
  }, [searchQuery]);

  const filteredImageModels = useMemo(() => {
    return [];
  }, [searchQuery]);

  const filteredVideoModels = useMemo(() => {
    return [];
  }, [searchQuery]);

  const handleSelectModel = async (modelId: string, type: string, providerLabel: string) => {
    if (type === "text") {
      setActiveModel(modelId, "auto");
      setActiveModelProvider("auto");
    } else if (type === "image") {
      setActiveImageModel(modelId);
    } else if (type === "video") {
      setActiveVideoModel(modelId);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] sm:h-[80vh] p-0 bg-[#0f0f0f] border-[#2a2a2a] w-[95vw] sm:w-full">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-[#2a2a2a]">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
            Browse Models
            <span className="text-sm font-normal text-[#6b6b6b]">Free & Premium</span>
          </DialogTitle>
          <div className="relative mt-3 sm:mt-4">
            <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-[#6b6b6b]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="pl-9 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#6b6b6b] text-sm sm:text-base h-9 sm:h-10"
            />
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 sm:mx-6 mt-3 sm:mt-4 bg-[#1a1a1a] border border-[#2a2a2a] grid grid-cols-3 w-auto">
            <TabsTrigger value="text" className="gap-1 sm:gap-2 data-[state=active]:bg-[#2a2a2a] text-xs sm:text-sm px-2 sm:px-3">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-1 sm:gap-2 data-[state=active]:bg-[#2a2a2a] text-xs sm:text-sm px-2 sm:px-3">
              <Image className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Image</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-1 sm:gap-2 data-[state=active]:bg-[#2a2a2a] text-xs sm:text-sm px-2 sm:px-3">
              <Video className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>No models available. Please check back later.</p>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}