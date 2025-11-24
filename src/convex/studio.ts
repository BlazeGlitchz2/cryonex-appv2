"use node";
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";

export const executeCode = action({
  args: {
    language: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    // This would connect to Judge0 or a similar execution engine
    // For now, we'll simulate execution or return a placeholder
    
    // Check for Judge0 keys
    const judge0Key = process.env.JUDGE0_API_KEY;
    
    if (!judge0Key) {
      // Simulation mode if no keys
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        stdout: `[Simulation] Executing ${args.language} code...\n\n> Hello from Cryonex Studio!\n> Your code ran successfully.\n`,
        stderr: "",
        status: { description: "Accepted" }
      };
    }

    // Real execution implementation would go here
    return {
      stdout: "Execution environment not fully configured yet.",
      stderr: "",
      status: { description: "Error" }
    };
  },
});

export const generateCode = action({
  args: {
    prompt: v.string(),
    currentCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OpenRouter API Key missing");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://cryonex.app",
        "X-Title": "Cryonex Studio",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001", // Fast, good for code
        messages: [
          {
            role: "system",
            content: "You are Cryonex Studio AI, an expert coding assistant. Provide concise, correct code snippets based on the user's request. If code is provided, edit or explain it as requested."
          },
          {
            role: "user",
            content: `Context:\n${args.currentCode || "No code yet"}\n\nRequest: ${args.prompt}`
          }
        ]
      })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || "// Failed to generate code";
  }
});
