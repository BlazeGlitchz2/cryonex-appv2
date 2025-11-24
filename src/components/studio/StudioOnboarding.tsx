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
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-[#0a0a0a] border-white/10 text-white sm:rounded-3xl">
        <div className="flex h-[500px]">
          {/* Sidebar / Progress */}
          <div className="w-1/3 bg-black/20 border-r border-white/5 p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-blue-500/10 pointer-events-none" />
            
            <div>
              <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Welcome to Studio
              </h2>
              <p className="text-white/40 text-sm mb-8">
                Let's customize your workspace experience.
              </p>

              <div className="space-y-6">
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
          <div className="flex-1 p-8 flex flex-col relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-white/40 hover:text-white"
              onClick={handleSkip}
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Choose your theme</h3>
                      <p className="text-white/50 text-sm">Select the look and feel that suits you best.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <ThemeCard
                        title="Cryonex UI"
                        description="Deep cosmic dark mode"
                        active={selectedTheme === "cryonex"}
                        onClick={() => handleThemeSelect("cryonex")}
                        previewColor="bg-[#050505]"
                        icon={Moon}
                      />
                      <ThemeCard
                        title="White UI"
                        description="Clean liquid light mode"
                        active={selectedTheme === "white"}
                        onClick={() => handleThemeSelect("white")}
                        previewColor="bg-white"
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
                    <div className="space-y-2 shrink-0">
                      <h3 className="text-xl font-semibold">Preferred Language</h3>
                      <p className="text-white/50 text-sm">What language would you like to start with?</p>
                    </div>

                    <ScrollArea className="flex-1 pr-4 -mr-4">
                      <div className="grid grid-cols-3 gap-3 pb-2">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setSelectedLanguage(lang)}
                            className={cn(
                              "px-3 py-2 rounded-lg text-sm text-left transition-all border",
                              selectedLanguage === lang
                                ? "bg-purple-500/20 border-purple-500/50 text-white"
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
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">You're all set!</h3>
                      <p className="text-white/50 text-sm">Here is a summary of your preferences.</p>
                    </div>

                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                      <div className="grid grid-cols-2 border-b border-white/10">
                        <div className="p-4 border-r border-white/10 bg-white/[0.02]">
                          <span className="text-xs text-white/40 uppercase tracking-wider">Theme</span>
                        </div>
                        <div className="p-4 font-medium flex items-center gap-2">
                          {selectedTheme === "cryonex" ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
                          {selectedTheme === "cryonex" ? "Cryonex UI" : "White UI"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="p-4 border-r border-white/10 bg-white/[0.02]">
                          <span className="text-xs text-white/40 uppercase tracking-wider">Language</span>
                        </div>
                        <div className="p-4 font-medium flex items-center gap-2">
                          <Code className="w-4 h-4 text-blue-400" />
                          {selectedLanguage}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
              <Button
                variant="ghost"
                onClick={step === 1 ? handleSkip : prevStep}
                className="text-white/40 hover:text-white"
              >
                {step === 1 ? "Skip" : "Back"}
              </Button>
              
              <Button
                onClick={step === 3 ? handleFinish : nextStep}
                className="bg-white text-black hover:bg-white/90 rounded-full px-8"
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
    <div className={cn("flex items-center gap-3 transition-colors", isActive || isCompleted ? "text-white" : "text-white/30")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
        isActive ? "bg-purple-500 border-purple-500 text-white" : 
        isCompleted ? "bg-green-500 border-green-500 text-white" : "border-white/20 bg-transparent"
      )}>
        {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
      </div>
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}

function ThemeCard({ title, description, active, onClick, previewColor, icon: Icon }: any) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 relative overflow-hidden group",
        active ? "border-purple-500 bg-white/5" : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/[0.02]"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-lg shadow-lg flex items-center justify-center", previewColor)}>
          <Icon className={cn("w-5 h-5", title === "White UI" ? "text-black" : "text-white")} />
        </div>
        {active && <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>}
      </div>
      <h4 className="font-semibold text-sm mb-1">{title}</h4>
      <p className="text-xs text-white/50">{description}</p>
    </div>
  );
}
