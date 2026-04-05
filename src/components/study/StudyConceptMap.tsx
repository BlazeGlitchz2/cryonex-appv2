import React, { useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Download, Share2, Brain, Zap } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Custom "Super Liquid" Node
const LiquidNode = ({
  data,
}: {
  data: { label: string; type?: "main" | "sub" };
}) => {
  const isMain = data.type === "main";
  return (
    <div
      className={`relative group px-6 py-4 shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)] rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 ${
        isMain
          ? "bg-gradient-to-br from-violet-600/80 to-indigo-600/80 border-white/30 hover:shadow-[0_0_40px_-5px_rgba(124,58,237,0.6)]"
          : "bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30"
      }`}
    >
      {/* Glow Effect */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          isMain ? "bg-violet-500/20 blur-xl" : "bg-white/5 blur-lg"
        }`}
      />

      <div className="relative flex items-center gap-3">
        {isMain ? (
          <Brain className="w-5 h-5 text-white" />
        ) : (
          <Zap className="w-4 h-4 text-blue-300" />
        )}
        <div
          className={`font-bold text-sm ${isMain ? "text-white" : "text-white/90"}`}
        >
          {data.label}
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="!bg-white !w-3 !h-3 !border-2 !border-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-white !w-3 !h-3 !border-2 !border-blue-500"
      />
    </div>
  );
};

const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 250, y: 0 },
    data: { label: "Loading Map...", type: "main" },
    type: "liquid",
  },
];

const initialEdges: Edge[] = [];

interface StudyConceptMapProps {
  title?: string;
  autoContent?: string;
  materialId?: string | null;
}

export function StudyConceptMap({
  title,
  autoContent,
  materialId,
}: StudyConceptMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const mindMapData = useQuery(
    api.study.getMindMap,
    materialId ? { materialId: materialId as any } : "skip",
  );

  useEffect(() => {
    if (mindMapData) {
      // Map DB nodes to ReactFlow nodes
      const dbNodes = mindMapData.nodes.map((n: any) => ({
        ...n,
        type: "liquid", // Force our custom type
        data: { ...n.data, type: n.type === "input" ? "main" : "sub" },
      }));

      setNodes(dbNodes);
      setEdges(mindMapData.edges);
    }
  }, [mindMapData, setNodes, setEdges]);

  const nodeTypes = useMemo(() => ({ liquid: LiquidNode }), []);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#a78bfa", strokeWidth: 2 },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const handleAddNode = () => {
    const id = Math.random().toString();
    const newNode: Node = {
      id,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: "New Idea", type: "sub" },
      type: "liquid",
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#050014] relative overflow-hidden group">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse-glow" />
        <div
          className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse-glow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Toolbar */}
      <div className="absolute top-6 left-6 z-10 flex gap-3">
        <Button
          size="sm"
          onClick={handleAddNode}
          className="bg-white/10 backdrop-blur-xl border border-white/10 hover:bg-white/20 text-white shadow-lg shadow-black/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Node
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 hover:bg-blue-500/20 text-blue-200 shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
        >
          <Sparkles className="h-4 w-4 mr-2 text-blue-400" /> AI Generate
        </Button>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-transparent"
          minZoom={0.5}
          maxZoom={2}
        >
          <Background
            color="#a78bfa"
            variant={BackgroundVariant.Dots}
            gap={30}
            size={1}
            style={{ opacity: 0.15 }}
          />
          <Controls className="!bg-white/10 !border-white/10 !fill-white [&>button]:!border-white/10 [&>button:hover]:!bg-white/20 rounded-xl overflow-hidden backdrop-blur-md" />
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.data.type === "main") return "#7c3aed";
              return "rgba(255,255,255,0.5)";
            }}
            nodeColor={(n) => {
              if (n.data.type === "main") return "#7c3aed";
              return "#1e1e1e";
            }}
            maskColor="rgba(5, 0, 20, 0.8)"
            className="!bg-black/40 !border !border-white/10 !rounded-xl overflow-hidden backdrop-blur-md"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
