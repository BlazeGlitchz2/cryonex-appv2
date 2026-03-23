import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Share2, Check, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ShareButtonProps {
  id: Id<"studyMaterials"> | Id<"studyNotes">;
  type: "material" | "note";
  title: string;
  isPublic?: boolean;
  existingShareId?: string;
}

export function ShareButton({
  id,
  type,
  title,
  isPublic,
  existingShareId,
}: ShareButtonProps) {
  const publish = useMutation(api.viral.publishMaterial);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareId, setShareId] = useState<string | undefined>(existingShareId);
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] = useState<"school" | "public">(
    isPublic ? "public" : "school",
  );
  const [publishedVisibility, setPublishedVisibility] = useState<
    "private" | "school" | "public"
  >(isPublic ? "public" : "private");

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const newShareId = await publish({ id, type, visibility });
      setShareId(newShareId);
      setPublishedVisibility(visibility);
      toast.success(
        visibility === "public"
          ? "Content published publicly."
          : "Content published to your school network.",
      );
    } catch (error) {
      toast.error("Failed to publish content");
    } finally {
      setIsLoading(false);
    }
  };

  const shareUrl = shareId
    ? `${window.location.origin}/share/${type}/${shareId}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-white/60 hover:text-white"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0A0A0B]/95 backdrop-blur-xl border-white/10 text-white sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Share "{title}"
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Choose whether this content should be visible to your school network or public on the web.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {!shareId || publishedVisibility === "school" ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Share2 className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-sm text-white/50 max-w-[200px]">
                This content is private by default. Publish it to your school feed or to the web.
              </p>
              <div className="grid w-full gap-2">
                {[
                  { id: "school", label: "School network" },
                  { id: "public", label: "Public web link" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setVisibility(option.id as "school" | "public")}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                      visibility === option.id
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Button
                onClick={handlePublish}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-12 font-bold"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Globe className="w-4 h-4 mr-2" />
                )}
                {visibility === "public" ? "Publish to Web" : "Publish to School"}
              </Button>
              {publishedVisibility === "school" ? (
                <div className="w-full rounded-xl border border-violet-400/20 bg-violet-400/10 p-4 text-sm text-violet-100">
                  This item is now visible in your school discovery feed.
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm flex items-center gap-3">
                <Globe className="w-4 h-4 shrink-0" />
                Content is live on the web
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                  Public Link
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    className="bg-black/40 border-white/10 text-white/80 font-mono text-sm h-12 rounded-xl"
                  />
                  <Button
                    onClick={handleCopy}
                    className="h-12 w-12 shrink-0 bg-white/10 hover:bg-white/20 rounded-xl"
                    size="icon"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
