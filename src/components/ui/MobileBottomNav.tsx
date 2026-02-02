import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import { Home, BookOpen, MessageSquarePlus, GraduationCap, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/stores/chat-store";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { hapticFeedback } from "@/lib/mobile";

interface NavItem {
    icon: LucideIcon;
    label: string;
    path: string;
    isCenter?: boolean;
}

const navItems: NavItem[] = [
    { icon: Home, label: "Home", path: "/app" },
    { icon: BookOpen, label: "Library", path: "/library" },
    { icon: MessageSquarePlus, label: "New", path: "/app/new", isCenter: true },
    { icon: GraduationCap, label: "Study", path: "/study/dashboard" },
    { icon: User, label: "Profile", path: "/settings" },
];

export function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { setCurrentChatId } = useChatStore();
    const createChat = useMutation(api.chats.create);

    const handleNavClick = async (item: NavItem) => {
        // Trigger haptic feedback for native feel
        hapticFeedback('light');

        if (item.isCenter) {
            // Create new chat
            if (!user) {
                navigate("/app");
                return;
            }
            try {
                const chatId = await createChat({
                    title: "New Chat",
                    model: "auto",
                });
                setCurrentChatId(chatId);
                navigate(`/app/chat/${chatId}`);
            } catch (error) {
                toast.error("Failed to create chat");
                navigate("/app");
            }
        } else {
            navigate(item.path);
        }
    };

    const isActive = (path: string) => {
        if (path === "/app") {
            return location.pathname === "/app" || location.pathname.startsWith("/app/chat");
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="mobile-bottom-nav-premium md:hidden">
            <nav className="relative">
                <div className="flex items-center justify-around">
                    {navItems.map((item) => {
                        const active = !item.isCenter && isActive(item.path);
                        const Icon = item.icon;

                        if (item.isCenter) {
                            return (
                                <motion.button
                                    key={item.path}
                                    onClick={() => handleNavClick(item)}
                                    className="relative -mt-7 touch-feedback no-select"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 bg-purple-500/40 blur-xl rounded-full animate-pulse-glow" />

                                    {/* FAB Button */}
                                    <div className="relative mobile-fab-premium">
                                        <Icon className="h-6 w-6 text-white drop-shadow-lg" />
                                    </div>
                                </motion.button>
                            );
                        }

                        return (
                            <motion.button
                                key={item.path}
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-1 py-2 px-4 touch-feedback no-select min-w-[60px]"
                                )}
                                whileTap={{ scale: 0.92 }}
                            >
                                {/* Active Background */}
                                {active && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        className="absolute inset-1 bg-white/5 rounded-2xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                    />
                                )}

                                <div className="relative z-10">
                                    <Icon
                                        className={cn(
                                            "h-6 w-6 transition-all duration-200",
                                            active
                                                ? "text-white"
                                                : "text-white/40"
                                        )}
                                    />

                                    {/* Active Indicator Dot */}
                                    {active && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400"
                                            style={{
                                                boxShadow: '0 0 8px rgba(168, 85, 247, 0.8)'
                                            }}
                                            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                                        />
                                    )}
                                </div>

                                <span className={cn(
                                    "text-[10px] font-medium transition-all duration-200 relative z-10",
                                    active ? "text-white" : "text-white/40"
                                )}>
                                    {item.label}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
