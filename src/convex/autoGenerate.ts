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

function cleanAiOutput(value: string) {
  return String(value || "")
    .replace(/\[\s*(?:img|image|figure|fig|picture|photo|pic).*?\.(?:jpg|jpeg|png|gif|webp|svg|pdf)\s*\]/gi, "")
    .replace(/\[\s*(?:image|figure|fig|picture|photo|pic)\s*\d*\s*\]/gi, "")
    .replace(/\(\s*(?:img|image|figure|fig|picture|photo|pic).*?\.(?:jpg|jpeg|png|gif|webp|svg|pdf)\s*\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeGeneratedCardText(value: string) {
  return cleanAiOutput(value)
    .toLowerCase()
    .replace(/[?.!;,]$/, "")
    .trim();
}

function stripWrappingQuotes(value: string) {
  return cleanAiOutput(value)
    .replace(/^["'`]+/, "")
    .replace(/["'`]+$/, "")
    .trim();
}

function isPlaceholderTopic(value: string) {
  const cleaned = normalizeGeneratedCardText(value);
  if (!cleaned || cleaned.length < 2) return true;
  // Catch "Lesson X", "Chapter Y" etc.
  if (/^(lesson|chapter|section|topic|unit|part|module|page|slide|figure|table|vid|video)\s*[-:#]?\s*[a-z0-9]+$/i.test(cleaned)) {
    return true;
  }
  // Catch "No information", "Missing info", "Not found"
  if (/^(no|missing|insufficient|nil|none|not found|unknown|placeholder|n\/a|null|undefined)\s+(info|information|data|details|content|source|text|topic|answer|question)/i.test(cleaned)) {
    return true;
  }
  // Catch single words that are basically placeholders
  if (/^(untitled|unknown|placeholder|none|n\/a|null|undefined|nan|todo|fixme|empty)$/i.test(cleaned)) {
    return true;
  }

  // Catch image-like placeholders that escaped regex
  if (/\[.*?\.jpg\]|\[.*?\.png\]|\[image\d*\]/i.test(cleaned)) {
    return true;
  }

  return false;
}

function isGenericStudyInstruction(value: string) {
  const cleaned = stripWrappingQuotes(value).toLowerCase();
  return /^(explain|describe|discuss|review|study|summarize|outline|analyze|define|identify|list|provide|give)\b/i.test(
    cleaned,
  );
}

function looksLikeRealAnswer(value: string) {
  const cleaned = stripWrappingQuotes(value);
  if (!cleaned || cleaned.length < 5) return false;
  if (isPlaceholderTopic(cleaned)) return false;
  
  const lower = cleaned.toLowerCase();
  if (
    /^(this (card|question|answer|lesson)|study this|refer to the|review the material|please provide|i don't have|i cannot find|the document doesn't)/i.test(lower)
  ) {
    return false;
  }
  
  if (lower.includes("not mentioned in the") || lower.includes("not found in the") || lower.includes("no information provided")) {
    return false;
  }

  // If it's just a generic "The answer is in the text", it's not a real answer
  if (/^(the answer is|refer to|see section|look at page)/i.test(lower) && cleaned.length < 60) {
    return false;
  }

  return true;
}

function isWeakFlashcardPair(front: string, back: string) {
  const normalizedFront = normalizeGeneratedCardText(front);
  const normalizedBack = normalizeGeneratedCardText(back);

  if (!normalizedFront || !normalizedBack) return true;
  if (normalizedFront === normalizedBack) return true;
  
  if (isPlaceholderTopic(front) || isPlaceholderTopic(back)) return true;
  
  // If the back is just an instruction or very short placeholder-y text
  if (isGenericStudyInstruction(back) && normalizedBack.length <= 64) return true;
  if (!looksLikeRealAnswer(back)) return true;

  // Front should also looks somewhat like a question/prompt
  if (normalizedFront.length < 3) return true;

  if (
    /^(what is|explain|describe)\s+(lesson|chapter|section|topic|unit|part|module|page)\b/i.test(
      stripWrappingQuotes(front),
    )
  ) {
    return true;
  }
  return false;
}


function extractCandidateFacts(content: string, title: string, limit = 24) {
  const lines = splitStudySourceIntoLines(content).slice(0, 400);
  const facts: Array<{ concept: string; detail: string }> = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const nextLine = lines[index + 1] || "";

    if (line.length < 6) continue;

    const definitionMatch = line.match(
      /^([A-Za-z0-9][A-Za-z0-9\s()/,%+-]{1,80}?)\s*[:=-]\s+(.{12,240})$/,
    );
    if (definitionMatch) {
      const concept = stripWrappingQuotes(definitionMatch[1]);
      const detail = stripWrappingQuotes(definitionMatch[2]);
      if (!isPlaceholderTopic(concept) && looksLikeRealAnswer(detail)) {
        facts.push({ concept, detail });
        continue;
      }
    }

    const heading = line.replace(/^#{1,6}\s+/, "").trim();
    if (
      heading &&
      heading.length <= 80 &&
      !isPlaceholderTopic(heading) &&
      !/[.!?]$/.test(heading) &&
      looksLikeRealAnswer(nextLine)
    ) {
      facts.push({ concept: heading, detail: stripWrappingQuotes(nextLine) });
      continue;
    }

    const bulletMatch = line.match(/^[-*•]\s+(.{12,240})$/);
    if (bulletMatch) {
      const detail = stripWrappingQuotes(bulletMatch[1]);
      const conceptMatch = detail.match(
        /^([A-Za-z0-9][A-Za-z0-9\s()/,%+-]{1,70}?)\s+(is|are|refers to|means)\s+(.{8,180})$/i,
      );
      if (conceptMatch) {
        const concept = stripWrappingQuotes(conceptMatch[1]);
        if (!isPlaceholderTopic(concept) && looksLikeRealAnswer(detail)) {
          facts.push({ concept, detail });
        }
      }
    }
  }

  if (facts.length === 0) {
    const topics = extractStudyTopics(content, title, Math.max(8, limit));
    const fallbackFacts = topics
      .filter((topic) => !isPlaceholderTopic(topic))
      .map((topic) => ({
        concept: topic,
        detail: `${topic} is a key concept from ${title || "this study material"}. Review the source content to identify its definition, role, and examples.`,
      }))
      .slice(0, limit);
    return fallbackFacts.length > 0
      ? fallbackFacts
      : [
          {
            concept: title && !isPlaceholderTopic(title) ? title : "the study material",
            detail:
              "Review the source material and capture the main definition, process, or principle instead of a generic lesson label.",
          },
        ];
  }

  const uniqueFacts = new Map<string, { concept: string; detail: string }>();
  for (const fact of facts) {
    const signature = `${normalizeGeneratedCardText(fact.concept)}\u0000${normalizeGeneratedCardText(fact.detail)}`;
    if (!uniqueFacts.has(signature)) {
      uniqueFacts.set(signature, fact);
    }
  }

  return Array.from(uniqueFacts.values()).slice(0, limit);
}

function getGeneratedCardSignature(card: { front: string; back: string }) {
  return [
    normalizeGeneratedCardText(card.front),
    normalizeGeneratedCardText(card.back),
  ].join("\u0000");
}

function normalizeGeneratedFlashcard(card: any) {
  let front = stripWrappingQuotes(String(card?.front || card?.question || "").trim());
  let back = stripWrappingQuotes(String(card?.back || card?.answer || "").trim());

  // Clean up common AI prefixes/labels
  front = front.replace(/^(Front|Question|Q|Prompt):\s*/i, "");
  back = back.replace(/^(Back|Answer|A|Explanation):\s*/i, "");

  if (!front || !back || isWeakFlashcardPair(front, back)) {
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
  const prompt = stripWrappingQuotes(
    String(question?.question || question?.prompt || "").trim(),
  );
  const rawOptions = Array.isArray(question?.options)
    ? question.options
        .map((option: unknown) => stripWrappingQuotes(String(option || "").trim()))
        .filter(Boolean)
    : [];
  const rawCorrectAnswer = stripWrappingQuotes(String(
    question?.correctAnswer || question?.answer || "",
  ).trim());
  const rawExplanation = stripWrappingQuotes(
    String(question?.explanation || "").trim(),
  );
  const rawType = String(question?.type || "multiple_choice").toLowerCase();

  if (!prompt) {
    return null;
  }

  if (
    /^(what is|explain|describe)\s+(lesson|chapter|section|topic|unit|part|module|page)\b/i.test(
      prompt,
    )
  ) {
    return null;
  }

  if (rawType === "true_false") {
    const correctAnswer =
      rawCorrectAnswer.toLowerCase() === "false" ? "False" : "True";
    if (isPlaceholderTopic(prompt)) {
      return null;
    }
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
        .filter((option) => Boolean(option) && !isPlaceholderTopic(option)),
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

  if (
    isPlaceholderTopic(correctAnswer) ||
    options.every((option) => normalizeGeneratedCardText(option) === normalizeGeneratedCardText(correctAnswer))
  ) {
    return null;
  }

  return {
    question: prompt,
    type: "multiple_choice" as const,
    options,
    correctAnswer,
    explanation: rawExplanation || undefined,
    topic: String(question?.topic || "").trim() || undefined,
  };
}

function getQuizSourceTerms(content: string, title: string) {
  const terms = new Set<string>();
  const cleanedTitle = normalizeGeneratedCardText(title).toLowerCase();
  if (cleanedTitle && !isPlaceholderTopic(title)) {
    terms.add(cleanedTitle);
  }

  for (const fact of extractCandidateFacts(content, title, 12)) {
    const concept = normalizeGeneratedCardText(fact.concept).toLowerCase();
    const detail = normalizeGeneratedCardText(fact.detail).toLowerCase();
    if (concept) terms.add(concept);
    if (detail) {
      detail
        .split(/\s+/)
        .filter((word) => word.length >= 5)
        .slice(0, 8)
        .forEach((word) => terms.add(word));
    }
  }

  for (const topic of extractStudyTopics(content, title, 12)) {
    const normalized = normalizeGeneratedCardText(topic).toLowerCase();
    if (normalized && !isPlaceholderTopic(topic)) {
      terms.add(normalized);
      normalized
        .split(/\s+/)
        .filter((word) => word.length >= 5)
        .slice(0, 6)
        .forEach((word) => terms.add(word));
    }
  }

  return Array.from(terms).filter(Boolean);
}

function isLikelySourceGroundedQuizQuestion(
  question: { question?: string; correctAnswer?: string; explanation?: string; topic?: string; options?: string[] },
  content: string,
  title: string,
) {
  const sourceTerms = getQuizSourceTerms(content, title);
  if (sourceTerms.length === 0) return true;

  const qText = String(question?.question || "").toLowerCase();
  const aText = String(question?.correctAnswer || "").toLowerCase();

  // Hallucination check: If question asks "What is Lesson 5?" and source doesn't mention Lesson 5
  if (/lesson\s*\d+|chapter\s*\d+|section\s*\d+/i.test(qText)) {
     const match = qText.match(/(lesson|chapter|section)\s*(\d+)/i);
     if (match) {
       const label = match[0].toLowerCase();
       if (!content.toLowerCase().includes(label)) return false;
     }
  }

  const fields = [
    question?.question,
    question?.correctAnswer,
    question?.explanation,
    question?.topic,
    ...(Array.isArray(question?.options) ? question.options : []),
  ]
    .map((value) => normalizeGeneratedCardText(String(value || "")).toLowerCase())
    .filter(Boolean);

  if (fields.some((field) => isPlaceholderTopic(field))) {
    return false;
  }

  const sourceText = ` ${sourceTerms.join(" ")} ${content.toLowerCase()} `;
  
  // Stricter grounding: Check if at least 2 significant words from question OR answer exist in source
  const significantWords = [
    ...(question?.question?.split(/\s+/) || []),
    ...(question?.correctAnswer?.split(/\s+/) || [])
  ]
    .map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter(w => w.length >= 5);

  const overlapCount = significantWords.filter(w => sourceText.includes(w)).length;
  
  // If we have meaningful words but zero overlap, it's likely a hallucination
  if (significantWords.length >= 3 && overlapCount === 0) {
    return false;
  }

  return true;
}

function getGeneratedQuizSignature(question: any) {
  return [
    normalizeGeneratedCardText(question?.question || ""),
    normalizeGeneratedCardText(question?.correctAnswer || ""),
    normalizeGeneratedCardText(question?.topic || ""),
  ].join("\u0000");
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
  const facts = extractCandidateFacts(content, title, Math.max(10, count + 6));
  const cards = Array.from({ length: count }, (_, index) => {
    const fact = facts[index % facts.length];
    return {
      front: `What is ${fact.concept}?`,
      back: fact.detail,
      difficulty: index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard",
    };
  }).filter((card) => !isWeakFlashcardPair(card.front, card.back));

  if (cards.length > 0) {
    return cards;
  }

  return [
    {
      front: `What is the main idea of ${title || "this study material"}?`,
      back:
        "Use the source material to identify the core definition, process, or argument rather than a generic lesson heading.",
      difficulty: "medium",
    },
  ];
}

function buildFallbackQuizQuestions(content: string, title: string, count: number) {
  const facts = extractCandidateFacts(content, title, Math.max(8, count + 4));
  const concepts = facts.map((fact) => fact.concept);

  return Array.from({ length: count }, (_, index) => {
    const fact = facts[index % facts.length];
    const distractors = concepts
      .filter((concept) => normalizeGeneratedCardText(concept) !== normalizeGeneratedCardText(fact.concept))
      .slice(0, 3);
    const options = Array.from(
      new Set([fact.concept, ...distractors, "None of the above"]),
    )
      .map((option) => normalizeGeneratedCardText(option))
      .filter((option) => option.length > 1)
      .slice(0, 4);

    if (options.length < 2) {
      options.push("None of the above");
    }

    return {
      question: `Which concept is described by this statement? ${fact.detail}`,
      type: "multiple_choice" as const,
      options,
      correctAnswer: fact.concept,
      explanation: `The source material points to ${fact.concept} as the matching concept.`,
      topic: fact.concept,
    };
  }).map((question, index) => normalizeGeneratedQuizQuestion(question, index)).filter(Boolean);
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

function buildLocalStudyNotes(content: string, title: string) {
  const lines = splitStudySourceIntoLines(content).slice(0, 12);
  const bullets = lines
    .filter((line) => line.length > 20)
    .slice(0, 8)
    .map((line) => `- ${line}`);

  return [
    `# ${title || "Study Notes"}`,
    "",
    "## Key Points",
    bullets.length > 0
      ? bullets.join("\n")
      : "- Review the source material and extract the main definitions, processes, and examples.",
  ].join("\n");
}

function buildLocalSimpleSummary(content: string, title: string) {
  const facts = extractCandidateFacts(content, title, 3);
  const summaryLine = facts
    .map((fact) => `${fact.concept}: ${fact.detail}`)
    .join(" ");

  return summaryLine || `Quick review for ${title || "this material"} is ready.`;
}

function hasAnyStudyProviderConfigured() {
  const providers = getConfiguredProviderStatus();
  return Boolean(
    providers.google ||
      providers.openrouter ||
      providers.groq ||
      providers.sambanova ||
      providers.cerebras ||
      providers.huggingface ||
      providers.pollinations,
  );
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
    quizSetCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hasAiProviders = hasAnyStudyProviderConfigured();

    const material: any = await ctx.runQuery(internal.study.getMaterial, {
      materialId: args.materialId,
    });
    if (!material) throw new Error("Material not found");

    const generationLease = await ctx.runMutation(
      internal.study.reserveStudyAssetGeneration,
      { materialId: args.materialId },
    );

    const focusContext = args.focusPrompt?.trim()
      ? `Prioritize this learner focus: ${args.focusPrompt.trim()}`
      : "";
    const desiredFlashcardCount = Math.max(8, Math.min(30, Math.round(args.flashcardCount || 18)));
    const desiredQuizCount = Math.max(8, Math.min(24, Math.round(args.quizQuestionCount || 16)));
    const desiredQuizSetCount = Math.max(1, Math.min(5, Math.round(args.quizSetCount || 1)));
    const STUDY_PACK_COST = 12.0;

    const snapshot = await ctx.runQuery(internal.study.getStudyAssetSnapshot, {
      materialId: args.materialId,
    });
    const existingQuizzes = await ctx.runQuery(
      internal.study.listQuizzesByMaterialInternal,
      {
        materialId: args.materialId,
        userId: material.userId,
      },
    );

    if (
      generationLease.state === "running" &&
      existingQuizzes.length >= desiredQuizSetCount
    ) {
      throw new Error("Study assets are already generating.");
    }

    if (
      snapshot?.pack &&
      snapshot.note &&
      (snapshot.flashcards?.length || 0) > 0 &&
      existingQuizzes.length >= desiredQuizSetCount
    ) {
      await ctx.runMutation(internal.study.markStudyAssetGenerationComplete, {
        materialId: args.materialId,
      });
      return buildStudyAssetResult(snapshot);
    }

    if (hasAiProviders) {
      try {
        await ctx.runMutation(api.credits.charge, {
          amount: STUDY_PACK_COST,
          type: "study",
          description: `Study Generation: ${args.title.substring(0, 30)}...`,
          metadata: { materialId: args.materialId },
        });
      } catch (e) {
        throw new Error(`Insufficient credits. You need ${STUDY_PACK_COST} Credits.`);
      }
    }

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

      const [fRes, qRes, pRes, nRes, sRes, cRes] = hasAiProviders
        ? await Promise.allSettled([
            chatJson(
              `You are a specialized Study Assistant. Generate ${desiredFlashcardCount} high-quality, academically rigorous flashcards based ONLY on the provided source.
              Return JSON with key 'flashcards' as an array of objects.
              EACH OBJECT MUST HAVE: 'front' (the question/concept) and 'back' (the detailed answer/definition).
              RULES:
              1. DO NOT include prefixes like "Front:" or "Back:" in the text.
              2. Absolute Source Grounding: Questions must be derived ONLY from facts present in the text. DO NOT hallucinate external knowledge.
              3. The 'back' must contain the actual substantive answer, not an instruction, broad summary, or placeholder.
              4. NEVER output generic placeholders like "Lesson 5", "Chapter 2", "Explain Lesson 5", "study this topic".
              5. NO IMAGES: If you see image placeholders like [img.jpg] or [Figure 1] in the source, IGNORE THEM COMPLETELY. Do not mention images in the questions.`,
              `${focusContext}\n\n${args.content.substring(0, FLASHCARD_SOURCE_LIMIT)}`,
            ),
            chatJson(
              `You are an Expert Examiner. Generate ${desiredQuizCount} challenging and accurate quiz questions based on the source text.
              Return JSON with key 'questions': [{"question": "...", "type": "multiple_choice|true_false", "options": [...], "correctAnswer": "...", "explanation": "..."}].
              RULES:
              1. Strictly Source Grounded: Questions must be answerable ONLY from the provided text. DO NOT hallucinate.
              2. No Generic Labels: DO NOT use "Lesson X", "Chapter Y", or "Identify Chapter 3" as the question, options, or explanation.
              3. No Image References: IGNORE all image placeholders like [img.jpg] or (Figure 1) in the source.
              4. Distractors must be plausible but clearly incorrect based on the text.`,
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
              `Create an accessible study summary in clean markdown.
              Requirements:
              1. Use only facts supported by the source text.
              2. Start with '# Big Picture'.
              3. Then add '## Key Ideas' with 3 to 6 short '###' subsections.
              4. Keep paragraphs to 1 or 2 sentences max.
              5. Use short bullets instead of dense paragraphs.
              6. Include '## Terms To Remember' and '## Next Step'.
              7. Make it easy for autistic and dyslexic learners: predictable headings, plain language, one idea per bullet, no filler.
              8. Do not use tables.
              9. Avoid emojis unless one is genuinely clarifying.`,
              `${focusContext}\n\n${args.content.substring(0, SUMMARY_SOURCE_LIMIT)}`,
            ),
            chatJson(
              "Generate a concept map JSON.",
              `${focusContext}\n\n${args.content.substring(0, QUIZ_SOURCE_LIMIT)}`,
            ),
          ])
        : [
            { status: "rejected", reason: new Error("AI generation unavailable") },
            { status: "rejected", reason: new Error("AI generation unavailable") },
            { status: "rejected", reason: new Error("AI generation unavailable") },
            { status: "rejected", reason: new Error("AI generation unavailable") },
            { status: "rejected", reason: new Error("AI generation unavailable") },
            { status: "rejected", reason: new Error("AI generation unavailable") },
          ];

      let flashcards =
        fRes.status === "fulfilled"
          ? (fRes.value.data.flashcards || fRes.value.data.cards || fRes.value.data || [])
              .map(normalizeGeneratedFlashcard)
              .filter(Boolean)
          : [];
      let questions =
        qRes.status === "fulfilled"
          ? (qRes.value.data.questions || qRes.value.data.items || qRes.value.data || [])
              .map((question: any, index: number) =>
                normalizeGeneratedQuizQuestion(question, index),
              )
              .filter(
                (question: any) =>
                  question &&
                  isLikelySourceGroundedQuizQuestion(question, args.content, args.title),
              )
          : [];
      let podcastScript = pRes.status === "fulfilled" ? pRes.value : "";
      let detailedNotes =
        nRes.status === "fulfilled"
          ? nRes.value
          : buildLocalStudyNotes(
              args.content.substring(0, NOTES_SOURCE_LIMIT),
              args.title,
            );
      let simpleSummary =
        sRes.status === "fulfilled"
          ? sRes.value
          : buildLocalSimpleSummary(
              args.content.substring(0, SUMMARY_SOURCE_LIMIT),
              args.title,
            );
      let conceptMapResult =
        cRes.status === "fulfilled"
          ? cRes.value.data
          : buildFallbackConceptMap(args.content, args.title);

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
      } else if (questions.length < desiredQuizCount) {
        const fallbackQuestions = buildFallbackQuizQuestions(
          args.content,
          args.title,
          desiredQuizCount,
        );
        const seen = new Set(questions.map((question: any) => getGeneratedQuizSignature(question)));
        for (const question of fallbackQuestions) {
          const signature = getGeneratedQuizSignature(question);
          if (!seen.has(signature)) {
            questions.push(question);
            seen.add(signature);
          }
          if (questions.length >= desiredQuizCount) {
            break;
          }
        }
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

      const extraQuizIds: any[] = [];
      for (let index = 1; index < desiredQuizSetCount; index += 1) {
        const extraTitle = `${args.title} Quiz ${index + 1}`;
        const extraQuizId = await ctx.runMutation(internal.study.createQuizInternal, {
          userId: material.userId,
          materialId: args.materialId,
          title: extraTitle,
          questions: quizQuestions,
          difficulty: "medium",
        });
        extraQuizIds.push(extraQuizId);
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
        try {
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
        } catch (error) {
          console.warn("[generateAllAssets] Concept map generation failed", error);
          conceptMapId = null;
        }
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

      const safeKeyPoints = Array.isArray(packMeta.keyPoints)
        ? packMeta.keyPoints.map((item: any) => String(item).trim()).filter(Boolean).slice(0, 12)
        : [];
      const safePracticePlan = Array.isArray(packMeta.practicePlan)
        ? packMeta.practicePlan.map((item: any) => String(item).trim()).filter(Boolean).slice(0, 12)
        : [];
      const safeEstimatedMinutes = Math.max(
        10,
        Math.min(
          180,
          Number.isFinite(Number(packMeta.estimatedMinutes))
            ? Math.round(Number(packMeta.estimatedMinutes))
            : 30,
        ),
      );
      const safePackStyle =
        typeof packMeta.packStyle === "string" && packMeta.packStyle.trim()
          ? packMeta.packStyle.trim()
          : "AI Study";
      const safeDescription =
        typeof packMeta.description === "string" && packMeta.description.trim()
          ? packMeta.description.trim()
          : `Study pack for ${args.title}`;

      try {
        await ctx.runMutation(internal.study.updateMaterialSummary, {
          materialId: args.materialId,
          summary: {
            short: detailedNotes.substring(0, 200),
            detailed: detailedNotes,
            simple: simpleSummary,
          },
        });
      } catch (error) {
        console.warn("[generateAllAssets] Failed to update material summary", error);
      }

      let packId;
      try {
        packId = await ctx.runMutation(internal.study.upsertStudyPackInternal, {
          materialId: args.materialId,
          noteId,
          quizId,
          conceptMapId: conceptMapId || undefined,
          title: `${args.title} Pack`,
          description: safeDescription,
          focusPrompt: args.focusPrompt,
          summary: {
            short: detailedNotes.substring(0, 200),
            detailed: detailedNotes,
            simple: simpleSummary,
          },
          keyPoints: safeKeyPoints,
          practicePlan: safePracticePlan,
          flashcardsCount: (existingFlashcards.length || 0) + flashcardsToInsert.length,
          quizQuestionsCount: quizQuestions.length * desiredQuizSetCount,
          estimatedMinutes: safeEstimatedMinutes,
          packStyle: safePackStyle,
        });
      } catch (error) {
        console.warn("[generateAllAssets] Pack upsert failed, retrying with minimal payload", error);
        packId = await ctx.runMutation(internal.study.upsertStudyPackInternal, {
          materialId: args.materialId,
          noteId,
          quizId,
          conceptMapId: undefined,
          title: `${args.title} Pack`,
          description: `Study pack for ${args.title}`,
          focusPrompt: args.focusPrompt,
          summary: {
            short: detailedNotes.substring(0, 200),
            detailed: detailedNotes,
            simple: simpleSummary,
          },
          keyPoints: [],
          practicePlan: [],
          flashcardsCount: (existingFlashcards.length || 0) + flashcardsToInsert.length,
          quizQuestionsCount: quizQuestions.length * desiredQuizSetCount,
          estimatedMinutes: 30,
          packStyle: "AI Study",
        });
      }

      await ctx.runMutation(internal.study.markStudyAssetGenerationComplete, {
        materialId: args.materialId,
      });

      return {
        flashcardsCount: (existingFlashcards.length || 0) + flashcardsToInsert.length,
        quizQuestionsCount: quizQuestions.length * desiredQuizSetCount,
        podcastScript,
        noteId,
        quizId,
        packId,
        conceptMapId,
        quizSetCount: desiredQuizSetCount,
        extraQuizIds,
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
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let content = args.content?.trim() || "";
    let title = args.topic;

    if (!content && args.materialId) {
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

    const desiredCount = Math.max(5, Math.min(20, Math.round(args.count || 10)));
    const SINGLE_QUIZ_COST = 3.0;

    if (hasAnyStudyProviderConfigured()) {
      try {
        await ctx.runMutation(api.credits.charge, {
          amount: SINGLE_QUIZ_COST,
          type: "study",
          description: `Quiz Generation: ${title.substring(0, 30)}...`,
          metadata: { materialId: args.materialId },
        });
      } catch (e) {
        throw new Error(`Insufficient credits. You need ${SINGLE_QUIZ_COST} Credits.`);
      }
    } else {
      return buildFallbackQuizQuestions(content, title, desiredCount);
    }

    try {
      const result = await generateJsonWithFallback<any>({
        workload: "study-json",
      messages: [
        {
          role: "system",
          content: `You are a professional educator and examiner. Generate ${desiredCount} highly relevant and accurate quiz questions based on the provided material.
Return ONLY valid JSON with a 'questions' key containing an array of objects.
RULES:
1. Hard Source Grounding: Questions must be answerable ONLY from the provided material. DO NOT hallucinate.
2. No Placeholders: Do not use generic labels like "Lesson 5", "Chapter 2", or "Explain Lesson 5" anywhere.
3. No Image References: If the source contains image placeholders like [img.jpg], IGNORE THEM. Do not include descriptions of missing images.
4. Explanations must cite details from the text.`,
        },
        {
          role: "user",
          content: `Source Material:\n${content.substring(0, 40000)}`,
        },
      ],
      maxTokens: 3000,
      temperature: 0.1,
    });

    const questions = (result.data?.questions || result.data || [])
      .map((q: any, i: number) => normalizeGeneratedQuizQuestion(q, i))
      .filter(
        (question: any) =>
          question && isLikelySourceGroundedQuizQuestion(question, content, title),
      );

    if (questions.length === 0) {
      console.log("[generateQuiz] No questions generated, using fallbacks");
      return buildFallbackQuizQuestions(content, title, desiredCount);
    }

    if (questions.length < desiredCount) {
      const fallbackQuestions = buildFallbackQuizQuestions(content, title, desiredCount);
      const seen = new Set(questions.map((question: any) => getGeneratedQuizSignature(question)));
      for (const question of fallbackQuestions) {
        const signature = getGeneratedQuizSignature(question);
        if (!seen.has(signature)) {
          questions.push(question);
          seen.add(signature);
        }
        if (questions.length >= desiredCount) {
          break;
        }
      }
    }

    return questions;
    } catch (error) {
      console.error(`[generateQuiz] Failed: ${error}`);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },
});


export const improveSummary = action({
  args: { currentSummary: v.string(), instruction: v.string() },
  handler: async (ctx, args) => {
    const { content } = await generateTextWithFallback({
      workload: "study-summary",
      messages: [
        {
          role: "system",
          content:
            "Improve the study summary in clean accessible markdown. Use a clear hierarchy of headings, short paragraphs, direct language, and high-signal bullets. Keep it easy to scan for autistic and dyslexic learners, and do not add unsupported facts.",
        },
        {
          role: "user",
          content: `Summary:\n${args.currentSummary}\n\nInstruction:\n${args.instruction}`,
        },
      ],
      maxTokens: 4000,
      temperature: 0.2,
    });
    return content;
  },
});
