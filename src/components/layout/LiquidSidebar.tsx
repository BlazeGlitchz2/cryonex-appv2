import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/lib/stores/ui-store";
import { Avatar } from "@lobehub/ui";
import { Button } from "@/components/ui/button";
import {
    Search,
    Settings,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Zap,
    LayoutGrid,
    MessageSquare,
    FolderOpen,
    Palette,
    GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export function LiquidSidebar({ className, isMobile }: { className?: string, isMobile?: boolean }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();
    const { setMobileSidebarOpen, setGlobalSearchOpen } = useUIStore();
    const [collapsed, setCollapsed] = useState(() => !isMobile);

    useEffect(() => {
        if (isMobile) setCollapsed(false);
    }, [isMobile]);

    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile) setMobileSidebarOpen(false);
    };

    const navItems = [
        { icon: MessageSquare, label: "Assistant", path: "/app" },
        { icon: FolderOpen, label: "Library", path: "/library" },
        { icon: LayoutGrid, label: "Projects", path: "/projects" },
        { icon: Palette, label: "Studio", path: "/create" },
        { icon: GraduationCap, label: "Study", path: "/study/dashboard" },
    ];

    return (
        <aside
            className={cn(
                "relative z-50 flex flex-col transition-all duration-500 ease-out",
                !isMobile && "h-full py-4 pl-4",
                isMobile ? "h-full w-full" : (collapsed ? "w-[100px]" : "w-[320px]"),
                className
            )}
        >
            <LiquidGlass className={cn(
                "h-full flex flex-col",
                !isMobile && "rounded-[2.5rem]",
                isMobile && "rounded-none border-r border-white/10"
            )} intensity="high">

                {/* Header: Profile */}
                <div className="p-6 shrink-0">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className={cn(
                                    "w-full flex items-center gap-4 p-2 rounded-2xl transition-all duration-300 hover:bg-white/5 group/profile",
                                    collapsed && !isMobile && "justify-center p-0 h-12 w-12 mx-auto"
                                )}>
                                    <div className="relative shrink-0">
                                        <div className="absolute -inset-1 bg-white/5 rounded-full opacity-0 group-hover/profile:opacity-100 blur-md transition-opacity duration-500" />
                                        <Avatar src={user.image} alt={user.name || "User"} size={collapsed && !isMobile ? 44 : 48} className="relative border-2 border-white/10" />
                                    </div>
                                    {(!collapsed || isMobile) && (
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-sm font-bold text-white truncate">{user.name || "User"}</p>
                                            <p className="text-[10px] text-white/40 truncate font-mono tracking-wider">PRO MEMBER</p>
                                        </div>
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 bg-[#0A0A0B]/90 backdrop-blur-xl border-white/10 text-white rounded-2xl p-2">
                                <DropdownMenuItem onClick={() => handleNavigation("/settings")} className="rounded-xl focus:bg-white/10 cursor-pointer"><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem onClick={() => signOut()} className="text-red-400 rounded-xl focus:bg-red-500/10 cursor-pointer"><LogOut className="mr-2 h-4 w-4" /> Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button onClick={() => navigate("/login")} className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white">Sign In</Button>
                    )}
                </div>

                {/* Search Trigger */}
                <div className="px-6 mb-8">
                    <button
                        onClick={() => setGlobalSearchOpen(true)}
                        className={cn(
                            "w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 rounded-2xl group/search",
                            collapsed && !isMobile ? "h-12 w-12 justify-center p-0" : "h-12 px-4"
                        )}
                    >
                        <Search className="h-5 w-5 text-white/40 group-hover/search:text-white transition-colors" />
                        {(!collapsed || isMobile) && (
                            <span className="text-sm text-white/40 group-hover/search:text-white/60">Search...</span>
                        )}
                    </button>
                </div>

                {/* Nav Items */}
                <div className="flex-1 overflow-y-auto px-4 space-y-3 custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={cn(
                                    "group relative w-full flex items-center gap-4 rounded-2xl transition-all duration-300 overflow-hidden",
                                    isActive ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5",
                                    collapsed && !isMobile ? "justify-center p-3 h-14 w-14 mx-auto" : "px-5 py-4"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                                )}
                                <item.icon className={cn("h-6 w-6 transition-transform duration-300 shrink-0", isActive ? "text-white scale-110" : "group-hover:scale-110")} />
                                {(!collapsed || isMobile) && (
                                    <span className={cn("text-sm font-medium tracking-wide", isActive ? "text-white" : "text-white/60")}>{item.label}</span>
                                )}

                            </button>
                        );
                    })}
                </div>

                {/* Footer: Pro Upgrade */}
                {(!collapsed || isMobile) && (
                    <div className="p-6 mt-auto">
                        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5 group cursor-pointer hover:bg-white/10 transition-all shadow-lg">
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Zap className="h-5 w-5 text-white fill-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white transition-colors">Cryonex Pro</p>
                                    <p className="text-[10px] text-white/50 group-hover:text-white/70">Unlock infinite power</p>
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
                    className="absolute -right-4 top-1/2 z-50 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#0A0A0B] border border-white/20 text-white/50 hover:text-white hover:border-white/40 hover:bg-white/10 hover:scale-110 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            )}
        </aside>
    );
}
