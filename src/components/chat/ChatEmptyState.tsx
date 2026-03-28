import {
  IconBrain,
  IconData,
  IconFile,
  IconImage,
} from "@/components/ui/icons/Web3Icons";
import { useThemeStore } from "@/lib/stores/theme-store";
import { cn } from "@/lib/utils";

const promptActions = [
  {
    icon: IconImage,
    label: "Summarize a source",
    prompt:
      "Summarize these notes into the key ideas, then list what I should review first.",
  },
  {
    icon: IconFile,
    label: "Build flashcards",
    prompt:
      "Turn this material into accurate flashcards with concise answers and difficulty tags.",
  },
  {
    icon: IconData,
    label: "Plan a session",
    prompt:
      "Help me plan a focused 45-minute study session from this material with one concrete goal.",
  },
  {
    icon: IconBrain,
    label: "Explain a concept",
    prompt:
      "Explain this concept simply, then test me with three questions to verify I understand it.",
  },
];

export function ChatEmptyState({
  project,
  onSend,
}: {
  project: { name?: string } | null | undefined;
  onSend: (text: string) => void;
}) {
  const mode = useThemeStore((state) => state.mode);
  const isLight = mode === "light";

  return (
    <div className="flex w-full max-w-[38rem] flex-col items-start justify-center px-4 text-left md:max-w-[56rem] md:items-center md:px-0 md:text-center">
      <div
        className={cn(
          "inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]",
          isLight
            ? "border-slate-300/80 bg-white/72 text-slate-700"
            : "border-white/[0.06] bg-white/[0.04] text-white/56 gradient-border",
        )}
      >
        Your private study intelligence
      </div>

      <div className="mt-5 space-y-4 md:mt-6 md:space-y-4">
        <h1
          className={cn(
            "max-w-[14ch] text-[clamp(2.1rem,10vw,4.35rem)] font-semibold leading-[1.02] tracking-[-0.05em] md:max-w-none md:leading-[1.04]",
            isLight ? "text-slate-950" : "text-white",
          )}
        >
          {project ? project.name : "How can I help you today?"}
        </h1>
        <p
          className={cn(
            "max-w-[30rem] text-sm leading-7 sm:text-base md:max-w-[40rem] md:text-[1.02rem] md:leading-8",
            isLight ? "text-slate-700" : "text-white/50",
          )}
        >
          {project
            ? "Ask for a clearer explanation, a sharper study plan, or a review set built from this workspace."
            : "Bring in a source, set a goal, and Cryonex will help you turn it into something you can actually study from."}
        </p>
      </div>

      <div className="mt-8 flex w-full max-w-4xl flex-wrap items-center justify-start gap-2.5 md:mt-7 md:justify-center md:gap-3">
        {promptActions.map((item) => (
          <button
            key={item.label}
            onClick={() => onSend(item.prompt)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors",
              isLight
                ? "border-slate-300/80 bg-white/76 text-slate-900 hover:bg-white"
                : "border-white/[0.06] bg-white/[0.03] text-white/72 hover:bg-white/[0.08] hover:text-white gradient-border",
            )}
          >
            <item.icon
              className={cn(
                "h-4 w-4",
                isLight ? "text-slate-500" : "text-white/58",
              )}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
