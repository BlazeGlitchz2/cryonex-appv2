// @ts-nocheck

"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import {
  generateJsonWithFallback,
  generateTextWithFallback,
  getConfiguredProviderStatus,
} from "./lib/aiRouting";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const POLLINATIONS_URL = "https://text.pollinations.ai/openai/chat/completions";
const OPENROUTER_HEADERS = {
  "HTTP-Referer": "https://www.cryonex.app",
  "X-Title": "Cryonex Study",
};
const OPENROUTER_TEXT_MODELS = [
  {
    name: "Gemma 3 27B Free",
    model: "google/gemma-3-27b-it:free",
    maxTokens: 1400,
  },
  {
    name: "Llama 3.3 70B Free",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    maxTokens: 1200,
  },
  {
    name: "Free Models Router",
    model: "openrouter/free",
    maxTokens: 1100,
  },
  {
    name: "MiniMax M2.5 Free",
    model: "minimax/minimax-m2.5:free",
    maxTokens: 950,
  },
];
const POLLINATIONS_TEXT_MODELS = [
  {
    name: "Pollinations Gemini",
    model: "gemini",
    maxTokens: 1400,
  },
  {
    name: "Pollinations Qwen Vision",
    model: "qwen-vision",
    maxTokens: 1200,
  },
];
const OPENROUTER_VISION_MODELS = [
  {
    name: "Nemotron Nano VL Free",
    model: "nvidia/nemotron-nano-12b-v2-vl:free",
    maxTokens: 1000,
  },
  {
    name: "Free Models Router",
    model: "openrouter/free",
    maxTokens: 900,
  },
  {
    name: "Gemma 3 27B Free",
    model: "google/gemma-3-27b-it:free",
    maxTokens: 900,
  },
];
const POLLINATIONS_VISION_MODELS = [
  {
    name: "Pollinations Qwen Vision",
    model: "qwen-vision",
    maxTokens: 1000,
  },
  {
    name: "Pollinations Gemini",
    model: "gemini",
    maxTokens: 1000,
  },
];

function getOpenRouterKey() {
  return getAiProviderKeys().openrouter;
}

function parseFirstJsonObject(s: string): any {
  try {
    return JSON.parse(s);
  } catch {
    const match = s.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // ignore
      }
    }
  }
  throw new Error("Failed to parse JSON content from model response");
}

function extractChatContent(data: any) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        return "";
      })
      .join("\n")
      .trim();
  }
  return "";
}

