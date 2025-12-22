"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Bell, MessageCircle, ChevronUp, Loader2, X, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { formatDistanceToNow } from "date-fns"
import { motion, useDragControls } from "framer-motion"

export function ActivityDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const dragControls = useDragControls()
    const constraintsRef = useRef(null)

    // Fetch recent chats as "activities"
    const chats = useQuery(api.chats.list);

    // Transform chats into activity format
    const activities = chats?.slice(0, 5).map(chat => ({
        id: chat._id,
        icon: <MessageCircle className="h-4 w-4" />,
        iconBg: "bg-neutral-700 dark:bg-neutral-700 bg-neutral-200",
        title: chat.title || "New Chat",
        description: `Chat with ${chat.model || "AI"}`,
        time: formatDistanceToNow(chat._creationTime, { addSuffix: true }),
    })) || [];

    const isLoading = chats === undefined;

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors"
                title="Show notifications"
            >
                <Bell className="h-5 w-5 text-white" />
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
                    "bg-white/5 border border-white/10 backdrop-blur-xl",
                    "shadow-xl shadow-black/50",
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
                        title="Close"
                    >
                        <X className="h-4 w-4 text-white/40 hover:text-white" />
                    </button>
                </div>

                {/* Header */}
                <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 transition-colors duration-300">
                        <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h3 className="text-base font-semibold text-white">
                            {isLoading ? "Checking..." : `${activities.length} Recent Activities`}
                        </h3>
                        <p
                            className={cn(
                                "text-sm text-white/50",
                                "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                                isOpen ? "opacity-0 max-h-0 mt-0" : "opacity-100 max-h-6 mt-0.5",
                            )}
                        >
                            Your latest AI conversations
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
                        <div className="px-2 pb-4">
                            <div className="space-y-1">
                                {isLoading ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
                                    </div>
                                ) : activities.length > 0 ? (
                                    activities.map((activity, index) => (
                                        <div
                                            key={activity.id}
                                            className={cn(
                                                "flex items-start gap-3 rounded-xl p-3",
                                                "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                                                "hover:bg-white/10",
                                                isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                                            )}
                                            style={{
                                                transitionDelay: isOpen ? `${index * 75}ms` : "0ms",
                                            }}
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 transition-colors duration-300">
                                                <span className="text-white/70">{activity.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-white">{activity.title}</h4>
                                                <p className="text-sm text-white/50 truncate">{activity.description}</p>
                                            </div>
                                            <span className="text-xs text-white/30 shrink-0 pt-0.5">
                                                {activity.time}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-white/50 p-4 text-sm">No recent activity</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    )
}
