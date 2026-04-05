// @ts-nocheck

"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import {
  generateJsonWithFallback,
  generateTextWithFallback,
  getConfiguredProviderStatus,
  getAiProviderKeys,
} from "./lib/aiRouting";
import { analyzePDFContent } from "../lib/pdfAnalysis";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const POLLINATIONS_LEGACY_URL =
  "https://text.pollinations.ai/openai/chat/completions";
const POLLINATIONS_AUTH_URL = "https://gen.pollinations.ai/v1/chat/completions";
const OPENROUTER_HEADERS = {
  "HTTP-Referer": "https://www.cryonex.app",
  "X-Title": "Cryonex Study",
};
const OPENROUTER_TEXT_MODELS = [
  {
    name: "Step 3.5 Flash Free",
    model: "stepfun/step-3.5-flash:free",
    maxTokens: 1400,
  },
  {
    name: "GLM 4.5 Air Free",
    model: "z-ai/glm-4.5-air:free",
    maxTokens: 1200,
  },
  {
    name: "Free Models Router",
    model: "openrouter/free",
    maxTokens: 1000,
  },
];
const POLLINATIONS_AUTH_TEXT_MODELS = [
  {
    name: "Pollinations Kimi K2.5",
    model: "kimi",
    maxTokens: 1400,
  },
  {
    name: "Pollinations DeepSeek V3.2",
    model: "deepseek",
    maxTokens: 1200,
  },
  {
    name: "Pollinations Gemini 3 Pro",
    model: "gemini-large",
    maxTokens: 1200,
  },
];
const POLLINATIONS_FREE_TEXT_MODELS = [
  {
    name: "Pollinations OpenAI Fast",
    model: "openai-fast",
    maxTokens: 1000,
  },
  {
    name: "Pollinations OpenAI",
    model: "openai",
    maxTokens: 900,
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
];
const POLLINATIONS_AUTH_VISION_MODELS = [
  {
    name: "Pollinations Kimi K2.5",
    model: "kimi",
    maxTokens: 1000,
  },
  {
    name: "Pollinations Gemini + Search",
    model: "gemini-search",
    maxTokens: 900,
  },
];
const POLLINATIONS_FREE_VISION_MODELS = [
  {
    name: "Pollinations Qwen Vision",
    model: "qwen-vision",
    maxTokens: 1000,
  },
  {
    name: "Pollinations OpenAI Fast",
    model: "openai-fast",
    maxTokens: 900,
  },
];

function getOpenRouterKey() {
  return getAiProviderKeys().openrouter;
}

const FLASHCARD_SOURCE_LIMIT = 60000;
const QUIZ_SOURCE_LIMIT = 60000;
const PODCAST_SOURCE_LIMIT = 30000;
const NOTES_SOURCE_LIMIT = 60000;
const SUMMARY_SOURCE_LIMIT = 60000;

function normalizeGeneratedCardText(value: string) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[?.!;,]$/, "")
    .trim();
}

function getGeneratedCardSignature(card: { front: string; back: string }) {
  return [
    normalizeGeneratedCardText(card.front),
    normalizeGeneratedCardText(card.back),
  ].join("\u0000");
}

function normalizeGeneratedFlashcard(card: any) {
  let front = String(card?.front || card?.question || "").trim();
  let back = String(card?.back || card?.answer || "").trim();

  // Clean up common AI prefixes/labels
  front = front.replace(/^(Front|Question|Q|Prompt):\s*/i, "");
  back = back.replace(/^(Back|Answer|A|Explanation):\s*/i, "");

  if (!front || !back) {
    return null;
  }

  const difficulty = String(card?.difficulty || "medium").toLowerCase();

  return {
    front,
    back,
    difficulty:
      difficulty === "easy" || difficulty === "hard" ? difficulty : "medium",
  };
}

