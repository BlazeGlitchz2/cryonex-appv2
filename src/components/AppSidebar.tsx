import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/lib/stores/chat-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
    MessageSquare,
    Sparkles,
    FolderKanban,
    BookOpen,
    Menu,
    Plus,
    Search,
    MoreVertical,
    Trash2,
    Edit2,
    Share2,
    Clock,
    Settings,
    LogOut,
    ChevronDown,
    Sun,
    Moon,
    Palette
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface ChatItem {
    _id: string;
    title: string;
    _creationTime: number;
    lastMessageAt?: number;
    isPinned?: boolean;
    isArchived?: boolean;
}

export function AppSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();
    const { currentChatId, setCurrentChatId } = useChatStore();
    const { theme, mode, setTheme, toggleMode } = useThemeStore();

    const [collapsed, setCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showHistory, setShowHistory] = useState(true);

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
        navigate("/");
    };

    const handleSelectChat = (chatId: string) => {
        setCurrentChatId(chatId as Id<"chats">);
        navigate("/");
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
        { icon: MessageSquare, label: "Chat", path: "/" },
        { icon: Sparkles, label: "Library", path: "/library" },
        { icon: FolderKanban, label: "Projects", path: "/projects" },
        { icon: BookOpen, label: "Study", path: "/study/dashboard" },
    ];

    return (
        <aside
            className={cn(
                "border-r border-border bg-sidebar/50 backdrop-blur-xl flex flex-col shadow-2xl sticky top-0 h-screen z-50 transition-all duration-300",
                collapsed ? "w-20" : "w-72"
            )}
        >
            {/* Header */}
            <div className="h-16 border-b border-border/50 flex items-center justify-between px-4 shrink-0">
                {!collapsed && (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-foreground text-lg truncate">Cryonex</span>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn("text-muted-foreground hover:text-foreground", collapsed && "mx-auto")}
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Main Navigation */}
            <div className="p-3 space-y-1 shrink-0">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden group",
                            location.pathname === item.path
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            collapsed && "justify-center px-0"
                        )}
                        title={collapsed ? item.label : ""}
                    >
                        <item.icon className={cn("h-5 w-5 shrink-0", location.pathname === item.path && "text-primary")} />
                        {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                        {location.pathname === item.path && (
                            <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-xl" />
                        )}
                    </button>
                ))}
            </div>

            {/* History Section */}
            {!collapsed && (
                <div className="flex-1 flex flex-col min-h-0 border-t border-border/50 mt-2 overflow-hidden">
                    <div className="p-3 pb-0 shrink-0">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">History</h3>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowHistory(!showHistory)}>
                                <ChevronDown className={cn("h-3 w-3 transition-transform", !showHistory && "-rotate-90")} />
                            </Button>
                        </div>

                        {showHistory && (
                            <div className="space-y-2 mb-2">
                                <Button onClick={handleNewChat} className="w-full justify-start gap-2" variant="outline" size="sm">
                                    <Plus className="h-4 w-4" />
                                    New Chat
                                </Button>
                                <div className="relative">
                                    <Search className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search..."
                                        className="h-8 pl-8 text-xs bg-background/50"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {showHistory && (
                        <ScrollArea className="flex-1 px-3 min-h-0">
                            <div className="space-y-1 pb-2">
                                {chats.map((chat: ChatItem) => (
                                    <div
                                        key={chat._id}
                                        onClick={() => handleSelectChat(chat._id)}
                                        className={cn(
                                            "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50 text-sm",
                                            currentChatId === chat._id && "bg-muted text-foreground font-medium"
                                        )}
                                    >
                                        <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <p className="truncate">{chat.title}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {formatDistanceToNow(new Date(chat.lastMessageAt || chat._creationTime), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Rename logic */ }}>
                                                    <Edit2 className="h-3 w-3 mr-2" /> Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => handleShare(chat._id, e)}>
                                                    <Share2 className="h-3 w-3 mr-2" /> Share
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={(e) => handleDelete(chat._id, e)} className="text-destructive">
                                                    <Trash2 className="h-3 w-3 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            )}

            {/* Footer: Theme & User */}
            <div className="p-3 border-t border-border/50 space-y-2 shrink-0 bg-sidebar/30">
                {!collapsed ? (
                    <div className="flex items-center gap-2 bg-background/50 p-1 rounded-lg border border-border/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("flex-1 h-7 text-xs gap-1", theme === 'cosmic' && "bg-primary/20 text-primary")}
                            onClick={() => setTheme('cosmic')}
                        >
                            <Sparkles className="h-3 w-3" /> Cosmic
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("flex-1 h-7 text-xs gap-1", theme === 'liquid' && "bg-primary/20 text-primary")}
                            onClick={() => setTheme('liquid')}
                        >
                            <Palette className="h-3 w-3" /> Liquid
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={toggleMode}
                        >
                            {mode === 'dark' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMode}>
                            {mode === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        </Button>
                    </div>
                )}

                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "w-full flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-muted",
                                collapsed && "justify-center p-0"
                            )}>
                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shrink-0">
                                    {user.email?.[0]?.toUpperCase()}
                                </div>
                                {!collapsed && (
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium truncate text-foreground">{user.email?.split("@")[0]}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56" side="right">
                            <DropdownMenuItem onClick={() => navigate("/settings")}>
                                <Settings className="mr-2 h-4 w-4" /> Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                                <LogOut className="mr-2 h-4 w-4" /> Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button onClick={() => navigate("/auth")} className="w-full" size="sm" variant="default">
                        {collapsed ? <LogOut className="h-4 w-4" /> : "Sign In"}
                    </Button>
                )}
            </div>
        </aside>
    );
}
