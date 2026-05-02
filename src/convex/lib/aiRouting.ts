"use node";

import { InferenceClient } from "@huggingface/inference";

export type AiProviderId =
  | "google"
  | "openrouter"
  | "pollinations"
  | "groq"
  | "sambanova"
  | "cerebras"
  | "huggingface"
  | "bytez";

export type AiWorkload =
  | "chat-general"
  | "chat-reasoning"
  | "chat-vision"
  | "study-json"
  | "study-text"
  | "study-summary"
  | "library"
  | "image-prompt"
  | "title";

type ProviderEnvConfig = {
  canonicalEnv: string;
  aliases: string[];
};

type ProviderKeyState = Record<AiProviderId | "mistral", string>;

export type OpenAiCompatConfig = {
  provider: AiProviderId;
  apiKey: string;
  baseURL: string;
  model: string;
  headers?: Record<string, string>;
};

export type RouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const PROVIDER_ENVS: Record<AiProviderId | "mistral", ProviderEnvConfig> = {
  google: {
    canonicalEnv: "GEMINI_API_KEY",
    aliases: [
      "GEMINI_API_KEY",
      "GOOGLE_GENERATIVE_AI_API_KEY",
      "API_KEY_GOOGLE",
    ],
  },
  openrouter: {
    canonicalEnv: "OPENROUTER_API_KEY",
    aliases: [
      "OPENROUTER_API_KEY",
      "API_KEY_OPENROUTER",
      "VLY_OPENROUTER_API_KEY",
    ],
  },
  pollinations: {
    canonicalEnv: "POLLINATIONS_API_KEY",
    aliases: ["POLLINATIONS_API_KEY", "API_KEY_POLLINATIONS"],
  },
  groq: {
    canonicalEnv: "GROQ_API_KEY",
    aliases: ["GROQ_API_KEY", "API_KEY_GROQ"],
  },
  sambanova: {
    canonicalEnv: "SAMBANOVA_API_KEY",
    aliases: ["SAMBANOVA_API_KEY", "API_KEY_SAMBANOVA"],
  },
  cerebras: {
    canonicalEnv: "CEREBRAS_API_KEY",
    aliases: ["CEREBRAS_API_KEY", "API_KEY_CEREBRAS"],
  },
  huggingface: {
    canonicalEnv: "HF_TOKEN",
    aliases: ["HF_TOKEN", "HUGGINGFACE_API_KEY", "API_KEY_HUGGINGFACE"],
  },
  bytez: {
    canonicalEnv: "BYTEZ_API_KEY",
    aliases: ["BYTEZ_API_KEY", "API_KEY_BYTEZ"],
  },
  mistral: {
    canonicalEnv: "MISTRAL_API_KEY",
    aliases: ["MISTRAL_API_KEY", "API_KEY_MISTRAL"],
  },
};

const OPENROUTER_HEADERS = {
  "HTTP-Referer": "https://www.cryonex.app",
  "X-Title": "Cryonex Workspace",
};

const POLLINATIONS_LEGACY_MODEL_FALLBACKS: Record<string, string> = {
  "openai-large": "gemini",
  "qwen-large": "gemini",
  "qwen-coder": "qwen-coder-large",
  "gemini-search": "gemini",
  "claude-fast": "gemini",
  claude: "gemini",
  "claude-large": "gemini",
  "gemini-fast": "gemini",
  "gemini-large": "gemini",
  "grok-reasoning": "qwen-large",
};

const DEFAULT_TIMEOUT_MS = 18000;
const FAST_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (e: any) {
    clearTimeout(id);
    if (e.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw e;
  }
}

export const STUDY_JSON_CEREBRAS_CHAR_BUDGET = 24000;

