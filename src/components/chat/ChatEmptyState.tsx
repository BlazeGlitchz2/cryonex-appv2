import {
  IconBrain,
  IconData,
  IconFile,
  IconImage,
} from "@/components/ui/icons/Web3Icons";

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
  return (
    <div className="flex w-full flex-col items-center justify-center px-4 text-center">
      <div className="reference-chip inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/56">
        Your private study intelligence
      </div>

      <div className="mt-6 max-w-5xl space-y-4 md:space-y-5">
        <h1 className="text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-[3.2rem] md:text-[4.5rem] md:leading-[1.02]">
          {project ? project.name : "What do you want to understand, build, or review?"}
        </h1>
        <p className="mx-auto max-w-[39rem] text-sm leading-7 text-white/48 sm:text-base md:text-[1.05rem] md:leading-8">
          {project
            ? "Ask for a cleaner explanation, a sharper study plan, or a review set built directly from this workspace."
            : "Bring in a source, name the outcome, and Cryonex will turn it into something you can actually study from."}
        </p>
      </div>

      <div className="mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-2.5 md:mt-8 md:gap-3">
        {promptActions.map((item) => (
          <button
            key={item.label}
            onClick={() => onSend(item.prompt)}
            className="reference-chip inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-white/72 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <item.icon className="h-4 w-4 text-white/58" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
