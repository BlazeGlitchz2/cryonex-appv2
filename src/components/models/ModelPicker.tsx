import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Zap, Brain, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useChatStore } from "@/lib/stores/chat-store";
import { Link } from "react-router";

interface ModelPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PickerModel = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  provider: "auto";
};

const models: PickerModel[] = [];

export function ModelPicker({ open, onOpenChange }: ModelPickerProps) {
  const { activeModel, activeModelProvider, setActiveModel, setActiveModelProvider } = useChatStore();

  const handleSelectModel = (modelId: string, provider: "auto") => {
    setActiveModel(modelId, provider);
    setActiveModelProvider(provider);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select AI Model</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-center py-8 text-muted-foreground">
            No models available
          </div>
          
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