import { useEffect, useRef } from "react";
import { Camera, Upload, X, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDeviceInfo } from "@/hooks/use-mobile";
import { useStudyUpload } from "@/hooks/use-study-upload";
import { hapticFeedback, isAndroid, isIOS, isIPadOS } from "@/lib/mobile";

interface MobileStudyUploadZoneProps {
  onUploadComplete?: (docId: string) => void;
  initialAction?: "scan" | "upload" | null;
}

export function MobileStudyUploadZone({
  onUploadComplete,
  initialAction = null,
}: MobileStudyUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const autoOpenedActionRef = useRef<"scan" | "upload" | null>(null);
  const androidDevice = isAndroid();
  const iosDevice = isIOS();
  const ipadDevice = isIPadOS();
  const { isTablet } = useDeviceInfo();
  const tabletLayout = isTablet || ipadDevice;

  const { files, handleFileSelect, removeFile, retryUpload } = useStudyUpload({
    onUploadComplete,
  });

  const openLibraryPicker = async () => {
    await hapticFeedback("light");
    fileInputRef.current?.click();
  };

  const openCameraPicker = async () => {
    await hapticFeedback("medium");
    cameraInputRef.current?.click();
  };

  const libraryLabel = ipadDevice
    ? "Choose Files"
    : iosDevice
      ? "Browse Files"
      : androidDevice && tabletLayout
        ? "Pick Files"
        : "Select Files";
  const cameraLabel = ipadDevice
    ? "Scan with Camera"
    : iosDevice
      ? "Import Photo"
      : androidDevice && tabletLayout
        ? "Scan Document"
        : "Capture Photo";
  const helperText = ipadDevice
    ? "iPad keeps the library and camera lanes separate so lecture slides and paper scans feel native."
    : iosDevice
      ? "iPhone opens a lighter file picker for docs and a direct camera lane for quick scans."
      : androidDevice && tabletLayout
        ? "Android tablets use a split layout so file imports and document scans stay one tap away."
        : androidDevice
          ? "Android opens the camera directly for scans. Library upload still handles PDFs, video, audio, and images."
          : "Use the library for mixed study files or the camera lane for quick paper captures.";

  useEffect(() => {
    if (!initialAction) {
      autoOpenedActionRef.current = null;
      return;
    }

    if (autoOpenedActionRef.current === initialAction) return;
    autoOpenedActionRef.current = initialAction;

    const timeoutId = window.setTimeout(() => {
      if (initialAction === "scan") {
        void (androidDevice ? openCameraPicker() : openLibraryPicker());
        return;
      }

      void openLibraryPicker();
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [androidDevice, initialAction]);

  return (
    <div className="space-y-4 p-4 pb-8 sm:p-5">
      {/* Mobile-optimized Upload Button */}
      <div className="space-y-4">
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          ref={fileInputRef}
          accept=".pdf,.jpg,.jpeg,.png,.mp4,.webm,.mov,.mp3,.wav,.m4a"
        />
        <input
          type="file"
          multiple={false}
          onChange={handleFileSelect}
          className="hidden"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
        />

        <div
          className={
            tabletLayout || androidDevice
              ? "grid grid-cols-2 gap-3"
              : "space-y-3"
          }
        >
          <Button
            type="button"
            className="h-14 w-full rounded-2xl bg-white text-black text-base font-semibold shadow-lg shadow-white/10 hover:bg-white/90 sm:h-15"
            onClick={openLibraryPicker}
          >
            <Upload className="mr-3 h-5 w-5" />
            {libraryLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-14 w-full rounded-2xl border-white/10 bg-white/[0.04] text-white text-base font-semibold hover:bg-white/[0.08] sm:h-15"
            onClick={openCameraPicker}
          >
            <Camera className="mr-3 h-5 w-5" />
            {cameraLabel}
          </Button>
        </div>

        <p className="text-center text-xs text-[#6b6b6b]">{helperText}</p>
      </div>

      {/* Upload Progress List for Mobile */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {files.map((file) => {
              return (
                <Card
                  key={file.id}
                  className="overflow-hidden border-[#2a2a2a] bg-[#1a1a1a]"
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex gap-3">
                      <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                        {file.status === "complete" ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : file.status === "error" ? (
                          <X className="h-5 w-5 text-red-400" />
                        ) : (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <p className="max-w-[170px] truncate text-sm font-medium text-white sm:max-w-[220px]">
                            {file.name}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(file.id)}
                            className="h-9 w-9 text-white/50 hover:text-white touch-feedback"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Simplified Progress for Mobile */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#6b6b6b]">
                              {file.statusMessage || file.status}
                            </span>
                            <span className="text-white/60 font-mono">
                              {file.progress}%
                            </span>
                          </div>
                          <Progress value={file.progress} className="h-1.5" />
                        </div>

                        {file.status === "error" && (
                          <div className="mt-3 flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-full border-white/20 px-4 text-xs text-white touch-feedback"
                              onClick={() => retryUpload(file.id)}
                            >
                              Retry
                            </Button>
                          </div>
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
    </div>
  );
}
