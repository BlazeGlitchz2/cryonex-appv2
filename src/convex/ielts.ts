"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { performRoleCompletion } from "./aiRouting";

export const evaluateSpeech = action({
  args: {
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to evaluate speech.");
    }

    if (!args.transcript || args.transcript.trim().length < 10) {
      throw new Error("Transcript is too short to evaluate properly.");
    }

    const systemPrompt = `You are an expert IELTS Speaking examiner. Evaluate the text against official IELTS speaking band descriptors (focusing on Fluency and Coherence, Lexical Resource, and Grammatical Range and Accuracy).
The user was asked an IELTS question and provided the following spoken response (transcribed to text). Note: because it is a transcribed response, ignore minor punctuation/capitalization errors, but DO evaluate sentence structure, vocabulary, hesitations, and word choice.

Output a strictly valid JSON object with the following fields:
- estimatedBand: A number between 1.0 and 9.0 (e.g., 6.5) representing the estimated overall band score.
- fluencyFeedback: A brief paragraph analyzing their fluency and coherence.
- vocabularyFeedback: A brief paragraph analyzing their lexical resource.
- grammarFeedback: A brief paragraph analyzing their grammatical range and accuracy.
- generalAdvice: A short encouraging tip on how to improve.

Do not include markdown blocks like \`\`\`json. Return only the raw JSON.`;

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: `Transcript: "${args.transcript}"` },
    ];

    try {
      const response = await performRoleCompletion({
        role: "study-json",
        messages: chatMessages,
        jsonMode: "object",
        maxTokens: 1000,
      });

      let jsonResult;
      try {
        jsonResult = JSON.parse(response.content);
      } catch {
        // Fallback robust json extraction
        const match = response.content.match(/\{[\s\S]*\}/);
        if (match) {
          jsonResult = JSON.parse(match[0]);
        } else {
          throw new Error("Could not parse JSON from AI response.");
        }
      }

      // Record to database
      await ctx.runMutation(api.ieltsQueries.saveReview, {
        textTranscript: args.transcript,
        estimatedBand: jsonResult.estimatedBand || 5.0,
        fluencyFeedback: jsonResult.fluencyFeedback || "N/A",
        vocabularyFeedback: jsonResult.vocabularyFeedback || "N/A",
        grammarFeedback: jsonResult.grammarFeedback || "N/A",
        generalAdvice: jsonResult.generalAdvice || "Keep practicing!",
      });

      return jsonResult;
    } catch (error) {
      console.error("IELTS Evaluation Error:", error);
      throw new Error("Failed to evaluate IELTS speech. " + String(error));
    }
  },
});
