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
            label: "Copilot",
            color: "from-indigo-500 to-purple-500",
            onClick: () => handleAction(() => {
                navigate("/study/copilot");
                setModelBrowserOpen(true);
            }),
        },
        {
            icon: <Upload className="w-5 h-5" />,
            label: "Upload",
            color: "from-cyan-500 to-blue-500",
            onClick: () => handleAction(() => navigate("/study/dashboard")),
        },
        {
            icon: <BookOpen className="w-5 h-5" />,
            label: "Library",
            color: "from-emerald-500 to-teal-500",
            onClick: () => handleAction(() => navigate("/library")),
        },
        {
            icon: <Zap className="w-5 h-5" />,
            label: "Focus",
            color: "from-orange-500 to-amber-500",
            onClick: () => handleAction(() => navigate("/study/dashboard")),
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
                                    <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10 shadow-xl uppercase tracking-wider">
                                        {action.label}
                                    </span>
                                    <button
                                        onClick={action.onClick}
                                        className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl bg-gradient-to-br border border-white/20",
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
                    "w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/20 transition-all duration-300",
                    isOpen
                        ? "bg-slate-800 rotate-45"
                        : "bg-gradient-to-br from-indigo-600 to-blue-700 hover:shadow-indigo-500/25"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7" />}
            </motion.button>
        </div>
    );
}
