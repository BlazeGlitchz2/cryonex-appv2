"use node";

import {
  MODEL_ALIASES,
  getModelDefinition,
  normalizeModelId,
  type AiProviderId,
} from "../shared/ai-models";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | Array<Record<string, unknown>>;
};

export type AiRoutingRole =
  | "chat-fast"
  | "chat-balanced"
  | "chat-reasoning"
  | "chat-vision"
  | "study-json"
  | "study-text"
  | "study-summary"
  | "title"
  | "image-prompt"
  | "library";

type JsonMode = "off" | "object";

type ProviderEnv = {
  groqKey: string;
  sambanovaKey: string;
  cerebrasKey: string;
  googleKey: string;
  openrouterKey: string;
  hfKey: string;
  bytezKey: string;
  pollinationsKey: string;
};

type Candidate = {
  modelId: string;
  provider: AiProviderId;
  apiModel: string;
  baseURL: string;
  apiKey?: string;
  headers?: Record<string, string>;
  supportsJsonObject?: boolean;
  allowedModels?: string[];
};

type CompletionOptions = {
  role: AiRoutingRole;
  messages: ChatMessage[];
  requestedModelId?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: JsonMode;
};

type CompletionResult = {
  content: string;
  modelId: string;
  provider: AiProviderId;
  apiModel: string;
};

const APP_REFERER = "https://www.cryonex.app";
const APP_TITLE = "Cryonex Workspace";

const ROLE_CHAINS: Record<AiRoutingRole, string[]> = {
  "chat-fast": [
    "groq/llama-3.1-8b-instant",
    "sambanova/Meta-Llama-3.1-8B-Instruct",
    "pollinations/gemini",
    "openrouter/free",
  ],
  "chat-balanced": [
    "groq/llama-3.3-70b-versatile",
    "sambanova/Meta-Llama-3.3-70B-Instruct",
    "cerebras/gpt-oss-120b",
    "google/gemini-2.5-flash",
    "openrouter/auto",
    "pollinations/gemini",
    "minimax/minimax-m2.5:free",
    "openrouter/free",
  ],
  "chat-reasoning": [
    "cerebras/gpt-oss-120b",
    "groq/qwen-2.5-32b",
    "sambanova/DeepSeek-V3.1",
    "google/gemini-2.5-flash",
    "openrouter/auto",
    "pollinations/gemini",
    "minimax/minimax-m2.5:free",
    "openrouter/free",
  ],
  "chat-vision": [
    "google/gemini-2.5-flash",
    "groq/meta-llama/llama-4-scout-17b-16e-instruct",
    "pollinations/qwen-vision",
    "openrouter/auto",
    "openrouter/free",
    "pollinations/gemini",
  ],
  "study-json": [
    "cerebras/gpt-oss-120b",
    "groq/qwen-2.5-32b",
    "sambanova/Meta-Llama-3.3-70B-Instruct",
    "google/gemini-2.5-flash",
    "openrouter/auto",
    "pollinations/gemini",
    "minimax/minimax-m2.5:free",
    "openrouter/free",
  ],
  "study-text": [
    "cerebras/gpt-oss-120b",
    "sambanova/DeepSeek-V3.1",
    "groq/llama-3.3-70b-versatile",
    "google/gemini-2.5-flash",
    "openrouter/auto",
    "pollinations/gemini",
    "minimax/minimax-m2.5:free",
    "openrouter/free",
  ],
  "study-summary": [
    "cerebras/gpt-oss-120b",
    "sambanova/DeepSeek-V3.1",
    "groq/qwen-2.5-32b",
    "google/gemini-2.5-flash",
    "openrouter/auto",
    "pollinations/gemini",
    "minimax/minimax-m2.5:free",
    "openrouter/free",
  ],
  title: [
    "groq/llama-3.1-8b-instant",
    "sambanova/Meta-Llama-3.1-8B-Instruct",
    "google/gemini-2.5-flash",
    "pollinations/gemini",
    "openrouter/free",
  ],
  "image-prompt": [
    "groq/llama-3.1-8b-instant",
    "sambanova/Meta-Llama-3.1-8B-Instruct",
    "google/gemini-2.5-flash",
    "pollinations/gemini",
    "openrouter/free",
  ],
  library: [
    "cerebras/gpt-oss-120b",
    "groq/llama-3.3-70b-versatile",
    "sambanova/Meta-Llama-3.3-70B-Instruct",
    "google/gemini-2.5-flash",
    "openrouter/auto",
    "pollinations/gemini",
  ],
};

