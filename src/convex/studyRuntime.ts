"use node";

import { AgentClient } from "@21st-sdk/node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

function getSummaryProviderAvailability() {
  return Boolean(
    process.env.CEREBRAS_API_KEY ||
      process.env.SAMBANOVA_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.BYTEZ_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      process.env.HF_TOKEN ||
      process.env.HUGGINGFACE_API_KEY,
  );
}

export const getPipelineReadiness = action({
  args: {},
  handler: async () => {
    const hasSemanticEmbeddingProvider = Boolean(
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    );
    const hasEmbeddingProvider = true;
    const hasOcrProvider = Boolean(process.env.MISTRAL_API_KEY);
    const hasSummaryProvider = getSummaryProviderAvailability();

    const missingForPdfUpload = [
      !hasOcrProvider ? "MISTRAL_API_KEY" : null,
      !hasSummaryProvider
        ? "one text generation provider (Cerebras, SambaNova, Groq, Gemini, Bytez, OpenRouter, or HuggingFace)"
        : null,
    ].filter(Boolean);

    return {
      checkedAt: Date.now(),
      hasOcrProvider,
      hasEmbeddingProvider,
      hasSemanticEmbeddingProvider,
      hasSummaryProvider,
      canUploadPdf: missingForPdfUpload.length === 0,
      canGenerateStudyAssets: hasSummaryProvider,
      canUseGroundedChat: hasEmbeddingProvider && hasSummaryProvider,
      missingForPdfUpload,
    };
  },
});

export const getCopilotStatus = action({
  args: {},
  handler: async () => {
    return {
      configured: Boolean(
        process.env.API_KEY_21ST && process.env.AGENT_21ST_STUDY_COPILOT,
      ),
      agentSlug: process.env.AGENT_21ST_STUDY_COPILOT || null,
      missing: [
        !process.env.API_KEY_21ST ? "API_KEY_21ST" : null,
        !process.env.AGENT_21ST_STUDY_COPILOT
          ? "AGENT_21ST_STUDY_COPILOT"
          : null,
      ].filter(Boolean),
    };
  },
});

export const create21stToken = action({
  args: { agent: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const apiKey = process.env.API_KEY_21ST;
    const agentSlug = args.agent || process.env.AGENT_21ST_STUDY_COPILOT;

    if (!apiKey || !agentSlug) {
      throw new Error(
        "21st Study Copilot is not configured. Set API_KEY_21ST and AGENT_21ST_STUDY_COPILOT.",
      );
    }

    // Ensure the authenticated person also has a concrete Convex user row.
    // Some 21st proxy flows expect an application user to exist before token use.
    const ensuredUser = await ctx.runMutation(api.users.ensureUser, {});
    if (!ensuredUser?._id) {
      throw new Error("User must exist in database to use Study Copilot.");
    }

    const client = new AgentClient({ apiKey });
    const { token, expiresAt } = await client.tokens.create({
      agent: agentSlug,
      userId:
        String(ensuredUser._id) ||
        identity.tokenIdentifier ||
        identity.email ||
        identity.subject,
      expiresIn: "15m",
    });

    return {
      token,
      expiresAt,
      agentSlug,
    };
  },
});
