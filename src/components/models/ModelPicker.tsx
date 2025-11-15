import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Zap, Brain, Cpu, Rocket, Network, ChevronRight } from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import { Link } from "react-router";
import { ModelBrowser } from "./ModelBrowser";
import { useState } from "react";

interface ModelPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const models = [
  {
    id: "auto",
    name: "Auto",
    description: "Intelligently selects the best model based on your query",
    icon: Sparkles,
    color: "text-primary",
    badge: "Recommended",
    badgeColor: "bg-primary/10 text-primary",
  },
  {
    id: "groq/llama-3.1-70b-versatile",
    name: "Llama 3.1 70B (Groq)",
    description: "Ultra-fast 70B model with lightning speed inference",
    icon: Rocket,
    color: "text-blue-500",
    badge: "Fast",
    badgeColor: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "agentrouter/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet (AgentRouter)",
    description: "Free access to Claude 3.5 via AgentRouter",
    icon: Network,
    color: "text-purple-500",
    badge: "Free",
    badgeColor: "bg-purple-500/10 text-purple-500",
  },
  {
    id: "puter/gpt-5-nano",
    name: "GPT-5 Nano (Puter)",
    description: "Fast and free, no API key required",
    icon: Zap,
    color: "text-green-500",
    badge: "Free",
    badgeColor: "bg-green-500/10 text-green-500",
  },
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1 (Bytez)",
    description: "Advanced reasoning model via Bytez",
    icon: Cpu,
    color: "text-orange-500",
    badge: "Reasoning",
    badgeColor: "bg-orange-500/10 text-orange-500",
  },
];

export function ModelPicker({ open, onOpenChange }: ModelPickerProps) {
  const { activeModel, setActiveModel } = useChatStore();
  const [showModelBrowser, setShowModelBrowser] = useState(false);

  const handleSelectModel = (modelId: string) => {
    setActiveModel(modelId);
    onOpenChange(false);
  };

  const handleViewAllModels = () => {
    onOpenChange(false);
    setShowModelBrowser(true);
  };

  const getModelDisplayName = (modelId: string) => {
    if (modelId === "auto") return "Auto";
    const model = models.find(m => m.id === modelId);
    return model?.name || modelId;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Select AI Model</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Choose the best model for your needs
            </p>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {models.map((model) => {
              const Icon = model.icon;
              const isActive = activeModel === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left group ${
                    isActive
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${model.color} mt-1 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base">{model.name}</h3>
                        {model.badge && (
                          <Badge variant="outline" className={`text-xs ${model.badgeColor} border-0`}>
                            {model.badge}
                          </Badge>
                        )}
                        {isActive && (
                          <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        {model.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            
            <button
              onClick={handleViewAllModels}
              className="w-full p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">More Models</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Browse all available models including Hugging Face, Bytez, OpenRouter, and more
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <div className="border border-dashed rounded-lg p-4 mt-4 bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">SuperGrok</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock premium models with unlimited access
                  </p>
                </div>
                <Link to="/upgrade" onClick={() => onOpenChange(false)}>
                  <Button size="sm">Upgrade</Button>
                </Link>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Link to="/integrations" onClick={() => onOpenChange(false)} className="flex-1">
                <Button variant="outline" className="w-full">API Integrations</Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <ModelBrowser open={showModelBrowser} onOpenChange={setShowModelBrowser} />
    </>
  );
}