async function callOpenRouterChat(
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>,
  options?: {
    json?: boolean;
    maxTokens?: number;
    temperature?: number;
    preferVision?: boolean;
  },
) {
  const openRouterKey = getOpenRouterKey();
  if (!openRouterKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const candidates = options?.preferVision
    ? OPENROUTER_VISION_MODELS
    : OPENROUTER_TEXT_MODELS;
  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const requestedMaxTokens = Math.min(
        options?.maxTokens ?? candidate.maxTokens ?? 1200,
        candidate.maxTokens ?? Number.MAX_SAFE_INTEGER,
      );
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
          ...OPENROUTER_HEADERS,
        },
        body: JSON.stringify({
          model: candidate.model,
          messages,
          temperature: options?.temperature ?? 0.2,
          max_tokens: requestedMaxTokens,
          ...(options?.json
            ? { response_format: { type: "json_object" } }
            : {}),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 402) {
          throw new Error(
            `${candidate.model} credit-limited (requested ${requestedMaxTokens} tokens)`,
          );
        }
        throw new Error(
          `${candidate.model} failed: ${response.status} ${errorText.slice(0, 280)}`,
        );
      }

      const data = await response.json();
      const content = extractChatContent(data);
      if (!content) {
        throw new Error(`${candidate.model} returned empty content`);
      }

      console.log(
        `[studyAI] OpenRouter succeeded with ${candidate.name} (${data?.model || candidate.model})`,
      );
      return content;
    } catch (error) {
      lastError = error;
      console.warn(
        `[studyAI] OpenRouter ${candidate.name} failed:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  throw new Error(
    `OpenRouter study generation failed: ${
      lastError instanceof Error ? lastError.message : "Unknown error"
    }`,
  );
}

async function callPollinationsChat(
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>,
  options?: {
    json?: boolean;
    maxTokens?: number;
    temperature?: number;
    preferVision?: boolean;
  },
) {
  const candidates = options?.preferVision
    ? POLLINATIONS_VISION_MODELS
    : POLLINATIONS_TEXT_MODELS;
  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const requestedMaxTokens = Math.min(
        options?.maxTokens ?? candidate.maxTokens ?? 1200,
        candidate.maxTokens ?? Number.MAX_SAFE_INTEGER,
      );
      const response = await fetch(POLLINATIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer dummy",
          ...OPENROUTER_HEADERS,
        },
        body: JSON.stringify({
          model: candidate.model,
          messages,
          temperature: options?.temperature ?? 0.2,
          max_tokens: requestedMaxTokens,
          ...(options?.json
            ? { response_format: { type: "json_object" } }
            : {}),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `${candidate.model} failed: ${response.status} ${errorText.slice(0, 280)}`,
        );
      }

      const data = await response.json();
      const content = extractChatContent(data);
      if (!content) {
        throw new Error(`${candidate.model} returned empty content`);
      }

      console.log(
        `[studyAI] Pollinations succeeded with ${candidate.name} (${data?.model || candidate.model})`,
      );
      return content;
    } catch (error) {
      lastError = error;
      console.warn(
        `[studyAI] Pollinations ${candidate.name} failed:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  throw new Error(
    `Pollinations study generation failed: ${
      lastError instanceof Error ? lastError.message : "Unknown error"
    }`,
  );
}

export const generateAllAssets = action({
  args: {
    materialId: v.id("studyMaterials"),
    content: v.string(),
    title: v.string(),
    docId: v.optional(v.string()), // Optional docId to also update studyDocuments
    focusPrompt: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    flashcardsCount: number;
    quizQuestionsCount: number;
    podcastScript: string;
    noteId: any;
    quizId: any;
    packId: any;
    summary_detailed: string;
    summary_short: string;
    summary_simple: string;
  }> => {
    // CHARGE CREDITS FOR STUDY GENERATION (Smart Pricing: 12.00 credits)
    const STUDY_PACK_COST = 12.0;
    try {
      await ctx.runMutation(api.credits.charge, {
        amount: STUDY_PACK_COST,
        type: "study",
        description: `Study Generation: ${args.title.substring(0, 30)}...`,
        metadata: {
          materialId: args.materialId,
          title: args.title,
          contentLength: args.content.length,
        },
      });
    } catch (e) {
      throw new Error(
        `Insufficient credits. You need ${STUDY_PACK_COST} Credits to generate study materials.`,
      );
    }

    // OpenRouter-first provider chain for study generation.
    const providers = getConfiguredProviderStatus();
    if (
      !providers.google &&
      !providers.openrouter &&
      !providers.groq &&
      !providers.sambanova &&
      !providers.cerebras &&
      !providers.huggingface &&
      !providers.pollinations
    ) {
      throw new Error(
        "No model provider configured. Add at least one text provider key in backend environment variables.",
      );
    }

    const material: any = await ctx.runQuery(internal.study.getMaterial, {
      materialId: args.materialId,
    });
    if (!material) {
      throw new Error("Material not found");
    }

    const focusContext = args.focusPrompt?.trim()
      ? `Prioritize this learner focus while generating the study pack: ${args.focusPrompt.trim()}`
      : "";

    async function chatJson(systemPrompt: string, userPrompt: string) {
      const { data } = await generateJsonWithFallback<any>({
        workload: "study-json",
        messages: [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userPrompt },
        ],
        maxTokens: 1600,
        temperature: 0.2,
      });
      return data;
    }

    async function chatText(systemPrompt: string, userPrompt: string) {
      const { content } = await generateTextWithFallback({
        workload: "study-summary",
        messages: [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userPrompt },
        ],
        maxTokens: 1800,
        temperature: 0.2,
      });
      return content;
    }

    // 1) Flashcards (JSON)
    let flashcards: Array<{
      front: string;
      back: string;
      difficulty?: string;
    }> = [];
    try {
      const flashcardsJson = await chatJson(
        'Generate exactly 20 high-quality flashcards from the content. Focus on conceptual understanding and application, not just definitions. Return JSON object with key \'flashcards\': [{"front": "question/concept", "back": "answer/explanation", "difficulty": "easy|medium|hard"}] and nothing else.',
        `${focusContext}\n\n${args.content.substring(0, 6000)}`.trim(),
      );
      flashcards = flashcardsJson.flashcards || flashcardsJson.cards || [];
    } catch (e) {
      flashcards = [];
    }

    for (const card of flashcards.slice(0, 20)) {
      await ctx.runMutation(internal.study.createFlashcardInternal, {
        userId: material.userId,
        materialId: args.materialId,
        front: card.front,
        back: card.back,
        difficulty: (card.difficulty as "easy" | "medium" | "hard") || "medium",
      });
    }

    // 2) Quiz (JSON)
    let questions: any[] = [];
    try {
      const quizJson = await chatJson(
        'Generate exactly 10 high-quality quiz questions. For each question, provide a detailed \'explanation\' field that explains WHY the correct answer is right and teaches the concept. Return JSON object with key \'questions\': [{"question": "...", "type": "multiple_choice|true_false|fill_blank", "options": ["..."], "correctAnswer": "...", "explanation": "Detailed explanation here..."}] and nothing else.',
        `${focusContext}\n\n${args.content.substring(0, 6000)}`.trim(),
      );
      questions = quizJson.questions || [];
    } catch {
      questions = [];
    }

    const quizId: any = await ctx.runMutation(
      internal.study.createQuizInternal,
      {
        userId: material.userId,
        materialId: args.materialId,
        title: `Quiz: ${args.title}`,
        questions: questions.slice(0, 10),
        difficulty: "medium",
      },
    );

    // 3) Podcast script (Text)
    let podcastScript = "";
    try {
      podcastScript = await chatText(
        "Create an engaging podcast script with intro, body, and outro sections.",
        `Create a podcast script for: ${args.title}\n\n${focusContext}\n\n${args.content.substring(0, 4000)}`,
      );
    } catch {
      podcastScript = "";
    }

    // 4) Notes (Text)
    let detailedNotes = "";
    try {
      detailedNotes = await chatText(
        "Create comprehensive, visually engaging study notes in markdown. Use emojis for section headers (e.g. '## 📚 Introduction'). Use **Bold** for key terms, names, and dates. Use **Lists** for clarity. Use LaTeX for math ($E=mc^2$). Include a '🎯 Key Takeaways' section at the top. Structure with clear hierarchy and bullet points.",
        `${focusContext}\n\n${args.content.substring(0, 8000)}`.trim(),
      );
    } catch {
      detailedNotes = args.content.substring(0, 1000) + "...";
    }

    // 4.5) Simple Summary (Text)
    let simpleSummary = "";
    try {
      console.log("Generating simple summary...");
      simpleSummary = await chatText(
        "Create a dyslexia-friendly summary of this content. Use simple language, short sentences, and clear bullet points. Use **bold** for key terms. Use emojis 🌟 for every section header and key point to make it visually engaging and easier to process. Structure with clear headers (e.g. '## 🚀 Main Idea'). Focus on maximum readability, clarity, and a friendly tone.",
        `${focusContext}\n\n${args.content.substring(0, 8000)}`.trim(),
      );
      console.log("Simple summary generated successfully.");
    } catch (e) {
      console.error("Simple summary generation failed:", e);
      simpleSummary =
        "Could not generate simple summary at this time. Please try again later.";
    }

    const summaryForPack = simpleSummary || detailedNotes;
    const fallbackKeyPoints = summaryForPack
      .split(/\n+/)
      .map((line) => line.replace(/^[-*#\d.\s]+/, "").trim())
      .filter((line) => line.length > 28)
      .slice(0, 5);
    const fallbackPracticePlan = [
      "Read the short summary once, then explain it back in your own words.",
      "Clear the flashcards once before opening the quiz.",
      "Use the quiz explanations to mark the concepts you should revisit.",
    ];
    const estimatedMinutes = Math.max(
      20,
      Math.min(
        80,
        Math.round(args.content.split(/\s+/).filter(Boolean).length / 120) + 18,
      ),
    );

    let packMeta: {
      description: string;
      keyPoints: string[];
      practicePlan: string[];
      estimatedMinutes: number;
      packStyle: string;
    } = {
      description:
        summaryForPack
          .split(/\n+/)
          .find((line) => line.trim().length > 24)
          ?.trim() || `Study pack built from ${args.title}.`,
      keyPoints:
        fallbackKeyPoints.length > 0
          ? fallbackKeyPoints
          : [
              "Review the summary first to rebuild the big picture.",
              "Use the flashcards for retrieval, not rereading.",
              "Use the quiz to expose weak spots before the exam does.",
            ],
      practicePlan: fallbackPracticePlan,
      estimatedMinutes,
      packStyle: "AI study pack",
    };

    try {
      const packJson = await chatJson(
        'Create study-pack metadata for a student. Return JSON only with keys: "description" (short teaser, max 160 chars), "keyPoints" (array of 4-6 concise bullets), "practicePlan" (array of exactly 3 action steps), "estimatedMinutes" (number), "packStyle" (short label).',
        `Title: ${args.title}\n\n${focusContext}\n\nSummary:\n${summaryForPack.substring(0, 5000)}`,
      );

      packMeta = {
        description:
          String(packJson.description || packMeta.description)
            .trim()
            .slice(0, 180) || packMeta.description,
        keyPoints: Array.isArray(packJson.keyPoints)
          ? packJson.keyPoints
              .map((item: unknown) => String(item || "").trim())
              .filter(Boolean)
              .slice(0, 6)
          : packMeta.keyPoints,
        practicePlan: Array.isArray(packJson.practicePlan)
          ? packJson.practicePlan
              .map((item: unknown) => String(item || "").trim())
              .filter(Boolean)
              .slice(0, 3)
          : packMeta.practicePlan,
        estimatedMinutes:
          typeof packJson.estimatedMinutes === "number"
            ? Math.max(15, Math.min(90, Math.round(packJson.estimatedMinutes)))
            : packMeta.estimatedMinutes,
        packStyle:
          String(packJson.packStyle || packMeta.packStyle)
            .trim()
            .slice(0, 40) || packMeta.packStyle,
      };
    } catch {
      // Keep the deterministic fallback metadata when the extra packaging step fails.
    }

    const noteId: any = await ctx.runMutation(
      internal.study.createNoteInternal,
      {
        userId: material.userId,
        materialId: args.materialId,
        title: `Notes: ${args.title}`,
        content: detailedNotes,
        format: "markdown",
        isAIGenerated: true,
      },
    );

    // 5) Concept Map (JSON)
    let conceptMap: { nodes: any[]; edges: any[] } = { nodes: [], edges: [] };
    try {
      const conceptMapJson = await chatJson(
        `Generate a concept map from this content. Return JSON object with:
- "nodes": array of {id: string, label: string, category: "main"|"sub"|"detail"}
- "edges": array of {source: string, target: string, relationship: string}
Create 8-15 nodes covering the main concepts and their relationships. Make sure all edge source/target IDs match existing node IDs.`,
        `${focusContext}\n\n${args.content.substring(0, 6000)}`.trim(),
      );
      conceptMap = {
        nodes: conceptMapJson.nodes || [],
        edges: conceptMapJson.edges || [],
      };
    } catch {
      conceptMap = { nodes: [], edges: [] };
    }

    // Store concept map if we generated nodes
    let conceptMapId: any = null;
    if (conceptMap.nodes.length > 0) {
      // Format nodes for storage with positions
      const formattedNodes = conceptMap.nodes.map((node: any, i: number) => ({
        id: node.id || `node-${i}`,
        data: { label: node.label || `Concept ${i + 1}` },
        position: {
          x: 150 + (i % 4) * 200 + Math.random() * 50,
          y: 100 + Math.floor(i / 4) * 150 + Math.random() * 30,
        },
        type:
          node.category === "main"
            ? "input"
            : node.category === "detail"
              ? "output"
              : "default",
      }));

      const formattedEdges = conceptMap.edges.map((edge: any, i: number) => ({
        id: `edge-${i}`,
        source: edge.source,
        target: edge.target,
        label: edge.relationship || "",
        animated: edge.relationship?.toLowerCase().includes("leads") || false,
      }));

      conceptMapId = await ctx.runMutation(
        internal.studyMutations.createMindMapInternal,
        {
          userId: String(material.userId),
          title: `Concept Map: ${args.title}`,
          materialId: args.materialId,
          nodes: formattedNodes,
          edges: formattedEdges,
          layout: "hierarchical",
        },
      );
    }

    await ctx.runMutation(internal.study.updateMaterialSummary, {
      materialId: args.materialId,
      summary: {
        short: detailedNotes.substring(0, 200) + "...",
        detailed: detailedNotes,
        simple: simpleSummary,
      },
    });

    // Also update studyDocuments if docId is provided
    if (args.docId) {
      await ctx.runMutation(
        internal.studyMutations.updateDocumentSummaryInternal,
        {
        docId: args.docId,
        summary: {
          short: detailedNotes.substring(0, 200) + "...",
          detailed: detailedNotes,
          simple: simpleSummary,
        },
        },
      );
    }

    const packId: any = await ctx.runMutation(
      internal.study.upsertStudyPackInternal,
      {
        materialId: args.materialId,
        noteId,
        quizId,
        conceptMapId: conceptMapId || undefined,
        title: `${args.title} Study Pack`,
        description: packMeta.description,
        focusPrompt: args.focusPrompt,
        summary: {
          short: detailedNotes.substring(0, 200) + "...",
          detailed: detailedNotes,
          simple: simpleSummary,
        },
        keyPoints: packMeta.keyPoints,
        practicePlan: packMeta.practicePlan,
        flashcardsCount: flashcards.length,
        quizQuestionsCount: questions.length,
        estimatedMinutes: packMeta.estimatedMinutes,
        packStyle: packMeta.packStyle,
      },
    );

    return {
      flashcardsCount: flashcards.length,
      quizQuestionsCount: questions.length,
      podcastScript,
      noteId,
      quizId,
      packId,
      conceptMapId,
      conceptMapNodesCount: conceptMap.nodes.length,
      summary_detailed: detailedNotes,
      summary_short: detailedNotes.substring(0, 200) + "...",
      summary_simple: simpleSummary,
    };
  },
});

export const improveSummary = action({
  args: {
    currentSummary: v.string(),
    instruction: v.string(),
  },
  handler: async (ctx, args) => {
    const providers = getConfiguredProviderStatus();
    if (
      !providers.google &&
      !providers.openrouter &&
      !providers.groq &&
      !providers.sambanova &&
      !providers.cerebras &&
      !providers.huggingface &&
      !providers.pollinations
    ) {
      throw new Error("No model provider configured.");
    }

    async function chatText(systemPrompt: string, userPrompt: string) {
      const { content } = await generateTextWithFallback({
        workload: "study-summary",
        messages: [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userPrompt },
        ],
        maxTokens: 1400,
        temperature: 0.2,
      });
      return content;
    }

    const improvedSummary = await chatText(
      "You are a helpful AI study assistant. Improve the following summary based on the user's instructions. Maintain the markdown formatting.",
      `Current Summary:\n${args.currentSummary}\n\nUser Instruction:\n${args.instruction}`,
    );

    return improvedSummary;
  },
});
