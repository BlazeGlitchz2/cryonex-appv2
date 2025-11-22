import { useState } from "react";
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
    Sun,
    Moon,
    Palette,
} from "lucide-react";
import CryonexLogo from "./CryonexLogo";
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

export function AppSidebar({ className, isMobile }: { className?: string, isMobile?: boolean }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();
    const { currentChatId, setCurrentChatId } = useChatStore();
    const { theme, mode, setTheme, toggleMode } = useThemeStore();
    const { setMobileSidebarOpen } = useUIStore();

    const [collapsed, setCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

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
        navigate("/");
        if (isMobile) setMobileSidebarOpen(false);
    };

    const handleSelectChat = (chatId: string) => {
        setCurrentChatId(chatId as Id<"chats">);
        navigate("/");
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
        { icon: MessageSquare, label: "Chat", path: "/app" },
        { icon: Sparkles, label: "Library", path: "/library" },
        { icon: FolderKanban, label: "Projects", path: "/projects" },
        { icon: BookOpen, label: "Study", path: "/study/dashboard" },
    ];

    const isCollapsed = collapsed && !isMobile;

    return (
        <aside
            className={cn(
                "border-r border-white/5 bg-background/60 backdrop-blur-xl flex flex-col shadow-xl transition-all duration-300 ease-in-out z-50",
                !isMobile && "sticky top-0 h-screen",
                isMobile ? "h-full w-full" : (collapsed ? "w-20" : "w-72"),
                className
            )}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 shrink-0 border-b border-white/5">
                {(!isCollapsed) && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 overflow-hidden cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 relative overflow-hidden group">
                            <div className="absolute inset-0 flex items-center justify-center scale-150 group-hover:scale-125 transition-transform duration-500">
                                <CryonexLogo />
                            </div>
                        </div>
                        <span className="font-bold text-foreground text-lg tracking-tight">Cryonex</span>
                    </motion.div>
                )}
                {!isMobile && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollapsed(!collapsed)}
                        className={cn("text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors h-8 w-8", isCollapsed && "mx-auto")}
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Main Navigation */}
            <div className="p-3 space-y-1 shrink-0">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative overflow-hidden group",
                            location.pathname === item.path
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                            isCollapsed && "justify-center px-0"
                        )}
                        title={isCollapsed ? item.label : ""}
                    >
                        <item.icon className={cn("h-4.5 w-4.5 shrink-0 transition-colors", location.pathname === item.path && "text-primary")} />
                        {!isCollapsed && <span className="text-sm">{item.label}</span>}
                    </button>
                ))}
            </div>

            {/* Divider */}
            <div className="px-4 py-2">
                <div className="h-px bg-white/5" />
            </div>

            {/* History Section */}
            {!isCollapsed && (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="px-3 pb-2 shrink-0 space-y-2">
                        <Button onClick={handleNewChat} className="w-full justify-start gap-2 h-9 bg-primary/90 hover:bg-primary text-white shadow-sm rounded-lg font-medium transition-all" size="sm">
                            <Plus className="h-4 w-4" />
                            New Chat
                        </Button>
                        <div className="relative group">
                            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search chats..."
                                className="h-8 pl-9 text-xs bg-white/5 border-transparent focus:border-primary/20 focus:bg-white/10 rounded-lg transition-all placeholder:text-muted-foreground/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1 px-2 min-h-0">
                        <div className="space-y-0.5 pb-2">
                            <AnimatePresence initial={false}>
                            {chats.map((chat: ChatItem) => (
                                <motion.div
                                    key={chat._id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => handleSelectChat(chat._id)}
                                    className={cn(
                                        "group relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                                        "hover:bg-white/5 text-sm",
                                        currentChatId === chat._id ? "bg-white/10 text-foreground font-medium" : "text-muted-foreground"
                                    )}
                                >
                                    <MessageSquare className={cn(
                                        "h-4 w-4 shrink-0 transition-colors",
                                        currentChatId === chat._id ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground"
                                    )} />
                                    
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <p className="truncate text-sm leading-snug">
                                            {chat.title}
                                        </p>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-white/10 rounded-md -mr-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-3.5 w-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 bg-background/95 backdrop-blur-xl border-white/10">
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
                                <div className="text-center py-8 px-4">
                                    <p className="text-xs text-muted-foreground/40">No history</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Footer: Theme & User */}
            <div className="p-3 border-t border-white/5 space-y-2 shrink-0 bg-background/20">
                {!isCollapsed ? (
                    <div className="grid grid-cols-2 gap-1 bg-black/20 p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-7 text-xs gap-1.5 rounded-md transition-all", theme === 'cosmic' && "bg-primary text-primary-foreground shadow-sm")}
                            onClick={() => setTheme('cosmic')}
                        >
                            <Sparkles className="h-3.5 w-3.5" /> Cosmic
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-7 text-xs gap-1.5 rounded-md transition-all", theme === 'liquid' && "bg-blue-500 text-white shadow-sm")}
                            onClick={() => setTheme('liquid')}
                        >
                            <Palette className="h-3.5 w-3.5" /> Liquid
                        </Button>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10" onClick={() => setTheme(theme === 'cosmic' ? 'liquid' : 'cosmic')}>
                            {theme === 'cosmic' ? <Sparkles className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
                        </Button>
                    </div>
                )}

                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "w-full flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-white/5 border border-transparent hover:border-white/5 group text-left",
                                isCollapsed && "justify-center p-0 hover:bg-transparent border-0"
                            )}>
                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-inner shrink-0 overflow-hidden">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                                    ) : (
                                        user.email?.[0]?.toUpperCase()
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate text-foreground">{user.name || user.email?.split("@")[0]}</p>
                                        <p className="text-[10px] text-muted-foreground truncate opacity-70">{user.email}</p>
                                    </div>
                                )}
                                {!isCollapsed && <Settings className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-xl border-white/10 mb-2 rounded-xl shadow-2xl">
                            <div className="p-2 border-b border-white/10 mb-1">
                                <p className="text-sm font-medium text-foreground">{user.name || "User"}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                            <DropdownMenuItem onClick={() => handleNavigation("/settings")} className="cursor-pointer rounded-lg">
                                <Settings className="mr-2 h-4 w-4" /> Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={toggleMode} className="cursor-pointer rounded-lg">
                                {mode === 'dark' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                                {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10 rounded-lg">
                                <LogOut className="mr-2 h-4 w-4" /> Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button onClick={() => navigate("/auth")} className="w-full rounded-lg shadow-sm" size="sm" variant="default">
                        {isCollapsed ? <LogOut className="h-4 w-4" /> : "Sign In"}
                    </Button>
                )}
            </div>
        </aside>
    );
}