function normalizeGeneratedQuizQuestion(question: any, index: number) {
  const prompt = String(question?.question || question?.prompt || "").trim();
  const rawOptions = Array.isArray(question?.options)
    ? question.options
        .map((option: unknown) => String(option || "").trim())
        .filter(Boolean)
    : [];
  const rawCorrectAnswer = String(
    question?.correctAnswer || question?.answer || "",
  ).trim();
  const rawExplanation = String(question?.explanation || "").trim();
  const rawType = String(question?.type || "multiple_choice").toLowerCase();

  if (!prompt) {
    return null;
  }

  if (rawType === "true_false") {
    const correctAnswer =
      rawCorrectAnswer.toLowerCase() === "false" ? "False" : "True";
    return {
      question: prompt,
      type: "true_false" as const,
      options: ["True", "False"],
      correctAnswer,
      explanation: rawExplanation || undefined,
      topic: String(question?.topic || "").trim() || undefined,
    };
  }

  const options = [
    ...new Set(
      [...rawOptions, rawCorrectAnswer]
        .map((option) => option.trim())
        .filter(Boolean),
    ),
  ].filter(Boolean);

  if (options.length < 2) {
    const fallbackAnswer = rawCorrectAnswer || `Option ${index + 1}`;
    const fallbackOptions = [
      fallbackAnswer,
      fallbackAnswer === "True" ? "False" : "None of the above",
    ];

    return {
      question: prompt,
      type: "multiple_choice" as const,
      options: fallbackOptions,
      correctAnswer: fallbackAnswer,
      explanation: rawExplanation || undefined,
      topic: String(question?.topic || "").trim() || undefined,
    };
  }

  const correctAnswer = options.includes(rawCorrectAnswer)
    ? rawCorrectAnswer
    : options[0];

  return {
    question: prompt,
    type: "multiple_choice" as const,
    options,
    correctAnswer,
    explanation: rawExplanation || undefined,
    topic: String(question?.topic || "").trim() || undefined,
  };
}

