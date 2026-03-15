import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Sparkles,
    Network,
    BookOpen,
    BrainCircuit,
    Timer,
    Clock,
    Zap,
    Mic,
    ChevronRight,
    Search,
    Play,
    Users,
    Copy,
    Share2,
    Trophy,
    ArrowRight,
    Flame,
    ShieldCheck,
    Brain,
    X,
    Target,
    Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import {
    AreaChart,
    Area,
    XAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { FlashcardMode } from "@/components/study/FlashcardMode";
import { QuizGenerator } from "@/components/study/QuizGenerator";
import { PomodoroTimer } from "@/components/study/PomodoroTimer";
import { StudyUploadZone } from "@/components/study/StudyUploadZone";
import { LectureRecorder } from "@/components/study/LectureRecorder";
import { FocusMode } from "@/components/study/FocusMode";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation, useAction } from "convex/react";
import { cn } from "@/lib/utils";
import { RegionalTrainer } from "@/components/study/RegionalTrainer";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export default function MobileStudyDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeFeature, setActiveFeature] = useState<
        "dashboard" | "flashcards" | "quiz" | "regional_trainer"
    >("dashboard");
    const [selectedTopic, setSelectedTopic] = useState("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [newGoalText, setNewGoalText] = useState("");

    // Data
    const stats = useQuery(api.study.getStats);
    const dailyGoals = useQuery(api.study.getDailyGoals, {
        date: new Date().toISOString().split("T")[0],
    });
    const recommendations = useQuery(api.study.getStudyRecommendations);
    const allFlashcards = useQuery(api.study.listAllFlashcards) || [];
    const weeklyActivity = useQuery(api.study.getWeeklyActivity);
    const recentMaterials = useQuery(api.study.getRecentMaterials, { limit: 6 });
    const wallet = useQuery(api.credits.getWallet);

    // Mutations & Actions
    const createGoal = useMutation(api.study.createGoal);
    const completeGoal = useMutation(api.study.completeGoal);
    const initializeStats = useMutation(api.study.initializeStats);
    const createMaterial = useMutation(api.study.createMaterial);
    const generateAssets = useAction(api.autoGenerate.generateAllAssets);
    const generateAffiliateCode = useMutation(api.viral.generateAffiliateCode);
    const [isReferralOpen, setIsReferralOpen] = useState(false);
    const [referralCode, setReferralCode] = useState("");

    const handleOpenReferral = async () => {
        setIsReferralOpen(true);
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) { }
        try {
            const code = await generateAffiliateCode();
            setReferralCode(code);
        } catch (e) {
            toast.error("Failed to generate code");
        }
    };

    useEffect(() => {
        if (user && stats === null) initializeStats();
    }, [user, stats, initializeStats]);

    const handleAddGoal = async () => {
        if (!newGoalText.trim()) return;
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) { }
        await createGoal({ text: newGoalText.trim(), date: new Date().toISOString().split("T")[0] });
        setNewGoalText("");
        setIsAddingGoal(false);
        toast.success("Goal added!");
    };

    const handleToggleGoal = async (goalId: any, currentStatus: boolean) => {
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) { }
        await completeGoal({ goalId, isCompleted: !currentStatus });
    };

    const weeklyData = weeklyActivity || [
        { name: "Sun", hours: 0 },
        { name: "Mon", hours: 0 },
        { name: "Tue", hours: 0 },
        { name: "Wed", hours: 0 },
        { name: "Thu", hours: 0 },
        { name: "Fri", hours: 0 },
        { name: "Sat", hours: 0 },
    ];

    const formatStudyTime = (ms: number) => {
        if (!ms) return "0m";
        const totalMinutes = Math.floor(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    };

    /* ─── Feature card data ─── */
    const featureCards = [
        {
            id: "flashcards" as const,
            title: "Flashcards",
            desc: `${recommendations?.dueFlashcardsCount || 0} cards due`,
            icon: BookOpen,
            accent: "cyan",
            action: async () => {
                try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                setActiveFeature("flashcards");
            },
        },
        {
            id: "quiz" as const,
            title: "AI Quiz",
            desc: "Test yourself",
            icon: BrainCircuit,
            accent: "blue",
            action: async () => {
                try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                setActiveFeature("quiz");
            },
        },
        {
            id: "focus" as const,
            title: "Focus",
            desc: "Pomodoro + ambient",
            icon: Timer,
            accent: "emerald",
            action: async () => {
                try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { }
                console.log("Focus button clicked, setting isFocusModeOpen to true");
                setIsFocusModeOpen(true);
            },
            live: true,
        },
    ];

    const accentMap: Record<string, { bg: string; border: string; text: string; gradient: string; glow: string }> = {
        cyan: {
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/15",
            text: "text-cyan-400",
            gradient: "from-cyan-500/10 to-transparent",
            glow: "group-hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]",
        },
        blue: {
            bg: "bg-blue-500/10",
            border: "border-blue-500/15",
            text: "text-blue-400",
            gradient: "from-blue-500/10 to-transparent",
            glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
        },
        emerald: {
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/15",
            text: "text-emerald-400",
            gradient: "from-emerald-500/10 to-transparent",
            glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
        },
        amber: {
            bg: "bg-amber-500/10",
            border: "border-amber-500/15",
            text: "text-amber-400",
            gradient: "from-amber-500/10 to-transparent",
            glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
        },
    };

    return (
        <div className="flex-1 h-full w-full relative bg-[#09090b] text-white overflow-hidden flex flex-col">
            {/* Ambient background — unified with desktop */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[80%] h-[50%] rounded-full bg-cyan-600/15 blur-[80px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.12, 1], opacity: [0.1, 0.18, 0.1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[50%] rounded-full bg-blue-600/10 blur-[80px]"
                />
                <div className="absolute bottom-[20%] left-[30%] w-[40%] h-[30%] rounded-full bg-teal-600/[0.05] blur-[60px]" />
            </div>

            {/* Mobile Header - Sticky with Enhanced Design */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06] safe-area-top pt-safe"
            >
                <div className="px-4 h-16 flex items-center justify-between">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-3"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-500/10"
                        >
                            <Brain className="h-5 w-5 text-cyan-400" />
                        </motion.div>
                        <div>
                            <motion.h1
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="text-xl font-bold text-white leading-none tracking-tight"
                            >
                                Study
                            </motion.h1>
                            <motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="text-[11px] text-white/50 font-medium mt-0.5"
                            >
                                Dashboard
                            </motion.p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-2"
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleOpenReferral}
                                className="h-10 w-10 rounded-full bg-white/[0.04] text-white/60 hover:bg-white/[0.08] active:scale-95 transition-all border border-white/[0.06]"
                            >
                                <Users className="h-4 w-4" />
                            </Button>
                        </motion.div>
                        <Drawer open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                            <DrawerTrigger asChild>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        size="icon"
                                        onClick={async () => {
                                            try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) { }
                                        }}
                                        className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/20 border-0 active:scale-95 transition-all"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </motion.div>
                            </DrawerTrigger>
                            <DrawerContent className="bg-[#111113]/95 backdrop-blur-2xl border-white/[0.08] text-white pb-safe">
                                <div className="px-4 py-6">
                                    <DialogHeader className="mb-6 text-left">
                                        <DialogTitle className="text-xl font-bold">New Material</DialogTitle>
                                    </DialogHeader>
                                    <StudyUploadZone onUploadComplete={() => setIsUploadOpen(false)} />
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </motion.div>
                </div>
            </motion.header>

            {/* Main Content - Scrollable */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
                }}
                className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5 pb-28 relative z-10"
            >
                {/* ═══ INLINE STATS BAR - Enhanced ═══ */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                    className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1"
                >
                    {[
                        {
                            icon: Clock,
                            label: "Time",
                            value: stats ? formatStudyTime(stats.totalStudyTime).split(" ")[0] : "0m",
                            color: "text-cyan-400",
                            bgColor: "bg-cyan-500/10",
                            borderColor: "border-cyan-500/20",
                            glowColor: "shadow-cyan-500/10",
                        },
                        {
                            icon: BookOpen,
                            label: "Cards",
                            value: `${stats?.flashcardsReviewed || 0}`,
                            color: "text-blue-400",
                            bgColor: "bg-blue-500/10",
                            borderColor: "border-blue-500/20",
                            glowColor: "shadow-blue-500/10",
                        },
                        {
                            icon: Flame,
                            label: "Streak",
                            value: `${stats?.currentStreak || 0}d`,
                            color: "text-amber-400",
                            bgColor: "bg-amber-500/10",
                            borderColor: "border-amber-500/20",
                            glowColor: "shadow-amber-500/10",
                        },
                        {
                            icon: Zap,
                            label: "Level",
                            value: `Lv ${stats?.level || 1}`,
                            color: "text-emerald-400",
                            bgColor: "bg-emerald-500/10",
                            borderColor: "border-emerald-500/20",
                            glowColor: "shadow-emerald-500/10",
                        },
                        ...(wallet !== undefined
                            ? [
                                {
                                    icon: ShieldCheck,
                                    label: "CRYO",
                                    value: `${wallet?.cryoCredits || 0}`,
                                    color: "text-teal-400",
                                    bgColor: "bg-teal-500/10",
                                    borderColor: "border-teal-500/20",
                                    glowColor: "shadow-teal-500/10",
                                },
                            ]
                            : []),
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                                duration: 0.4,
                                delay: i * 0.08,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "glass-stat-chip shrink-0 !py-2 !px-3.5 cursor-pointer",
                                "hover:border-white/10 transition-all duration-300",
                                stat.borderColor,
                                stat.glowColor,
                                "hover:shadow-lg"
                            )}
                        >
                            <div className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300",
                                stat.bgColor,
                                "group-hover:scale-110"
                            )}>
                                <stat.icon className={cn("w-4 h-4", stat.color)} />
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-base font-bold text-white tabular-nums">
                                    {stat.value}
                                </span>
                                <span className="text-[10px] text-white/30 font-medium uppercase tracking-wide">
                                    {stat.label}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══ FEATURE CARDS - Enhanced ═══ */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white tracking-tight">Quick Actions</h2>
                        <span className="text-xs text-white/30 font-medium">Swipe →</span>
                    </div>
                    <ScrollArea className="w-full whitespace-nowrap rounded-xl">
                        <div className="flex w-max space-x-4 pb-3 px-1">
                            {featureCards.map((card, index) => {
                                const a = accentMap[card.accent];
                                return (
                                    <motion.button
                                        key={card.id}
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.1,
                                            ease: [0.22, 1, 0.36, 1]
                                        }}
                                        whileHover={{ scale: 1.05, y: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={card.action}
                                        className="w-40 p-5 glass-feature-card relative overflow-hidden text-left group cursor-pointer"
                                    >
                                        {/* Glow effect on hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${a.gradient}`} />
                                        
                                        {/* Animated border glow */}
                                        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${a.glow}`} />
                                        
                                        <div className="flex items-center justify-between w-full z-10 mb-4">
                                            <motion.div
                                                whileHover={{ rotate: 5, scale: 1.1 }}
                                                className={cn(
                                                    "h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-300",
                                                    a.bg, a.border,
                                                    "group-hover:shadow-lg group-hover:scale-110"
                                                )}
                                            >
                                                <card.icon className={cn("h-6 w-6", a.text)} />
                                            </motion.div>
                                            {card.live && (
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[8px] uppercase font-bold text-emerald-400 tracking-wider">Live</span>
                                                </motion.div>
                                            )}
                                        </div>
                                        <div className="z-10">
                                            <div className="font-bold text-white text-base mb-1">{card.title}</div>
                                            <div className="text-[11px] text-white/50 leading-relaxed">{card.desc}</div>
                                        </div>
                                        
                                        {/* Arrow indicator */}
                                        <motion.div
                                            initial={{ x: -10, opacity: 0 }}
                                            whileHover={{ x: 0, opacity: 1 }}
                                            className="absolute bottom-4 right-4 text-white/0 group-hover:text-white/40 transition-all duration-300"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </motion.div>
                                    </motion.button>
                                );
                            })}

                            {/* Regional Training */}
                            {(user?.region === "ksa" || user?.region === "egypt") && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: featureCards.length * 0.1,
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                    whileHover={{ scale: 1.05, y: -4 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={async () => {
                                        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                                        setActiveFeature("regional_trainer");
                                    }}
                                    className="w-40 p-5 glass-feature-card relative overflow-hidden text-left group cursor-pointer"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]" />
                                    
                                    <div className="mb-4 h-12 w-12 rounded-xl flex items-center justify-center border z-10 bg-amber-500/10 border-amber-500/20 group-hover:scale-110 transition-all duration-300">
                                        <Trophy className="h-6 w-6 text-amber-400" />
                                    </div>
                                    <div className="z-10">
                                        <div className="font-bold text-white text-base mb-1">
                                            {user.region === "ksa" ? "Qiyas" : "Thanaweyya"}
                                        </div>
                                        <div className="text-[11px] text-white/50 leading-relaxed">Local Prep</div>
                                    </div>
                                    
                                    <motion.div
                                        initial={{ x: -10, opacity: 0 }}
                                        whileHover={{ x: 0, opacity: 1 }}
                                        className="absolute bottom-4 right-4 text-white/0 group-hover:text-white/40 transition-all duration-300"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.div>
                                </motion.button>
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" className="hidden" />
                    </ScrollArea>
                </motion.div>

                {/* ═══ LECTURE RECORDER ═══ */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                    className="p-4 glass-panel group hover:border-white/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.04] to-transparent pointer-events-none" />
                    <div className="flex items-center gap-2.5 mb-3 z-10 relative">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/15 flex items-center justify-center">
                            <Mic className="w-4 h-4 text-pink-400" />
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm">Record Lecture</div>
                            <div className="text-[10px] text-white/35">Transcribe audio & generate notes</div>
                        </div>
                    </div>
                    <div className="z-10 relative">
                        <LectureRecorder
                            onTranscriptionComplete={async ({ text, audioStorageId }) => {
                                try {
                                    const lectureTitle = `Lecture Audio ${new Date().toLocaleDateString()}`;
                                    const materialId = await createMaterial({
                                        title: lectureTitle,
                                        type: "audio",
                                        content: text,
                                        storageId: audioStorageId as any,
                                    });
                                    toast.success("Transcribed! Generating AI study materials...");
                                    await generateAssets({
                                        materialId: materialId,
                                        content: text,
                                        title: lectureTitle,
                                    });
                                    toast.success("Study materials generated!");
                                    navigate(`/study/${materialId}`);
                                } catch (error) {
                                    console.error("Failed to save lecture material", error);
                                    toast.error("Failed to process lecture transcript");
                                }
                            }}
                        />
                    </div>
                </motion.div>

                {/* ═══ RECENT UPLOADS ═══ */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                    className="space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-white">Recent Uploads</h2>
                        <button
                            onClick={async () => {
                                try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                                navigate("/study");
                            }}
                            className="text-xs text-white/30 hover:text-white/60 font-medium flex items-center gap-1 transition-colors"
                        >
                            View all
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {recentMaterials?.length === 0 ? (
                            <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06] text-center">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                                    <Plus className="w-4 h-4 text-white/20" />
                                </div>
                                <p className="text-white/40 text-sm mb-1">No uploads yet</p>
                                <p className="text-xs text-white/20 mb-3">Upload a document to start</p>
                                <Button
                                    onClick={() => setIsUploadOpen(true)}
                                    className="h-9 px-5 text-sm rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold border-0"
                                >
                                    Upload
                                </Button>
                            </div>
                        ) : (
                            recentMaterials?.map((material) => (
                                <div
                                    key={material._id}
                                    onClick={async () => {
                                        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                                        navigate(`/study/${material._id}`);
                                    }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] active:bg-white/[0.05] transition-all touch-feedback"
                                >
                                    <div
                                        className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                            material.type === "pdf"
                                                ? "bg-red-500/10 text-red-400"
                                                : material.type === "video" || material.type === "youtube"
                                                    ? "bg-blue-500/10 text-blue-400"
                                                    : material.type === "audio"
                                                        ? "bg-pink-500/10 text-pink-400"
                                                        : "bg-cyan-500/10 text-cyan-400",
                                        )}
                                    >
                                        {material.type === "pdf" ? (
                                            <BookOpen className="h-5 w-5" />
                                        ) : material.type === "video" || material.type === "youtube" ? (
                                            <Play className="h-5 w-5" />
                                        ) : material.type === "audio" ? (
                                            <Mic className="h-5 w-5" />
                                        ) : (
                                            <Network className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-white truncate">{material.title}</h3>
                                        <p className="text-[10px] text-white/30 truncate">
                                            {new Date(material._creationTime).toLocaleDateString()} • {material.type}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-white/15 shrink-0" />
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* ═══ DAILY GOALS (Enhanced) ═══ */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                    className="p-5 glass-panel group hover:border-white/10"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center">
                                <Target className="w-4 h-4 text-cyan-400" />
                            </div>
                            <h3 className="text-base font-bold text-white">Daily Goals</h3>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={async () => {
                                try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                                setIsAddingGoal(true);
                            }}
                            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors border border-white/[0.06]"
                        >
                            <Plus className="w-4 h-4 text-white/40" />
                        </motion.button>
                    </div>

                    {/* Inline goal input — Enhanced */}
                    <AnimatePresence>
                        {isAddingGoal && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, y: -10 }}
                                animate={{ height: "auto", opacity: 1, y: 0 }}
                                exit={{ height: 0, opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden mb-3"
                            >
                                <div className="flex items-center gap-2">
                                    <motion.input
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        type="text"
                                        value={newGoalText}
                                        onChange={(e) => setNewGoalText(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
                                        placeholder="What's your goal today?"
                                        autoFocus
                                        className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleAddGoal}
                                        className="h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 text-sm font-semibold border border-cyan-500/20 transition-all"
                                    >
                                        Add
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { setIsAddingGoal(false); setNewGoalText(""); }}
                                        className="h-10 w-10 rounded-xl bg-white/[0.04] flex items-center justify-center transition-all border border-white/[0.06]"
                                    >
                                        <X className="w-4 h-4 text-white/30" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2 max-h-[180px] overflow-y-auto no-scrollbar">
                        {dailyGoals?.length === 0 && !isAddingGoal && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-8 text-center border border-dashed border-white/[0.06] rounded-xl"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                                    <Target className="w-5 h-5 text-white/20" />
                                </div>
                                <p className="text-sm text-white/40 font-medium">No goals for today</p>
                                <p className="text-xs text-white/20 mt-1">Tap + to add one</p>
                            </motion.div>
                        )}
                        {dailyGoals?.map((goal, index) => (
                            <motion.div
                                key={goal._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleToggleGoal(goal._id, goal.isCompleted)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group border border-transparent hover:border-white/[0.06]"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                                        goal.isCompleted
                                            ? "bg-cyan-500 border-cyan-500 shadow-lg shadow-cyan-500/20"
                                            : "border-white/20 group-hover:border-cyan-400/40",
                                    )}
                                >
                                    {goal.isCompleted && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-2 h-2 rounded-full bg-white"
                                        />
                                    )}
                                </motion.div>
                                <span
                                    className={cn(
                                        "text-sm font-medium transition-all duration-300",
                                        goal.isCompleted
                                            ? "text-white/30 line-through"
                                            : "text-white/70 group-hover:text-white/90",
                                    )}
                                >
                                    {goal.text}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ═══ WEEKLY ACTIVITY CHART - Enhanced ═══ */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                    className="p-5 glass-panel group hover:border-white/10"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Weekly Activity</h3>
                                <p className="text-[11px] text-white/30 mt-0.5">Last 7 days</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/15">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-[9px] uppercase font-bold text-cyan-400 tracking-wider">Live</span>
                        </div>
                    </div>
                    <div className="h-[160px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyData}>
                                <defs>
                                    <linearGradient id="mobileColorActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="mobileColorActivityStroke" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 500 }}
                                    dy={8}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#111113",
                                        borderColor: "rgba(255,255,255,0.08)",
                                        borderRadius: "12px",
                                        fontSize: "11px",
                                        boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6)",
                                        padding: "8px 12px",
                                    }}
                                    itemStyle={{ color: "#fff", fontWeight: 600 }}
                                    cursor={{ stroke: "rgba(34,211,238,0.2)", strokeWidth: 1 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="hours"
                                    stroke="url(#mobileColorActivityStroke)"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#mobileColorActivity)"
                                    activeDot={{
                                        r: 5,
                                        strokeWidth: 2,
                                        fill: "#22d3ee",
                                        stroke: "#09090b",
                                        className: "drop-shadow-lg"
                                    }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* ═══ LEVEL / XP CARD - Enhanced with Particles ═══ */}
                <motion.div
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/[0.08] to-orange-500/[0.04] border border-amber-500/15 relative overflow-hidden group hover:border-amber-500/25 transition-all duration-500"
                >
                    {/* Animated background particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    opacity: 0,
                                    scale: 0,
                                    x: Math.random() * 100,
                                    y: Math.random() * 100
                                }}
                                animate={{
                                    opacity: [0, 0.6, 0],
                                    scale: [0, 1, 0],
                                    x: Math.random() * 200 - 100,
                                    y: Math.random() * 200 - 100
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: i * 0.5,
                                    ease: "easeInOut"
                                }}
                                className="absolute w-2 h-2 rounded-full bg-amber-400/30"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                            />
                        ))}
                    </div>
                    
                    {/* Glow effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.08] rounded-full blur-[40px] group-hover:bg-amber-500/[0.12] transition-colors duration-500" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/[0.06] rounded-full blur-[30px] group-hover:bg-orange-500/[0.1] transition-colors duration-500" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 15, scale: 1.1 }}
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/10"
                                >
                                    <Zap className="w-5 h-5 text-amber-400" />
                                </motion.div>
                                <div>
                                    <span className="text-xs font-bold text-amber-400/90 uppercase tracking-wider">
                                        Level {stats?.level || 1}
                                    </span>
                                    <p className="text-[10px] text-white/30 mt-0.5">Keep going!</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-bold text-white tabular-nums">
                                    {stats?.totalPoints || 0}
                                </span>
                                <span className="text-[10px] text-white/30 font-medium ml-1">XP</span>
                            </div>
                        </div>
                        
                        {/* Enhanced XP bar */}
                        <div className="relative h-2 bg-black/40 rounded-full overflow-hidden mb-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "40%" }}
                                transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-full shadow-lg shadow-amber-500/30"
                            />
                            {/* Animated shine effect */}
                            <motion.div
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] text-white/25 font-medium">
                                {Math.round(40)}% to next level
                            </p>
                            <p className="text-[10px] text-amber-400/60 font-semibold">
                                960 XP needed
                            </p>
                        </div>
                    </div>
                </motion.div>

            </motion.div>

            {/* ═══ FULL SCREEN OVERLAYS ═══ */}
            <AnimatePresence>
                {activeFeature === "flashcards" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#09090b] overflow-hidden"
                    >
                        <FlashcardMode
                            cards={allFlashcards.map((f: any) => ({
                                id: f._id,
                                front: f.front,
                                back: f.back,
                                difficulty: f.difficulty,
                            }))}
                            onComplete={(results) => {
                                toast.success(`Session Complete! Correct: ${results.correct}`);
                                setActiveFeature("dashboard");
                            }}
                            onClose={() => setActiveFeature("dashboard")}
                        />
                    </motion.div>
                )}
                {activeFeature === "quiz" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#09090b] overflow-y-auto"
                    >
                        <div className="relative z-50 p-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full bg-white/[0.06] text-white z-50 active:scale-95"
                                onClick={() => setActiveFeature("dashboard")}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                            <QuizGenerator
                                topic={selectedTopic}
                                onClose={() => setActiveFeature("dashboard")}
                            />
                        </div>
                    </motion.div>
                )}
                {activeFeature === "regional_trainer" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#09090b] overflow-y-auto"
                    >
                        <RegionalTrainer
                            region={user?.region as "ksa" | "egypt"}
                            curriculum={user?.curriculum || ""}
                            onExit={() => setActiveFeature("dashboard")}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Focus Mode — now properly wired */}
            {isFocusModeOpen && (
                <>
                    {console.log("FocusMode rendering, isFocusModeOpen:", isFocusModeOpen)}
                    <div className="fixed inset-0 z-50 bg-[#09090b]">
                        <FocusMode onClose={() => setIsFocusModeOpen(false)} />
                    </div>
                </>
            )}

            {/* Global Timer Overlay */}
            <PomodoroTimer />

            {/* Referral Dialog */}
            <Dialog open={isReferralOpen} onOpenChange={setIsReferralOpen}>
                <DialogContent className="bg-[#111113]/95 backdrop-blur-2xl border-white/[0.08] text-white sm:max-w-md rounded-2xl shadow-2xl w-[90%] max-w-[350px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-cyan-400" />
                            Invite Friends
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                        <div className="p-3.5 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/10 text-center">
                            <p className="text-cyan-400 font-semibold text-sm mb-0.5">Earn 500 Credits per invite!</p>
                            <p className="text-white/35 text-xs">Friends get 50 bonus credits.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 font-mono text-base tracking-wider text-center select-all text-white/70 truncate">
                                {referralCode || "Generating..."}
                            </div>
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-10 w-10 rounded-lg border-white/[0.06] hover:bg-white/[0.05] shrink-0"
                                onClick={() => {
                                    navigator.clipboard.writeText(referralCode);
                                    toast.success("Code copied!");
                                }}
                                disabled={!referralCode}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-white/30 font-medium uppercase tracking-wider ml-1">
                                Share Link
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-white/40 truncate">
                                    {`${window.location.origin}?ref=${referralCode}`}
                                </div>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-10 w-10 rounded-lg border-white/[0.06] hover:bg-white/[0.05] shrink-0"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}?ref=${referralCode}`);
                                        toast.success("Link copied!");
                                    }}
                                    disabled={!referralCode}
                                >
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
