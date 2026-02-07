import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface ConceptMapProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

export function ConceptMap({
  initialNodes = [],
  initialEdges = [],
  onSave,
}: ConceptMapProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#10b981",
    "#f59e0b",
    "#ef4444",
  ];

  const addNode = () => {
    if (!newNodeLabel.trim()) {
      toast.error("Please enter a node label");
      return;
    }

    const newNode: Node = {
      id: `node-${Date.now()}`,
      label: newNodeLabel,
      x: Math.random() * 600 + 50,
      y: Math.random() * 400 + 50,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setNodes([...nodes, newNode]);
    setNewNodeLabel("");
    toast.success("Node added");
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId));
    setEdges(edges.filter((e) => e.source !== nodeId && e.target !== nodeId));
    toast.success("Node deleted");
  };

  const connectNodes = (sourceId: string, targetId: string) => {
    const edgeExists = edges.some(
      (e) =>
        (e.source === sourceId && e.target === targetId) ||
        (e.source === targetId && e.target === sourceId),
    );

    if (edgeExists) {
      toast.error("Connection already exists");
      return;
    }

    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
    };

    setEdges([...edges, newEdge]);
    toast.success("Nodes connected");
  };

  const handleNodeMouseDown = (nodeId: string) => {
    setDraggedNode(nodeId);
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (isDragging && draggedNode) {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setNodes(
          nodes.map((node) =>
            node.id === draggedNode ? { ...node, x, y } : node,
          ),
        );
      }
    },
    [isDragging, draggedNode, nodes],
  );

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
      toast.success("Concept map saved");
    }
  };

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] h-full flex flex-col">
      <CardHeader className="border-b border-[#2a2a2a]">
        <CardTitle className="flex items-center justify-between">
          <span>Concept Map</span>
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-white text-black hover:bg-white/90"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex gap-2">
          <Input
            value={newNodeLabel}
            onChange={(e) => setNewNodeLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNode()}
            placeholder="Enter concept name"
            className="bg-[#2a2a2a] border-[#3a3a3a] text-white"
          />
          <Button onClick={addNode} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <svg
            width="100%"
            height="500"
            className="bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Draw edges */}
            {edges.map((edge) => {
              const sourceNode = nodes.find((n) => n.id === edge.source);
              const targetNode = nodes.find((n) => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              return (
                <line
                  key={edge.id}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="#6b6b6b"
                  strokeWidth="2"
                />
              );
            })}

            {/* Draw nodes */}
            {nodes.map((node) => (
              <g
                key={node.id}
                onMouseDown={() => handleNodeMouseDown(node.id)}
                onClick={() => {
                  if (selectedNode && selectedNode !== node.id) {
                    connectNodes(selectedNode, node.id);
                    setSelectedNode(null);
                  } else {
                    setSelectedNode(node.id);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="40"
                  fill={node.color}
                  stroke={selectedNode === node.id ? "#ffffff" : "transparent"}
                  strokeWidth="3"
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {node.label.length > 10
                    ? node.label.substring(0, 10) + "..."
                    : node.label}
                </text>
                <circle
                  cx={node.x + 35}
                  cy={node.y - 35}
                  r="12"
                  fill="#ef4444"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                  style={{ cursor: "pointer" }}
                />
                <text
                  x={node.x + 35}
                  y={node.y - 35}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  pointerEvents="none"
                >
                  ×
                </text>
              </g>
            ))}
          </svg>
        </ScrollArea>

        <p className="text-xs text-[#6b6b6b] text-center">
          Click nodes to connect them • Drag to move • Click × to delete
        </p>
      </CardContent>
    </Card>
  );
}
