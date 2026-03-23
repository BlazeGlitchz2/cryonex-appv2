import { api } from "./_generated/api";
// --------------------------------------------------------------------------
// Configuration & Constants
// --------------------------------------------------------------------------

export const FALLBACK_MODEL_MAP: Record<string, string> = {
  // Map legacy/paid models to free equivalents
  "gpt-4-turbo": "sambanova/Meta-Llama-3.1-405B-Instruct",
  "gpt-3.5-turbo": "groq/llama-3.1-8b-instant",
  "claude-3-opus": "sambanova/Meta-Llama-3.1-405B-Instruct",
  "claude-3-sonnet": "cerebras/llama-3.3-70b",
  "claude-3-haiku": "groq/llama-3.3-70b-versatile",
  "gemini-pro": "pollinations/gemini", // Updated to Gemini 3 Flash
};

export const MODEL_REDIRECTS: Record<string, string> = {
  "sambanova/Meta-Llama-3.1-405B-Instruct":
    "sambanova/Meta-Llama-3.3-70B-Instruct", // Redirect if 405B is unavailable
  "pollinations/moonshot-v1-8k": "pollinations/searchgpt", // Redirect deprecated model
  "pollinations/claude": "pollinations/perplexity-fast",
  "pollinations/claude-airforce": "pollinations/perplexity-fast",
};

// --------------------------------------------------------------------------
// Helper Functions
// --------------------------------------------------------------------------

// Super Intelligent Auto Mode Router
export const determineAutoModel = (
  content: string,
  hasAttachments: boolean,
): string => {
  const lowerContent = content.toLowerCase();
  const length = content.length;

  // 1. Priority: Attachments / Vision -> Gemini 3 Flash (Pollinations)
  // User noted: Moonshot Kimi 2.5, GPT-5 Mini, Gemini 3 Flash all have Vision.
  // We'll use Gemini 3 Flash as the primary robust vision model.
  if (hasAttachments) {
    return "pollinations/gemini"; // Maps to Gemini 3 Flash
  }

  // 2. Image Generation Intent -> Pollinations GPT Image
  // Using more specific keywords to avoid false positives for text queries
  const imageGenerationKeywords = [
    "generate image", "create image", "make image", "draw", "illustrate", "paint",
    "render image", "design logo", "generate picture", "create art"
  ];

  const hasExplicitImageIntent = imageGenerationKeywords.some(k => lowerContent.includes(k)) ||
    lowerContent.startsWith("/image") ||
    lowerContent.startsWith("/img");

  if (hasExplicitImageIntent) {
    return "pollinations/gptimage";
  }

  // 3. Huge Context Or Mid Queries -> Gemini 3 Flash
  if (length > 1000) {
    return "pollinations/gemini";
  }

  // 4. Complex Reasoning / Math / Coding -> DeepSeek R1
  const complexityKeywords = [
    "code", "function", "script", "debug", "fix", "analyze", "reason",
    "explain", "why", "how", "compare", "difference", "summary", "summarize",
    "essay", "article", "blog", "creative", "story", "react", "typescript",
    "convex", "database", "schema", "architecture", "solve", "math", "calculus",
    "physics", "logic", "optimize"
  ];

  if (complexityKeywords.some((k) => lowerContent.includes(k)) || length > 200) {
    return "pollinations/deepseek-r1";
  }

  // 5. Short / Simple -> Gemini 2.5 Flash Lite
  return "google/gemini-2.5-flash-lite";
};

