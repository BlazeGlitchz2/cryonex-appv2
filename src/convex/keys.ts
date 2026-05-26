import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getConfiguredProviderStatus, getProviderEnvMetadata } from "./lib/aiRouting";

export const getProviderStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const configured = getConfiguredProviderStatus();
    const envs = getProviderEnvMetadata();

    return {
      providers: {
        openrouter: {
          configured: configured.openrouter,
          env: envs.openrouter.canonicalEnv,
        },
        groq: {
          configured: configured.groq,
          env: envs.groq.canonicalEnv,
        },
        sambanova: {
          configured: configured.sambanova,
          env: envs.sambanova.canonicalEnv,
        },
        cerebras: {
          configured: configured.cerebras,
          env: envs.cerebras.canonicalEnv,
        },
        google: {
          configured: configured.google,
          env: envs.google.canonicalEnv,
        },
        huggingface: {
          configured: configured.huggingface,
          env: envs.huggingface.canonicalEnv,
        },
        pollinations: {
          configured: configured.pollinations,
          env: envs.pollinations.canonicalEnv,
        },
        mistral: {
          configured: configured.mistral,
          env: envs.mistral.canonicalEnv,
        },
      },
    };
  },
});
