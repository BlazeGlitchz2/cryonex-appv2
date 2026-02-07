import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  MessageSquarePlus,
  GraduationCap,
  User,
  type LucideIcon,
} from "lucide-react";
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
    hapticFeedback("light");

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
      return (
        location.pathname === "/app" ||
        location.pathname.startsWith("/app/chat")
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient Fade for Smooth Blend */}
      <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-[#030005] to-transparent pointer-events-none" />

      <nav className="relative bg-[#030005]/80 backdrop-blur-xl border-t border-white/5 pb-safe pt-2">
        <div className="flex items-center justify-around px-2">
          {navItems.map((item) => {
            const active = !item.isCenter && isActive(item.path);
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <motion.button
                  key={item.path}
                  onClick={() => handleNavClick(item)}
                  className="relative -mt-8 touch-feedback no-select group"
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Animated Glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/40 to-cyan-500/40 blur-xl rounded-full animate-pulse-glow" />

                  {/* FAB Button */}
                  <div className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-[#1a1a2e] to-[#16213e] border border-white/10 flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.5)] group-active:scale-95 transition-transform duration-200">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon className="h-6 w-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                  </div>
                </motion.button>
              );
            }

            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl touch-feedback no-select min-w-[64px]",
                  "active:scale-95 transition-transform duration-200",
                )}
              >
                {/* Active Background */}
                {active && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-x-1 inset-y-1 bg-white/[0.08] rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "p-1.5 rounded-xl transition-all duration-300",
                      active
                        ? "text-white scale-110"
                        : "text-white/40 group-hover:text-white/60",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        active && "drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]",
                      )}
                    />
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-medium transition-all duration-300",
                      active
                        ? "text-white translate-y-0"
                        : "text-white/40 translate-y-0.5",
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