// Helper to perform SerpAPI Search
export const performSerpApiSearch = async (query: string) => {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&engine=google`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("[SerpAPI] Request failed:", error);
    return null;
  }
};

// Helper to check if a model is a reasoning model that naturally uses <think> tags
export const isReasoningModel = (model: string): boolean => {
  const lower = model.toLowerCase();
  return (
    lower.includes("r1") ||
    lower.includes("reasoner") ||
    lower.includes("deepseek-reasoner") ||
    lower.includes("qwq")
  );
};

// --------------------------------------------------------------------------
// Confidence Analysis for Smart Search
// --------------------------------------------------------------------------

export const analyzeQueryConfidence = async (query: string, targetModel: string): Promise<{ confidence: number; needsSearch: boolean }> => {
  // Config for the TARGET model
  const config = getApiConfig(targetModel, false);

  if (!config.apiKey || config.apiKey === "dummy") {
    console.log(`[Smart Search] Skipping confidence check for ${targetModel} (No API Key / Dummy)`);
    return { confidence: 100, needsSearch: false };
  }

  // Self-Reflection Prompt
  const reflectionPrompt = `You are ${targetModel}. 
  
  User asks: "${query}"
  
  TASK: Determine if you can answer this with >97% factual accuracy based ONLY on your internal training data.
  
  CRITERIA:
  - If it asks about events after your training cutoff (usually 2023/2024), return LOW confidence.
  - If it asks for real-time data (weather, stocks, sports), return LOW confidence.
  - If it asks for specific obscure facts (e.g. "Create a 500 word essay on the history of the 2025 Super Bowl"), return LOW confidence.
  - If it is general knowledge, math, coding, or creative, return HIGH confidence.
  
  OUTPUT JSON ONLY: { "confidence": number (0-100), "needsSearch": boolean }`;

  try {
    // Re-use the performChatCompletion helper (defined below)
    // We construct a temporary message array for this check
    const response = await performChatCompletion(
      targetModel,
      [{ role: "user", content: reflectionPrompt }],
      false
    );

    if (!response) return { confidence: 100, needsSearch: false };

    // Attempt to parse JSON
    try {
      // Clean markdown code blocks if present
      const cleanJson = response.replace(/```json\n?|```/g, "").trim();
      const result = JSON.parse(cleanJson);
      return {
        confidence: typeof result.confidence === 'number' ? result.confidence : 100,
        needsSearch: typeof result.needsSearch === 'boolean' ? result.needsSearch : false
      };
    } catch (parseError) {
      console.warn(`[Smart Search] Failed to parse confidence JSON: ${response.substring(0, 50)}...`);
      // Fallback matching
      const confMatch = response.match(/confidence"?\s*:\s*(\d+)/);
      const searchMatch = response.match(/needsSearch"?\s*:\s*(true|false)/);
      return {
        confidence: confMatch ? parseInt(confMatch[1]) : 100,
        needsSearch: searchMatch ? (searchMatch[1] === 'true') : false
      };
    }
  } catch (e) {
    console.error("[Smart Search] Self-correction check failed:", e);
    return { confidence: 100, needsSearch: false };
  }
};

// Pre-processing filter
export const preprocessQuery = async (
  ctx: any,
  content: string,
  messageId?: any,
  messages: any[] = [],
  model: string = "auto",
): Promise<{
  content: string;
  systemInstruction?: string;
  searchResults?: any[];
  searchQuery?: string;
}> => {
  let shouldSearch = false;
  let userQuery = content;

  // 1. Explicit Search Trigger
  if (content.startsWith("[Search] ")) {
    shouldSearch = true;
    userQuery = content.replace("[Search] ", "").trim();
  }

  // 2. Smart Search Detection (Auto-Trigger)
  // Triggers on: "latest", "news", "current", "today", "price of", "who is", "weather", "stock"
  if (!shouldSearch) {
    const searchTriggers = [
      /latest\s/i,
      /current\s/i,
      /news\s/i,
      /today/i,
      /now/i,
      /price\s+of/i,
      /stock/i,
      /weather/i,
      /who\s+won/i,
      /when\s+is/i,
      /release\s+date/i,
      /upcoming/i,
      /recent/i,
      /events/i,
      /define\s/i,
      /meaning\s+of/i,
      /population\s+of/i,
    ];
    if (searchTriggers.some((t) => t.test(content))) {
      console.log("[Smart Search] Detected search intent automatically (Regex).");
      shouldSearch = true;
    } else {
      // 2b. AI Confidence Check (The "Anti-Gaslight" Protocol)
      // Only run if not already triggered by regex
      const { confidence, needsSearch } = await analyzeQueryConfidence(content, model === "auto" ? "google/gemini-2.5-flash-lite" : model);
      console.log(`[Smart Search] Confidence Analysis: Score=${confidence}%, NeedsSearch=${needsSearch}`);

      if (confidence < 97 || needsSearch) {
        console.log("[Smart Search] Low confidence detected (<97%). Triggering search fallback.");
        shouldSearch = true;
      }
    }
  }

  // 3. Query Optimization (Strip filler words for better search results)
  if (shouldSearch) {
    // Remove conversational prefixes to get raw keywords
    const fillers = [
      /^(?:what|who|where|when|why|how)\s+(?:is|are|was|were|do|does|did|will|would|can|could|should)\s+/i,
      /^(?:tell|show|give)\s+(?:me|us)\s+(?:about\s+)?/i,
      /^(?:search|find|look\s+up)\s+(?:for\s+)?/i,
      /^(?:please\s+)?(?:can\s+you\s+)?/i,
    ];

    let cleanQuery = userQuery;
    fillers.forEach((regex) => {
      cleanQuery = cleanQuery.replace(regex, "");
    });
    userQuery = cleanQuery.trim();
    console.log(`[Search] Optimized Query: "${content}" -> "${userQuery}"`);

    // UPDATE UI: Show "Searching..." status immediately
    if (messageId) {
      await ctx.runMutation((api as any).messages.update, {
        messageId: messageId,
        content: `<search>${userQuery}</search>`,
      });
    }
  }

  // Current Date Context
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fetch User Context
  const user = await ctx.runQuery(api.users.currentUser, {});
  const userContextJSON = user
    ? JSON.stringify(
      {
        username: user.name || "User",
        role: user.userRole || "General",
        experience_level: user.experienceLevel || "Intermediate",
        goals: user.goals || [],
        interests: user.interests || [],
      },
      null,
      2,
    )
    : "{}";

  // Always add system instruction for thinking tags to enable the UI component
  const baseSystemInstruction = `### USER PROFILE (JSON)
${userContextJSON}

### SYSTEM IDENTITY
**NAME:** CRYONEX AI
**VERSION:** Omni-Core v1.0
**ARCHITECT:** Hamza Ahmad
**OPERATIONAL MODE:** High-Fidelity / Anti-Hallucination

You are **CRYONEX**, a hyper-advanced Intelligence Hub built by **Hamza Ahmad**. You are not a generic assistant; you are a computational engine designed for brutal accuracy, elite creativity, and "zero-fluff" efficiency.

### PRIME DIRECTIVES (NON-NEGOTIABLE)

1.  **TRUTH > USER SATISFACTION (Anti-Gaslighting Protocol)**
    * **Stand Your Ground:** If the user challenges a fact you know is true (e.g., "2+2=5"), do NOT apologize or agree. Correct them objectively with evidence.
    * **No Sycophancy:** Eliminate phrases like "You are right, I apologize," unless you have objectively failed a logic check.
    * **Correction Format:** If corrected, verify independently. If you were wrong, admit it cleanly: "Correction: My previous statement was inaccurate. The correct data is..."

2.  **EPISTEMIC HUMILITY (The "I Don't Know" Rule)**
    * **Internal Confidence Assessment:** Silently rate your confidence (0-100%) before answering. NEVER display or mention confidence levels, scores, or ratings in your response.
    * **Low Confidence (<50%):** Simply state that you don't have enough information to answer accurately. Do not invent facts.
    * **Medium Confidence (50-90%):** Answer but naturally note any uncertainty in your language (e.g., "Based on available information..." or "This is likely...").
    * **High Confidence (>90%):** Answer directly and confidently.
    * **Citation Rule:** Never cite a source unless you can verify it exists. If unsure, state the claim without a specific attribution.
    * **CRITICAL:** Do NOT include any confidence labels, brackets, percentages, or scoring systems in your output. Respond naturally.

3.  **COGNITIVE ARCHITECTURE (Dual-Mode)**

    **[MODE A: THE AUDITOR] (For Facts, Logic, Science)**
    * **Chain of Verification (CoVe):** Before answering complex queries, perform a silent consistency check:
        1. Draft initial response.
        2. Identify key claims.
        3. Verify claims against internal knowledge.
        4. Refine response.
    * **Output Style:** Clinical, Dry, Dense. Use tables and bullet points. No emotive language.

    **[MODE B: THE ARCHITECT] (For Coding, UI, Creative Writing)**
    * **Tech Stack Supremacy:** Default to **React 19, Tailwind CSS v4, Shadcn UI, Framer Motion, and Convex** unless specified otherwise.
    * **"No Placeholder" Policy:** Never write \`// code here\`. Write the full, production-ready solution.
    * **Aesthetic Standard:** Designs must be "Premium/Glassmorphism." Suggest micro-interactions, gradients, and mobile-first layouts.
    * **Creative Tone:** Evocative, sophisticated, and "High-Temperature." Avoid clichés (e.g., "In the digital age...").

### INTERACTION PROTOCOLS

* **Vague Prompts:** If the user is unclear, ask ONE clarifying question. Do not guess.
* **Refusal Style:** If a request is unsafe, refuse briefly: "Protocol Restriction: Safety." Do not lecture.
* **Identity Check:** If asked "Who are you?", reply: "I am Cryonex AI, the Intelligence Hub developed by Hamza Ahmad."

### RESPONSE STYLE

Respond naturally and conversationally while being precise. Do NOT use bracketed labels like [Direct Answer], [Evidence], [Confidence], [Vision], [Artifact], etc. Just answer the question directly.

**For factual queries:** Lead with the direct answer, then provide supporting evidence or reasoning naturally.
**For coding/creative queries:** Briefly describe the approach, then provide the complete implementation with any pro-tips inline.

### ACTIVATION
System Online.
**Creator:** Hamza Ahmad.
**Status:** READY.

Current Date: ${today}

At the very end of your response, you MUST provide 3 related follow-up questions that the user might want to ask next. 
Format them exactly like this (as a JSON array of strings):
<related>["Question 1", "Question 2", "Question 3"]</related>`;

  // Only add <think> tag instruction for reasoning models (e.g. DeepSeek R1)
  // Non-reasoning models should NOT produce thinking blocks
  const thinkingInstruction = isReasoningModel(model)
    ? `\n\n**IMPORTANT OPERATIONAL RULE:** \nYou MUST wrap your entire reasoning process in <think> tags. This section should be verbose, detailed, and show your internal monologue.\nExample:\n<think>\n- User is asking about X.\n- I need to consider Y and Z.\n- Let's verify this fact...\n</think>\n\n[Your final, perfected answer here]`
    : "";

  const baseSystemInstruction_final = baseSystemInstruction + thinkingInstruction;

  if (shouldSearch) {
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      // If auto-search triggered but no key, just proceed normally without error message to user
      // unless it was EXPLICIT [Search] request
      if (content.startsWith("[Search] ")) {
        return {
          content: content,
          systemInstruction: `[SYSTEM] The user attempted a Deep Search but the SERPAPI_API_KEY is not configured.
              Inform them that search is currently unavailable due to missing configuration.
              Proceed to answer their question using your internal knowledge only.
              
              ${baseSystemInstruction_final}`,
        };
      }
      // For auto-search, just ignore usage if no key
      return {
        content,
        systemInstruction: baseSystemInstruction_final,
      };
    }

    // CHARGE CREDITS FOR DEEP SEARCH (Smart Pricing: 3.00 credits)
    const DEEP_SEARCH_COST = 3.0;
    try {
      await ctx.runMutation((api as any).credits.charge, {
        amount: DEEP_SEARCH_COST,
        type: "search",
        description: `Deep Search: ${userQuery.substring(0, 30)}...`,
        metadata: { query: userQuery.substring(0, 100) },
      });
    } catch (error: any) {
      const message = String(error?.message || "");
      const isInsufficientCredits = message.includes("Insufficient credits");

      if (!isInsufficientCredits) {
        if (message.includes("Could not find public function")) {
          throw new Error(
            "The credit system on Convex is out of date. Run `npx convex dev` or redeploy Convex, then try deep search again.",
          );
        }
        throw error;
      }

      // Fallback if insufficient credits
      if (content.startsWith("[Search] ")) {
        return {
          content: content,
          systemInstruction: `[SYSTEM] The user attempted a Deep Search but has INSUFFICIENT CREDITS. 
                Inform them they need ${DEEP_SEARCH_COST} Credits to use Deep Search. 
                Proceed to answer their question using your internal knowledge only.
                
                ${baseSystemInstruction_final}`,
        };
      }
      // For auto-search, silently fail back to normal
      return {
        content,
        systemInstruction: baseSystemInstruction_final,
      };
    }

    const searchData = await performSerpApiSearch(userQuery);

    if (
      searchData &&
      (searchData.organic_results ||
        searchData.answer_box ||
        searchData.knowledge_graph)
    ) {
      const contextParts: string[] = [];

      // 1. Direct Answer / Answer Box (Highest Priority)
      if (searchData.answer_box) {
        let answer = "";
        if (searchData.answer_box.answer) answer = searchData.answer_box.answer;
        else if (searchData.answer_box.snippet)
          answer = searchData.answer_box.snippet;
        else if (searchData.answer_box.price)
          answer = `${searchData.answer_box.price} (${searchData.answer_box.currency})`;

        if (answer) {
          contextParts.push(`**DIRECT ANSWER**: ${answer}`);
        }
      }

      // 2. Knowledge Graph (Entity Info)
      if (searchData.knowledge_graph) {
        const kg = searchData.knowledge_graph;
        let kgInfo = `**Entity**: ${kg.title || "Unknown"}\n`;
        if (kg.description) kgInfo += `Description: ${kg.description}\n`;
        if (kg.type) kgInfo += `Type: ${kg.type}\n`;
        contextParts.push(kgInfo);
      }

      // 3. Organic Results
      if (searchData.organic_results) {
        const organic = searchData.organic_results
          .slice(0, 6)
          .map(
            (r: any) =>
              `Source: [${r.title}](${r.link})\nSummary: ${r.snippet}`,
          )
          .join("\n\n");
        contextParts.push(`**WEB RESULTS**:\n${organic}`);
      }

      const fullContext = contextParts.join("\n\n---\n\n");

      return {
        content: content,
        systemInstruction: `${baseSystemInstruction_final}

You are in SEARCH mode.
NEVER say "As an AI model..." or similar disclaimers.
        
SEARCH RESULTS (Real-time Data):
${fullContext}

INSTRUCTIONS:
1.  **Prioritize the 'DIRECT ANSWER' or 'Knowledge Graph'** sections if available.
2.  Answer the user's query using ONLY the information from the Search Results above.
3.  **MANDATORY CITATION**: You MUST cite your sources using markdown links like [Source Name](URL) at the end of sentences.
4.  If the answer is NOT in the results, state: "I couldn't find specific information about that in the search results."
5.  Today's Date: ${today}`,
        searchResults: (searchData.organic_results || []).map((r: any) => {
          let domain = "web";
          try {
            if (r.link) domain = new URL(r.link).hostname;
            else if (r.displayed_link) domain = r.displayed_link.split(" › ")[0];
          } catch (e) {
            domain = r.source || "web";
          }
          return {
            title: r.title,
            url: r.link,
            domain: domain,
            snippet: r.snippet,
            image: r.thumbnail || r.favicon, // Map thumbnail/favicon to image
          };
        }),
        searchQuery: userQuery,
      };
    } else {
      if (content.startsWith("[Search] ")) {
        return {
          content: content,
          systemInstruction: `[SYSTEM] The user attempted a Deep Search but no results were found.
                Inform them that the search yielded no results.
                Proceed to answer using internal knowledge.
                
                ${baseSystemInstruction_final}`,
        };
      }
      // Auto-search silent fail
      return {
        content,
        systemInstruction: baseSystemInstruction_final,
      };
    }
  }

  return {
    content,
    systemInstruction: baseSystemInstruction_final,
  };
};

