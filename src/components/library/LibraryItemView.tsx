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
        className="bg-[#0a0a0a] border-none text-white !w-screen !h-screen !max-w-none !max-h-none !rounded-none flex flex-col p-0 gap-0 overflow-hidden focus:outline-none !top-0 !left-0 !translate-x-0 !translate-y-0 shadow-none data-[state=open]:!zoom-in-100 data-[state=closed]:!zoom-out-100"
      >
        {/* Header */}
        <div className="h-16 border-b border-white/10 bg-white/5 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-fuchsia-500/10">
              <FileText className="h-5 w-5 text-fuchsia-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {item.title}
                {item.category && (
                  <Badge variant="secondary" className="bg-white/10 text-white/60 hover:bg-white/20 border-transparent text-xs font-normal">
                    {item.category}
                  </Badge>
                )}
              </h2>
              <p className="text-xs text-white/40 flex items-center gap-2">
                Created {format(new Date(item._creationTime), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* View Toggles */}
          <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setActiveTab("content")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === "content" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              Content
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === "chat" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 rounded-full">
              <X className="h-5 w-5 text-white/70" />
            </Button>
          </div>
        </div>

        {/* Main Content - Tabs View */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
            
            {/* Content Panel */}
            <div className={`absolute inset-0 flex flex-col bg-black/20 transition-opacity duration-300 ${activeTab === "content" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
              <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Content
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs text-white/50 hover:text-white gap-1.5"
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
                      className="h-8 text-xs text-white/50 hover:text-white gap-1.5"
                      onClick={handleAddToProject}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add to Project
                    </Button>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-8 md:p-12">
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-white/80 leading-relaxed font-light text-lg">
                      {item.prompt}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Chat Panel */}
            <div className={`absolute inset-0 flex flex-col bg-white/[0.02] transition-opacity duration-300 ${activeTab === "chat" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    AI Assistant
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-white/40 text-[10px] uppercase tracking-wider">
                      {activeModel}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden relative flex flex-col">
                  <ScrollArea className="flex-1 p-4 md:p-6">
                    <div className="max-w-3xl mx-auto space-y-6 pb-4">
                      {(!messages || messages.length === 0) && pendingMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[40vh] text-center space-y-4">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-fuchsia-400/50" />
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-white">Start a conversation</h4>
                            <p className="text-sm text-white/40 max-w-xs mx-auto mt-1">
                              Ask questions, brainstorm ideas, or refine the content of this library item.
                            </p>
                          </div>
                          {!activeChatId && (
                            <Button onClick={handleStartChat} variant="outline" className="border-white/10 hover:bg-white/5">
                              Start Chat Session
                            </Button>
                          )}
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="p-4 md:p-6 bg-black/20 border-t border-white/5">
                    <div className="max-w-3xl mx-auto">
                      <PromptInputBox 
                        onSend={handleSendMessage}
                        isLoading={isStreaming}
                        placeholder={`Ask about "${item.title}"...`}
                        className="bg-white/5 border-white/10 shadow-xl"
                      />
                    </div>
                  </div>
                </div>
            </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}