const WORKLOAD_CHAINS: Record<AiWorkload, string[]> = {
  "chat-general": [
    "groq/qwen/qwen3-32b",
    "groq/openai/gpt-oss-120b",
    "google/gemini-2.5-flash",
    "sambanova/MiniMax-M2.5",
    "sambanova/DeepSeek-V3.1",
    "google/gemini-2.5-flash",
    "minimax/minimax-m2.5:free",
    "stepfun/step-3.5-flash:free",
    "z-ai/glm-4.5-air:free",
    "pollinations/qwen-large",
    "openrouter/free",
  ],
  "chat-reasoning": [
    "groq/openai/gpt-oss-120b",
    "google/gemini-2.5-pro",
    "google/gemini-2.5-pro",
    "sambanova/DeepSeek-R1-0528",
    "sambanova/DeepSeek-V3.1",
    "stepfun/step-3.5-flash:free",
    "z-ai/glm-4.5-air:free",
    "pollinations/qwen-large",
    "openrouter/free",
  ],
  "chat-vision": [
    "google/gemini-2.5-flash",
    "groq/meta-llama/llama-4-scout-17b-16e-instruct",
    "pollinations/qwen-vision",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "pollinations/gemini",
    "openrouter/free",
  ],
  "study-json": [
    "sambanova/DeepSeek-V3.1",
    "groq/openai/gpt-oss-120b",
    "google/gemini-2.5-flash",
    "groq/qwen/qwen3-32b",
    "z-ai/glm-4.5-air:free",
    "stepfun/step-3.5-flash:free",
    "pollinations/qwen-large",
    "openrouter/free",
  ],
  "study-text": [
    "groq/openai/gpt-oss-120b",
    "sambanova/DeepSeek-V3.1",
    "google/gemini-2.5-flash",
    "sambanova/MiniMax-M2.5",
    "z-ai/glm-4.5-air:free",
    "stepfun/step-3.5-flash:free",
    "pollinations/qwen-large",
    "openrouter/free",
  ],
  "study-summary": [
    "pollinations/qwen-large",
    "sambanova/DeepSeek-V3.1",
    "groq/openai/gpt-oss-120b",
    "google/gemini-2.5-flash",
    "z-ai/glm-4.5-air:free",
    "stepfun/step-3.5-flash:free",
    "openrouter/free",
  ],
  library: [
    "groq/qwen/qwen3-32b",
    "groq/openai/gpt-oss-120b",
    "sambanova/MiniMax-M2.5",
    "sambanova/DeepSeek-V3.1",
    "google/gemini-2.5-flash",
    "minimax/minimax-m2.5:free",
    "stepfun/step-3.5-flash:free",
    "pollinations/qwen-large",
    "openrouter/free",
  ],
  "image-prompt": [
    "groq/openai/gpt-oss-20b",
    "cerebras/llama3.1-8b",
    "sambanova/MiniMax-M2.5",
    "google/gemini-2.5-flash-lite",
    "minimax/minimax-m2.5:free",
    "pollinations/qwen-coder-large",
    "z-ai/glm-4.5-air:free",
    "openrouter/free",
  ],
  title: [
    "groq/openai/gpt-oss-20b",
    "cerebras/llama3.1-8b",
    "sambanova/MiniMax-M2.5",
    "google/gemini-2.5-flash-lite",
    "minimax/minimax-m2.5:free",
    "pollinations/qwen-large",
    "z-ai/glm-4.5-air:free",
    "stepfun/step-3.5-flash:free",
    "openrouter/free",
  ],
};

export const FALLBACK_MODEL_MAP: Record<string, string> = {
  "gpt-4-turbo": "google/gemini-2.5-pro",
  "gpt-3.5-turbo": "groq/openai/gpt-oss-20b",
  "claude-3-opus": "google/gemini-2.5-pro",
  "claude-3-sonnet": "groq/openai/gpt-oss-120b",
  "claude-3-haiku": "groq/openai/gpt-oss-20b",
  "gemini-pro": "google/gemini-2.5-pro",
};

