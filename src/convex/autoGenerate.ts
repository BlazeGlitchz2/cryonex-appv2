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
  },
  handler: async (ctx, args): Promise<{
    flashcardsCount: number;
    quizQuestionsCount: number;
    podcastScript: string;
    noteId: any;
    quizId: any;
    summary_detailed: string;
    summary_short: string;
  }> => {
    // Prefer Gemini, fallback to OpenRouter, then Bytez
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const bytezKey = process.env.BYTEZ_API_KEY;

    if (!geminiKey && !openrouterKey && !bytezKey) {
      throw new Error("No model provider configured. Please set GEMINI_API_KEY, OPENROUTER_API_KEY, or BYTEZ_API_KEY in backend environment variables.");
    }

    const material: any = await ctx.runQuery(internal.study.getMaterial, { materialId: args.materialId });
    if (!material) {
      throw new Error("Material not found");
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
      const model = opts?.model || "openai/gpt-4o-mini";
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
      // Try Gemini first
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
          const content = await callOpenRouter([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ], { json: true });
          return parseFirstJsonObject(content);
        } catch (e) {
          console.warn("OpenRouter failed, trying Bytez...");
        }
      }
      // Fallback to Bytez
      if (bytezKey) {
        const content = await callBytez([
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ], true).catch(async () => callBytez([
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ], false));
        return parseFirstJsonObject(content);
      }
      throw new Error("No provider available for JSON chat");
    }

    async function chatText(systemPrompt: string, userPrompt: string) {
      if (geminiKey) {
        try {
          return await callGemini(userPrompt, systemPrompt);
        } catch {
          console.warn("Gemini failed, trying OpenRouter...");
        }
      }
      if (openrouterKey) {
        try {
          return await callOpenRouter([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ], { json: false });
        } catch {
          console.warn("OpenRouter failed, trying Bytez...");
        }
      }
      if (bytezKey) {
        return await callBytez([
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ], false);
      }
      throw new Error("No provider available for text chat");
    }

    // 1) Flashcards (JSON)
    let flashcards: Array<{ front: string; back: string; difficulty?: string }> = [];
    try {
      const flashcardsJson = await chatJson(
        "Generate exactly 20 flashcards from the content. Return JSON object with key 'flashcards': [{\"front\": \"question\", \"back\": \"answer\", \"difficulty\": \"easy|medium|hard\"}] and nothing else.",
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
        "Generate exactly 10 quiz questions. Return JSON object with key 'questions': [{\"question\": \"...\", \"type\": \"multiple_choice|true_false|fill_blank\", \"options\": [\"...\"], \"correctAnswer\": \"...\", \"explanation\": \"...\"}] and nothing else.",
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
        "Create comprehensive study notes in markdown format with headings, bullet points, and key concepts. Be concise and well-structured.",
        args.content.substring(0, 8000)
      );
    } catch {
      detailedNotes = args.content.substring(0, 1000) + "...";
    }

    const noteId: any = await ctx.runMutation(internal.study.createNoteInternal, {
      userId: material.userId,
      materialId: args.materialId,
      title: `Notes: ${args.title}`,
      content: detailedNotes,
      format: "markdown",
      isAIGenerated: true,
    });

    await ctx.runMutation(internal.study.updateMaterialSummary, {
      materialId: args.materialId,
      summary: {
        short: detailedNotes.substring(0, 200) + "...",
        detailed: detailedNotes,
      },
    });

    return {
      flashcardsCount: flashcards.length,
      quizQuestionsCount: questions.length,
      podcastScript,
      noteId,
      quizId,
      summary_detailed: detailedNotes,
      summary_short: detailedNotes.substring(0, 200) + "...",
    };
  },
});