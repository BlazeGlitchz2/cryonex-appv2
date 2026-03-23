import { useAction, useQuery } from "convex/react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { AgentChat, createAgentChat } from "@21st-sdk/react";
import "@21st-sdk/react/styles.css";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle, BookOpenCheck, Compass, Sparkles } from "lucide-react";
import { toast } from "sonner";

const AppPage = lazy(() => import("@/pages/App"));

const copilotTheme = {
  theme: {
    fontFamily: "'Sora', 'IBM Plex Sans Arabic', sans-serif",
    radius: "26px",
  },
  light: {},
  dark: {
    "--an-bg": "#050218",
    "--an-panel": "rgba(10,6,37,0.9)",
    "--an-border": "rgba(255,255,255,0.08)",
    "--an-text": "#f8f7ff",
    "--an-muted": "rgba(248,247,255,0.58)",
    "--an-accent": "#d072ff",
    "--an-accent-contrast": "#120417",
    "--an-user-message-bg": "linear-gradient(180deg, rgba(208,114,255,0.28), rgba(126,64,255,0.24))",
    "--an-assistant-message-bg": "rgba(255,255,255,0.04)",
    "--an-input-bg": "rgba(255,255,255,0.04)",
  },
};

const promptActions = [
  "Turn my latest material into a 45-minute exam-cram plan with weak-topic checkpoints.",
  "Answer only from my uploaded study material and cite the source sections you rely on.",
  "Rewrite the key concepts in bilingual English + Arabic so I can revise both ways.",
  "Create a focused quiz on the topics I am most likely to forget first.",
];

type CopilotStatus = {
  configured: boolean;
  agentSlug: string | null;
  missing: string[];
};

function StudyCopilotRuntime({
  agentSlug,
  create21stToken,
  recommendations,
  recentMaterials,
}: {
  agentSlug: string;
  create21stToken: ReturnType<typeof useAction<typeof api.studyRuntime.create21stToken>>;
  recommendations: any;
  recentMaterials: any[];
}) {
  const chat = useMemo(
    () =>
      createAgentChat({
        agent: agentSlug,
        getToken: async () => {
          const result = await create21stToken({ agent: agentSlug });
          return result.token;
        },
        onError: (error) => {
          console.error("21st Study Copilot error", error);
        },
      }),
    [agentSlug, create21stToken],
  );

  const { messages, sendMessage, status, stop, error } = useChat({ chat });

  const dueCards = recommendations?.dueFlashcardsCount ?? 0;
  const strongestPrompt =
    recommendations?.primaryAction?.title ||
    "Ground my next study step from the materials I uploaded today.";

  return (
    <div className="study-dashboard-shell relative min-h-full overflow-x-hidden px-4 pb-10 pt-6 md:px-8 xl:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,114,255,0.12),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(61,193,255,0.1),transparent_24%),linear-gradient(180deg,#06021d_0%,#050218_58%,#040115_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
        <section className="deepshi-panel rounded-[28px] border border-white/10 px-5 py-5 md:px-7 md:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D072FF]/30 bg-[#D072FF]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E6CBFF]">
                <Sparkles className="h-3.5 w-3.5" />
                21st Study Copilot
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                Ask for grounded help, not generic chat.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58 md:text-base">
                This lane is tuned for study execution: evidence-first answers, bilingual explanations, weak-topic reinforcement, and exam-aware next steps.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Due now</p>
                <p className="mt-1 text-xl font-semibold text-white">{dueCards}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Recent sources</p>
                <p className="mt-1 text-xl font-semibold text-white">{recentMaterials.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Recommended</p>
                <p className="mt-1 text-sm font-semibold text-white/90">{strongestPrompt}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {promptActions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() =>
                  sendMessage({ parts: [{ type: "text", text: prompt }] }).catch((chatError) => {
                    console.error(chatError);
                    toast.error("Failed to send prompt to Study Copilot.");
                  })
                }
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.6fr,0.8fr]">
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#07031f]/94 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
            <AgentChat
              messages={messages}
              onSend={(message) =>
                sendMessage({
                  parts: [{ type: "text", text: message.content }],
                })
              }
              status={status}
              onStop={stop}
              error={error || undefined}
              theme={copilotTheme as any}
              colorMode="dark"
              classNames={{
                root: "min-h-[72vh] rounded-[26px] border border-white/10 bg-transparent",
                messageList: "px-4 py-5 md:px-6",
                inputBar: "border-t border-white/10 bg-black/20 backdrop-blur-xl",
              }}
            />
          </div>

          <div className="space-y-4">
            <section className="deepshi-panel rounded-[26px] border border-white/10 p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                <Compass className="h-3.5 w-3.5 text-cyan-300" />
                Suggested Moves
              </div>
              <div className="mt-4 space-y-3">
                {((recommendations?.nextActions as any[]) || []).slice(0, 4).map((action) => (
                  <div key={action.id} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-sm font-medium text-white">{action.title}</p>
                    <p className="mt-1 text-xs leading-6 text-white/50">{action.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="deepshi-panel rounded-[26px] border border-white/10 p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                <BookOpenCheck className="h-3.5 w-3.5 text-emerald-300" />
                Recent Material
              </div>
              <div className="mt-4 space-y-3">
                {recentMaterials.slice(0, 4).map((material) => (
                  <div key={material._id} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-sm font-medium text-white">{material.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">{material.type}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function StudyCopilot() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const recommendations = useQuery(api.study.getStudyRecommendations, user ? {} : "skip");
  const recentMaterials = useQuery(api.study.getRecentMaterials, user ? { limit: 5 } : "skip") || [];
  const getCopilotStatus = useAction(api.studyRuntime.getCopilotStatus);
  const create21stToken = useAction(api.studyRuntime.create21stToken);

  const [status, setStatus] = useState<CopilotStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) {
      return;
    }

    let active = true;

    getCopilotStatus({})
      .then((result) => {
        if (active) {
          setStatus(result as CopilotStatus);
        }
      })
      .catch((error) => {
        console.error(error);
        if (active) {
          setStatusError("Failed to load 21st Study Copilot status.");
          setStatus({ configured: false, agentSlug: null, missing: [] });
        }
      });

    return () => {
      active = false;
    };
  }, [getCopilotStatus, isAuthenticated, isLoading, user]);

  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="flex h-full items-center justify-center text-white/60">
        Preparing Study Copilot...
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex h-full items-center justify-center text-white/60">
        Loading Study Copilot...
      </div>
    );
  }

  if (!status.configured || !status.agentSlug) {
    return (
      <div className="h-full">
        <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8">
          <div className="mb-4 rounded-[26px] border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-amber-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-semibold">21st Study Copilot is not configured yet.</p>
                <p className="mt-1 text-sm text-amber-100/78">
                  {statusError || "The current app will fall back to the built-in study copilot until API_KEY_21ST and AGENT_21ST_STUDY_COPILOT are set."}
                </p>
                {status.missing.length > 0 && (
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-amber-100/70">
                    Missing: {status.missing.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="flex h-[60vh] items-center justify-center text-white/45">
              Loading fallback copilot...
            </div>
          }
        >
          <AppPage />
        </Suspense>
      </div>
    );
  }

  return (
    <StudyCopilotRuntime
      agentSlug={status.agentSlug}
      create21stToken={create21stToken}
      recommendations={recommendations}
      recentMaterials={recentMaterials}
    />
  );
}
