import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, Download } from "lucide-react";
import { toast } from "sonner";

export function TranscriptPanel({ text }: { text: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text || "");
      toast.success("Transcript copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    try {
      const a = window.document.createElement("a");
      a.href = url;
      a.download = "transcript.txt";

      const parent = document.body || document.documentElement;
      if (parent && typeof (parent as any).appendChild === "function") {
        parent.appendChild(a);
        a.click();
        try {
          parent.removeChild(a);
        } catch {
          // ignore
        }
      } else {
        a.click();
      }
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-14 border-b border-[#1a1a1a] px-4 flex items-center justify-between">
        <div className="text-white text-sm">Transcript (raw extracted text)</div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="text-[#9b9b9b] hover:text-white">
            <Clipboard className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="text-[#9b9b9b] hover:text-white">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <Card className="bg-[#181820] border-[#2a2a2a] p-4">
          <pre className="whitespace-pre-wrap text-sm text-white font-mono">{text || "No transcript available."}</pre>
        </Card>
      </div>
    </div>
  );
}