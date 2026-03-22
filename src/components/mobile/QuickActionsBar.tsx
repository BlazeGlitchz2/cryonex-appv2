import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, BookOpen, Zap, X, Upload } from "lucide-react";
import { useNavigate } from "react-router";
import { useChatStore } from "@/lib/stores/chat-store";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function QuickActionsBar() {
    const [isOpen, setIsOpen] = React.useState(false);
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { setModelBrowserOpen } = useChatStore();

    if (!isMobile) return null;

    const handleAction = async (action: () => void) => {
        try {
            await Haptics.impact({ style: ImpactStyle.Medium });
        } catch {
            // Ignore haptic failure
        }
        action();
        setIsOpen(false);
    };

    const actions = [
        {
            icon: <MessageSquare className="w-5 h-5" />,
            label: "AI Chat",
            color: "text-cyan-100",
            onClick: () => handleAction(() => {
                navigate("/app");
                setModelBrowserOpen(true);
            }),
        },
        {
            icon: <Upload className="w-5 h-5" />,
            label: "Upload",
            color: "text-sky-100",
            onClick: () => handleAction(() => navigate("/study")),
        },
        {
            icon: <BookOpen className="w-5 h-5" />,
            label: "Library",
            color: "text-emerald-100",
            onClick: () => handleAction(() => navigate("/vault")),
        },
        {
            icon: <Zap className="w-5 h-5" />,
            label: "Focus",
            color: "text-amber-100",
            onClick: () => handleAction(() => navigate("/study")),
        },
    ];

    return (
        <div className="fixed bottom-24 right-6 z-[100] md:hidden">
            <AnimatePresence>
                {isOpen && (
                    <div className="relative">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]"
                        />

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse items-end gap-3 mb-4">
                            {actions.map((action, index) => (
                                <motion.div
                                    key={action.label}
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-3"
                                >
                                    <span className="rounded-xl border border-white/10 bg-[rgba(9,12,18,0.82)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xl backdrop-blur-md">
                                        {action.label}
                                    </span>
                                    <button
                                        onClick={action.onClick}
                                        className={cn(
                                            "flex h-12 w-12 items-center justify-center rounded-2xl border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03)),rgba(9,12,18,0.96)] text-white shadow-2xl",
                                            action.color
                                        )}
                                    >
                                        {action.icon}
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={async () => {
                    try {
                        await Haptics.impact({ style: ImpactStyle.Heavy });
                    } catch {
                        // Ignore haptic failure
                    }
                    setIsOpen(!isOpen);
                }}
                className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-[1.5rem] border border-white/16 text-white shadow-[0_12px_32px_rgba(0,0,0,0.42)] transition-all duration-300",
                    isOpen
                        ? "rotate-45 bg-[rgba(9,12,18,0.94)]"
                        : "bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03)),rgba(9,12,18,0.96)] hover:border-cyan-300/18"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7" />}
            </motion.button>
        </div>
    );
}