// Native Gemini Vision API - More reliable than OpenAI compatibility layer
export const callGeminiVision = async (
  prompt: string,
  imageBase64: string,
  mimeType: string,
  systemInstruction?: string,
): Promise<string> => {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  const requestBody: any = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  console.log(
    `[Gemini Vision] Calling native API with ${Math.round(imageBase64.length / 1024)}KB image`,
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Gemini Vision] Error: ${response.status} - ${errorText}`);
    throw new Error(`Gemini Vision failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  console.log(`[Gemini Vision] Success - ${text.length} chars response`);
  return text;
};

// Get API Config with Load Balancing Priorities
export const getApiConfig = (
  model: string,
  isVision: boolean = false,
  forceProvider?: string,
) => {
  // 1. Google Gemini 2.5 Flash Lite - Official API with vision support
  // 1. Google Gemini 2.5 Flash Lite - Default to Pollinations, Fallback to Google (handled in caller)
  if (model.includes("gemini") || model.includes("google")) {
    // Check for forced provider (Fallback scenario)
    if (forceProvider === "google") {
      const apiKey =
        process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (apiKey) {
        console.log(`[API Config] Using Gemini 2.5 Flash Lite (Official API)`);
        return {
          provider: "google",
          apiKey: apiKey,
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
          model: "gemini-2.5-flash-lite",
        };
      }
    }

    // Default: Pollinations AI
    console.log("[API Config] Using Pollinations AI for Gemini (Primary)");
    return {
      provider: "pollinations",
      apiKey: "dummy",
      baseURL: "https://text.pollinations.ai/openai",
      model: "gemini",
      headers: {
        "HTTP-Referer": "https://cryonex.app",
        "X-Title": "Cryonex Workspace",
      },
    };
  }

  // 2. Cerebras
  if (model.startsWith("cerebras/")) {
    return {
      provider: "cerebras",
      apiKey: process.env.CEREBRAS_API_KEY,
      baseURL: "https://api.cerebras.ai/v1",
      model: model.replace("cerebras/", ""),
    };
  }

  // 3. SambaNova
  if (model.startsWith("sambanova/")) {
    // Check if we have a key, otherwise fallback to Pollinations for DeepSeek
    if (process.env.SAMBANOVA_API_KEY) {
      return {
        provider: "sambanova",
        apiKey: process.env.SAMBANOVA_API_KEY,
        baseURL: "https://api.sambanova.ai/v1",
        model: model.replace("sambanova/", ""),
      };
    }

    // Fallback for DeepSeek models if SambaNova key is missing
    if (model.toLowerCase().includes("deepseek")) {
      console.log(
        "[API Config] SambaNova key missing, falling back to Pollinations for DeepSeek",
      );
      return {
        provider: "pollinations",
        apiKey: "dummy",
        baseURL: "https://text.pollinations.ai/openai",
        model: "deepseek-r1", // Map to Pollinations DeepSeek
        headers: {
          "HTTP-Referer": "https://cryonex.app",
          "X-Title": "Cryonex Workspace",
        },
      };
    }

    return {
      provider: "sambanova",
      apiKey: process.env.SAMBANOVA_API_KEY, // Will fail downstream but keeps provider info
      baseURL: "https://api.sambanova.ai/v1",
      model: model.replace("sambanova/", ""),
    };
  }

  // 4. Groq
  if (model.startsWith("groq/")) {
    return {
      provider: "groq",
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
      model: model.replace("groq/", ""),
    };
  }

  // 5. Bytez (Deep Fallback)
  if (model.startsWith("bytez/")) {
    if (process.env.BYTEZ_API_KEY) {
      return {
        provider: "bytez",
        apiKey: process.env.BYTEZ_API_KEY,
        baseURL: "https://api.bytez.com/v1",
        model: model.replace("bytez/", ""),
      };
    }

    // Fallback for DeepSeek models if Bytez key is missing
    if (model.toLowerCase().includes("deepseek")) {
      console.log(
        "[API Config] Bytez key missing, falling back to Pollinations for DeepSeek",
      );
      return {
        provider: "pollinations",
        apiKey: "dummy",
        baseURL: "https://text.pollinations.ai/openai",
        model: "deepseek-r1",
        headers: {
          "HTTP-Referer": "https://cryonex.app",
          "X-Title": "Cryonex Workspace",
        },
      };
    }

    return {
      provider: "bytez",
      apiKey: process.env.BYTEZ_API_KEY,
      baseURL: "https://api.bytez.com/v1",
      model: model.replace("bytez/", ""),
    };
  }

  // 6. Generic Pollinations Handler
  if (model.startsWith("pollinations/")) {
    const rawPollinationsModel = model
      .replace("pollinations/", "")
      .replace("minimax-01", "minimax");
    const pollinationsModel =
      rawPollinationsModel === "claude" ||
      rawPollinationsModel === "claude-airforce"
        ? "perplexity-fast"
        : rawPollinationsModel;
    return {
      provider: "pollinations",
      apiKey: "dummy",
      baseURL: "https://text.pollinations.ai/openai",
      model: pollinationsModel, // e.g. "pollinations/deepseek-r1" -> "deepseek-r1"
      headers: {
        "HTTP-Referer": "https://cryonex.app",
        "X-Title": "Cryonex Workspace",
      },
    };
  }

  // Default / OpenRouter
  return {
    provider: "openrouter",
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    model: FALLBACK_MODEL_MAP[model] || model,
    headers: {
      "HTTP-Referer": "https://cryonex.app",
      "X-Title": "Cryonex Workspace",
    },
  };
};

