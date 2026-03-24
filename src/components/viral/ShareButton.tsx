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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useDeviceInfo } from "@/hooks/use-mobile";
import { useCryonexBridge } from "@/hooks/useCryonexBridge";

interface ShareButtonProps {
  id: Id<"studyMaterials"> | Id<"studyNotes"> | Id<"studyPacks">;
  type: "material" | "note" | "pack";
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
  const publish = useMutation(api.social.publishStudyAsset);
  const { isMobile, isTablet, isIOS, isAndroid } = useDeviceInfo();
  const { copyToClipboard, shareText } = useCryonexBridge();
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
  const usesTouchSheet = isMobile || isTablet;

  const buildShareUrl = (nextShareId?: string) =>
    nextShareId ? `${window.location.origin}/share/${type}/${nextShareId}` : "";

  const shareUrl = buildShareUrl(shareId);

  const handleCopy = async (url = shareUrl) => {
    if (!url) return;

    try {
      await copyToClipboard(url, "Cryonex share link");
      setCopied(true);
      toast.success("Link copied to clipboard");
      if (usesTouchSheet) {
        setIsOpen(false);
      }
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy share link");
    }
  };

  const handleShareNow = async (url = shareUrl) => {
    if (!url) return;

    const payload = `Study with me on Cryonex: ${title}\n${url}`;

    try {
      const result = await shareText(payload, title);
      if (result?.success) {
        toast.success(
          isAndroid
            ? "Android share sheet opened."
            : isIOS
              ? "Share sheet ready."
              : "Share sheet opened.",
        );
        if (usesTouchSheet) {
          setIsOpen(false);
        }
        return;
      }

      await handleCopy(url);
    } catch {
      await handleCopy(url);
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const result = await publish({ id, type, visibility, title });
      setShareId(result.shareId);
      setPublishedVisibility(visibility);
      toast.success(
        visibility === "public"
          ? "Content published publicly."
          : "Content published to your school network.",
      );

      if (visibility === "public" && usesTouchSheet) {
        await handleShareNow(buildShareUrl(result.shareId));
      }
    } catch (error) {
      toast.error("Failed to publish content");
    } finally {
      setIsLoading(false);
    }
  };

  const shareTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 text-white/60 hover:text-white"
    >
      <Share2 className="w-4 h-4" />
      Share
    </Button>
  );

  const publishOptions = (
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
          } ${usesTouchSheet ? "min-h-[3.5rem]" : ""}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  const unpublishedContent = (
    <div className="flex flex-col items-center justify-center py-2 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <Share2 className="w-8 h-8 text-white/20" />
      </div>
      <p className="mt-4 max-w-[220px] text-sm text-white/50">
        This content is private by default. Publish it to your school feed or to
        the web.
      </p>
      <div className="mt-4 w-full">{publishOptions}</div>
      <Button
        onClick={handlePublish}
        disabled={isLoading}
        className={`mt-4 w-full bg-blue-600 text-white hover:bg-blue-500 ${usesTouchSheet ? "h-14 rounded-2xl text-base font-semibold" : "rounded-xl h-12 font-bold"}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Globe className="w-4 h-4 mr-2" />
        )}
        {visibility === "public"
          ? usesTouchSheet
            ? "Publish and share"
            : "Publish to Web"
          : "Publish to School"}
      </Button>
      {publishedVisibility === "school" ? (
        <div className="mt-4 w-full rounded-xl border border-violet-400/20 bg-violet-400/10 p-4 text-sm text-violet-100">
          This item is now visible in your school discovery feed.
        </div>
      ) : null}
    </div>
  );

  const publicLinkContent = (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
        <Globe className="w-4 h-4 shrink-0" />
        Content is live on the web
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
          Public Link
        </label>
        <Input
          readOnly
          value={shareUrl}
          className={`bg-black/40 border-white/10 text-white/80 font-mono text-sm ${usesTouchSheet ? "h-12 rounded-2xl" : "h-12 rounded-xl"}`}
        />
      </div>

      {usesTouchSheet ? (
        <div className="grid gap-2">
          <Button
            type="button"
            onClick={() => void handleShareNow()}
            className="h-14 rounded-2xl bg-white text-black hover:bg-white/92"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share now
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleCopy()}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-green-400" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            onClick={() => void handleCopy()}
            className="h-12 w-12 shrink-0 bg-white/10 hover:bg-white/20 rounded-xl"
            size="icon"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleShareNow()}
            className="h-12 rounded-xl border-white/10 bg-white/[0.04] px-4 text-white hover:bg-white/[0.08]"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      )}
    </div>
  );

  const shareBody =
    !shareId || publishedVisibility === "school"
      ? unpublishedContent
      : publicLinkContent;

  if (usesTouchSheet) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>{shareTrigger}</DrawerTrigger>
        <DrawerContent className="border-white/10 bg-[#0A0A0B]/95 text-white">
          <DrawerHeader className="px-5 pb-0 pt-3 text-left">
            <DrawerTitle className="flex items-center gap-2 text-lg text-white">
              <Globe className="w-5 h-5 text-blue-400" />
              Share "{title}"
            </DrawerTitle>
            <DrawerDescription className="text-sm text-white/60">
              Choose whether this content should stay in your school network or
              be shared publicly.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
            {shareBody}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{shareTrigger}</DialogTrigger>
      <DialogContent className="bg-[#0A0A0B]/95 backdrop-blur-xl border-white/10 text-white sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Share "{title}"
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Choose whether this content should be visible to your school network
            or public on the web.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">{shareBody}</div>
      </DialogContent>
    </Dialog>
  );
}
