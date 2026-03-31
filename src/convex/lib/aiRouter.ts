import { InferenceClient } from "@huggingface/inference";
import { getAiEnvironment } from "./aiEnvironment";

export type RouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type TextRole =
  | "title"
  | "chat_fast"
  | "chat_reasoning"
  | "study_text"
  | "study_json"
  | "study_summary"
  | "library";

type TextProvider =
  | "groq"
  | "sambanova"
  | "cerebras"
  | "gemini"
  | "openrouter"
  | "huggingface"
  | "pollinations";

type TextProtocol = "openai" | "gemini" | "huggingface";

type TextCandidate = {
  provider: TextProvider;
  label: string;
  protocol: TextProtocol;
  baseUrl?: string;
  apiKey?: string;
  model: string;
  maxTokens: number;
  timeoutMs?: number;
  headers?: Record<string, string>;
};

type TextGenerationOptions = {
  role: TextRole;
  messages: RouterMessage[];
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
};

type TextGenerationResult = {
  content: string;
  provider: TextProvider;
  model: string;
};

type AudioCandidate = {
  provider: "groq" | "sambanova";
  label: string;
  url: string;
  apiKey: string;
  model: string;
};

const OPENROUTER_HEADERS = {
  "HTTP-Referer": "https://cryonex.app",
  "X-OpenRouter-Title": "Cryonex Workspace",
};

const POLLINATIONS_HEADERS = {
  "HTTP-Referer": "https://cryonex.app",
  "X-Title": "Cryonex Workspace",
};

const serializeMessages = (messages: RouterMessage[]) =>
  messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n\n");

const extractOpenAiContent = (data: any) => {
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
};

