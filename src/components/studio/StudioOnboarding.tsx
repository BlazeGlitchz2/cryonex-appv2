import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Palette, Code, FileText, X, Sun, Moon, Layout, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/lib/stores/theme-store";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", 
  "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala", "Perl", "Lua", "R", 
  "Objective-C", "Shell", "SQL", "HTML/CSS", "Vue", "React", "Angular"
];

interface StudioOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudioOnboarding({ open, onOpenChange }: StudioOnboardingProps) {
  const [step, setStep] = useState(1);
  const { setTheme, setMode } = useThemeStore();
  const [selectedTheme, setSelectedTheme] = useState<"cryonex" | "white">("cryonex");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("JavaScript");

  const handleThemeSelect = (theme: "cryonex" | "white") => {
    setSelectedTheme(theme);
    if (theme === "cryonex") {
      setTheme("cosmic");
      setMode("dark");
    } else {
      setTheme("liquid");
      setMode("light");
    }
  };

  const handleFinish = () => {
    onOpenChange(false);
    localStorage.setItem("cryonex-studio-onboarding", "true");
    localStorage.setItem("cryonex-studio-language", selectedLanguage);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-[1800px] h-[600px] p-0 gap-0 bg-[#1e1e1e] text-[#cccccc] border-[#333] shadow-2xl sm:rounded-xl overflow-hidden flex flex-col outline-none">
        {/* VS Code Title Bar style */}
        <div className="h-10 bg-[#252526] flex items-center justify-between px-4 border-b border-[#333] shrink-0 select-none">
            <div className="flex items-center gap-3">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-sm font-medium text-[#cccccc] ml-2">Welcome to Cryonex Studio</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-[#cccccc] hover:bg-[#333]" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
            </Button>
        </div>

        <div className="flex flex-1 min-h-0">
            {/* Sidebar - Walkthrough Steps */}
            <div className="w-[300px] bg-[#252526] border-r border-[#1e1e1e] flex flex-col shrink-0">
                <div className="p-8">
                    <h2 className="text-xs font-bold text-[#6f6f6f] uppercase tracking-wider mb-6">Get Started</h2>
                    <div className="space-y-2">
                        <StepItem 
                            active={step === 1} 
                            completed={step > 1}
                            onClick={() => setStep(1)}
                            label="Choose Look"
                            icon={Palette}
                        />
                        <StepItem 
                            active={step === 2} 
                            completed={step > 2}
                            onClick={() => setStep(2)}
                            label="Select Language"
                            icon={Code}
                        />
                        <StepItem 
                            active={step === 3} 
                            completed={step > 3}
                            onClick={() => setStep(3)}
                            label="Ready to Code"
                            icon={Terminal}
                        />
                    </div>
                </div>
                
                <div className="mt-auto p-8 border-t border-[#333]">
                    <div className="text-xs text-[#6f6f6f] mb-3">Setup Progress</div>
                    <div className="h-1 w-full bg-[#333] rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#007acc] transition-all duration-300" 
                            style={{ width: `${(step / 3) * 100}%` }} 
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-[#1e1e1e] flex flex-col min-w-0 relative">
                <ScrollArea className="flex-1">
                    <div className="p-16 max-w-6xl mx-auto w-full">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="space-y-3">
                                        <h1 className="text-4xl font-light text-white">Customize your setup</h1>
                                        <p className="text-[#888] text-xl">Choose the theme that fits your style.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10">
                                        <ThemeOption 
                                            title="Cryonex Dark" 
                                            active={selectedTheme === "cryonex"}
                                            onClick={() => handleThemeSelect("cryonex")}
                                            preview={<div className="w-full h-40 bg-[#0a0a0a] rounded-md border border-[#333] relative overflow-hidden shadow-xl">
                                                <div className="absolute top-0 left-0 w-16 h-full bg-[#111] border-r border-[#333]" />
                                                <div className="absolute top-4 left-20 w-24 h-2 bg-[#333] rounded-full" />
                                                <div className="absolute top-10 left-20 w-40 h-2 bg-[#222] rounded-full" />
                                                <div className="absolute top-16 left-20 w-32 h-2 bg-[#222] rounded-full" />
                                                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-purple-900/20 to-transparent" />
                                            </div>}
                                        />
                                        <ThemeOption 
                                            title="Liquid Light" 
                                            active={selectedTheme === "white"}
                                            onClick={() => handleThemeSelect("white")}
                                            preview={<div className="w-full h-40 bg-white rounded-md border border-[#e5e5e5] relative overflow-hidden shadow-xl">
                                                <div className="absolute top-0 left-0 w-16 h-full bg-[#f3f3f3] border-r border-[#e5e5e5]" />
                                                <div className="absolute top-4 left-20 w-24 h-2 bg-[#e5e5e5] rounded-full" />
                                                <div className="absolute top-10 left-20 w-40 h-2 bg-[#f0f0f0] rounded-full" />
                                                <div className="absolute top-16 left-20 w-32 h-2 bg-[#f0f0f0] rounded-full" />
                                                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-blue-100/50 to-transparent" />
                                            </div>}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="space-y-3">
                                        <h1 className="text-4xl font-light text-white">Language Support</h1>
                                        <p className="text-[#888] text-xl">Select your primary language to configure the environment.</p>
                                    </div>

                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                        {LANGUAGES.map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => setSelectedLanguage(lang)}
                                                className={cn(
                                                    "px-4 py-4 rounded-md text-sm text-left transition-all border flex flex-col items-center justify-center gap-3 aspect-square",
                                                    selectedLanguage === lang
                                                        ? "bg-[#094771] border-[#007acc] text-white shadow-lg scale-105"
                                                        : "bg-[#252526] border-[#333] text-[#cccccc] hover:bg-[#2a2d2e] hover:border-[#555]"
                                                )}
                                            >
                                                <Code className="w-6 h-6 opacity-70" />
                                                <span className="font-medium">{lang}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="space-y-3">
                                        <h1 className="text-4xl font-light text-white">You're all set</h1>
                                        <p className="text-[#888] text-xl">Your environment is ready. Happy coding!</p>
                                    </div>

                                    <div className="bg-[#252526] border border-[#333] rounded-lg p-8 space-y-6 max-w-2xl">
                                        <div className="flex items-center justify-between p-6 bg-[#1e1e1e] rounded border border-[#333]">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-[#007acc]/10 rounded-md">
                                                    <Layout className="w-6 h-6 text-[#007acc]" />
                                                </div>
                                                <div>
                                                    <div className="text-[#cccccc] font-medium">Theme</div>
                                                    <div className="text-[#666] text-sm">Visual Appearance</div>
                                                </div>
                                            </div>
                                            <span className="font-mono text-lg text-white">{selectedTheme === "cryonex" ? "Cryonex Dark" : "Liquid Light"}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-6 bg-[#1e1e1e] rounded border border-[#333]">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-[#007acc]/10 rounded-md">
                                                    <Terminal className="w-6 h-6 text-[#007acc]" />
                                                </div>
                                                <div>
                                                    <div className="text-[#cccccc] font-medium">Language</div>
                                                    <div className="text-[#666] text-sm">Primary Environment</div>
                                                </div>
                                            </div>
                                            <span className="font-mono text-lg text-white">{selectedLanguage}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>

                {/* Footer Actions */}
                <div className="p-8 border-t border-[#333] flex justify-between items-center bg-[#1e1e1e] shrink-0">
                    {step > 1 ? (
                        <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-[#cccccc] hover:text-white hover:bg-[#333] h-12 px-6 text-base">
                            Back
                        </Button>
                    ) : (
                        <div />
                    )}
                    
                    <Button 
                        onClick={step === 3 ? handleFinish : () => setStep(step + 1)}
                        className="bg-[#007acc] hover:bg-[#0062a3] text-white rounded-sm px-10 h-12 text-base shadow-lg"
                    >
                        {step === 3 ? "Launch Studio" : "Next Section"}
                        {step !== 3 && <ChevronRight className="w-5 h-5 ml-2" />}
                    </Button>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepItem({ active, completed, onClick, label, icon: Icon }: any) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active ? "bg-[#37373d] text-white" : "text-[#969696] hover:text-[#cccccc] hover:bg-[#2a2d2e]"
            )}
        >
            <div className={cn(
                "w-4 h-4 rounded-full border flex items-center justify-center",
                completed ? "bg-[#007acc] border-[#007acc]" : active ? "border-white" : "border-[#666]"
            )}>
                {completed && <Check className="w-3 h-3 text-white" />}
            </div>
            <span>{label}</span>
        </button>
    );
}

function ThemeOption({ title, active, onClick, preview }: any) {
    return (
        <div 
            onClick={onClick}
            className={cn(
                "cursor-pointer group rounded-lg border-2 p-4 transition-all bg-[#252526]",
                active ? "border-[#007acc]" : "border-[#333] hover:border-[#555]"
            )}
        >
            <div className="mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                {preview}
            </div>
            <div className="flex items-center justify-between">
                <span className="font-medium text-white">{title}</span>
                {active && <div className="w-5 h-5 rounded-full bg-[#007acc] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                </div>}
            </div>
        </div>
    );
}