export const MODEL_REDIRECTS: Record<string, string> = {
  "qwen/qwen3-next-80b-a3b-instruct:free": "stepfun/step-3.5-flash:free",
  "google/gemma-3-27b-it:free": "z-ai/glm-4.5-air:free",
  "sambanova/Meta-Llama-3.1-405B-Instruct":
    "sambanova/DeepSeek-V3.1",
  "sambanova/Llama-4-Maverick-17B-128E-Instruct":
    "sambanova/DeepSeek-V3.1",
  "groq/meta-llama/llama-4-maverick-17b-128e-instruct":
    "groq/meta-llama/llama-4-scout-17b-16e-instruct",
  "groq/qwen-2.5-32b": "groq/qwen/qwen3-32b",
  "groq/llama-3.3-70b-versatile": "groq/openai/gpt-oss-120b",
  "groq/llama-3.1-8b-instant": "groq/openai/gpt-oss-20b",
  "google/gemini-2.0-flash-exp": "google/gemini-2.5-flash",
  "google/gemini-2.0-flash-exp:free": "stepfun/step-3.5-flash:free",
  "google/gemini-2.0-flash-001": "google/gemini-2.5-flash-lite",
  "pollinations/moonshot-v1-8k": "pollinations/qwen-large",
  "pollinations/claude": "pollinations/gemini-search",
  "pollinations/claude-airforce": "pollinations/gemini-search",
  "pollinations/deepseek-v3.2": "pollinations/qwen-large",
  "pollinations/qwen3-coder-30b": "pollinations/qwen-coder-large",
  "pollinations/searchgpt": "pollinations/gemini-search",
  "pollinations/gptimage": "pollinations/gptimage-large",
  "pollinations/grok-video": "pollinations/seedance",
  "pollinations/wan": "pollinations/seedance",
};

function readFirstEnv(keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return "";
}

function dedupe(models: string[]) {
  return Array.from(new Set(models.filter(Boolean).map(normalizeModelId)));
}

export function getAiProviderKeys(): ProviderKeyState {
  return {
    google: readFirstEnv(PROVIDER_ENVS.google.aliases),
    openrouter: readFirstEnv(PROVIDER_ENVS.openrouter.aliases),
    pollinations: readFirstEnv(PROVIDER_ENVS.pollinations.aliases),
    groq: readFirstEnv(PROVIDER_ENVS.groq.aliases),
    sambanova: readFirstEnv(PROVIDER_ENVS.sambanova.aliases),
    cerebras: readFirstEnv(PROVIDER_ENVS.cerebras.aliases),
    huggingface: readFirstEnv(PROVIDER_ENVS.huggingface.aliases),
    bytez: readFirstEnv(PROVIDER_ENVS.bytez.aliases),
    mistral: readFirstEnv(PROVIDER_ENVS.mistral.aliases),
  };
}

export function getProviderEnvMetadata() {
  return PROVIDER_ENVS;
}

export function getConfiguredProviderStatus() {
  const keys = getAiProviderKeys();
  return {
    google: Boolean(keys.google),
    openrouter: Boolean(keys.openrouter),
    pollinations: true,
    groq: Boolean(keys.groq),
    sambanova: Boolean(keys.sambanova),
    cerebras: Boolean(keys.cerebras),
    huggingface: Boolean(keys.huggingface),
    bytez: Boolean(keys.bytez),
    mistral: Boolean(keys.mistral),
  };
}

export function normalizeModelId(model: string) {
  return MODEL_REDIRECTS[model] || FALLBACK_MODEL_MAP[model] || model;
}