const withTimeout = async (timeoutMs: number, task: () => Promise<Response>) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await task().then((response) => {
      clearTimeout(timeoutId);
      return response;
    });
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const buildCandidates = (role: TextRole): TextCandidate[] => {
  const env = getAiEnvironment();
  const candidates: TextCandidate[] = [];

  const pushOpenAi = (
    provider: TextProvider,
    label: string,
    apiKey: string,
    baseUrl: string,
    model: string,
    maxTokens: number,
    headers?: Record<string, string>,
  ) => {
    if (!apiKey) return;
    candidates.push({
      provider,
      label,
      protocol: "openai",
      apiKey,
      baseUrl,
      model,
      maxTokens,
      headers,
    });
  };

  const pushPublicOpenAi = (
    provider: TextProvider,
    label: string,
    baseUrl: string,
    model: string,
    maxTokens: number,
    apiKey?: string,
    headers?: Record<string, string>,
  ) => {
    candidates.push({
      provider,
      label,
      protocol: "openai",
      apiKey,
      baseUrl,
      model,
      maxTokens,
      headers,
    });
  };

  const pushGemini = (model: string, maxTokens: number) => {
    if (!env.geminiKey) return;
    candidates.push({
      provider: "gemini",
      label: `Gemini ${model}`,
      protocol: "gemini",
      apiKey: env.geminiKey,
      model,
      maxTokens,
    });
  };

  const pushHuggingFace = (model: string, maxTokens: number) => {
    if (!env.huggingFaceKey) return;
    candidates.push({
      provider: "huggingface",
      label: `Hugging Face ${model}`,
      protocol: "huggingface",
      apiKey: env.huggingFaceKey,
      model,
      maxTokens,
    });
  };

  switch (role) {
    case "title":
      pushOpenAi(
        "groq",
        "Groq Llama 3.1 8B Instant",
        env.groqKey,
        "https://api.groq.com/openai/v1",
        "llama-3.1-8b-instant",
        48,
      );
      pushOpenAi(
        "sambanova",
        "SambaNova Llama 3.1 8B",
        env.sambaNovaKey,
        "https://api.sambanova.ai/v1",
        "Meta-Llama-3.1-8B-Instruct",
        48,
      );
      pushOpenAi(
        "cerebras",
        "Cerebras Llama 3.3 70B",
        env.cerebrasKey,
        "https://api.cerebras.ai/v1",
        "llama-3.3-70b",
        48,
      );
      pushOpenAi(
        "openrouter",
        "OpenRouter MiniMax M2.5 Free",
        env.openRouterKey,
        "https://openrouter.ai/api/v1",
        "minimax/minimax-m2.5:free",
        48,
        OPENROUTER_HEADERS,
      );
      pushHuggingFace("deepseek-ai/DeepSeek-R1:fastest", 48);
      pushPublicOpenAi(
        "pollinations",
        "Pollinations Gemini",
        "https://text.pollinations.ai/openai",
        "gemini",
        48,
        env.pollinationsKey || undefined,
        POLLINATIONS_HEADERS,
      );
      break;
    case "chat_fast":
    case "library":
      pushOpenAi(
        "groq",
        "Groq Llama 3.3 70B",
        env.groqKey,
        "https://api.groq.com/openai/v1",
        "llama-3.3-70b-versatile",
        1400,
      );
      pushOpenAi(
        "sambanova",
        "SambaNova Llama 3.3 70B",
        env.sambaNovaKey,
        "https://api.sambanova.ai/v1",
        "Meta-Llama-3.3-70B-Instruct",
        1400,
      );
      pushOpenAi(
        "cerebras",
        "Cerebras Llama 3.3 70B",
        env.cerebrasKey,
        "https://api.cerebras.ai/v1",
        "llama-3.3-70b",
        1400,
      );
      pushGemini("gemini-2.5-flash-lite", 1400);
      pushOpenAi(
        "openrouter",
        "OpenRouter MiniMax M2.5 Free",
        env.openRouterKey,
        "https://openrouter.ai/api/v1",
        "minimax/minimax-m2.5:free",
        1200,
        OPENROUTER_HEADERS,
      );
      pushHuggingFace("deepseek-ai/DeepSeek-R1:fastest", 1200);
      pushPublicOpenAi(
        "pollinations",
        "Pollinations Gemini",
        "https://text.pollinations.ai/openai",
        "gemini",
        1100,
        env.pollinationsKey || undefined,
        POLLINATIONS_HEADERS,
      );
      break;
    case "chat_reasoning":
    case "study_json":
      pushOpenAi(
        "sambanova",
        "SambaNova DeepSeek R1 Distill 70B",
        env.sambaNovaKey,
        "https://api.sambanova.ai/v1",
        "DeepSeek-R1-Distill-Llama-70B",
        1800,
      );
      pushOpenAi(
        "groq",
        "Groq Qwen3 32B",
        env.groqKey,
        "https://api.groq.com/openai/v1",
        "qwen/qwen3-32b",
        1800,
      );
      pushOpenAi(
        "cerebras",
        "Cerebras Llama 3.3 70B",
        env.cerebrasKey,
        "https://api.cerebras.ai/v1",
        "llama-3.3-70b",
        1800,
      );
      pushGemini("gemini-2.5-flash-lite", 1800);
      pushOpenAi(
        "openrouter",
        "OpenRouter MiniMax M2.5 Free",
        env.openRouterKey,
        "https://openrouter.ai/api/v1",
        "minimax/minimax-m2.5:free",
        1500,
        OPENROUTER_HEADERS,
      );
      pushHuggingFace("deepseek-ai/DeepSeek-R1:preferred", 1500);
      break;
    case "study_text":
    case "study_summary":
      pushGemini("gemini-2.5-flash-lite", 2000);
      pushOpenAi(
        "sambanova",
        "SambaNova Llama 3.3 70B",
        env.sambaNovaKey,
        "https://api.sambanova.ai/v1",
        "Meta-Llama-3.3-70B-Instruct",
        2000,
      );
      pushOpenAi(
        "groq",
        "Groq Llama 3.3 70B",
        env.groqKey,
        "https://api.groq.com/openai/v1",
        "llama-3.3-70b-versatile",
        1800,
      );
      pushOpenAi(
        "cerebras",
        "Cerebras Llama 3.3 70B",
        env.cerebrasKey,
        "https://api.cerebras.ai/v1",
        "llama-3.3-70b",
        1800,
      );
      pushOpenAi(
        "openrouter",
        "OpenRouter MiniMax M2.5 Free",
        env.openRouterKey,
        "https://openrouter.ai/api/v1",
        "minimax/minimax-m2.5:free",
        1600,
        OPENROUTER_HEADERS,
      );
      pushHuggingFace("deepseek-ai/DeepSeek-R1:preferred", 1500);
      pushPublicOpenAi(
        "pollinations",
        "Pollinations Gemini",
        "https://text.pollinations.ai/openai",
        "gemini",
        1400,
        env.pollinationsKey || undefined,
        POLLINATIONS_HEADERS,
      );
      break;
  }

  return candidates;
};

