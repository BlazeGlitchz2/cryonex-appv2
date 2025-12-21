import { useState } from "react";
import { useChatStore } from "@/lib/stores/chat-store";
import { AVAILABLE_MODELS as models, ModelProvider } from "@/lib/utils/model-utils";
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
import { Check, ChevronsUpDown, Sparkles, Zap, Brain, Box, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function NeoModelSelector() {
    const [open, setOpen] = useState(false);
    const { activeModel, setActiveModel, activeModelProvider, setActiveModelProvider } = useChatStore();

    const selectedModel = models.find((m: any) => m.id === activeModel);

    const handleSelect = (modelId: string, provider: string) => {
        setActiveModel(modelId as any);
        setActiveModelProvider(provider as ModelProvider);
        setOpen(false);
    };

    const getIcon = (provider: string) => {
        switch (provider) {
            case "openai": return <Sparkles className="h-4 w-4 text-green-400" />;
            case "anthropic": return <Brain className="h-4 w-4 text-orange-400" />;
            case "google": return <Zap className="h-4 w-4 text-blue-400" />;
            case "meta": return <Box className="h-4 w-4 text-blue-600" />;
            case "mistral": return <Cpu className="h-4 w-4 text-yellow-400" />;
            default: return <Box className="h-4 w-4" />;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-9 w-auto justify-between rounded-full border-white/10 bg-white/5 px-3 text-xs font-medium text-white hover:bg-white/10 hover:text-white transition-all hover:scale-105 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                    <div className="flex items-center gap-2">
                        {getIcon(activeModelProvider)}
                        <span className="truncate max-w-[120px]">{selectedModel?.name || "Select Model"}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0 bg-[#0A0A0B]/95 backdrop-blur-xl border-white/10 text-white shadow-2xl rounded-2xl overflow-hidden">
                <Command className="bg-transparent">
                    <CommandInput placeholder="Search models..." className="h-11 border-b border-white/5 bg-transparent text-xs" />
                    <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                        <CommandEmpty className="py-6 text-center text-xs text-white/40">No model found.</CommandEmpty>

                        {/* Group by Provider or Category could be better, but flat list for now with rich items */}
                        <CommandGroup heading="Premium Models" className="text-white/40 text-[10px] font-bold uppercase tracking-wider px-2 py-1.5">
                            {models.map((model: any) => (
                                <CommandItem
                                    key={model.id}
                                    value={model.id}
                                    onSelect={() => handleSelect(model.id, model.provider)}
                                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-white aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors mb-1"
                                >
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5",
                                        activeModel === model.id && "bg-primary/20 border-primary/30"
                                    )}>
                                        {getIcon(model.provider)}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium truncate">{model.name}</span>
                                            {model.tier === "pro" && (
                                                <span className="ml-2 rounded bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/20">
                                                    PRO
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-white/40 truncate">{model.description}</span>
                                    </div>
                                    {activeModel === model.id && (
                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                    <div className="border-t border-white/5 bg-white/[0.02] p-2">
                        <div className="flex items-center justify-between px-2 text-[10px] text-white/40">
                            <span>Context: {selectedModel?.contextWindow || "Unknown"}</span>
                            <span>Provider: {selectedModel?.provider.toUpperCase()}</span>
                        </div>
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
