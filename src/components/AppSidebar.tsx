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
    Settings,
    LogOut,
    Sun,
    Moon,
    Palette,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import CryonexLogo from "./CryonexLogo";
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
        { icon: MessageSquare, label: "Chat", path: "/app" },
        { icon: Sparkles, label: "Library", path: "/library" },
        { icon: FolderKanban, label: "Projects", path: "/projects" },
        { icon: BookOpen, label: "Study", path: "/study/dashboard" },
    ];

    const isCollapsed = collapsed && !isMobile;

    return (
        <aside
            className={cn(
                "flex flex-col transition-all duration-300 ease-in-out z-50 relative group/sidebar",
                !isMobile && "h-[calc(100vh-2rem)] my-4 ml-4 rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl",
                isMobile ? "h-full w-full" : (collapsed ? "w-20" : "w-72"),
                className
            )}
        >
            {/* Top Section: Profile & Search */}
            <div className="p-4 space-y-4 shrink-0">
                {/* Profile Card */}
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "w-full flex items-center gap-3 p-2 rounded-2xl transition-all duration-200 hover:bg-white/10 border border-transparent hover:border-white/5 text-left relative overflow-hidden",
                                isCollapsed && "justify-center p-1.5"
                            )}>
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0 ring-2 ring-white/10">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                                    ) : (
                                        user.email?.[0]?.toUpperCase()
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate text-foreground">{user.name || "Guest"}</p>
                                        <p className="text-[10px] text-muted-foreground truncate font-medium">{user.email}</p>
                                    </div>
                                )}
                                {!isCollapsed && <Settings className="h-4 w-4 text-muted-foreground/50" />}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 bg-black/80 backdrop-blur-xl border-white/10 rounded-xl shadow-2xl ml-2">
                            <div className="p-2 border-b border-white/10 mb-1">
                                <p className="text-sm font-medium text-foreground">{user.name || "User"}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                            <DropdownMenuItem onClick={() => handleNavigation("/settings")} className="cursor-pointer rounded-lg focus:bg-white/10">
                                <Settings className="mr-2 h-4 w-4" /> Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={toggleMode} className="cursor-pointer rounded-lg focus:bg-white/10">
                                {mode === 'dark' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                                {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setTheme(theme === 'cosmic' ? 'liquid' : 'cosmic')} className="cursor-pointer rounded-lg focus:bg-white/10">
                                <Palette className="mr-2 h-4 w-4" /> Switch Theme
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
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
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search..."
                            className="h-10 pl-9 bg-white/5 border-white/5 hover:bg-white/10 focus:bg-white/10 focus:border-primary/30 rounded-xl transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10">
                            <Search className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Main Navigation */}
            <div className="px-3 pb-4 space-y-1 shrink-0">
                <p className={cn("px-4 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2", isCollapsed && "text-center px-0")}>
                    {isCollapsed ? "Menu" : "Main Menu"}
                </p>
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden group",
                            location.pathname.startsWith(item.path)
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                            isCollapsed && "justify-center px-0"
                        )}
                        title={isCollapsed ? item.label : ""}
                    >
                        <item.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110 duration-300")} />
                        {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </button>
                ))}
            </div>

            {/* History Section */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-3">
                <div className="flex items-center justify-between px-2 py-2">
                     <p className={cn("text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest", isCollapsed && "hidden")}>
                        History
                    </p>
                </div>
               
                <ScrollArea className="flex-1 -mx-2 px-2">
                    <div className="space-y-1 pb-2">
                        <AnimatePresence initial={false}>
                        {chats.map((chat: ChatItem) => (
                            <motion.div
                                key={chat._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                onClick={() => handleSelectChat(chat._id)}
                                className={cn(
                                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                                    "hover:bg-white/5 text-sm",
                                    currentChatId === chat._id ? "bg-white/10 text-foreground font-medium shadow-inner" : "text-muted-foreground",
                                    isCollapsed && "justify-center px-0"
                                )}
                            >
                                <MessageSquare className={cn(
                                    "h-4 w-4 shrink-0 transition-colors",
                                    currentChatId === chat._id ? "text-primary" : "opacity-50 group-hover:opacity-100"
                                )} />
                                
                                {!isCollapsed && (
                                    <>
                                        <span className="flex-1 truncate text-sm">{chat.title}</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-white/10 rounded-md -mr-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 bg-black/80 backdrop-blur-xl border-white/10">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRename(chat._id, prompt("New name") || chat.title) }}>
                                                    <Edit2 className="h-3.5 w-3.5 mr-2" /> Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => handleShare(chat._id, e)}>
                                                    <Share2 className="h-3.5 w-3.5 mr-2" /> Share
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
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
            <div className="p-4 shrink-0">
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

            {/* Collapse Toggle (Desktop only) */}
            {!isMobile && (
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 bg-background border border-white/10 rounded-full flex items-center justify-center shadow-lg text-muted-foreground hover:text-foreground hover:scale-110 transition-all z-50 opacity-0 group-hover/sidebar:opacity-100"
                >
                    {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </button>
            )}
        </aside>
    );
}