const callOpenAiCompatible = async (
  candidate: TextCandidate,
  messages: RouterMessage[],
  json: boolean,
  temperature: number,
  maxTokens: number,
) => {
  const response = await withTimeout(candidate.timeoutMs ?? 40000, () =>
    fetch(`${candidate.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(candidate.apiKey
          ? { Authorization: `Bearer ${candidate.apiKey}` }
          : {}),
        ...(candidate.headers || {}),
      },
      body: JSON.stringify({
        model: candidate.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
    }),
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `${candidate.label} failed: ${response.status} ${errorText.slice(0, 280)}`,
    );
  }

  const data = await response.json();
  const content = extractOpenAiContent(data);
  if (!content) {
    throw new Error(`${candidate.label} returned empty content`);
  }
  return content;
};

const callGeminiNative = async (
  candidate: TextCandidate,
  messages: RouterMessage[],
  json: boolean,
  temperature: number,
  maxTokens: number,
) => {
  const response = await withTimeout(candidate.timeoutMs ?? 40000, () =>
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${candidate.model}:generateContent?key=${candidate.apiKey}`,
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
            temperature,
            maxOutputTokens: maxTokens,
            ...(json ? { responseMimeType: "application/json" } : {}),
          },
        }),
      },
    ),
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `${candidate.label} failed: ${response.status} ${errorText.slice(0, 280)}`,
    );
  }

  const data = await response.json();
  const content =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: any) => part?.text || "")
      .join("\n")
      .trim() || "";

  if (!content) {
    throw new Error(`${candidate.label} returned empty content`);
  }

  return content;
};

const callHuggingFaceRouter = async (
  candidate: TextCandidate,
  messages: RouterMessage[],
  maxTokens: number,
  temperature: number,
) => {
  const client = new InferenceClient(candidate.apiKey!);
  const response = await client.chatCompletion({
    model: candidate.model,
    messages,
    max_tokens: maxTokens,
    temperature,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`${candidate.label} returned empty content`);
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
};

export const generateTextWithFallback = async (
  options: TextGenerationOptions,
): Promise<TextGenerationResult> => {
  const candidates = buildCandidates(options.role);
  const temperature = options.temperature ?? 0.2;
  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const maxTokens = Math.min(
        options.maxTokens ?? candidate.maxTokens,
        candidate.maxTokens,
      );
      let content = "";

      if (candidate.protocol === "gemini") {
        content = await callGeminiNative(
          candidate,
          options.messages,
          options.json === true,
          temperature,
          maxTokens,
        );
      } else if (candidate.protocol === "huggingface") {
        content = await callHuggingFaceRouter(
          candidate,
          options.messages,
          maxTokens,
          temperature,
        );
      } else {
        content = await callOpenAiCompatible(
          candidate,
          options.messages,
          options.json === true,
          temperature,
          maxTokens,
        );
      }

      console.log(
        `[aiRouter] ${options.role} succeeded via ${candidate.label} (${candidate.model})`,
      );
      return {
        content,
        provider: candidate.provider,
        model: candidate.model,
      };
    } catch (error) {
      lastError = error;
      console.warn(
        `[aiRouter] ${options.role} failed via ${candidate.label}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  throw new Error(
    `All routes failed for ${options.role}: ${
      lastError instanceof Error ? lastError.message : "Unknown error"
    }`,
  );
};

export const generateJsonWithFallback = async <T>(
  options: Omit<TextGenerationOptions, "json">,
): Promise<T> => {
  const { content } = await generateTextWithFallback({
    ...options,
    json: true,
  });

  try {
    return JSON.parse(content) as T;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Model response did not contain a JSON object");
    }
    return JSON.parse(match[0]) as T;
  }
};

export const transcribeAudioWithFallback = async (
  audioBlob: Blob,
  fileName: string,
) => {
  const env = getAiEnvironment();
  const candidates: AudioCandidate[] = [];

  if (env.groqKey) {
    candidates.push({
      provider: "groq",
      label: "Groq Whisper Large V3 Turbo",
      url: "https://api.groq.com/openai/v1/audio/transcriptions",
      apiKey: env.groqKey,
      model: "whisper-large-v3-turbo",
    });
  }

  if (env.sambaNovaKey) {
    candidates.push({
      provider: "sambanova",
      label: "SambaNova Whisper Large V3",
      url: "https://api.sambanova.ai/v1/audio/transcriptions",
      apiKey: env.sambaNovaKey,
      model: "Whisper-Large-v3",
    });
  }

  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, fileName);
      formData.append("model", candidate.model);
      formData.append("response_format", "json");

      const response = await withTimeout(40000, () =>
        fetch(candidate.url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${candidate.apiKey}`,
          },
          body: formData,
        }),
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `${candidate.label} failed: ${response.status} ${errorText.slice(0, 280)}`,
        );
      }

      const data = await response.json();
      const text = String(data?.text || "").trim();
      if (!text) {
        throw new Error(`${candidate.label} returned empty transcription`);
      }

      console.log(
        `[aiRouter] audio transcription succeeded via ${candidate.label}`,
      );
      return {
        provider: candidate.provider,
        model: candidate.model,
        text,
      };
    } catch (error) {
      lastError = error;
      console.warn(
        `[aiRouter] audio transcription failed via ${candidate.label}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  throw new Error(
    `All audio transcription routes failed: ${
      lastError instanceof Error ? lastError.message : "Unknown error"
    }`,
  );
};
