import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NeoModelSelector } from "@/components/chat/NeoModelSelector";
import { SlashCommandList, SlashCommand } from "@/components/chat/SlashCommandList";
import {
    Paperclip,
    Globe,
    Mic,
    SendHorizontal,
    Maximize2,
    Image as ImageIcon,
    FileCode,
    Sparkles,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface NeoPromptInputProps {
    onSend: (text: string, files?: File[]) => void;
    isLoading?: boolean;
}

export function NeoPromptInput({ onSend, isLoading }: NeoPromptInputProps) {
    const [input, setInput] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [showSlashCommands, setShowSlashCommands] = useState(false);
    const [slashFilter, setSlashFilter] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isMobile = useIsMobile();

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    // Detect slash commands
    useEffect(() => {
        const trimmedInput = input.trim();
        if (trimmedInput.startsWith("/")) {
            setShowSlashCommands(true);
            setSlashFilter(trimmedInput.slice(1)); // Remove the leading /
        } else {
            setShowSlashCommands(false);
            setSlashFilter("");
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Don't handle Enter/Tab/Arrow keys if slash commands are showing
        // (they're handled by SlashCommandList)
        if (showSlashCommands && ["ArrowUp", "ArrowDown", "Enter", "Tab", "Escape"].includes(e.key)) {
            return;
        }

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if ((!input.trim() && files.length === 0) || isLoading) return;
        onSend(input, files);
        setInput("");
        setFiles([]);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSlashCommandSelect = (command: SlashCommand) => {
        // Handle different command types
        switch (command.id) {
            case "image":
                setInput("[Image generation] ");
                break;
            case "web":
            case "search":
                setInput("[Search: ] ");
                break;
            case "canvas":
                setInput("[Canvas: ] ");
                break;
            case "clear":
                setInput("");
                setFiles([]);
                break;
            case "summarize":
                setInput("[Summarize] ");
                break;
            case "voice":
                setInput("[Voice input] ");
                break;
            case "code":
                setInput("[Code] ");
                break;
            default:
                setInput(command.name + " ");
        }
        setShowSlashCommands(false);
        textareaRef.current?.focus();
    };

    return (
        <div className={cn(
            "relative w-full transition-all duration-300 ease-out",
            isFocused ? "scale-[1.01]" : "scale-100"
        )}>
            {/* Glow Effect */}
            <div className={cn(
                "absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-purple-500/50 to-blue-500/50 rounded-[2rem] opacity-0 transition-opacity duration-500 blur-lg",
                isFocused && "opacity-40"
            )} />

            <div className={cn(
                "relative flex flex-col gap-2 rounded-[1.5rem] border border-white/10 bg-[#0A0A0B]/80 backdrop-blur-2xl shadow-2xl transition-all duration-300 overflow-hidden",
                isFocused ? "bg-[#0A0A0B]/95 border-white/20 shadow-[0_0_40px_-10px_rgba(139,92,246,0.2)]" : "hover:border-white/15",
                isMobile && "gap-1 rounded-[1.2rem]"
            )}>
                {/* File Previews */}
                <AnimatePresence>
                    {files.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex gap-2 px-4 pt-4 overflow-x-auto custom-scrollbar"
                        >
                            {files.map((file, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="relative group shrink-0"
                                >
                                    <div className="h-16 w-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                                        {file.type.startsWith("image/") ? (
                                            <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <FileCode className="h-8 w-8 text-white/40" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeFile(i)}
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Slash Command List */}
                {showSlashCommands && (
                    <SlashCommandList
                        filter={slashFilter}
                        onSelect={handleSlashCommandSelect}
                        onClose={() => setShowSlashCommands(false)}
                    />
                )}

                {/* Input Area */}
                <div className="flex items-end gap-2 p-3">
                    <div className="flex-1 min-w-0">
                        <Textarea
                            name="prompt"
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Ask anything..."
                            className="min-h-[44px] max-h-[200px] w-full resize-none border-0 bg-transparent px-3 py-2.5 text-[16px] md:text-base text-white placeholder:text-white/30 focus-visible:ring-0 custom-scrollbar"
                            rows={1}
                        />
                    </div>

                    {/* Send Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={(!input.trim() && files.length === 0) || isLoading}
                        size="icon"
                        className={cn(
                            isMobile
                                ? "h-9 w-9"
                                : "h-10 w-10",
                            "rounded-full transition-all duration-300 shrink-0 mb-0.5",
                            input.trim() || files.length > 0
                                ? "bg-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:bg-primary/90 hover:scale-105"
                                : "bg-white/5 text-white/30 hover:bg-white/10"
                        )}
                    >
                        {isLoading ? (
                            <Sparkles className="h-5 w-5 animate-spin" />
                        ) : (
                            <SendHorizontal className="h-5 w-5 ml-0.5" />
                        )}
                    </Button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between px-3 pb-3 pt-0">
                    <div className="flex items-center gap-1">
                        <NeoModelSelector />

                        {!isMobile && <div className="h-4 w-[1px] bg-white/10 mx-2" />}

                        <input
                            type="file"
                            multiple
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors",
                                isMobile ? "h-9 w-9" : "h-8 w-8"
                            )}
                            title="Attach files"
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors",
                                isMobile ? "h-9 w-9" : "h-8 w-8"
                            )}
                            title="Web Search"
                            onClick={() => {
                                setInput(prev => prev + "[Search: ]");
                                textareaRef.current?.focus();
                            }}
                        >
                            <Globe className="h-4 w-4" />
                        </Button>
                        {!isMobile && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                title="Voice Input"
                                onClick={() => toast.info("Voice input coming soon!")}
                            >
                                <Mic className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                            onClick={() => {
                                setInput(prev => prev + "[Canvas: ]");
                                textareaRef.current?.focus();
                            }}
                            title="Canvas Mode"
                        >
                            <Maximize2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
