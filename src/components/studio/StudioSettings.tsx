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

  const handleThemeSelect = (newTheme: "cryonex" | "white") => {
    if (newTheme === "cryonex") {
      setTheme("cosmic");
      setMode("dark");
    } else {
      setTheme("liquid");
      setMode("light");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e1e1e] text-[#cccccc] border-[#333] sm:max-w-[600px] gap-0 p-0 overflow-hidden">
        <div className="h-10 bg-[#252526] flex items-center px-4 border-b border-[#333] shrink-0 select-none">
            <span className="text-sm font-medium text-[#cccccc]">Settings</span>
        </div>
        
        <div className="p-6 space-y-8 bg-[#1e1e1e]">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#6f6f6f] uppercase tracking-wider">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <ThemeOption 
                title="Cryonex Dark" 
                description="Deep cosmic dark theme"
                active={theme === "cosmic"}
                onClick={() => handleThemeSelect("cryonex")}
                icon={Moon}
              />
              <ThemeOption 
                title="Liquid Light" 
                description="Bright clean interface"
                active={theme === "liquid"}
                onClick={() => handleThemeSelect("white")}
                icon={Sun}
                light
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
        active ? "border-[#007acc] bg-[#252526]" : "border-[#333] hover:border-[#555] hover:bg-[#2a2d2e]",
        light && active ? "bg-[#f3f3f3] border-[#ccc]" : ""
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-colors",
        active ? "bg-[#007acc] text-white" : "bg-[#333] text-[#888]",
        light && active ? "bg-[#e5e5e5] text-black" : ""
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 z-10">
        <div className={cn("font-medium mb-1", light && active ? "text-black" : "text-white")}>{title}</div>
        <div className={cn("text-xs", light && active ? "text-gray-600" : "text-[#888]")}>{description}</div>
      </div>
      {active && (
        <div className="absolute top-3 right-3">
            <Check className={cn("w-4 h-4", light ? "text-black" : "text-[#007acc]")} />
        </div>
      )}
    </div>
  );
}
