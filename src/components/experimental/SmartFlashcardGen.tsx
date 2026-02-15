import React, { useState, useCallback, useMemo } from "react";
import { Sparkles, Zap, ChevronRight, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Section {
    id: string;
    title: string;
    text: string;
}

interface FlashcardData {
    front: string;
    back: string;
    difficulty: "easy" | "medium" | "hard";
    source: string;
}

interface SmartFlashcardGenProps {
    sections: Section[];
    documentTitle: string;
    onSave?: (flashcards: FlashcardData[]) => void;
    className?: string;
}

function extractKeyTerms(text: string): FlashcardData[] {
    const cards: FlashcardData[] = [];
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);

    for (const sentence of sentences.slice(0, 5)) {
        const trimmed = sentence.trim();
        if (trimmed.length < 30) continue;

        // Extract definition-style patterns: "X is Y", "X refers to Y"
        const defMatch = trimmed.match(
            /^(.{5,60}?)\s+(?:is|are|refers?\s+to|means?|describes?)\s+(.+)/i,
        );
        if (defMatch) {
            cards.push({
                front: `What is ${defMatch[1].trim()}?`,
                back: defMatch[2].trim(),
                difficulty: trimmed.length > 100 ? "hard" : "medium",
                source: trimmed.slice(0, 80),
            });
            continue;
        }

        // Extract fact-based cards from sentences with numbers/dates
        if (/\d{2,}/.test(trimmed)) {
            const words = trimmed.split(/\s+/);
            const keyPhrase = words.slice(0, 4).join(" ");
            cards.push({
                front: `Complete: "${keyPhrase}..."`,
                back: trimmed,
                difficulty: "medium",
                source: trimmed.slice(0, 80),
            });
        }
    }

    return cards;
}

export const SmartFlashcardGen = React.memo(function SmartFlashcardGen({
    sections,
    documentTitle,
    onSave,
    className,
}: SmartFlashcardGenProps) {
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState<FlashcardData[]>([]);
    const [previewIdx, setPreviewIdx] = useState(0);
    const [saved, setSaved] = useState(false);

    const isRTL = useMemo(() => {
        const sample = sections[0]?.text || "";
        return /[\u0600-\u06FF\u0750-\u077F]/.test(sample);
    }, [sections]);

    const handleGenerate = useCallback(() => {
        setGenerating(true);
        setSaved(false);

        // Simulate processing delay for UX feel
        requestAnimationFrame(() => {
            const allCards: FlashcardData[] = [];

            for (const section of sections) {
                const cards = extractKeyTerms(section.text);
                allCards.push(...cards);
            }

            // Deduplicate and cap at 20
            const unique = allCards
                .filter(
                    (card, i, arr) =>
                        arr.findIndex((c) => c.front === card.front) === i,
                )
                .slice(0, 20);

            setGenerated(unique);
            setPreviewIdx(0);
            setGenerating(false);
        });
    }, [sections]);

    const handleSave = useCallback(() => {
        if (onSave && generated.length > 0) {
            onSave(generated);
            setSaved(true);
        }
    }, [onSave, generated]);

    const currentCard = generated[previewIdx];
    const difficultyColors = {
        easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        hard: "text-red-400 bg-red-500/10 border-red-500/20",
    };

    return (
        <div
            className={cn(
                "rounded-2xl bg-white/[0.03] border border-white/5 p-6 contain-content",
                className,
            )}
            dir={isRTL ? "rtl" : undefined}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
                        <Sparkles className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">
                            Smart Flashcard Generator
                        </h3>
                        <p className="text-[11px] text-white/40">
                            Auto-gen from "{documentTitle}"
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={generating || sections.length === 0}
                    className="h-9 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold text-xs border-0 shadow-lg shadow-amber-500/20"
                >
                    {generating ? (
                        <RotateCcw className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Zap className="h-4 w-4 fill-current" />
                            {generated.length > 0 ? "Regenerate" : "Generate"}
                        </>
                    )}
                </Button>
            </div>

            {/* Empty State */}
            {generated.length === 0 && !generating && (
                <div className="text-center py-8 opacity-60">
                    <Sparkles className="h-8 w-8 mx-auto mb-3 text-white/20" />
                    <p className="text-xs text-white/30">
                        {sections.length === 0
                            ? "No document sections loaded"
                            : `${sections.length} sections ready — hit Generate`}
                    </p>
                </div>
            )}

            {/* Card Preview */}
            {currentCard && (
                <div className="space-y-4">
                    {/* Card */}
                    <div className="relative rounded-2xl bg-white/[0.04] border border-white/8 p-5 min-h-[120px]">
                        <div className="flex items-start justify-between mb-3">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                                Card {previewIdx + 1} / {generated.length}
                            </span>
                            <span
                                className={cn(
                                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                                    difficultyColors[currentCard.difficulty],
                                )}
                            >
                                {currentCard.difficulty}
                            </span>
                        </div>

                        <p className="text-sm font-medium text-white mb-2">
                            {currentCard.front}
                        </p>
                        <p className="text-xs text-white/60 leading-relaxed">
                            {currentCard.back}
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {generated.slice(0, 10).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPreviewIdx(i)}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all",
                                        i === previewIdx
                                            ? "w-6 bg-amber-400"
                                            : "w-1.5 bg-white/10 hover:bg-white/20",
                                    )}
                                />
                            ))}
                            {generated.length > 10 && (
                                <span className="text-[10px] text-white/30 ms-1">
                                    +{generated.length - 10}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                    setPreviewIdx((p) =>
                                        p > 0 ? p - 1 : generated.length - 1,
                                    )
                                }
                                className="h-8 w-8 p-0 rounded-lg hover:bg-white/5"
                            >
                                <ChevronRight className="h-4 w-4 rotate-180 text-white/40" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                    setPreviewIdx((p) =>
                                        p < generated.length - 1 ? p + 1 : 0,
                                    )
                                }
                                className="h-8 w-8 p-0 rounded-lg hover:bg-white/5"
                            >
                                <ChevronRight className="h-4 w-4 text-white/40" />
                            </Button>
                        </div>
                    </div>

                    {/* Save Button */}
                    {onSave && (
                        <Button
                            onClick={handleSave}
                            disabled={saved}
                            className={cn(
                                "w-full h-11 rounded-xl font-semibold text-sm transition-all",
                                saved
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10",
                            )}
                        >
                            {saved ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Saved {generated.length} Flashcards
                                </>
                            ) : (
                                `Save ${generated.length} Flashcards to Study Deck`
                            )}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
});
