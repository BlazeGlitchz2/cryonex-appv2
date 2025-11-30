import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Plus, Search, FileText, Sparkles, BookOpen, Trash2, MessageSquare, MoreVertical, Edit, Copy, Wand2, Loader2, Image as ImageIcon } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, MessageContent, MessageResponse } from "@/components/ui/message";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { useAction } from "convex/react";
import { useChatStore } from "@/lib/stores/chat-store";
import { useRef, useEffect } from "react";
import { LibraryItemView } from "@/components/library/LibraryItemView";

export default function LibraryPage() {
  const navigate = useNavigate();
  const libraryItems = useQuery(api.library.list);
  const createItem = useMutation(api.library.create);
  const updateItem = useMutation(api.library.update);
  const deleteItem = useMutation(api.library.remove);
  const createProject = useMutation(api.projects.create);
  const enhanceContent = useAction(api.libraryActions.enhanceContent);
  
  // Chat related hooks - REMOVED as they are now in LibraryItemView
  // const createChat = useMutation(api.chats.create);
  // const createMessage = useMutation(api.messages.create);
  // const sendMessage = useAction(api.chat.sendMessage);
  // const { activeModel } = useChatStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"libraryItems"> | null>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Chat state for library item - REMOVED as they are now in LibraryItemView
  // const [activeChatId, setActiveChatId] = useState<Id<"chats"> | null>(null);
  // const [isChatMode, setIsChatMode] = useState(false);
  // const [isStreaming, setIsStreaming] = useState(false);
  // const [streamingContent, setStreamingContent] = useState("");
  // const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  
  // const itemChats = useQuery(api.chats.list, viewingItem ? { libraryItemId: viewingItem._id } : "skip");
  // const messages = useQuery(api.messages.list, activeChatId ? { chatId: activeChatId } : "skip");
  
  // const messagesEndRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (messagesEndRef.current) {
  //     messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages, pendingMessages, streamingContent, isChatMode]);

  // const handleStartChat = async () => { ... } - REMOVED
  // const handleSendMessage = async (text: string, files?: File[]) => { ... } - REMOVED

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
        currentPrompt: newItem.prompt
      });
      
      setNewItem(prev => ({
        ...prev,
        prompt: result.content,
        imageUrl: result.imageUrl || prev.imageUrl
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
    if (!newItem.title || !newItem.prompt) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateItem({
          id: editingId,
          title: newItem.title,
          prompt: newItem.prompt,
          category: newItem.category,
          imageUrl: newItem.imageUrl,
        });
        toast.success("Library item updated");
      } else {
        await createItem(newItem);
        toast.success("Library item created");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Library save error:", error);
      toast.error("Failed to save item");
    }
  };

  const handleDelete = async (id: Id<"libraryItems">) => {
    try {
      await deleteItem({ id });
      toast.success("Item deleted");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  // handleAddToProject moved to LibraryItemView but kept here for context menu if needed, 
  // though context menu currently doesn't have it. 
  // We can keep it if we want to add it to context menu later.
  const handleAddToProject = async (item: any) => {
    try {
      await createProject({
        name: item.title,
        description: item.prompt,
        color: "blue",
      });
      toast.success("Project created from library item");
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
    // Reset chat state not needed as component unmounts/remounts or handles it
  };

  // Loading State
  if (libraryItems === undefined) {
    return (
      <div className="flex-1 h-full overflow-hidden relative bg-[#020005]">
        <div className="absolute inset-0 -z-10 bg-[#020005]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.15),_transparent_50%)]" />
        </div>
        <div className="h-full p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <Skeleton className="h-10 w-48 bg-white/10" />
                <Skeleton className="h-6 w-96 bg-white/5" />
              </div>
              <Skeleton className="h-10 w-32 bg-white/10 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 w-full bg-white/5 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredItems = libraryItems?.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 h-full overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#020005]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.15),_transparent_50%)]" />
      </div>

      <div className="h-full overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto space-y-8 pb-20"
        >

          {/* Header Section */}
          <div
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Your Library</h1>
              <p className="text-white/50 mt-2 text-lg">Manage your prompts and knowledge assets</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search library..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 rounded-full focus:bg-white/10 transition-colors"
                />
              </div>

              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button onClick={openNewDialog} className="gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:opacity-90 rounded-full h-10 px-5 shadow-lg shadow-fuchsia-900/20 transition-all hover:scale-105 active:scale-95">
                    <Plus className="h-4 w-4" />
                    New Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Edit Library Item" : "Create Library Item"}</DialogTitle>
                    <DialogDescription>
                      Create a new knowledge item or prompt. Use AI to enhance your content.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Title</label>
                      <div className="flex gap-2">
                        <Input
                          value={newItem.title}
                          onChange={(e) =>
                            setNewItem({ ...newItem, title: e.target.value })
                          }
                          placeholder="E.g., Quantum Physics Basics"
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <Button 
                          onClick={handleEnhance}
                          disabled={isEnhancing || !newItem.title}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none hover:opacity-90 shrink-0"
                        >
                          {isEnhancing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-2" />
                              Enhance
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {newItem.imageUrl && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/10 group">
                        <img src={newItem.imageUrl} alt="Generated" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setNewItem({ ...newItem, imageUrl: "" })}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Image
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Content / Prompt</label>
                      <Textarea
                        value={newItem.prompt}
                        onChange={(e) =>
                          setNewItem({ ...newItem, prompt: e.target.value })
                        }
                        placeholder="Enter your text here, or let AI generate it for you..."
                        className="bg-white/5 border-white/10 text-white min-h-[200px] font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Category</label>
                      <Input
                        value={newItem.category}
                        onChange={(e) =>
                          setNewItem({ ...newItem, category: e.target.value })
                        }
                        placeholder="E.g., Science"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button onClick={handleSave} className="flex-1 bg-white text-black hover:bg-white/90">
                        {editingId ? "Update Item" : "Create Item"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Library Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <Card className="group cursor-pointer bg-white/5 backdrop-blur-sm border border-white/5 hover:border-fuchsia-500/30 hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(192,38,211,0.2)] h-full overflow-hidden flex flex-col relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        {item.imageUrl && (
                          <div className="h-32 w-full overflow-hidden relative">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-60" />
                          </div>
                        )}
                        <CardHeader className="flex-1 relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-fuchsia-500/20 group-hover:text-fuchsia-300 transition-all duration-300">
                              <BookOpen className="h-5 w-5 text-fuchsia-400 group-hover:text-fuchsia-300" />
                            </div>
                            {item.category && (
                              <Badge variant="secondary" className="bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white border-transparent transition-colors">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg font-semibold text-white group-hover:text-fuchsia-300 transition-colors duration-300">
                            {item.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-3 text-white/40 mt-2 leading-relaxed group-hover:text-white/60 transition-colors duration-300">
                            {item.prompt}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="bg-[#0a0a0a] border-white/10 text-white">
                    <ContextMenuItem onClick={() => handleEdit(item)} className="focus:bg-white/10 focus:text-white cursor-pointer">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => {
                      navigator.clipboard.writeText(item.prompt);
                      toast.success("Prompt copied to clipboard");
                    }} className="focus:bg-white/10 focus:text-white cursor-pointer">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Prompt
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleAddToProject(item)} className="focus:bg-white/10 focus:text-white cursor-pointer">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Project
                    </ContextMenuItem>
                    <ContextMenuSeparator className="bg-white/10" />
                    <ContextMenuItem onClick={() => handleDelete(item._id)} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </motion.div>
            ))}
          </div>

          {/* Full Screen Library Item View */}
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
              className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-white/20" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Library is empty</h3>
              <p className="text-white/40 max-w-sm mx-auto mb-6">Save your favorite prompts and snippets here for quick access.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}