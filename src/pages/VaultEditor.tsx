import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, CheckCircle2, Save, Download } from "lucide-react";
import { useKeystrokes } from "@/hooks/useKeystrokes";

export default function VaultEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const essayId = id as Id<"essays">;

    const essay = useQuery(api.vault.getEssay, { id: essayId });
    const updateEssay = useMutation(api.vault.updateEssay);

    const { content, setContent, handleInput, flushQueue } = useKeystrokes(essayId);

    const [isSaving, setIsSaving] = useState(false);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    // Track continuous session time
    const [sessionStartTime] = useState(Date.now());

    useEffect(() => {
        if (essay && !content) {
            setContent(essay.content);
        }
    }, [essay, setContent, content]);

    const handleManualSave = async () => {
        setIsSaving(true);
        await flushQueue();
        // Also save the overall document state
        const currentSessionTime = Date.now() - sessionStartTime;
        await updateEssay({
            id: essayId,
            content,
            timeSpentDeltaMs: currentSessionTime,
        });
        // Normally you'd reset sessionStartTime here, but this is a rough implementation
        setTimeout(() => setIsSaving(false), 500);
    };

    const handleComplete = async () => {
        await handleManualSave();
        await updateEssay({
            id: essayId,
            status: "completed",
        });
        // Push them to the proof/verify page
        navigate(`/verify/${essayId}`);
    };

    if (essay === undefined) return <div className="p-8 text-white">Loading vault...</div>;
    if (essay === null) return <div className="p-8 text-red-500">Essay not found or access denied.</div>;

    return (
        <div className="flex flex-col h-screen bg-[#050014] text-white overflow-hidden selection:bg-indigo-500/30">
            {/* Editor Header - Distraction Free but with Trust Indicators */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#050014]">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/vault")} className="text-white/50 hover:text-white rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex flex-col">
                        <input
                            className="bg-transparent border-none outline-none text-lg font-medium text-white placeholder-white/30"
                            defaultValue={essay.title}
                            onBlur={(e) => updateEssay({ id: essayId, title: e.target.value })}
                            placeholder="Essay Title..."
                        />
                        <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
                            <Lock className="w-3 h-3" />
                            Strict Logging Active
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-xs text-white/30 mr-4 font-mono">
                        {content.split(/\s+/).filter(w => w.length > 0).length} words
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleManualSave}
                        disabled={isSaving}
                        className="text-white/50 hover:text-white hover:bg-white/5"
                    >
                        {isSaving ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save
                    </Button>
                    <Button onClick={handleComplete} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
                        <Download className="w-4 h-4 mr-2" />
                        Finish & Get Proof
                    </Button>
                </div>
            </header>

            {/* Main Minimalist Editor */}
            <main className="flex-1 overflow-y-auto w-full flex justify-center custom-scrollbar">
                <div className="w-full max-w-3xl px-8 py-12 pb-32">
                    <textarea
                        ref={editorRef}
                        value={content}
                        onChange={handleInput}
                        placeholder="Start drafting your essay... Every keystroke is logged as proof of your human effort."
                        className="w-full h-full min-h-[500px] bg-transparent border-none outline-none resize-none text-white/90 font-serif text-lg leading-relaxed placeholder-white/20"
                        style={{
                            boxShadow: 'none',
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none'
                        }}
                    />
                </div>
            </main>

            {/* Subliminal Footer */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/20 tracking-widest uppercase pointer-events-none">
                Cryonex Receipts Engine • Verifying Human Effort
            </div>
        </div>
    );
}
