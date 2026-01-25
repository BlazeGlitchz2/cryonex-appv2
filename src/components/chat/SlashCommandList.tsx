import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Image as ImageIcon,
    Globe,
    Maximize2,
    Trash2,
    Sparkles,
    FileText,
    Mic,
    Code,
} from "lucide-react";

export interface SlashCommand {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
}

interface SlashCommandListProps {
    filter: string;
    onSelect: (command: SlashCommand) => void;
    onClose: () => void;
    position?: { top: number; left: number };
}

export function SlashCommandList({
    filter,
    onSelect,
    onClose,
    position,
}: SlashCommandListProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Define available commands
    const allCommands: SlashCommand[] = [
        {
            id: "image",
            name: "/image",
            description: "Generate an image with AI",
            icon: <ImageIcon className="h-4 w-4" />,
            action: () => { },
        },
        {
            id: "web",
            name: "/web",
            description: "Search the web for information",
            icon: <Globe className="h-4 w-4" />,
            action: () => { },
        },
        {
            id: "search",
            name: "/search",
            description: "Search the web (alias for /web)",
            icon: <Globe className="h-4 w-4" />,
            action: () => { },
        },
        {
            id: "canvas",
            name: "/canvas",
            description: "Open canvas mode for creative work",
            icon: <Maximize2 className="h-4 w-4" />,
            action: () => { },
        },
        {
            id: "clear",
            name: "/clear",
            description: "Clear the current conversation",
            icon: <Trash2 className="h-4 w-4" />,
            action: () => { },
        },
        {
            id: "summarize",
            name: "/summarize",
            description: "Summarize text or conversation",
            icon: <FileText className="h-4 w-4" />,
            action: () => { },
        },
        {
            id: "voice",
            name: "/voice",
            description: "Enable voice input mode",
            icon: <Mic className="h-4 w-4" />,
            action: () => { },
        },
        {
            id: "code",
            name: "/code",
            description: "Generate or analyze code",
            icon: <Code className="h-4 w-4" />,
            action: () => { },
        },
    ];

    // Filter commands based on input
    const filteredCommands = allCommands.filter((cmd) =>
        cmd.name.toLowerCase().includes(filter.toLowerCase()) ||
        cmd.description.toLowerCase().includes(filter.toLowerCase())
    );

    // Reset selection when filter changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [filter]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (filteredCommands.length === 0) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < filteredCommands.length - 1 ? prev + 1 : 0
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredCommands.length - 1
                    );
                    break;
                case "Enter":
                case "Tab":
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        onSelect(filteredCommands[selectedIndex]);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [filteredCommands, selectedIndex, onSelect, onClose]);

    if (filteredCommands.length === 0) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute bottom-full left-0 mb-2 w-full max-w-md z-50"
                style={position ? { top: position.top, left: position.left } : {}}
            >
                {/* Backdrop glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-purple-500/30 to-blue-500/30 rounded-2xl opacity-50 blur-xl" />

                <div className="relative bg-[#0A0A0B]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-semibold text-white/70">
                                Slash Commands
                            </span>
                            <span className="ml-auto text-[10px] text-white/40">
                                {filteredCommands.length} available
                            </span>
                        </div>
                    </div>

                    {/* Command List */}
                    <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-2">
                        {filteredCommands.map((command, index) => (
                            <motion.button
                                key={command.id}
                                onClick={() => onSelect(command)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group",
                                    selectedIndex === index
                                        ? "bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                                        : "bg-transparent border border-transparent hover:bg-white/5"
                                )}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                {/* Icon */}
                                <div
                                    className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-lg border transition-all",
                                        selectedIndex === index
                                            ? "bg-primary/20 border-primary/40 text-primary"
                                            : "bg-white/5 border-white/10 text-white/50 group-hover:bg-white/10 group-hover:border-white/20"
                                    )}
                                >
                                    {command.icon}
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-white truncate">
                                        {command.name}
                                    </div>
                                    <div className="text-xs text-white/40 truncate">
                                        {command.description}
                                    </div>
                                </div>

                                {/* Selection indicator */}
                                {selectedIndex === index && (
                                    <motion.div
                                        layoutId="selection"
                                        className="h-1.5 w-1.5 rounded-full bg-primary"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30,
                                        }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between text-[10px] text-white/40">
                            <span>↑↓ Navigate</span>
                            <span>↵ Select</span>
                            <span>Esc Close</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
