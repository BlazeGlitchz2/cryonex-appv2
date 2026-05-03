import { Compass, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GUEST_PREVIEW_WORKSPACE_REDIRECT } from "@/lib/auth-redirect";

const guestActions = [
  {
    eyebrow: "Step 1",
    title: "Start with your sources",
    description:
      "See how notes, PDFs, and class material become the center of the workspace.",
  },
  {
    eyebrow: "Step 2",
    title: "Build a study lane",
    description:
      "Preview the focused path from capture to review without creating an account.",
  },
  {
    eyebrow: "Step 3",
    title: "Unlock live coaching",
    description:
      "Sign in when you are ready to generate quizzes, flashcards, and personalized help.",
  },
];

export default function GuestStudyDashboard() {
  const openWorkspacePreview = () => {
    window.location.assign(GUEST_PREVIEW_WORKSPACE_REDIRECT);
  };

  const handleLockedAction = () => {
    toast("Live study actions unlock after sign in.", {
      description: "The preview keeps your first look fast, private, and low commitment.",
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(110,231,255,0.16),transparent_28%),linear-gradient(180deg,#071120_0%,#030712_55%,#02040a_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/6 p-5 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
                <Compass className="h-3.5 w-3.5" />
                Guest preview
              </span>
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.26em] text-white/45">
                  Cryonex study dashboard
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                  Turn class material into a focused study system.
                </h1>
                <p className="max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                  Explore the study workspace before signing in. Live uploads,
                  syncing, and AI generation stay locked until you choose to
                  connect an account.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={openWorkspacePreview}
                className="rounded-full bg-white text-slate-950 hover:bg-white/90"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Explore preview
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.assign("/auth")}
                className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Lock className="mr-2 h-4 w-4" />
                Return to sign in
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {guestActions.map((action) => (
            <button
              key={action.title}
              type="button"
              onClick={action.eyebrow === "Step 3" ? handleLockedAction : openWorkspacePreview}
              className="rounded-[28px] border border-white/10 bg-white/6 p-5 text-left transition hover:border-cyan-300/30 hover:bg-white/8"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/85">
                {action.eyebrow}
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">
                {action.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/65">
                {action.description}
              </p>
            </button>
          ))}
        </section>

        <section className="rounded-[32px] border border-dashed border-white/12 bg-black/20 p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
                Preview mode
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                The demo keeps private files, personal progress, and AI
                requests off until sign in. That keeps the first visit simple
                while still showing how the study loop is organized.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={openWorkspacePreview}
              className="rounded-full text-white/75 hover:bg-white/8 hover:text-white"
            >
              Keep previewing
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
