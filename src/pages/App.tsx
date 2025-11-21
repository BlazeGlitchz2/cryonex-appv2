import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation, useAction } from "convex/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  MoreHorizontal,
  Sparkles,
  Search,
  Image,
  FolderOpen,
  Mic,
  Zap,
  Eye,
  CheckCircle2,
  Loader2,
  Dot,
  MessageSquare,
  FolderKanban,
  BookOpen,
  Settings,
  LogOut,
  ChevronDown,
  Share2,
  Menu,
  X,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import { useLocation } from "react-router";
import { useChatStore } from "@/lib/stores/chat-store";
import { ModelProvider, getModelDisplayMeta, inferModelProvider } from "@/lib/utils/model-utils";
import { ModelBrowser } from "@/components/models/ModelBrowser";
import { SparklesCore } from "@/components/ui/sparkles";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { MenuBar } from "@/components/ui/glow-menu";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router";
import { AIThinkingBlock } from "@/components/ui/ai-thinking-block";
import { FallingPattern } from "@/components/ui/falling-pattern";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  ChainOfThoughtImage,
} from "@/components/ui/chain-of-thought";
import { Message, MessageContent, MessageResponse, MessageActions, MessageAction, MessageAttachments, MessageAttachment } from "@/components/ui/message";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import React from "react";
import ConversationHistorySidebar from "@/components/ui/ConversationHistorySidebar";
import { History } from "lucide-react";
import ThinkingDots from "@/components/ui/ThinkingDots";

