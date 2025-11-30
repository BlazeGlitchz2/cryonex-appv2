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
import { Plus, Search, FileText, Sparkles, BookOpen, Trash2, MessageSquare, MoreVertical, Edit, Copy } from "lucide-react";
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

export default function LibraryPage() {
  const navigate = useNavigate();
  const libraryItems = useQuery(api.library.list);
  const createItem = useMutation(api.library.create);
  const updateItem = useMutation(api.library.update);
  const deleteItem = useMutation(api.library.remove);
  const createProject = useMutation(api.projects.create);
  
  // Chat related hooks
  const createChat = useMutation(api.chats.create);
  const createMessage = useMutation(api.messages.create);
  const sendMessage = useAction(api.chat.sendMessage);
  const { activeModel } = useChatStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"libraryItems"> | null>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  
  // Chat state for library item
  const [activeChatId, setActiveChatId] = useState<Id<"chats"> | null>(null);
  const [isChatMode, setIsChatMode] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  
  const itemChats = useQuery(api.chats.list, viewingItem ? { libraryItemId: viewingItem._id } : "skip");
  const messages = useQuery(api.messages.list, activeChatId ? { chatId: activeChatId } : "skip");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, pendingMessages, streamingContent, isChatMode]);

  const handleStartChat = async () => {
    if (!viewingItem) return;
    setIsChatMode(true);
    
    // If we already have chats for this item, pick the most recent one, otherwise create new
    if (itemChats && itemChats.length > 0) {
      setActiveChatId(itemChats[0]._id);
    } else {
      try {
        const newChatId = await createChat({
          title: `Chat: ${viewingItem.title}`,
          model: activeModel,
          libraryItemId: viewingItem._id,
        });
        setActiveChatId(newChatId);
        
        // Optionally send the prompt as the first message context or system message
        // For now, we just start the chat.
      } catch (error) {
        toast.error("Failed to start chat");
        setIsChatMode(false);
      }
    }
  };

  const handleSendMessage = async (text: string, files?: File[]) => {
    if (!text.trim() || !activeChatId) return;

    const tempId = Date.now().toString();
    const optimisticMessage = {
      _id: tempId,
      role: "user",
      content: text,
      _creationTime: Date.now(),
    };
    setPendingMessages(prev => [...prev, optimisticMessage]);

    try {
      await createMessage({
        chatId: activeChatId,
        role: "user",
        content: text,
      });
      setPendingMessages(prev => prev.filter(m => m._id !== tempId));
      
      setIsStreaming(true);
      setStreamingContent("");

      // Prepare history
      const history = messages?.map((m: any) => ({
        role: m.role,
        content: m.content
      })) || [];

      // Add system context from library item if it's a new chat or relevant
      const systemContext = `Context: You are discussing the library item "${viewingItem.title}".\nContent: ${viewingItem.prompt}`;
      
      const currentMessages = [
        { role: "system", content: systemContext },
        ...history,
        { role: "user", content: text }
      ];

      const assistantMessageId = await createMessage({
        chatId: activeChatId,
        role: "assistant",
        content: "",
        model: activeModel,
      });

      const response = await sendMessage({
        messages: currentMessages,
        model: activeModel,
        messageId: assistantMessageId,
      });

    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
      setPendingMessages(prev => prev.filter(m => m._id !== tempId));
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const [newItem, setNewItem] = useState({
    title: "",
    prompt: "",
    category: "",
  });

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

  const handleAddToProject = async (item: any) => {
    try {
      await createProject({
        name: item.title,
        description: item.prompt,
        color: "blue",
      });
      toast.success("Project created from library item");
      setIsViewDialogOpen(false);
      navigate("/projects");
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  const resetForm = () => {
    setNewItem({ title: "", prompt: "", category: "" });
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
    });
    setIsDialogOpen(true);
  };

  const handleView = (item: any) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
    setIsChatMode(false);
    setActiveChatId(null);
    setPendingMessages([]);
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
        <div className="max-w-7xl mx-auto space-y-8 pb-20">

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                  <Button onClick={openNewDialog} className="gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:opacity-90 rounded-full h-10 px-5 shadow-lg shadow-fuchsia-900/20">
                    <Plus className="h-4 w-4" />
                    New Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Edit Library Item" : "Create Library Item"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Title</label>
                      <Input
                        value={newItem.title}
                        onChange={(e) =>
                          setNewItem({ ...newItem, title: e.target.value })
                        }
                        placeholder="E.g., Code Review Prompt"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Prompt / Content</label>
                      <Textarea
                        value={newItem.prompt}
                        onChange={(e) =>
                          setNewItem({ ...newItem, prompt: e.target.value })
                        }
                        placeholder="Enter your text here..."
                        className="bg-white/5 border-white/10 text-white min-h-[120px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Category</label>
                      <Input
                        value={newItem.category}
                        onChange={(e) =>
                          setNewItem({ ...newItem, category: e.target.value })
                        }
                        placeholder="E.g., Development"
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
          </motion.div>

          {/* Library Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems?.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ContextMenu>
                  <ContextMenuTrigger>
                    <div onClick={() => handleView(item)}>
                      <Card className="group cursor-pointer bg-white/5 backdrop-blur-sm border-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/10 h-full">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                              <BookOpen className="h-5 w-5 text-fuchsia-400" />
                            </div>
                            {item.category && (
                              <Badge variant="secondary" className="bg-white/5 text-white/60 hover:bg-white/10 border-transparent">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg font-semibold text-white group-hover:text-fuchsia-300 transition-colors">
                            {item.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-3 text-white/40 mt-2 leading-relaxed">
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

          {/* View Item Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
              <DialogHeader className="p-6 pb-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between pr-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-fuchsia-500/10">
                      <BookOpen className="h-5 w-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{viewingItem?.title}</DialogTitle>
                      <DialogDescription className="text-white/40 mt-1">
                        {viewingItem?.category || "Uncategorized"}
                      </DialogDescription>
                    </div>
                  </div>
                  {isChatMode && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsChatMode(false)}
                      className="text-white/50 hover:text-white"
                    >
                      Back to Details
                    </Button>
                  )}
                </div>
              </DialogHeader>
              
              <div className="flex-1 overflow-hidden relative">
                {!isChatMode ? (
                  <div className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Content
                      </h3>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                        {viewingItem?.prompt}
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-white/50 hover:text-white"
                          onClick={() => {
                            navigator.clipboard.writeText(viewingItem?.prompt);
                            toast.success("Copied to clipboard");
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1.5" />
                          Copy Content
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Actions
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          className="bg-white/5 hover:bg-white/10 text-white border border-white/5 justify-start h-auto py-3 px-4"
                          onClick={handleStartChat}
                        >
                          <MessageSquare className="h-4 w-4 mr-3 text-fuchsia-400" />
                          <div className="text-left">
                            <div className="font-medium text-sm">Start Chat</div>
                            <div className="text-[10px] text-white/40">Chat with this item context</div>
                          </div>
                        </Button>
                        <Button 
                          className="bg-white/5 hover:bg-white/10 text-white border border-white/5 justify-start h-auto py-3 px-4"
                          onClick={() => handleAddToProject(viewingItem)}
                        >
                          <Plus className="h-4 w-4 mr-3 text-blue-400" />
                          <div className="text-left">
                            <div className="font-medium text-sm">Add to Project</div>
                            <div className="text-[10px] text-white/40">Create project from this item</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4 max-w-3xl mx-auto pb-4">
                        {(!messages || messages.length === 0) && pendingMessages.length === 0 && (
                          <div className="text-center py-10 text-white/30">
                            <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
                            <p>Start a conversation about this item.</p>
                          </div>
                        )}
                        
                        {[...(messages || []), ...pendingMessages].map((msg: any) => (
                          <Message
                            key={msg._id}
                            from={msg.role === "user" ? "user" : "assistant"}
                            userInitial="U"
                          >
                            {msg.role === "user" ? (
                              <MessageContent>{msg.content}</MessageContent>
                            ) : (
                              <MessageResponse content={msg.content} />
                            )}
                          </Message>
                        ))}
                        
                        {isStreaming && (
                          <Message from="assistant" userInitial="AI" isStreaming={true}>
                            <MessageResponse content={streamingContent} />
                          </Message>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                    <div className="p-4 bg-black/20 border-t border-white/5">
                      <div className="max-w-3xl mx-auto">
                        <PromptInputBox 
                          onSend={handleSendMessage}
                          isLoading={isStreaming}
                          placeholder="Type a message..."
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Empty State */}
          {filteredItems?.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-white/20" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Library is empty</h3>
              <p className="text-white/40 max-w-sm mx-auto mb-6">Save your favorite prompts and snippets here for quick access.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}