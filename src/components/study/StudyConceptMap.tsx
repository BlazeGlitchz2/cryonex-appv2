import React, { useCallback, useMemo } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, Download, Share2, Brain, Zap } from 'lucide-react';

// Custom "Super Liquid" Node
const LiquidNode = ({ data }: { data: { label: string; type?: 'main' | 'sub' } }) => {
    const isMain = data.type === 'main';
    return (
        <div className={`relative group px-6 py-4 shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)] rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 ${isMain
                ? 'bg-gradient-to-br from-violet-600/80 to-indigo-600/80 border-white/30 hover:shadow-[0_0_40px_-5px_rgba(124,58,237,0.6)]'
                : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
            }`}>
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isMain ? 'bg-violet-500/20 blur-xl' : 'bg-white/5 blur-lg'
                }`} />

            <div className="relative flex items-center gap-3">
                {isMain ? <Brain className="w-5 h-5 text-white" /> : <Zap className="w-4 h-4 text-purple-300" />}
                <div className={`font-bold text-sm ${isMain ? 'text-white' : 'text-white/90'}`}>{data.label}</div>
            </div>

            <Handle type="target" position={Position.Top} className="!bg-white !w-3 !h-3 !border-2 !border-purple-500" />
            <Handle type="source" position={Position.Bottom} className="!bg-white !w-3 !h-3 !border-2 !border-purple-500" />
        </div>
    );
};

const initialNodes: Node[] = [
    { id: '1', position: { x: 250, y: 0 }, data: { label: 'Main Concept', type: 'main' }, type: 'liquid' },
    { id: '2', position: { x: 100, y: 150 }, data: { label: 'Sub Concept A', type: 'sub' }, type: 'liquid' },
    { id: '3', position: { x: 400, y: 150 }, data: { label: 'Sub Concept B', type: 'sub' }, type: 'liquid' },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#a78bfa', strokeWidth: 2 } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#a78bfa', strokeWidth: 2 } },
];

interface StudyConceptMapProps {
    title?: string;
    autoContent?: string;
}

export function StudyConceptMap({ title, autoContent }: StudyConceptMapProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const nodeTypes = useMemo(() => ({ liquid: LiquidNode }), []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#a78bfa', strokeWidth: 2 } }, eds)),
        [setEdges],
    );

    const handleAddNode = () => {
        const id = Math.random().toString();
        const newNode: Node = {
            id,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: 'New Idea', type: 'sub' },
            type: 'liquid',
        };
        setNodes((nds) => nds.concat(newNode));
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#050014] relative overflow-hidden group">
            {/* Cosmic Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-glow" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
            </div>

            {/* Toolbar */}
            <div className="absolute top-6 left-6 z-10 flex gap-3">
                <Button size="sm" onClick={handleAddNode} className="bg-white/10 backdrop-blur-xl border border-white/10 hover:bg-white/20 text-white shadow-lg shadow-black/20 transition-all hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" /> Add Node
                </Button>
                <Button size="sm" variant="ghost" className="bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 hover:bg-purple-500/20 text-purple-200 shadow-lg shadow-purple-900/20 transition-all hover:scale-105">
                    <Sparkles className="h-4 w-4 mr-2 text-purple-400" /> AI Generate
                </Button>
            </div>

            <div className="absolute top-6 right-6 z-10 flex gap-2">
                <Button size="icon" variant="ghost" className="bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md border border-white/5">
                    <Download className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md border border-white/5">
                    <Share2 className="h-4 w-4" />
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
                    <Background color="#a78bfa" variant={BackgroundVariant.Dots} gap={30} size={1} style={{ opacity: 0.15 }} />
                    <Controls className="!bg-white/10 !border-white/10 !fill-white [&>button]:!border-white/10 [&>button:hover]:!bg-white/20 rounded-xl overflow-hidden backdrop-blur-md" />
                    <MiniMap
                        nodeStrokeColor={(n) => {
                            if (n.data.type === 'main') return '#7c3aed';
                            return 'rgba(255,255,255,0.5)';
                        }}
                        nodeColor={(n) => {
                            if (n.data.type === 'main') return '#7c3aed';
                            return '#1e1e1e';
                        }}
                        maskColor="rgba(5, 0, 20, 0.8)"
                        className="!bg-black/40 !border !border-white/10 !rounded-xl overflow-hidden backdrop-blur-md"
                    />
                </ReactFlow>
            </div>
        </div>
    );
}
