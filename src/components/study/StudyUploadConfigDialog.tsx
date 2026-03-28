import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface StudyUploadConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  configMode: "full" | "range";
  setConfigMode: (mode: "full" | "range") => void;
  pageRange: { start: string; end: string };
  setPageRange: Dispatch<SetStateAction<{ start: string; end: string }>>;
  smartMode: boolean;
  setSmartMode: (value: boolean) => void;
}

export function StudyUploadConfigDialog({
  open,
  onOpenChange,
  onCancel,
  onConfirm,
  configMode,
  setConfigMode,
  pageRange,
  setPageRange,
  smartMode,
  setSmartMode,
}: StudyUploadConfigDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCancel();
          return;
        }

        onOpenChange(true);
      }}
    >
      <DialogContent className="border-white/10 bg-[#09041d]/96 text-white">
        <DialogHeader>
          <DialogTitle>PDF Processing Options</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>How would you like to process this PDF?</Label>
            <div className="flex gap-4">
              <Button
                variant={configMode === "full" ? "default" : "outline"}
                onClick={() => setConfigMode("full")}
                className={
                  configMode === "full"
                    ? "bg-white text-black"
                    : "border-white/20"
                }
              >
                Full Document
              </Button>
              <Button
                variant={configMode === "range" ? "default" : "outline"}
                onClick={() => setConfigMode("range")}
                className={
                  configMode === "range"
                    ? "bg-white text-black"
                    : "border-white/20"
                }
              >
                Page Range
              </Button>
            </div>
          </div>

          {configMode === "range" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Page</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 19"
                    value={pageRange.start}
                    onChange={(event) =>
                      setPageRange((prev) => ({
                        ...prev,
                        start: event.target.value,
                      }))
                    }
                    className="border-white/10 bg-white/[0.04]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Page</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 27"
                    value={pageRange.end}
                    onChange={(event) =>
                      setPageRange((prev) => ({
                        ...prev,
                        end: event.target.value,
                      }))
                    }
                    className="border-white/10 bg-white/[0.04]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="space-y-1">
                  <Label>Smart Page Detection</Label>
                  <p className="text-xs text-white/45">
                    Auto-detect actual book pages (ignoring roman
                    numerals/intro)
                  </p>
                </div>
                <Switch checked={smartMode} onCheckedChange={setSmartMode} />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-white text-black hover:bg-white/90"
          >
            Start Processing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
