import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { sanitizeRedirectTarget } from "@/lib/auth-redirect";

export default function NotesIndexPage() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("Uploading your content");

  useEffect(() => {
    // Lightweight, local animation to indicate progress while backend runs.
    // The tab will be replaced with /notes/:docId once ready.
    const phases = [
      { p: 0, label: "Uploading your content" },
      { p: 20, label: "Preparing PDF" },
      { p: 40, label: "Extracting text" },
      { p: 60, label: "Chunking & indexing" },
      { p: 75, label: "Generating study assets" },
      { p: 90, label: "Finalizing" },
    ];
    let i = 0;
    setPhase(phases[0].label);
    setProgress(phases[0].p);

    const id = setInterval(() => {
      i = Math.min(i + 1, phases.length - 1);
      setProgress(phases[i].p);
      setPhase(phases[i].label);
      if (i === phases.length - 1) {
        clearInterval(id);
      }
    }, 900);

    // Listen for redirect message from parent/opener
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from same origin only
      if (event.origin !== window.location.origin) {
        console.warn("⚠️ Message from different origin ignored:", event.origin);
        return;
      }

      if (event.data?.type === "redirect" && event.data?.url) {
        const safeRedirect = sanitizeRedirectTarget(event.data.url);
        console.log("📨 Redirect message received:", event.data.url);
        console.log("🔄 Navigating to:", safeRedirect);
        window.location.assign(safeRedirect);
      }
    };

    window.addEventListener("message", handleMessage);
    console.log("👂 NotesIndex: Listening for redirect messages");

    // Signal to opener that we're ready
    const checkOpener = setInterval(() => {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: "notes-ready" },
            window.location.origin,
          );
          console.log("📤 Sent notes-ready signal to opener");
        }
      } catch {
        // Ignore cross-origin errors
      }
    }, 500);

    return () => {
      clearInterval(id);
      clearInterval(checkOpener);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="h-full w-full bg-background text-foreground flex items-center justify-center px-6">
      <Card className="bg-card border-border w-full max-w-xl shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Creating Your Notes</h1>
            <p className="text-muted-foreground">
              This should take a few minutes...
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{phase}</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
            <div className="rounded-md bg-muted/50 border border-border p-3 text-sm">
              <span className="text-muted-foreground font-medium">TIP</span>
              <div className="text-muted-foreground mt-1">
                Record lectures with your phone and Cryonex will transcribe
                them.
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              You can keep working in the original tab. This page will
              automatically switch to your workspace when ready.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
