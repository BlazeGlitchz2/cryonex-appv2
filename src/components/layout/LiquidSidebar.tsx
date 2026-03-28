import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { isToday, isYesterday, subDays, isAfter } from "date-fns";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/lib/stores/ui-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  ChevronLeft,
  MessageSquare,
  FolderOpen,
  GraduationCap,
  LineChart,
  Settings,
  Edit2,
  Trash2,
  School,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { useThemeStore } from "@/lib/stores/theme-store";

interface ChatItem {
  _id: string;
  title: string;
  _creationTime: number;
  lastMessageAt?: number;
  isPinned?: boolean;
  isArchived?: boolean;
}

export function LiquidSidebar({
  className,
  isMobile,
  isTablet,
}: {
  className?: string;
  isMobile?: boolean;
  isTablet?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { setMobileSidebarOpen, setGlobalSearchOpen } = useUIStore();
  const { currentChatId, setCurrentChatId } = useChatStore();
  const { t } = useTranslation();
  const mode = useThemeStore((state) => state.mode);
  const isLight = mode === "light";
  const textPrimary = isLight ? "text-slate-950" : "text-white";
  const textSecondary = isLight ? "text-slate-600" : "text-white/58";
  const textFaint = isLight ? "text-slate-500" : "text-white/40";
  const surfaceTone = isLight
    ? "border-rose-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,247,251,0.68))] shadow-[0_24px_80px_rgba(236,72,153,0.08)]"
    : "border-white/[0.06] bg-[linear-gradient(180deg,rgba(12,9,34,0.92),rgba(7,4,24,0.92))] shadow-[0_24px_80px_rgba(4,2,18,0.42)]";
  const insetSurface = isLight
    ? "border-rose-200/60 bg-white/65"
    : "border-white/[0.06] bg-white/[0.03]";

  const [collapsed, setCollapsed] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  useEffect(() => {
    if (isMobile) setCollapsed(false);
  }, [isMobile]);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) setMobileSidebarOpen(false);
  };

  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("project") as Id<"projects"> | null;

  const chats =
    useQuery(
      api.chats.list,
      user
        ? {
          projectId: projectId || undefined,
        }
        : "skip",
    ) || [];

  const createChat = useMutation(api.chats.create);
  const renameMutation = useMutation(api.chats.rename);
  const deleteChatMutation = useMutation(api.chats.deleteChat);

  const handleNewChat = async () => {
    if (!user) {
      toast.error("Please sign in to create chats");
      return;
    }
    const chatId = await createChat({
      title: "New Chat",
      model: "auto",
      projectId: projectId || undefined,
    });
    setCurrentChatId(chatId);
    if (projectId) navigate(`/app/chat/${chatId}?project=${projectId}`);
    else navigate(`/app/chat/${chatId}`);
    if (isMobile) setMobileSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId as Id<"chats">);
    if (projectId) navigate(`/app/chat/${chatId}?project=${projectId}`);
    else navigate(`/app/chat/${chatId}`);
    if (isMobile) setMobileSidebarOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteChatMutation({ chatId: deleteId as Id<"chats"> });
      if (currentChatId === deleteId) setCurrentChatId(null);
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete chat");
    }
    setDeleteId(null);
  };

  const handleRename = async (chatId: string, newTitle: string) => {
    await renameMutation({
      chatId: chatId as Id<"chats">,
      title: newTitle.trim(),
    });
    toast.success("Chat renamed");
  };

  const submitRename = async () => {
    if (!renameId) return;
    const nextTitle = renameDraft.trim();
    if (!nextTitle) {
      toast.error("Enter a chat title");
      return;
    }
    await handleRename(renameId, nextTitle);
    setRenameId(null);
    setRenameDraft("");
  };

  const navItems = [
    { icon: GraduationCap, label: t("study", "Dashboard"), path: "/study/dashboard" },
    { icon: FolderOpen, label: t("library", "Library"), path: "/library" },
    ...(user?.schoolId
      ? [{ icon: School, label: t("school_hub", "School Hub"), path: "/school" }]
      : []),
    { icon: MessageSquare, label: t("assistant", "Assistant"), path: "/app" },
    { icon: LineChart, label: t("progress", "Progress"), path: "/study/dashboard" },
    { icon: Settings, label: t("settings", "Settings"), path: "/settings" },
  ];

  const isCollapsed = collapsed && !isMobile;
  const isAssistantHome = location.pathname === "/app" && !currentChatId;
  const showChatHistory = !isCollapsed && user && !isAssistantHome;

  const groupChatsByTime = () => {
    const today: ChatItem[] = [];
    const yesterday: ChatItem[] = [];
    const previous7Days: ChatItem[] = [];
    const older: ChatItem[] = [];
    const sevenDaysAgo = subDays(new Date(), 7);

    chats.forEach((chat) => {
      const chatDate = new Date(chat.lastMessageAt || chat._creationTime);
      if (isToday(chatDate)) {
        today.push(chat);
      } else if (isYesterday(chatDate)) {
        yesterday.push(chat);
      } else if (isAfter(chatDate, sevenDaysAgo)) {
        previous7Days.push(chat);
      } else {
        older.push(chat);
      }
    });

    return { today, yesterday, previous7Days, older };
  };

  const renderChatGroup = (title: string, chatList: ChatItem[]) => {
    if (chatList.length === 0) return null;
    return (
      <div key={title} className="mb-4">
        <span
          className={cn(
            "mb-2 block px-2 text-[9px] font-semibold uppercase tracking-[0.16em]",
            textFaint,
          )}
        >
          {title}
        </span>
        <div className="space-y-0.5">
          {chatList.map((chat) => (
            <ContextMenu key={chat._id}>
              <ContextMenuTrigger>
                <div
                  onClick={() => handleSelectChat(chat._id)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer transition-all",
                    currentChatId === chat._id
                      ? isLight
                        ? "bg-white text-slate-950 shadow-[0_10px_24px_rgba(244,114,182,0.12)]"
                        : "bg-white/[0.08] text-white"
                      : isLight
                        ? "text-slate-600 hover:bg-white/70 hover:text-slate-950"
                        : "text-white/40 hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      currentChatId === chat._id
                        ? isLight
                          ? "bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.7)]"
                          : "bg-[#D244FF] shadow-[0_0_8px_rgba(210,68,255,0.95)]"
                        : isLight
                          ? "bg-rose-300/70"
                          : "bg-white/10",
                    )}
                  />
                  <span className="text-xs truncate flex-1">{chat.title}</span>
                  {chat.isPinned && (
                    <div
                      className={cn(
                        "absolute left-0 top-1/2 z-10 h-8 w-1 -translate-y-1/2 rounded-r-full",
                        isLight ? "bg-fuchsia-500" : "bg-[#D244FF]",
                      )}
                    />
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent
                className={cn(
                  "w-48 rounded-xl glass-panel",
                  isLight
                    ? "border-rose-200/80 bg-white/95 text-slate-950"
                    : "border-white/10 text-white",
                )}
              >
                <ContextMenuItem
                  onClick={() => {
                    setRenameId(chat._id);
                    setRenameDraft(chat.title);
                  }}
                  className={cn(
                    "rounded-lg",
                    isLight
                      ? "focus:bg-rose-50 focus:text-slate-950"
                      : "focus:bg-white/10",
                  )}
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Rename
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => setDeleteId(chat._id)}
                  className={cn(
                    "rounded-lg",
                    isLight
                      ? "text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                      : "text-red-400 focus:bg-red-500/10",
                  )}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </div>
    );
  };

  const { today, yesterday, previous7Days, older } = groupChatsByTime();

  // Use smaller width for tablets when expanded to save screen space
  const expandedWidth = isTablet ? "w-[264px]" : "w-[286px]";

  return (
    <aside
      className={cn(
        "relative z-50 flex flex-col",
        !isMobile &&
        "h-full py-4 pl-4 transition-[width] duration-200 ease-out",
        isMobile ? "h-full w-full" : collapsed ? "w-[92px]" : expandedWidth,
        className,
        "safe-left pb-[env(safe-area-inset-bottom)]",
      )}
      style={{ willChange: "width" }}
    >
      <div
        className={cn(
          "group relative flex h-full flex-col overflow-hidden border backdrop-blur-2xl",
          // Tablets get slightly less rounded corners to match the tighter fit
          !isMobile && (isTablet ? "rounded-[1.5rem]" : "rounded-[25px]"),
          isMobile &&
            (isLight
              ? "rounded-none border-r border-rose-200/60"
              : "rounded-none border-r border-white/5"),
          surfaceTone,
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            isLight
              ? "bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.09),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.18),transparent_32%)]"
              : "bg-[radial-gradient(circle_at_top,rgba(210,68,255,0.06),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_32%)]",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            isLight
              ? "bg-[radial-gradient(circle_at_top_right,rgba(255,190,219,0.18),transparent_34%)] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              : "bg-[radial-gradient(circle_at_top_right,rgba(210,68,255,0.18),transparent_34%)] opacity-0 transition-opacity duration-150 group-hover:opacity-100",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute left-0 top-0 h-24 w-full bg-gradient-to-b to-transparent",
            isLight ? "from-fuchsia-200/18" : "from-[#D244FF]/8",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute bottom-0 left-0 h-36 w-full bg-gradient-to-t to-transparent",
            isLight ? "from-white/70" : "from-[#060318]",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent to-transparent",
            isLight ? "via-rose-200/70" : "via-white/[0.06]",
          )}
        />

        {/* Header: Title / Collapse */}
        <div className="flex shrink-0 items-center justify-between p-4">
          {(!collapsed || isMobile) ? (
            <div
              className={cn(
                "flex min-w-0 items-center gap-2.5 rounded-full px-1.5 py-1.5 pr-4",
                insetSurface,
                isLight
                  ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
                  : "shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
              )}
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full">
                <img
                  src="/logo.png"
                  alt="Cryonex"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className={cn("truncate text-[13px] font-semibold tracking-wide", textPrimary)}>
                Cryonex
              </p>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
                <img
                  src="/logo.png"
                  alt="Cryonex"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
              isLight
                ? "text-slate-500 hover:bg-rose-50 hover:text-slate-950"
                : "text-white/40 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        <div className="mb-4 flex shrink-0 items-center gap-3 px-4">
          <button
            type="button"
            onClick={handleNewChat}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full border transition-transform hover:scale-[1.02]",
              isLight
                ? "border-fuchsia-200/80 bg-[linear-gradient(180deg,rgba(255,182,215,0.95),rgba(237,126,198,0.92))] text-white shadow-[0_10px_26px_rgba(236,72,153,0.18)]"
                : "border-[#d45dff]/40 bg-[linear-gradient(180deg,rgba(187,86,255,0.95),rgba(136,52,207,0.92))] text-white shadow-[0_8px_24px_rgba(178,77,255,0.28)]",
              collapsed && !isMobile
                ? "mx-auto h-[44px] w-[44px] rounded-[14px]"
                : "h-[38px] w-[38px] rounded-xl",
            )}
          >
            <Edit2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => setGlobalSearchOpen(true)}
            className={cn(
              "group/search flex items-center gap-2 rounded-full px-3 shadow-inner transition-colors",
              isLight
                ? "border border-rose-200/70 bg-white/70 hover:bg-white"
                : "border border-white/[0.06] bg-black/18 hover:bg-white/[0.04]",
              collapsed && !isMobile ? "hidden" : "h-[38px] flex-1",
            )}
            id="onboarding-sidebar-search"
          >
            <Search
              className={cn(
                "h-4 w-4 transition-colors",
                isLight
                  ? "text-slate-500 group-hover/search:text-slate-950"
                  : "text-white/40 group-hover/search:text-white",
              )}
            />
            <span
              className={cn(
                "truncate text-[13px] transition-colors",
                isLight
                  ? "text-slate-500 group-hover/search:text-slate-950"
                  : "text-white/40 group-hover/search:text-white/70",
              )}
            >
              Search Conversation...
            </span>
          </button>
        </div>

        {/* Nav Items */}
        <div className="mb-5 shrink-0 space-y-1.5 px-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-full transition-all duration-200",
                  isActive
                    ? isLight
                      ? "bg-white text-slate-950 shadow-[0_12px_30px_rgba(244,114,182,0.12)]"
                      : "bg-white/[0.06] text-white shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]"
                    : isLight
                      ? "text-slate-600 hover:bg-white/70 hover:text-slate-950"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white",
                  collapsed && !isMobile
                    ? "justify-center p-0 h-[44px] w-[44px] mx-auto"
                    : "px-4 py-2.5",
                )}
                id={`onboarding-nav-${item.label.toLowerCase()}`}
              >
                <div className="relative z-10 flex items-center gap-4 w-full">
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive
                        ? isLight
                          ? "text-slate-950"
                          : "text-white"
                        : isLight
                          ? "text-slate-500 group-hover:text-slate-950"
                          : "group-hover:text-white/84",
                    )}
                  />
                  {(!collapsed || isMobile) && (
                    <span
                      className={cn(
                        "text-sm font-medium tracking-[0.01em] transition-colors",
                        isActive
                          ? isLight
                            ? "text-slate-950"
                            : "text-white"
                          : isLight
                            ? "text-slate-600 group-hover:text-slate-950"
                            : "text-white/66 group-hover:text-white",
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Chat History */}
        {showChatHistory && (
          <div className="mt-2 flex-1 overflow-y-auto px-4 custom-scrollbar min-h-0">
            <div className="pb-4">
              <div className="mb-4 px-2">
                <p className={cn("text-[11px] font-medium", textSecondary)}>
                  Projects ({chats.length})
                </p>
              </div>
              {renderChatGroup("Today", today)}
              {renderChatGroup("Yesterday", yesterday)}
              {renderChatGroup("Previous 7 Days", previous7Days)}
              {renderChatGroup("Older", older)}
              {chats.length === 0 && (
                <div className="text-center py-6">
                  <p className={cn("text-xs", textFaint)}>No chats yet</p>
                  <p className={cn("mt-1 text-[10px]", isLight ? "text-slate-400" : "text-white/20")}>
                    Start a new conversation!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!isCollapsed && isAssistantHome && (
          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
            <div className="px-2">
              <p className={cn("text-[11px] font-medium", textSecondary)}>
                Projects (0)
              </p>
              <div className="mt-5">
                <button className={cn("flex w-full items-center justify-between rounded-full px-1 text-left text-[11px] font-semibold tracking-[0.12em]", textSecondary)}>
                  <span>Cryonex Chat</span>
                  <span className={textFaint}>⌄</span>
                </button>
              </div>
              <p className={cn("mt-3 max-w-[13rem] text-sm leading-6", textFaint)}>
                {user
                  ? "Your conversations will appear here once you start chatting."
                  : "You need to sign in to see chat history."}
              </p>
            </div>
          </div>
        )}

        <div className="mt-auto shrink-0 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
          {user ? (
            <UserProfileMenu
              isCollapsed={collapsed && !isMobile}
              isMobile={isMobile}
              onNavigate={handleNavigation}
            />
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className={cn(
                "flex w-full items-center gap-3 rounded-full border px-3 py-2 text-left transition-colors",
                isLight
                  ? "border-rose-200/70 bg-white/72 hover:bg-white"
                  : "border-white/[0.06] bg-black/18 hover:bg-white/[0.04]",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                  isLight ? "bg-slate-950 text-white" : "bg-white text-[#0a0625]",
                )}
              >
                C
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-semibold", textPrimary)}>
                  @cryo-guest
                </p>
              </div>
              <span className={textFaint}>⌄</span>
            </button>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent
          className={cn(
            "glass-panel",
            isLight
              ? "border-rose-200/80 bg-white/92 text-slate-950"
              : "border-white/10 text-white",
          )}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
            <AlertDialogDescription className={cn(isLight ? "text-slate-600" : "text-white/60")}>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={cn(
                "border",
                isLight
                  ? "border-rose-200/70 bg-white text-slate-800 hover:bg-rose-50"
                  : "border-white/10 bg-white/5 text-white hover:bg-white/10",
              )}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="border-0 bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!renameId}
        onOpenChange={(open) => {
          if (!open) {
            setRenameId(null);
            setRenameDraft("");
          }
        }}
      >
        <AlertDialogContent
          className={cn(
            "glass-panel",
            isLight
              ? "border-rose-200/80 bg-white/92 text-slate-950"
              : "border-white/10 text-white",
          )}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Chat</AlertDialogTitle>
            <AlertDialogDescription className={cn(isLight ? "text-slate-600" : "text-white/60")}>
              Give this conversation a title you can find later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={renameDraft}
            onChange={(event) => setRenameDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void submitRename();
              }
            }}
            placeholder="Lecture review"
            className={cn(
              isLight
                ? "border-rose-200/70 bg-white text-slate-950 placeholder:text-slate-400"
                : "border-white/10 bg-white/5 text-white placeholder:text-white/35",
            )}
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel
              className={cn(
                "border",
                isLight
                  ? "border-rose-200/70 bg-white text-slate-800 hover:bg-rose-50"
                  : "border-white/10 bg-white/5 text-white hover:bg-white/10",
              )}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void submitRename();
              }}
              className={cn(
                "border-0",
                isLight
                  ? "bg-slate-950 text-white hover:bg-slate-900"
                  : "bg-white text-black hover:bg-white/90",
              )}
            >
              Save title
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
