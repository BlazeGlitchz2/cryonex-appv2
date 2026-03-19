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
      <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/56 gradient-border">
        Your private study intelligence
      </div>

      <div className="mt-5 max-w-4xl space-y-4 md:mt-6 md:space-y-4">
        <h1 className="text-[2.35rem] font-semibold leading-[1.06] tracking-[-0.05em] text-white sm:text-[2.95rem] md:text-[3.85rem] md:leading-[1.06]">
          {project ? project.name : "How can I help you today?"}
        </h1>
        <p className="mx-auto max-w-[34rem] text-sm leading-7 text-white/50 sm:text-base md:text-[1.02rem] md:leading-8">
          {project
            ? "Ask for a clearer explanation, a sharper study plan, or a review set built from this workspace."
            : "Bring in a source, set a goal, and Cryonex will help you turn it into something you can actually study from."}
        </p>
      </div>

      <div className="mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-2.5 md:mt-7 md:gap-3">
        {promptActions.map((item) => (
          <button
            key={item.label}
            onClick={() => onSend(item.prompt)}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white/72 transition-colors hover:bg-white/[0.08] hover:text-white gradient-border"
          >
            <item.icon className="h-4 w-4 text-white/58" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
