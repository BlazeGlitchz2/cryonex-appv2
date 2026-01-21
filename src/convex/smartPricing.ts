"use node";

/**
 * Smart Pricing Module for Cryonex Credits
 * 
 * This module provides intelligent, granular pricing for all AI actions
 * based on model tier, input/output length, and feature usage.
 */

// Model tier costs (base cost in credits)
export const MODEL_COSTS: Record<string, number> = {
    // Tier 1: Free, instant (0.05 credits)
    "groq/llama-3.1-8b-instant": 0.05,

    // Tier 2: Free, fast (0.08-0.12 credits)
    "groq/llama-3.3-70b-versatile": 0.08,
    "cerebras/llama-3.3-70b": 0.10,
    "google/gemini-1.5-flash": 0.12,

    // Tier 3: Free, heavy (0.15-0.25 credits)
    "sambanova/Meta-Llama-3.3-70B-Instruct": 0.15,
    "sambanova/Meta-Llama-3.1-405B-Instruct": 0.25,

    // Tier 4: Reasoning models (0.50 credits)
    "deepseek-reasoner": 0.50,
    "deepseek/deepseek-r1": 0.50,

    // Tier 5: Premium paid APIs (1.00+ credits)
    "gpt-4-turbo": 1.00,
    "gpt-4o": 0.80,
    "gpt-3.5-turbo": 0.20,
    "claude-3-opus": 1.50,
    "claude-3-sonnet": 0.60,
    "claude-3-haiku": 0.25,

    // Default for unknown models
    "default": 0.15,
};

// Feature add-on costs (additive)
export const FEATURE_COSTS: Record<string, number> = {
    vision: 0.25,           // Image analysis
    code_execution: 0.15,   // Running code
    deep_thinking: 0.10,    // Extended reasoning with <think> tags
    web_search_lite: 0.20,  // Basic web lookup
    file_processing: 0.15,  // Processing attachments
};

// Study feature costs
export const STUDY_COSTS: Record<string, number> = {
    flashcards_10: 2.00,    // Generate 10 flashcards
    flashcards_20: 3.50,    // Generate 20 flashcards
    quiz_10: 3.00,          // Generate 10-question quiz
    notes_generate: 2.50,   // Generate study notes
    summary_generate: 1.50, // Generate summary
    simple_summary: 1.00,   // Generate dyslexia-friendly summary
    podcast_script: 2.00,   // Generate podcast script
    concept_map: 1.50,      // Generate concept map
    full_study_pack: 12.00, // All study materials combined (discount)
    pdf_processing: 5.00,   // PDF extraction and chunking
};

// Search costs
export const SEARCH_COSTS: Record<string, number> = {
    cached: 0.50,      // Use cached results
    quick: 1.00,       // Quick search, 3 sources
    standard: 3.00,    // Standard search, 5 sources
    deep: 10.00,       // Deep research, 10+ sources
};

/**
 * Calculate the base cost for a model
 */
export function getModelCost(model: string): number {
    // Check for exact match
    if (MODEL_COSTS[model]) {
        return MODEL_COSTS[model];
    }

    // Check for partial matches (e.g., "405B" in model name)
    const lowerModel = model.toLowerCase();

    if (lowerModel.includes("405b")) return 0.25;
    if (lowerModel.includes("70b")) return 0.10;
    if (lowerModel.includes("8b")) return 0.05;
    if (lowerModel.includes("reasoner") || lowerModel.includes("-r1")) return 0.50;
    if (lowerModel.includes("opus")) return 1.50;
    if (lowerModel.includes("sonnet")) return 0.60;
    if (lowerModel.includes("haiku")) return 0.25;
    if (lowerModel.includes("gpt-4")) return 1.00;
    if (lowerModel.includes("gemini")) return 0.12;

    return MODEL_COSTS["default"];
}

/**
 * Calculate length multiplier based on token count
 */
export function getLengthMultiplier(totalTokens: number): number {
    if (totalTokens > 5000) return 2.0;
    if (totalTokens > 2000) return 1.5;
    if (totalTokens > 500) return 1.25;
    return 1.0;
}

/**
 * Estimate token count from text (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

/**
 * Calculate the total cost for a chat message
 */
export function calculateChatCost(
    model: string,
    inputText: string,
    outputTokensEstimate: number = 0,
    features: string[] = []
): number {
    // Base model cost
    let cost = getModelCost(model);

    // Calculate token-based multiplier
    const inputTokens = estimateTokens(inputText);
    const totalTokens = inputTokens + outputTokensEstimate;
    cost *= getLengthMultiplier(totalTokens);

    // Add feature costs
    for (const feature of features) {
        cost += FEATURE_COSTS[feature] || 0;
    }

    // Round to 2 decimal places and ensure minimum of 0.01
    return Math.max(0.01, Math.round(cost * 100) / 100);
}

/**
 * Calculate the cost for study material generation
 */
export function calculateStudyCost(
    action: keyof typeof STUDY_COSTS | string
): number {
    return STUDY_COSTS[action as keyof typeof STUDY_COSTS] || STUDY_COSTS["notes_generate"];
}

/**
 * Calculate the cost for web search
 */
export function calculateSearchCost(
    searchType: keyof typeof SEARCH_COSTS
): number {
    return SEARCH_COSTS[searchType] || SEARCH_COSTS["standard"];
}

/**
 * Get a human-readable cost breakdown
 */
export function getCostBreakdown(
    model: string,
    inputText: string,
    features: string[] = []
): { base: number; multiplier: number; features: Record<string, number>; total: number } {
    const base = getModelCost(model);
    const multiplier = getLengthMultiplier(estimateTokens(inputText));

    const featureCosts: Record<string, number> = {};
    let featureTotal = 0;
    for (const feature of features) {
        const cost = FEATURE_COSTS[feature] || 0;
        if (cost > 0) {
            featureCosts[feature] = cost;
            featureTotal += cost;
        }
    }

    const total = Math.max(0.01, Math.round((base * multiplier + featureTotal) * 100) / 100);

    return {
        base,
        multiplier,
        features: featureCosts,
        total,
    };
}

/**
 * Detect features from message content and attachments
 */
export function detectFeatures(
    content: string,
    hasAttachments: boolean,
    model: string
): string[] {
    const features: string[] = [];
    const lowerContent = content.toLowerCase();
    const lowerModel = model.toLowerCase();

    // Vision/attachment processing
    if (hasAttachments) {
        features.push("vision");
    }

    // Deep thinking for reasoning models
    if (lowerModel.includes("reasoner") || lowerModel.includes("-r1") || lowerModel.includes("think")) {
        features.push("deep_thinking");
    }

    // Code execution indicators
    if (lowerContent.includes("run this code") || lowerContent.includes("execute")) {
        features.push("code_execution");
    }

    // Web search indicators
    if (content.startsWith("[Search]") || lowerContent.includes("search the web")) {
        features.push("web_search_lite");
    }

    return features;
}