export default function App() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [puterAuthChecked, setPuterAuthChecked] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "library" | "projects" | "study">("chat");
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  
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
  const [lastSearchQuery, setLastSearchQuery] = useState<string | null>(null);
  const [lastSearchResults, setLastSearchResults] = useState<
    Array<{ title: string; url: string; domain: string; snippet: string; imageUrl?: string }>
  >([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
  
  // Lazy load queries only when needed
  const chats = useQuery(api.chats.list, user ? {} : "skip");
  const dbMessages = useQuery(
    api.messages.list,
    currentChatId && user ? { chatId: currentChatId } : "skip"
  );
  
  // Use guest messages for non-authenticated users, db messages for authenticated
  const messages = user ? dbMessages : guestMessages;
  const searchCount = useQuery(
    api.users.getSearchCount,
    user ? {} : "skip"
  );
  
  // Mutations
  const createChat = useMutation(api.chats.create);
  const createMessage = useMutation(api.messages.create);
  const updateChat = useMutation(api.chats.update);
  const deepSearch = useAction(api.search.deepSearch);
  const incrementSearchCount = useMutation(api.users.incrementSearchCount);
  const searchSpotifyTracks = useAction(api.spotifyChat.searchTracks);

  const { activeModel, activeModelProvider, performanceMode, setPerformanceMode } = useChatStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [showModelBrowser, setShowModelBrowser] = useState(false);
  const [sparklesPaused, setSparklesPaused] = useState(true);
  const sparklesTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Fetch API keys from backend to allow direct client-side calls
  const apiKeys = useQuery(api.keys.getApiKeys);

  // Simplified sparkles control
  useEffect(() => {
    if (performanceMode) {
      setSparklesPaused(true);
      return;
    }

    if (isStreaming || isSearching) {
      setSparklesPaused(false);
      return;
    }

    const timer = setTimeout(() => setSparklesPaused(true), 5000);
    return () => clearTimeout(timer);
  }, [isStreaming, isSearching, performanceMode]);

  const handleUserInteraction = useCallback(() => {
    if (!performanceMode) setSparklesPaused(false);
  }, [performanceMode]);

  // Handle initial message from landing page
  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null;
    if (state?.initialMessage && !initialMessageProcessed) {
      setInitialMessageProcessed(true);
      // Clear the state to prevent re-processing on navigation
      navigate(location.pathname, { replace: true, state: {} });
      // Send the message
      handleSend(state.initialMessage);
    }
  }, [location.state, initialMessageProcessed, navigate, location.pathname]);

  // Auto-scroll to bottom when messages update or streaming content changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, streamingContent]);

  const handlePerformanceModeSelect = (mode: boolean) => {
    setPerformanceMode(mode);
    setShowPerformanceDialog(false);
    toast.success(mode ? "Performance mode enabled" : "Enhanced visuals enabled");
  };

  const handleSend = async (text: string, files?: File[], enableSearch?: boolean, enableCanvas?: boolean) => {
    handleUserInteraction();
    
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

    // Start streaming response
    setIsStreaming(true);
    setStreamingContent("");
    
    try {
      const keys = apiKeys;
      if (!keys?.BYTEZ_API_KEY) {
        throw new Error("Bytez API key not found");
      }

      const modelId = activeModel === "auto" ? "Qwen/Qwen2.5-72B-Instruct" : activeModel;
      
      // Prepare messages
      const history = messages?.map((m: any) => ({
        role: m.role,
        content: m.content
      })) || [];
      
      const currentMessages = [
        ...history,
        { role: "user", content: text }
      ];

      // Use client-side fetch for streaming
      const response = await fetch("https://api.bytez.com/models/v2/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": keys.BYTEZ_API_KEY,
          "provider-key": keys.PROVIDER_API_KEY || "",
        },
        body: JSON.stringify({
          model: modelId,
          messages: currentMessages,
          stream: true,
          max_tokens: 4096,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

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

      // Save the final message
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
      
      const errorMsg = "I apologize, but I encountered an error generating a response. Please try again.";
      if (user && chatId) {
        await createMessage({
          chatId,
          role: "assistant",
          content: errorMsg,
          model: "System",
        });
      } else if (!user) {
        setGuestMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: errorMsg,
          model: "System",
        }]);
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const deleteMessagesFromIndex = useMutation(api.messages.deleteMessagesFromIndex);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!user || !currentChatId) {
      toast.error("Cannot edit message: Not authenticated");
      return;
    }

    try {
      // Find the message and all messages after it
      const messageIndex = messages?.findIndex((m: any) => m._id === messageId);
      if (messageIndex === undefined || messageIndex === -1) return;

      // Delete all messages from this index onwards
      await deleteMessagesFromIndex({
        chatId: currentChatId,
        fromIndex: messageIndex,
      });

      // Resend with the new content
      await handleSend(newContent);
      toast.success("Message edited and regenerated");
    } catch (error: any) {
      console.error("Error editing message:", error);
      toast.error("Failed to edit message");
    }
  };

  const handleRegenerateResponse = async (messageId: string) => {
    if (!user || !currentChatId) {
      toast.error("Cannot regenerate: Not authenticated");
      return;
    }

    try {
      setRegeneratingMessageId(messageId);
      
      // Find the assistant message and the user message before it
      const messageIndex = messages?.findIndex((m: any) => m._id === messageId);
      if (messageIndex === undefined || messageIndex === -1 || messageIndex === 0) {
        toast.error("Cannot find message to regenerate");
        return;
      }

      const userMessage = messages?.[messageIndex - 1];
      if (!userMessage || userMessage.role !== 'user') {
        toast.error("Cannot find user message");
        return;
      }

      // Delete the assistant message
      await deleteMessage({ messageId: messageId as any });

      // Resend the user's message
      await handleSend(userMessage.content);
      toast.success("Response regenerated");
    } catch (error: any) {
      console.error("Error regenerating response:", error);
      toast.error("Failed to regenerate response");
    } finally {
      setRegeneratingMessageId(null);
    }
  };

  // Listen for custom event to open model browser from prompt box
  useEffect(() => {
    const handleOpenModelBrowser = () => {
      setShowModelBrowser(true);
    };
    
    window.addEventListener('openModelBrowser', handleOpenModelBrowser);
    return () => window.removeEventListener('openModelBrowser', handleOpenModelBrowser);
  }, []);

  const showEmptyState = !messages || messages.length === 0;

  const features = [
    { icon: Search, label: "DeepSearch" },
    { icon: Image, label: "Create Images" },
    { icon: FolderOpen, label: "Try Projects" },
    { icon: Mic, label: "Voice" },
  ];

  const getModelDisplayName = () => getModelDisplayMeta(activeModel, activeModelProvider).name;

  // Helper for rendering COT like the reference
  const firstImageResult = lastSearchResults.find((r) => r.imageUrl);
  const recentWorkDomains: Array<string> = Array.from(
    new Set(
      lastSearchResults
        .map((r) => r.domain)
        .filter(Boolean)
    )
  )
    .filter((d) =>
      ["github.com", "dribbble.com", "behance.net", "medium.com", "x.com", "instagram.com", "linkedin.com"].some((k) =>
        (d || "").includes(k)
      )
    )
    .slice(0, 6);

  const handleShare = async (content: string) => {
    try {
      const shareText = content.length > 1500 ? `${content.slice(0, 1500)}…` : content;
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: "Cryonex Message", text: shareText, url });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n\n${url}`);
        toast.success("Share link copied to clipboard");
      }
    } catch {
      // ignore if user cancels or share not supported
    }
  };

  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[#030014] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a0b2e] via-[#030014] to-[#030014]" />
        <div className="stars absolute inset-0 opacity-50" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Sidebar */}
      <aside className={`${leftSidebarCollapsed ? 'w-16' : 'w-64'} border-r border-white/10 bg-white/5 backdrop-blur-xl backdrop-saturate-150 flex flex-col shadow-[0_8px_40px_rgba(0,0,0,0.25)] sticky top-0 h-screen z-[100] transition-all duration-300 hidden md:flex`}>
        {/* Brand */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-4">
          {!leftSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Cryonex</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            className="text-white hover:bg-white/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab("chat")}
            className={`sidebar-item group/sidebar-item w-full flex items-center ${leftSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl transition-all relative overflow-hidden ${
              activeTab === "chat"
                ? "bg-white/20 text-white border border-white/30 sidebar-item-active"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
            title={leftSidebarCollapsed ? "Chat" : ""}
          >
            <div className="sidebar-glow-effect"></div>
            <div className="sidebar-engagement-pulse"></div>
            <MessageSquare className="h-5 w-5 shrink-0 relative z-10" />
            {!leftSidebarCollapsed && <span className="font-medium relative z-10">Chat</span>}
          </button>

          <button
            onClick={() => navigate("/library")}
            className="sidebar-item group/sidebar-item w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all relative overflow-hidden"
            title={leftSidebarCollapsed ? "Library" : ""}
          >
            <div className="sidebar-glow-effect"></div>
            <div className="sidebar-engagement-pulse"></div>
            <Sparkles className="h-5 w-5 shrink-0 relative z-10" />
            {!leftSidebarCollapsed && <span className="font-medium relative z-10">Library</span>}
          </button>

          <button
            onClick={() => navigate("/projects")}
            className="sidebar-item group/sidebar-item w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all relative overflow-hidden"
            title={leftSidebarCollapsed ? "Projects" : ""}
          >
            <div className="sidebar-glow-effect"></div>
            <div className="sidebar-engagement-pulse"></div>
            <FolderKanban className="h-5 w-5 shrink-0 relative z-10" />
            {!leftSidebarCollapsed && <span className="font-medium relative z-10">Projects</span>}
          </button>

          <button
            onClick={() => navigate("/study/dashboard")}
            className="sidebar-item group/sidebar-item w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all relative overflow-hidden"
            title={leftSidebarCollapsed ? "Study" : ""}
          >
            <div className="sidebar-glow-effect"></div>
            <div className="sidebar-engagement-pulse"></div>
            <BookOpen className="h-5 w-5 shrink-0 relative z-10" />
            {!leftSidebarCollapsed && <span className="font-medium relative z-10">Study</span>}
          </button>
        </nav>

        {/* Theme Toggle & User Profile */}
        <div className="border-t border-white/10 p-2 sm:p-4 space-y-3 relative z-[110]">
          {!leftSidebarCollapsed && (
            <div className="flex justify-center">
              <ThemeToggle onChange={setIsDarkMode} />
            </div>
          )}
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  type="button"
                  className={`w-full flex items-center ${leftSidebarCollapsed ? 'justify-center' : 'gap-3'} px-2 sm:px-4 py-3 rounded-xl backdrop-blur-md border transition-all hover:bg-white/20 cursor-pointer ${
                    isDarkMode 
                      ? "bg-white/10 border-white/20" 
                      : "bg-white/30 border-white/40"
                  }`}
                  title={leftSidebarCollapsed ? user.email : ""}
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0">
                    {user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  {!leftSidebarCollapsed && (
                    <>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold truncate text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          {user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs truncate text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                          {user.email}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-white/70 shrink-0" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                side="top"
                className="w-56 bg-white/10 backdrop-blur-xl border-white/20 text-white z-[120]"
                sideOffset={8}
              >
                <DropdownMenuItem 
                  onClick={() => setShowSettingsDialog(true)}
                  className="cursor-pointer hover:bg-white/20 focus:bg-white/20"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="cursor-pointer hover:bg-white/20 focus:bg-white/20 text-red-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {!user && !leftSidebarCollapsed && (
            <button
              onClick={() => navigate("/auth")}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl backdrop-blur-md border transition-all ${
                isDarkMode
                  ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  : "bg-white/20 border-white/30 text-white hover:bg-white/30"
              }`}
            >
              <span className="text-sm font-medium">Sign In</span>
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <ConversationHistorySidebar isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex items-center justify-between p-3 sm:p-4 border-b dark:border-b-border/50 bg-background/80 backdrop-blur-md md:hidden">
            <h1 className="text-lg sm:text-xl font-bold">Cryonex Chat</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHistoryOpen(true)}
                className="h-8 px-2"
                aria-label="Open conversation history"
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Ambient light effects */}
          <div className="fixed top-20 left-20 w-96 h-96 bg-yellow-400/30 rounded-full blur-3xl -z-10" />
          <div className="fixed bottom-20 right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -z-10" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-3xl -z-10" />

          {/* Falling Pattern Background - Pauses during AI activity */}
          {!performanceMode && (
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <FallingPattern
                colors={["#8B5CF6", "#EC4899", "#3B82F6", "#10B981"]}
                duration={25}
                blur={8}
                density={25}
                paused={isStreaming || isSearching}
              />
            </div>
          )}

          {/* Sparkles Background - Optimized, disabled by default in performance mode */}
          {!performanceMode && (
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <SparklesCore
                id="app-sparkles"
                background="transparent"
                minSize={0.3}
                maxSize={0.6}
                particleDensity={20}
                className="w-full h-full"
                particleColor="#FFFFFF"
                speed={0.15}
                paused={sparklesPaused}
              />
            </div>
          )}

          {/* Model Selector - Centered Below Nav */}
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
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

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 relative z-10 pt-32 pb-32 pointer-events-auto overflow-auto bg-transparent" ref={scrollRef}>
            {showEmptyState ? (
              <div className="w-full h-full flex items-center justify-center absolute inset-0">
                <div className="flex flex-col items-center justify-center space-y-8">
                  {/* Icon */}
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-2xl">
                    <Sparkles className="h-10 w-10 text-white animate-pulse" />
                  </div>

                  {/* Heading */}
                  <div className="text-center space-y-3">
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                      How can I help you today?
                    </h2>
                    <p className="text-white/70 text-lg">
                      Choose a feature below or start typing your message
                    </p>
                  </div>

                  {/* Feature Chips */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                  <button
                    onClick={() => handleSend("Search the web for latest AI news", undefined, true)}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-white/20 p-6 hover:border-cyan-400/50 hover:scale-105 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Search className="h-8 w-8 text-cyan-400 mb-3 relative z-10" />
                    <p className="text-white font-semibold text-sm relative z-10">DeepSearch</p>
                  </button>

                  <button
                    onClick={() => {
                      const input = document.querySelector('textarea');
                      if (input) {
                        input.focus();
                        // Trigger canvas mode
                        const event = new CustomEvent('enableCanvas');
                        window.dispatchEvent(event);
                      }
                    }}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/20 p-6 hover:border-purple-400/50 hover:scale-105 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Image className="h-8 w-8 text-purple-400 mb-3 relative z-10" />
                    <p className="text-white font-semibold text-sm relative z-10">Create Images</p>
                  </button>

                  <button
                    onClick={() => navigate("/projects")}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-md border border-white/20 p-6 hover:border-orange-400/50 hover:scale-105 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <FolderOpen className="h-8 w-8 text-orange-400 mb-3 relative z-10" />
                    <p className="text-white font-semibold text-sm relative z-10">Try Projects</p>
                  </button>

                  <button
                    onClick={() => {
                      const input = document.querySelector('textarea');
                      if (input) {
                        input.focus();
                      }
                      toast.info("Voice input coming soon!");
                    }}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-white/20 p-6 hover:border-green-400/50 hover:scale-105 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Mic className="h-8 w-8 text-green-400 mb-3 relative z-10" />
                    <p className="text-white font-semibold text-sm relative z-10">Voice</p>
                  </button>
                </div>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6 py-8">
                <div className="space-y-6">
                  {messages.map((message) => {
                    const key = ('_id' in message ? message._id : message.id) as any;
                    const isUser = message.role === "user";
                    const userInitial = user?.email?.[0]?.toUpperCase() || "U";
                    const isRegenerating = regeneratingMessageId === key;

                    return (
                      <Message
                        key={key}
                        from={isUser ? "user" : "assistant"}
                        userInitial={userInitial}
                        model={!isUser ? (message as any).model : undefined}
                        responseTime={!isUser ? (message as any).responseTime : undefined}
                        onEdit={isUser && user ? (newContent) => { if (typeof newContent === "string") handleEditMessage(key, newContent); } : undefined}
                        onRegenerate={!isUser && user && !isRegenerating ? () => handleRegenerateResponse(key) : undefined}
                      >
                        {isUser ? (
                          <>
                            <MessageContent>{(message as any).content}</MessageContent>
                            {(message as any).attachments && (message as any).attachments.length > 0 && (
                              <MessageAttachments>
                                {(message as any).attachments.map((att: any, i: number) => (
                                  <MessageAttachment key={i} filename={att.name} />
                                ))}
                              </MessageAttachments>
                            )}
                          </>
                        ) : (
                          <>
                            {isRegenerating ? (
                              <div className="flex items-center gap-2 text-white/70">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Regenerating response...</span>
                              </div>
                            ) : (
                              <>
                                <MessageResponse content={(message as any).content} />

                                {(message as any).sources && (message as any).sources.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-xs text-[#6b6b6b] font-semibold">Sources:</p>
                                    {(message as any).sources.map((source: any, i: number) => (
                                      <a
                                        key={i}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors"
                                      >
                                        <p className="text-xs font-medium text-white">{source.title}</p>
                                        <p className="text-xs text-[#6b6b6b] mt-1">{source.domain}</p>
                                      </a>
                                    ))}
                                  </div>
                                )}

                                <MessageActions>
                                  <MessageAction type="copy" onClick={() => handleCopy((message as any).content)} />
                                  <MessageAction 
                                    type="retry" 
                                    onClick={() => handleRegenerateResponse(key)}
                                    disabled={isRegenerating}
                                  />
                                  <MessageAction type="like" />
                                  <MessageAction type="dislike" />
                                  <MessageAction type="more" />
                                </MessageActions>
                                <div className="mt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShare((message as any).content)}
                                    className="h-7 px-2"
                                    aria-label="Share message"
                                  >
                                    <Share2 className="h-4 w-4 mr-1" />
                                    Share
                                  </Button>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </Message>
                    );
                  })}
                  
                  {/* Dummy div for auto-scroll target */}
                  <div ref={messagesEndRef} />

                  {(isStreaming || isSearching) && (
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 text-black animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <ThinkingDots className="mb-2" />
                        {isSearching ? (
                          <ChainOfThought defaultOpen className="bg-[#1a1a1a] border border-[#2a2a2a]">
                            <ChainOfThoughtHeader>Chain of Thought</ChainOfThoughtHeader>
                            <ChainOfThoughtContent>
                              <div className="space-y-3">
                                <ChainOfThoughtStep
                                  icon={Search}
                                  label={
                                    lastSearchQuery
                                      ? `Searching for profiles for ${lastSearchQuery}...`
                                      : "Searching the web..."
                                  }
                                  status="active"
                                  className="animate-pulse"
                                />
                                {lastSearchResults && lastSearchResults.length > 0 ? (
                                  <>
                                    <ChainOfThoughtSearchResults className="mt-1">
                                      {Array.from(
                                        new Set(
                                          lastSearchResults
                                            .map((r) => r.domain)
                                            .filter(Boolean)
                                        )
                                      )
                                        .slice(0, 6)
                                        .map((domain) => (
                                          <ChainOfThoughtSearchResult key={domain}>
                                            {domain}
                                          </ChainOfThoughtSearchResult>
                                        ))}
                                    </ChainOfThoughtSearchResults>

                                    {firstImageResult?.imageUrl ? (
                                      <>
                                        <ChainOfThoughtStep
                                          icon={Image}
                                          label={`Found a profile photo for ${lastSearchQuery}`}
                                          status="complete"
                                        />
                                        <ChainOfThoughtImage caption={`Profile image from ${firstImageResult.domain}.`}>
                                          <img
                                            src={firstImageResult.imageUrl}
                                            alt="Profile"
                                            className="w-full max-h-64 object-contain bg-black"
                                          />
                                        </ChainOfThoughtImage>
                                      </>
                                    ) : null}

                                    {/* Short bullet summary from top result */}
                                    <ul className="list-disc list-inside text-xs text-[#cfcfcf] space-y-1">
                                      <li>
                                        {lastSearchResults[0]?.snippet || "Summary extracted from top search result."}
                                      </li>
                                    </ul>

                                    <ChainOfThoughtStep
                                      icon={Search}
                                      label="Searching for recent work..."
                                      status="active"
                                    />
                                    {recentWorkDomains.length > 0 ? (
                                      <ChainOfThoughtSearchResults>
                                        {recentWorkDomains.map((d) => (
                                          <ChainOfThoughtSearchResult key={`recent-${d}`}>{d}</ChainOfThoughtSearchResult>
                                        ))}
                                      </ChainOfThoughtSearchResults>
                                    ) : null}
                                  </>
                                ) : null}
                                <ChainOfThoughtStep
                                  icon={Dot}
                                  label="Extracting relevant results..."
                                  status="pending"
                                />
                                <ChainOfThoughtStep
                                  icon={Dot}
                                  label="Preparing context for AI..."
                                  status="pending"
                                />
                              </div>
                            </ChainOfThoughtContent>
                          </ChainOfThought>
                        ) : streamingContent ? (
                          <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-white [&_*]:!text-white">
                            {streamingContent}
                          </div>
                        ) : (
                          <ChainOfThought defaultOpen className="bg-[#1a1a1a] border border-[#2a2a2a]">
                            <ChainOfThoughtHeader>Thinking Process</ChainOfThoughtHeader>
                            <ChainOfThoughtContent>
                              <div className="space-y-1.5">
                                <ChainOfThoughtStep
                                  icon={CheckCircle2}
                                  label="Understanding your question"
                                  status="complete"
                                />
                                <ChainOfThoughtStep
                                  icon={Loader2}
                                  label="Generating response"
                                  status="active"
                                  className="animate-pulse"
                                />
                                <ChainOfThoughtStep
                                  icon={Dot}
                                  label="Formatting answer"
                                  status="pending"
                                />
                              </div>
                            </ChainOfThoughtContent>
                          </ChainOfThought>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input Area - Centered at Bottom */}
          <div className="fixed bottom-0 left-0 right-0 z-50 p-6 pointer-events-auto">
            <div className="max-w-4xl mx-auto">
              <PromptInputBox
                onSend={(message, files) => {
                  let cleanedMessage = message;
                  let enableSearch = false;
                  let enableCanvas = false;

                  if (cleanedMessage.startsWith("[Search: ")) {
                    cleanedMessage = cleanedMessage.replace("[Search: ", "").replace(/\]$/, "");
                    enableSearch = true;
                  } else if (cleanedMessage.startsWith("[Canvas: ")) {
                    cleanedMessage = cleanedMessage.replace("[Canvas: ", "").replace(/\]$/, "");
                    enableCanvas = true;
                  } else if (cleanedMessage.startsWith("[Think: ")) {
                    cleanedMessage = cleanedMessage.replace("[Think: ", "").replace(/\]$/, "");
                    // You might want to handle 'Think' mode here or pass it along
                  }

                  handleSend(cleanedMessage, files, enableSearch, enableCanvas);
                }}
                placeholder="Message Cryonex..."
                isLoading={isStreaming || isSearching}
              />
            </div>
          </div>
        </main>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setHistoryOpen(true)}
        className="fixed left-3 top-3 z-40 h-9 w-9 rounded-full border border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/40 hover:bg-accent"
        aria-label="Open conversation history"
      >
        <History className="h-5 w-5" />
      </Button>

      <ModelBrowser open={showModelBrowser} onOpenChange={setShowModelBrowser} />
      
      <Dialog open={showPerformanceDialog} onOpenChange={setShowPerformanceDialog}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a]">
          <DialogHeader>
            <DialogTitle>Performance Mode</DialogTitle>
            <DialogDescription>
              Toggle between performance mode and enhanced visuals.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4">
            <Button 
              onClick={() => handlePerformanceModeSelect(true)}
              className={`flex-1 rounded-lg border px-4 py-3 ${
                performanceMode 
                  ? "bg-green-500/20 border-green-500/50 text-green-400" 
                  : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700/70"
              }`}
            >
              Performance Mode
            </Button>
            <Button 
              onClick={() => handlePerformanceModeSelect(false)}
              className={`flex-1 rounded-lg border px-4 py-3 ${
                !performanceMode 
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-400" 
                  : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700/70"
              }`}
            >
              Enhanced Visuals
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">App Settings</DialogTitle>
            <DialogDescription className="text-white/70">
              Customize your Cryonex experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="performance" className="text-white font-medium">
                  Performance Mode
                </Label>
                <p className="text-xs text-white/60">
                  Reduce animations for better performance
                </p>
              </div>
              <Switch
                id="performance"
                checked={performanceMode}
                onCheckedChange={(checked) => {
                  setPerformanceMode(checked);
                  toast.success(checked ? "Performance mode enabled" : "Enhanced visuals enabled");
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autosave" className="text-white font-medium">
                  Auto-save Chats
                </Label>
                <p className="text-xs text-white/60">
                  Automatically save your conversations
                </p>
              </div>
              <Switch
                id="autosave"
                checked={autoSaveEnabled}
                onCheckedChange={(checked) => {
                  setAutoSaveEnabled(checked);
                  toast.success(checked ? "Auto-save enabled" : "Auto-save disabled");
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-white font-medium">
                  Notifications
                </Label>
                <p className="text-xs text-white/60">
                  Show toast notifications for actions
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={(checked) => {
                  setNotificationsEnabled(checked);
                  toast.success(checked ? "Notifications enabled" : "Notifications disabled");
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound" className="text-white font-medium">
                  Sound Effects
                </Label>
                <p className="text-xs text-white/60">
                  Play sounds for message responses
                </p>
              </div>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={(checked) => {
                  setSoundEnabled(checked);
                  toast.success(checked ? "Sound effects enabled" : "Sound effects disabled");
                }}
              />
            </div>

            <div className="pt-4 border-t border-white/10">
              <Button
                onClick={() => {
                  localStorage.clear();
                  toast.success("Cache cleared successfully");
                }}
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 border-white/20 text-white"
              >
                Clear Cache
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}