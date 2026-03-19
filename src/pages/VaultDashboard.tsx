import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Clock3,
  FileText,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

export default function VaultDashboard() {
  const navigate = useNavigate();
  const essays = useQuery(api.vault.listEssays) || [];
  const createEssay = useMutation(api.vault.createEssay);

  const summary = useMemo(() => {
    const completed = essays.filter((essay) => essay.status === "completed").length;
    const drafts = essays.length - completed;
    const totalMinutes = Math.ceil(
      essays.reduce((sum, essay) => sum + (essay.totalTimeSpentMs || 0), 0) / 60000,
    );

    return { completed, drafts, totalMinutes };
  }, [essays]);

  const handleStartNewEssay = async () => {
    try {
      const essayId = await createEssay({
        title: `Untitled Essay - ${new Date().toLocaleDateString()}`,
      });
      navigate(`/vault/editor/${essayId}`);
    } catch (error) {
      console.error("Failed to start new essay", error);
    }
  };

  return (
    <div className="study-readable relative flex h-screen flex-col overflow-hidden bg-[#09040e] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[6%] top-[6%] h-64 w-64 rounded-full bg-[#7a4be3]/12 blur-[130px]" />
        <div className="absolute right-[12%] top-[18%] h-64 w-64 rounded-full bg-[#3569cc]/10 blur-[140px]" />
        <div className="absolute bottom-[8%] left-[20%] h-72 w-72 rounded-full bg-[#cf8748]/10 blur-[150px]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#0f0915]/84 px-6 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
              <Lock className="h-5 w-5 text-[#9fc3ff]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9fc3ff]">
                Verified writing
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                Knowledge Vault
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Draft, autosave, and generate a clean proof trail for every essay.
              </p>
            </div>
          </div>

          <Button
            onClick={handleStartNewEssay}
            className="rounded-full bg-[linear-gradient(135deg,#95baff,#5d6bff)] text-slate-950 hover:opacity-95"
          >
            <Plus className="mr-2 h-4 w-4" />
            New verified draft
          </Button>
        </div>
      </header>

      <ScrollArea className="relative z-10 flex-1 px-6 pb-8 pt-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="grid gap-3 md:grid-cols-3">
            <div className="dashboard-surface rounded-[1.6rem] p-5">
              <p className="text-xs font-semibold text-white/45">Drafts in progress</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                {summary.drafts}
              </p>
              <p className="mt-2 text-sm text-white/55">
                Active documents still collecting a writing trail.
              </p>
            </div>
            <div className="dashboard-surface rounded-[1.6rem] p-5">
              <p className="text-xs font-semibold text-white/45">Completed proofs</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                {summary.completed}
              </p>
              <p className="mt-2 text-sm text-white/55">
                Finished essays ready for playback and export.
              </p>
            </div>
            <div className="dashboard-surface rounded-[1.6rem] p-5">
              <p className="text-xs font-semibold text-white/45">Tracked minutes</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                {summary.totalMinutes}
              </p>
              <p className="mt-2 text-sm text-white/55">
                Total verified drafting time captured in the vault.
              </p>
            </div>
          </section>

          {essays.length === 0 ? (
            <section className="dashboard-surface mt-6 rounded-[2rem] p-12 text-center">
              <motion.div
                animate={{ y: [0, -6, 0], opacity: [0.75, 1, 0.75] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-white/10 bg-white/[0.05]"
              >
                <ShieldCheck className="h-9 w-9 text-[#9fc3ff]" />
              </motion.div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                No verified drafts yet
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-white/58">
                Start one essay here and Cryonex will quietly track timing and revision
                history so your proof view can replay the real writing process.
              </p>
              <Button
                onClick={handleStartNewEssay}
                variant="outline"
                className="mt-6 rounded-full border-white/14 bg-white/[0.04] text-white hover:bg-white/[0.08]"
              >
                Start writing
              </Button>
            </section>
          ) : (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {essays.map((essay, index) => (
                <motion.button
                  key={essay._id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.04,
                    type: "spring",
                    stiffness: 260,
                    damping: 24,
                  }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate(`/vault/editor/${essay._id}`)}
                  className="dashboard-surface group rounded-[1.8rem] p-5 text-left"
                  style={{ contentVisibility: "auto", containIntrinsicSize: "220px" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                      <FileText className="h-4.5 w-4.5 text-[#9fc3ff]" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                      {essay.status}
                    </span>
                  </div>

                  <h3 className="mt-5 line-clamp-2 text-xl font-semibold tracking-[-0.03em] text-white">
                    {essay.title}
                  </h3>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/52">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4" />
                      {Math.ceil(essay.totalTimeSpentMs / 60000)} min
                    </span>
                    <span>{essay.totalWordCount} words</span>
                  </div>

                  <div className="mt-5 rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-white/72">
                      <Sparkles className="h-4 w-4 text-[#d6b27d]" />
                      {essay.status === "completed"
                        ? "Open the finished proof trail"
                        : "Resume drafting with autosave and clean replay"}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-sm font-medium text-white/72">
                    <span>Open draft</span>
                    <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </motion.button>
              ))}
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
