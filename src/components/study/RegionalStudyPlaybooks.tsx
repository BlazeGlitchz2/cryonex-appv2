import { Globe2, Languages, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";

interface RegionalStudyPlaybooksProps {
  region?: string;
  country?: string;
  curriculum?: string;
  curriculumTrack?: string;
  isRTL?: boolean;
  compact?: boolean;
  onApplyInstruction: (instruction: string) => void;
}

type Playbook = {
  id: string;
  label: string;
  description: string;
  icon: typeof Sparkles;
  instruction: string;
};

function buildPlaybooks({
  region,
  country,
  curriculum,
  curriculumTrack,
  isRTL,
}: Omit<RegionalStudyPlaybooksProps, "onApplyInstruction" | "compact">) {
  const localeHint =
    region || country || curriculum || curriculumTrack
      ? `Region: ${region || country || "global"} | Curriculum: ${curriculumTrack || curriculum || "general"}`
      : "No study profile detected yet";

  const playbooks: Playbook[] = [
    {
      id: "evidence",
      label: "Evidence-first",
      description: "Strip fluff and keep claims tied to source facts.",
      icon: Target,
      instruction:
        "Rewrite this summary as evidence-first notes. Keep only claims supported by the uploaded source. For each section, add one quoted keyword from the source and avoid invented details.",
    },
    {
      id: "active-recall",
      label: "Active recall",
      description: "Convert content into testable memory hooks.",
      icon: Sparkles,
      instruction:
        "Transform the summary into active recall format: key idea, likely exam question, one trap answer, and one quick self-test prompt per section.",
    },
  ];

  if (
    region === "ksa" ||
    region === "egypt" ||
    region === "uae" ||
    country === "sa" ||
    country === "eg" ||
    country === "ae"
  ) {
    playbooks.push({
      id: "regional-exam",
      label: "Regional exam lens",
      description: "Shape notes for local exam pressure and pacing.",
      icon: Globe2,
      instruction: `Adapt the summary for ${
        region === "egypt" || country === "eg"
          ? "Egyptian national exam preparation"
          : region === "uae" || country === "ae"
              ? "UAE EmSAT preparation"
              : "Saudi exam preparation"
      } with concise high-yield points, common examiner patterns, and time-saving solving cues.`,
    });
  }

  playbooks.push({
    id: "arabic-bilingual",
    label: isRTL ? "Arabic mastery" : "Bilingual mode",
    description: "Deliver clearer Arabic-first or bilingual output.",
    icon: Languages,
    instruction: isRTL
      ? "Rewrite the summary in clear professional Arabic with short sections and right-to-left friendly structure. Keep technical terms with Arabic explanations."
      : "Rewrite the summary in bilingual format: English key point plus concise Arabic explanation under each point.",
  });

  return { localeHint, playbooks };
}

export function RegionalStudyPlaybooks({
  region,
  country,
  curriculum,
  curriculumTrack,
  isRTL,
  compact = false,
  onApplyInstruction,
}: RegionalStudyPlaybooksProps) {
  const { localeHint, playbooks } = buildPlaybooks({
    region,
    country,
    curriculum,
    curriculumTrack,
    isRTL,
  });

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
        Personalization layer
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        <h4 className="text-base font-semibold text-white/90">
          Study playbooks
        </h4>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-white/55">
          {localeHint}
        </span>
      </div>
      <p className="mt-2 text-sm text-white/55">
        One tap applies a focused prompt so the next AI improvement is not
        generic.
      </p>

      <div
        className={`mt-4 grid gap-2 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}
      >
        {playbooks.map((playbook) => (
          <button
            key={playbook.id}
            type="button"
            onClick={() => {
              onApplyInstruction(playbook.instruction);
              toast.success(`${playbook.label} applied`);
            }}
            className="rounded-xl border border-white/10 bg-black/20 p-3 text-left transition-colors hover:border-cyan-400/30 hover:bg-cyan-500/10"
          >
            <div className="flex items-center gap-2">
              <playbook.icon className="h-4 w-4 text-cyan-300" />
              <p className="text-sm font-semibold text-white/90">
                {playbook.label}
              </p>
            </div>
            <p className="mt-1 text-xs text-white/55">{playbook.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
