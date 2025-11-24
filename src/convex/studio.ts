"use node";
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";

// Judge0 Language IDs
const LANGUAGE_MAP: Record<string, number> = {
  "javascript": 63, // Node.js
  "typescript": 74, // TypeScript
  "python": 71,     // Python 3
  "java": 62,       // Java
  "c++": 54,        // C++
  "c#": 51,         // C#
  "go": 60,         // Go
  "rust": 73,       // Rust
  "php": 68,        // PHP
  "ruby": 72,       // Ruby
  "swift": 83,      // Swift
  "kotlin": 78,     // Kotlin
  "dart": 90,       // Dart
  "scala": 81,      // Scala
  "perl": 85,       // Perl
  "lua": 64,        // Lua
  "r": 80,          // R
  "objective-c": 79,// Objective-C
  "shell": 46,      // Bash
  "sql": 82,        // SQLite
};

export const executeCode = action({
  args: {
    language: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for Judge0 keys
    const apiKey = process.env.JUDGE0_API_KEY;
    const apiHost = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";
    const apiHostHeader = process.env.JUDGE0_API_HOST_HEADER || "judge0-ce.p.rapidapi.com";
    
    // Normalize language string
    const langKey = args.language.toLowerCase();
    const languageId = LANGUAGE_MAP[langKey];

    if (!apiKey) {
      // Simulation mode if no keys
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        stdout: `[Simulation Mode]\nTo enable real execution, add JUDGE0_API_KEY to your environment variables.\n\nExecuting ${args.language}...\n\n> Output:\nHello from Cryonex Studio!\nYour code ran successfully.\n`,
        stderr: "",
        status: { description: "Accepted" }
      };
    }

    if (!languageId) {
      return {
        stdout: "",
        stderr: `Language '${args.language}' is not supported for execution in this environment.`,
        status: { description: "Error" }
      };
    }

    try {
      const response = await fetch(`https://${apiHost}/submissions?base64_encoded=false&wait=true`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": apiHostHeader,
        },
        body: JSON.stringify({
          source_code: args.code,
          language_id: languageId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Judge0 API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      return {
        stdout: data.stdout || "",
        stderr: data.stderr || data.compile_output || "",
        status: data.status || { description: "Unknown" },
        time: data.time,
        memory: data.memory,
      };

    } catch (error: any) {
      console.error("Execution error:", error);
      return {
        stdout: "",
        stderr: `Execution failed: ${error.message}`,
        status: { description: "Error" }
      };
    }
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