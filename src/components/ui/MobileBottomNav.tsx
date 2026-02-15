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
import { hapticFeedback, hapticSelection, isIOS } from "@/lib/mobile";
import { MobileUserMenu } from "@/components/ui/MobileUserMenu";

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
  const isiOSDevice = isIOS();

  const handleNavClick = async (item: NavItem) => {
    // iOS uses selection haptic for tab switching (matches native UITabBar)
    if (isiOSDevice) {
      hapticSelection();
    } else {
      hapticFeedback("light");
    }

    if (item.isCenter) {
      // Create new chat
      hapticFeedback("medium"); // Stronger haptic for primary action
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50" style={{ transform: "translateZ(0)" }}>
      {/* Gradient Fade for Smooth Blend */}
      <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-[#030005] to-transparent pointer-events-none" />

      {/* Nav bar — height matches iOS native tab bar (49pt + safe area) */}
      <nav
        className="relative border-t border-white/5 pt-1.5"
        style={{
          background: "rgba(3, 0, 16, 0.96)", // Matches AppLayout bg #030010
          paddingBottom: "max(env(safe-area-inset-bottom), 16px)", // Ensure safe area + padding
          transform: "translateZ(0)",
        }}
      >
        <div className="flex items-center justify-around px-2">
          {navItems.map((item) => {
            if (item.label === "Profile") {
              // UserMenu handles its own rendering, but we should pass a "compact" prop if possible
              // For now, we wrap it to constrain width if needed, or leave as is if it's just an icon
              return <MobileUserMenu key={item.path} />;
            }

            const active = !item.isCenter && isActive(item.path);
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item)}
                  className="relative -mt-6 no-select group"
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    transform: "translateZ(0)",
                  }}
                >
                  {/* Animated Glow — disabled on iOS for perf */}
                  {!isiOSDevice && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/40 to-cyan-500/40 blur-xl rounded-full animate-pulse-glow" />
                  )}

                  {/* FAB Button */}
                  <div
                    className={cn(
                      "relative h-14 w-14 rounded-full bg-gradient-to-tr from-[#1a1a2e] to-[#16213e] border border-white/10 flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.5)]",
                      "active:scale-95 transition-transform duration-150",
                    )}
                    style={{ transform: "translateZ(0)" }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon className="h-6 w-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl no-select transition-all duration-200",
                  active ? "flex-[1.5] min-w-[64px]" : "flex-1 min-w-[44px]", // Active gets more space
                )}
                style={{
                  WebkitTapHighlightColor: "transparent",
                  transform: "translateZ(0)",
                }}
              >
                {/* Active Indicator Pill */}
                {active && (
                  <div className="absolute inset-0 bg-white/[0.08] rounded-2xl" />
                )}

                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <Icon
                    className={cn(
                      "transition-all duration-200",
                      active ? "h-5 w-5 text-white mb-0.5" : "h-6 w-6 text-white/40 group-hover:text-white/60"
                    )}
                  />

                  {/* Active-Only Label */}
                  {active && (
                    <span className="text-[10px] font-medium text-white animate-in fade-in zoom-in duration-200">
                      {item.label}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