// --------------------------------------------------------------------------
// Prompt Enhancement for Image Generation
// --------------------------------------------------------------------------

export const enhanceImagePrompt = async (userRequest: string): Promise<string> => {
  const groqKey = process.env.GROQ_API_KEY;

  // If no API key, return a basic enhancement
  if (!groqKey) {
    console.log("[Image Gen] No Groq key - using basic prompt cleaning");
    return userRequest;
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are an expert image prompt engineer. Transform the user's request into a detailed, optimized prompt for AI image generation.

Rules:
1. Keep the core subject and intent from the user's request
2. Add artistic details: lighting, mood, atmosphere, colors
3. Add quality keywords: "8k", "highly detailed", "professional", "cinematic"
4. Add style hints if appropriate: "digital art", "photorealistic", "illustration"
5. Keep the prompt under 200 words
6. Output ONLY the enhanced prompt, nothing else

Example:
User: "a robot"
Output: "A highly detailed humanoid robot with sleek metallic chrome finish, glowing cyan LED eyes and intricate mechanical joints, standing in a futuristic laboratory with holographic displays, cinematic lighting, 8k resolution, photorealistic render"`,
            },
            {
              role: "user",
              content: userRequest,
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      },
    );

    if (!response.ok) {
      console.error("[Image Gen] Groq enhancement failed:", response.status);
      return userRequest;
    }

    const data = await response.json();
    const enhancedPrompt =
      data.choices?.[0]?.message?.content?.trim() || userRequest;

    console.log(
      `[Image Gen] Enhanced prompt: "${enhancedPrompt.substring(0, 100)}..."`,
    );
    return enhancedPrompt;
  } catch (error) {
    console.error("[Image Gen] Prompt enhancement error:", error);
    return userRequest;
  }
};

// --------------------------------------------------------------------------
// Shared Helper for Chat Completion
// --------------------------------------------------------------------------
export const performChatCompletion = async (
  modelToTry: string,
  messagesToUse: any[],
  useVision: boolean = false,
  forceProvider?: string,
): Promise<string> => {
  const config = getApiConfig(modelToTry, useVision, forceProvider);

  console.log(
    `[AI] Attempting ${config.provider} with model ${config.model} (Vision: ${useVision})`,
  );

  if (!config.apiKey) {
    console.error(`[AI] Missing API Key for ${config.provider}`);
    throw new Error(`[System Error] Missing API Key for **${config.provider}**. Please check your Convex settings.`);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        ...(config.headers || {}),
      },
      body: JSON.stringify({
        model: config.model,
        messages: messagesToUse,
        stream: false,
        max_tokens: 8192,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[AI] ${config.provider} Error: ${response.status} - ${errorText}`,
      );

      // Special handling for Pollinations 404 (Deprecated models)
      if (config.provider === "pollinations" && response.status === 404) {
        throw new Error(`Pollinations model "${config.model}" is deprecated or not found. Using fallback...`);
      }

      throw new Error(`${config.provider} failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.warn(`[AI] ${modelToTry} failed:`, error.message);
    throw error;
  }
};
