import { useNavigate, useLocation } from "react-router";
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
import { hapticFeedback, hapticSelection, isIOS, isAndroid } from "@/lib/mobile";
import { MobileUserMenu } from "@/components/ui/MobileUserMenu";

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  isCenter?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/app" },
  { icon: BookOpen, label: "Vault", path: "/vault" },
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
  const isAndroidDevice = isAndroid();

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
      <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-[#030406] to-transparent pointer-events-none" />

      {/* Nav bar — height matches iOS native tab bar (49pt + safe area) */}
      <nav
        className="relative border-t border-white/[0.06] pt-1.5 backdrop-blur-2xl"
        style={{
          background: "rgba(9, 12, 18, 0.92)",
          paddingBottom: isAndroidDevice
            ? "max(var(--android-nav-height, 24px), 16px)"
            : "max(env(safe-area-inset-bottom), 16px)",
          transform: "translateZ(0)",
          WebkitBackfaceVisibility: "hidden",
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
                  {/* Static Glow — no animation for perf */}
                  <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-cyan-400/24 to-amber-300/20 blur-xl opacity-70" />

                  {/* FAB Button */}
                  <div
                    className={cn(
                      "relative flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)),rgba(10,12,18,0.96)]",
                      "shadow-[0_18px_40px_rgba(0,0,0,0.45),0_4px_16px_rgba(34,211,238,0.08)]",
                      "active:scale-95 transition-transform duration-150",
                    )}
                    style={{ transform: "translateZ(0)" }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/12 to-amber-300/12" />
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
                  <div className="absolute inset-0 rounded-2xl border border-white/[0.06] bg-white/[0.06]" />
                )}

                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <Icon
                    className={cn(
                      "transition-all duration-200",
                      active ? "h-[22px] w-[22px] text-white mb-0.5" : "h-6 w-6 text-white/35"
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
