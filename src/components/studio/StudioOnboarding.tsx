import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Palette, Code, FileText, X, Monitor, Sun, Moon } from "lucide-react";
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

  const handleSkip = () => {
    // Default to Cryonex UI
    setTheme("cosmic");
    setMode("dark");
    onOpenChange(false);
  };

  const handleFinish = () => {
    onOpenChange(false);
    // Here you could save the language preference to a user profile or local storage
    localStorage.setItem("cryonex-studio-onboarding", "true");
    localStorage.setItem("cryonex-studio-language", selectedLanguage);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-[#0a0a0a] border-white/10 text-white sm:rounded-3xl shadow-2xl shadow-purple-900/20">
        <div className="flex h-[650px]">
          {/* Sidebar / Progress */}
          <div className="w-1/3 bg-black/40 border-r border-white/5 p-10 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-blue-500/10 pointer-events-none" />
            
            <div>
              <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Welcome to Studio
              </h2>
              <p className="text-white/40 text-base mb-12">
                Let's customize your workspace experience.
              </p>

              <div className="space-y-8">
                <StepIndicator 
                  currentStep={step} 
                  stepNumber={1} 
                  icon={Palette} 
                  label="Appearance" 
                />
                <StepIndicator 
                  currentStep={step} 
                  stepNumber={2} 
                  icon={Code} 
                  label="Language" 
                />
                <StepIndicator 
                  currentStep={step} 
                  stepNumber={3} 
                  icon={FileText} 
                  label="Summary" 
                />
              </div>
            </div>

            <div className="text-xs text-white/20">
              Step {step} of 3
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-10 flex flex-col relative bg-gradient-to-br from-[#0a0a0a] to-[#050505]">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-6 right-6 text-white/40 hover:text-white"
              onClick={handleSkip}
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold">Choose your theme</h3>
                      <p className="text-white/50 text-base">Select the look and feel that suits you best.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <ThemeCard
                        title="Cryonex UI"
                        description="Deep cosmic dark mode"
                        active={selectedTheme === "cryonex"}
                        onClick={() => handleThemeSelect("cryonex")}
                        previewColor="bg-gradient-to-br from-[#1a0b2e] to-[#030014]"
                        icon={Moon}
                      />
                      <ThemeCard
                        title="White UI"
                        description="Clean liquid light mode"
                        active={selectedTheme === "white"}
                        onClick={() => handleThemeSelect("white")}
                        previewColor="bg-gradient-to-br from-white to-gray-100"
                        icon={Sun}
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
                    className="space-y-6 h-full flex flex-col"
                  >
                    <div className="space-y-3 shrink-0">
                      <h3 className="text-2xl font-semibold">Preferred Language</h3>
                      <p className="text-white/50 text-base">What language would you like to start with?</p>
                    </div>

                    <ScrollArea className="flex-1 pr-4 -mr-4">
                      <div className="grid grid-cols-3 gap-4 pb-2">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setSelectedLanguage(lang)}
                            className={cn(
                              "px-4 py-3 rounded-xl text-sm text-left transition-all border",
                              selectedLanguage === lang
                                ? "bg-purple-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/10"
                                : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold">You're all set!</h3>
                      <p className="text-white/50 text-base">Here is a summary of your preferences.</p>
                    </div>

                    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                      <div className="grid grid-cols-2 border-b border-white/10">
                        <div className="p-6 border-r border-white/10 bg-white/[0.02]">
                          <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Theme</span>
                        </div>
                        <div className="p-6 font-medium flex items-center gap-3 text-lg">
                          {selectedTheme === "cryonex" ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                          {selectedTheme === "cryonex" ? "Cryonex UI" : "White UI"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="p-6 border-r border-white/10 bg-white/[0.02]">
                          <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Language</span>
                        </div>
                        <div className="p-6 font-medium flex items-center gap-3 text-lg">
                          <Code className="w-5 h-5 text-blue-400" />
                          {selectedLanguage}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/5">
              <Button
                variant="ghost"
                onClick={step === 1 ? handleSkip : prevStep}
                className="text-white/40 hover:text-white text-base"
              >
                {step === 1 ? "Skip" : "Back"}
              </Button>
              
              <Button
                onClick={step === 3 ? handleFinish : nextStep}
                className="bg-white text-black hover:bg-white/90 rounded-full px-10 h-12 text-base font-medium"
              >
                {step === 3 ? "Get Started" : "Next"}
                {step !== 3 && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ currentStep, stepNumber, icon: Icon, label }: { currentStep: number, stepNumber: number, icon: any, label: string }) {
  const isActive = currentStep === stepNumber;
  const isCompleted = currentStep > stepNumber;

  return (
    <div className={cn("flex items-center gap-4 transition-colors", isActive || isCompleted ? "text-white" : "text-white/30")}>
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center border transition-all",
        isActive ? "bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/25" : 
        isCompleted ? "bg-green-500 border-green-500 text-white" : "border-white/20 bg-transparent"
      )}>
        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
      </div>
      <span className="font-medium text-base">{label}</span>
    </div>
  );
}

function ThemeCard({ title, description, active, onClick, previewColor, icon: Icon }: any) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 relative overflow-hidden group",
        active ? "border-purple-500 bg-white/5 shadow-xl shadow-purple-500/10" : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/[0.02]"
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div className={cn("w-14 h-14 rounded-xl shadow-lg flex items-center justify-center ring-1 ring-white/10", previewColor)}>
          <Icon className={cn("w-7 h-7", title === "White UI" ? "text-black" : "text-white")} />
        </div>
        {active && <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>}
      </div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-sm text-white/50">{description}</p>
    </div>
  );
}