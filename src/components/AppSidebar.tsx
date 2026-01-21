import { useEffect, useState } from "react";
import { isToday, isYesterday, subDays, isAfter } from "date-fns";
import { useNavigate, useLocation } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/lib/stores/chat-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { Avatar, SearchBar } from "@lobehub/ui";
import { Button } from "@/components/ui/button";
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
    Search,
    MoreVertical,
    Trash2,
    Edit2,
    Share2,
    Settings,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Plus,
    Zap,
    Gift
} from "lucide-react";
import { IconAssistant, IconLibrary, IconProjects, IconStudio, IconStudy } from "@/components/ui/icons/Web3Icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { ReferralModal } from "@/components/viral/ReferralModal";

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
    const { setMobileSidebarOpen, setGlobalSearchOpen } = useUIStore();

    const [collapsed, setCollapsed] = useState(() => !isMobile);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showReferral, setShowReferral] = useState(false);
    const credits = useQuery(api.credits.getBalance) || 0;

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
        } catch (error) { toast.error("Failed to delete chat"); }
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
        { icon: IconAssistant, label: "Assistant", path: "/app" },
        { icon: IconLibrary, label: "Library", path: "/library" },
        { icon: IconProjects, label: "Projects", path: "/projects" },
        { icon: IconStudio, label: "Studio", path: "/create" },
        { icon: IconStudy, label: "Study", path: "/study/dashboard" },
    ];

    const isCollapsed = collapsed && !isMobile;

    return (
        <aside
            className={cn(
                "relative z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group/sidebar",
                !isMobile && "h-full py-4 pl-4",
                isMobile ? "h-full w-full bg-[#030010]" : (collapsed ? "w-[100px]" : "w-[300px]"),
                className
            )}
        >
            {/* Glass Rail Container */}
            <div className={cn(
                "relative flex flex-col h-full overflow-hidden bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]",
                !isMobile && "rounded-[2.5rem]",
                isMobile && "border-r"
            )}>
                {/* Decorative Glows */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />

                {/* Header: Profile */}
                <div className="p-4 shrink-0">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 hover:bg-white/5 group/profile",
                                    isCollapsed && "justify-center p-0 h-12 w-12 mx-auto"
                                )}>
                                    <div className="relative">
                                        <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full opacity-0 group-hover/profile:opacity-100 blur transition-opacity" />
                                        <Avatar src={user.image} alt={user.name || "User"} size={isCollapsed ? 40 : 44} className="relative border-2 border-black" />
                                    </div>
                                    {!isCollapsed && (
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-sm font-bold text-white truncate">{user.name || "User"}</p>
                                            <p className="text-[10px] text-white/40 truncate">Pro Plan</p>
                                        </div>
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 bg-[#0A0A0B]/95 backdrop-blur-xl border-white/10 text-white rounded-2xl">
                                <DropdownMenuItem onClick={() => handleNavigation("/settings")} className="rounded-xl focus:bg-white/10"><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem onClick={() => signOut()} className="text-red-400 rounded-xl focus:bg-red-500/10"><LogOut className="mr-2 h-4 w-4" /> Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button onClick={() => navigate("/login")} className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white">Sign In</Button>
                    )}
                </div>

                {/* Search */}
                <div className="px-4 mb-6">
                    {!isCollapsed ? (
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                            <SearchBar
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setGlobalSearchOpen(true)}
                                placeholder="Search..."
                                className="relative bg-black/40 border-white/10 focus:border-purple-500/50 transition-all rounded-xl"
                            />
                        </div>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={() => setGlobalSearchOpen(true)} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 mx-auto flex items-center justify-center">
                            <Search className="h-5 w-5 text-white/60" />
                        </Button>
                    )}
                </div>

                {/* Nav Items */}
                <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={cn(
                                    "group relative w-full flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300",
                                    isActive ? "bg-white/5 text-white" : "text-white/40 hover:text-white hover:bg-white/5",
                                    isCollapsed && "justify-center px-0 py-4"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                                )}
                                <item.icon className={cn("h-6 w-6 transition-transform duration-300", isActive ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "group-hover:scale-110")} />
                                {!isCollapsed && (
                                    <span className={cn("text-sm font-medium tracking-wide", isActive ? "text-white" : "text-white/60")}>{item.label}</span>
                                )}
                            </button>
                        );
                    })}

                    {/* History (Only on Chat) */}
                    {isChatPage && !isCollapsed && (
                        <div className="mt-8">
                            <div className="flex items-center justify-between px-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Recent Chats</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-white/10" onClick={handleNewChat}><Plus className="h-3 w-3 text-white/40" /></Button>
                            </div>
                            <div className="space-y-1">
                                {chats.slice(0, 5).map(chat => (
                                    <div key={chat._id} onClick={() => handleSelectChat(chat._id)} className={cn(
                                        "group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all",
                                        currentChatId === chat._id ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                                    )}>
                                        <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", currentChatId === chat._id ? "bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,1)]" : "bg-white/10")} />
                                        <span className="text-xs truncate">{chat.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer: Pro Upgrade */}
                {!isCollapsed && (
                    <div className="p-4 mt-auto">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 p-4 group cursor-pointer hover:border-purple-500/40 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <Zap className="h-4 w-4 text-white fill-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Cryonex Pro</p>
                                    <p className="text-[10px] text-white/50">Unlock all features</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Collapse Toggle */}
            {!isMobile && (
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-0 top-1/2 z-50 flex h-8 w-8 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-[#0A0A0B] border border-white/10 text-white/50 hover:text-white hover:border-white/30 hover:scale-110 transition-all shadow-xl"
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="glass-modal border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white border-0">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <ReferralModal open={showReferral} onOpenChange={setShowReferral} />
        </aside>
    );
}