export function determineAutoChatModel(
  content: string,
  hasAttachments: boolean,
): string {
  const lowerContent = content.toLowerCase();

  if (hasAttachments) {
    return "google/gemini-2.5-flash";
  }

  const imageGenerationKeywords = [
    "generate image",
    "create image",
    "make image",
    "draw",
    "illustrate",
    "paint",
    "render image",
    "design logo",
    "generate picture",
    "create art",
  ];

  if (
    imageGenerationKeywords.some((keyword) => lowerContent.includes(keyword)) ||
    lowerContent.startsWith("/image") ||
    lowerContent.startsWith("/img")
  ) {
    return "pollinations/flux";
  }

  const reasoningKeywords = [
    "code",
    "coding",
    "program",
    "function",
    "script",
    "debug",
    "fix",
    "analyze",
    "reason",
    "compare",
    "architecture",
    "optimize",
    "math",
    "calculus",
    "physics",
    "logic",
    "study guide",
    "worksheet",
    "lesson plan",
    "chapter",
    "notes",
    "summarize document",
  ];

  const longFormStudyKeywords = [
    "study guide",
    "worksheet",
    "chapter",
    "lesson",
    "lecture",
    "curriculum",
    "exam prep",
    "summarize document",
    "research paper",
  ];

  if (
    content.length > 12000 ||
    longFormStudyKeywords.some((keyword) => lowerContent.includes(keyword))
  ) {
    return "sambanova/DeepSeek-V3.1";
  }

  const codingKeywords = [
    "code",
    "coding",
    "program",
    "function",
    "script",
    "debug",
    "fix",
    "refactor",
    "typescript",
    "javascript",
    "python",
    "react",
    "sql",
    "json",
    "api",
  ];

  if (codingKeywords.some((keyword) => lowerContent.includes(keyword))) {
    return content.length > 1400
      ? "groq/openai/gpt-oss-120b"
      : "groq/qwen/qwen3-32b";
  }

  if (
    content.length > 700 ||
    reasoningKeywords.some((keyword) => lowerContent.includes(keyword))
  ) {
    return "groq/openai/gpt-oss-120b";
  }

  if (content.length > 200) {
    return "groq/qwen/qwen3-32b";
  }

  return "groq/openai/gpt-oss-20b";
}

export function estimateSerializedMessageChars(messages: RouterMessage[] = []) {
  return serializeMessages(messages).length;
}

export function shouldPreferCerebrasForStudyJson(
  messages: RouterMessage[] = [],
  charBudget = STUDY_JSON_CEREBRAS_CHAR_BUDGET,
) {
  return estimateSerializedMessageChars(messages) <= charBudget;
}

function getDynamicWorkloadChain(
  workload: AiWorkload,
  messages?: RouterMessage[],
) {
  if (
    workload === "study-json" &&
    messages?.length &&
    !shouldPreferCerebrasForStudyJson(messages)
  ) {
    return [
      "groq/qwen/qwen3-32b",
      "groq/openai/gpt-oss-120b",
      "sambanova/DeepSeek-V3.1",
      "google/gemini-2.5-pro",
      "z-ai/glm-4.5-air:free",
      "stepfun/step-3.5-flash:free",
      "openrouter/free",
    ];
  }

  return WORKLOAD_CHAINS[workload];
}

export function getModelFallbackChain(
  workload: AiWorkload,
  primaryModel?: string,
  messages?: RouterMessage[],
) {
  return dedupe([primaryModel || "", ...getDynamicWorkloadChain(workload, messages)]);
}

