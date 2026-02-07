import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getGlobalGraph = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { nodes: [], edges: [] };

    // Fetch all mind maps for the user
    const mindMaps = await ctx.db
      .query("mindMaps")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const nodes: any[] = [];
    const edges: any[] = [];
    const nodeMap = new Map<string, string>(); // Label -> Node ID

    // Helper to add node if unique
    const addNode = (
      label: string,
      type: "concept" | "document",
      meta: any = {},
    ) => {
      const normalizedLabel = label.toLowerCase().trim();
      if (!nodeMap.has(normalizedLabel)) {
        const id = `node-${nodes.length}`;
        nodeMap.set(normalizedLabel, id);
        nodes.push({
          id,
          data: { label, type, ...meta },
          position: { x: Math.random() * 500, y: Math.random() * 500 }, // Initial random position
        });
        return id;
      }
      return nodeMap.get(normalizedLabel)!;
    };

    for (const map of mindMaps) {
      // Add document node (optional, maybe just concepts)
      // const docId = addNode(map.title, "document", { materialId: map.materialId });

      for (const node of map.nodes) {
        const nodeId = addNode(node.data.label, "concept");

        // If we want to link concepts to the document:
        // edges.push({
        //   id: `edge-${edges.length}`,
        //   source: docId,
        //   target: nodeId,
        //   type: "smoothstep",
        // });
      }

      for (const edge of map.edges) {
        // Find source and target in our global map
        const sourceLabel = map.nodes.find((n: any) => n.id === edge.source)
          ?.data.label;
        const targetLabel = map.nodes.find((n: any) => n.id === edge.target)
          ?.data.label;

        if (sourceLabel && targetLabel) {
          const sourceId = addNode(sourceLabel, "concept");
          const targetId = addNode(targetLabel, "concept");

          // Avoid duplicate edges
          const edgeExists = edges.some(
            (e) =>
              (e.source === sourceId && e.target === targetId) ||
              (e.source === targetId && e.target === sourceId),
          );

          if (!edgeExists) {
            edges.push({
              id: `edge-${edges.length}`,
              source: sourceId,
              target: targetId,
              label: edge.data?.label,
              type: "smoothstep",
            });
          }
        }
      }
    }

    return { nodes, edges };
  },
});
