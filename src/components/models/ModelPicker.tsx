import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Zap, Brain, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import { Link } from "react-router";
import { 
  AVAILABLE_MODELS, 
  IMAGE_MODELS, 
  VIDEO_MODELS,
  getModelDisplayMeta
} from "@/lib/utils/model-utils";

interface ModelPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModelPicker({ open, onOpenChange }: ModelPickerProps) {
  const { activeModel, activeModelProvider, setActiveModel, setActiveModelProvider } = useChatStore();

  const handleSelectModel = (modelId: string) => {
    setActiveModel(modelId, "bytez");
    setActiveModelProvider("bytez");
    onOpenChange(false);
  };

  const getModels = () => {
    switch (type) {
      case "image": return IMAGE_MODELS;
      case "video": return VIDEO_MODELS;
      default: return AVAILABLE_MODELS;
    }
  };

  const models = getModels();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0f0f0f] border-[#2a2a2a]">
        <DialogHeader>
          <DialogTitle className="text-white">Select AI Model</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-2">
            {models.map((model) => (
              <div
                key={model.id}
                onClick={() => handleSelectModel(model.id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  activeModel === model.id
                    ? "bg-[#1a1a1a] border-white/20"
                    : "bg-transparent border-[#2a2a2a] hover:bg-[#1a1a1a]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#252525] flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">{model.name}</h3>
                    <p className="text-xs text-[#6b6b6b]">{model.description}</p>
                  </div>
                </div>
                {activeModel === model.id && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="w-full border-[#2a2a2a] text-white hover:bg-[#1a1a1a]"
              onClick={() => {
                onOpenChange(false);
                window.dispatchEvent(new CustomEvent('openModelBrowser'));
              }}
            >
              View All Models
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}