export function getOpenAiCompatConfig(
  rawModel: string,
  options?: {
    preferGoogleForGemini?: boolean;
    preferPollinationsForGemini?: boolean;
  },
): OpenAiCompatConfig {
  const model = normalizeModelId(rawModel);
  const keys = getAiProviderKeys();

  if (model.startsWith("google/")) {
    const googleModel = model.replace("google/", "");
    const shouldUseGoogle =
      keys.google &&
      (options?.preferGoogleForGemini ||
        (!options?.preferPollinationsForGemini &&
          googleModel.startsWith("gemini")));

    if (shouldUseGoogle) {
      return {
        provider: "google",
        apiKey: keys.google,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
        model: googleModel,
      };
    }

    if (googleModel.startsWith("gemini")) {
      if (keys.pollinations) {
        return {
          provider: "pollinations",
          apiKey: keys.pollinations,
          baseURL: "https://gen.pollinations.ai/v1",
          model: googleModel.includes("pro") ? "gemini-large" : "kimi",
          headers: OPENROUTER_HEADERS,
        };
      }

      return {
        provider: "openrouter",
        apiKey: keys.openrouter,
        baseURL: "https://openrouter.ai/api/v1",
        model: "openrouter/free",
        headers: OPENROUTER_HEADERS,
      };
    }

    return {
      provider: "openrouter",
      apiKey: keys.openrouter,
      baseURL: "https://openrouter.ai/api/v1",
      model,
      headers: OPENROUTER_HEADERS,
    };
  }

  if (model.startsWith("pollinations/")) {
    const pollinationsModel = model.replace("pollinations/", "");

    if (keys.pollinations) {
      return {
        provider: "pollinations",
        apiKey: keys.pollinations,
        baseURL: "https://gen.pollinations.ai/v1",
        model: pollinationsModel,
        headers: OPENROUTER_HEADERS,
      };
    }

    return {
      provider: "pollinations",
      apiKey: "dummy",
      baseURL: "https://text.pollinations.ai/openai",
      model:
        POLLINATIONS_LEGACY_MODEL_FALLBACKS[pollinationsModel] ||
        pollinationsModel,
      headers: OPENROUTER_HEADERS,
    };
  }

  if (model.startsWith("groq/")) {
    return {
      provider: "groq",
      apiKey: keys.groq,
      baseURL: "https://api.groq.com/openai/v1",
      model: model.replace("groq/", ""),
    };
  }

  if (model.startsWith("sambanova/")) {
    return {
      provider: "sambanova",
      apiKey: keys.sambanova,
      baseURL: "https://api.sambanova.ai/v1",
      model: model.replace("sambanova/", ""),
    };
  }

  if (model.startsWith("cerebras/")) {
    return {
      provider: "cerebras",
      apiKey: keys.cerebras,
      baseURL: "https://api.cerebras.ai/v1",
      model: model.replace("cerebras/", ""),
    };
  }

  if (model.startsWith("huggingface/")) {
    return {
      provider: "huggingface",
      apiKey: keys.huggingface,
      baseURL: "https://router.huggingface.co/v1",
      model: model.replace("huggingface/", ""),
    };
  }

  if (model.startsWith("bytez/")) {
    return {
      provider: "bytez",
      apiKey: keys.bytez,
      baseURL: "https://api.bytez.com/v1",
      model: model.replace("bytez/", ""),
    };
  }

  return {
    provider: "openrouter",
    apiKey: keys.openrouter,
    baseURL: "https://openrouter.ai/api/v1",
    model,
    headers: OPENROUTER_HEADERS,
  };
}

function serializeMessages(messages: RouterMessage[]) {
  return messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n\n");
}

function extractOpenAiContent(data: any) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    return content.trim();
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        return "";
      })
      .join("\n")
      .trim();
  }
  return "";
}

