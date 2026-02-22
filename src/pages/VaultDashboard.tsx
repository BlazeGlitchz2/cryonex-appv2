import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Lock, Plus, FileText, Clock, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function VaultDashboard() {
    const navigate = useNavigate();
    const essays = useQuery(api.vault.listEssays) || [];
    const createEssay = useMutation(api.vault.createEssay);

    const handleStartNewEssay = async () => {
        try {
            const essayId = await createEssay({
                title: `Untitled Essay - ${new Date().toLocaleDateString()}`,
            });
            navigate(`/vault/editor/${essayId}`);
        } catch (e) {
            console.error("Failed to start new essay", e);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#050014] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <Lock className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">The Vault</h1>
                        <p className="text-xs text-white/50">Anti-Detector Active Logging</p>
                    </div>
                </div>
                <Button onClick={handleStartNewEssay} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    New Essay
                </Button>
            </header>

            <ScrollArea className="flex-1 p-6">
                <div className="max-w-5xl mx-auto">
                    {essays.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center border border-white/10 border-dashed rounded-3xl mt-12 bg-white/5">
                            <Lock className="w-12 h-12 text-indigo-400/50 mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">Your Vault is Empty</h3>
                            <p className="text-sm text-white/50 max-w-sm mb-6">
                                Start an essay here. Cryonex will silently log your keystrokes and drafting time so you can mathematically prove human effort to your professors.
                            </p>
                            <Button onClick={handleStartNewEssay} variant="outline" className="rounded-full border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10">
                                Start Writing Securely
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {essays.map((essay) => (
                                <div
                                    key={essay._id}
                                    onClick={() => navigate(`/vault/editor/${essay._id}`)}
                                    className="p-5 rounded-2xl border border-white/10 bg-[#0A0A0B] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <FileText className="w-5 h-5 text-indigo-400" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-white/5 text-white/40">
                                            {essay.status}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-white mb-2 line-clamp-1">{essay.title}</h3>
                                    <div className="flex items-center gap-4 text-xs text-white/40">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {Math.ceil(essay.totalTimeSpentMs / 60000)} min spent
                                        </span>
                                        <span>•</span>
                                        <span>{essay.totalWordCount} words</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 text-sm font-medium">
                                        Resume drafting
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
