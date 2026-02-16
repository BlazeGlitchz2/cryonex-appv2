import { useParams } from "react-router";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    Share2,
    FileText,
    MessageSquare,
    Brain,
    ListChecks,
    StickyNote,
    Sparkles,
    Network,
    TrendingUp,
    EyeOff,
    Clock,
    Edit,
    Save,
    Wand2,
    X,
    Menu,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router";
import { PDFChat } from "@/components/study/PDFChat";
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
import { useState, useEffect, useRef } from "react";
import { StudyFlashcards } from "@/components/study/StudyFlashcards";
import { StudyQuizzes } from "@/components/study/StudyQuizzes";
import { StudyNotes } from "@/components/study/StudyNotes";
import { StudyConceptMap } from "@/components/study/StudyConceptMap";
import { KnowledgeGapDashboard } from "@/components/study/KnowledgeGapDashboard";
import { ImageOcclusionTool } from "@/components/study/ImageOcclusionTool";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { AIChatMessage } from "@/components/chat/AIChatMessage";

const formatStudyTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0)
        return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function MobileStudyWorkspace() {
    const { docId } = useParams<{ docId: string }>();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get("tab");

    const startSession = useMutation(api.study.startStudySession);
    const endSession = useMutation(api.study.endStudySession);
    const [sessionId, setSessionId] = useState<Id<"studySessions"> | null>(null);
    const [studyTime, setStudyTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const startTracking = async () => {
            try {
                const id = await startSession({ activityType: "reading" });
                setSessionId(id);
                timerRef.current = setInterval(
                    () => setStudyTime((prev) => prev + 1),
                    1000,
                );
            } catch (err) {
                console.error("Failed to start study session:", err);
            }
        };
        startTracking();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        const handleBeforeUnload = async () => {
            if (sessionId) await endSession({ sessionId });
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (sessionId) endSession({ sessionId }).catch(console.error);
        };
    }, [sessionId, endSession]);

    const document = useQuery(
        api.studyQuery.getDocument,
        docId ? { docId } : "skip",
    ) as any;
    const material = useQuery(
        api.study.getMaterialByDocId,
        docId ? { docId } : "skip",
    );
    const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);
    const improveSummary = useAction(api.autoGenerate.improveSummary);
    const updateDocumentSummary = useMutation(
        api.studyMutations.updateDocumentSummary,
    );

    const [isGenerating, setIsGenerating] = useState(false);
    const [isSimpleMode, setIsSimpleMode] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [summaryContent, setSummaryContent] = useState("");
    const [aiInstruction, setAiInstruction] = useState("");
    const [isImproving, setIsImproving] = useState(false);
    const [showImproveDialog, setShowImproveDialog] = useState(false);

    useEffect(() => {
        if (document?.summary) {
            setSummaryContent(
                isSimpleMode
                    ? document.summary.simple || ""
                    : document.summary.detailed || "",
            );
        }
    }, [document, isSimpleMode]);

    const [activeTab, setActiveTab] = useState<string>(tabParam || "summary");

    // Mobile specific: Determine if we are in "content" mode or "chat" mode
    // But actually, "chat" is just another tab in the mobile view

    const transcriptText =
        document?.extracted?.text ||
        ((document?.extracted?.sections as any[] | undefined)
            ?.map((s) => s.text)
            .join("\n\n") ??
            "");

    const handleSaveSummary = async () => {
        if (!docId || !document) return;
        try {
            await updateDocumentSummary({
                docId,
                summary: {
                    ...document.summary,
                    [isSimpleMode ? "simple" : "detailed"]: summaryContent,
                    short: summaryContent.substring(0, 200) + "...",
                },
            });
            setIsEditing(false);
            toast.success("Summary updated!");
        } catch (error) {
            toast.error("Failed to save summary");
        }
    };

    const handleImproveSummary = async () => {
        if (!summaryContent || !aiInstruction) return;
        setIsImproving(true);
        try {
            const improved = await improveSummary({
                currentSummary: summaryContent,
                instruction: aiInstruction,
            });
            setSummaryContent(improved);
            setAiInstruction("");
            setShowImproveDialog(false);
            toast.success("Summary improved by AI!");
        } catch (error) {
            toast.error("Failed to improve summary");
        } finally {
            setIsImproving(false);
        }
    };

    const publishMaterial = useMutation(api.viral.publishMaterial);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [shareUrl, setShareUrl] = useState("");

    const handleShare = async () => {
        if (!material?._id) return;
        try {
            const shareId = await publishMaterial({
                id: material._id,
                type: "material",
            });
            const url = `${window.location.origin}/share/material/${shareId}`;
            setShareUrl(url);
        } catch (e) {
            toast.error("Failed to generate share link");
        }
    };

    useEffect(() => {
        if (showShareDialog && !shareUrl && material?._id) {
            handleShare();
        }
    }, [showShareDialog, material]);

    if (!docId || !document)
        return (
            <div className="h-full flex items-center justify-center text-white/50">
                Loading Workspace...
            </div>
        );

    const tools = [
        { id: "summary", icon: FileText, label: "Summary" },
        { id: "chat", icon: MessageSquare, label: "Chat" },
        { id: "flashcards", icon: Brain, label: "Flashcards" },
        { id: "quizzes", icon: ListChecks, label: "Quizzes" },
        { id: "notes", icon: StickyNote, label: "Notes" },
        { id: "mindmap", icon: Network, label: "Concept Map" },
        { id: "gaps", icon: TrendingUp, label: "Knowledge Gaps" },
        { id: "diagrams", icon: EyeOff, label: "Occlusion" },
    ];

    return (
        <div className="h-full w-full bg-[#030014] text-white overflow-hidden flex flex-col font-sans">
            {/* Mobile Header */}
            <header className="h-14 border-b border-white/5 bg-[#030014]/80 backdrop-blur-xl px-4 flex items-center justify-between shrink-0 safe-area-top pt-safe">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/study/dashboard")}
                        className="text-white/60 hover:text-white rounded-full h-8 w-8 -ml-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-white font-bold text-sm truncate max-w-[150px] leading-tight">
                            {document.meta.title || "Untitled"}
                        </h1>
                        <div className="flex items-center gap-1 text-[10px] text-white/50 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>{formatStudyTime(studyTime)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowShareDialog(true)}
                        className="text-white/60 hover:text-white rounded-full h-9 w-9"
                    >
                        <Share2 className="w-4 h-4" />
                    </Button>

                    {/* Tool Drawer Toggle */}
                    <Drawer>
                        <DrawerTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white rounded-full h-9 w-9">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent className="bg-[#0A0A0B] border-white/10 text-white outline-none">
                            <DrawerHeader>
                                <DrawerTitle>Study Tools</DrawerTitle>
                            </DrawerHeader>
                            <div className="p-4 grid grid-cols-2 gap-3 pb-8">
                                {tools.map((tool) => (
                                    <Button
                                        key={tool.id}
                                        variant={activeTab === tool.id ? "default" : "outline"}
                                        className={activeTab === tool.id ? "bg-purple-600 hover:bg-purple-700 text-white border-0" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}
                                        onClick={() => setActiveTab(tool.id)}
                                    >
                                        <tool.icon className="w-4 h-4 mr-2" />
                                        {tool.label}
                                    </Button>
                                ))}
                            </div>
                        </DrawerContent>
                    </Drawer>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                {activeTab === "summary" && (
                    <div className="flex flex-col h-full">
                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    Summary
                                </h3>
                                {/* Mode Switch (Simplified for mobile) */}
                                <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5 ml-2">
                                    <button
                                        onClick={() => setIsSimpleMode(false)}
                                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${!isSimpleMode ? "bg-purple-500 text-white" : "text-white/50"}`}
                                    >
                                        Detail
                                    </button>
                                    <button
                                        onClick={() => setIsSimpleMode(true)}
                                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${isSimpleMode ? "bg-purple-500 text-white" : "text-white/50"}`}
                                    >
                                        Simple
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-1">
                                {isEditing ? (
                                    <Button
                                        size="sm"
                                        onClick={handleSaveSummary}
                                        className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white border-0 px-2"
                                    >
                                        Save
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setIsEditing(true)}
                                        className="h-7 text-xs px-2 hover:bg-white/10 text-white/70"
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {isEditing ? (
                                <Textarea
                                    value={summaryContent}
                                    onChange={(e) => setSummaryContent(e.target.value)}
                                    className="w-full h-full min-h-[300px] bg-white/5 border-white/10 text-white font-mono text-sm p-4 resize-none focus:ring-0"
                                />
                            ) : (
                                <div className="pb-20">
                                    <AIChatMessage
                                        content={
                                            summaryContent ||
                                            (isSimpleMode
                                                ? "Simple summary not available."
                                                : "No content available")
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        {/* Floating Action Button for Improve (only visible in Summary tab) */}
                        {!isEditing && (
                            <div className="absolute bottom-6 right-6 z-20">
                                <Dialog open={showImproveDialog} onOpenChange={setShowImproveDialog}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="icon"
                                            className="h-12 w-12 rounded-full bg-purple-600 shadow-lg shadow-purple-500/30 hover:bg-purple-700"
                                        >
                                            <Wand2 className="h-6 w-6 text-white" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-[#1a1a1a] border-white/10 text-white w-[90%] rounded-2xl">
                                        <DialogHeader>
                                            <DialogTitle>AI Improve</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <Textarea
                                                placeholder="How should I improve this summary?"
                                                value={aiInstruction}
                                                onChange={(e) => setAiInstruction(e.target.value)}
                                                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                                            />
                                            <Button
                                                onClick={handleImproveSummary}
                                                disabled={isImproving || !aiInstruction}
                                                className="w-full bg-purple-600 hover:bg-purple-700"
                                            >
                                                {isImproving ? <Sparkles className="animate-spin mr-2" /> : <Wand2 className="mr-2" />} Improve
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "chat" && (
                    <div className="h-full flex flex-col">
                        <PDFChat docId={docId} title={document.meta.title} />
                    </div>
                )}

                {activeTab === "flashcards" && (
                    <StudyFlashcards
                        materialId={material?._id}
                        autoContent={transcriptText}
                        title={document.meta.title}
                    />
                )}
                {activeTab === "quizzes" && (
                    <StudyQuizzes
                        materialId={material?._id}
                        autoContent={transcriptText}
                        title={document.meta.title}
                    />
                )}
                {activeTab === "notes" && (
                    <StudyNotes
                        content={document.summary?.detailed || transcriptText}
                        title={document.meta.title}
                        materialId={material?._id}
                    />
                )}
                {activeTab === "mindmap" && (
                    <StudyConceptMap
                        title={document.meta.title}
                        autoContent={transcriptText}
                        materialId={material?._id}
                    />
                )}
                {activeTab === "gaps" && (
                    <div className="p-4 overflow-y-auto h-full">
                        <KnowledgeGapDashboard materialId={material?._id} />
                    </div>
                )}
                {activeTab === "diagrams" && (
                    <ImageOcclusionTool materialId={material?._id} />
                )}
            </div>

            {/* Share Dialog */}
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogContent className="bg-[#0a0a0a] border-white/10 text-white w-[90%] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Share Material</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-white/60">
                            Anyone with this link can view this study material.
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 flex-1 truncate font-mono">
                                {shareUrl || "Generating link..."}
                            </div>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                    navigator.clipboard.writeText(shareUrl);
                                    toast.success("Copied!");
                                }}
                                disabled={!shareUrl}
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
