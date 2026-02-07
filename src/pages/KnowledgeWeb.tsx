import { useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import dagre from "dagre";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: any[], edges: any[], direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

export default function KnowledgeWeb() {
  const navigate = useNavigate();
  const graphData = useQuery(api.knowledgeGraph.getGlobalGraph);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (graphData && graphData.nodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(
          graphData.nodes.map((n) => ({
            ...n,
            data: { ...n.data, label: n.data.label },
            style: {
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "10px",
            },
          })),
          graphData.edges.map((e) => ({
            ...e,
            animated: true,
            style: { stroke: "#8b5cf6" },
          })),
        );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [graphData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="h-screen w-full bg-[#030005] flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0A0A0B]">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">Knowledge Web</h1>
            <p className="text-xs text-muted-foreground">
              Global view of all your concepts
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-[#030005]"
        >
          <Controls className="bg-[#1a1a1a] border-white/10 fill-white" />
          <MiniMap
            className="bg-[#1a1a1a] border-white/10"
            nodeColor="#8b5cf6"
          />
          <Background color="#333" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}
