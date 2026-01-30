import { useParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, FileText, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function SharedMaterial() {
    const { type, shareId } = useParams<{ type: string; shareId: string }>();
    // We don't know the type yet, try both or pass a query param. 
    // Actually api.viral.getPublicMaterial takes a type. The URL should probably be /share/:type/:shareId ?? 
    // No, let's try to query with "material" and "note" or adjust the backend.
    // The backend `getPublicMaterial` requires a type. 
    // Let's assume the share link format includes the type or we try one then the other.
    // For simplicity, let's update the route to be /share/:type/:shareId

    // Wait, I can't change the route params easily if I want a clean short link. 
    // But for now /share/m/:shareId and /share/n/:shareId is fine.

    const queryType: "material" | "note" = type === "note" || type === "n" ? "note" : "material";
    const realShareId = typeof shareId === 'string' ? shareId : "";

    const data = useQuery(api.viral.getPublicMaterial, {
        shareId: realShareId,
        type: queryType
    });

    if (data === undefined) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    if (data === null) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Content not found or private.</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                            {data.title}
                        </h1>
                        <p className="text-white/50 mt-2 text-sm">Shared via Cryonex</p>
                    </div>
                    <Button onClick={() => window.open(window.location.origin, "_blank")} variant="outline" className="border-purple-500/50 text-purple-300">
                        Try Cryonex <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                </div>

                <Card className="bg-[#0f0f0f] border-white/10 p-8 min-h-[500px]">
                    {type === "note" ? (
                        <div className="prose prose-invert max-w-none">
                            <ReactMarkdown>{(data as any).content}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-4 bg-white/5 rounded-lg border border-white/10">
                                <FileText className="w-5 h-5 text-cyan-400" />
                                <span className="text-sm text-gray-300">This is a study material.</span>
                            </div>
                            {/* Render summary if available */}
                            {(data as any).summary?.detailed && (
                                <div className="prose prose-invert max-w-none mt-4">
                                    <h3>Summary</h3>
                                    <ReactMarkdown>{(data as any).summary.detailed}</ReactMarkdown>
                                </div>
                            )}
                            {/* If it's a URL/Link */}
                            {(data as any).url && (
                                <Button onClick={() => window.open((data as any).url, "_blank")} className="mt-4">
                                    Open Original Resource
                                </Button>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
