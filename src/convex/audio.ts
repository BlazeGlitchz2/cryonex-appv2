import { v } from "convex/values";
import { action } from "./_generated/server";
import { getAiProviderKeys } from "./lib/aiRouting";
import { requireCurrentUserOwnedStorageId } from "./lib/storageAccess";

export const transcribeAudio = action({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        try {
            await requireCurrentUserOwnedStorageId(ctx, args.storageId);
            const audioUrl = await ctx.storage.getUrl(args.storageId);
            if (!audioUrl) throw new Error("Audio not found in storage.");

            // Fetch the file to send to Whisper
            const response = await fetch(audioUrl);
            const audioBlob = await response.blob();

            const formData = new FormData();
            formData.append("file", audioBlob, "lecture.webm");
            formData.append("model", "whisper-large-v3-turbo");
            formData.append("response_format", "json");

            console.log("Sending audio to Groq Whisper...");

            const groqApiKey = getAiProviderKeys().groq;
            if (!groqApiKey) throw new Error("GROQ_API_KEY environment variable not set");

            const transcriptionReq = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${groqApiKey}`,
                },
                body: formData,
            });

            if (!transcriptionReq.ok) {
                const errorText = await transcriptionReq.text();
                console.error("Groq Whisper API Error:", errorText);
                throw new Error(`Failed to transcribe: ${transcriptionReq.status}`);
            }

            const transcriptionResult = await transcriptionReq.json();

            return {
                text: transcriptionResult.text,
            };
        } catch (e: any) {
            console.error(e);
            throw new Error(e.message || "Failed to transcribe audio.");
        }
    },
});
