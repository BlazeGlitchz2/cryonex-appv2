"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

function getAIProvider() {
  const geminiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const hfKey = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
  const openrouterKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.VLY_OPENROUTER_API_KEY ||
    process.env.VITE_OPENROUTER_API_KEY;
  const bytezKey = process.env.BYTEZ_API_KEY || process.env.VITE_BYTEZ_API_KEY;

  const providers = [];

  if (geminiKey) {
    providers.push({
      provider: "gemini" as const,
      apiKey: geminiKey,
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
    });
  }
  if (openrouterKey) {
    providers.push({
      provider: "openrouter" as const,
      apiKey: openrouterKey,
      url: "https://openrouter.ai/api/v1/chat/completions",
      model: "deepseek/deepseek-r1",
    });
  }
  if (bytezKey) {
    providers.push({
      provider: "bytez" as const,
      apiKey: bytezKey,
      url: "https://api.bytez.com/v1/chat/completions",
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct",
    });
  }

  providers.push({
    provider: "puter" as const,
    apiKey: "",
    url: "https://api.puter.com/v1/chat/completions",
    model: "gpt-5-mini",
  });

  return providers;
}

async function callWithFallback(
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const providers = getAIProvider();
  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      if (provider.provider === "gemini") {
        const response = await fetch(`${provider.url}?key=${provider.apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: messages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
            generationConfig: { temperature: 0.7, maxOutputTokens: 3000 },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) return content;
        }
      } else {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (provider.apiKey)
          headers["Authorization"] = `Bearer ${provider.apiKey}`;

        const response = await fetch(provider.url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: (provider as any).model,
            messages,
            temperature: 0.7,
            max_tokens: 3000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return content;
        }
      }
    } catch (error: any) {
      lastError = error;
    }
  }

  throw new Error(
    `Failed to generate mind map: ${lastError?.message || "All providers failed"}`,
  );
}

export const generateMindMap = action({
  args: {
    content: v.string(),
    depth: v.union(
      v.literal("basic"),
      v.literal("detailed"),
      v.literal("comprehensive"),
    ),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const depthLevels = {
      basic: 2,
      detailed: 3,
      comprehensive: 4,
    };

    const maxDepth = depthLevels[args.depth];

    const prompt = `Generate a mind map structure from the following content. Create a hierarchical JSON structure with nodes and edges.

Content:
${args.content.substring(0, 8000)}

Requirements:
- Maximum depth: ${maxDepth} levels
- Central node should be the main topic
- Each node should have: id, label, type (main_concept, sub_concept, detail, question, answer), color, level
- Create edges connecting parent to child nodes
- Identify key concepts, relationships, and hierarchies
- Use different node types appropriately
- Assign colors by category (use hex colors)

Return ONLY a JSON object with this structure:
{
  "title": "Main Topic",
  "nodes": [
    {"id": "1", "label": "Central Topic", "type": "main_concept", "color": "#8b5cf6", "level": 0},
    {"id": "2", "label": "Subtopic", "type": "sub_concept", "color": "#3b82f6", "level": 1}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"}
  ]
}`;

    const response = await callWithFallback([
      {
        role: "system",
        content:
          "You are an expert at creating structured mind maps. Return only valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse mind map structure from AI response");
    }

    const mindMapData = JSON.parse(jsonMatch[0]);
    return mindMapData;
  },
});
