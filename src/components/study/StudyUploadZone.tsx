import {
  Upload,
  FileText,
  Image,
  Video,
  Music,
  Link as LinkIcon,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStudyUpload } from "@/hooks/use-study-upload";

interface StudyUploadZoneProps {
  onUploadComplete?: (docId: string) => void;
}

const supportedFormats = [
  { label: "PDF", icon: FileText },
  { label: "Video", icon: Video },
  { label: "Audio", icon: Music },
  { label: "Image", icon: Image },
  { label: "Link", icon: LinkIcon },
];

export function StudyUploadZone({ onUploadComplete }: StudyUploadZoneProps) {
  const {
    files,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    removeFile,
    retryUpload,
    STEP_LABELS,
    statusToStepIndex,
    showConfigDialog,
    setShowConfigDialog,
    configMode,
    setConfigMode,
    pageRange,
    setPageRange,
    smartMode,
    setSmartMode,
    handleConfigConfirm,
  } = useStudyUpload({ onUploadComplete });

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        className={`dashboard-surface rounded-[2rem] border-2 border-dashed transition-all ${
          isDragging
            ? "border-white/20 bg-white/[0.05]"
            : "border-white/[0.08] hover:border-white/[0.16]"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.6rem] border border-white/[0.08] bg-white/[0.04]">
              <Upload className="h-8 w-8 text-[#7dd3fc]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/56">
                Source intake
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
                Drop files here or click to upload
              </h3>
              <p className="mt-3 mb-4 text-sm leading-6 text-white/54">
                Bring in PDFs, lecture audio, screenshots, or links and keep
                everything inside the same study workbench.
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png,.mp4,.webm,.mov,.mp3,.wav,.m4a"
              />
              <Button
                className="rounded-full bg-white px-6 text-xs font-semibold uppercase tracking-[0.18em] text-black hover:bg-white/90"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Select Files
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {supportedFormats.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/62"
                >
                  <item.icon className="h-3.5 w-3.5 text-white/45" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {files.map((file) => {
              const currentStep = statusToStepIndex(file.status);
              return (
                <Card
                  key={file.id}
                  className="dashboard-subtle-panel rounded-[1.6rem] border-white/[0.06]"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white">
                        {file.status === "complete" ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : file.status === "error" ? (
                          <X className="h-5 w-5 text-red-400" />
                        ) : (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-white truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2">
                            {/* Show step badge for quick glance */}
                            {currentStep >= 0 ? (
                              <Badge className="border border-white/[0.08] bg-white/[0.05] text-white">
                                {STEP_LABELS[currentStep]}
                              </Badge>
                            ) : (
                              file.status === "error" && (
                                <Badge className="border border-red-500/40 bg-red-500/20 text-red-300">
                                  Error
                                </Badge>
                              )
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Replace opaque bar with clear step indicator + keep progress bar */}
                        <div className="mb-2">
                          <div className="flex items-center gap-2 mb-2">
                            {STEP_LABELS.map((label, idx) => {
                              const isDone = currentStep > idx;
                              const isActive = currentStep === idx;
                              const base = "h-2 rounded-full transition-all";
                              const cls =
                                currentStep < 0
                                  ? "bg-red-500/30 w-8"
                                  : isDone
                                    ? "bg-green-500 w-10"
                                    : isActive
                                      ? "bg-[#7dd3fc] w-10"
                                      : "bg-white/10 w-8";
                              return (
                                <div
                                  key={label}
                                  className={`${base} ${cls}`}
                                  title={label}
                                />
                              );
                            })}
                          </div>
                          <Progress value={file.progress} className="h-1" />
                        </div>

                        {file.status === "error" ? (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-red-400">{file.error}</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white"
                                onClick={() => retryUpload(file.id)}
                              >
                                Retry
                              </Button>
                              <Button
                                size="sm"
                                className="bg-white text-black hover:bg-white/90"
                                onClick={() =>
                                  window.open(
                                    "/study/dashboard",
                                    "_blank",
                                    "noopener,noreferrer",
                                  )
                                }
                              >
                                Go to Dashboard
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs text-white/46">
                              {file.statusMessage || file.status}
                            </p>
                            {file.status === "complete" && (
                              <div className="mt-2 flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-white text-black hover:bg-white/90"
                                  onClick={() =>
                                    window.open(
                                      "/study/dashboard",
                                      "_blank",
                                      "noopener,noreferrer",
                                    )
                                  }
                                >
                                  View in Dashboard
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="dashboard-surface border-white/[0.08] text-white">
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
                      onChange={(e) =>
                        setPageRange((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                      className="border-white/[0.08] bg-white/[0.04]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Page</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 27"
                      value={pageRange.end}
                      onChange={(e) =>
                        setPageRange((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                      className="border-white/[0.08] bg-white/[0.04]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between space-x-2 rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
                  <div className="space-y-1">
                    <Label>Smart Page Detection</Label>
                    <p className="text-xs text-white/46">
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
            <Button variant="ghost" onClick={() => setShowConfigDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfigConfirm}
              className="bg-white text-black hover:bg-white/90"
            >
              Start Processing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
