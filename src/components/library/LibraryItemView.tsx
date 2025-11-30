import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, MessageSquare, FileText, Copy, Sparkles, Plus, Calendar, Tag, Share2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Message, MessageContent, MessageResponse } from "@/components/ui/message";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { useChatStore } from "@/lib/stores/chat-store";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface LibraryItemViewProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
}

export function LibraryItemView({ item, isOpen, onClose }: LibraryItemViewProps) {
  const [activeChatId, setActiveChatId] = useState<Id<"chats"> | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "chat">("content");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  
  const { activeModel } = useChatStore();
  
  // Mutations & Actions
  const createChat = useMutation(api.chats.create);
  const createMessage = useMutation(api.messages.create);
  const sendMessage = useAction(api.chat.sendMessage);
  const createProject = useMutation(api.projects.create);
  
  // Queries
  const itemChats = useQuery(api.chats.list, item ? { libraryItemId: item._id } : "skip");
  const messages = useQuery(api.messages.list, activeChatId ? { chatId: activeChatId } : "skip");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select existing chat or prepare to create one
  useEffect(() => {
    if (isOpen && itemChats && itemChats.length > 0 && !activeChatId) {
      setActiveChatId(itemChats[0]._id);
    }
  }, [isOpen, itemChats, activeChatId]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, pendingMessages, streamingContent]);

  const handleStartChat = async () => {
    if (!item) return;
    
    try {
      const newChatId = await createChat({
        title: `Chat: ${item.title}`,
        model: activeModel,
        libraryItemId: item._id,
      });
      setActiveChatId(newChatId);
      setActiveTab("chat");
      toast.success("Chat started");
    } catch (error) {
      toast.error("Failed to start chat");
    }
  };

  const handleSendMessage = async (text: string, files?: File[]) => {
    if (!text.trim()) return;

    let currentChatId = activeChatId;

    // Create chat if it doesn't exist yet
    if (!currentChatId) {
      try {
        currentChatId = await createChat({
          title: `Chat: ${item.title}`,
          model: activeModel,
          libraryItemId: item._id,
        });
        setActiveChatId(currentChatId);
        setActiveTab("chat");
      } catch (error) {
        toast.error("Failed to start chat session");
        return;
      }
    }

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
        chatId: currentChatId,
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

      // Add system context from library item
      const systemContext = `Context: You are discussing the library item "${item.title}".\n\nItem Content:\n${item.prompt}`;
      
      const currentMessages = [
        { role: "system", content: systemContext },
        ...history,
        { role: "user", content: text }
      ];

      const assistantMessageId = await createMessage({
        chatId: currentChatId,
        role: "assistant",
        content: "",
        model: activeModel,
      });

      await sendMessage({
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

  const handleAddToProject = async () => {
    try {
      await createProject({
        name: item.title,
        description: item.prompt,
        color: "blue",
      });
      toast.success("Project created from library item");
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        showCloseButton={false}
        className="bg-[#020005] border-none text-white !w-screen !h-screen !max-w-none !max-h-none !rounded-none flex flex-col p-0 gap-0 overflow-hidden focus:outline-none !top-0 !left-0 !translate-x-0 !translate-y-0 shadow-none data-[state=open]:!duration-500 data-[state=closed]:!duration-300 data-[state=open]:!slide-in-from-bottom-10 data-[state=closed]:!slide-out-to-bottom-10 data-[state=open]:!zoom-in-95 data-[state=closed]:!zoom-out-95"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
        </div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-600/20 border border-white/5">
              <FileText className="h-5 w-5 text-fuchsia-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 text-white tracking-tight">
                {item.title}
                {item.category && (
                  <Badge variant="secondary" className="bg-white/5 text-white/60 hover:bg-white/10 border-white/5 text-[10px] font-medium px-2 py-0.5 h-5">
                    {item.category}
                  </Badge>
                )}
              </h2>
              <p className="text-xs text-white/40 flex items-center gap-2 font-medium">
                Created {format(new Date(item._creationTime), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* View Toggles */}
          <div className="flex items-center bg-black/40 rounded-full p-1 border border-white/5 backdrop-blur-md">
            <button
              onClick={() => setActiveTab("content")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === "content" 
                  ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/10" 
                  : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Content
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === "chat" 
                  ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/10" 
                  : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="h-9 w-9 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Main Content - Tabs View */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
            
            {/* Content Panel */}
            <div className={`absolute inset-0 flex flex-col transition-all duration-500 ${activeTab === "content" ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 pointer-events-none scale-95"}`}>
              <div className="h-full flex flex-col w-full">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="max-w-4xl mx-auto w-full p-8 md:p-12">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm shadow-2xl relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs text-white/50 hover:text-white hover:bg-white/10 gap-1.5 rounded-full border border-transparent hover:border-white/10"
                          onClick={() => {
                            navigator.clipboard.writeText(item.prompt);
                            toast.success("Copied to clipboard");
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs text-white/50 hover:text-white hover:bg-white/10 gap-1.5 rounded-full border border-transparent hover:border-white/10"
                          onClick={handleAddToProject}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add to Project
                        </Button>
                      </div>
                      
                      {item.imageUrl && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                          className="mb-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                        >
                          <img src={item.imageUrl} alt={item.title} className="w-full h-auto max-h-[400px] object-cover" />
                        </motion.div>
                      )}

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                        className="prose prose-invert max-w-none"
                      >
                        <div className="whitespace-pre-wrap text-white/90 leading-relaxed font-light text-lg md:text-xl tracking-wide">
                          {item.prompt}
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className={`absolute inset-0 flex flex-col transition-all duration-500 ${activeTab === "chat" ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 pointer-events-none scale-95"}`}>
                <div className="flex-1 overflow-hidden relative flex flex-col">
                  <ScrollArea className="flex-1">
                    <div className="max-w-3xl mx-auto w-full px-4 py-8 pb-40 min-h-full flex flex-col">
                      {(!messages || messages.length === 0) && pendingMessages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative"
                          >
                            <div className="absolute inset-0 bg-fuchsia-500/20 blur-3xl rounded-full animate-pulse" />
                            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                              <Sparkles className="h-10 w-10 text-fuchsia-400" />
                            </div>
                          </motion.div>
                          <div className="space-y-2 max-w-md">
                            <h4 className="text-2xl font-bold text-white tracking-tight">Start a conversation</h4>
                            <p className="text-base text-white/50">
                              Ask questions, brainstorm ideas, or refine the content of <span className="text-white/80 font-medium">"{item.title}"</span>.
                            </p>
                          </div>
                          {!activeChatId && (
                            <Button 
                              onClick={handleStartChat} 
                              className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-10 font-medium shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105"
                            >
                              Start Chat Session
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-6">
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
                      )}
                    </div>
                  </ScrollArea>

                  {/* Floating Input Area */}
                  <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="absolute bottom-0 left-0 right-0 z-50 px-4 pb-8 pt-20 bg-gradient-to-t from-[#020005] via-[#020005]/90 to-transparent pointer-events-none"
                  >
                    <div className="max-w-3xl mx-auto w-full pointer-events-auto">
                      <PromptInputBox 
                        onSend={handleSendMessage}
                        isLoading={isStreaming}
                        placeholder={`Ask about "${item.title}"...`}
                        className="bg-white/5 border-white/10 shadow-2xl backdrop-blur-xl"
                      />
                      <p className="text-center text-[10px] text-white/30 mt-3 font-medium">
                        AI can make mistakes. Check important info.
                      </p>
                    </div>
                  </motion.div>
                </div>
            </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}