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
import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Copy,
  Loader2,
  Sparkles,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";
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
import { useThemeStore } from "@/lib/stores/theme-store";
import {
  IconLibrary,
  IconFile,
  IconWand,
  IconGrid,
  IconList,
} from "@/components/ui/icons/Web3Icons";

export default function LibraryPage() {
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const libraryItems = useQuery(api.library.list);
  const createItem = useMutation(api.library.create);
  const updateItem = useMutation(api.library.update);
  const deleteItem = useMutation(api.library.remove);
  const createProject = useMutation(api.projects.create);
  const enhanceContent = useAction(api.libraryActions.enhanceContent);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"libraryItems"> | null>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [newItem, setNewItem] = useState({
    title: "",
    prompt: "",
    category: "",
    imageUrl: "",
  });

  const handleEnhance = async () => {
    if (!newItem.title) {
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
        prompt: result.content,
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
    if (!newItem.title) {
      toast.error("Please enter a title");
      return;
    }
    setIsEnhancing(true);
    try {
      let finalPrompt = newItem.prompt;
      let finalImageUrl = newItem.imageUrl;

      if (!editingId && (newItem.prompt.length < 500 || !newItem.prompt)) {
        toast.info("AI is generating comprehensive content...");
        try {
          const result = await enhanceContent({
            title: newItem.title,
            currentPrompt: newItem.prompt,
          });
          finalPrompt = result.content;
          finalImageUrl = result.imageUrl || finalImageUrl;
        } catch (err) {
          toast.warning("AI generation failed, saving original text.");
        }
      }

      if (editingId) {
        await updateItem({
          id: editingId,
          title: newItem.title,
          prompt: finalPrompt,
          category: newItem.category,
          imageUrl: finalImageUrl,
        });
        toast.success("Data node updated");
      } else {
        await createItem({
          title: newItem.title,
          prompt: finalPrompt,
          category: newItem.category,
          imageUrl: finalImageUrl,
        });
        toast.success("New data node created");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save item");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDelete = async (id: Id<"libraryItems">) => {
    try {
      await deleteItem({ id });
      toast.success("Data node deleted");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleAddToProject = async (item: any) => {
    try {
      await createProject({
        name: item.title,
        description: item.prompt,
        color: "blue",
      });
      toast.success("Project initialized from data");
      navigate("/projects");
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  const resetForm = () => {
    setNewItem({ title: "", prompt: "", category: "", imageUrl: "" });
    setEditingId(null);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingId(item._id);
    setNewItem({
      title: item.title,
      prompt: item.prompt,
      category: item.category || "",
      imageUrl: item.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleView = (item: any) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  // Loading State
  if (libraryItems === undefined) {
    return (
      <div className="flex-1 h-full overflow-hidden relative bg-transparent p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <Skeleton className="h-12 w-48 bg-white/10 rounded-xl" />
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="h-64 w-full bg-white/5 rounded-[2rem]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredItems = libraryItems?.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex-1 h-full overflow-hidden relative bg-transparent">
      {/* Global Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-10 mobile-scroll-thin relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-28 md:pb-20"
        >
          {/* Header Section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="h-11 w-11 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <IconLibrary className="h-5 w-5 md:h-7 md:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
                  Data Vault
                </h1>
                <p className="text-white/50 text-sm md:text-lg">
                  Secure storage for your knowledge assets.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72 group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vault..."
                  className="pl-10 h-10 md:h-12 rounded-xl bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 relative text-base"
                />
              </div>

              <div className="bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/5 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={`h-9 w-9 md:h-10 md:w-10 rounded-lg touch-target ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
                >
                  <IconGrid className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={`h-9 w-9 md:h-10 md:w-10 rounded-lg touch-target ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
                >
                  <IconList className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>

              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={openNewDialog}
                    className="h-10 md:h-12 px-4 md:px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)] border-0 transition-all hover:scale-105 touch-target"
                  >
                    <Plus className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">New Data</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0A0A0B]/95 backdrop-blur-xl border-white/10 text-white max-w-2xl rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                      {editingId ? "Edit Data Node" : "Initialize Data Node"}
                    </DialogTitle>
                    <DialogDescription className="text-white/50">
                      Create a new knowledge item. AI will enhance it
                      automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh] mt-4 pr-4">
                    <div className="space-y-6 p-1">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">
                          Title
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={newItem.title}
                            onChange={(e) =>
                              setNewItem({ ...newItem, title: e.target.value })
                            }
                            placeholder="E.g., Quantum Physics Basics"
                            className="bg-black/40 border-white/10 text-white h-12 rounded-xl"
                          />
                          <Button
                            onClick={handleEnhance}
                            disabled={isEnhancing || !newItem.title}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none h-12 px-6 rounded-xl hover:opacity-90 shrink-0"
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
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-white/10 group">
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
                        <label className="text-sm font-medium text-white/70">
                          Content / Instructions
                        </label>
                        <Textarea
                          value={newItem.prompt}
                          onChange={(e) =>
                            setNewItem({ ...newItem, prompt: e.target.value })
                          }
                          placeholder="Enter content or instructions..."
                          className="bg-black/40 border-white/10 text-white min-h-[200px] font-mono text-sm rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">
                          Category
                        </label>
                        <Input
                          value={newItem.category}
                          onChange={(e) =>
                            setNewItem({ ...newItem, category: e.target.value })
                          }
                          placeholder="E.g., Science"
                          className="bg-black/40 border-white/10 text-white h-12 rounded-xl"
                        />
                      </div>
                      <Button
                        onClick={handleSave}
                        className="w-full h-12 rounded-xl bg-white text-black hover:bg-white/90 font-bold"
                      >
                        {editingId ? "Update Node" : "Create Node"}
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
                        className={`group cursor-pointer overflow-hidden relative transition-all duration-500 hover:-translate-y-2 rounded-[2rem] glass-panel border border-white/5 hover:border-cyan-500/30 hover:shadow-[0_20px_40px_-15px_rgba(34,211,238,0.2)] ${viewMode === "list" ? "flex h-32" : "flex flex-col h-full"}`}
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
                            <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
                              <IconFile className="h-12 w-12 text-white/10 group-hover:text-white/30 transition-colors" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />

                          {/* Category Badge */}
                          {item.category && (
                            <div className="absolute top-4 left-4">
                              <Badge
                                variant="secondary"
                                className="bg-black/50 backdrop-blur-md text-white border-white/10 hover:bg-black/70"
                              >
                                {item.category}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="p-6 flex flex-col flex-1 relative z-10">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 -mr-2 text-white/30 hover:text-white hover:bg-white/10"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-[#0A0A0B]/95 backdrop-blur-xl border-white/10 text-white rounded-xl w-56 z-50"
                              >
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(item);
                                  }}
                                  className="focus:bg-white/10 focus:text-white cursor-pointer rounded-lg py-2"
                                >
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(item.prompt);
                                    toast.success("Prompt copied");
                                  }}
                                  className="focus:bg-white/10 focus:text-white cursor-pointer rounded-lg py-2"
                                >
                                  <Copy className="h-4 w-4 mr-2" /> Copy Prompt
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToProject(item);
                                  }}
                                  className="focus:bg-white/10 focus:text-white cursor-pointer rounded-lg py-2"
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
                          <p className="line-clamp-3 text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors">
                            {item.prompt}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="bg-[#0A0A0B]/95 backdrop-blur-xl border-white/10 text-white rounded-xl w-56">
                    <ContextMenuItem
                      onClick={() => handleEdit(item)}
                      className="focus:bg-white/10 focus:text-white cursor-pointer rounded-lg py-2"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(item.prompt);
                        toast.success("Prompt copied");
                      }}
                      className="focus:bg-white/10 focus:text-white cursor-pointer rounded-lg py-2"
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy Prompt
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleAddToProject(item)}
                      className="focus:bg-white/10 focus:text-white cursor-pointer rounded-lg py-2"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add to Project
                    </ContextMenuItem>
                    <ContextMenuSeparator className="bg-white/10" />
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
              className="text-center py-32 border border-dashed border-white/10 rounded-[3rem] bg-white/[0.02]"
            >
              <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-pulse">
                <IconLibrary className="h-10 w-10 text-white/20" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Vault Empty
              </h3>
              <p className="text-white/40 max-w-md mx-auto mb-8">
                Secure your first knowledge asset to begin.
              </p>
              <Button
                onClick={openNewDialog}
                className="h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90 font-bold"
              >
                Initialize Node
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
