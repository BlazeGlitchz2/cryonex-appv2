import { useParams, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import ReactMarkdown from "react-markdown";
import {
  ExternalLink,
  FileText,
  FolderOpen,
  Globe2,
  Layers3,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSafeExternalUrl, openSafeExternalUrl } from "@/lib/safe-url";

export default function SharedMaterial() {
  const { type, shareId } = useParams<{ type: string; shareId: string }>();
  const queryType: "material" | "note" | "pack" =
    type === "note" || type === "n"
      ? "note"
      : type === "pack" || type === "p"
        ? "pack"
        : "material";
  const navigate = useNavigate();
  const realShareId = typeof shareId === "string" ? shareId : "";

  const data = useQuery(api.viral.getPublicMaterial, {
    shareId: realShareId,
    type: queryType,
  });

  const workspaceDocId =
    queryType === "pack"
      ? (data as any)?.sourceDocId || (data as any)?.materialId
      : queryType === "material"
        ? (data as any)?.docId
        : (data as any)?.docId;
  const workspacePackId = queryType === "pack" ? (data as any)?._id : null;
  const originalResourceUrl = getSafeExternalUrl((data as any)?.url);

  if (data === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050218] text-white/70">
        Loading shared content...
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050218] text-white/70">
        This share is unavailable or private.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050218] px-4 py-8 text-white md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.05),transparent_0,transparent_22%),radial-gradient(circle_at_78%_10%,rgba(112,88,255,0.16),transparent_24%),linear-gradient(180deg,#07031c_0%,#050218_56%,#040114_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
              {queryType === "pack" ? (
                <Layers3 className="h-3.5 w-3.5" />
              ) : (
                <Globe2 className="h-3.5 w-3.5" />
              )}
              Shared via Cryonex
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
              {data.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
              {queryType === "pack"
                ? (data as any).description ||
                  "A source-grounded study pack with notes, review cues, and practice structure."
                : "Shared from Cryonex."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => openSafeExternalUrl(window.location.origin)}
              variant="outline"
              className="rounded-full border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            >
              Try Cryonex
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            {workspaceDocId && (
              <Button
                onClick={() =>
                  navigate(
                    queryType === "pack"
                      ? `/study/workspace/${workspaceDocId}?packId=${workspacePackId}`
                      : `/study/workspace/${workspaceDocId}`,
                  )
                }
                className="rounded-full bg-cyan-400 text-black hover:bg-cyan-300 font-bold shadow-[0_0_20px_rgba(34,211,238,0.35)] border-0"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Open in Workspace
              </Button>
            )}
          </div>
        </div>

        {queryType === "pack" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.16fr)_340px]">
            <Card className="rounded-[28px] border-white/10 bg-white/[0.03] p-6">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/45">
                  {(data as any).packStyle || "Study pack"}
                </span>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/45">
                  {(data as any).estimatedMinutes || 0}m
                </span>
              </div>

              <div className="prose prose-invert mt-5 max-w-none prose-headings:text-white prose-p:text-white/78 prose-strong:text-white prose-li:text-white/72">
                <ReactMarkdown>
                  {(data as any).summary?.simple ||
                    (data as any).summary?.detailed ||
                    ""}
                </ReactMarkdown>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-[28px] border-white/10 bg-white/[0.03] p-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  <Sparkles className="h-3.5 w-3.5" />
                  Key points
                </div>
                <div className="mt-4 space-y-3">
                  {((data as any).keyPoints || []).map((point: string) => (
                    <div
                      key={point}
                      className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/78"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-[28px] border-white/10 bg-white/[0.03] p-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  <ListChecks className="h-3.5 w-3.5" />
                  Practice plan
                </div>
                <div className="mt-4 space-y-3">
                  {((data as any).practicePlan || []).map(
                    (step: string, index: number) => (
                      <div
                        key={`${index}-${step}`}
                        className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                          Step {index + 1}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/78">
                          {step}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="rounded-[28px] border-white/10 bg-white/[0.03] p-8 min-h-[500px]">
            {queryType === "note" ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{(data as any).content}</ReactMarkdown>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <FileText className="h-5 w-5 text-cyan-300" />
                  <span className="text-sm text-white/72">
                    Shared study material
                  </span>
                </div>
                {(data as any).summary?.detailed ? (
                  <div className="prose prose-invert max-w-none mt-4">
                    <ReactMarkdown>
                      {(data as any).summary.detailed}
                    </ReactMarkdown>
                  </div>
                ) : null}
                {originalResourceUrl ? (
                  <Button
                    onClick={() => openSafeExternalUrl(originalResourceUrl)}
                    className="mt-4 rounded-full bg-white text-black hover:bg-white/92"
                  >
                    Open original resource
                  </Button>
                ) : null}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
