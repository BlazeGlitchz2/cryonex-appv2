"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

export const getPerformanceRecommendation = action({
    args: {
        metrics: v.object({
            fps: v.number(),
            gpuTier: v.string(),
            deviceMemory: v.union(v.number(), v.null()),
            cpuCores: v.union(v.number(), v.null()),
            isLowEndDevice: v.boolean(),
            deviceType: v.string(),
        }),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("GROQ_API_KEY is not set");
            return { recommendation: "full", reason: "AI analysis unavailable (missing API key)" };
        }

        const { metrics } = args;
        const prompt = `
      Analyze the following device performance metrics and recommend a performance tier: 'full' or 'lite'.
      
      Metrics:
      - FPS: ${metrics.fps}
      - GPU Tier: ${metrics.gpuTier}
      - Device Memory: ${metrics.deviceMemory} GB
      - CPU Cores: ${metrics.cpuCores}
      - Is Low End Device: ${metrics.isLowEndDevice}
      - Device Type: ${metrics.deviceType}
      
      The application has high-end 3D shaders and effects.
      - 'full': High-end PC/Mac with good GPU and > 45 FPS, or capable devices.
      - 'lite': Low-end devices, mobile, or poor FPS (< 30).
      
      Return ONLY a JSON object: { "recommendation": "full" | "lite", "reason": "short explanation" }
    `;

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.2-1b-preview",
                    messages: [
                        { role: "system", content: "You are a performance optimization expert. Return JSON only." },
                        { role: "user", content: prompt },
                    ],
                    temperature: 0.1,
                    response_format: { type: "json_object" },
                }),
            });

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status}`);
            }

            const data = await response.json();
            const result = JSON.parse(data.choices[0].message.content);
            return result;
        } catch (error) {
            console.error("Performance analysis failed:", error);
            return { recommendation: "full", reason: "Analysis failed, defaulting to full" };
        }
    },
});