async function callOpenAiCompatibleRoute(
  route: OpenAiCompatConfig,
  messages: RouterMessage[],
  options: {
    json?: boolean;
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  },
) {
  if (!route.apiKey && route.provider !== "pollinations") {
    throw new Error(`Missing API key for ${route.provider}`);
  }

  const response = await fetchWithTimeout(`${route.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(route.apiKey ? { Authorization: `Bearer ${route.apiKey}` } : {}),
      ...(route.headers || {}),
    },
    body: JSON.stringify({
      model: route.model,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 1400,
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `${route.provider}/${route.model} failed: ${response.status} ${errorText.slice(0, 280)}`,
    );
  }

  const data = await response.json();
  const content = extractOpenAiContent(data);
  if (!content) {
    throw new Error(`${route.provider}/${route.model} returned empty content`);
  }
  return content;
}

async function callGeminiNativeRoute(
  model: string,
  apiKey: string,
  messages: RouterMessage[],
  options: {
    json?: boolean;
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  },
) {
  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: serializeMessages(messages) }],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: options.maxTokens ?? 1400,
          ...(options.json ? { responseMimeType: "application/json" } : {}),
        },
      }),
    },
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `google/${model} failed: ${response.status} ${errorText.slice(0, 280)}`,
    );
  }

  const data = await response.json();
  const content =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: any) => part?.text || "")
      .join("\n")
      .trim() || "";

  if (!content) {
    throw new Error(`google/${model} returned empty content`);
  }

  return content;
}

async function callHuggingFaceRoute(
  model: string,
  apiKey: string,
  messages: RouterMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
  },
) {
  const client = new InferenceClient(apiKey);
  const response = await client.chatCompletion({
    model,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 1400,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`huggingface/${model} returned empty content`);
  }

  if (typeof content === "string") {
    return content.trim();
  }
  if (Array.isArray(content)) {
    const parts = content as any[];
    return parts
      .map((part: any) => part?.text || "")
      .join("\n")
      .trim();
  }
  return String(content).trim();
}

export async function generateTextWithFallback(options: {
  workload: AiWorkload;
  messages: RouterMessage[];
  primaryModel?: string;
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}) {
  const keys = getAiProviderKeys();
  const routes = getModelFallbackChain(
    options.workload,
    options.primaryModel,
    options.messages,
  );
  let lastError: unknown = null;

  for (const routeModel of routes) {
    try {
      const normalized = normalizeModelId(routeModel);

      if (
        normalized.startsWith("google/") &&
        normalized.includes("gemini") &&
        keys.google
      ) {
        const content = await callGeminiNativeRoute(
          normalized.replace("google/", ""),
          keys.google,
          options.messages,
          {
            json: options.json,
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            timeoutMs: options.timeoutMs,
          },
        );
        console.log(
          `[aiRouting] ${options.workload} succeeded via google/${normalized.replace("google/", "")}`,
        );
        return { content, provider: "google" as const, model: normalized };
      }

      if (normalized.startsWith("huggingface/") && keys.huggingface) {
        const content = await callHuggingFaceRoute(
          normalized.replace("huggingface/", ""),
          keys.huggingface,
          options.messages,
          {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
          },
        );
        console.log(
          `[aiRouting] ${options.workload} succeeded via ${normalized}`,
        );
        return {
          content,
          provider: "huggingface" as const,
          model: normalized,
        };
      }

      const route = getOpenAiCompatConfig(normalized, {
        preferGoogleForGemini: false,
      });
      const content = await callOpenAiCompatibleRoute(route, options.messages, {
        json: options.json,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        timeoutMs: options.timeoutMs,
      });
      console.log(`[aiRouting] ${options.workload} succeeded via ${normalized}`);
      return { content, provider: route.provider, model: normalized };
    } catch (error) {
      lastError = error;
      console.warn(
        `[aiRouting] ${options.workload} failed via ${routeModel}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  throw new Error(
    `All routes failed for ${options.workload}: ${
      lastError instanceof Error ? lastError.message : "Unknown error"
    }`,
  );
}

export async function generateJsonWithFallback<T>(options: {
  workload: AiWorkload;
  messages: RouterMessage[];
  primaryModel?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const { content, provider, model } = await generateTextWithFallback({
    ...options,
    json: true,
  });

  try {
    return { data: JSON.parse(content) as T, provider, model };
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Model response did not contain a JSON object");
    }

    return { data: JSON.parse(match[0]) as T, provider, model };
  }
}

export async function transcribeAudioWithFallback(
  audioBlob: Blob,
  fileName: string,
) {
  const keys = getAiProviderKeys();
  type AudioRoute = {
    provider: "groq" | "sambanova";
    url: string;
    apiKey: string;
    model: string;
  };
  const routes = [
    keys.groq
      ? {
          provider: "groq" as const,
          url: "https://api.groq.com/openai/v1/audio/transcriptions",
          apiKey: keys.groq,
          model: "whisper-large-v3-turbo",
        }
      : null,
    keys.sambanova
      ? {
          provider: "sambanova" as const,
          url: "https://api.sambanova.ai/v1/audio/transcriptions",
          apiKey: keys.sambanova,
          model: "Whisper-Large-v3",
        }
      : null,
  ].filter((route): route is AudioRoute => Boolean(route));

  let lastError: unknown = null;

  for (const route of routes) {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, fileName);
      formData.append("model", route.model);
      formData.append("response_format", "json");

      const response = await fetch(route.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${route.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `${route.provider}/${route.model} failed: ${response.status} ${errorText.slice(0, 280)}`,
        );
      }

      const data = await response.json();
      const text = String(data?.text || "").trim();
      if (!text) {
        throw new Error(`${route.provider}/${route.model} returned empty text`);
      }

      console.log(
        `[aiRouting] audio transcription succeeded via ${route.provider}/${route.model}`,
      );
      return { text, provider: route.provider, model: route.model };
    } catch (error) {
      lastError = error;
      console.warn(
        `[aiRouting] audio transcription failed via ${route.provider}/${route.model}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  throw new Error(
    `All audio transcription routes failed: ${
      lastError instanceof Error ? lastError.message : "Unknown error"
    }`,
  );
}
