import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    FolderOpen,
    MessageSquare,
    Inbox,
    Wallet,
    ShoppingBag,
    Settings,
    Plus,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Sparkles,
    Search,
    User,
    GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const Sidebar = ({ className }: { className?: string }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: FolderOpen, label: "Projects", path: "/projects" },
        { icon: MessageSquare, label: "Feed", path: "/feed" },
        { icon: Inbox, label: "Inbox", path: "/inbox", badge: 2 },
        { icon: GraduationCap, label: "Study", path: "/study" },
        { icon: Wallet, label: "Savings", path: "/savings" },
        { icon: ShoppingBag, label: "Sales", path: "/sales" },
    ];

    return (
        <motion.div
            initial={{ width: isCollapsed ? 80 : 280 }}
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
                "relative h-screen flex flex-col z-50",
                "bg-sidebar/40 backdrop-blur-xl border-r border-sidebar-border",
                "shadow-[0_0_40px_-10px_rgba(0,0,0,0.2)]",
                className
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 z-50 bg-primary text-primary-foreground rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Header / User Profile */}
            <div className="p-6 flex items-center gap-4 mb-6">
                <div className="relative group cursor-pointer">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <Avatar className="relative h-12 w-12 border-2 border-background">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>

                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col overflow-hidden whitespace-nowrap"
                        >
                            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                Sophia Reynolds
                            </span>
                            <span className="text-xs text-muted-foreground">Pro Member</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Search Bar */}
            <div className="px-4 mb-6">
                <div className={cn(
                    "flex items-center bg-background/20 rounded-xl px-3 py-2 border border-white/10 transition-all focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-background/30",
                    isCollapsed ? "justify-center" : "gap-2"
                )}>
                    <Search size={20} className="text-muted-foreground shrink-0" />
                    {!isCollapsed && (
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/50"
                        />
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 space-y-2 overflow-y-auto scrollbar-hide">
                <div className="text-xs font-semibold text-muted-foreground/50 px-4 mb-2 tracking-wider">
                    {!isCollapsed && "MENU"}
                </div>

                <TooltipProvider delayDuration={0}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Tooltip key={item.path}>
                                <TooltipTrigger asChild>
                                    <Link to={item.path}>
                                        <div
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                                isActive
                                                    ? "bg-primary/10 text-primary shadow-[0_0_20px_-5px_var(--primary)]"
                                                    : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 bg-primary/10 border-l-2 border-primary"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            )}

                                            <item.icon
                                                size={22}
                                                className={cn(
                                                    "shrink-0 transition-transform duration-300 group-hover:scale-110",
                                                    isActive && "text-primary"
                                                )}
                                            />

                                            {!isCollapsed && (
                                                <span className="font-medium truncate relative z-10">
                                                    {item.label}
                                                </span>
                                            )}

                                            {!isCollapsed && item.badge && (
                                                <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-primary/50">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                </TooltipTrigger>
                                {isCollapsed && (
                                    <TooltipContent side="right" className="bg-popover/80 backdrop-blur-md border-white/10 text-popover-foreground">
                                        {item.label}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </div>

            {/* Onboarding / CTA */}
            <div className="p-4 mt-auto">
                {!isCollapsed ? (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 p-4 group">
                        <div className="absolute inset-0 bg-primary/10 blur-xl group-hover:bg-primary/20 transition-colors duration-500" />
                        <div className="relative z-10 flex flex-col items-center text-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/50 group-hover:scale-110 transition-transform duration-300">
                                <Plus className="text-white" />
                            </div>
                            <h4 className="font-bold text-sm">Add New Project</h4>
                            <p className="text-xs text-muted-foreground">Unlock more features</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
                            <Plus size={20} />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className={cn(
                                "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground",
                                isCollapsed && "justify-center"
                            )}>
                                <Settings size={20} className="animate-spin-slow hover:animate-spin" />
                                {!isCollapsed && <span>Settings</span>}
                            </button>
                        </TooltipTrigger>
                        {isCollapsed && <TooltipContent side="right">Settings</TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
            </div>
        </motion.div>
    );
};

export default Sidebar;
