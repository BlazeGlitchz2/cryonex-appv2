const readFirstEnv = (...names: string[]) => {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }
  return "";
};

export type AiEnvironment = {
  openRouterKey: string;
  groqKey: string;
  sambaNovaKey: string;
  cerebrasKey: string;
  geminiKey: string;
  huggingFaceKey: string;
  pollinationsKey: string;
  mistralKey: string;
  bytezKey: string;
};

export const getAiEnvironment = (): AiEnvironment => ({
  openRouterKey: readFirstEnv(
    "OPENROUTER_API_KEY",
    "API_KEY_OPENROUTER",
    "VLY_OPENROUTER_API_KEY",
    "VITE_OPENROUTER_API_KEY",
  ),
  groqKey: readFirstEnv("GROQ_API_KEY", "API_KEY_GROQ"),
  sambaNovaKey: readFirstEnv("SAMBANOVA_API_KEY", "API_KEY_SAMBANOVA"),
  cerebrasKey: readFirstEnv("CEREBRAS_API_KEY", "API_KEY_CEREBRAS"),
  geminiKey: readFirstEnv(
    "GEMINI_API_KEY",
    "GOOGLE_GENERATIVE_AI_API_KEY",
    "API_KEY_GOOGLE",
  ),
  huggingFaceKey: readFirstEnv(
    "HF_TOKEN",
    "HUGGINGFACE_API_KEY",
    "API_KEY_HUGGINGFACE",
  ),
  pollinationsKey: readFirstEnv(
    "POLLINATIONS_API_KEY",
    "API_KEY_POLLINATIONS",
  ),
  mistralKey: readFirstEnv("MISTRAL_API_KEY", "API_KEY_MISTRAL"),
  bytezKey: readFirstEnv("BYTEZ_API_KEY", "VITE_BYTEZ_API_KEY"),
});

export const hasTextGenerationProvider = (env = getAiEnvironment()) =>
  Boolean(
    env.groqKey ||
      env.sambaNovaKey ||
      env.cerebrasKey ||
      env.geminiKey ||
      env.openRouterKey ||
      env.huggingFaceKey ||
      env.pollinationsKey,
  );

export const hasSemanticEmbeddingProvider = (env = getAiEnvironment()) =>
  Boolean(env.geminiKey);
