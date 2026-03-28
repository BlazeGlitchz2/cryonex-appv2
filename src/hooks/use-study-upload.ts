import { useState, useCallback, useRef } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNetworkStatus } from "@/hooks/use-network-status";

export interface UploadFile {
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

interface UseStudyUploadProps {
  onUploadComplete?: (docId: string) => void;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
}

export function useStudyUpload({ onUploadComplete }: UseStudyUploadProps = {}) {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const wallet = useQuery(api.credits.getWallet);

  const createMaterial = useMutation(api.study.createMaterial);
  const generateUploadUrl = useMutation(api.study.generateUploadUrl);
  const extractPDF = useAction(api.studyExtractor.extractPDF);
  const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);
  const getPipelineReadiness = useAction(api.studyRuntime.getPipelineReadiness);
  const setMaterialDocId = useMutation(api.studyMutations.setMaterialDocId);
  const ensureMaterialWorkspace = useMutation(
    api.studyMutations.ensureMaterialWorkspace,
  );

  // Store references to tabs opened during a user gesture so popups aren't blocked
  const pendingWindows = useRef<Record<string, Window | null>>({});

  // Config state
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [, setQueuedPdfFiles] = useState<File[]>([]);
  const [pageRange, setPageRange] = useState({ start: "", end: "" });
  const [smartMode, setSmartMode] = useState(true);
  const [configMode, setConfigMode] = useState<"full" | "range">("full");
  const cryoBalance = Number(wallet?.cryoCredits ?? 0);

  const primePdfConfig = useCallback((file: File) => {
    setPendingFile(file);
    setPageRange({ start: "", end: "" });
    setSmartMode(true);
    setConfigMode("full");
    setShowConfigDialog(true);
  }, []);

  const advanceQueuedPdf = useCallback(() => {
    setQueuedPdfFiles((prev) => {
      const [nextFile, ...rest] = prev;

      if (nextFile) {
        primePdfConfig(nextFile);
      } else {
        setPendingFile(null);
        setShowConfigDialog(false);
      }

      return rest;
    });
  }, [primePdfConfig]);

  const handleConfigCancel = useCallback(() => {
    setPendingFile(null);
    setShowConfigDialog(false);
    advanceQueuedPdf();
  }, [advanceQueuedPdf]);

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

  const processFiles = async (fileList: File[]) => {
      if (!isOnline) {
        toast.error("You're offline. Files can't be uploaded right now.", {
          id: "offline-upload",
          duration: 4000,
        });
        return;
      }

      if (!user) {
        toast.error("Please sign in to upload files");
        return;
      }

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

      if (invalidFiles.length > 0) {
        toast.error(
          `Unsupported file type(s): ${invalidFiles.join(", ")}. Supported formats: PDF, JPG, PNG, MP4, MP3, and more.`,
          {
            duration: 5000,
          },
        );
      }

      if (validFiles.length === 0) {
        return;
      }

      const pdfFiles = validFiles.filter((file) =>
        file.name.toLowerCase().endsWith(".pdf"),
      );
      const otherFiles = validFiles.filter(
        (file) => !file.name.toLowerCase().endsWith(".pdf"),
      );

      if (pdfFiles.length > 0) {
        const readiness = await getPipelineReadiness({});
        if (!readiness.canUploadPdf) {
          toast.error(
            `PDF study packs are not ready yet. Missing: ${readiness.missingForPdfUpload.join(", ")}`,
            { duration: 6000 },
          );
          return;
        }

        if (wallet !== undefined && cryoBalance < 10) {
          toast.error(
            "You need 10 Cryo Credits to extract a PDF. Open Cryo Credits to refill +10, or wait for the daily refill to restore your balance.",
            { duration: 6000 },
          );
          return;
        }
      }

      if (pdfFiles.length > 0) {
        if (pdfFiles.length > 1) {
          toast.message(`Queued ${pdfFiles.length} PDFs for setup.`, {
            description:
              "Confirm the processing options for each PDF in order.",
          });
        }

        const [firstPdf, ...remainingPdfs] = pdfFiles;
        if (firstPdf) {
          if (pendingFile || showConfigDialog) {
            setQueuedPdfFiles((prev) => [...prev, firstPdf, ...remainingPdfs]);
          } else {
            primePdfConfig(firstPdf);
            setQueuedPdfFiles((prev) => [...prev, ...remainingPdfs]);
          }
        }
      }

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

    if (wallet !== undefined && cryoBalance < 10) {
      toast.error(
        "You need 10 Cryo Credits to extract a PDF. Open Cryo Credits to refill +10, or wait for the daily refill to restore your balance.",
        { duration: 6000 },
      );
      return;
    }

    const newFile: UploadFile = {
      id: Math.random().toString(36).substr(2, 9),
      file: pendingFile,
      name: pendingFile.name,
      type: "pdf",
      status: "pending",
      progress: 0,
    };

    setFiles((prev) => [...prev, newFile]);
    setPendingFile(null);
    setShowConfigDialog(false);

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

    advanceQueuedPdf();
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
      let storageId: Id<"_storage"> | undefined;
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

          const result = (await uploadResponse.json()) as {
            storageId?: Id<"_storage">;
          };

          if (!result.storageId) {
            throw new Error("Upload completed without a storage id");
          }

          const uploadedStorageId = result.storageId;
          const uploadedStorageLabel = String(uploadedStorageId).slice(0, 8);
          storageId = uploadedStorageId;

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    progress: 20,
                    statusMessage: `✅ File uploaded (ID: ${uploadedStorageLabel}...)`,
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
            docId: extractionResult.docId,
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

          await ensureMaterialWorkspace({
            docId: extractionResult.docId,
          });

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
            } catch {
              // Best effort cleanup for a pre-opened tab.
            }
          }
          pendingWindows.current[uploadFile.id] = null;

          // Navigate in the same page to the workspace
          navigate(workspaceUrl);

          if (onUploadComplete) {
            onUploadComplete(extractionResult.docId);
          }
        } catch (extractError) {
          // If extraction failed, close any pre-opened blank tab
          const w = pendingWindows.current[uploadFile.id];
          if (w && !w.closed) {
            try {
              w.close();
            } catch {
              // Best effort cleanup for a pre-opened tab.
            }
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

        await createMaterial({
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
    } catch (error) {
      let errorMessage = getErrorMessage(error);

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
        errorMessage.includes("Insufficient Cryo Credits") ||
        errorMessage.includes("requires 10 Cryo Credits")
      ) {
        errorMessage =
          "You need 10 Cryo Credits to extract a PDF. Open Cryo Credits and tap Watch to refill +10 instantly, then try again.";
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
          } catch {
            // Best effort cleanup for a pre-opened tab.
          }
        }
      pendingWindows.current[uploadFile.id] = null;
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
      e.target.value = "";
    }
  };

  return {
    files,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    removeFile,
    retryUpload,
    processFiles,
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
    handleConfigCancel,
  };
}
