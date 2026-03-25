import { useNavigate, useLocation } from "react-router";
import {
  LayoutGrid,
  FolderOpen,
  MessageSquarePlus,
  MessageSquare,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/stores/chat-store";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  hapticFeedback,
  hapticSelection,
  isIOS,
  isAndroid,
} from "@/lib/mobile";
import { MobileUserMenu } from "@/components/ui/MobileUserMenu";
import { useDeviceType } from "@/hooks/use-mobile";

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  isCenter?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutGrid, label: "Home", path: "/study/dashboard" },
  { icon: MessageSquare, label: "Assistant", path: "/app" },
  { icon: MessageSquarePlus, label: "New", path: "/app/new", isCenter: true },
  { icon: FolderOpen, label: "Library", path: "/library" },
  { icon: User, label: "Profile", path: "/settings" },
];

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { setCurrentChatId } = useChatStore();
  const createChat = useMutation(api.chats.create);
  const deviceType = useDeviceType();
  const isiOSDevice = isIOS();
  const isAndroidDevice = isAndroid();
  const navBottomPadding = "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)";

  if (deviceType !== "phone") return null;

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
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50",
        "px-3",
      )}
      style={{
        paddingBottom: isAndroidDevice
          ? "max(var(--android-nav-height, 24px), 12px)"
          : navBottomPadding,
        transform: "translateZ(0)",
      }}
    >
      {/* Gradient Fade for Smooth Blend */}
      <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-[#030005] to-transparent pointer-events-none" />

      {/* Nav bar */}
      <nav
        className={cn(
          "pointer-events-auto mx-auto w-full border border-white/[0.08] bg-[rgba(3,0,16,0.9)] shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl",
          "max-w-lg rounded-[1.75rem] px-2.5 py-2.5",
        )}
        style={{
          transform: "translateZ(0)",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        <div
          className="grid grid-cols-5 items-end gap-1"
        >
          {navItems.map((item) => {
            if (item.label === "Profile") {
              // UserMenu handles its own rendering, but we should pass a "compact" prop if possible
              // For now, we wrap it to constrain width if needed, or leave as is if it's just an icon
              return <MobileUserMenu key={item.path} compact />;
            }

            const active = !item.isCenter && isActive(item.path);
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={cn(
                    "relative flex flex-col items-center justify-center no-select group",
                    "-mt-8",
                  )}
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    transform: "translateZ(0)",
                  }}
                >
                  <div className="absolute inset-[-6px] rounded-full bg-gradient-to-tr from-purple-500/25 to-cyan-500/25 blur-xl opacity-60" />
                  <div
                    className={cn(
                      "relative flex items-center justify-center rounded-[1.7rem] border border-white/[0.12] bg-gradient-to-tr from-[#1a1a2e] to-[#16213e]",
                      "h-14 w-14",
                      "shadow-[0_8px_24px_rgba(0,0,0,0.6),0_2px_8px_rgba(147,51,234,0.15)]",
                      "active:scale-95 transition-transform duration-150",
                    )}
                    style={{ transform: "translateZ(0)" }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/15 to-cyan-500/15" />
                    <Icon
                      className={cn(
                        "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
                        "h-6 w-6",
                      )}
                    />
                  </div>
                  <span
                    className="mt-1 text-[10px] font-medium tracking-[0.02em] text-white/60"
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavClick(item)}
                className={cn(
                  "relative flex min-h-[3.6rem] flex-col items-center justify-center no-select transition-all duration-150",
                  "rounded-[1.35rem] px-2 py-2",
                  active
                    ? "bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : "text-white/45 hover:bg-white/[0.04] hover:text-white/80",
                )}
                style={{
                  WebkitTapHighlightColor: "transparent",
                  transform: "translateZ(0)",
                }}
              >
                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <Icon
                    className={cn(
                      "transition-all duration-150",
                      active
                        ? "h-[22px] w-[22px] text-white"
                        : "h-5 w-5 text-current",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none tracking-[0.02em]",
                      active ? "text-white" : "text-white/42",
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
