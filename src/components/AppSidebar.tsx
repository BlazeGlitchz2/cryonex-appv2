import { useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

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
                "border-r border-white/10 bg-background/40 backdrop-blur-2xl flex flex-col shadow-2xl sticky top-0 h-screen z-50 transition-all duration-300 ease-in-out",
                collapsed ? "w-20" : "w-72"
            )}
        >
            {/* Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                {!collapsed && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 overflow-hidden"
                    >
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-foreground text-xl tracking-tight">Cryonex</span>
                    </motion.div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn("text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors", collapsed && "mx-auto")}
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Main Navigation */}
            <div className="p-3 space-y-1.5 shrink-0">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden group",
                            location.pathname === item.path
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                            collapsed && "justify-center px-0"
                        )}
                        title={collapsed ? item.label : ""}
                    >
                        <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", location.pathname === item.path && "text-primary")} />
                        {!collapsed && <span className="text-sm">{item.label}</span>}
                        {location.pathname === item.path && (
                            <motion.div 
                                layoutId="active-nav"
                                className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* History Section */}
            {!collapsed && (
                <div className="flex-1 flex flex-col min-h-0 border-t border-white/10 mt-2 overflow-hidden">
                    <div className="p-4 pb-2 shrink-0">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-2">
                                History
                            </h3>
                            <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-white/5 rounded-full" onClick={() => setShowHistory(!showHistory)}>
                                <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", !showHistory && "-rotate-90")} />
                            </Button>
                        </div>

                        {showHistory && (
                            <div className="space-y-3 mb-2">
                                <Button onClick={handleNewChat} className="w-full justify-start gap-2 h-10 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl font-medium transition-all hover:scale-[1.02]" size="sm">
                                    <Plus className="h-4 w-4" />
                                    New Chat
                                </Button>
                                <div className="relative group">
                                    <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        placeholder="Search chats..."
                                        className="h-9 pl-9 text-xs bg-white/5 border-white/10 focus:border-primary/50 rounded-lg transition-all"
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
                                <AnimatePresence>
                                {chats.map((chat: ChatItem) => (
                                    <motion.div
                                        key={chat._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        onClick={() => handleSelectChat(chat._id)}
                                        className={cn(
                                            "group relative flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200",
                                            "hover:bg-white/5 text-sm border border-transparent",
                                            currentChatId === chat._id && "bg-white/10 text-foreground border-white/10 shadow-sm"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5",
                                            currentChatId === chat._id ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground group-hover:text-foreground"
                                        )}>
                                            <MessageSquare className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <p className={cn(
                                                "truncate font-medium text-sm leading-snug transition-colors",
                                                currentChatId === chat._id ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                                            )}>
                                                {chat.title}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground truncate mt-1 flex items-center gap-1">
                                                <Clock className="h-2.5 w-2.5" />
                                                {formatDistanceToNow(new Date(chat.lastMessageAt || chat._creationTime), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-white/10 rounded-md"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44 bg-background/95 backdrop-blur-xl border-white/10">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Rename logic */ }}>
                                                    <Edit2 className="h-3.5 w-3.5 mr-2" /> Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => handleShare(chat._id, e)}>
                                                    <Share2 className="h-3.5 w-3.5 mr-2" /> Share
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem onClick={(e) => handleDelete(chat._id, e)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </motion.div>
                                ))}
                                </AnimatePresence>
                                {chats.length === 0 && (
                                    <div className="text-center py-12 px-4">
                                        <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground/60">No chats yet</p>
                                        <p className="text-xs text-muted-foreground/50 mt-1">Start a new conversation</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            )}

            {/* Footer: Theme & User */}
            <div className="p-4 border-t border-white/10 space-y-3 shrink-0 bg-black/10">
                {!collapsed ? (
                    <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("flex-1 h-8 text-xs gap-1.5 rounded-lg transition-all", theme === 'cosmic' && "bg-primary text-primary-foreground shadow-md")}
                            onClick={() => setTheme('cosmic')}
                        >
                            <Sparkles className="h-3.5 w-3.5" /> Cosmic
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("flex-1 h-8 text-xs gap-1.5 rounded-lg transition-all", theme === 'liquid' && "bg-blue-500 text-white shadow-md")}
                            onClick={() => setTheme('liquid')}
                        >
                            <Palette className="h-3.5 w-3.5" /> Liquid
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 items-center">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10" onClick={() => setTheme(theme === 'cosmic' ? 'liquid' : 'cosmic')}>
                            {theme === 'cosmic' ? <Sparkles className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
                        </Button>
                    </div>
                )}

                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "w-full flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-white/10 border border-transparent hover:border-white/5",
                                collapsed && "justify-center p-0 hover:bg-transparent border-0"
                            )}>
                                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-background/20 shrink-0">
                                    {user.email?.[0]?.toUpperCase()}
                                </div>
                                {!collapsed && (
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium truncate text-foreground">{user.email?.split("@")[0]}</p>
                                        <p className="text-xs text-muted-foreground truncate opacity-70">{user.email}</p>
                                    </div>
                                )}
                                {!collapsed && <Settings className="h-4 w-4 text-muted-foreground/50" />}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border-white/10 mb-2">
                            <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" /> Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={toggleMode} className="cursor-pointer">
                                {mode === 'dark' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                                {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10">
                                <LogOut className="mr-2 h-4 w-4" /> Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button onClick={() => navigate("/auth")} className="w-full rounded-xl shadow-lg shadow-primary/20" size="sm" variant="default">
                        {collapsed ? <LogOut className="h-4 w-4" /> : "Sign In"}
                    </Button>
                )}
            </div>
        </aside>
    );
}