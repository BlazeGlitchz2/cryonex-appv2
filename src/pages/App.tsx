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
import { useQuery, useMutation, useAction } from "convex/react";
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
  }>>([]);
  const [pendingMessages, setPendingMessages] = useState<Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    model?: string;
    responseTime?: number;
    attachments?: Array<{ name: string; type: string; size: number }>;
  }>>([]);
  const [initialMessageProcessed, setInitialMessageProcessed] = useState(false);

  // Lazy load queries only when needed
  const dbMessages = useQuery(
    api.messages.list,
    currentChatId && user ? { chatId: currentChatId } : "skip"
  );

  // Mutations & Actions
  const createChat = useMutation(api.chats.create);
  const createMessage = useMutation(api.messages.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const sendMessage = useAction(api.chat.sendMessage);

  const { activeModel, activeModelProvider, performanceMode, setPerformanceMode } = useChatStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showModelBrowser, setShowModelBrowser] = useState(false);

  // Use guest messages for non-authenticated users, db messages + pending for authenticated
  const messages = user
    ? [...(dbMessages || []), ...pendingMessages]
    : guestMessages;

  // Handle initial message from landing page
  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null;
    if (state?.initialMessage && !initialMessageProcessed) {
      setInitialMessageProcessed(true);
      navigate(location.pathname, { replace: true, state: {} });
      handleSend(state.initialMessage);
    }
  }, [location.state, initialMessageProcessed, navigate, location.pathname]);

  // Onboarding Check
  useEffect(() => {
    if (user && user.onboardingCompleted === false) {
      // Only redirect if not already on onboarding page
      if (!location.pathname.includes("/onboarding")) {
        navigate("/onboarding");
      }
    }
  }, [user, navigate, location.pathname]);

  const scrollViewport = useCallback(() => {
    return scrollRootRef.current;
  }, []);

  const scrollToBottomInstant = useCallback(() => {
    const viewport = scrollViewport();
    if (!viewport) return;

    viewport.scrollTop = viewport.scrollHeight;
  }, [scrollViewport]);

  // Auto-scroll disabled: Manual scrolling only

  // Combine DB messages with pending messages
  useEffect(() => {
    if (dbMessages) {
      // Clear pending messages once they appear in DB
      setPendingMessages([]);
    }
  }, [dbMessages]);

  const handleSend = async (text: string, files?: File[]) => {
    if (!text.trim()) {
      toast.error("Please enter a message");
      return;
    }

    // OPTIMISTIC UPDATE: Immediately show user message
    const tempId = Date.now().toString();
    const optimisticMessage = {
      id: tempId,
      role: "user" as const,
      content: text,
      attachments: files?.map(f => ({ name: f.name, type: f.type, size: f.size }))
    };

    if (user) {
      setPendingMessages(prev => [...prev, optimisticMessage]);
    } else {
      setGuestMessages(prev => [...prev, optimisticMessage]);
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
      console.log("Uploading files:", files);
      for (const file of files) {
        try {
          const uploadUrl = await generateUploadUrl();
          console.log("Upload URL generated:", uploadUrl);
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type || "application/octet-stream" },
            body: file,
          });
          console.log("Upload result status:", result.status);
          const { storageId } = await result.json();
          console.log("Storage ID:", storageId);

          uploadedFiles.push({
            storageId,
            name: file.name,
            type: file.type,
            size: file.size,
          });

          toast.success(`${file.name} uploaded`);
        } catch (error) {
          console.error("Upload failed:", error);
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
      // Remove optimistic message once sent to DB (Convex will update `dbMessages` shortly)
      setPendingMessages(prev => prev.filter(m => m.id !== tempId));
    }

    setIsStreaming(true);
    setStreamingContent("");

    try {
      // Pass "auto" directly to backend to let it decide
      const modelId = activeModel;

      const history = messages?.map((m: any) => ({
        role: m.role,
        content: m.content
      })) || [];

      // Check for special modes
      let systemInstruction = "";
      if (text.startsWith("[Think:")) {
        systemInstruction = "You are in REASONING mode. You MUST output your internal thought process wrapped in <tool_call>...<tool_call> tags before your final response. The user wants to see how you think.";
      } else if (text.startsWith("[Search:")) {
        systemInstruction = "You are in SEARCH mode. Please provide a comprehensive answer with sources if possible.";
      } else if (text.startsWith("[Canvas:")) {
        systemInstruction = "You are in CANVAS mode. Focus on generating structured content, code, or designs.";
      }

      const currentMessages = [
        ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
        ...history,
        { role: "user", content: text }
      ];

      // Create placeholder assistant message for streaming
      let assistantMessageId;
      if (user && chatId) {
        assistantMessageId = await createMessage({
          chatId,
          role: "assistant",
          content: "", // Start empty
          model: modelId,
        });
      }

      // Call server-side action
      const responseContent = await sendMessage({
        messages: currentMessages,
        model: modelId,
        messageId: assistantMessageId, // Pass ID to enable streaming
      });

      // If we didn't stream (e.g. guest), update state manually
      if (!user) {
        setGuestMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: responseContent,
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
          className="text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors rounded-full px-3 border border-transparent hover:border-white/10"
        >
          {getModelDisplayName()}
          <Sparkles className="h-3 w-3 ml-2 text-purple-400" />
        </Button>
      </div>

      {/* Main Chat Area - Full Screen, No Container */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <div
          className="flex-1 overflow-y-auto scroll-smooth"
          ref={scrollRootRef}
        >
          <div className="max-w-3xl mx-auto w-full px-4 md:px-0 pt-4 pb-40 min-h-full flex flex-col">
            {showEmptyState ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
                {/* Main Greeting */}
                <div className="space-y-6 flex flex-col items-center mb-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
                    <img
                      src="/logo.png"
                      alt="Cryonex Logo"
                      className="relative h-24 w-24 md:h-32 md:w-32 object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.3)] animate-in fade-in zoom-in duration-500"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      Hi, {user?.name?.split(" ")[0] || "Creator"}
                    </h2>
                    <p className="text-base text-white/60">
                      How can I help you create today?
                    </p>
                  </div>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-2xl px-4">
                  {[
                    { icon: Image, label: "Generate Image", desc: "Visuals", gradient: "from-purple-500/20 to-fuchsia-500/20", border: "border-purple-500/20" },
                    { icon: FileText, label: "Draft Text", desc: "Writing", gradient: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/20" },
                    { icon: Code, label: "Write Code", desc: "Development", gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/20" },
                    { icon: Brain, label: "Brainstorm", desc: "Ideas", gradient: "from-orange-500/20 to-amber-500/20", border: "border-orange-500/20" }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(`Help me ${item.label.toLowerCase()}`)}
                      className={`group relative overflow-hidden rounded-2xl border ${item.border} bg-white/[0.02] hover:bg-white/[0.05] p-4 text-left transition-all hover:scale-[1.01] hover:shadow-lg`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} text-white`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-white group-hover:text-white transition-colors">{item.label}</h3>
                          <p className="text-[10px] text-white/60 group-hover:text-white/80 transition-colors">{item.desc}</p>
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
                  
                  // Check for system error messages (like HTML verification)
                  const isSystemError = message.role === "system" || (message.role === "assistant" && message.content.startsWith("[System:"));

                  if (isSystemError) {
                    return (
                      <div key={key} className="flex justify-center my-4 w-full">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-2xl w-full text-red-200 text-sm overflow-hidden">
                          <div className="flex items-center gap-2 mb-2 font-semibold text-red-400">
                            <span className="text-lg">⚠️</span> API Error
                          </div>
                          <div className="whitespace-pre-wrap font-mono text-xs opacity-80">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    );
                  }

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
        </div>

        {/* Input Area - Floating at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-12 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
          <div className="max-w-3xl mx-auto w-full pointer-events-auto">
            <PromptInputBox
              onSend={handleSend}
              isLoading={isStreaming}
            />
            <p className="text-center text-[10px] text-white/30 mt-3 font-medium">
              Cryonex can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}