function splitStudySourceIntoLines(content: string) {
  return content
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function extractStudyTopics(content: string, title: string, limit = 12) {
  const lines = splitStudySourceIntoLines(content);
  const headingCandidates = lines
    .filter((line) => /^#{1,6}\s+/.test(line) || /^[A-Z][A-Za-z0-9\s:-]{3,80}$/.test(line))
    .map((line) => line.replace(/^#{1,6}\s+/, "").trim())
    .filter((line) => line.length >= 3);

  const nounCandidates = Array.from(
    new Set(
      (content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [])
        .map((term) => term.trim())
        .filter((term) => term.length > 3),
    ),
  );

  const topics = [
    title.trim(),
    ...headingCandidates,
    ...nounCandidates,
  ]
    .map((topic) => topic.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return Array.from(new Set(topics)).slice(0, limit);
}

function buildFallbackFlashcards(content: string, title: string, count: number) {
  const topics = extractStudyTopics(content, title, Math.max(8, count + 4));
  const fallbackTopics = topics.length > 0 ? topics : [title || "Study material"];

  return Array.from({ length: count }, (_, index) => {
    const topic = fallbackTopics[index % fallbackTopics.length];
    
    // Create more meaningful content even in fallbacks
    const questions = [
      `What are the core characteristics of ${topic}?`,
      `How does ${topic} relate to the broader context of ${title}?`,
      `Define and explain the importance of ${topic}.`,
      `What is a practical application of ${topic}?`,
      `Explain the relationship between ${topic} and other themes in these notes.`,
    ];
    
    return {
      front: questions[index % questions.length],
      back: `This card is a focus guide for ${topic}. Research this concept within your source material to master it. ${topic} is identified as a critical theme in ${title || "the context"}.`,
      difficulty: index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard",
    };
  });
}

function buildFallbackQuizQuestions(content: string, title: string, count: number) {
  const topics = extractStudyTopics(content, title, Math.max(6, count + 2));
  const fallbackTopics = topics.length > 0 ? topics : [title || "the source material"];
  const optionsPool = Array.from(
    new Set([
      ...fallbackTopics,
      "A supporting detail",
      "A distractor",
      "An unrelated example",
      "None of the above",
    ]),
  );

  return Array.from({ length: count }, (_, index) => {
    const topic = fallbackTopics[index % fallbackTopics.length];
    const otherOptions = optionsPool.filter((option) => option !== topic).slice(0, 3);
    const options = [topic, ...otherOptions].slice(0, 4);

    return {
      question: `Which statement best describes ${topic}?`,
      type: "multiple_choice" as const,
      options,
      correctAnswer: topic,
      explanation:
        `This fallback question keeps the quiz usable even if the model response is incomplete. ${topic} is treated as a core source idea.`,
      topic,
    };
  });
}

function buildFallbackConceptMap(content: string, title: string) {
  const analysis = analyzePDFContent(content, {
    headings: extractStudyTopics(content, title, 10),
  } as any);

  const nodesSource =
    analysis.keyTopics.length > 0 ? analysis.keyTopics : analysis.concepts;
  const nodes = (nodesSource.length > 0 ? nodesSource : [title || "Source"])
    .slice(0, 10)
    .map((label, index) => ({
      id: `fallback-${index}`,
      label,
      category: index === 0 ? "main" : index % 3 === 0 ? "detail" : "sub",
    }));

  const edges =
    nodes.length > 1
      ? nodes.slice(1).map((node, index) => ({
          source: nodes[index].id,
          target: node.id,
          relationship: "relates to",
        }))
      : [];

  return { nodes, edges };
}

function buildStudyAssetResult(snapshot: any, extras: any = {}) {
  const flashcardsCount = snapshot?.flashcards?.length || 0;
  const quizQuestionsCount = snapshot?.quiz?.questions?.length || 0;
  const summary = snapshot?.material?.summary || {};
  const noteId = snapshot?.note?._id || extras.noteId || null;
  const quizId = snapshot?.quiz?._id || extras.quizId || null;
  const packId = snapshot?.pack?._id || extras.packId || null;

  return {
    flashcardsCount,
    quizQuestionsCount,
    podcastScript: extras.podcastScript || "",
    noteId,
    quizId,
    packId,
    conceptMapId: snapshot?.mindMap?._id || extras.conceptMapId || null,
    conceptMapNodesCount: snapshot?.mindMap?.nodes?.length || 0,
    summary_detailed:
      summary.detailed || extras.summary_detailed || snapshot?.note?.content || "",
    summary_short:
      summary.short || extras.summary_short || (summary.detailed || "").substring(0, 200) || "",
    summary_simple:
      summary.simple || extras.summary_simple || "",
  };
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

export const generateAllAssets = action({
  args: {
    materialId: v.id("studyMaterials"),
    content: v.string(),
    title: v.string(),
    docId: v.optional(v.string()),
    focusPrompt: v.optional(v.string()),
    flashcardCount: v.optional(v.number()),
    quizQuestionCount: v.optional(v.number()),
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

    const material: any = await ctx.runQuery(internal.study.getMaterial, {
      materialId: args.materialId,
    });
    if (!material) throw new Error("Material not found");

    const generationLease = await ctx.runMutation(
      internal.study.reserveStudyAssetGeneration,
      { materialId: args.materialId },
    );

    const snapshot = await ctx.runQuery(internal.study.getStudyAssetSnapshot, {
      materialId: args.materialId,
    });

    if (snapshot?.pack && snapshot.note && snapshot.quiz && (snapshot.flashcards?.length || 0) > 0) {
      await ctx.runMutation(internal.study.markStudyAssetGenerationComplete, { materialId: args.materialId });
      return buildStudyAssetResult(snapshot);
    }

    if (generationLease.state === "running") {
      throw new Error("Study assets are already generating.");
    }

    try {
      const STUDY_PACK_COST = 12.0;
      await ctx.runMutation(api.credits.charge, {
        amount: STUDY_PACK_COST,
        type: "study",
        description: `Study Generation: ${args.title.substring(0, 30)}...`,
        metadata: { materialId: args.materialId },
      });
    } catch (e) {
      throw new Error(`Insufficient credits. You need ${STUDY_PACK_COST} Credits.`);
    }

    const focusContext = args.focusPrompt?.trim()
      ? `Prioritize this learner focus: ${args.focusPrompt.trim()}`
      : "";
    const desiredFlashcardCount = Math.max(8, Math.min(30, Math.round(args.flashcardCount || 18)));
    const desiredQuizCount = Math.max(5, Math.min(15, Math.round(args.quizQuestionCount || 10)));

    async function chatJson(systemPrompt: string, userPrompt: string) {
      const result = await generateJsonWithFallback<any>({
        workload: "study-json",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        maxTokens: 3000,
        temperature: 0.1,
      });
      return result;
    }

    async function chatText(systemPrompt: string, userPrompt: string) {
      const { content } = await generateTextWithFallback({
        workload: "study-summary",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        maxTokens: 4000,
        temperature: 0.2,
      });
      return content;
    }

    try {
      console.log(
        `[generateAllAssets] Starting parallel generation for ${args.materialId}`,
      );

      const [fRes, qRes, pRes, nRes, sRes, cRes] = await Promise.allSettled([
        chatJson(
          `Generate ${desiredFlashcardCount} high-quality flashcards for study. 
          Return JSON with key 'flashcards' as an array of objects.
          EACH OBJECT MUST HAVE: 'front' (the question/concept) and 'back' (the answer/definition).
          DO NOT include prefixes like "Front:" or "Back:" in the text itself.
          Ensure cards are distinct and cover key concepts.`,
          `${focusContext}\n\n${args.content.substring(0, FLASHCARD_SOURCE_LIMIT)}`,
        ),
        chatJson(
          `Generate ${desiredQuizCount} quiz questions. Return JSON with key 'questions': [{"question": "...", "type": "multiple_choice|true_false", "options": [...], "correctAnswer": "...", "explanation": "..."}].`,
          `${focusContext}\n\n${args.content.substring(0, QUIZ_SOURCE_LIMIT)}`,
        ),
        chatText(
          "Create a podcast script.",
          `Script for: ${args.title}\n\n${args.content.substring(0, PODCAST_SOURCE_LIMIT)}`,
        ),
        chatText(
          "Create detailed markdown notes.",
          `${focusContext}\n\n${args.content.substring(0, NOTES_SOURCE_LIMIT)}`,
        ),
        chatText(
          "Create a simple dyslexia-friendly summary with emojis.",
          `${focusContext}\n\n${args.content.substring(0, SUMMARY_SOURCE_LIMIT)}`,
        ),
        chatJson(
          "Generate a concept map JSON.",
          `${focusContext}\n\n${args.content.substring(0, QUIZ_SOURCE_LIMIT)}`,
        ),
      ]);

      let flashcards =
        fRes.status === "fulfilled"
          ? (fRes.value.data.flashcards || fRes.value.data.cards || fRes.value.data || [])
              .map(normalizeGeneratedFlashcard)
              .filter(Boolean)
          : [];
      let questions =
        qRes.status === "fulfilled"
          ? (qRes.value.data.questions || fRes.value.data.items || [])
              .map(normalizeGeneratedQuizQuestion)
              .filter(Boolean)
          : [];
      let podcastScript = pRes.status === "fulfilled" ? pRes.value : "";
      let detailedNotes =
        nRes.status === "fulfilled" ? nRes.value : args.content.substring(0, 1000);
      let simpleSummary =
        sRes.status === "fulfilled" ? sRes.value : "Summary unavailable.";
      let conceptMapResult =
        cRes.status === "fulfilled" ? cRes.value.data : { nodes: [], edges: [] };

      if (flashcards.length === 0) {
        flashcards = buildFallbackFlashcards(
          args.content,
          args.title,
          desiredFlashcardCount,
        );
      }
      if (questions.length === 0) {
        questions = buildFallbackQuizQuestions(
          args.content,
          args.title,
          desiredQuizCount,
        );
      }

      const existingFlashcards = snapshot?.flashcards || [];
      const existingFlashcardSignatures = new Set(
        existingFlashcards.map((card: any) => getGeneratedCardSignature(card)),
      );
      const flashcardsToInsert = flashcards
        .slice(0, desiredFlashcardCount)
        .filter((card: any) => {
          const sig = getGeneratedCardSignature(card);
          if (existingFlashcardSignatures.has(sig)) return false;
          existingFlashcardSignatures.add(sig);
          return true;
        })
        .map((card: any) => ({
          userId: material.userId,
          materialId: args.materialId,
          front: card.front,
          back: card.back,
          difficulty: card.difficulty || "medium",
        }));

      if (flashcardsToInsert.length > 0) {
        await ctx.runMutation(internal.study.createFlashcardsBulkInternal, {
          cards: flashcardsToInsert,
        });
      }

      const quizQuestions = questions.slice(0, desiredQuizCount);
      let quizId =
        snapshot?.quiz?._id ||
        (await ctx.runMutation(internal.study.createQuizInternal, {
          userId: material.userId,
          materialId: args.materialId,
          title: `Quiz: ${args.title}`,
          questions: quizQuestions,
          difficulty: "medium",
        }));
      if (snapshot?.quiz?._id) {
        await ctx.runMutation(internal.study.updateQuizInternal, {
          quizId,
          questions: quizQuestions,
        });
      }

      const noteId =
        snapshot?.note?._id ||
        (await ctx.runMutation(internal.study.createNoteInternal, {
          userId: material.userId,
          materialId: args.materialId,
          title: `Notes: ${args.title}`,
          content: detailedNotes,
          format: "markdown",
          isAIGenerated: true,
        }));

      let conceptMapId = snapshot?.mindMap?._id || null;
      if (!conceptMapId && conceptMapResult.nodes?.length > 0) {
        const formattedNodes = conceptMapResult.nodes.map(
          (node: any, i: number) => ({
            id: node.id || `node-${i}`,
            data: { label: node.label || `Concept ${i + 1}` },
            position: {
              x: 150 + (i % 4) * 200,
              y: 100 + Math.floor(i / 4) * 150,
            },
            type:
              node.category === "main"
                ? "input"
                : node.category === "detail"
                  ? "output"
                  : "default",
          }),
        );
        const formattedEdges = (conceptMapResult.edges || []).map(
          (edge: any, i: number) => ({
            id: `edge-${i}`,
            source: edge.source,
            target: edge.target,
            label: edge.relationship || "",
            animated: !!edge.relationship,
          }),
        );
        conceptMapId = await ctx.runMutation(
          internal.studyMutations.createMindMapInternal,
          {
            userId: material.userId,
            title: `Map: ${args.title}`,
            materialId: args.materialId,
            nodes: formattedNodes,
            edges: formattedEdges,
            layout: "hierarchical",
          },
        );
      }

      let packMeta = {
        description: `Study pack for ${args.title}`,
        keyPoints: [],
        practicePlan: [],
        estimatedMinutes: 30,
        packStyle: "AI Study",
      };
      try {
        const pMeta = await chatJson(
          "Create study-pack metadata.",
          `Summary:\n${detailedNotes.substring(0, 1000)}`,
        );
        packMeta = { ...packMeta, ...pMeta };
      } catch {}

      await ctx.runMutation(internal.study.updateMaterialSummary, {
        materialId: args.materialId,
        summary: {
          short: detailedNotes.substring(0, 200),
          detailed: detailedNotes,
          simple: simpleSummary,
        },
      });

      const packId = await ctx.runMutation(internal.study.upsertStudyPackInternal, {
        materialId: args.materialId,
        noteId,
        quizId,
        conceptMapId: conceptMapId || undefined,
        title: `${args.title} Pack`,
        description: packMeta.description,
        focusPrompt: args.focusPrompt,
        summary: {
          short: detailedNotes.substring(0, 200),
          detailed: detailedNotes,
          simple: simpleSummary,
        },
        keyPoints: packMeta.keyPoints || [],
        practicePlan: packMeta.practicePlan || [],
        flashcardsCount: (existingFlashcards.length || 0) + flashcardsToInsert.length,
        quizQuestionsCount: quizQuestions.length,
        estimatedMinutes: packMeta.estimatedMinutes || 30,
        packStyle: packMeta.packStyle || "AI",
      });

      await ctx.runMutation(internal.study.markStudyAssetGenerationComplete, {
        materialId: args.materialId,
      });

      return {
        flashcardsCount: (existingFlashcards.length || 0) + flashcardsToInsert.length,
        quizQuestionsCount: quizQuestions.length,
        podcastScript,
        noteId,
        quizId,
        packId,
        conceptMapId,
        summary_detailed: detailedNotes,
        summary_short: detailedNotes.substring(0, 200),
        summary_simple: simpleSummary,
      };
    } catch (error) {
      await ctx.runMutation(internal.study.markStudyAssetGenerationFailed, {
        materialId: args.materialId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
});

export const generateQuiz = action({
  args: {
    materialId: v.optional(v.id("studyMaterials")),
    topic: v.string(),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let content = "";
    let title = args.topic;

    if (args.materialId) {
      const material: any = await ctx.runQuery(internal.study.getMaterial, {
        materialId: args.materialId,
      });
      console.log(`[generateQuiz] Found material: ${material?.title}`);
      if (material) {
        content = material.content || "";
        title = material.title || title;
      }
    }

    if (!content.trim()) {
      content = `Study topic: ${args.topic}. Generate a comprehensive quiz covering the fundamental and advanced aspects of this subject.`;
    }

    const desiredCount = Math.max(5, Math.min(15, Math.round(args.count || 10)));

    const result = await generateJsonWithFallback<any>({
      workload: "study-json",
      messages: [
        {
          role: "system",
          content: `You are a professional educator. Generate ${desiredCount} highly relevant and accurate quiz questions based on the provided material.
Return ONLY valid JSON with a 'questions' key containing an array of objects:
{
  "questions": [
    {
      "question": "Clear, concise question text",
      "type": "multiple_choice" | "true_false",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The exact text of the correct option",
      "explanation": "Brief pedagogical explanation",
      "topic": "Specific sub-topic"
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Source Material:\n${content.substring(0, 40000)}`,
        },
      ],
      maxTokens: 3000,
      temperature: 0.1,
    });

    const questions = (result.questions || [])
      .map((q: any, i: number) => normalizeGeneratedQuizQuestion(q, i))
      .filter(Boolean);

    if (questions.length === 0) {
      console.log("[generateQuiz] No questions generated, using fallbacks");
      return buildFallbackQuizQuestions(content, title, desiredCount);
    }

    return questions;
  },
});


export const improveSummary = action({
  args: { currentSummary: v.string(), instruction: v.string() },
  handler: async (ctx, args) => {
    const { content } = await generateTextWithFallback({
      workload: "study-summary",
      messages: [
        { role: "system", content: "Improve the summary based on instructions." },
        { role: "user", content: `Summary:\n${args.currentSummary}\n\nInstruction:\n${args.instruction}` }
      ],
      maxTokens: 4000, temperature: 0.2
    });
    return content;
  }
});
