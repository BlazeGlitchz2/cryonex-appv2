import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import { Home, BookOpen, MessageSquarePlus, GraduationCap, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/stores/chat-store";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface NavItem {
    icon: LucideIcon;
    label: string;
    path: string;
    isCenter?: boolean;
}

const navItems: NavItem[] = [
    { icon: Home, label: "Home", path: "/app" },
    { icon: BookOpen, label: "Library", path: "/library" },
    { icon: MessageSquarePlus, label: "Chat", path: "/app/new", isCenter: true },
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
        <div className="mobile-bottom-nav md:hidden">
            <nav className="glass-panel rounded-[28px] px-2 py-2">
                <div className="flex items-center justify-around">
                    {navItems.map((item, index) => {
                        const active = !item.isCenter && isActive(item.path);
                        const Icon = item.icon;

                        if (item.isCenter) {
                            return (
                                <motion.button
                                    key={item.path}
                                    onClick={() => handleNavClick(item)}
                                    className="mobile-fab bg-gradient-to-br from-purple-500 to-indigo-600 -mt-6 border-4 border-transparent shadow-lg touch-feedback no-select"
                                    whileTap={{ scale: 0.9 }}
                                    initial={{ y: 0 }}
                                    animate={{ y: 0 }}
                                >
                                    <Icon className="h-6 w-6 text-white" />
                                </motion.button>
                            );
                        }

                        return (
                            <motion.button
                                key={item.path}
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl touch-feedback no-select min-w-[56px]",
                                    active
                                        ? "text-white"
                                        : "text-white/40 hover:text-white/60"
                                )}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="relative">
                                    <Icon className={cn("h-5 w-5 transition-colors", active && "text-purple-400")} />
                                    {active && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400"
                                            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                                        />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium transition-colors",
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
