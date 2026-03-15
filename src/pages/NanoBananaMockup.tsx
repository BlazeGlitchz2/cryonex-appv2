import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    BookOpen,
    User,
    Mic,
    ArrowRight,
    Calendar,
    Folder,
    Sparkles,
    Command,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Nano Banana 2 Aesthetic:
 * - Ultra-smooth micro-animations
 * - Bright minimal accents (subtle yellow/banana tones)
 * - Deep dark background with glowing orbs
 * - Premium glassmorphism
 * - 2-Clicks Maximum
 */

export default function NanoBananaMockup() {
    const [activeTab, setActiveTab] = useState("home");
    const [isListening, setIsListening] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const springConfig = { type: "spring" as const, bounce: 0.3, duration: 0.6 };

    return (
        <div className="min-h-screen bg-[#030005] text-white flex justify-center relative overflow-hidden font-sans selection:bg-yellow-500/30">

            {/* Background Ambient Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[20%] -right-[10%] w-[300px] h-[300px] bg-yellow-400/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[10%] -left-[10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Mobile App Container */}
            <div className="w-full max-w-md h-[100dvh] relative z-10 flex flex-col pt-12">

                {/* Header (1-click to profile/settings) */}
                <header className="px-6 flex items-center justify-between mb-8 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.1 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                            <Command className="w-4 h-4 text-black" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Cryonex</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ ...springConfig, delay: 0.2 }}
                        className="flex items-center gap-3"
                    >
                        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse" />
                            Online
                        </div>
                    </motion.div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar z-10">

                    {/* Greeting */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.3 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white/90">
                            Good morning, <span className="text-white">Alex.</span>
                        </h1>
                        <p className="text-white/50 mt-1 text-lg font-light">Let's study smart.</p>
                    </motion.div>

                    {/* Primary AI Assistant Widget (Glassmorphic) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.4 }}
                        className="relative p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] overflow-hidden mb-8 group"
                    >
                        {/* Animated Mesh inside card */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-[40px] group-hover:bg-yellow-400/30 transition-colors duration-700" />

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-white/90 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-yellow-400" />
                                    Ask Cryonex AI
                                </h3>
                                <p className="text-sm text-white/40 mt-1">1 click away</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-purple-500/20 border border-white/10 flex items-center justify-center backdrop-blur-md">
                                <div className="w-6 h-6 bg-yellow-400 rounded-sm shadow-[0_0_15px_rgba(250,204,21,0.5)] rotate-12 group-hover:rotate-45 transition-transform duration-500" />
                            </div>
                        </div>

                        {/* Input pill */}
                        <div className="relative flex items-center bg-black/40 border border-white/10 rounded-full p-1.5 pl-4 backdrop-blur-lg">
                            <input
                                type="text"
                                placeholder="Ask anything..."
                                className="flex-1 bg-transparent border-none text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-0"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsListening(!isListening)}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 mr-1",
                                    isListening ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-white/10 hover:bg-white/20 text-yellow-400"
                                )}
                            >
                                <Mic className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.4)] hover:shadow-[0_0_25px_rgba(250,204,21,0.6)] transition-shadow"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Quick Actions (1-click workflows) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.5 }}
                    >
                        <h4 className="text-sm font-medium text-white/40 mb-4 px-1 uppercase tracking-wider">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-4">

                            {/* Action 1 */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="p-5 rounded-[1.5rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-start gap-4 hover:bg-white/10 transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h5 className="font-medium text-white/90">Study Plan</h5>
                                    <p className="text-xs text-white/40 mt-1 line-clamp-1">Linear Algebra • 2hrs</p>
                                </div>
                            </motion.button>

                            {/* Action 2 */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="p-5 rounded-[1.5rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-start gap-4 hover:bg-white/10 transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                    <Folder className="w-5 h-5" />
                                </div>
                                <div>
                                    <h5 className="font-medium text-white/90">My Vault</h5>
                                    <p className="text-xs text-white/40 mt-1 line-clamp-1">3 new AI summaries</p>
                                </div>
                            </motion.button>

                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.6 }}
                        className="mt-6 p-4 rounded-[1.5rem] bg-gradient-to-r from-yellow-400/10 to-transparent border border-yellow-400/20 flex items-center justify-between pointer-events-auto cursor-pointer hover:bg-yellow-400/20 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse" />
                            <span className="text-sm font-medium text-yellow-50">Review Midterm Notes</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                    </motion.div>

                </div>

                {/* Floating Bottom Navigation */}
                <div className="absolute bottom-6 left-6 right-6 z-50">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.6 }}
                        className="h-16 rounded-[2rem] bg-black/60 backdrop-blur-3xl border border-white/10 flex items-center justify-between px-2 w-full mx-auto"
                        style={{ boxShadow: "0 20px 40px -10px rgba(0,0,0,0.8), inset 0 1px 0 0 rgba(255,255,255,0.1)" }}
                    >
                        {[
                            { id: "home", icon: Home, label: "Home" },
                            { id: "study", icon: BookOpen, label: "Study" },
                            { id: "profile", icon: User, label: "Profile" }
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="relative flex-1 h-full flex flex-col items-center justify-center gap-1 group"
                                >
                                    <tab.icon
                                        className={cn(
                                            "w-5 h-5 transition-all duration-300 z-10",
                                            isActive ? "text-yellow-400" : "text-white/40 group-hover:text-white/70"
                                        )}
                                    />
                                    <span className={cn(
                                        "text-[10px] font-medium transition-colors z-10",
                                        isActive ? "text-yellow-400" : "text-white/40 group-hover:text-white/70"
                                    )}>
                                        {tab.label}
                                    </span>

                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute inset-2 rounded-[1.5rem] bg-white/5 z-0"
                                            transition={springConfig}
                                        />
                                    )}
                                    {isActive && (
                                        <div className="absolute -top-1 w-8 h-1 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)] z-10" />
                                    )}
                                </button>
                            );
                        })}
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
