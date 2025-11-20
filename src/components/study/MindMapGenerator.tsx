import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MindMapEditor } from "./MindMapEditor";

interface MindMapGeneratorProps {
  conversationContent?: string;
  studyMaterialId?: string;
}

export function MindMapGenerator({ conversationContent, studyMaterialId }: MindMapGeneratorProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [source, setSource] = useState<"conversation" | "material" | "custom">("custom");
  const [customText, setCustomText] = useState("");
  const [depth, setDepth] = useState<"basic" | "detailed" | "comprehensive">("detailed");
  const [title, setTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<any[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<any[]>([]);

  const materials = useQuery(api.study.listMaterials, {});
  const generateMindMap = useAction(api.mindMapAI.generateMindMap);
  const createMindMap = useMutation(api.mindMaps.create);

  const handleGenerate = async () => {
    let content = "";

    if (source === "conversation" && conversationContent) {
      content = conversationContent;
    } else if (source === "material" && studyMaterialId) {
      const material = materials?.find((m) => m._id === studyMaterialId);
      if (material?.content) {
        content = material.content;
      } else {
        toast.error("Material content not found");
        return;
      }
    } else if (source === "custom") {
      content = customText;
    }

    if (!content || content.trim().length < 50) {
      toast.error("Please provide sufficient content (at least 50 characters)");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title for the mind map");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("Generating mind map...");

    try {
      const result = await generateMindMap({ content, depth, title });

      const formattedNodes = result.nodes.map((node: any) => ({
        id: node.id,
        type: "default",
        position: { x: Math.random() * 800, y: node.level * 150 },
        data: {
          label: node.label,
          type: node.type,
          color: node.color,
        },
        style: {
          background: node.color,
          color: "white",
          border: `2px solid ${node.color}dd`,
          borderRadius: "8px",
          padding: "10px",
          fontSize: node.level === 0 ? "16px" : "14px",
          fontWeight: node.level === 0 ? "bold" : "normal",
        },
      }));

      const formattedEdges = result.edges.map((edge: any) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#6b6b6b", strokeWidth: 2 },
      }));

      setGeneratedNodes(formattedNodes);
      setGeneratedEdges(formattedEdges);

      await createMindMap({
        title,
        materialId: source === "material" ? (studyMaterialId as any) : undefined,
        nodes: formattedNodes,
        edges: formattedEdges,
        layout: "hierarchical",
      });

      toast.dismiss(loadingToast);
      toast.success("Mind map generated successfully!");
      setShowDialog(false);
      setShowEditor(true);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Failed to generate mind map");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-[#2a2a2a] text-white hover:bg-white/5">
            <Brain className="h-4 w-4 mr-2" />
            Generate Mind Map
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Mind Map</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Biology Chapter 3 Overview"
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
              />
            </div>

            <div>
              <Label>Source</Label>
              <Select value={source} onValueChange={(v: any) => setSource(v)}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conversationContent && <SelectItem value="conversation">Current Conversation</SelectItem>}
                  <SelectItem value="material">Study Material</SelectItem>
                  <SelectItem value="custom">Custom Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {source === "material" && (
              <div>
                <Label>Select Material</Label>
                <Select value={studyMaterialId} onValueChange={(v) => {}}>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue placeholder="Choose a material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials?.map((material) => (
                      <SelectItem key={material._id} value={material._id}>
                        {material.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {source === "custom" && (
              <div>
                <Label>Content</Label>
                <Textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste your content here..."
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-48 resize-none"
                />
              </div>
            )}

            <div>
              <Label>Depth Level</Label>
              <Select value={depth} onValueChange={(v: any) => setDepth(v)}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (2 levels)</SelectItem>
                  <SelectItem value="detailed">Detailed (3 levels)</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive (4+ levels)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-white text-black hover:bg-white/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Mind Map
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showEditor && (
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] max-w-[95vw] max-h-[95vh] p-0">
            <div className="h-[90vh]">
              <MindMapEditor
                initialNodes={generatedNodes}
                initialEdges={generatedEdges}
                onClose={() => setShowEditor(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
