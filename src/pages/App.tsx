import { useChatStore } from "@/lib/stores/chat-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { getModelDisplayMeta } from "@/lib/utils/model-utils";
import { MenuBar } from "@/components/ui/glow-menu";
import { Message, MessageContent, MessageResponse } from "@/components/ui/message";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import CryonexLogo from "@/components/CryonexLogo";
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Search,
  Image,
  FolderOpen,
  Mic,
  History,
  Menu,
  FileText,
  Code,
  Brain,
  ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useLocation, useNavigate } from "react-router";

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleMobileSidebar } = useUIStore();

  const [currentChatId, setCurrentChatId] = useState<Id<"chats"> | null>(null);
  const [guestMessages, setGuestMessages] = useState<Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    model?: string;
    responseTime?: number;
    attachments?: Array<{ name: string; type: string; size: number }>;
    sources?: Array<{ title: string; url: string; domain: string }>;
  }>>([]);
  const [initialMessageProcessed, setInitialMessageProcessed] = useState(false);

  // Lazy load queries only when needed
  const dbMessages = useQuery(
    api.messages.list,
    currentChatId && user ? { chatId: currentChatId } : "skip"
  );

  // Use guest messages for non-authenticated users, db messages for authenticated
  const messages = user ? dbMessages : guestMessages;

  // Mutations
  const createChat = useMutation(api.chats.create);
  const createMessage = useMutation(api.messages.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const { activeModel, activeModelProvider, performanceMode, setPerformanceMode } = useChatStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showModelBrowser, setShowModelBrowser] = useState(false);

  // Fetch API keys from backend to allow direct client-side calls
  const apiKeys = useQuery(api.keys.getApiKeys);

  // Handle initial message from landing page
  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null;
    if (state?.initialMessage && !initialMessageProcessed) {
      setInitialMessageProcessed(true);
      navigate(location.pathname, { replace: true, state: {} });
      handleSend(state.initialMessage);
    }
  }, [location.state, initialMessageProcessed, navigate, location.pathname]);

  const scrollViewport = useCallback(() => {
    if (!scrollRootRef.current) return null;
    return scrollRootRef.current.querySelector<HTMLDivElement>("[data-slot='scroll-area-viewport']");
  }, []);

  const scrollToBottomInstant = useCallback(() => {
    const viewport = scrollViewport();
    if (!viewport) return;

    viewport.scrollTop = viewport.scrollHeight;
  }, [scrollViewport]);

  // Gentle auto-scroll for new messages (non-streaming)
  useEffect(() => {
    scrollToBottomInstant();
  }, [messages, scrollToBottomInstant]);

  // Micro-scroll while the AI is streaming
  useEffect(() => {
    if (!isStreaming) return;

    const viewport = scrollViewport();
    if (!viewport) return;

    const distance =
      viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop;

    // Only auto-scroll if user is near the bottom already
    if (distance < 200) {
      const step = Math.max(distance * 0.18, 6); // micro-scroll amount
      viewport.scrollTop = viewport.scrollTop + step;
    }
  }, [streamingContent, isStreaming, scrollViewport]);

  const handleSend = async (text: string, files?: File[]) => {
    if (!text.trim()) {
      toast.error("Please enter a message");
      return;
    }

    let chatId = currentChatId;
    if (!chatId && user) {
      chatId = await createChat({
        title: "New Chat",
        model: activeModel,
      });
      setCurrentChatId(chatId);
    }

    const uploadedFiles: Array<{ storageId: Id<"_storage">; name: string; type: string; size: number }> = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          const { storageId } = await result.json();

          uploadedFiles.push({
            storageId,
            name: file.name,
            type: file.type,
            size: file.size,
          });

          toast.success(`${file.name} uploaded`);
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    }

    if (user && chatId) {
      await createMessage({
        chatId,
        role: "user",
        content: text,
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      });
    } else if (!user) {
      setGuestMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "user",
        content: text,
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      }]);
    }

    setIsStreaming(true);
    setStreamingContent("");

    try {
      const keys = apiKeys;
      // Handle loading state
      if (keys === undefined) {
        toast.warning("Connecting to server... please wait a moment.");
        setIsStreaming(false);
        return;
      }

      if (!keys?.OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key not found. Please check your Convex Dashboard environment variables.");
      }

      const modelId = activeModel === "auto" ? "openai/gpt-4-turbo" : activeModel;

      const history = messages?.map((m: any) => ({
        role: m.role,
        content: m.content
      })) || [];

      const currentMessages = [
        ...history,
        { role: "user", content: text }
      ];

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${keys.OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Cryonex Workspace",
        },
        body: JSON.stringify({
          model: modelId,
          messages: currentMessages,
          stream: true,
          max_tokens: 4096,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(line => line.trim() !== "");

        for (const line of lines) {
          if (line.includes("[DONE]")) continue;
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content || "";
              if (content) {
                fullContent += content;
                setStreamingContent(prev => prev + content);
              }
            } catch (e) {
              console.error("Error parsing chunk", e);
            }
          }
        }
      }

      if (user && chatId) {
        await createMessage({
          chatId,
          role: "assistant",
          content: fullContent,
          model: modelId,
        });
      } else if (!user) {
        setGuestMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: fullContent,
          model: modelId,
        }]);
      }

    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to generate response");
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const showEmptyState = !messages || messages.length === 0;
  const getModelDisplayName = () => getModelDisplayMeta(activeModel, activeModelProvider).name;

  return (
    <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden bg-transparent">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-b border-white/5 bg-background/70 backdrop-blur-2xl md:hidden z-30">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
            onClick={toggleMobileSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-base font-semibold tracking-tight">Cryonex</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-white/15 bg-white/10 text-xs text-white hover:bg-white/20"
          onClick={() => setShowModelBrowser(true)}
        >
          <Sparkles className="h-3 w-3 mr-1.5" />
          {getModelDisplayName()}
        </Button>
      </div>

      {/* Desktop Header - Simplified & Minimal */}
      <div className="hidden md:flex items-center justify-between px-6 py-3 z-20">
          <div /> {/* Spacer */}
          <Button 
             variant="ghost" 
             size="sm" 
             onClick={() => setShowModelBrowser(true)}
             className="text-xs font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors rounded-full px-3"
          >
             {getModelDisplayName()}
             <Sparkles className="h-3 w-3 ml-2" />
          </Button>
      </div>

      {/* Main Chat Area - Full Screen, No Container */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <ScrollArea
          className="flex-1"
          ref={scrollRootRef as any}
        >
            <div className="max-w-3xl mx-auto w-full px-4 md:px-0 pt-4 pb-40 min-h-full flex flex-col">
              {showEmptyState ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
                    {/* Main Greeting */}
                    <div className="space-y-6 flex flex-col items-center mb-10">
                      <img 
                        src="/logo.png" 
                        alt="Cryonex Logo" 
                        className="h-24 w-24 md:h-32 md:w-32 object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.3)] animate-in fade-in zoom-in duration-500"
                      />
                      <div className="text-center space-y-2">
                          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                            Hi, {user?.name?.split(" ")[0] || "Creator"}
                          </h2>
                          <p className="text-base text-white/40">
                            How can I help you create today?
                          </p>
                      </div>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full max-w-2xl px-4">
                      {[
                        { icon: Image, label: "Generate Image", desc: "Visuals", gradient: "from-purple-500/20 to-fuchsia-500/20" },
                        { icon: FileText, label: "Draft Text", desc: "Writing", gradient: "from-blue-500/20 to-cyan-500/20" },
                        { icon: Code, label: "Write Code", desc: "Development", gradient: "from-emerald-500/20 to-teal-500/20" },
                        { icon: Brain, label: "Brainstorm", desc: "Ideas", gradient: "from-orange-500/20 to-amber-500/20" }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(`Help me ${item.label.toLowerCase()}`)}
                          className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] p-4 text-left transition-all hover:scale-[1.01]"
                        >
                           <div className="flex items-start gap-3">
                             <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} text-white`}>
                               <item.icon className="h-4 w-4" />
                             </div>
                             <div>
                               <h3 className="text-sm font-medium text-white group-hover:text-white transition-colors">{item.label}</h3>
                               <p className="text-[10px] text-white/40">{item.desc}</p>
                             </div>
                           </div>
                        </button>
                      ))}
                    </div>
                </div>
              ) : (
                <div className="space-y-6 py-4">
                    {messages.map((message) => {
                      const key = ("_id" in message ? message._id : message.id) as any;
                      const isUser = message.role === "user";
                      const userInitial = user?.email?.[0]?.toUpperCase() || "U";

                      return (
                        <Message
                          key={key}
                          from={isUser ? "user" : "assistant"}
                          userInitial={userInitial}
                        >
                          {isUser ? (
                            <MessageContent>{message.content}</MessageContent>
                          ) : (
                            <MessageResponse content={message.content} />
                          )}
                        </Message>
                      );
                    })}
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

        {/* Input Area - Floating at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-12 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
          <div className="max-w-3xl mx-auto w-full pointer-events-auto">
            <div className="rounded-[1.5rem] border border-border bg-card shadow-2xl shadow-black/10 p-2 ring-1 ring-border/50 focus-within:ring-ring focus-within:border-ring transition-all">
              <PromptInputBox 
                onSend={handleSend} 
                isLoading={isStreaming} 
                className="bg-transparent border-none shadow-none"
              />
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-3 font-medium">
              Cryonex can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}