"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Bell, MessageCircle, ChevronUp, Loader2, X, GripVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { formatDistanceToNow } from "date-fns"
import { motion, useDragControls, AnimatePresence } from "framer-motion"

export function ActivityDropdown() {
    // Persistence for minimized state
    const [isVisible, setIsVisible] = useState(() => {
        const saved = localStorage.getItem("cryonex_notification_visible");
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [isOpen, setIsOpen] = useState(false)
    const dragControls = useDragControls()
    const constraintsRef = useRef(null)

    // Save visibility state
    useEffect(() => {
        localStorage.setItem("cryonex_notification_visible", JSON.stringify(isVisible));
    }, [isVisible]);

    // Fetch recent chats as "activities"
    const chats = useQuery(api.chats.list);
    const dismissActivity = useMutation(api.chats.dismissActivity);

    // Transform chats into activity format, filtering out dismissed ones
    const activities = chats?.filter(chat => !chat.isDismissedFromActivity).map(chat => ({
        id: chat._id,
        icon: <MessageCircle className="h-4 w-4" />,
        iconBg: "bg-neutral-700 dark:bg-neutral-700 bg-neutral-200",
        title: chat.title || "New Chat",
        description: `Chat with ${chat.model || "AI"}`,
        time: formatDistanceToNow(chat._creationTime, { addSuffix: true }),
    })) || [];

    const isLoading = chats === undefined;
    const notificationCount = activities.length;

    const handleDismiss = async (e: React.MouseEvent, chatId: any) => {
        e.stopPropagation();
        try {
            await dismissActivity({ chatId });
        } catch (error) {
            console.error("Failed to dismiss activity:", error);
        }
    };

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="relative p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors group"
                title="Show notifications"
            >
                <Bell className="h-5 w-5 text-white group-hover:text-primary transition-colors" />
                {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold shadow-lg shadow-red-500/50">
                        {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                )}
            </button>
        );
    }

    return (
        <>
            {/* Invisible constraint boundary */}
            <div ref={constraintsRef} className="fixed inset-4 pointer-events-none z-40" />

            <motion.div
                drag
                dragControls={dragControls}
                dragMomentum={false}
                dragElastic={0.1}
                dragConstraints={constraintsRef}
                className={cn(
                    "w-full max-w-md overflow-hidden select-none relative z-50",
                    "bg-[#0a0a0a]/90 border border-white/10 backdrop-blur-2xl",
                    "shadow-2xl shadow-black/50",
                    "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    isOpen ? "rounded-3xl" : "rounded-2xl",
                )}
            >
                {/* Drag Handle & Close Button */}
                <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                    <button
                        onPointerDown={(e) => dragControls.start(e)}
                        className="p-1.5 rounded-lg hover:bg-white/10 cursor-grab active:cursor-grabbing transition-colors"
                        title="Drag to move"
                    >
                        <GripVertical className="h-4 w-4 text-white/40" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsVisible(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        title="Minimize"
                    >
                        <X className="h-4 w-4 text-white/40 hover:text-white" />
                    </button>
                </div>

                {/* Header */}
                <div
                    className="flex items-center gap-4 p-4 cursor-pointer group"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/5 group-hover:border-primary/30 transition-all duration-300">
                        <Bell className="h-5 w-5 text-white group-hover:text-primary transition-colors" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-[#0a0a0a]">
                                {notificationCount > 9 ? "9+" : notificationCount}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h3 className="text-base font-semibold text-white group-hover:text-primary/90 transition-colors">
                            {isLoading ? "Checking..." : "Activity Feed"}
                        </h3>
                        <p
                            className={cn(
                                "text-sm text-white/50",
                                "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                                isOpen ? "opacity-0 max-h-0 mt-0" : "opacity-100 max-h-6 mt-0.5",
                            )}
                        >
                            {notificationCount} recent updates
                        </p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center mr-12">
                        <ChevronUp
                            className={cn(
                                "h-5 w-5 text-white/50 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                                isOpen ? "rotate-0" : "rotate-180",
                            )}
                        />
                    </div>
                </div>

                {/* Activity List */}
                <div
                    className={cn(
                        "grid",
                        "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                >
                    <div className="overflow-hidden">
                        <div className="px-2 pb-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                            <div className="space-y-1 p-1">
                                {isLoading ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
                                    </div>
                                ) : activities.length > 0 ? (
                                    <AnimatePresence initial={false}>
                                        {activities.map((activity, index) => (
                                            <motion.div
                                                key={activity.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, padding: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="group/item relative flex items-start gap-3 rounded-xl p-3 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/70">
                                                    {activity.icon}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <h4 className="text-sm font-semibold text-white">{activity.title}</h4>
                                                    <p className="text-xs text-white/50 truncate mt-0.5">{activity.description}</p>
                                                    <span className="text-[10px] text-white/30 block mt-1">
                                                        {activity.time}
                                                    </span>
                                                </div>

                                                {/* Dismiss Button */}
                                                <button
                                                    onClick={(e) => handleDismiss(e, activity.id)}
                                                    className="absolute right-2 top-2 p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 hover:bg-red-500/20 hover:text-red-400 text-white/20 transition-all"
                                                    title="Dismiss"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                ) : (
                                    <div className="text-center text-white/30 py-8 text-sm flex flex-col items-center gap-2">
                                        <Bell className="h-8 w-8 opacity-20" />
                                        <p>No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    )
}
