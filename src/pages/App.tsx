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
  const scrollRef = useRef<HTMLDivElement>(null);
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

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, streamingContent]);

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
      if (!keys?.OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key not found. Please add it in Integrations.");
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
    <div className="flex-1 flex flex-col overflow-hidden relative h-full">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/50 bg-background/80 backdrop-blur-md md:hidden z-50">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMobileSidebar}>
                <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold">Cryonex Chat</h1>
        </div>
      </div>

      {/* Model Selector */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto md:top-6 hidden md:block">
        <MenuBar
          items={[
            {
              icon: <Sparkles className="h-4 w-4" />,
              label: getModelDisplayName(),
              onClick: () => setShowModelBrowser(true),
              active: true,
            },
          ]}
        />
      </div>

      {/* Mobile Model Selector (Simple Button) */}
      <div className="md:hidden flex justify-center py-2 absolute top-14 left-0 right-0 z-30 pointer-events-none">
        <Button 
            variant="secondary" 
            size="sm" 
            className="h-7 text-xs gap-1.5 pointer-events-auto shadow-sm bg-background/80 backdrop-blur-md border border-white/10 rounded-full"
            onClick={() => setShowModelBrowser(true)}
        >
            <Sparkles className="h-3 w-3" />
            {getModelDisplayName()}
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 relative z-10 pt-12 md:pt-24 pb-32 pointer-events-auto overflow-auto bg-transparent" ref={scrollRef}>
        {showEmptyState ? (
          <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center pb-32">
            <div className="text-center space-y-4 md:space-y-6 px-4">
              <div className="mx-auto h-24 w-24 md:h-32 md:w-32 flex items-center justify-center">
                <CryonexLogo />
              </div>
              <h2 className="text-2xl md:text-4xl font-medium text-foreground">
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, <br className="md:hidden"/> {user?.name?.split(' ')[0] || "Guest"}
              </h2>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6 py-8">
            <div className="space-y-6">
              {messages.map((message) => {
                const key = ('_id' in message ? message._id : message.id) as any;
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
                <Message
                  from="assistant"
                  userInitial="AI"
                  isStreaming={true}
                >
                  <MessageResponse content={streamingContent} />
                </Message>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/80 to-transparent z-20">
        <div className="max-w-3xl mx-auto">
          <PromptInputBox onSend={handleSend} isLoading={isStreaming} />
          <p className="text-center text-xs text-muted-foreground mt-2">
            Cryonex can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}