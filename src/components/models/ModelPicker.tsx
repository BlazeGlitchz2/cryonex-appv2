import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Zap, Brain, Cpu } from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import { Link } from "react-router";

interface ModelPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const models = [
  {
    id: "Qwen/Qwen2.5-14B-Instruct",
    name: "Qwen 2.5 14B (HF)",
    description: "Strong general assistant with great reasoning (Hugging Face)",
    icon: Sparkles,
    color: "text-emerald-500",
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B (HF)",
    description: "Large, high-quality chat model (Hugging Face)",
    icon: Brain,
    color: "text-blue-500",
  },
  {
    id: "google/gemma-2-27b-it",
    name: "Gemma 2 27B (HF)",
    description: "Google's large instruction-tuned model (Hugging Face)",
    icon: Brain,
    color: "text-green-500",
  },
  {
    id: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    name: "Mixtral 8x7B (HF)",
    description: "Fast MoE model with balanced quality (Hugging Face)",
    icon: Zap,
    color: "text-purple-500",
  },
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1 (Bytez)",
    description: "Reasoning-focused model via Bytez provider",
    icon: Cpu,
    color: "text-orange-500",
  },
];

export function ModelPicker({ open, onOpenChange }: ModelPickerProps) {
  const { activeModel, setActiveModel } = useChatStore();

  const handleSelectModel = (modelId: string) => {
    setActiveModel(modelId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select AI Model</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {models.map((model) => {
            const Icon = model.icon;
            const isActive = activeModel === model.id;
            return (
              <button
                key={model.id}
                onClick={() => handleSelectModel(model.id)}
                className={`w-full p-4 rounded-lg border transition-all text-left ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-accent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${model.color} mt-1`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{model.name}</h3>
                      {isActive && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {model.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
          
          <div className="border border-dashed rounded-lg p-4 mt-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold">SuperGrok</h3>
                <p className="text-sm text-muted-foreground">
                  Unlock premium models with unlimited access
                </p>
              </div>
              <Link to="/upgrade">
                <Button size="sm">Upgrade</Button>
              </Link>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Link to="/models" className="flex-1">
              <Button variant="outline" className="w-full">View All Models</Button>
            </Link>
            <Link to="/integrations" className="flex-1">
              <Button variant="outline" className="w-full">Integrations</Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}