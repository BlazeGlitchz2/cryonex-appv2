export interface PDFAnalysis {
  concepts: string[];
  keyTopics: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedReadTime: number;
  relationships: Array<{ from: string; to: string; type: string }>;
}

export function analyzePDFContent(text: string, structure: any): PDFAnalysis {
  const words = text.split(/\s+/).length;
  const estimatedReadTime = Math.ceil(words / 200); // 200 words per minute

  // Extract concepts (capitalized terms that appear multiple times)
  const conceptMap = new Map<string, number>();
  const capitalizedTerms = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  
  capitalizedTerms.forEach(term => {
    if (term.length > 3) {
      conceptMap.set(term, (conceptMap.get(term) || 0) + 1);
    }
  });

  const concepts = Array.from(conceptMap.entries())
    .filter(([_, count]) => count > 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([term]) => term);

  // Determine difficulty based on vocabulary complexity
  const avgWordLength = text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / words;
  let difficulty: "beginner" | "intermediate" | "advanced" = "beginner";
  if (avgWordLength > 6) difficulty = "intermediate";
  if (avgWordLength > 8) difficulty = "advanced";

  // Extract key topics from headings
  const keyTopics = structure.headings.slice(0, 10);

  // Simple relationship mapping (concepts that appear in same sections)
  const relationships: Array<{ from: string; to: string; type: string }> = [];
  for (let i = 0; i < concepts.length - 1; i++) {
    for (let j = i + 1; j < Math.min(i + 3, concepts.length); j++) {
      relationships.push({
        from: concepts[i],
        to: concepts[j],
        type: "related",
      });
    }
  }

  return {
    concepts,
    keyTopics,
    difficulty,
    estimatedReadTime,
    relationships: relationships.slice(0, 15),
  };
}
