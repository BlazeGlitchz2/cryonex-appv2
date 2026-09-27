import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { isToday, isYesterday } from "date-fns";
import { useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Library,
  Loader2,
  MessageSquare,
  Moon,
  Pin,
  Plug,
  Plus,
  Search,
  Settings,
  Sun,
  Trash2,
  Pencil,
  School,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useAppLocale } from "@/hooks/use-app-locale";
import { useChatStore, DEFAULT_TEXT_MODEL } from "@/lib/stores/chat-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { BrandMark } from "@/components/BrandMark";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
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
import { Input } from "@/components/ui/input";
import { buildLoginPath } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";

const COLLAPSE_KEY = "cryonex-sidebar-collapsed";

export function WorkspaceSidebar({
  className,
  isMobile = false,
}: {
  className?: string;
  isMobile?: boolean;
  isTablet?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, isRTL } = useAppLocale();
  const { setMobileSidebarOpen, setGlobalSearchOpen } = useUIStore();
  const { currentChatId, setCurrentChatId } = useChatStore();
  const { mode, toggleMode } = useThemeStore();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<Id<"chats"> | null>(null);
  const [renameId, setRenameId] = useState<Id<"chats"> | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const isCollapsed = collapsed && !isMobile;
  const projectId = new URLSearchParams(location.search).get(
    "project",
  ) as Id<"projects"> | null;
  const chats = useQuery(
    api.chats.list,
    user ? { projectId: projectId || undefined } : "skip",
  );
  const createChat = useMutation(api.chats.create);
  const renameChat = useMutation(api.chats.rename);
  const deleteChat = useMutation(api.chats.deleteChat);
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, String(collapsed));
    } catch {
      /* Collapsing still works if storage is unavailable. */
    }
  }, [collapsed]);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) setMobileSidebarOpen(false);
  };
  const handleNewChat = async () => {
    if (!user) {
      handleNavigate(buildLoginPath("/app"));
      return;
    }
    if (creating) return;
    setCreating(true);
    try {
      const id = await createChat({
        title: t("sidebar.newChat"),
        model: DEFAULT_TEXT_MODEL,
        projectId: projectId || undefined,
      });
      setCurrentChatId(id);
      handleNavigate(
        `/app/chat/${id}${projectId ? `?project=${projectId}` : ""}`,
      );
    } catch {
      toast.error("Couldn't create a conversation. Please try again.");
    } finally {
      setCreating(false);
    }
  };
  const confirmDelete = async () => {
    if (!deleteId || saving) return;
    setSaving(true);
    try {
      await deleteChat({ chatId: deleteId });
      if (currentChatId === deleteId) {
        setCurrentChatId(null);
        if (location.pathname.startsWith("/app")) handleNavigate("/app");
      }
      toast.success(t("sidebar.chatDeleted"));
      setDeleteId(null);
    } catch {
      toast.error(t("sidebar.deleteFailed"));
    } finally {
      setSaving(false);
    }
  };
  const confirmRename = async () => {
    if (!renameId || !renameDraft.trim() || saving) return;
    setSaving(true);
    try {
      await renameChat({ chatId: renameId, title: renameDraft.trim() });
      toast.success(t("sidebar.chatRenamed"));
      setRenameId(null);
    } catch {
      toast.error("Couldn't rename this conversation. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const navItems = [
    { icon: MessageSquare, label: "Assistant", path: "/app", tourId: "home" },
    {
      icon: BookOpen,
      label: "Study space",
      path: "/study/dashboard",
      tourId: "study",
    },
    { icon: Library, label: "Library", path: "/library", tourId: "vault" },
    {
      icon: FolderKanban,
      label: "Projects",
      path: "/projects",
      tourId: "projects",
    },
    {
      icon: Plug,
      label: "Integrations",
      path: "/integrations",
      tourId: "integrations",
    },
    ...(user?.schoolId
      ? [{ icon: School, label: "School", path: "/school", tourId: "school" }]
      : []),
  ];
  const visibleChats = (chats || []).filter((chat) => !chat.isArchived);
  const groups = [
    { label: "Pinned", items: visibleChats.filter((chat) => chat.isPinned) },
    {
      label: t("sidebar.today"),
      items: visibleChats.filter(
        (chat) =>
          !chat.isPinned && isToday(chat.lastMessageAt || chat._creationTime),
      ),
    },
    {
      label: t("sidebar.yesterday"),
      items: visibleChats.filter(
        (chat) =>
          !chat.isPinned &&
          isYesterday(chat.lastMessageAt || chat._creationTime),
      ),
    },
    {
      label: "Earlier",
      items: visibleChats.filter(
        (chat) =>
          !chat.isPinned &&
          !isToday(chat.lastMessageAt || chat._creationTime) &&
          !isYesterday(chat.lastMessageAt || chat._creationTime),
      ),
    },
  ];
  return (
    <aside
      className={cn("cx-sidebar", isRTL && "dir-rtl font-arabic", className)}
      data-collapsed={isCollapsed}
      data-mobile={isMobile}
      aria-label="Workspace navigation"
    >
      <div className="cx-sidebar-brand">
        <BrandMark />
        {!isCollapsed && <strong>cryonex</strong>}
        {!isMobile && (
          <button
            className="cx-icon-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        )}
      </div>
      <button
        className="cx-new-chat"
        onClick={() => void handleNewChat()}
        disabled={creating}
        aria-label="New conversation"
        title="New conversation"
      >
        {creating ? (
          <Loader2 size={17} className="animate-spin" />
        ) : (
          <Plus size={17} />
        )}
        {!isCollapsed && <span>New conversation</span>}
      </button>
      <button
        className="cx-sidebar-search"
        id="onboarding-sidebar-search"
        onClick={() => setGlobalSearchOpen(true)}
        aria-label="Search your workspace"
        title="Search your workspace"
      >
        <Search size={15} />
        {!isCollapsed && (
          <>
            <span>Search anything</span>
            <kbd>⌘ K</kbd>
          </>
        )}
      </button>
      {!isCollapsed && <p className="cx-sidebar-label">Your workspace</p>}
      <nav className="cx-sidebar-nav" aria-label="Workspace sections">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => isMobile && setMobileSidebarOpen(false)}
            className="cx-nav-link"
            title={isCollapsed ? item.label : undefined}
            aria-label={item.label}
            aria-current={
              (
                item.path === "/study/dashboard"
                  ? location.pathname.startsWith("/study")
                  : location.pathname === item.path ||
                    location.pathname.startsWith(`${item.path}/`)
              )
                ? "page"
                : undefined
            }
            id={`onboarding-nav-${item.tourId}`}
          >
            <item.icon />
            {!isCollapsed && item.label}
          </Link>
        ))}
      </nav>
      <div className="cx-sidebar-history custom-scrollbar">
        {!isCollapsed && (
          <>
            <p className="cx-sidebar-label">Recent conversations</p>
            {user && chats === undefined ? (
              <div
                className="space-y-3 px-3"
                role="status"
                aria-label="Loading conversations"
              >
                {[1, 2, 3].map((key) => (
                  <div
                    key={key}
                    className="h-3 rounded bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : !visibleChats.length ? (
              <p className="cx-history-empty">
                {user
                  ? "Your conversations will appear here. Start with a question or a fresh idea."
                  : "Sign in to save your conversations and pick up where you left off."}
              </p>
            ) : (
              groups.map(
                (group) =>
                  group.items.length > 0 && (
                    <div key={group.label} className="mb-4">
                      <p className="px-3 pb-1 text-[10px] text-muted-foreground">
                        {group.label}
                      </p>
                      {group.items.map((chat) => (
                        <ContextMenu key={chat._id}>
                          <ContextMenuTrigger asChild>
                            <button
                              className="cx-chat-link"
                              aria-current={
                                currentChatId === chat._id ? "page" : undefined
                              }
                              onClick={() => {
                                setCurrentChatId(chat._id);
                                handleNavigate(
                                  `/app/chat/${chat._id}${projectId ? `?project=${projectId}` : ""}`,
                                );
                              }}
                            >
                              {chat.isPinned ? (
                                <Pin size={12} />
                              ) : (
                                <MessageSquare size={12} />
                              )}
                              <span>{chat.title}</span>
                            </button>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem
                              onClick={() => {
                                setRenameId(chat._id);
                                setRenameDraft(chat.title);
                              }}
                            >
                              <Pencil size={14} />
                              {t("sidebar.rename")}
                            </ContextMenuItem>
                            <ContextMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(chat._id)}
                            >
                              <Trash2 size={14} />
                              {t("sidebar.delete")}
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}
                    </div>
                  ),
              )
            )}
          </>
        )}
      </div>
      <div className="cx-sidebar-footer">
        <div className="cx-sidebar-utilities">
          <NavLink
            to="/settings"
            className="cx-nav-link"
            aria-label="Settings"
            title={isCollapsed ? "Settings" : undefined}
            onClick={() => isMobile && setMobileSidebarOpen(false)}
          >
            <Settings />
            {!isCollapsed && "Settings"}
          </NavLink>
          <button
            className="cx-nav-link w-full"
            onClick={toggleMode}
            aria-label={
              mode === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            title={isCollapsed ? "Toggle appearance" : undefined}
          >
            {mode === "light" ? <Moon /> : <Sun />}
            {!isCollapsed &&
              (mode === "light" ? "Dark appearance" : "Light appearance")}
          </button>
        </div>
        {user ? (
          <UserProfileMenu
            isCollapsed={isCollapsed}
            isMobile={isMobile}
            onNavigate={handleNavigate}
          />
        ) : (
          <button
            className="cx-guest-profile"
            onClick={() =>
              handleNavigate(
                buildLoginPath(`${location.pathname}${location.search}`),
              )
            }
            aria-label="Sign in to Cryonex"
          >
            <span className="cx-guest-avatar">C</span>
            {!isCollapsed && (
              <span>
                <strong>Your workspace awaits</strong>
                <small>Sign in to get started</small>
              </span>
            )}
          </button>
        )}
      </div>
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open && !saving) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the conversation and its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>
              Keep conversation
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {saving ? "Deleting…" : "Delete conversation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!renameId}
        onOpenChange={(open) => {
          if (!open && !saving) setRenameId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Give this conversation a name that's easy to find.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            autoFocus
            aria-label="Conversation name"
            value={renameDraft}
            onChange={(event) => setRenameDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void confirmRename();
              }
            }}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving || !renameDraft.trim()}
              onClick={(event) => {
                event.preventDefault();
                void confirmRename();
              }}
            >
              {saving ? "Saving…" : "Save name"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
