import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { isToday, isYesterday, subDays, isAfter } from "date-fns";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/lib/stores/ui-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { Button } from "@/components/ui/button";
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
  ChevronRight,
  ChevronLeft,
  Zap,
  LayoutGrid,
  MessageSquare,
  FolderOpen,
  Palette,
  GraduationCap,
  Plus,
  Edit2,
  Share2,
  Trash2,
  School,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslation } from "react-i18next";

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

  const [collapsed, setCollapsed] = useState(() => !isMobile);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    } catch (error) {
      toast.error("Failed to delete chat");
    }
    setDeleteId(null);
  };

  const handleRename = async (chatId: string, newTitle: string) => {
    await renameMutation({ chatId: chatId as Id<"chats">, title: newTitle });
    toast.success("Chat renamed");
  };

  const handleShare = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await shareChatMutation({ chatId: chatId as Id<"chats"> });
    toast.success(`Shared: ${result.shareUrl}`);
  };

  const navItems = [
    { icon: MessageSquare, label: t("assistant"), path: "/app" },
    { icon: FolderOpen, label: t("vault", "Knowledge Vault"), path: "/vault" },
    { icon: LayoutGrid, label: t("projects"), path: "/projects" },
    { icon: Palette, label: t("studio"), path: "/create" },
    { icon: GraduationCap, label: t("study"), path: "/study/dashboard" },
    ...(user?.schoolId ? [{ icon: School, label: t("school_mode"), path: "/school" }] : []),
  ];

  const isCollapsed = collapsed && !isMobile;

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
        <span className="text-[9px] font-semibold uppercase tracking-wider text-white/30 px-2 mb-2 block">
          {title}
        </span>
        <div className="space-y-0.5">
          {chatList.map((chat) => (
            <ContextMenu key={chat._id}>
              <ContextMenuTrigger>
                <div
                  onClick={() => handleSelectChat(chat._id)}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all",
                    currentChatId === chat._id
                      ? "bg-white/10 text-white"
                      : "text-white/40 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      currentChatId === chat._id
                        ? "bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,1)]"
                        : "bg-white/10",
                    )}
                  />
                  <span className="text-xs truncate flex-1">{chat.title}</span>
                  {chat.isPinned && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48 glass-panel border-white/10 text-white rounded-xl">
                <ContextMenuItem
                  onClick={() => {
                    const newTitle = prompt("Enter new title:", chat.title);
                    if (newTitle) handleRename(chat._id, newTitle);
                  }}
                  className="rounded-lg focus:bg-white/10"
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Rename
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={(e) => handleShare(chat._id, e as any)}
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
  const expandedWidth = isTablet ? "w-[260px]" : "w-[320px]";

  return (
    <aside
      className={cn(
        "relative z-50 flex flex-col",
        !isMobile &&
        "h-full py-4 pl-4 transition-[width] duration-200 ease-out",
        isMobile ? "h-full w-full" : collapsed ? "w-[100px]" : expandedWidth,
        className,
        "safe-left pb-[env(safe-area-inset-bottom)]"
      )}
      style={{ willChange: "width" }}
    >
      <LiquidGlass
        className={cn(
          "h-full flex flex-col overflow-hidden",
          // Tablets get slightly less rounded corners to match the tighter fit
          !isMobile && (isTablet ? "rounded-[1.5rem]" : "rounded-[2.5rem]"),
          isMobile && "rounded-none border-r border-white/10",
        )}
        intensity="high"
      >
        {/* Decorative Cyan/Indigo Gradients */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-cyan-500/5 mix-blend-overlay pointer-events-none" />

        {/* Header: Profile */}
        <div className="p-6 shrink-0">
          {user ? (
            <UserProfileMenu
              isCollapsed={collapsed && !isMobile}
              isMobile={isMobile}
              onNavigate={handleNavigation}
            />
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white"
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Search Trigger */}
        <div className="px-6 mb-4 shrink-0">
          <button
            onClick={() => setGlobalSearchOpen(true)}
            className={cn(
              "w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-colors duration-150 rounded-2xl group/search",
              collapsed && !isMobile
                ? "h-12 w-12 justify-center p-0"
                : "h-12 px-4",
            )}
            id="onboarding-sidebar-search"
          >
            <Search className="h-5 w-5 text-white/40 group-hover/search:text-white transition-colors" />
            {(!collapsed || isMobile) && (
              <span className="text-sm text-white/40 group-hover/search:text-white/60">
                Search...
              </span>
            )}
          </button>
        </div>

        {/* Nav Items */}
        <div className="px-4 space-y-2 shrink-0 mb-6">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "group relative w-full flex items-center gap-4 rounded-2xl transition-colors duration-150 overflow-hidden",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white hover:bg-white/5",
                  collapsed && !isMobile
                    ? "justify-center p-3 h-14 w-14 mx-auto"
                    : "px-5 py-3",
                )}
                id={`onboarding-nav-${item.label.toLowerCase()}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-nav"
                    className="absolute inset-0 bg-white/10 rounded-2xl"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-4 w-full">
                  <item.icon
                    className={cn(
                      "h-6 w-6 shrink-0 transition-colors",
                      isActive ? "text-cyan-400" : "group-hover:text-cyan-200"
                    )}
                  />
                  {(!collapsed || isMobile) && (
                    <span
                      className={cn(
                        "text-sm font-medium tracking-wide transition-colors",
                        isActive ? "text-white" : "text-white/60 group-hover:text-white"
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
        {!isCollapsed && user && (
          <div className="flex-1 overflow-y-auto px-4 custom-scrollbar min-h-0">
            <div className="flex items-center justify-between px-2 mb-3 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                Chat History
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 rounded-full hover:bg-white/10 mb-1"
                onClick={handleNewChat}
              >
                <Plus className="h-3 w-3 text-white/40" />
              </Button>
            </div>
            <div className="pb-4">
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

        {/* Footer: Pro Upgrade */}
        {(!collapsed || isMobile) && (
          <div className="p-6 mt-auto shrink-0 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div
              id="onboarding-pro-card"
              className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5 group cursor-pointer hover:bg-white/10 transition-colors duration-150 shadow-lg"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white fill-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white transition-colors">
                    Cryonex Pro
                  </p>
                  <p className="text-[10px] text-white/50 group-hover:text-white/70">
                    Unlock infinite power
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </LiquidGlass>

      {/* Collapse Toggle */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 top-1/2 z-50 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#0A0A0B] border border-white/20 text-white/50 hover:text-white hover:border-white/40 hover:bg-white/10 transition-colors duration-150 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      )}

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
    </aside>
  );
}
