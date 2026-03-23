import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceGroundingPanelProps {
  summary: string;
  sourceText: string;
  compact?: boolean;
}

type SentenceCheck = {
  sentence: string;
  coverage: number;
};

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "being",
  "between",
  "could",
  "from",
  "have",
  "into",
  "just",
  "more",
  "other",
  "over",
  "that",
  "their",
  "there",
  "these",
  "they",
  "this",
  "through",
  "very",
  "with",
  "would",
]);

function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff\s]/gi, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 4 && !STOP_WORDS.has(word));
}

function analyzeGrounding(summary: string, sourceText: string) {
  const boundedSource = sourceText.slice(0, 120_000);
  const sourceTokens = new Set(tokenize(boundedSource));

  const rawSentences = summary
    .split(/(?<=[.!?؟])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  const checks: SentenceCheck[] = rawSentences.map((sentence) => {
    const tokens = tokenize(sentence);
    if (tokens.length === 0) {
      return { sentence, coverage: 1 };
    }
    const matched = tokens.filter((token) => sourceTokens.has(token)).length;
    return { sentence, coverage: matched / tokens.length };
  });

  const averageCoverage =
    checks.length === 0
      ? 0
      : checks.reduce((sum, check) => sum + check.coverage, 0) / checks.length;

  const weakClaims = checks.filter(
    (check) => check.sentence.length > 30 && check.coverage < 0.35,
  );

  return {
    checkedSentences: checks.length,
    score: Math.round(averageCoverage * 100),
    weakClaims,
  };
}

export function SourceGroundingPanel({
  summary,
  sourceText,
  compact = false,
}: SourceGroundingPanelProps) {
  const hasInput = summary.trim().length > 0 && sourceText.trim().length > 0;
  const result = hasInput ? analyzeGrounding(summary, sourceText) : null;

  const score = result?.score ?? 0;
  const scoreTone =
    score >= 70
      ? {
          label: "Strong grounding",
          icon: CheckCircle2,
          tone: "text-emerald-300 border-emerald-500/25 bg-emerald-500/10",
        }
      : score >= 45
        ? {
            label: "Moderate grounding",
            icon: ShieldCheck,
            tone: "text-amber-300 border-amber-500/25 bg-amber-500/10",
          }
        : {
            label: "Needs verification",
            icon: AlertTriangle,
            tone: "text-rose-300 border-rose-500/25 bg-rose-500/10",
          };

  const ScoreIcon = scoreTone.icon;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
            Trust layer
          </p>
          <h4 className="mt-2 text-base font-semibold text-white/90">
            Grounding check
          </h4>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
            scoreTone.tone,
          )}
        >
          <ScoreIcon className="h-3.5 w-3.5" />
          {scoreTone.label}
        </div>
      </div>

      {!hasInput ? (
        <p className="mt-3 text-sm text-white/55">
          Generate a summary first, then this panel will flag claims that need
          source verification.
        </p>
      ) : (
        <>
          <div
            className={cn(
              "mt-4 grid gap-2",
              compact ? "grid-cols-1" : "grid-cols-2",
            )}
          >
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wider text-white/45">
                Grounded score
              </p>
              <p className="mt-1 text-lg font-semibold text-white">{score}%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wider text-white/45">
                Claims to verify
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {result?.weakClaims.length ?? 0}
              </p>
            </div>
          </div>

          {(result?.weakClaims.length ?? 0) > 0 && (
            <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-200/90">
                Check these lines against your source
              </p>
              <ul className="mt-2 space-y-2 text-sm text-white/75">
                {result?.weakClaims.slice(0, 3).map((claim, index) => (
                  <li key={`${claim.sentence.slice(0, 30)}-${index}`}>
                    {claim.sentence}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-4 text-xs text-white/45">
            Tip: use the improve prompt with "only include evidence from the
            uploaded source" when verification is low.
          </p>
        </>
      )}
    </section>
  );
}
