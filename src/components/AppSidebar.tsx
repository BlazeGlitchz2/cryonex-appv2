import { useEffect, useState } from "react";
import { isToday, isYesterday, subDays, isAfter } from "date-fns";
import { useNavigate, useLocation } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { DEFAULT_TEXT_MODEL, useChatStore } from "@/lib/stores/chat-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { SearchBar } from "@lobehub/ui";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { CreditIndicator } from "@/components/credits/CreditIndicator";
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
  Trash2,
  Edit2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Zap,
  X,
} from "lucide-react";
import {
  IconAssistant,
  IconLibrary,
  IconProjects,
  IconStudio,
  IconStudy,
} from "@/components/ui/icons/Web3Icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { ReferralModal } from "@/components/viral/ReferralModal";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

interface ChatItem {
  _id: string;
  title: string;
  _creationTime: number;
  lastMessageAt?: number;
  isPinned?: boolean;
  isArchived?: boolean;
}

export function AppSidebar({
  className,
  isMobile,
}: {
  className?: string;
  isMobile?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { currentChatId, setCurrentChatId } = useChatStore();
  const { setMobileSidebarOpen, setGlobalSearchOpen } = useUIStore();

  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [showReferral, setShowReferral] = useState(false);

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
          search: searchTerm || undefined,
          projectId: projectId || undefined,
        }
        : "skip",
    ) || [];
  const wallet = useQuery(api.credits.getWallet, user ? {} : "skip");

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
      model: DEFAULT_TEXT_MODEL,
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
    { icon: IconAssistant, label: "Home", path: "/app" },
    { icon: IconStudy, label: "Study", path: "/study/dashboard" },
    { icon: IconStudio, label: "Create", path: "/create" },
    { icon: IconLibrary, label: "Vault", path: "/library" },
    { icon: IconProjects, label: "School", path: "/school" },
  ];

  const isCollapsed = collapsed && !isMobile;

  // Group chats by time period
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
      <div key={title}>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-white/30 px-2 mb-1 block">
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
                        ? "bg-blue-600 shadow-[0_0_5px_rgba(37,99,235,0.9)]"
                        : "bg-white/10",
                    )}
                  />
                  <span className="text-xs truncate flex-1">{chat.title}</span>
                  {chat.isPinned && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48 bg-[#0a0625]/95 backdrop-blur-xl border-white/[0.06] text-white rounded-xl">
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

  return (
    <motion.aside
      animate={
        isMobile ? { width: "100%" } : { width: isCollapsed ? 100 : 300 }
      }
      transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.85 }}
      className={cn(
        "relative z-50 flex flex-col group/sidebar",
        !isMobile && "h-full py-4 pl-4",
        isMobile && "h-full w-full bg-[#050218]",
        className,
      )}
    >
      {/* Glass Rail Container */}
      <div
        className={cn(
          "relative flex flex-col h-full border border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,18,32,0.94),rgba(7,10,20,0.96))] shadow-[0_24px_60px_rgba(2,6,23,0.36)] backdrop-blur-2xl",
          !isMobile && "rounded-[1.25rem] overflow-hidden",
          isMobile && "border-r fixed inset-0 z-50 overflow-y-auto", // Mobile: Fixed full screen, scrollable
        )}
      >
        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {/* Decorative Glows */}
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-500/10 to-transparent" />

        {/* Header: Profile */}
        <div className="p-4 shrink-0">
          {user ? (
            <div className="space-y-3">
              <UserProfileMenu
                isCollapsed={isCollapsed}
                isMobile={isMobile}
                onNavigate={handleNavigation}
              />
              {!isCollapsed && (
                <div className="px-1">
                  <CreditIndicator type="main" className="w-full min-w-0" />
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white"
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="px-4 mb-4">
          {!isCollapsed ? (
            <div className="relative group">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/14 to-cyan-400/10 opacity-0 blur transition-opacity group-hover:opacity-100" />
              <SearchBar
                id="onboarding-sidebar-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setGlobalSearchOpen(true)}
                placeholder="Search..."
                className="relative rounded-xl border-white/[0.08] bg-white/[0.055] transition-all focus:border-blue-400/45"
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setGlobalSearchOpen(true)}
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.055] hover:bg-white/10"
            >
              <Search className="h-5 w-5 text-white/60" />
            </Button>
          )}
        </div>

        {/* Nav Items */}
        <div className="px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                id={`onboarding-nav-${item.label.toLowerCase()}`}
                className={cn(
                  "group relative w-full flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300",
                  isActive
                    ? "bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "text-white/45 hover:bg-white/[0.055] hover:text-white",
                  isCollapsed && "justify-center px-0 py-4",
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-500 to-cyan-400 shadow-[0_0_14px_rgba(37,99,235,0.35)]" />
                )}
                <item.icon
                  className={cn(
                    "h-6 w-6 transition-transform duration-300",
                    isActive
                      ? "scale-110 text-blue-100 drop-shadow-[0_0_8px_rgba(96,165,250,0.34)]"
                      : "group-hover:scale-110",
                  )}
                />
                {!isCollapsed && (
                  <span
                    className={cn(
                      "text-sm font-medium tracking-wide",
                      isActive ? "text-white" : "text-white/60",
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Chat History - Always visible when not collapsed and user is logged in */}
        {!isCollapsed && user && (
          <div className="flex-1 overflow-y-auto px-4 mt-6 custom-scrollbar">
            <button
              type="button"
              onClick={() => setShowReferral(true)}
              className="mb-4 w-full rounded-xl border border-blue-400/14 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),rgba(255,255,255,0.04))] px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-blue-400/28 hover:shadow-[0_18px_40px_rgba(37,99,235,0.12)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200/70">
                    Credits
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {wallet?.cryoCredits?.toFixed?.(2) ?? "0.00"}
                  </p>
                  <p className="mt-1 text-xs text-white/55">
                    Refuel, referrals, and focus rewards
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-300/20 bg-blue-400/10 text-blue-200 shadow-[0_0_24px_rgba(37,99,235,0.16)]">
                  <Zap className="h-4.5 w-4.5" />
                </div>
              </div>
            </button>
            <div className="flex items-center justify-between px-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                Chat History
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 rounded-full hover:bg-white/10"
                onClick={handleNewChat}
              >
                <Plus className="h-3 w-3 text-white/40" />
              </Button>
            </div>
            <div className="space-y-4">
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
        {!isCollapsed && (
          <div className="p-4 mt-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowReferral(true)}
              className="group relative w-full overflow-hidden rounded-xl border border-blue-400/14 bg-gradient-to-br from-blue-500/10 via-white/[0.035] to-transparent p-4 text-left transition-all hover:-translate-y-0.5 hover:border-blue-400/28"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-600/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-600/20">
                  <Zap className="h-4 w-4 text-white fill-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Cryonex Pro</p>
                  <p className="text-[10px] text-white/50">
                    Invite friends or unlock all features
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-0 top-1/2 z-50 flex h-8 w-8 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-[#0b1220] text-white/55 shadow-xl transition-all hover:scale-110 hover:border-white/20 hover:text-white"
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
        <AlertDialogContent className="glass-modal border-white/[0.06] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/[0.06] text-white hover:bg-white/10">
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
        <AlertDialogContent className="glass-modal border-white/[0.06] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Chat</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Give this conversation a clear, recognizable title.
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
            placeholder="Exam prep outline"
            className="border-white/[0.06] bg-white/5 text-white placeholder:text-white/35"
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/[0.06] text-white hover:bg-white/10">
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
      <ReferralModal open={showReferral} onOpenChange={setShowReferral} />
    </motion.aside>
  );
}
