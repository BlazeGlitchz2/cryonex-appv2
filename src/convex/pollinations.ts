"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const generate = action({
    args: {
        model: v.string(),
        prompt: v.string(),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        seed: v.optional(v.number()),
        enhance: v.optional(v.boolean()),
        negative_prompt: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const key = process.env.POLLINATIONS_API_KEY;

        const model = args.model || "flux";
        const width = args.width || 1024;
        const height = args.height || 1024;
        const seed = args.seed ?? Math.floor(Math.random() * 1000000);
        const enhance = args.enhance ?? false;
        const negative_prompt = args.negative_prompt || "worst quality, blurry";

        // New endpoint: https://gen.pollinations.ai/image/{prompt}
        const baseUrl = "https://gen.pollinations.ai/image";
        const encodedPrompt = encodeURIComponent(args.prompt);
        const params = new URLSearchParams({
            model,
            width: width.toString(),
            height: height.toString(),
            seed: seed.toString(),
            enhance: enhance.toString(),
            negative_prompt
        });

        const headers: Record<string, string> = {};
        if (key) {
            headers["Authorization"] = `Bearer ${key}`;
        }

        const apiUrl = `${baseUrl}/${encodedPrompt}?${params.toString()}`;

        console.log(`Generating Pollinations image via: ${apiUrl}`);

        try {
            const response = await fetch(apiUrl, { headers });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Pollinations API Error:", errorText);

                // Fallback to old endpoint if new one fails and no key was used
                if (!key) {
                    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=true`;
                    console.log(`Falling back to old Pollinations endpoint: ${fallbackUrl}`);
                    const fallbackResponse = await fetch(fallbackUrl);
                    if (fallbackResponse.ok) {
                        const blob = await fallbackResponse.blob();
                        const storageId = await ctx.storage.store(blob);
                        return await ctx.storage.getUrl(storageId);
                    }
                }

                throw new Error(`Pollinations generation failed (${response.status}): ${errorText}`);
            }

            const blob = await response.blob();

            // Store the generated image in Convex Storage
            const storageId = await ctx.storage.store(blob);
            const url = await ctx.storage.getUrl(storageId);

            if (!url) {
                throw new Error("Failed to generate storage URL for the generated image");
            }

            return url;
        } catch (error) {
            console.error("Pollinations generation error:", error);
            throw error;
        }
    },
});
