import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  FileText,
  Image,
  Video,
  Music,
  Link as LinkIcon,
  Plus,
  Trash2,
  Mic,
  MessageSquare,
  Headphones,
  Brain,
  ClipboardList,
  FolderPlus,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudyUploadZone } from "./StudyUploadZone";
import { MobileStudyUploadZone } from "./MobileStudyUploadZone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PDFViewer } from "./PDFViewer";
import { PDFChat } from "./PDFChat";
import { PDFAssetsPanel } from "./PDFAssetsPanel";
import { AudioRecorder } from "./AudioRecorder";
import { StudyFlashcards } from "./StudyFlashcards";
import { StudyQuizzes } from "./StudyQuizzes";
import { StudyNotes } from "./StudyNotes";
import { StudyPodcast } from "./StudyPodcast";
import { useIsMobile } from "@/hooks/use-mobile";

export function StudyMaterials() {
  const materials = useQuery(api.study.listMaterials, {});
  const folders = useQuery(api.study.listFolders, {});
  const createMaterial = useMutation(api.study.createMaterial);
  const createFolder = useMutation(api.study.createFolder);
  const processPDF = useAction(api.pdfProcessor.processPDFEnhanced);
  const generateAssets = useAction(api.autoGenerate.generateAllAssets);
  // const transcribeAudio = useAction(api.studyAI.transcribeAudio);

  const isMobile = useIsMobile();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<
    "pdf" | "image" | "video" | "audio" | "text" | "youtube"
  >("text");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [selectedPDF, setSelectedPDF] = useState<any>(null);
  const [pdfData, setPdfData] = useState<any>(null);
  const [generatedAssets, setGeneratedAssets] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [activeView, setActiveView] = useState<
    "notes" | "chat" | "podcast" | "flashcards" | "quiz"
  >("notes");
  const [editableNotes, setEditableNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("#8b5cf6");
  const [isLoading, setIsLoading] = useState(false);

  // Listen for PDF uploads from StudyUploadZone
  useEffect(() => {
    const handlePDFUpload = async (event: any) => {
      const { materialId, storageId } = event.detail;

      console.log("✅ ========== PDF UPLOAD EVENT RECEIVED ==========");
      console.log("📤 Event details:", { materialId, storageId });

      // Dismiss any existing toasts immediately
      toast.dismiss();

      // Wait for the material to be created and appear in the query
      let attempts = 0;
      const maxAttempts = 20;

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const latestPDF = materials?.find(
          (m) =>
            m._id === materialId ||
            (m.type === "pdf" && m.storageId === storageId),
        );

        if (latestPDF) {
          console.log(
            "✅ Found PDF material, triggering auto-processing:",
            latestPDF.title,
          );

          // CRITICAL: Set state synchronously before async operations
          setSelectedPDF(latestPDF);
          setIsProcessing(true);
          setPdfData(null);
          setGeneratedAssets(null);

          // Force a small delay to ensure UI updates
          await new Promise((resolve) => setTimeout(resolve, 100));

          try {
            await handlePDFClick(latestPDF);
            console.log("✅ handlePDFClick completed successfully");
          } catch (error: any) {
            console.error("❌ handlePDFClick failed:", error);
            toast.error(`Failed to process PDF: ${error.message}`);
            setSelectedPDF(null);
            setIsProcessing(false);
          }
          break;
        }

        attempts++;
        console.log(
          `⏳ Waiting for material to appear in database... (attempt ${attempts}/${maxAttempts})`,
        );
      }

      if (attempts >= maxAttempts) {
        console.error("❌ Failed to find PDF material after upload");
        toast.error(
          "Failed to load PDF. Please click on it manually to process.",
        );
      }
    };

    window.addEventListener("pdfUploaded", handlePDFUpload);
    return () => window.removeEventListener("pdfUploaded", handlePDFUpload);
  }, [materials]);

  const handleAddMaterial = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      const materialId = await createMaterial({
        title,
        type,
        content: content || undefined,
        url: url || undefined,
      });

      toast.success("Material added successfully");
      setShowAddDialog(false);
      setTitle("");
      setContent("");
      setUrl("");
      setType("text");

      // Auto-generate assets for text-based materials
      if (type === "text" && content && content.trim().length > 100) {
        setIsProcessing(true);
        const loadingToast = toast.loading("✨ Generating study assets...");

        try {
          const assets = await generateAssets({
            materialId: materialId,
            content: content,
            title: title,
          });

          toast.dismiss(loadingToast);
          toast.success(
            `✨ Generated ${assets.flashcardsCount} flashcards & ${assets.quizQuestionsCount} quiz questions!`,
            {
              duration: 5000,
            },
          );
        } catch (error: any) {
          toast.dismiss(loadingToast);
          toast.error(error.message || "Failed to generate assets");
        } finally {
          setIsProcessing(false);
        }
      }

      // If it's a PDF, automatically process it
      if (type === "pdf") {
        const material = materials?.find((m) => m._id === materialId);
        if (material) {
          await handlePDFClick(material);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add material");
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      await createFolder({
        name: folderName,
        color: folderColor,
      });

      toast.success("Folder created successfully");
      setShowFolderDialog(false);
      setFolderName("");
      setFolderColor("#8b5cf6");
    } catch (error: any) {
      toast.error(error.message || "Failed to create folder");
    }
  };

  const handlePDFClick = async (material: any) => {
    console.log("🎯 ========== handlePDFClick CALLED ==========");
    console.log("📋 Material:", material);

    if (material.type !== "pdf") {
      console.error("❌ Material is not a PDF");
      toast.error("This material is not a PDF");
      return;
    }

    if (!material.storageId) {
      console.error("❌ No storageId found");
      toast.error("PDF file not found in storage. Please re-upload the PDF.");
      return;
    }

    console.log("✅ Validation passed, starting processing...");

    // Always ensure processing state is set
    setSelectedPDF(material);
    setIsProcessing(true);

    try {
      console.log("📄 Step 1: Starting PDF processing...");

      const processed = await processPDF({ storageId: material.storageId });
      console.log(
        "✅ PDF processed successfully. Text length:",
        processed.text.length,
      );
      setPdfData(processed);

      // Store chunks globally for chat component
      (window as any).__pdfChunks = processed.chunks;
      console.log("💾 Stored", processed.chunks.length, "chunks globally");

      console.log("🎨 Step 2: Starting asset generation...");

      if (!processed.text || processed.text.trim().length < 100) {
        throw new Error(
          "Extracted text is too short to generate meaningful assets. The PDF may be empty or image-based.",
        );
      }

      const assets = await generateAssets({
        materialId: material._id,
        content: processed.text,
        title: material.title,
      });

      console.log("✅ Assets generated successfully!");
      console.log("📊 Flashcards count:", assets.flashcardsCount);
      console.log("📊 Quiz questions count:", assets.quizQuestionsCount);

      setGeneratedAssets(assets);
      setEditableNotes(assets.summary_detailed || assets.summary_short || "");
      setActiveView("notes");

      // Force state update to ensure two-panel layout renders
      setIsProcessing(false);

      // Small delay to ensure state is fully updated before showing success
      setTimeout(() => {
        toast.success(
          `✨ Study workspace ready! ${assets.flashcardsCount} flashcards & ${assets.quizQuestionsCount} quiz questions generated.`,
          {
            duration: 5000,
          },
        );
      }, 100);

      console.log("🎉 ========== AUTO-GENERATION COMPLETE ==========");
      console.log("📋 State check - selectedPDF:", material._id);
      console.log("📋 State check - pdfData exists:", !!processed);
      console.log("📋 State check - isProcessing:", false);
    } catch (error: any) {
      console.error("❌ ========== ERROR IN handlePDFClick ==========");
      console.error("Error:", error);
      toast.error(error.message || "Failed to process PDF");
      setSelectedPDF(null);
      setIsProcessing(false);
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      toast.loading("Processing audio recording...");

      // For now, create a text-based material with placeholder
      // Full audio upload/transcription requires additional Convex storage setup
      await createMaterial({
        title: `Audio Recording - ${new Date().toLocaleDateString()}`,
        type: "audio",
        content:
          "Audio recording captured. Transcription feature requires OpenAI Whisper API configuration.",
      });

      toast.success("Audio recording saved!");
      setShowRecorder(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save audio");
    }
  };

  const getIcon = (materialType: string) => {
    switch (materialType) {
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

  // Filter materials based on search and folder
  const filteredMaterials = materials?.filter((material) => {
    const matchesSearch = material.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFolder =
      !selectedFolder || material.folderId === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  // Show processing screen while PDF is being processed
  if (selectedPDF && isProcessing) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-full max-w-2xl mx-auto p-8">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-8 border border-blue-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Creating Your Notes
              </h2>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <div className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                This should take a few minutes...
              </div>
            </div>

            <div className="mb-8">
              <div className="text-6xl font-bold text-white text-center mb-4">
                0%
              </div>
              <div className="h-3 bg-[#0a0a0a] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse w-0" />
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-white/80 text-lg">Uploading your content</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm font-medium mb-1">TIP</p>
              <p className="text-white/60 text-sm flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border border-white/60 flex items-center justify-center text-xs">
                  i
                </span>
                Record lectures with your phone and Cryonex will transcribe them
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If PDF is selected and processing is complete, show enhanced workspace with sidebar navigation
  if (selectedPDF && !isProcessing && pdfData) {
    return (
      <div className="h-full flex bg-[#0a0a0a]">
        {/* Left Sidebar with icon navigation */}
        <div className="w-16 border-r border-[#1a1a1a] flex flex-col items-center py-6 gap-6 bg-[#0a0a0a]">
          <button
            onClick={() => setActiveView("notes")}
            className={`p-3 rounded-lg transition-all duration-200 ${activeView === "notes"
              ? "bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/20"
              : "text-[#6b6b6b] hover:text-white hover:bg-white/5"
              }`}
            title="Notes"
          >
            <FileText className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveView("chat")}
            className={`p-3 rounded-lg transition-all duration-200 ${activeView === "chat"
              ? "bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/20"
              : "text-[#6b6b6b] hover:text-white hover:bg-white/5"
              }`}
            title="Chat"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveView("flashcards")}
            className={`relative p-3 rounded-lg transition-all duration-200 ${activeView === "flashcards"
              ? "bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/20"
              : "text-[#6b6b6b] hover:text-white hover:bg-white/5"
              }`}
            title="Flashcards"
          >
            <Brain className="h-5 w-5" />
            {generatedAssets?.flashcardsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                {generatedAssets.flashcardsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView("quiz")}
            className={`relative p-3 rounded-lg transition-all duration-200 ${activeView === "quiz"
              ? "bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/20"
              : "text-[#6b6b6b] hover:text-white hover:bg-white/5"
              }`}
            title="Quiz"
          >
            <ClipboardList className="h-5 w-5" />
            {generatedAssets?.quizQuestionsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                {generatedAssets.quizQuestionsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView("podcast")}
            className={`p-3 rounded-lg transition-all duration-200 ${activeView === "podcast"
              ? "bg-gradient-to-br from-orange-500/20 to-orange-600/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/20"
              : "text-[#6b6b6b] hover:text-white hover:bg-white/5"
              }`}
            title="Podcast"
          >
            <Headphones className="h-5 w-5" />
          </button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between bg-[#0a0a0a]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedPDF(null);
                setPdfData(null);
                setGeneratedAssets(null);
              }}
              className="text-white/60 hover:text-white"
            >
              ← Back to Materials
            </Button>
            <h2 className="text-lg font-semibold text-white truncate max-w-md">
              {selectedPDF.title}
            </h2>
            <div className="w-24" />
          </div>

          {/* Dynamic content based on active view */}
          <div className="flex-1 overflow-hidden">
            {activeView === "notes" && (
              <div className="h-full">
                <StudyNotes content={editableNotes} title={selectedPDF.title} />
              </div>
            )}

            {activeView === "chat" && (
              <div className="h-full">
                <PDFChat
                  docId={pdfData.docId || selectedPDF._id}
                  title={selectedPDF.title}
                />
              </div>
            )}

            {activeView === "flashcards" && (
              <div className="h-full">
                <StudyFlashcards
                  materialId={selectedPDF._id}
                  autoContent={pdfData.text}
                  title={selectedPDF.title}
                />
              </div>
            )}

            {activeView === "quiz" && (
              <div className="h-full">
                <StudyQuizzes
                  materialId={selectedPDF._id}
                  autoContent={pdfData.text}
                  title={selectedPDF.title}
                />
              </div>
            )}

            {activeView === "podcast" && (
              <div className="h-full">
                <StudyPodcast
                  materialId={selectedPDF._id}
                  content={pdfData.text}
                  title={selectedPDF.title}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const RenderAddMaterialContent = () => (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-[#1a1a1a]">
        <TabsTrigger value="upload">Upload Files</TabsTrigger>
        <TabsTrigger value="record">Record Audio</TabsTrigger>
        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="space-y-4">
        {isMobile ? <MobileStudyUploadZone /> : <StudyUploadZone />}
      </TabsContent>

      <TabsContent value="record" className="space-y-4">
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
        />
      </TabsContent>

      <TabsContent value="manual" className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter material title"
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
          />
        </div>
        <div>
          <Label>Type</Label>
          <Select
            value={type}
            onValueChange={(value: any) => setType(value)}
          >
            <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {type === "text" && (
          <div>
            <Label>Content</Label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your study content here (lecture notes, textbook excerpts, etc.)"
              className="w-full h-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-3 text-white resize-none"
            />
            <p className="text-xs text-[#6b6b6b] mt-2">
              💡 Tip: You can generate notes, flashcards, and quizzes
              from this content
            </p>
          </div>
        )}
        {(type === "youtube" || type === "video") && (
          <div>
            <Label>URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter video URL"
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
            />
          </div>
        )}
        <Button
          onClick={handleAddMaterial}
          className="w-full bg-white text-black hover:bg-white/90"
        >
          Add Material
        </Button>
      </TabsContent>
    </Tabs>
  )

  // Default materials list view with folders
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Study Materials</h2>
          <p className="text-sm text-[#6b6b6b]">
            Upload and organize your learning resources
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-[#2a2a2a] text-white hover:bg-white/5"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a]">
              <DialogHeader>
                <DialogTitle>Create Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Folder Name</Label>
                  <Input
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="e.g., Biology, Math, History"
                    className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2">
                    {[
                      "#8b5cf6",
                      "#3b82f6",
                      "#10b981",
                      "#f59e0b",
                      "#ef4444",
                      "#ec4899",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => setFolderColor(color)}
                        className={`h-8 w-8 rounded-full transition-all ${folderColor === color
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]"
                          : ""
                          }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleCreateFolder}
                  className="w-full bg-white text-black hover:bg-white/90"
                >
                  Create Folder
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {isMobile ? (
            <Drawer open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DrawerTrigger asChild>
                <Button className="bg-white text-black hover:bg-white/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-[#0a0a0a] border-[#1a1a1a]">
                <DrawerHeader>
                  <DrawerTitle>Add Study Material</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <RenderAddMaterialContent />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-white text-black hover:bg-white/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Add Study Material</DialogTitle>
                </DialogHeader>
                <RenderAddMaterialContent />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="px-6 py-4 border-b border-[#1a1a1a] flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials..."
            className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] text-white"
          />
        </div>
        <Select
          value={selectedFolder || "all"}
          onValueChange={(v) => setSelectedFolder(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-48 bg-[#1a1a1a] border-[#2a2a2a] text-white">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Folders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Folders</SelectItem>
            {folders?.map((folder) => (
              <SelectItem key={folder._id} value={folder._id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: folder.color || "#8b5cf6" }}
                  />
                  {folder.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 p-6">
        {!filteredMaterials || filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Upload className="h-12 w-12 text-[#6b6b6b] mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No materials yet
            </h3>
            <p className="text-sm text-[#6b6b6b] mb-4 max-w-md">
              Start by adding your first study material. You can upload PDFs,
              videos, or paste text content. Then generate notes, flashcards,
              and quizzes automatically!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material) => (
              <Card
                key={material._id}
                className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() =>
                  material.type === "pdf" && handlePDFClick(material)
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/30">
                      {getIcon(material.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">
                        {material.title}
                      </h3>
                      <p className="text-xs text-white/40 capitalize mt-1">
                        {material.type}
                      </p>
                      {material.content && (
                        <p className="text-xs text-white/40 mt-2 line-clamp-2">
                          {material.content.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
