/**
 * Shared chat constants used across the application.
 * Extracted to avoid duplication between handleSend and handleEditMessage in App.tsx.
 */

export const IMAGE_KEYWORDS = [
    "generate image",
    "create image",
    "make image",
    "generate picture",
    "create picture",
    "make picture",
    "generate photo",
    "create photo",
    "make photo",
    "create art",
    "make art",
    "generate art",
    "draw a ",
    "draw an ",
    "paint a ",
    "paint an ",
    "sketch a ",
    "sketch an ",
] as const;

export function detectImageIntent(text: string): boolean {
    const lower = text.toLowerCase();
    const isImageCommand =
        lower.startsWith("/image") || lower.startsWith("/img");
    const isKeywordMatch = IMAGE_KEYWORDS.some((keyword) =>
        lower.startsWith(keyword),
    );
    const isExplicitNonImage =
        lower.startsWith("/think") || lower.startsWith("/search");

    return (isImageCommand || isKeywordMatch) && !isExplicitNonImage;
}

export function getSystemInstruction(text: string): string {
    if (text.startsWith("[Think] "))
        return "You are in REASONING mode. You MUST output your internal thought process wrapped in <tool_call>...</tool_call> tags before your final response. The user wants to see how you think.";
    if (text.startsWith("[Search] "))
        return "You are in SEARCH mode. Please provide a comprehensive answer with sources if possible.";
    if (text.startsWith("[Canvas] "))
        return "You are in CANVAS mode. Focus on generating structured content, code, or designs.";
    return "";
}
