import { useState, useMemo } from "react";
import { useChatStore } from "@/lib/stores/chat-store";
import {
  AVAILABLE_MODELS as models,
  ModelProvider,
} from "@/lib/utils/model-utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronsUpDown,
  Sparkles,
  Brain,
  Box,
  Cpu,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelIcon } from "@/components/models/ModelIcon";
import { motion, AnimatePresence } from "framer-motion";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export function NeoModelSelector() {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const {
    activeModel,
    setActiveModel,
    activeModelProvider,
    setActiveModelProvider,
  } = useChatStore();

  const selectedModel = models.find((m: any) => m.id === activeModel);

  // Filter "Best" models for the mini view
  const bestModels = useMemo(() => {
    return models.filter(m =>
      m.id === "auto" ||
      m.id === "pollinations/gemini" ||
      m.id === "pollinations/deepseek-r1" ||
      m.id === "cerebras/llama-3.3-70b"
    ).slice(0, 4);
  }, []);

  const handleSelect = (modelId: string, provider: string) => {
    setActiveModel(modelId as any);
    setActiveModelProvider(provider as ModelProvider);
    setOpen(false);
    setShowAll(false); // Reset view on close
  };

  return (
    <Popover
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setTimeout(() => setShowAll(false), 200); // Reset after animation
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="group h-9 w-auto min-w-[140px] justify-between rounded-full border-white/10 bg-white/5 px-3 text-xs font-medium text-white hover:bg-white/10 hover:text-white transition-all hover:scale-105 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        >
          <div className="flex items-center gap-2">
            <ModelIcon
              provider={selectedModel?.provider || activeModelProvider}
              name={selectedModel?.name || ""}
              logoUrl={selectedModel?.logo}
              className="h-4 w-4"
            />
            <span className="truncate max-w-[120px]">
              {selectedModel?.name || "Select Model"}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[340px] p-0 bg-[#0A0A0B]/95 backdrop-blur-xl border-white/10 text-white shadow-2xl rounded-2xl overflow-hidden"
        align="start"
        sideOffset={8}
      >
        <motion.div
          initial={false}
          animate={{ height: showAll ? 400 : "auto" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full flex flex-col"
        >
          <AnimatePresence mode="wait">
            {!showAll ? (
              <motion.div
                key="mini-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-2"
              >
                <div className="mb-2 px-2 py-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Best Models
                  </span>
                  <Sparkles className="h-3 w-3 text-primary/40 animate-pulse" />
                </div>
                <div className="space-y-1">
                  {bestModels.map((model: any) => (
                    <button
                      key={model.id}
                      onClick={() => handleSelect(model.id, model.provider)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all group hover:bg-white/5 border border-transparent hover:border-white/5",
                        activeModel === model.id &&
                        "bg-white/5 border-primary/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5 group-hover:scale-110 transition-transform duration-300",
                          activeModel === model.id &&
                          "bg-primary/20 border-primary/30",
                        )}
                      >
                        <ModelIcon
                          provider={model.provider}
                          name={model.name}
                          logoUrl={model.logo}
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "font-medium truncate text-xs",
                              activeModel === model.id
                                ? "text-white"
                                : "text-white/80",
                            )}
                          >
                            {model.name}
                          </span>
                          {activeModel === model.id && (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          )}
                        </div>
                        <span className="text-[10px] text-white/40 truncate mt-0.5">
                          {model.description}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full group flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span>View all models</span>
                    <ChevronDown className="h-3 w-3 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="full-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-2 px-2 py-2 border-b border-white/5 bg-white/[0.02]">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAll(false)}
                    className="h-8 w-8 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-medium text-white/60">
                    Select Model
                  </span>
                </div>

                <Command className="bg-transparent flex-1">
                  <div className="px-2 py-1">
                    <CommandInput
                      placeholder="Search models..."
                      className="h-9 rounded-lg bg-white/5 border border-white/5 text-xs text-secondary-foreground"
                    />
                  </div>
                  <CommandList className="flex-1 overflow-y-auto custom-scrollbar p-2 h-[320px]">
                    <CommandEmpty className="py-6 text-center text-xs text-white/40">
                      No model found.
                    </CommandEmpty>
                    <CommandGroup
                      heading="All Available Models"
                      className="text-white/40 text-[10px] font-bold uppercase tracking-wider"
                    >
                      {models.map((model: any) => (
                        <CommandItem
                          key={model.id}
                          value={model.name + model.provider + model.id}
                          onSelect={() =>
                            handleSelect(model.id, model.provider)
                          }
                          className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-white aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors mb-1"
                        >
                          <div
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-white/5",
                              activeModel === model.id &&
                              "bg-primary/20 border-primary/30",
                            )}
                          >
                            <ModelIcon
                              provider={model.provider}
                              name={model.name}
                              logoUrl={model.logo}
                              className="h-3.5 w-3.5"
                            />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium truncate text-xs">
                                {model.name}
                              </span>
                              {model.tier === "pro" && (
                                <span className="ml-2 rounded bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/20">
                                  PRO
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-white/40">
                                {model.provider}
                              </span>
                              {activeModel === model.id && (
                                <Check className="h-3 w-3 text-primary shrink-0 ml-auto" />
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
