// @ts-nocheck

"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";

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

    // Provider order: Cerebras → SambaNova → Groq → Gemini → Bytez
    const cerebrasKey = process.env.CEREBRAS_API_KEY;
    const sambanovaKey = process.env.SAMBANOVA_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const bytezKey = process.env.BYTEZ_API_KEY;

    if (!cerebrasKey && !sambanovaKey && !groqKey && !geminiKey && !bytezKey) {
      throw new Error(
        "No model provider configured. Please set CEREBRAS_API_KEY, SAMBANOVA_API_KEY, or other provider keys in backend environment variables.",
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

    // Helper to call Cerebras (primary - fast inference)
    async function callCerebras(
      messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>,
    ) {
      if (!cerebrasKey) throw new Error("CEREBRAS not configured");
      const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cerebrasKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b",
          messages,
          temperature: 0.2,
          max_tokens: 2000,
        }),
      });
      if (!res.ok) throw new Error("Cerebras error");
      const data = await res.json();
      return data?.choices?.[0]?.message?.content as string;
    }

    // Helper to call SambaNova (primary - fast inference)
    async function callSambaNova(
      messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>,
    ) {
      if (!sambanovaKey) throw new Error("SAMBANOVA not configured");
      const res = await fetch("https://api.sambanova.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sambanovaKey}`,
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-70B-Instruct",
          messages,
          temperature: 0.2,
          max_tokens: 2000,
        }),
      });
      if (!res.ok) throw new Error("SambaNova error");
      const data = await res.json();
      return data?.choices?.[0]?.message?.content as string;
    }

    // Helper to call Groq (fast, free tier)
    async function callGroq(
      messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>,
    ) {
      if (!groqKey) throw new Error("GROQ not configured");
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.2,
            max_tokens: 2000,
          }),
        },
      );
      if (!res.ok) throw new Error("Groq error");
      const data = await res.json();
      return data?.choices?.[0]?.message?.content as string;
    }

    // Helper to call Gemini
    async function callGemini(userPrompt: string, systemPrompt: string) {
      if (!geminiKey) throw new Error("GEMINI not configured");
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2000,
            },
          }),
        },
      );
      if (!res.ok) throw new Error("Gemini error");
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text as string;
    }

    // Helper to call Bytez (fallback)
    async function callBytez(
      messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>,
      json?: boolean,
    ) {
      if (!bytezKey) throw new Error("BYTEZ not configured");
      const body: any = {
        model: "meta-llama/Llama-3-70b-instruct-hf",
        messages,
      };
      if (json) {
        body.response_format = { type: "json_object" };
      }
      const res = await fetch("https://api.bytez.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bytezKey}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Bytez API error");
      const data = await res.json();
      return data?.choices?.[0]?.message?.content as string;
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

    async function chatJson(systemPrompt: string, userPrompt: string) {
      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: userPrompt },
      ];

      // Try Cerebras first (primary - fast inference)
      if (cerebrasKey) {
        try {
          const content = await callCerebras(messages);
          return parseFirstJsonObject(content);
        } catch (e) {
          console.warn("Cerebras failed, trying SambaNova...");
        }
      }
      // Try SambaNova (primary - fast inference)
      if (sambanovaKey) {
        try {
          const content = await callSambaNova(messages);
          return parseFirstJsonObject(content);
        } catch (e) {
          console.warn("SambaNova failed, trying Groq...");
        }
      }
      // Try Groq (fast, free tier)
      if (groqKey) {
        try {
          const content = await callGroq(messages);
          return parseFirstJsonObject(content);
        } catch (e) {
          console.warn("Groq failed, trying Gemini...");
        }
      }
      // Try Gemini
      if (geminiKey) {
        try {
          const content = await callGemini(userPrompt, systemPrompt);
          return parseFirstJsonObject(content);
        } catch (e) {
          console.warn("Gemini failed, trying Bytez...");
        }
      }
      // Fallback to Bytez
      if (bytezKey) {
        try {
          const content = await callBytez(messages, true);
          return parseFirstJsonObject(content);
        } catch (e) {
          console.warn("Bytez failed.");
        }
      }
      throw new Error("No provider available for JSON chat");
    }

    async function chatText(systemPrompt: string, userPrompt: string) {
      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: userPrompt },
      ];

      // Try Cerebras first (primary - fast inference)
      if (cerebrasKey) {
        try {
          return await callCerebras(messages);
        } catch {}
      }
      // Try SambaNova (primary - fast inference)
      if (sambanovaKey) {
        try {
          return await callSambaNova(messages);
        } catch {}
      }
      // Try Groq (fast, free tier)
      if (groqKey) {
        try {
          return await callGroq(messages);
        } catch {}
      }
      // Try Gemini
      if (geminiKey) {
        try {
          return await callGemini(userPrompt, systemPrompt);
        } catch {}
      }
      // Fallback to Bytez
      if (bytezKey) {
        try {
          return await callBytez(messages, false);
        } catch {}
      }
      throw new Error("No provider available for text chat");
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
          ?.trim() || `Source-grounded pack for ${args.title}.`,
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
      packStyle: "Grounded review pack",
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
      await ctx.runMutation(internal.studyMutations.updateDocumentSummary, {
        docId: args.docId,
        summary: {
          short: detailedNotes.substring(0, 200) + "...",
          detailed: detailedNotes,
          simple: simpleSummary,
        },
      });
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
    // Provider order: Cerebras → SambaNova → Groq → Gemini → Bytez
    const cerebrasKey = process.env.CEREBRAS_API_KEY;
    const sambanovaKey = process.env.SAMBANOVA_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const bytezKey = process.env.BYTEZ_API_KEY;

    if (!cerebrasKey && !sambanovaKey && !groqKey && !geminiKey && !bytezKey) {
      throw new Error("No model provider configured.");
    }

    // Helper to call Cerebras (primary - fast inference)
    async function callCerebras(
      messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>,
    ) {
      if (!cerebrasKey) throw new Error("CEREBRAS not configured");
      const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cerebrasKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b",
          messages,
          temperature: 0.2,
          max_tokens: 2000,
        }),
      });
      if (!res.ok) throw new Error("Cerebras error");
      const data = await res.json();
      return data?.choices?.[0]?.message?.content as string;
    }

    // Helper to call SambaNova
    async function callSambaNova(
      messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>,
    ) {
      if (!sambanovaKey) throw new Error("SAMBANOVA not configured");
      const res = await fetch("https://api.sambanova.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sambanovaKey}`,
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-70B-Instruct",
          messages,
          temperature: 0.2,
          max_tokens: 2000,
        }),
      });
      if (!res.ok) throw new Error("SambaNova error");
      const data = await res.json();
      return data?.choices?.[0]?.message?.content as string;
    }

    // Helper to call Groq
    async function callGroq(
      messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>,
    ) {
      if (!groqKey) throw new Error("GROQ not configured");
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.2,
            max_tokens: 2000,
          }),
        },
      );
      if (!res.ok) throw new Error("Groq error");
      const data = await res.json();
      return data?.choices?.[0]?.message?.content as string;
    }

    // Helper to call Gemini
    async function callGemini(userPrompt: string, systemPrompt: string) {
      if (!geminiKey) throw new Error("GEMINI not configured");
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2000,
            },
          }),
        },
      );
      if (!res.ok) throw new Error("Gemini error");
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text as string;
    }

    // Helper to call Bytez
    async function callBytez(
      messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>,
    ) {
      if (!bytezKey) throw new Error("BYTEZ not configured");
      const res = await fetch("https://api.bytez.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bytezKey}`,
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3-70b-instruct-hf",
          messages,
        }),
      });
      if (!res.ok) throw new Error("Bytez error");
      const data = await res.json();
      return data?.choices?.[0]?.message?.content as string;
    }

    async function chatText(systemPrompt: string, userPrompt: string) {
      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: userPrompt },
      ];

      if (cerebrasKey) {
        try {
          return await callCerebras(messages);
        } catch {}
      }
      if (sambanovaKey) {
        try {
          return await callSambaNova(messages);
        } catch {}
      }
      if (groqKey) {
        try {
          return await callGroq(messages);
        } catch {}
      }
      if (geminiKey) {
        try {
          return await callGemini(userPrompt, systemPrompt);
        } catch {}
      }
      if (bytezKey) {
        try {
          return await callBytez(messages);
        } catch {}
      }
      throw new Error("No provider available");
    }

    const improvedSummary = await chatText(
      "You are a helpful AI study assistant. Improve the following summary based on the user's instructions. Maintain the markdown formatting.",
      `Current Summary:\n${args.currentSummary}\n\nUser Instruction:\n${args.instruction}`,
    );

    return improvedSummary;
  },
});
