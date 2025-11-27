import { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Save, Share2, Plus, Trash2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

interface MindMapEditorProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  mindMapId?: string;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onClose?: () => void;
}

export function MindMapEditor({ initialNodes = [], initialEdges = [], mindMapId, onSave, onClose }: MindMapEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [nodeLabel, setNodeLabel] = useState("");
  const [nodeType, setNodeType] = useState("sub_concept");
  const [nodeColor, setNodeColor] = useState("#3b82f6");

  const updateMindMap = useMutation(api.mindMaps.update);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setNodeLabel(node.data.label);
    setNodeType(node.data.type || "sub_concept");
    setNodeColor(node.data.color || "#3b82f6");
    setShowNodeEditor(true);
  }, []);

  const addNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: "default",
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        label: "New Node",
        type: "sub_concept",
        color: "#3b82f6",
      },
      style: {
        background: "#3b82f6",
        color: "white",
        border: "2px solid #1e40af",
        borderRadius: "8px",
        padding: "10px",
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const updateNode = () => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: { ...node.data, label: nodeLabel, type: nodeType, color: nodeColor },
              style: {
                ...node.style,
                background: nodeColor,
              },
            }
          : node
      )
    );
    setShowNodeEditor(false);
    toast.success("Node updated");
  };

  const deleteNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setShowNodeEditor(false);
    toast.success("Node deleted");
  };

  const handleSave = async () => {
    if (mindMapId) {
      try {
        await updateMindMap({
          id: mindMapId as any,
          nodes: nodes as any,
          edges: edges as any,
        });
        toast.success("Mind map saved");
      } catch (error: any) {
        toast.error(error.message);
      }
    }
    if (onSave) {
      onSave(nodes, edges);
    }
  };

  const exportAsPNG = () => {
    toast.info("Export as PNG - Feature coming soon");
  };

  const exportAsJSON = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindmap.json";
    a.click();
    toast.success("Exported as JSON");
  };

  return (
    <div className="h-full w-full relative bg-[#0a0a0a]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#2a2a2a" />
        <Controls />
        <MiniMap
          nodeColor={(node) => node.data.color || "#3b82f6"}
          className="bg-[#1a1a1a] border border-[#2a2a2a]"
        />
        <Panel position="top-right" className="flex gap-2">
          <Button size="sm" onClick={addNode} className="bg-white text-black hover:bg-white/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Node
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm" onClick={exportAsJSON} variant="outline" className="border-[#2a2a2a] text-white">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {onClose && (
            <Button size="sm" onClick={onClose} variant="ghost" className="text-white">
              Close
            </Button>
          )}
        </Panel>
      </ReactFlow>

      <Dialog open={showNodeEditor} onOpenChange={setShowNodeEditor}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a]">
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                value={nodeLabel}
                onChange={(e) => setNodeLabel(e.target.value)}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={nodeType} onValueChange={setNodeType}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main_concept">Main Concept</SelectItem>
                  <SelectItem value="sub_concept">Sub Concept</SelectItem>
                  <SelectItem value="detail">Detail</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="answer">Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNodeColor(color)}
                    className={`h-8 w-8 rounded-full transition-all ${
                      nodeColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={updateNode} className="flex-1 bg-white text-black hover:bg-white/90">
                Update
              </Button>
              <Button onClick={deleteNode} variant="destructive" className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
