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
        nologo: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const key = process.env.POLLINATIONS_API_KEY;

        const model = args.model || "flux";
        const width = args.width || 1024;
        const height = args.height || 1024;
        const seed = args.seed ?? Math.floor(Math.random() * 1000000);
        const enhance = args.enhance ?? false;
        const nologo = args.nologo ?? true; // Default to true if not specified
        const negative_prompt = args.negative_prompt || "worst quality, blurry";

        const encodedPrompt = encodeURIComponent(args.prompt);

        // STRATEGY: Use Free Tier (image.pollinations.ai) if no key, otherwise use Pro Tier (gen.pollinations.ai)
        if (!key) {
            console.log("No Pollinations Key - Using Free Tier Endpoint");
            const freeUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=${nologo}`;

            // Verify if we can just return the URL or if we need to cache it
            // For stability, let's fetch and cache it so the link doesn't expire or change
            try {
                const response = await fetch(freeUrl);
                if (!response.ok) throw new Error(`Free tier failed: ${response.status}`);
                const blob = await response.blob();
                const storageId = await ctx.storage.store(blob);
                return await ctx.storage.getUrl(storageId);
            } catch (err) {
                console.error("Free tier fetch failed, falling back to hotlink:", err);
                return freeUrl;
            }
        }

        // Pro Endpoint
        const baseUrl = "https://gen.pollinations.ai/image";
        const params = new URLSearchParams({
            model,
            width: width.toString(),
            height: height.toString(),
            seed: seed.toString(),
            enhance: enhance.toString(),
            nologo: nologo.toString(),
            negative_prompt
        });

        const headers: Record<string, string> = {
            "Authorization": `Bearer ${key}`
        };

        const apiUrl = `${baseUrl}/${encodedPrompt}?${params.toString()}`;
        console.log(`Generating Pollinations image via Pro API`);

        try {
            const response = await fetch(apiUrl, { headers });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Pollinations Pro API Error:", errorText);
                throw new Error(`Pollinations generation failed (${response.status}): ${errorText}`);
            }

            const blob = await response.blob();
            const storageId = await ctx.storage.store(blob);
            const url = await ctx.storage.getUrl(storageId);

            if (!url) throw new Error("Failed to generate storage URL");
            return url;
        } catch (error) {
            console.error("Pollinations Pro API generation error, falling back to free tier:", error);

            // Fallback to Free Tier
            const freeUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=${nologo}`;
            console.log("Using Free Tier Fallback URL:", freeUrl);

            try {
                // Try to fetch and store the free tier image
                const response = await fetch(freeUrl);
                if (!response.ok) throw new Error(`Free tier failed: ${response.status}`);
                const blob = await response.blob();
                const storageId = await ctx.storage.store(blob);
                const url = await ctx.storage.getUrl(storageId);
                return url;
            } catch (fallbackError) {
                console.error("Free tier fallback fetch failed, returning hotlink:", fallbackError);
                return freeUrl;
            }
        }
    },
});

export const edit = action({
    args: {
        prompt: v.string(),
        image: v.string(), // Source image URL
        model: v.optional(v.string()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        seed: v.optional(v.number()),
        nologo: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        // Kontext is the best model for editing
        const model = args.model || "kontext";
        const width = args.width || 1024;
        const height = args.height || 1024;
        const seed = args.seed ?? Math.floor(Math.random() * 1000000);
        const nologo = args.nologo ?? true;

        const encodedPrompt = encodeURIComponent(args.prompt);
        const encodedImage = encodeURIComponent(args.image);

        // Construct URL: https://image.pollinations.ai/prompt/{prompt}?model={model}&image={imageURL}
        const editUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${model}&image=${encodedImage}&width=${width}&height=${height}&seed=${seed}&nologo=${nologo}`;

        console.log(`[Pollinations] Edit URL: ${editUrl}`);

        try {
            // Fetch and store to ensure persistence
            const response = await fetch(editUrl);
            if (!response.ok) throw new Error(`Edit failed: ${response.status}`);

            const blob = await response.blob();
            const storageId = await ctx.storage.store(blob);
            const url = await ctx.storage.getUrl(storageId);

            return url || editUrl;
        } catch (err) {
            console.error("Pollinations edit failed, falling back to hotlink:", err);
            return editUrl;
        }
    },
});
