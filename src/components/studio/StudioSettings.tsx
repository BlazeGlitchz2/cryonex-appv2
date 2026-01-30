import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useThemeStore } from "@/lib/stores/theme-store";
import { Check, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudioSettings({ open, onOpenChange }: StudioSettingsProps) {
  const { theme, setTheme, setMode } = useThemeStore();

  const handleThemeSelect = (newTheme: "cryonex") => {
    setTheme("cosmic");
    setMode("dark");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background text-foreground border-border sm:max-w-[600px] gap-0 p-0 overflow-hidden">
        <div className="h-10 bg-muted/50 flex items-center px-4 border-b border-border shrink-0 select-none">
          <span className="text-sm font-medium text-foreground">Settings</span>
        </div>

        <div className="p-6 space-y-8 bg-background">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Appearance</h3>
            <div className="grid grid-cols-1 gap-4">
              <ThemeOption
                title="Cryonex Dark"
                description="Deep cosmic dark theme"
                active={theme === "cosmic"}
                onClick={() => handleThemeSelect("cryonex")}
                icon={Moon}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ThemeOption({ title, description, active, onClick, icon: Icon, light }: any) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer group rounded-md border-2 p-4 transition-all flex items-start gap-4 relative overflow-hidden",
        active ? "border-primary bg-muted" : "border-border hover:border-primary/50 hover:bg-muted/50",
        light && active ? "bg-white border-gray-300" : ""
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        light && active ? "bg-gray-200 text-black" : ""
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 z-10">
        <div className={cn("font-medium mb-1", light && active ? "text-black" : "text-foreground")}>{title}</div>
        <div className={cn("text-xs", light && active ? "text-gray-600" : "text-muted-foreground")}>{description}</div>
      </div>
      {active && (
        <div className="absolute top-3 right-3">
          <Check className={cn("w-4 h-4", light ? "text-black" : "text-primary")} />
        </div>
      )}
    </div>
  );
}