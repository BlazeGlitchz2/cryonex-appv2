import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation, useAction } from "convex/react";
import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Copy,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Doc, Id } from "@/convex/_generated/dataModel";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LibraryItemView } from "@/components/library/LibraryItemView";
import { useAuth } from "@/hooks/use-auth";
import { COUNTRIES } from "@/lib/countryConfig";
import { StudyShareRail } from "@/components/study/StudySocialSurfaces";
import { StudyPackShelf } from "@/components/study/StudyPackShelf";
import { sanitizeAiOutput } from "@/lib/ai-output";
import {
  IconLibrary,
  IconFile,
  IconWand,
  IconGrid,
  IconList,
} from "@/components/ui/icons/Web3Icons";

export default function LibraryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const libraryItemsResult = useQuery(api.library.list, user ? {} : "skip");
  const libraryItems = user ? libraryItemsResult : [];
  const dashboardRails = useQuery(
    api.social.getDashboardRails,
    user ? { limit: 4 } : "skip",
  );
  const studyPacks =
    useQuery(api.study.getRecentStudyPacks, user ? { limit: 3 } : "skip") || [];
  const createItem = useMutation(api.library.create);
  const updateItem = useMutation(api.library.update);
  const deleteItem = useMutation(api.library.remove);
  const createProject = useMutation(api.projects.create);
  const enhanceContent = useAction(api.libraryActions.enhanceContent);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"libraryItems"> | null>(null);
  const [viewingItem, setViewingItem] = useState<Doc<"libraryItems"> | null>(
    null,
  );
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] =
    useState<Id<"libraryItems"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const saveBusyRef = useRef(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [newItem, setNewItem] = useState({
    title: "",
    prompt: "",
    category: "",
    imageUrl: "",
  });

  const schoolName =
    (user?.country
      ? COUNTRIES[user.country]?.schools.find(
          (school) => school.id === user.schoolId,
        )?.name
      : null) ||
    user?.schoolId ||
    "your school";

  const handleEnhance = async () => {
    if (isEnhancing || saveBusyRef.current) return;
    if (!newItem.title.trim()) {
      toast.error("Please enter a title first");
      return;
    }
    setIsEnhancing(true);
    try {
      toast.info("AI is researching and generating content...");
      const result = await enhanceContent({
        title: newItem.title,
        currentPrompt: newItem.prompt,
      });
      setNewItem((prev) => ({
        ...prev,
        prompt: sanitizeAiOutput(result.content),
        imageUrl: result.imageUrl || prev.imageUrl,
      }));
      toast.success("Content enhanced successfully!");
    } catch (error) {
      console.error("Enhancement failed:", error);
      toast.error("Failed to enhance content");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSave = async () => {
    if (saveBusyRef.current || isEnhancing) return;
    if (!newItem.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    saveBusyRef.current = true;
    setIsSaving(true);
    setSaveError("");
    try {
      const finalPrompt = newItem.prompt;
      const finalImageUrl = newItem.imageUrl;

      if (editingId) {
        await updateItem({
          id: editingId,
          title: newItem.title.trim(),
          prompt: sanitizeAiOutput(finalPrompt),
          category: newItem.category,
          imageUrl: finalImageUrl,
        });
        toast.success("Note updated");
      } else {
        await createItem({
          title: newItem.title.trim(),
          prompt: sanitizeAiOutput(finalPrompt),
          category: newItem.category,
          imageUrl: finalImageUrl,
        });
        toast.success("Note saved to your library");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch {
      setSaveError(
        "Your note couldn't be saved. Your draft is still here — try again.",
      );
    } finally {
      saveBusyRef.current = false;
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: Id<"libraryItems">) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteItem({ id: pendingDeleteId });
      toast.success("Note deleted");
      if (viewingItem?._id === pendingDeleteId) setIsViewDialogOpen(false);
      setPendingDeleteId(null);
      setIsDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddToProject = async (item: Doc<"libraryItems">) => {
    try {
      await createProject({
        name: item.title,
        description: sanitizeAiOutput(item.prompt),
        color: "#60a5fa",
      });
      toast.success("Project created from your note");
      navigate("/projects");
    } catch {
      toast.error("Failed to create project");
    }
  };

  const resetForm = () => {
    setNewItem({ title: "", prompt: "", category: "", imageUrl: "" });
    setEditingId(null);
    setSaveError("");
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Doc<"libraryItems">) => {
    setEditingId(item._id);
    setNewItem({
      title: item.title,
      prompt: sanitizeAiOutput(item.prompt),
      category: item.category || "",
      imageUrl: item.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleView = (item: Doc<"libraryItems">) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  // Loading State
  if (user && libraryItems === undefined) {
    return (
      <div className="flex-1 h-full overflow-hidden relative bg-transparent p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <Skeleton className="h-12 w-48 bg-foreground/10 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="h-64 w-full bg-foreground/5 rounded-[2rem]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredItems = libraryItems?.filter((item) =>
    `${item.title} ${item.category || ""} ${item.prompt || ""}`
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <div className="cx-collection-page flex-1 h-full overflow-hidden relative bg-transparent text-foreground">
      <div className="h-full overflow-y-auto p-4 md:px-6 md:pb-6 md:pt-20 lg:px-10 lg:pb-10 lg:pt-24 mobile-scroll-thin relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-4 md:pb-20"
        >
          {/* Header Section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="h-11 w-11 md:h-14 md:w-14 rounded-xl md:rounded-2xl border border-border bg-primary/10 flex items-center justify-center">
                <IconLibrary className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">
                  Your library
                </h1>
                <p className="text-muted-foreground text-sm md:text-lg">
                  Keep your saved notes and study material together.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search your library"
                  placeholder="Find a note, category, or idea…"
                  className="pl-10 h-11 md:h-12 rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30 relative text-base"
                />
              </div>

              <div className="bg-card backdrop-blur-md p-1 rounded-xl border border-border flex gap-1 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                  className={`h-9 w-9 md:h-10 md:w-10 rounded-lg touch-target ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <IconGrid className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  className={`h-9 w-9 md:h-10 md:w-10 rounded-lg touch-target ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <IconList className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>

              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  if (isSaving || isEnhancing) return;
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={openNewDialog}
                    aria-label="New note"
                    className="h-11 md:h-12 px-4 md:px-6 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 border-0 touch-target"
                  >
                    <Plus className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">New note</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card backdrop-blur-xl border-border text-foreground max-w-2xl rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                      {editingId
                        ? "Edit your note"
                        : "New note"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Add your own notes, or use Enhance to ask AI for a draft.
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh] mt-4 pr-4">
                    <div className="space-y-6 p-1">
                      <div className="space-y-2">
                        <label
                          htmlFor="library-note-title"
                          className="text-sm font-medium text-muted-foreground/80"
                        >
                          Title
                        </label>
                        <div className="flex gap-2">
                          <Input
                            id="library-note-title"
                            disabled={isSaving || isEnhancing}
                            value={newItem.title}
                            onChange={(e) =>
                              setNewItem({ ...newItem, title: e.target.value })
                            }
                            placeholder="E.g., Quantum Physics Basics"
                            className="bg-background border-border text-foreground h-12 rounded-xl"
                          />
                          <Button
                            onClick={handleEnhance}
                            disabled={
                              isSaving || isEnhancing || !newItem.title.trim()
                            }
                            className="bg-primary text-primary-foreground border-none h-12 px-6 rounded-xl hover:opacity-90 shrink-0"
                          >
                            {isEnhancing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <IconWand className="h-4 w-4 mr-2" /> Enhance
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {newItem.imageUrl && (
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-border group">
                          <img
                            src={newItem.imageUrl}
                            alt="Generated"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setNewItem({ ...newItem, imageUrl: "" })
                              }
                              className="rounded-xl"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Remove Image
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label
                          htmlFor="library-note-content"
                          className="text-sm font-medium text-muted-foreground/80"
                        >
                          Your notes
                        </label>
                        <Textarea
                          id="library-note-content"
                          disabled={isSaving || isEnhancing}
                          value={newItem.prompt}
                          onChange={(e) =>
                            setNewItem({ ...newItem, prompt: e.target.value })
                          }
                          placeholder="Enter content or instructions..."
                          className="bg-background border-border text-foreground min-h-[200px] text-sm rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="library-note-category"
                          className="text-sm font-medium text-muted-foreground/80"
                        >
                          Category
                        </label>
                        <Input
                          id="library-note-category"
                          disabled={isSaving || isEnhancing}
                          value={newItem.category}
                          onChange={(e) =>
                            setNewItem({ ...newItem, category: e.target.value })
                          }
                          placeholder="E.g., Science"
                          className="bg-background border-border text-foreground h-12 rounded-xl"
                        />
                      </div>
                      {saveError && (
                        <p role="alert" className="text-sm text-destructive">
                          {saveError}
                        </p>
                      )}
                      <Button
                        disabled={isSaving || isEnhancing}
                        onClick={handleSave}
                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                          </>
                        ) : editingId ? (
                          "Save changes"
                        ) : (
                          "Save note"
                        )}
                      </Button>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Library Items Grid */}
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
          >
            {filteredItems?.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
              >
                <ContextMenu>
                  <ContextMenuTrigger>
                    <div onClick={() => handleView(item)}>
                      <div
                        className={`group cursor-pointer overflow-hidden relative transition-all duration-500 hover:-translate-y-2 rounded-[2rem] bg-card border border-border hover:border-cyan-500/30 shadow-sm hover:shadow-md ${viewMode === "list" ? "flex h-32" : "flex flex-col h-full"}`}
                      >
                        {/* Image / Icon Section */}
                        <div
                          className={`relative overflow-hidden ${viewMode === "list" ? "w-32 h-full shrink-0" : "h-48 w-full"}`}
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                              <IconFile className="h-12 w-12 text-primary/50 group-hover:text-primary transition-colors" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />

                          {/* Category Badge */}
                          {item.category && (
                            <div className="absolute top-4 left-4">
                              <Badge
                                variant="secondary"
                                className="bg-card/90 backdrop-blur-md text-foreground border-border"
                              >
                                {item.category}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="p-6 flex flex-col flex-1 relative z-10">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              <button
                                type="button"
                                className="text-left w-full"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleView(item);
                                }}
                              >
                                {item.title}
                              </button>
                            </h3>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Actions for ${item.title}`}
                                  className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-card backdrop-blur-xl border-border text-foreground rounded-xl w-56 z-50"
                              >
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(item);
                                  }}
                                  className="focus:bg-muted focus:text-foreground cursor-pointer rounded-lg py-2"
                                >
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(
                                      sanitizeAiOutput(item.prompt),
                                    );
                                    toast.success("Content copied");
                                  }}
                                  className="focus:bg-muted focus:text-foreground cursor-pointer rounded-lg py-2"
                                >
                                  <Copy className="h-4 w-4 mr-2" /> Copy Prompt
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToProject(item);
                                  }}
                                  className="focus:bg-muted focus:text-foreground cursor-pointer rounded-lg py-2"
                                >
                                  <Plus className="h-4 w-4 mr-2" /> Add to
                                  Project
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item._id);
                                  }}
                                  className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer rounded-lg py-2"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="line-clamp-3 text-muted-foreground/80 text-sm leading-relaxed group-hover:text-foreground/90 transition-colors">
                            {sanitizeAiOutput(item.prompt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="bg-card backdrop-blur-xl border-border text-foreground rounded-xl w-56">
                    <ContextMenuItem
                      onClick={() => handleEdit(item)}
                      className="focus:bg-muted focus:text-foreground cursor-pointer rounded-lg py-2"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(
                          sanitizeAiOutput(item.prompt),
                        );
                        toast.success("Content copied");
                      }}
                      className="focus:bg-muted focus:text-foreground cursor-pointer rounded-lg py-2"
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy Prompt
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleAddToProject(item)}
                      className="focus:bg-muted focus:text-foreground cursor-pointer rounded-lg py-2"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add to Project
                    </ContextMenuItem>
                    <ContextMenuSeparator className="bg-border" />
                    <ContextMenuItem
                      onClick={() => handleDelete(item._id)}
                      className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer rounded-lg py-2"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </motion.div>
            ))}
          </div>

          <LibraryItemView
            item={viewingItem}
            isOpen={isViewDialogOpen}
            onClose={() => setIsViewDialogOpen(false)}
          />

          {/* Empty State */}
          {filteredItems?.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16 px-5 border border-dashed border-border rounded-[28px] bg-card/40"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center mx-auto mb-6">
                <IconLibrary className="h-9 w-9 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {searchQuery.trim()
                  ? "No notes match that search."
                  : "No saved notes yet"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-7 text-sm leading-7">
                {searchQuery.trim()
                  ? "Try another title, category, or phrase from your notes."
                  : "Save a note to keep it in your library."}
              </p>
              <Button
                onClick={() =>
                  searchQuery.trim() ? setSearchQuery("") : openNewDialog()
                }
                className="h-11 px-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {searchQuery.trim() ? "Clear search" : "Save your first note"}
              </Button>
            </motion.div>
          )}
          {studyPacks.length > 0 && !searchQuery.trim() && (
            <StudyPackShelf
              packs={studyPacks}
              onCreatePack={() => navigate("/study/dashboard")}
            />
          )}
          {!searchQuery.trim() &&
            ((dashboardRails?.popularAtSchool?.length || 0) > 0 ||
              (dashboardRails?.trendingRegional?.length || 0) > 0) && (
              <div className="grid gap-6 lg:grid-cols-2">
                {(dashboardRails?.popularAtSchool?.length || 0) > 0 && (
                  <StudyShareRail
                    eyebrow="Discovery"
                    title={`Popular at ${schoolName}`}
                    description="Find study materials shared by people in your school."
                    items={dashboardRails?.popularAtSchool || []}
                    emptyMessage="No school-visible study assets are available yet."
                  />
                )}
                {(dashboardRails?.trendingRegional?.length || 0) > 0 && (
                  <StudyShareRail
                    eyebrow="Regional"
                    title="Localized study discovery"
                    description="Public study packs trending in your region and curriculum."
                    items={dashboardRails?.trendingRegional || []}
                    emptyMessage="No localized discovery items yet."
                  />
                )}
              </div>
            )}
        </motion.div>
      </div>
      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the note from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Keep note
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-primary-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {isDeleting ? "Deleting…" : "Delete note"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
