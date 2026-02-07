import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Copy,
  Check,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GlobalErrorProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function GlobalError({
  error,
  resetErrorBoundary,
}: GlobalErrorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const errorDetails = `Error: ${error.message}\n\nStack Trace:\n${error.stack || "No stack trace available"}`;
    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    toast.success("Error details copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const isChunkLoadError =
    error.message
      .toLowerCase()
      .includes("failed to fetch dynamically imported module") ||
    error.message.toLowerCase().includes("loading chunk");

  // Auto-reload on chunk error once to try and recover
  useState(() => {
    if (isChunkLoadError) {
      const hasReloaded = sessionStorage.getItem(
        "cryonex_chunk_reload_attempted",
      );
      if (!hasReloaded) {
        sessionStorage.setItem("cryonex_chunk_reload_attempted", "true");
        window.location.reload();
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020005] text-white p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="bg-[#0A0A0B]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              {isChunkLoadError ? "Update Required" : "System Malfunction"}
            </h1>
            <p className="text-white/50 max-w-md">
              {isChunkLoadError
                ? "A new version of Cryonex is available. We need to refresh your session to apply the latest security and feature updates."
                : "The application encountered a critical error. Our systems have caught the exception to prevent further damage."}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-medium text-white/40 uppercase tracking-wider">
                <Terminal className="w-3 h-3" />
                Details
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs hover:bg-white/5 text-white/50 hover:text-white transition-colors"
              >
                {copied ? (
                  <Check className="w-3 h-3 mr-1.5 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 mr-1.5" />
                )}
                {copied ? "Copied" : "Copy Details"}
              </Button>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent rounded-xl pointer-events-none" />
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 overflow-hidden">
                <p className="text-red-400 font-mono text-sm mb-3 font-semibold break-words">
                  {error.message}
                </p>
                <div className="h-px w-full bg-white/5 mb-3" />
                <pre className="text-[11px] font-mono text-white/30 overflow-auto max-h-[200px] custom-scrollbar whitespace-pre-wrap break-all leading-relaxed">
                  {error.stack || "No stack trace available"}
                </pre>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                sessionStorage.removeItem("cryonex_chunk_reload_attempted");
                resetErrorBoundary
                  ? resetErrorBoundary()
                  : window.location.reload();
              }}
              className="bg-white text-black hover:bg-white/90 h-11 px-8 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isChunkLoadError ? "Update Now" : "Reboot System"}
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 h-11 px-8 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