const PROVIDER_FALLBACKS: Record<AiProviderId, string[]> = {
  cryonex: ROLE_CHAINS["chat-balanced"],
  offline: ROLE_CHAINS["chat-balanced"],
  groq: [
    "sambanova/Meta-Llama-3.3-70B-Instruct",
    "cerebras/gpt-oss-120b",
    "openrouter/auto",
    "pollinations/gemini",
    "openrouter/free",
  ],
  sambanova: [
    "groq/llama-3.3-70b-versatile",
    "cerebras/gpt-oss-120b",
    "openrouter/auto",
    "pollinations/gemini",
    "openrouter/free",
  ],
  cerebras: [
    "groq/qwen-2.5-32b",
    "sambanova/DeepSeek-V3.1",
    "openrouter/auto",
    "pollinations/gemini",
    "openrouter/free",
  ],
  google: [
    "pollinations/gemini",
    "openrouter/auto",
    "groq/llama-3.3-70b-versatile",
    "openrouter/free",
  ],
  openrouter: ["pollinations/gemini", "minimax/minimax-m2.5:free", "openrouter/free"],
  pollinations: ["openrouter/auto", "minimax/minimax-m2.5:free", "openrouter/free"],
  huggingface: ["openrouter/auto", "pollinations/gemini", "openrouter/free"],
  bytez: ["openrouter/auto", "pollinations/gemini", "openrouter/free"],
  meta: ROLE_CHAINS["chat-balanced"],
  minimax: ["openrouter/free", "pollinations/gemini"],
  nvidia: ["openrouter/free", "pollinations/qwen-vision"],
  replicate: ROLE_CHAINS["chat-balanced"],
  other: ROLE_CHAINS["chat-balanced"],
};

function readEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

export function getProviderEnv(): ProviderEnv {
  return {
    groqKey: readEnv("GROQ_API_KEY", "API_KEY_GROQ"),
    sambanovaKey: readEnv("SAMBANOVA_API_KEY", "API_KEY_SAMBANOVA"),
    cerebrasKey: readEnv("CEREBRAS_API_KEY"),
    googleKey: readEnv(
      "GEMINI_API_KEY",
      "GOOGLE_GENERATIVE_AI_API_KEY",
      "API_KEY_GOOGLE",
    ),
    openrouterKey: readEnv(
      "OPENROUTER_API_KEY",
      "VLY_OPENROUTER_API_KEY",
      "API_KEY_OPENROUTER",
    ),
    hfKey: readEnv("HF_TOKEN", "HUGGINGFACE_API_KEY", "API_KEY_HUGGINGFACE"),
    bytezKey: readEnv("BYTEZ_API_KEY", "API_KEY_BYTEZ"),
    pollinationsKey: readEnv("POLLINATIONS_API_KEY"),
  };
}

