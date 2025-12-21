import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/lib/stores/chat-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
    MessageSquare,
    Sparkles,
    FolderKanban,
    BookOpen,
    Plus,
    Search,
    MoreVertical,
    Trash2,
    Edit2,
    Share2,
    Settings,
    LogOut,
    ChevronRight,
    ChevronLeft,
    LayoutGrid,
    Zap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";

interface ChatItem {
    _id: string;
    title: string;
    _creationTime: number;
    lastMessageAt?: number;
    isPinned?: boolean;
    isArchived?: boolean;
}

export function AppSidebar({ className, isMobile }: { className?: string, isMobile?: boolean }) {
    // Time grouping helpers
    const getTimeGroup = (timestamp: number): "Today" | "Yesterday" | "Last 7 Days" | "Last 30 Days" | "Older" => {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (now.toDateString() === date.toDateString()) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return "Last 7 Days";
        if (diffDays < 30) return "Last 30 Days";
        return "Older";
    };

    const getRelativeTime = (timestamp: number): string => {
        const now = Date.now();
        const diffMs = now - timestamp;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    type TimeGroup = "Today" | "Yesterday" | "Last 7 Days" | "Last 30 Days" | "Older";

    const groupChatsByTime = (chatList: ChatItem[]): Record<TimeGroup, ChatItem[]> => {
        const groups: Record<TimeGroup, ChatItem[]> = {
            "Today": [],
            "Yesterday": [],
            "Last 7 Days": [],
            "Last 30 Days": [],
            "Older": []
        };

        chatList.forEach(chat => {
            const timestamp = chat.lastMessageAt || chat._creationTime;
            const group = getTimeGroup(timestamp);
            groups[group].push(chat);
        });

        return groups;
    };
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();
    const { currentChatId, setCurrentChatId } = useChatStore();
    const { setMobileSidebarOpen, setGlobalSearchOpen } = useUIStore();

    const [collapsed, setCollapsed] = useState(() => !isMobile);
    const [searchTerm, setSearchTerm] = useState("");
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
    const isChatPage = location.pathname === "/app" || location.pathname === "/";

    const chats = useQuery(api.chats.list, user ? {
        search: searchTerm || undefined,
        projectId: projectId || undefined
    } : "skip") || [];

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
            projectId: projectId || undefined
        });
        setCurrentChatId(chatId);

        // Keep the project param in the URL
        if (projectId) {
            navigate(`/app?project=${projectId}`);
        } else {
            navigate("/app");
        }

        if (isMobile) setMobileSidebarOpen(false);
    };

    const handleSelectChat = (chatId: string) => {
        setCurrentChatId(chatId as Id<"chats">);
        if (projectId) {
            navigate(`/app?project=${projectId}`);
        } else {
            navigate("/app");
        }
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
        { icon: MessageSquare, label: "Assistant", description: "Ultra-fast chat", path: "/app" },
        { icon: Sparkles, label: "Library", description: "Saved inspiration", path: "/library" },
        { icon: FolderKanban, label: "Projects", description: "Boards & kanban", path: "/projects" },
        { icon: LayoutGrid, label: "Studio", description: "Image & Video", path: "/create" },
        { icon: BookOpen, label: "Study", description: "Learning hub", path: "/study/dashboard" },
    ];

    const isCollapsed = collapsed && !isMobile;

    return (
        <aside
            className={cn(
                "relative z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group/sidebar",
                !isMobile && "h-[calc(100vh-2rem)] my-4 ml-4",
                isMobile ? "h-full w-full rounded-none border-none bg-background" : (collapsed ? "w-[80px]" : "w-[280px]"),
                !isMobile && "rounded-[2rem] border border-white/10 bg-[#0A0A0B]/60 shadow-2xl backdrop-blur-xl",
                className
            )}
        >
            {/* Inner wrapper */}
            <div className={cn("absolute inset-0 overflow-hidden flex flex-col", !isMobile && "rounded-[2rem]")}>
                {/* Subtle Background Glows */}
                <div className="pointer-events-none absolute inset-0 opacity-30">
                    <div className="absolute -left-16 top-20 h-48 w-48 rounded-full bg-primary/20 blur-[100px]" />
                    <div className="absolute -right-14 bottom-16 h-60 w-60 rounded-full bg-secondary/10 blur-[100px]" />
                </div>

                <div className="relative flex flex-1 flex-col min-h-0">
                    {/* Top Section: Profile & Search */}
                    <div className="p-3 space-y-3 shrink-0">
                        {/* Profile Card */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className={cn(
                                        "w-full flex items-center gap-3 p-2 rounded-2xl transition-all duration-200 hover:bg-white/5 border border-transparent hover:border-white/5 text-left relative overflow-hidden group/profile",
                                        isCollapsed && "justify-center p-1.5"
                                    )}>
                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0 ring-1 ring-white/20 group-hover/profile:ring-white/40 transition-all">
                                            {user.image ? (
                                                <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                user.email?.[0]?.toUpperCase()
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate text-white group-hover/profile:text-primary transition-colors">{user.name || user.email?.split("@")[0] || "User"}</p>
                                                <p className="text-[10px] truncate font-medium text-white/40">{user.email}</p>
                                            </div>
                                        )}
                                        {!isCollapsed && <Settings className="h-4 w-4 text-white/30 group-hover/profile:text-white/70 transition-colors" />}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56 bg-[#0A0A0B]/95 border-white/10 rounded-xl shadow-2xl ml-2 text-white backdrop-blur-xl">
                                    <div className="p-2 border-b border-white/10 mb-1">
                                        <p className="text-sm font-medium">{user.name || "User"}</p>
                                        <p className="text-xs text-white/50 truncate">{user.email}</p>
                                    </div>
                                    <DropdownMenuItem onClick={() => handleNavigation("/settings")} className="cursor-pointer rounded-lg focus:bg-white/10 focus:text-white">
                                        <Settings className="mr-2 h-4 w-4" /> Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem onClick={() => signOut()} className="text-red-400 cursor-pointer focus:text-red-400 focus:bg-red-500/10 rounded-lg">
                                        <LogOut className="mr-2 h-4 w-4" /> Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button onClick={() => navigate("/auth")} className="w-full rounded-xl shadow-lg bg-primary hover:bg-primary/90 text-white" size="sm">
                                {isCollapsed ? <LogOut className="h-4 w-4" /> : "Sign In"}
                            </Button>
                        )}

                        {/* Search Bar */}
                        {!isCollapsed ? (
                            <div className="relative group">
                                <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors text-white/40 group-focus-within:text-primary" />
                                <button
                                    onClick={() => setGlobalSearchOpen(true)}
                                    className="w-full h-9 pl-9 pr-3 flex items-center text-left bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:border-white/10 rounded-xl transition-all text-xs text-white/40 hover:text-white/70"
                                >
                                    Search... <span className="ml-auto text-[10px] opacity-50 border border-white/10 px-1 rounded bg-white/5">⌘K</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <Button variant="ghost" size="icon" onClick={() => setGlobalSearchOpen(true)} className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10">
                                    <Search className="h-4 w-4 text-white/60" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Scrollable Middle Section: Nav, Onboarding, History */}
                    <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-6 [&::-webkit-scrollbar]:w-0">
                        {/* Main Navigation */}
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname.startsWith(item.path);
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => handleNavigation(item.path)}
                                        className={cn(
                                            "group/nav relative w-full flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-all duration-200",
                                            isActive
                                                ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                                : "text-white/50 hover:bg-white/5 hover:text-white",
                                            isCollapsed && "justify-center px-0 py-2"
                                        )}
                                        title={isCollapsed ? item.label : ""}
                                    >
                                        <span
                                            className={cn(
                                                "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                                                isActive
                                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                    : "bg-white/5 text-white/60 group-hover/nav:bg-white/10 group-hover/nav:text-white"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                        </span>
                                        {!isCollapsed && (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium leading-none">{item.label}</span>
                                            </div>
                                        )}
                                        {isActive && !isCollapsed && (
                                            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {!isCollapsed && (
                            <div className="mx-1 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4 relative overflow-hidden group cursor-pointer hover:border-white/20 transition-colors" onClick={() => handleNavigation("/projects")}>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-white/40">Pro</p>
                                        <Zap className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                    </div>
                                    <p className="text-xs font-medium text-white/90 mb-3 leading-relaxed">Upgrade to unlock unlimited AI generations.</p>
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-[70%] bg-gradient-to-r from-primary to-purple-500" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* History Section */}
                        {isChatPage && (
                            <div className="pt-2">
                                <div className="flex items-center justify-between px-2 pb-2 sticky top-0 bg-[#0A0A0B]/0 backdrop-blur-sm z-10">
                                    <p className={cn("text-[10px] font-bold uppercase tracking-widest text-white/30", isCollapsed && "hidden")}>
                                        History
                                    </p>
                                    {!isCollapsed && (
                                        <button
                                            onClick={handleNewChat}
                                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                            title="New Chat"
                                        >
                                            <Plus className="h-3.5 w-3.5 text-white/60" />
                                        </button>
                                    )}
                                </div>

                                {chats.length === 0 ? (
                                    !isCollapsed && (
                                        <div className="px-3 py-8 text-center">
                                            <MessageSquare className="h-8 w-8 mx-auto text-white/10 mb-2" />
                                            <p className="text-xs text-white/30">No chats yet</p>
                                            <p className="text-[10px] text-white/20 mt-1">Start a conversation!</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-3">
                                        {(["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "Older"] as TimeGroup[]).map(group => {
                                            const groupedChats = groupChatsByTime(chats);
                                            const groupChats = groupedChats[group];
                                            if (groupChats.length === 0) return null;

                                            return (
                                                <div key={group}>
                                                    {!isCollapsed && (
                                                        <p className="text-[9px] uppercase tracking-wider text-white/20 px-2 pb-1 font-semibold">
                                                            {group}
                                                        </p>
                                                    )}
                                                    <div className="space-y-0.5">
                                                        <AnimatePresence initial={false}>
                                                            {groupChats.map((chat: ChatItem) => (
                                                                <motion.div
                                                                    key={chat._id}
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="relative"
                                                                >
                                                                    <ContextMenu>
                                                                        <ContextMenuTrigger asChild>
                                                                            <div
                                                                                onClick={() => handleSelectChat(chat._id)}
                                                                                className={cn(
                                                                                    "group relative flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-all duration-200 w-full",
                                                                                    currentChatId === chat._id
                                                                                        ? "bg-white/10 text-white"
                                                                                        : "bg-transparent hover:bg-white/5 text-white/50 hover:text-white",
                                                                                    isCollapsed && "justify-center px-0"
                                                                                )}
                                                                            >
                                                                                {!isCollapsed && (
                                                                                    <>
                                                                                        <MessageSquare className={cn("h-3 w-3 shrink-0", currentChatId === chat._id ? "text-primary" : "text-white/30 group-hover:text-white/50")} />
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <span className="block truncate text-xs font-medium">{chat.title}</span>
                                                                                            <span className="block text-[9px] text-white/30 group-hover:text-white/40 transition-colors">
                                                                                                {getRelativeTime(chat.lastMessageAt || chat._creationTime)}
                                                                                            </span>
                                                                                        </div>

                                                                                        <DropdownMenu>
                                                                                            <DropdownMenuTrigger asChild>
                                                                                                <Button
                                                                                                    variant="ghost"
                                                                                                    size="icon"
                                                                                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-white/10 rounded text-white/70"
                                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                                >
                                                                                                    <MoreVertical className="h-3 w-3" />
                                                                                                </Button>
                                                                                            </DropdownMenuTrigger>
                                                                                            <DropdownMenuContent align="end" className="w-44 bg-[#0A0A0B] border-white/10 text-white">
                                                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRename(chat._id, prompt("New name") || chat.title) }} className="focus:bg-white/10 focus:text-white">
                                                                                                    <Edit2 className="h-3.5 w-3.5 mr-2" /> Rename
                                                                                                </DropdownMenuItem>
                                                                                                <DropdownMenuItem onClick={(e) => handleShare(chat._id, e)} className="focus:bg-white/10 focus:text-white">
                                                                                                    <Share2 className="h-3.5 w-3.5 mr-2" /> Share
                                                                                                </DropdownMenuItem>
                                                                                                <DropdownMenuSeparator className="bg-white/10" />
                                                                                                <DropdownMenuItem
                                                                                                    onClick={(e) => { e.stopPropagation(); setDeleteId(chat._id); }}
                                                                                                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                                                                                                >
                                                                                                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                                                                                </DropdownMenuItem>
                                                                                            </DropdownMenuContent>
                                                                                        </DropdownMenu>
                                                                                    </>
                                                                                )}
                                                                                {isCollapsed && (
                                                                                    <div className={cn("h-1.5 w-1.5 rounded-full", currentChatId === chat._id ? "bg-primary" : "bg-white/20 group-hover:bg-white/40")} />
                                                                                )}
                                                                            </div>
                                                                        </ContextMenuTrigger>
                                                                        <ContextMenuContent className="w-44 bg-[#0A0A0B] border-white/10 text-white">
                                                                            <ContextMenuItem onClick={(e) => { e.stopPropagation(); handleRename(chat._id, prompt("New name") || chat.title) }} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                                                <Edit2 className="h-3.5 w-3.5 mr-2" /> Rename
                                                                            </ContextMenuItem>
                                                                            <ContextMenuItem onClick={(e) => handleShare(chat._id, e)} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                                                <Share2 className="h-3.5 w-3.5 mr-2" /> Share
                                                                            </ContextMenuItem>
                                                                            <ContextMenuSeparator className="bg-white/10" />
                                                                            <ContextMenuItem
                                                                                onClick={(e) => { e.stopPropagation(); setDeleteId(chat._id); }}
                                                                                className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                                                                            >
                                                                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                                                            </ContextMenuItem>
                                                                        </ContextMenuContent>
                                                                    </ContextMenu>
                                                                </motion.div>
                                                            ))}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer: New Chat Button */}
                    {isChatPage && (
                        <div className="p-3 shrink-0">
                            <Button
                                onClick={handleNewChat}
                                className={cn(
                                    "w-full rounded-xl shadow-lg shadow-primary/20 font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] text-white border-0",
                                    "bg-gradient-to-r from-primary to-purple-600 hover:to-purple-500",
                                    isCollapsed ? "h-10 w-10 p-0 rounded-xl" : "h-10"
                                )}
                            >
                                <Plus className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                                {!isCollapsed && "New Chat"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Collapse Button */}
            {!isMobile && (
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        "absolute -right-3 top-1/2 z-50 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border shadow-md transition-all duration-200 hover:scale-110",
                        "bg-[#0A0A0B] border-white/10 text-white/50 hover:text-white hover:border-white/30"
                    )}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </button>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-[#0A0A0B] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                            This action cannot be undone. This will permanently delete the chat and all its messages.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white border-0">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </aside>
    );
}