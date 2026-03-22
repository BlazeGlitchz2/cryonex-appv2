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
  LayoutGrid,
  MessageSquare,
  FolderOpen,
  Palette,
  GraduationCap,
  Edit2,
  Share2,
  Trash2,
  School,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";

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
  const shareChatMutation = useMutation(api.chats.shareChat);

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

  const handleShare = async (chatId: string) => {
    const result = await shareChatMutation({ chatId: chatId as Id<"chats"> });
    toast.success(`Shared: ${result.shareUrl}`);
  };

  const navItems = [
    { icon: MessageSquare, label: t("assistant"), path: "/app" },
    { icon: FolderOpen, label: t("vault", "Knowledge Vault"), path: "/vault" },
    { icon: LayoutGrid, label: t("projects"), path: "/projects" },
    { icon: Palette, label: t("studio"), path: "/create" },
    { icon: GraduationCap, label: t("study"), path: "/study/dashboard" },
    ...(user?.schoolId
      ? [{ icon: School, label: t("school_mode"), path: "/school" }]
      : []),
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
        <span className="mb-2 block px-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/26">
          {title}
        </span>
        <div className="space-y-0.5">
          {chatList.map((chat) => (
            <ContextMenu key={chat._id}>
              <ContextMenuTrigger>
                <div
                  onClick={() => handleSelectChat(chat._id)}
                  className={cn(
                    "group flex items-center gap-3 rounded-[1rem] px-3 py-2.5 cursor-pointer transition-all",
                    currentChatId === chat._id
                      ? "reference-toolbar-pill text-white"
                      : "text-white/40 hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      currentChatId === chat._id
                        ? "bg-[#d8e3ff] shadow-[0_0_12px_rgba(216,227,255,0.85)]"
                        : "bg-white/10",
                    )}
                  />
                  <span className="text-xs truncate flex-1">{chat.title}</span>
                  {chat.isPinned && (
                    <div className="absolute left-0 top-1/2 z-10 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#D244FF]" />
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48 glass-panel border-white/10 text-white rounded-xl">
                <ContextMenuItem
                  onClick={() => {
                    setRenameId(chat._id);
                    setRenameDraft(chat.title);
                  }}
                  className="rounded-lg focus:bg-white/10"
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Rename
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => handleShare(chat._id)}
                  className="rounded-lg focus:bg-white/10"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </ContextMenuItem>
                <ContextMenuSeparator className="bg-white/10" />
                <ContextMenuItem
                  onClick={() => setDeleteId(chat._id)}
                  className="text-red-400 rounded-lg focus:bg-red-500/10"
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
  const expandedWidth = isTablet ? "w-[280px]" : "w-[304px]";

  return (
    <aside
      className={cn(
        "relative z-50 flex flex-col",
        !isMobile &&
        "h-full py-4 pl-4 transition-[width] duration-200 ease-out",
        isMobile ? "h-full w-full" : collapsed ? "w-[96px]" : expandedWidth,
        className,
        "safe-left pb-[env(safe-area-inset-bottom)]",
      )}
      style={{ willChange: "width" }}
    >
      <div
        className={cn(
          "group deepshi-panel h-full flex flex-col overflow-hidden border-0 relative",
          // Tablets get slightly less rounded corners to match the tighter fit
          !isMobile && (isTablet ? "rounded-[1.5rem]" : "rounded-[25px]"),
          isMobile && "rounded-none border-r border-white/5",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(140,168,255,0.1),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_34%)] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
        <div className="pointer-events-none absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-white/[0.05] to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-36 w-full bg-gradient-to-t from-[#090d14] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Header: Title / Collapse */}
        <div className="flex shrink-0 items-center justify-between p-4">
          {(!collapsed || isMobile) ? (
            <div className="reference-toolbar-pill flex min-w-0 items-center gap-3 rounded-full px-2 py-2 pr-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                <img
                  src="/logo.png"
                  alt="Cryonex"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold tracking-wide text-white">
                  Cryonex
                </p>
                <p className="truncate text-[10px] uppercase tracking-[0.18em] text-white/35">
                  Study OS
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
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
            className="reference-toolbar-pill flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/45 transition-colors duration-150 hover:text-white"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        <div className="mb-4 flex shrink-0 items-center gap-3 px-4">
          <button
            type="button"
            onClick={handleNewChat}
            className={cn(
              "reference-primary-button flex shrink-0 items-center justify-center rounded-full border border-white/10 text-sm font-semibold transition-transform hover:scale-[1.02]",
              collapsed && !isMobile ? "h-[44px] w-[44px] rounded-[14px] mx-auto" : "h-[38px] w-[38px] rounded-xl"
            )}
          >
            <Edit2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => setGlobalSearchOpen(true)}
            className={cn(
              "reference-toolbar-pill group/search flex items-center gap-2 rounded-full px-3 transition-colors hover:bg-white/[0.06]",
              collapsed && !isMobile ? "hidden" : "h-[38px] flex-1",
            )}
            id="onboarding-sidebar-search"
          >
            <Search className="h-4 w-4 text-white/40 group-hover/search:text-white transition-colors" />
            <span className="truncate text-[13px] text-white/40 group-hover/search:text-white/70">
              Search chats
            </span>
          </button>
        </div>

        {/* Nav Items */}
        <div className="mb-5 shrink-0 space-y-1.5 px-4">
          {!collapsed && !isMobile && (
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/28">
              Workspace
            </p>
          )}
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "group relative flex w-full items-center gap-3 transition-all duration-200",
                  isActive
                    ? "reference-toolbar-pill text-white shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white",
                  collapsed && !isMobile
                    ? "justify-center p-0 h-[44px] w-[44px] mx-auto"
                    : "rounded-[1rem] px-4 py-3",
                )}
                id={`onboarding-nav-${item.label.toLowerCase()}`}
              >
                <div className="relative z-10 flex items-center gap-4 w-full">
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-white" : "group-hover:text-white/84",
                    )}
                  />
                  {(!collapsed || isMobile) && (
                    <span
                      className={cn(
                        "text-sm font-medium tracking-[0.01em] transition-colors",
                        isActive
                          ? "text-white"
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/28">
                  Recent chats
                </p>
              </div>
              {renderChatGroup("Today", today)}
              {renderChatGroup("Yesterday", yesterday)}
              {renderChatGroup("Previous 7 Days", previous7Days)}
              {renderChatGroup("Older", older)}
              {chats.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-xs text-white/30">No chats yet</p>
                  <p className="text-[10px] text-white/20 mt-1">
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/28">
                Recent chats
              </p>
              <div className="mt-5">
                <div className="reference-toolbar-pill flex w-full items-center justify-between rounded-[1rem] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/58">
                  <span>Chat inbox</span>
                  <span className="text-white/46">{chats.length}</span>
                </div>
              </div>
              <p className="mt-4 max-w-[13rem] text-sm leading-6 text-white/40">
                {user
                  ? "Your conversations land here after the first message, so the shell stays clean until you need history."
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
              className="reference-toolbar-pill flex w-full items-center gap-3 rounded-full px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0a0625] text-sm font-bold">
                C
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  @cryo-guest
                </p>
              </div>
              <span className="text-white/48">⌄</span>
            </button>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="glass-panel border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
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
        <AlertDialogContent className="glass-panel border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Chat</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
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
            className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void submitRename();
              }}
              className="border-0 bg-white text-black hover:bg-white/90"
            >
              Save title
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
