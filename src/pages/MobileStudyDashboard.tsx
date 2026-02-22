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
    MoreHorizontal,
    Search,
    Bell,
    Play,
    Users,
    Copy,
    Share2,
    Trophy,
    Filter,
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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

export default function MobileStudyDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeFeature, setActiveFeature] = useState<
        "dashboard" | "flashcards" | "quiz" | "regional_trainer"
    >("dashboard");
    const [selectedTopic, setSelectedTopic] = useState("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Data
    const stats = useQuery(api.study.getStats);
    const dailyGoals = useQuery(api.study.getDailyGoals, {
        date: new Date().toISOString().split("T")[0],
    });
    const recommendations = useQuery(api.study.getStudyRecommendations);
    const allFlashcards = useQuery(api.study.listAllFlashcards) || [];
    const weeklyActivity = useQuery(api.study.getWeeklyActivity);
    const recentMaterials = useQuery(api.study.getRecentMaterials, { limit: 10 });

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
        const text = prompt("Enter a new daily goal:");
        if (text) {
            await createGoal({ text, date: new Date().toISOString().split("T")[0] });
            toast.success("Goal added!");
        }
    };

    const handleToggleGoal = async (goalId: any, currentStatus: boolean) => {
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

    // Format helper
    const formatStudyTime = (ms: number) => {
        if (!ms) return "0m";
        const totalMinutes = Math.floor(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="flex-1 h-full w-full relative bg-[#030014] text-white overflow-hidden flex flex-col">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[50%] rounded-full bg-purple-900/15 opacity-40 blur-[80px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[50%] rounded-full bg-blue-900/15 opacity-40 blur-[80px]" />
            </div>

            {/* Mobile Header - Sticky */}
            <header className="sticky top-0 z-30 bg-[#030014]/80 backdrop-blur-xl border-b border-white/5 safe-area-top pt-safe">
                <div className="px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-none">Study</h1>
                            <p className="text-[10px] text-white/50 font-medium">Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleOpenReferral}
                            className="h-9 w-9 rounded-full bg-white/5 text-white hover:bg-white/10"
                        >
                            <Users className="h-4 w-4" />
                        </Button>
                        <Drawer open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                            <DrawerTrigger asChild>
                                <Button
                                    size="icon"
                                    className="h-9 w-9 rounded-full bg-white text-black hover:bg-white/90 shadow-lg shadow-white/5"
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent className="bg-[#0A0A0B] border-white/10 text-white pb-safe">
                                <div className="px-4 py-6">
                                    <DialogHeader className="mb-6 text-left">
                                        <DialogTitle className="text-xl font-bold">New Material</DialogTitle>
                                    </DialogHeader>
                                    <StudyUploadZone onUploadComplete={() => setIsUploadOpen(false)} />
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </div>
            </header>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-24">

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-[#0d0d1a] border border-white/10 flex flex-col items-center justify-center text-center gap-1">
                        <Clock className="h-4 w-4 text-blue-400 mb-1" />
                        <span className="text-lg font-bold text-white leading-none">
                            {stats ? formatStudyTime(stats.totalStudyTime).split(" ")[0] : "0m"}
                        </span>
                        <span className="text-[10px] text-white/40 font-medium uppercase">Time</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#0d0d1a] border border-white/10 flex flex-col items-center justify-center text-center gap-1">
                        <BookOpen className="h-4 w-4 text-purple-400 mb-1" />
                        <span className="text-lg font-bold text-white leading-none">
                            {stats?.flashcardsReviewed || 0}
                        </span>
                        <span className="text-[10px] text-white/40 font-medium uppercase">Cards</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#0d0d1a] border border-white/10 flex flex-col items-center justify-center text-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-400 mb-1" />
                        <span className="text-lg font-bold text-white leading-none">
                            {stats?.currentStreak || 0}
                        </span>
                        <span className="text-[10px] text-white/40 font-medium uppercase">Streak</span>
                    </div>
                </div>

                {/* Mobile Lecture Audio Recorder */}
                <div className="p-5 rounded-2xl bg-[#0d0d1a] border border-white/10 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none" />
                    <div className="text-center mb-2 z-10 w-full flex flex-col items-center">
                        <div className="font-bold text-white flex items-center justify-center gap-2">
                            <Mic className="h-4 w-4 text-pink-400" />
                            Record Lecture
                        </div>
                        <div className="text-[10px] text-white/50 mt-1">
                            Transcribe audio and generate notes
                        </div>
                    </div>
                    <div className="z-10 w-full">
                        <LectureRecorder
                            onTranscriptionComplete={async ({ text, audioStorageId }) => {
                                try {
                                    // Save as a new study material
                                    const materialId = await createMaterial({
                                        title: `Lecture Audio ${new Date().toLocaleDateString()}`,
                                        type: "audio",
                                        content: text,
                                        storageId: audioStorageId as any,
                                    });
                                    toast.success("Saved to Study Library!");
                                    navigate(`/study/${materialId}`);
                                } catch (error) {
                                    console.error("Failed to save lecture material", error);
                                    toast.error("Failed to save to library");
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Feature Actions - Horizontal Scroll */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-white">Quick Actions</h2>
                    </div>
                    <ScrollArea className="w-full whitespace-nowrap rounded-md">
                        <div className="flex w-max space-x-3 pb-2">
                            {/* Flashcards */}
                            <button
                                onClick={() => setActiveFeature("flashcards")}
                                className="w-36 p-4 rounded-[1.25rem] bg-[#0d0d1a] border border-white/10 flex flex-col gap-3 relative overflow-hidden group active:scale-95 transition-all text-left"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
                                <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center z-10">
                                    <BookOpen className="h-5 w-5 text-purple-400" />
                                </div>
                                <div className="z-10">
                                    <div className="font-bold text-white text-sm">Flashcards</div>
                                    <div className="text-[10px] text-white/50">{recommendations?.dueFlashcardsCount || 0} due</div>
                                </div>
                            </button>

                            {/* Quiz */}
                            <button
                                onClick={() => setActiveFeature("quiz")}
                                className="w-36 p-4 rounded-[1.25rem] bg-[#0d0d1a] border border-white/10 flex flex-col gap-3 relative overflow-hidden group active:scale-95 transition-all text-left"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                                <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center z-10">
                                    <BrainCircuit className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="z-10">
                                    <div className="font-bold text-white text-sm">AI Quiz</div>
                                    <div className="text-[10px] text-white/50">Test yourself</div>
                                </div>
                            </button>

                            {/* Training */}
                            {(user?.region === "ksa" || user?.region === "egypt") && (
                                <button
                                    onClick={() => setActiveFeature("regional_trainer")}
                                    className="w-36 p-4 rounded-[1.25rem] bg-[#0d0d1a] border border-white/10 flex flex-col gap-3 relative overflow-hidden group active:scale-95 transition-all text-left"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
                                    <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center z-10">
                                        <Trophy className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div className="z-10">
                                        <div className="font-bold text-white text-sm">
                                            {user.region === "ksa" ? "Qiyas" : "Thanaweyya"}
                                        </div>
                                        <div className="text-[10px] text-white/50">Local Prep</div>
                                    </div>
                                </button>
                            )}

                            {/* Focus */}
                            <button
                                onClick={() => toast.info("Focus Mode Initiated")}
                                className="w-36 p-4 rounded-[1.25rem] bg-[#0d0d1a] border border-white/10 flex flex-col gap-3 relative overflow-hidden group active:scale-95 transition-all text-left"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center z-10">
                                    <Timer className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div className="z-10">
                                    <div className="font-bold text-white text-sm">Focus</div>
                                    <div className="text-[10px] text-white/50">Pomodoro</div>
                                </div>
                            </button>
                        </div>
                        <ScrollBar orientation="horizontal" className="hidden" />
                    </ScrollArea>
                </div>

                {/* Recent Materials List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-white">Recent Uploads</h2>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-white/40" onClick={() => navigate("/study")}>
                            View All
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {recentMaterials?.length === 0 ? (
                            <div className="p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                                <p className="text-white/40 text-sm">No uploads yet</p>
                                <Button
                                    variant="link"
                                    onClick={() => setIsUploadOpen(true)}
                                    className="text-purple-400 mt-2"
                                >
                                    Upload something
                                </Button>
                            </div>
                        ) : (
                            recentMaterials?.map((material) => (
                                <div
                                    key={material._id}
                                    onClick={() => navigate(`/study/${material._id}`)}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-[#0d0d1a] border border-white/5 active:bg-white/5 transition-colors"
                                >
                                    <div
                                        className={cn(
                                            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                                            material.type === "pdf"
                                                ? "bg-red-500/10 text-red-500"
                                                : material.type === "video" || material.type === "youtube"
                                                    ? "bg-blue-500/10 text-blue-500"
                                                    : material.type === "audio"
                                                        ? "bg-pink-500/10 text-pink-500"
                                                        : "bg-purple-500/10 text-purple-500",
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
                                        <h3 className="text-sm font-medium text-white truncate">{material.title}</h3>
                                        <p className="text-[10px] text-white/40 truncate">
                                            {new Date(material._creationTime).toLocaleDateString()} • {material.type}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-white/20" />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Goals Section */}
                <div className="p-4 rounded-2xl bg-[#0d0d1a] border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white text-sm">Daily Goals</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleAddGoal}
                            className="h-6 w-6 rounded-full bg-white/5 hover:bg-white/20 text-white"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {dailyGoals?.length === 0 && (
                            <div className="text-center py-4 text-white/30 text-xs italic">
                                No goals set for today
                            </div>
                        )}
                        {dailyGoals?.map((goal) => (
                            <div
                                key={goal._id}
                                onClick={() => handleToggleGoal(goal._id, goal.isCompleted)}
                                className="flex items-center gap-3 p-2 rounded-lg bg-white/5 active:bg-white/10 transition-colors"
                            >
                                <div
                                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${goal.isCompleted ? "bg-purple-500 border-purple-500" : "border-white/20"}`}
                                >
                                    {goal.isCompleted && <div className="h-2 w-2 rounded-full bg-white" />}
                                </div>
                                <span className={`text-sm ${goal.isCompleted ? "text-white/30 line-through" : "text-white/80"}`}>
                                    {goal.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Full Screen Overlays */}
            <AnimatePresence>
                {activeFeature === "flashcards" && (
                    <div className="fixed inset-0 z-50 bg-[#030014] overflow-hidden">
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
                    </div>
                )}
                {activeFeature === "quiz" && (
                    <div className="fixed inset-0 z-50 bg-[#030014] overflow-y-auto">
                        <div className="relative z-50 p-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full bg-white/10 text-white z-50"
                                onClick={() => setActiveFeature("dashboard")}
                            >
                                <Plus className="rotate-45 h-6 w-6" />
                            </Button>
                            <QuizGenerator
                                topic={selectedTopic}
                                onClose={() => setActiveFeature("dashboard")}
                            />
                        </div>
                    </div>
                )}
                {activeFeature === "regional_trainer" && (
                    <div className="fixed inset-0 z-50 bg-[#030014] overflow-y-auto">
                        <RegionalTrainer
                            region={user?.region as "ksa" | "egypt"}
                            curriculum={user?.curriculum || ""}
                            onExit={() => setActiveFeature("dashboard")}
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* Global Timer Overlay component */}
            <PomodoroTimer />

            {/* Referral Dialog with Drawer for better mobile use? Or just standard dialog centered */}
            <Dialog open={isReferralOpen} onOpenChange={setIsReferralOpen}>
                <DialogContent className="bg-[#0A0A0B]/95 backdrop-blur-2xl border-white/10 text-white sm:max-w-md rounded-[2rem] shadow-2xl w-[90%] max-w-[350px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            Invite Friends
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                            <p className="text-purple-300 font-medium mb-1">Earn 500 Credits!</p>
                            <p className="text-white/60 text-xs">Friends get 50 bonus credits.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 font-mono text-base tracking-wider text-center select-all truncate">
                                {referralCode || "Generating..."}
                            </div>
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-12 w-12 rounded-xl border-white/10 hover:bg-white/5 shrink-0"
                                onClick={() => {
                                    navigator.clipboard.writeText(referralCode);
                                    toast.success("Code copied!");
                                }}
                                disabled={!referralCode}
                            >
                                <Copy className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
