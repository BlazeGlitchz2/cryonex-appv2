// @ts-nocheck

"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const generateAllAssets = action({
  args: {
    materialId: v.id("studyMaterials"),
    content: v.string(),
    title: v.string(),
    docId: v.optional(v.string()), // Optional docId to also update studyDocuments
  },
  handler: async (ctx, args): Promise<{
    flashcardsCount: number;
    quizQuestionsCount: number;
    podcastScript: string;
    noteId: any;
    quizId: any;
    summary_detailed: string;
    summary_short: string;
    summary_simple: string;
  }> => {
    // Provider order: Cerebras → SambaNova → Groq → Gemini → OpenRouter → Bytez
    const cerebrasKey = process.env.CEREBRAS_API_KEY;
    const sambanovaKey = process.env.SAMBANOVA_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const bytezKey = process.env.BYTEZ_API_KEY;

    if (!cerebrasKey && !sambanovaKey && !groqKey && !geminiKey && !openrouterKey && !bytezKey) {
      throw new Error("No model provider configured. Please set CEREBRAS_API_KEY, SAMBANOVA_API_KEY, or other provider keys in backend environment variables.");
    }

    const material: any = await ctx.runQuery(internal.study.getMaterial, { materialId: args.materialId });
    if (!material) {
      throw new Error("Material not found");
    }

    // Helper to call Cerebras (primary - fast inference)
    async function callCerebras(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
      if (!cerebrasKey) throw new Error("CEREBRAS not configured");
      const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cerebrasKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b",
          messages,
          temperature: 0.2,
          max_tokens: 2000,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Cerebras error: ${res.status} ${res.statusText} ${text}`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Cerebras: empty content");
      return content as string;
    }

    // Helper to call SambaNova (primary - fast inference)
    async function callSambaNova(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
      if (!sambanovaKey) throw new Error("SAMBANOVA not configured");
      const res = await fetch("https://api.sambanova.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sambanovaKey}`,
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-70B-Instruct",
          messages,
          temperature: 0.2,
          max_tokens: 2000,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`SambaNova error: ${res.status} ${res.statusText} ${text}`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("SambaNova: empty content");
      return content as string;
    }

    // Helper to call Groq (fast, free tier)
    async function callGroq(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
      if (!groqKey) throw new Error("GROQ not configured");
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.2,
          max_tokens: 2000,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Groq error: ${res.status} ${res.statusText} ${text}`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Groq: empty content");
      return content as string;
    }

    // Helper to call Gemini
    async function callGemini(userPrompt: string, systemPrompt: string) {
      if (!geminiKey) throw new Error("GEMINI not configured");
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2000,
          },
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Gemini error: ${res.status} ${res.statusText} ${text}`);
      }
      const data = await res.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error("Gemini: empty content");
      return content as string;
    }

    // Helper to call OpenRouter (fallback)
    async function callOpenRouter(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>, opts?: { json?: boolean; model?: string }) {
      if (!openrouterKey) throw new Error("OPENROUTER not configured");
      const model = opts?.model || "meta-llama/llama-3.3-70b-instruct";
      const body: any = {
        model,
        messages,
        temperature: 0.2,
      };
      if (opts?.json) {
        body.response_format = { type: "json_object" };
      }
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openrouterKey}`,
          "HTTP-Referer": process.env.CONVEX_SITE_URL || "http://localhost",
          "X-Title": "Cryonex Workspace",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`OpenRouter error: ${res.status} ${res.statusText} ${text}`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("OpenRouter: empty content");
      return content as string;
    }

    // Helper to call Bytez (fallback)
    async function callBytez(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>, json?: boolean) {
      if (!bytezKey) throw new Error("BYTEZ not configured");
      const body: any = {
        model: "gpt-4o-mini",
        messages,
      };
      if (json) {
        body.response_format = { type: "json_object" };
      }
      const res = await fetch("https://api.bytez.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bytezKey}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Bytez API error: ${res.status} ${res.statusText} ${text}`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Bytez: empty content");
      return content as string;
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
        { role: "user" as const, content: userPrompt }
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
          console.warn("Gemini failed, trying OpenRouter...");
        }
      }
      // Try OpenRouter JSON
      if (openrouterKey) {
        try {
          const content = await callOpenRouter(messages, { json: false });
          return parseFirstJsonObject(content);
        } catch (e) {
          console.warn("OpenRouter failed, trying Bytez...");
        }
      }
      // Fallback to Bytez
      if (bytezKey) {
        const content = await callBytez(messages, false).catch(async () =>
          callBytez(messages, false)
        );
        return parseFirstJsonObject(content);
      }
      throw new Error("No provider available for JSON chat");
    }

    async function chatText(systemPrompt: string, userPrompt: string) {
      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: userPrompt }
      ];

      // Try Cerebras first (primary - fast inference)
      if (cerebrasKey) {
        try {
          return await callCerebras(messages);
        } catch {
          console.warn("Cerebras failed, trying SambaNova...");
        }
      }
      // Try SambaNova (primary - fast inference)
      if (sambanovaKey) {
        try {
          return await callSambaNova(messages);
        } catch {
          console.warn("SambaNova failed, trying Groq...");
        }
      }
      // Try Groq (fast, free tier)
      if (groqKey) {
        try {
          return await callGroq(messages);
        } catch {
          console.warn("Groq failed, trying Gemini...");
        }
      }
      // Try Gemini
      if (geminiKey) {
        try {
          return await callGemini(userPrompt, systemPrompt);
        } catch {
          console.warn("Gemini failed, trying OpenRouter...");
        }
      }
      // Try OpenRouter
      if (openrouterKey) {
        try {
          return await callOpenRouter(messages, { json: false });
        } catch {
          console.warn("OpenRouter failed, trying Bytez...");
        }
      }
      // Fallback to Bytez
      if (bytezKey) {
        return await callBytez(messages, false);
      }
      throw new Error("No provider available for text chat");
    }

    // 1) Flashcards (JSON)
    let flashcards: Array<{ front: string; back: string; difficulty?: string }> = [];
    try {
      const flashcardsJson = await chatJson(
        "Generate exactly 20 high-quality flashcards from the content. Focus on conceptual understanding and application, not just definitions. Return JSON object with key 'flashcards': [{\"front\": \"question/concept\", \"back\": \"answer/explanation\", \"difficulty\": \"easy|medium|hard\"}] and nothing else.",
        args.content.substring(0, 6000)
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
        "Generate exactly 10 high-quality quiz questions. For each question, provide a detailed 'explanation' field that explains WHY the correct answer is right and teaches the concept. Return JSON object with key 'questions': [{\"question\": \"...\", \"type\": \"multiple_choice|true_false|fill_blank\", \"options\": [\"...\"], \"correctAnswer\": \"...\", \"explanation\": \"Detailed explanation here...\"}] and nothing else.",
        args.content.substring(0, 6000)
      );
      questions = quizJson.questions || [];
    } catch {
      questions = [];
    }

    const quizId: any = await ctx.runMutation(internal.study.createQuizInternal, {
      userId: material.userId,
      materialId: args.materialId,
      title: `Quiz: ${args.title}`,
      questions: questions.slice(0, 10),
      difficulty: "medium",
    });

    // 3) Podcast script (Text)
    let podcastScript = "";
    try {
      podcastScript = await chatText(
        "Create an engaging podcast script with intro, body, and outro sections.",
        `Create a podcast script for: ${args.title}\n\n${args.content.substring(0, 4000)}`
      );
    } catch {
      podcastScript = "";
    }

    // 4) Notes (Text)
    let detailedNotes = "";
    try {
      detailedNotes = await chatText(
        "Create comprehensive, visually engaging study notes in markdown. Use emojis for section headers (e.g. '## 📚 Introduction'). Include a '🎯 Key Takeaways' section at the top. Use bolding for important terms. Structure with clear hierarchy and bullet points.",
        args.content.substring(0, 8000)
      );
    } catch {
      detailedNotes = args.content.substring(0, 1000) + "...";
    }

    // 4.5) Simple Summary (Text)
    let simpleSummary = "";
    try {
      console.log("Generating simple summary...");
      simpleSummary = await chatText(
        "Create a dyslexia-friendly summary of this content. Use simple language, short sentences, and clear bullet points. Use **bold** for key terms. Do not use excessive emojis; use them only very sparingly for major section headers. Focus on maximum readability and clarity.",
        args.content.substring(0, 8000)
      );
      console.log("Simple summary generated successfully.");
    } catch (e) {
      console.error("Simple summary generation failed:", e);
      simpleSummary = "Could not generate simple summary at this time. Please try again later.";
    }

    const noteId: any = await ctx.runMutation(internal.study.createNoteInternal, {
      userId: material.userId,
      materialId: args.materialId,
      title: `Notes: ${args.title}`,
      content: detailedNotes,
      format: "markdown",
      isAIGenerated: true,
    });

    // 5) Concept Map (JSON)
    let conceptMap: { nodes: any[]; edges: any[] } = { nodes: [], edges: [] };
    try {
      const conceptMapJson = await chatJson(
        `Generate a concept map from this content. Return JSON object with:
- "nodes": array of {id: string, label: string, category: "main"|"sub"|"detail"}
- "edges": array of {source: string, target: string, relationship: string}
Create 8-15 nodes covering the main concepts and their relationships. Make sure all edge source/target IDs match existing node IDs.`,
        args.content.substring(0, 6000)
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
          y: 100 + Math.floor(i / 4) * 150 + Math.random() * 30
        },
        type: node.category === "main" ? "input" : node.category === "detail" ? "output" : "default",
      }));

      const formattedEdges = conceptMap.edges.map((edge: any, i: number) => ({
        id: `edge-${i}`,
        source: edge.source,
        target: edge.target,
        label: edge.relationship || "",
        animated: edge.relationship?.toLowerCase().includes("leads") || false,
      }));

      conceptMapId = await ctx.runMutation(internal.studyMutations.createMindMapInternal, {
        userId: String(material.userId),
        title: `Concept Map: ${args.title}`,
        materialId: args.materialId,
        nodes: formattedNodes,
        edges: formattedEdges,
        layout: "hierarchical",
      });
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

    return {
      flashcardsCount: flashcards.length,
      quizQuestionsCount: questions.length,
      podcastScript,
      noteId,
      quizId,
      conceptMapId,
      conceptMapNodesCount: conceptMap.nodes.length,
      summary_detailed: detailedNotes,
      summary_short: detailedNotes.substring(0, 200) + "...",
      summary_simple: simpleSummary,
    };
  },
});