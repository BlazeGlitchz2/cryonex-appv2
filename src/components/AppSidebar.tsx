import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/lib/stores/chat-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
    Sun,
    Moon,
    Palette,
    ChevronRight,
    ChevronLeft,
    PanelLeftClose,
    PanelLeftOpen
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
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();
    const { currentChatId, setCurrentChatId } = useChatStore();
    const { theme, mode, setTheme, toggleMode } = useThemeStore();
    const { setMobileSidebarOpen } = useUIStore();

    const [collapsed, setCollapsed] = useState(() => !isMobile);
    const [searchTerm, setSearchTerm] = useState("");
    useEffect(() => {
        if (isMobile) setCollapsed(false);
    }, [isMobile]);

    // Handle navigation and close mobile sidebar
    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile) setMobileSidebarOpen(false);
    };

    // Convex mutations/queries
    const chats = useQuery(api.chats.list, user ? { search: searchTerm || undefined } : "skip") || [];
    const createChat = useMutation(api.chats.create);
    const renameMutation = useMutation(api.chats.rename);
    const deleteChatMutation = useMutation(api.chats.deleteChat);
    const shareChatMutation = useMutation(api.chats.shareChat);

    const handleNewChat = async () => {
        if (!user) {
            toast.error("Please sign in to create chats");
            return;
        }
        const chatId = await createChat({ title: "New Chat", model: "auto" });
        setCurrentChatId(chatId);
        navigate("/app");
        if (isMobile) setMobileSidebarOpen(false);
    };

    const handleSelectChat = (chatId: string) => {
        setCurrentChatId(chatId as Id<"chats">);
        navigate("/app");
        if (isMobile) setMobileSidebarOpen(false);
    };

    const handleDelete = async (chatId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Delete this chat?")) {
            await deleteChatMutation({ chatId: chatId as Id<"chats"> });
            if (currentChatId === chatId) setCurrentChatId(null);
            toast.success("Chat deleted");
        }
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
        { icon: BookOpen, label: "Study", description: "Learning hub", path: "/study/dashboard" },
    ];

    const isCollapsed = collapsed && !isMobile;
    const isCosmic = theme === 'cosmic';

    return (
        <aside
            className={cn(
                "relative z-50 flex flex-col transition-all duration-500 ease-out group/sidebar",
                !isMobile && "h-[calc(100vh-2rem)] my-4 ml-4",
                isMobile ? "h-full w-full rounded-none border-none bg-background" : (collapsed ? "w-[92px]" : "w-[320px]"),
                !isMobile && "rounded-[2.75rem] border border-border/40 bg-background/80 shadow-2xl backdrop-blur-2xl",
                className
            )}
        >
            {/* Inner wrapper for overflow hidden to allow floating button outside */}
            <div className={cn("absolute inset-0 overflow-hidden flex flex-col", !isMobile && "rounded-[2.75rem]")}>
                <div className="pointer-events-none absolute inset-0 opacity-80">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
                    <div className="absolute -left-16 top-20 h-48 w-48 rounded-full bg-primary/10 blur-[120px]" />
                    <div className="absolute -right-14 bottom-16 h-60 w-60 rounded-full bg-blue-500/10 blur-[140px]" />
                    <div className="absolute inset-0 bg-background/5 mix-blend-soft-light" />
                </div>

                <div className="relative flex flex-1 flex-col">
                    {/* Top Section: Profile & Search */}
                    <div className="p-4 space-y-4 shrink-0">
                    {/* Profile Card */}
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-3xl transition-all duration-200 bg-card/30 hover:bg-card/50 border border-border/20 text-left relative overflow-hidden shadow-sm backdrop-blur",
                                    isCollapsed && "justify-center p-1.5"
                                )}>
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0 ring-2 ring-background/50">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            user.email?.[0]?.toUpperCase()
                                        )}
                                    </div>
                                    {!isCollapsed && (
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("text-sm font-bold truncate", isCosmic ? "text-white" : "text-foreground")}>{user.name || "Guest"}</p>
                                            <p className={cn("text-[10px] truncate font-medium", isCosmic ? "text-white" : "text-muted-foreground")}>{user.email}</p>
                                        </div>
                                    )}
                                    {!isCollapsed && <Settings className={cn("h-4 w-4", isCosmic ? "text-white" : "text-muted-foreground/50")} />}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 bg-popover/95 backdrop-blur-xl border-border/20 rounded-xl shadow-2xl ml-2">
                                <div className="p-2 border-b border-border/10 mb-1">
                                    <p className="text-sm font-medium text-foreground">{user.name || "User"}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                                <DropdownMenuItem onClick={() => handleNavigation("/settings")} className="cursor-pointer rounded-lg focus:bg-accent">
                                    <Settings className="mr-2 h-4 w-4" /> Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={toggleMode} className="cursor-pointer rounded-lg focus:bg-accent">
                                    {mode === 'dark' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                                    {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme(theme === 'cosmic' ? 'liquid' : 'cosmic')} className="cursor-pointer rounded-lg focus:bg-accent">
                                    <Palette className="mr-2 h-4 w-4" /> Switch Theme
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/20" />
                                <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10 rounded-lg">
                                    <LogOut className="mr-2 h-4 w-4" /> Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button onClick={() => navigate("/auth")} className="w-full rounded-xl shadow-lg bg-primary hover:bg-primary/90" size="sm">
                            {isCollapsed ? <LogOut className="h-4 w-4" /> : "Sign In"}
                        </Button>
                    )}

                    {/* Search Bar */}
                    {!isCollapsed ? (
                        <div className="relative group">
                            <Search className={cn("h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors", isCosmic ? "text-white group-focus-within:text-primary" : "text-muted-foreground group-focus-within:text-primary")} />
                            <Input
                                placeholder="Search..."
                                className={cn(
                                    "h-11 pl-10 bg-card/30 border-border/20 hover:bg-card/50 focus:bg-card/50 focus:border-primary/30 rounded-full transition-all text-sm placeholder:text-muted-foreground",
                                    isCosmic ? "text-white placeholder:text-white/70" : "text-foreground"
                                )}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-card/30 hover:bg-card/50">
                                <Search className={cn("h-5 w-5", isCosmic ? "text-white" : "text-muted-foreground")} />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Main Navigation */}
                <div className="px-3 pb-4 space-y-2 shrink-0">
                    <p className={cn("px-4 text-[10px] font-bold uppercase tracking-widest mb-1", isCollapsed && "text-center px-0", isCosmic ? "text-white" : "text-muted-foreground/50")}>
                        {isCollapsed ? "Menu" : "Navigation"}
                    </p>
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={cn(
                                    "group/nav relative w-full flex items-center gap-3 rounded-3xl border border-transparent px-2 py-2 text-left transition-all duration-300",
                                    isActive
                                        ? "bg-card/40 shadow-sm border-border/20"
                                        : "hover:bg-card/20",
                                    isActive && isCosmic ? "text-white" : isActive ? "text-foreground" : isCosmic ? "text-white hover:text-white" : "text-muted-foreground hover:text-foreground",
                                    isCollapsed && "justify-center px-0 py-2"
                                )}
                                title={isCollapsed ? item.label : ""}
                            >
                                <span
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-2xl bg-card/30 transition-all duration-300",
                                        isActive
                                            ? "bg-gradient-to-br from-primary to-purple-600 text-white shadow-inner"
                                            : isCosmic ? "text-white group-hover/nav:text-white group-hover/nav:bg-card/50" : "text-muted-foreground group-hover/nav:text-foreground group-hover/nav:bg-card/50"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                </span>
                                {!isCollapsed && (
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{item.label}</span>
                                        <span className={cn("text-[11px]", isCosmic ? "text-white/80" : "text-muted-foreground/80")}>{item.description}</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {!isCollapsed && (
                    <div className="mx-4 mb-4 rounded-[1.75rem] border border-border/20 bg-card/20 p-4 shadow-inner backdrop-blur">
                        <p className={cn("text-xs uppercase tracking-[0.3em] mb-1", isCosmic ? "text-white" : "text-muted-foreground")}>Onboarding</p>
                        <p className={cn("text-sm mb-3", isCosmic ? "text-white" : "text-foreground/80")}>Need a fresh brief? Spin up a new cosmic workspace in seconds.</p>
                        <Button
                            size="sm"
                            className="w-full rounded-2xl bg-gradient-to-r from-purple-500 via-primary to-blue-500 text-white shadow-lg"
                            onClick={() => handleNavigation("/projects")}
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add new project
                        </Button>
                    </div>
                )}

                {/* History Section */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-3">
                    <div className="flex items-center justify-between px-2 pb-1">
                        <p className={cn("text-[10px] font-bold uppercase tracking-[0.4em] ", isCollapsed && "hidden", isCosmic ? "text-white" : "text-muted-foreground/60")}>
                            Recents
                        </p>
                        {!isCollapsed && (
                            <button
                                onClick={handleNewChat}
                                className="text-[11px] font-semibold text-primary hover:text-foreground transition-colors"
                            >
                                + Fresh chat
                            </button>
                        )}
                    </div>
                
                    <ScrollArea className="flex-1 -mx-1 px-1 pb-3">
                        <div className="space-y-1.5">
                            <AnimatePresence initial={false}>
                                {chats.map((chat: ChatItem) => (
                                    <motion.div
                                        key={chat._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        onClick={() => handleSelectChat(chat._id)}
                                        className={cn(
                                            "group relative flex items-center gap-3 rounded-3xl border border-transparent px-3 py-2.5 cursor-pointer transition-all duration-300",
                                            currentChatId === chat._id
                                                ? "bg-card/40 shadow-sm border-border/20"
                                                : "bg-transparent hover:bg-card/20",
                                            currentChatId === chat._id && isCosmic ? "text-white" : currentChatId === chat._id ? "text-foreground" : isCosmic ? "text-white hover:text-white" : "text-muted-foreground hover:text-foreground",
                                            isCollapsed && "justify-center px-0"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "flex h-9 w-9 items-center justify-center rounded-2xl bg-card/30 transition-all",
                                                currentChatId === chat._id 
                                                    ? "bg-gradient-to-br from-primary to-purple-600 text-white"
                                                    : isCosmic ? "text-white" : "text-muted-foreground",
                                                isCollapsed && "h-10 w-10 rounded-3xl"
                                            )}
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                        </span>
                                        
                                        {!isCollapsed && (
                                            <>
                                                <div className="flex-1 min-w-0">
                                                    <span className="block truncate text-sm font-medium">{chat.title}</span>
                                                    <span className={cn("text-[11px]", isCosmic ? "text-white/80" : "text-muted-foreground/70")}>
                                                        {new Date(chat._creationTime).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                                    </span>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-card/50 rounded-full"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreVertical className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44 bg-popover/95 backdrop-blur-xl border-border/20">
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRename(chat._id, prompt("New name") || chat.title) }}>
                                                            <Edit2 className="h-3.5 w-3.5 mr-2" /> Rename
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => handleShare(chat._id, e)}>
                                                            <Share2 className="h-3.5 w-3.5 mr-2" /> Share
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-border/20" />
                                                        <DropdownMenuItem onClick={(e) => handleDelete(chat._id, e)} className="text-destructive">
                                                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer: New Chat Button */}
                <div className="p-4 shrink-0 space-y-2">
                    <Button 
                        onClick={handleNewChat} 
                        className={cn(
                            "w-full h-12 rounded-2xl shadow-xl shadow-primary/20 font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98]",
                            theme === 'cosmic' ? "bg-gradient-to-r from-primary to-purple-600 hover:to-purple-500" : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:to-blue-500",
                            isCollapsed && "h-12 w-12 p-0 rounded-2xl"
                        )}
                    >
                        <Plus className={cn("h-6 w-6", !isCollapsed && "mr-2")} />
                        {!isCollapsed && "New Chat"}
                    </Button>
                </div>
                </div>
            </div>

            {/* Floating Collapse Button */}
            {!isMobile && (
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        "absolute -right-3 top-1/2 z-50 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border shadow-md transition-all duration-200 hover:scale-110",
                        isCosmic 
                            ? "bg-primary border-white/20 text-white shadow-primary/20 hover:bg-primary/90" 
                            : "bg-background border-border text-foreground hover:bg-accent"
                    )}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </button>
            )}
        </aside>
    );
}