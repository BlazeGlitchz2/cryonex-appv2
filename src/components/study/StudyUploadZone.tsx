import { useState, useCallback, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
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

import { useAuth } from "@/hooks/use-auth";

interface UploadFile {
  id: string;
  file?: File;
  url?: string;
  name: string;
  type: "pdf" | "image" | "video" | "audio" | "youtube" | "text";
  status:
  | "pending"
  | "uploading"
  | "extracting"
  | "summarizing"
  | "indexing"
  | "generating"
  | "complete"
  | "error";
  progress: number;
  error?: string;
  statusMessage?: string;
}

interface StudyUploadZoneProps {
  onUploadComplete?: (docId: string) => void;
}

export function StudyUploadZone({ onUploadComplete }: StudyUploadZoneProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const createMaterial = useMutation(api.study.createMaterial);
  const generateUploadUrl = useMutation(api.study.generateUploadUrl);
  const extractPDF = useAction(api.studyExtractor.extractPDF);
  const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);
  const setMaterialDocId = useMutation(api.studyMutations.setMaterialDocId);

  // New: store references to tabs opened during a user gesture so popups aren't blocked
  const pendingWindows = useRef<Record<string, Window | null>>({});

  // Config state
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState({ start: "", end: "" });
  const [smartMode, setSmartMode] = useState(true);
  const [configMode, setConfigMode] = useState<"full" | "range">("full");

  // Add: step labels and helper to compute current step index
  const STEP_LABELS: Array<string> = [
    "Uploading",
    "Extracting",
    "Summarizing",
    "Indexing",
    "Generating AI Assets",
    "Complete",
  ];

  const statusToStepIndex = (status: UploadFile["status"]): number => {
    switch (status) {
      case "pending":
      case "uploading":
        return 0;
      case "extracting":
        return 1;
      case "summarizing":
        return 2;
      case "indexing":
        return 3;
      case "generating":
        return 4;
      case "complete":
        return 5;
      case "error":
        return -1;
      default:
        return -1;
    }
  };

  // Add: retry logic on a single file
  const retryUpload = async (id: string) => {
    const f = files.find((x) => x.id === id);
    if (!f) return;
    // Reset visual state
    setFiles((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
            ...x,
            status: "pending",
            progress: 0,
            error: undefined,
            statusMessage: "Retrying...",
          }
          : x,
      ),
    );
    await uploadAndProcessFile({ ...f });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        processFiles(selectedFiles);
      }
    },
    [],
  );

  const processFiles = async (fileList: File[]) => {
    if (!user) {
      toast.error("Please sign in to upload files");
      return;
    }

    // Validate file types before processing
    const supportedExtensions = [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".mp4",
      ".webm",
      ".mov",
      ".avi",
      ".mp3",
      ".wav",
      ".m4a",
      ".ogg",
    ];
    const invalidFiles: string[] = [];
    const validFiles: File[] = [];

    fileList.forEach((file) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (supportedExtensions.includes(ext)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    // Show error for invalid files
    if (invalidFiles.length > 0) {
      toast.error(
        `Unsupported file type(s): ${invalidFiles.join(", ")}. Supported formats: PDF, JPG, PNG, MP4, MP3, and more.`,
        {
          duration: 5000,
        },
      );
    }

    // Only process valid files
    if (validFiles.length === 0) {
      return;
    }

    // Separate PDF for configuration
    const pdfFile = validFiles.find((f) =>
      f.name.toLowerCase().endsWith(".pdf"),
    );
    const otherFiles = validFiles.filter((f) => f !== pdfFile);

    if (pdfFile) {
      setPendingFile(pdfFile);
      setPageRange({ start: "", end: "" });
      setSmartMode(true);
      setConfigMode("full");
      setShowConfigDialog(true);
    }

    // Process other files immediately
    if (otherFiles.length > 0) {
      const newFiles: UploadFile[] = otherFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        type: getFileType(file),
        status: "pending",
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      for (const uploadFile of newFiles) {
        await uploadAndProcessFile(uploadFile);
      }
    }
  };

  const handleConfigConfirm = async () => {
    if (!pendingFile) return;

    const newFile: UploadFile = {
      id: Math.random().toString(36).substr(2, 9),
      file: pendingFile,
      name: pendingFile.name,
      type: "pdf",
      status: "pending",
      progress: 0,
    };

    setFiles((prev) => [...prev, newFile]);
    setShowConfigDialog(false);
    setPendingFile(null);

    let config = undefined;
    if (configMode === "range" && pageRange.start && pageRange.end) {
      config = {
        pageRange: {
          start: parseInt(pageRange.start),
          end: parseInt(pageRange.end),
        },
        smartMode,
      };
    }

    await uploadAndProcessFile(newFile, config);
  };

  const getFileType = (file: File): UploadFile["type"] => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || ""))
      return "image";
    if (["mp4", "webm", "mov", "avi"].includes(ext || "")) return "video";
    if (["mp3", "wav", "m4a", "ogg"].includes(ext || "")) return "audio";
    return "text";
  };

  const uploadAndProcessFile = async (
    uploadFile: UploadFile,
    config?: {
      pageRange?: { start: number; end: number };
      smartMode?: boolean;
    },
  ) => {
    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
              ...f,
              status: "uploading",
              progress: 5,
              statusMessage: "Starting upload...",
            }
            : f,
        ),
      );

      await new Promise((resolve) => setTimeout(resolve, 300));

      // Upload file to storage if it's a binary file (PDF, image, video, audio)
      let storageId: any = undefined;

      if (uploadFile.file && uploadFile.type !== "text") {
        try {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                  ...f,
                  progress: 10,
                  statusMessage: "Generating upload URL...",
                }
                : f,
            ),
          );

          const uploadUrl = await generateUploadUrl({});

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                  ...f,
                  progress: 15,
                  statusMessage: "Uploading to storage...",
                }
                : f,
            ),
          );

          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            body: uploadFile.file,
          });

          const result = await uploadResponse.json();
          storageId = result.storageId;

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                  ...f,
                  progress: 20,
                  statusMessage: `✅ File uploaded (ID: ${storageId.substring(0, 8)}...)`,
                }
                : f,
            ),
          );

          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (error) {
          console.error("Upload error:", error);
          throw new Error("Failed to upload file to storage");
        }
      }

      // For PDFs, trigger extraction pipeline
      if (uploadFile.type === "pdf" && storageId) {
        try {
          // First create the material in the database
          const materialId = await createMaterial({
            title: uploadFile.name,
            type: "pdf",
            storageId: storageId,
          });

          // Update to extracting
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                  ...f,
                  status: "extracting",
                  progress: 25,
                  statusMessage: "🤖 Sending PDF to Google Gemini...",
                }
                : f,
            ),
          );

          await new Promise((resolve) => setTimeout(resolve, 300));

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                  ...f,
                  progress: 35,
                  statusMessage: "📝 Gemini is reading the PDF...",
                }
                : f,
            ),
          );

          // Call extraction action (guest access supported)
          console.log("🚀 Starting PDF extraction...", {
            storageId,
            fileName: uploadFile.name,
            config,
          });

          const extractionResult = await extractPDF({
            storageId: storageId,
            fileName: uploadFile.name, // pass original filename so Space infers type from extension
            pageRange: config?.pageRange,
            smartMode: config?.smartMode,
          });

          console.log("✅ PDF extraction completed:", {
            docId: extractionResult.docId,
          });

          // Link the material with the extractor docId so Recent Materials can open the workspace correctly
          try {
            await setMaterialDocId({
              materialId,
              docId: extractionResult.docId,
            });
          } catch (linkErr) {
            console.warn(
              "Failed to link material to docId (non-fatal):",
              linkErr,
            );
          }

          // Update progress through stages
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                  ...f,
                  status: "summarizing",
                  progress: 50,
                  statusMessage: "✅ PDF extracted! Parsing content...",
                }
                : f,
            ),
          );

          await new Promise((resolve) => setTimeout(resolve, 300));

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                  ...f,
                  status: "indexing",
                  progress: 70,
                  statusMessage: "✂️ Chunking text for embeddings...",
                }
                : f,
            ),
          );

          await new Promise((resolve) => setTimeout(resolve, 300));

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                  ...f,
                  status: "generating",
                  progress: 80,
                  statusMessage: "🔢 Generating embeddings...",
                }
                : f,
            ),
          );

          await new Promise((resolve) => setTimeout(resolve, 300));

          // New: Auto-generate study assets (flashcards, quiz, notes, podcast)
          try {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id
                  ? {
                    ...f,
                    status: "generating",
                    progress: 88,
                    statusMessage:
                      "📚 Creating flashcards, quizzes, and notes...",
                  }
                  : f,
              ),
            );

            const gen = await generateAllAssets({
              materialId,
              content: extractionResult.text,
              title: uploadFile.name,
            });

            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id
                  ? {
                    ...f,
                    status: "generating",
                    progress: 94,
                    statusMessage: `✨ Generated ${gen.flashcardsCount} flashcards, ${gen.quizQuestionsCount} quiz Qs, and notes`,
                  }
                  : f,
              ),
            );
          } catch (genErr: any) {
            // If Bytez API key missing or any generation error, continue gracefully
            console.error("Auto-generate error:", genErr);
            toast.error(
              "AI asset generation failed. You can retry later from the material.",
              { duration: 4000 },
            );
          }

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                  ...f,
                  status: "generating",
                  progress: 96,
                  statusMessage: "💾 Storing in database...",
                }
                : f,
            ),
          );

          await new Promise((resolve) => setTimeout(resolve, 300));

          // Update status to complete
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                  ...f,
                  status: "complete",
                  progress: 100,
                  statusMessage: `✅ Ready! (${extractionResult.chunks.length} chunks, ${extractionResult.isSTEM ? "STEM" : "General"})`,
                }
                : f,
            ),
          );

          toast.success(`${uploadFile.name} processed successfully`);

          // Add a small delay to ensure database transaction is committed
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Redirect to the workspace using the custom docId
          const workspaceUrl = `/study/workspace/${extractionResult.docId}`;

          console.log(
            "📍 Redirecting to workspace with docId:",
            extractionResult.docId,
          );
          console.log("📍 Full workspace URL:", workspaceUrl);

          // Dispatch event for StudyMaterials to auto-open the PDF workspace
          window.dispatchEvent(
            new CustomEvent("pdfUploaded", {
              detail: {
                materialId: materialId,
                storageId: storageId,
                docId: extractionResult.docId,
              },
            }),
          );

          // Close any pre-opened tabs (not needed when using in-page navigation)
          const preOpened = pendingWindows.current[uploadFile.id];
          if (preOpened && !preOpened.closed) {
            try {
              preOpened.close();
            } catch { }
          }
          pendingWindows.current[uploadFile.id] = null;

          // Navigate in the same page to the workspace
          navigate(workspaceUrl);

          if (onUploadComplete) {
            onUploadComplete(extractionResult.docId);
          }
        } catch (extractError: any) {
          // If extraction failed, close any pre-opened blank tab
          const w = pendingWindows.current[uploadFile.id];
          if (w && !w.closed) {
            try {
              w.close();
            } catch { }
          }
          pendingWindows.current[uploadFile.id] = null;
          console.error("Extraction error:", extractError);
          throw extractError;
        }
      } else {
        // For non-PDF files, just create material
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                ...f,
                status: "summarizing",
                progress: 50,
                statusMessage: "Processing...",
              }
              : f,
          ),
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const materialId = await createMaterial({
          title: uploadFile.name,
          type: uploadFile.type,
          content:
            uploadFile.type === "text" && uploadFile.file
              ? await uploadFile.file.text()
              : undefined,
          storageId: storageId,
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                ...f,
                status: "complete",
                progress: 100,
                statusMessage: "✅ Ready!",
              }
              : f,
          ),
        );

        toast.success(`${uploadFile.name} uploaded successfully`);
      }
    } catch (error: any) {
      let errorMessage = error.message;

      // Edge case handling with more specific messages
      if (
        errorMessage.includes("encrypted") ||
        errorMessage.includes("locked")
      ) {
        errorMessage =
          "🔒 Cannot extract — encrypted file. Please unlock the PDF first.";
      } else if (
        errorMessage.includes("too short") ||
        errorMessage.includes("< 50") ||
        errorMessage.includes("50 characters")
      ) {
        errorMessage =
          "📄 PDF extraction incomplete. The file may be image-only or have minimal text. Try a text-based PDF.";
      } else if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("45 seconds")
      ) {
        errorMessage =
          "⏱️ Extraction timeout (45s). The PDF may be too large. Try a smaller file.";
      } else if (
        errorMessage.includes("Authentication required") ||
        errorMessage.includes("User not found")
      ) {
        errorMessage = "Authentication required. Please sign in to upload.";
      } else if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("network")
      ) {
        errorMessage = "🌐 Network error. Check your connection and try again.";
      } else if (
        errorMessage.includes("Gradio") ||
        errorMessage.includes("Hugging Face")
      ) {
        errorMessage =
          "🤗 Hugging Face API error. The service may be temporarily unavailable.";
      } else if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("Too Many Requests") ||
        errorMessage.includes("429")
      ) {
        errorMessage =
          "⏱️ API rate limit reached. Please wait a few minutes before uploading more PDFs.";
      } else if (
        errorMessage.includes("API key") ||
        errorMessage.includes("401")
      ) {
        errorMessage =
          "🔑 API authentication failed. Please check your API keys in the backend settings.";
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
              ...f,
              status: "error",
              error: errorMessage,
              statusMessage: "❌ Failed",
            }
            : f,
        ),
      );
      toast.error(`Failed to upload ${uploadFile.name}: ${errorMessage}`);

      // Ensure any pre-opened tab is closed on failure
      const w = pendingWindows.current[uploadFile.id];
      if (w && !w.closed) {
        try {
          w.close();
        } catch { }
      }
      pendingWindows.current[uploadFile.id] = null;
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getIcon = (type: UploadFile["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "image":
        return <Image className="h-5 w-5" />;
      case "video":
      case "youtube":
        return <Video className="h-5 w-5" />;
      case "audio":
        return <Music className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-all ${isDragging
          ? "border-white bg-white/5"
          : "border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#1a1a1a]"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Drop files here or click to upload
              </h3>
              <p className="text-sm text-[#6b6b6b] mb-4">
                Support for PDFs, videos, audio, images, and more
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
                className="bg-white text-black hover:bg-white/90"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Select Files
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-xs text-[#6b6b6b] px-2 py-1 rounded bg-[#2a2a2a]">
                PDF
              </span>
              <span className="text-xs text-[#6b6b6b] px-2 py-1 rounded bg-[#2a2a2a]">
                Video
              </span>
              <span className="text-xs text-[#6b6b6b] px-2 py-1 rounded bg-[#2a2a2a]">
                Audio
              </span>
              <span className="text-xs text-[#6b6b6b] px-2 py-1 rounded bg-[#2a2a2a]">
                Images
              </span>


              <span className="text-xs text-[#6b6b6b] px-2 py-1 rounded bg-[#2a2a2a]">
                Video
              </span>
              <span className="text-xs text-[#6b6b6b] px-2 py-1 rounded bg-[#2a2a2a]">
                Audio
              </span>
              <span className="text-xs text-[#6b6b6b] px-2 py-1 rounded bg-[#2a2a2a]">
                Images
              </span>
              <span className="text-xs text-[#6b6b6b] px-2 py-1 rounded bg-[#2a2a2a]">
                YouTube
              </span>
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
                <Card key={file.id} className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
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
                              <Badge className="bg-white/10 text-white">
                                {STEP_LABELS[currentStep]}
                              </Badge>
                            ) : (
                              file.status === "error" && (
                                <Badge className="bg-red-500/20 text-red-300 border border-red-500/40">
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
                                      ? "bg-blue-400 w-10"
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
                            <p className="text-xs text-[#6b6b6b]">
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
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
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
                      className="bg-[#2a2a2a] border-white/10"
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
                      className="bg-[#2a2a2a] border-white/10"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between space-x-2 bg-white/5 p-3 rounded-lg">
                  <div className="space-y-1">
                    <Label>Smart Page Detection</Label>
                    <p className="text-xs text-gray-400">
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
