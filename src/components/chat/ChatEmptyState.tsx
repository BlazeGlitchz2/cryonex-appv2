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
    description: "Turn long notes or a PDF into the key ideas and the next review targets.",
    prompt:
      "Summarize these notes into the key ideas, then list what I should review first.",
  },
  {
    icon: IconFile,
    label: "Build flashcards",
    description: "Create concise recall cards with clean answers and difficulty hints.",
    prompt:
      "Turn this material into accurate flashcards with concise answers and difficulty tags.",
  },
  {
    icon: IconData,
    label: "Plan a session",
    description: "Map this source into one focused block with a clear outcome.",
    prompt:
      "Help me plan a focused 45-minute study session from this material with one concrete goal.",
  },
  {
    icon: IconBrain,
    label: "Explain a concept",
    description: "Simplify the concept first, then test whether the explanation actually landed.",
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

      <div className="mt-5 max-w-5xl space-y-4 md:mt-6 md:space-y-5">
        <h1 className="text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-[3.1rem] md:text-[4.4rem] md:leading-[1.02]">
          {project ? project.name : "What do you want to work through today?"}
        </h1>
        <p className="mx-auto max-w-[40rem] text-sm leading-7 text-white/50 sm:text-base md:text-[1.04rem] md:leading-8">
          {project
            ? "Ask for a cleaner explanation, a tighter study plan, or a review path built directly from this workspace."
            : "Drop in a source, pick a lane, and Cryonex will turn it into something you can actually study from instead of just stare at."}
        </p>
      </div>

      <div className="mt-10 grid w-full max-w-5xl gap-3 text-left md:grid-cols-2">
        {promptActions.map((item) => (
          <button
            key={item.label}
            onClick={() => onSend(item.prompt)}
            className="group deepshi-panel flex min-h-[132px] flex-col justify-between rounded-[1.85rem] p-5 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04]">
                <item.icon className="h-4.5 w-4.5 text-white/68" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/34">
                Prompt lane
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.03em] text-white">
                {item.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/46">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-xs font-medium text-white/42">
        {["Source-grounded", "Private workspace", "Built for active recall"].map(
          (item) => (
            <span
              key={item}
              className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5"
            >
              {item}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