export function determineAutoModel(
  content: string,
  hasAttachments: boolean,
): string {
  const lower = content.toLowerCase();

  if (hasAttachments) {
    return "pollinations/qwen-vision";
  }

  const imageIntent = [
    "generate image",
    "create image",
    "make image",
    "draw",
    "illustrate",
    "render image",
    "design logo",
  ].some((keyword) => lower.includes(keyword));

  if (imageIntent || lower.startsWith("/image") || lower.startsWith("/img")) {
    return "pollinations/gptimage";
  }

  const reasoningIntent = [
    "code",
    "debug",
    "fix",
    "analyze",
    "compare",
    "architecture",
    "math",
    "physics",
    "logic",
    "optimize",
    "explain",
    "why",
    "how",
    "summary",
    "summarize",
  ].some((keyword) => lower.includes(keyword));

  if (content.length > 900 || reasoningIntent) {
    return "groq/qwen-2.5-32b";
  }

  if (content.length > 180) {
    return "groq/llama-3.3-70b-versatile";
  }

  return "groq/llama-3.1-8b-instant";
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function getRequestedFallbacks(modelId: string) {
  const normalized = normalizeModelId(modelId);
  const model = getModelDefinition(normalized);
  if (!model) {
    return [];
  }
  return PROVIDER_FALLBACKS[model.routeProvider] || [];
}

export function buildRoleAttemptChain(
  role: AiRoutingRole,
  requestedModelId?: string,
) {
  const requested =
    requestedModelId && requestedModelId !== "auto"
      ? normalizeModelId(requestedModelId)
      : "";

  return unique([
    requested,
    ...getRequestedFallbacks(requested),
    ...ROLE_CHAINS[role],
  ]).filter(Boolean);
}

function getOpenRouterHeaders() {
  return {
    "HTTP-Referer": APP_REFERER,
    "X-Title": APP_TITLE,
  };
}

function getPollinationsHeaders() {
  return {
    ...getOpenRouterHeaders(),
  };
}

export function getModelApiConfig(modelId: string): Candidate | null {
  const env = getProviderEnv();
  const normalized = normalizeModelId(modelId);
  const model = getModelDefinition(normalized);

  if (!model) {
    return null;
  }

  switch (model.routeProvider) {
    case "groq":
      if (!env.groqKey) return null;
      return {
        modelId: normalized,
        provider: "groq",
        apiModel: normalized.replace("groq/", ""),
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: env.groqKey,
        supportsJsonObject: true,
      };
    case "sambanova":
      if (!env.sambanovaKey) return null;
      return {
        modelId: normalized,
        provider: "sambanova",
        apiModel: normalized.replace("sambanova/", ""),
        baseURL: "https://api.sambanova.ai/v1",
        apiKey: env.sambanovaKey,
        supportsJsonObject: true,
      };
    case "cerebras":
      if (!env.cerebrasKey) return null;
      return {
        modelId: normalized,
        provider: "cerebras",
        apiModel: normalized.replace("cerebras/", ""),
        baseURL: "https://api.cerebras.ai/v1",
        apiKey: env.cerebrasKey,
        supportsJsonObject: true,
      };
    case "google":
      if (!env.googleKey) return null;
      return {
        modelId: normalized,
        provider: "google",
        apiModel: normalized.replace("google/", ""),
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
        apiKey: env.googleKey,
        supportsJsonObject: false,
      };
    case "pollinations":
      return {
        modelId: normalized,
        provider: "pollinations",
        apiModel: normalized.replace("pollinations/", ""),
        baseURL: "https://text.pollinations.ai/openai",
        apiKey: env.pollinationsKey || "dummy",
        headers: getPollinationsHeaders(),
        supportsJsonObject: true,
      };
    case "openrouter": {
      if (!env.openrouterKey) return null;

      if (normalized === "openrouter/auto") {
        return {
          modelId: normalized,
          provider: "openrouter",
          apiModel: "openrouter/auto",
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: env.openrouterKey,
          headers: getOpenRouterHeaders(),
          supportsJsonObject: true,
        };
      }

      return {
        modelId: normalized,
        provider: "openrouter",
        apiModel: normalized,
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: env.openrouterKey,
        headers: getOpenRouterHeaders(),
        supportsJsonObject: true,
      };
    }
    case "huggingface":
      if (!env.hfKey) return null;
      return {
        modelId: normalized,
        provider: "huggingface",
        apiModel: normalized.replace("huggingface/", ""),
        baseURL: "https://router.huggingface.co/v1",
        apiKey: env.hfKey,
        supportsJsonObject: false,
      };
    case "bytez":
      if (!env.bytezKey) return null;
      return {
        modelId: normalized,
        provider: "bytez",
        apiModel: normalized.replace("bytez/", ""),
        baseURL: "https://api.bytez.com/v1",
        apiKey: env.bytezKey,
        supportsJsonObject: true,
      };
    default:
      return null;
  }
}

function extractTextContent(data: any) {
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

async function executeCandidate(
  candidate: Candidate,
  options: CompletionOptions,
): Promise<CompletionResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${candidate.apiKey}`,
    ...(candidate.headers || {}),
  };

  const body: Record<string, unknown> = {
    model: candidate.apiModel,
    messages: options.messages,
    stream: false,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 1400,
  };

  if (
    options.jsonMode === "object" &&
    candidate.supportsJsonObject &&
    candidate.provider !== "google"
  ) {
    body.response_format = { type: "json_object" };
  }

  if (candidate.provider === "openrouter" && candidate.apiModel === "openrouter/auto") {
    const allowedModels =
      options.role === "chat-vision"
        ? ["google/*", "meta-llama/*", "nvidia/*"]
        : options.role === "study-json" || options.role === "chat-reasoning"
          ? ["deepseek/*", "google/*", "openai/gpt-oss-*", "meta-llama/*"]
          : ["google/*", "meta-llama/*", "openai/gpt-oss-*", "deepseek/*"];

    body.plugins = [
      {
        id: "auto-router",
        allowed_models: allowedModels,
      },
    ];
  }

  const response = await fetch(`${candidate.baseURL}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `${candidate.provider}:${candidate.apiModel} ${response.status} ${errorText.slice(0, 280)}`,
    );
  }

  const data = await response.json();
  const content = extractTextContent(data);
  if (!content) {
    throw new Error(`${candidate.provider}:${candidate.apiModel} returned empty content`);
  }

  return {
    content,
    modelId: candidate.modelId,
    provider: candidate.provider,
    apiModel: data?.model || candidate.apiModel,
  };
}

export async function performRoleCompletion(
  options: CompletionOptions,
): Promise<CompletionResult> {
  const chain = buildRoleAttemptChain(options.role, options.requestedModelId);
  const errors: string[] = [];

  for (const modelId of chain) {
    const candidate = getModelApiConfig(modelId);
    if (!candidate) {
      continue;
    }

    try {
      return await executeCandidate(candidate, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
      console.warn(`[aiRouting] ${modelId} failed: ${message}`);
    }
  }

  throw new Error(
    errors.length > 0
      ? `All providers failed for ${options.role}: ${errors[errors.length - 1]}`
      : `No providers are configured for ${options.role}.`,
  );
}

export function getModelRedirects() {
  return MODEL_ALIASES;
}
