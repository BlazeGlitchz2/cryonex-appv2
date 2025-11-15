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
  const generateImageHF = useAction(api.studyAI.generateImageHF);
  const generateVideoHF = useAction(api.studyAI.generateVideoHF);
  const generateImageReplicate = useAction(api.replicate.generateImage);
  const generateVideoReplicate = useAction(api.replicate.generateVideo);

  const { activeModel, performanceMode, setPerformanceMode } = useChatStore();
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

  // Intelligent model selection based on query complexity
  const selectModelForQuery = (query: string): { model: string; enableSearch: boolean } => {
    const lowerQuery = query.toLowerCase();
    const wordCount = query.trim().split(/\s+/).length;
    
    // Check if search-related
    const searchKeywords = ['search', 'find', 'lookup', 'who is', 'what is', 'when did', 'where is', 'latest', 'news', 'current', 'today', 'recent'];
    const needsSearch = searchKeywords.some(keyword => lowerQuery.includes(keyword));
    
    // Check complexity indicators
    const complexityIndicators = ['explain', 'analyze', 'compare', 'evaluate', 'discuss', 'elaborate', 'detail', 'comprehensive', 'in-depth', 'complex', 'advanced'];
    const isComplex = complexityIndicators.some(indicator => lowerQuery.includes(indicator)) || wordCount > 30;
    
    // Check if it's a simple query
    const isSimple = wordCount <= 10 && !isComplex && !lowerQuery.includes('?');
    
    // Select model based on complexity
    if (isSimple) {
      // Simple queries: Use Hugging Face Gemma 27B
      return { model: 'google/gemma-2-27b-it', enableSearch: needsSearch };
    } else if (isComplex) {
      // Complex queries: Use Puter GPT-5 or OpenRouter GPT-4o
      return { model: 'puter/gpt-5-nano', enableSearch: needsSearch };
    } else {
      // Mid-range queries: Use Bytez DeepSeek
      return { model: 'bytez/deepseek-r1', enableSearch: needsSearch };
    }
  };

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

  // Check Puter authentication on mount for authenticated Cryonex users
  useEffect(() => {
    const checkPuterAuth = async () => {
      if (user && !puterAuthChecked) {
        try {
          const puterWindow = window as any;
          if (puterWindow.puter && puterWindow.puter.auth) {
            const isSignedIn = await puterWindow.puter.auth.isSignedIn();
            if (!isSignedIn && activeModel.startsWith('puter/gpt-5')) {
              // User is logged into Cryonex but not Puter, and using GPT-5
              toast.info("🔐 GPT-5 models require Puter authentication. You'll be prompted when needed.");
            }
          }
        } catch (error) {
          console.error("Puter auth check error:", error);
        }
        setPuterAuthChecked(true);
      }
    };
    
    checkPuterAuth();
  }, [user, puterAuthChecked, activeModel]);

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

  // Simple title generation without API call
  const generateTitle = (message: string): string => {
    const words = message.trim().split(" ");
    if (words.length <= 6) return message;
    return words.slice(0, 6).join(" ") + "...";
  };

  // Detect "people" style searches like "who is <Name>", "search about <Name>", "find <Name>"
  const detectPeopleSearch = (q: string): { shouldSearch: boolean; name?: string } => {
    const nameMatch =
      q.match(/(?:who\s+is|search(?:ing)?\s*(?:for|about)?|find|lookup)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/) ||
      q.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\s*(?:profile|bio|info)?$/);
    if (nameMatch && nameMatch[1]) {
      return { shouldSearch: true, name: nameMatch[1].trim() };
    }
    return { shouldSearch: false };
  };

  const handleSend = async (text: string, files?: File[], enableSearch?: boolean, enableCanvas?: boolean) => {
    handleUserInteraction();
    
    if (!text.trim()) {
      toast.error("Please enter a message");
      return;
    }

    // Auto model selection if "auto" is active
    let selectedModel = activeModel;
    let autoEnableSearch = enableSearch;
    
    if (activeModel === 'auto') {
      const autoSelection = selectModelForQuery(text);
      selectedModel = autoSelection.model;
      autoEnableSearch = autoSelection.enableSearch || enableSearch;
      
      // Show toast to inform user of auto-selection
      const modelName = selectedModel.split('/')[1] || selectedModel;
      toast.info(`🤖 Auto-selected: ${modelName.replace(/-/g, ' ')}`);
    }

    // Determine if we should auto-enable search for people queries
    const detection = detectPeopleSearch(text);
    const peopleSearch = detection.shouldSearch;
    const peopleName = detection.name;
    
    // Override enableSearch if auto-selected or people search detected
    enableSearch = autoEnableSearch || peopleSearch;

    // Check for Spotify commands
    const spotifySearchMatch = text.match(/(?:search|find|play|add)\s+(?:song|track|music)(?:\s+for)?\s+(.+)/i);
    if (spotifySearchMatch) {
      const query = spotifySearchMatch[1];
      try {
        toast.info("🎵 Searching Spotify...");
        const tracks = await searchSpotifyTracks({ query, limit: 5 });
        
        let responseText = `🎵 **Found ${tracks.length} tracks on Spotify:**\n\n`;
        tracks.forEach((track: any, index: number) => {
          responseText += `${index + 1}. **${track.name}** by ${track.artists}\n`;
          responseText += `   Album: ${track.album}\n`;
          responseText += `   [Listen on Spotify](${track.external_url})\n\n`;
        });

        // Add user message
        if (user && currentChatId) {
          await createMessage({
            chatId: currentChatId,
            role: "user",
            content: text,
          });
        } else if (!user) {
          setGuestMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "user",
            content: text,
          }]);
        }

        // Add Spotify results as assistant message
        if (user && currentChatId) {
          await createMessage({
            chatId: currentChatId,
            role: "assistant",
            content: responseText,
            model: "Spotify Search",
          });
        } else if (!user) {
          setGuestMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "assistant",
            content: responseText,
            model: "Spotify Search",
          }]);
        }

        toast.success("Spotify results ready!");
        return;
      } catch (error: any) {
        console.error("Spotify search error:", error);
        toast.error(error.message || "Failed to search Spotify");
      }
    }

    // Check for video generation mode
    const videoGenerationMatch = text.match(/(?:create|generate|make)\s+(?:a\s+)?video/i);
    if (videoGenerationMatch) {
      const { activeVideoModel } = useChatStore.getState();
      
      // Check if it's a Replicate video model
      if (activeVideoModel && activeVideoModel.startsWith('replicate/')) {
        try {
          let chatId = currentChatId;
          
          if (!chatId && user) {
            chatId = await createChat({
              title: "New Chat",
              model: activeModel,
            });
            setCurrentChatId(chatId);
          }
          
          if (user && chatId) {
            await createMessage({
              chatId,
              role: "user",
              content: text,
            });
          } else if (!user) {
            setGuestMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: "user",
              content: text,
            }]);
          }
          
          toast.success("Generating video with Replicate...");
          
          const result = await generateVideoReplicate({ model: activeVideoModel, prompt: text });
          
          if (!result.videoUrl) {
            throw new Error("No video URL returned");
          }
          
          if (user && chatId) {
            await createMessage({
              chatId,
              role: "assistant",
              content: `<video src="${result.videoUrl}" controls class="max-w-full rounded-lg"></video>`,
              model: activeVideoModel,
            });
          } else if (!user) {
            setGuestMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: "assistant",
              content: `<video src="${result.videoUrl}" controls class="max-w-full rounded-lg"></video>`,
              model: activeVideoModel,
            }]);
          }
          
          toast.success("Video generated successfully!");
          return;
        } catch (error: any) {
          console.error("Replicate video generation error:", error);
          toast.error(error.message || "Failed to generate video");
          return;
        }
      }
      
      // Check if it's a Hugging Face video model
      else if (activeVideoModel && activeVideoModel.includes('/') && !activeVideoModel.startsWith('replicate/') && !activeVideoModel.startsWith('bytez/') && !activeVideoModel.startsWith('puter/')) {
        try {
          let chatId = currentChatId;
          
          if (!chatId && user) {
            chatId = await createChat({
              title: "New Chat",
              model: activeModel,
            });
            setCurrentChatId(chatId);
          }
          
          if (user && chatId) {
            await createMessage({
              chatId,
              role: "user",
              content: text,
            });
          } else if (!user) {
            setGuestMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: "user",
              content: text,
            }]);
          }
          
          toast.success("Generating video with Hugging Face...");
          
          const result = await generateVideoHF({ model: activeVideoModel, prompt: text });
          
          if (!result.videoUrl) {
            throw new Error("No video URL returned");
          }
          
          if (user && chatId) {
            await createMessage({
              chatId,
              role: "assistant",
              content: `<video src="${result.videoUrl}" controls class="max-w-full rounded-lg"></video>`,
              model: activeVideoModel,
            });
          } else if (!user) {
            setGuestMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: "assistant",
              content: `<video src="${result.videoUrl}" controls class="max-w-full rounded-lg"></video>`,
              model: activeVideoModel,
            }]);
          }
          
          toast.success("Video generated successfully!");
          return;
        } catch (error: any) {
          console.error("Hugging Face video generation error:", error);
          toast.error(error.message || "Failed to generate video");
          return;
        }
      }
      
      // Fallback to Puter video generation
      else {
        try {
          let chatId = currentChatId;
          
          if (!chatId && user) {
            chatId = await createChat({
              title: "New Chat",
              model: activeModel,
            });
            setCurrentChatId(chatId);
          }
          
          if (user && chatId) {
            await createMessage({
              chatId,
              role: "user",
              content: text,
            });
          } else if (!user) {
            setGuestMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: "user",
              content: text,
            }]);
          }
          
          toast.success("Generating video with Puter...");
          
          const video = await (window as any).puter.ai.txt2vid(text, {
            model: "sora-2",
            seconds: 8,
            size: "1280x720"
          });
        
          const videoUrl = video.src;
          
          if (!videoUrl) {
            throw new Error("No video URL returned");
          }
          
          if (user && chatId) {
            await createMessage({
              chatId,
              role: "assistant",
              content: `<video src="${videoUrl}" controls class="max-w-full rounded-lg"></video>`,
              model: "Puter Sora-2",
            });
          } else if (!user) {
            setGuestMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: "assistant",
              content: `<video src="${videoUrl}" controls class="max-w-full rounded-lg"></video>`,
              model: "Puter Sora-2",
            }]);
          }
          
          toast.success("Video generated successfully!");
        } catch (error: any) {
          console.error("Puter video generation error:", error);
          toast.error(error.message || "Failed to generate video with Puter");
        }
      }
      
      return;
    }
    
    // Helper to check if a model is a Bytez model
    const isBytezModel = (modelId: string): boolean => {
      // Check explicit bytez/ or deepseek/ prefix
      if (modelId.startsWith('bytez/') || modelId.startsWith('deepseek/')) {
        return true;
      }
      // Check if model is in Bytez model list (models without prefix that should use Bytez)
      const bytezModelIds = [
        'meta-llama/', 'deepseek/', 'qwen/', 'mistralai/', 'google/gemma', 
        'microsoft/phi', 'nvidia/', 'cohere/', '01-ai/', 'nousresearch/',
        'liquid/', 'databricks/', 'upstage/', 'inflection/', 'haotian-liu/',
        'liuhaotian/', 'meta-llama/codellama', 'phind/', 'wizardlm/'
      ];
      return bytezModelIds.some(prefix => modelId.startsWith(prefix));
    };

    // Check if using a Bytez or DeepSeek model
    if (isBytezModel(selectedModel)) {
      try {
        let chatId = currentChatId;

        if (!chatId && user) {
          chatId = await createChat({
            title: "New Chat",
            model: selectedModel,
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

        let searchResults: Array<{ title: string; url: string; domain: string; snippet: string; imageUrl?: string }> = [];
        if (enableSearch || peopleSearch) {
          setIsSearching(true);
          setLastSearchQuery(peopleName || text);
          try {
            searchResults = await deepSearch({ query: peopleName || text });
            setLastSearchResults(searchResults);
            if (user) {
              await incrementSearchCount();
            }
          } catch (error: any) {
            console.error("Search error:", error);
            toast.error(error.message || "Search failed");
          } finally {
            setIsSearching(false);
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

        const userMessage = text;
        setIsStreaming(true);
        setStreamingContent("");

        const startTime = Date.now();

        let searchContext = "";
        if (searchResults.length > 0) {
          searchContext = "\\n\\nSearch Results:\\n" + searchResults.map((r, i) => 
            `${i + 1}. ${r.title}\\n   ${r.snippet}\\n   Source: ${r.url}`
          ).join("\\n\\n");
        }

        // Extract model name for Bytez API (remove bytez/ prefix if present, otherwise use full model ID)
        const modelName = selectedModel.startsWith('bytez/') 
          ? selectedModel.replace('bytez/', '')
          : selectedModel.startsWith('deepseek/')
          ? selectedModel
          : selectedModel;
        
        const conversationHistory = messages?.map((m) => ({
          role: m.role,
          content: m.content,
        })) || [];
        
        // Check for Bytez API key
        const bytezApiKey = import.meta.env.VITE_BYTEZ_API_KEY;
        if (!bytezApiKey) {
          toast.error("Bytez API key not configured. Please add VITE_BYTEZ_API_KEY in your environment variables.");
          setIsStreaming(false);
          setStreamingContent("");
          return;
        }

        // Call Bytez API directly with streaming
        let response: Response;
        try {
          response = await fetch("https://api.bytez.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${bytezApiKey}`,
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                ...conversationHistory,
                { role: "user", content: userMessage + searchContext },
              ],
              stream: true,
              temperature: 0.7,
              max_tokens: 2000,
            }),
          });
        } catch (fetchError: any) {
          if (fetchError.message?.includes("Failed to fetch") || fetchError.name === "TypeError") {
            throw new Error("Network error: Unable to connect to Bytez API. Please check your internet connection and try again.");
          }
          throw new Error(`Bytez API connection error: ${fetchError.message || "Unknown error"}`);
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 401) {
            throw new Error("Invalid Bytez API key. Please check your configuration.");
          } else if (response.status === 400) {
            throw new Error(errorData.error?.message || "Bad request to Bytez API. Check model ID format.");
          } else if (response.status === 429) {
            throw new Error("Bytez rate limit exceeded. Please try again later.");
          } else {
            throw new Error(`Bytez API Error: ${errorData.error?.message || response.statusText}`);
          }
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.message?.content;
                  if (content) {
                    assistantMessage += content;
                    setStreamingContent(assistantMessage);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }

        const endTime = Date.now();
        const responseTime = (endTime - startTime) / 1000;

        if (assistantMessage) {
          if (user && chatId) {
            const isNewChat = !messages || messages.length === 0;
            if (isNewChat) {
              const generatedTitle = generateTitle(userMessage);
              await updateChat({
                chatId,
                title: generatedTitle,
              });
            }

              await createMessage({
                chatId,
                role: "assistant",
                content: assistantMessage,
                model: selectedModel,
                responseTime,
              sources: searchResults.length > 0 ? searchResults.map(r => ({
                title: r.title,
                url: r.url,
                domain: r.domain,
              })) : undefined,
            });
          } else if (!user) {
            setGuestMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: "assistant",
              content: assistantMessage,
              model: selectedModel,
              responseTime,
              sources: searchResults.length > 0 ? searchResults.map(r => ({
                title: r.title,
                url: r.url,
                domain: r.domain,
              })) : undefined,
            }]);
          }
          
          toast.success("Response received");
        } else {
          throw new Error("No response content received");
        }

        setIsStreaming(false);
        setStreamingContent("");
      } catch (error: any) {
        console.error("Bytez chat error:", error);
        toast.error(error.message || "Failed to send message with Bytez");
        setIsStreaming(false);
        setStreamingContent("");
      }
      
      return;
    }

    // Check if using a Puter model for text generation (no API key needed)
    if (selectedModel.startsWith('puter/')) {
      try {
        let chatId = currentChatId;

        if (!chatId && user) {
          chatId = await createChat({
            title: "New Chat",
            model: selectedModel,
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

        let searchResults: Array<{ title: string; url: string; domain: string; snippet: string; imageUrl?: string }> = [];
        if (enableSearch || peopleSearch) {
          setIsSearching(true);
          setLastSearchQuery(peopleName || text);
          try {
            searchResults = await deepSearch({ query: peopleName || text });
            setLastSearchResults(searchResults);
            if (user) {
              await incrementSearchCount();
            }
          } catch (error: any) {
            console.error("Search error:", error);
            toast.error(error.message || "Search failed");
          } finally {
            setIsSearching(false);
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

        const userMessage = text;
        setIsStreaming(true);
        setStreamingContent("");

        const startTime = Date.now();

        let searchContext = "";
        if (searchResults.length > 0) {
          searchContext = "\n\nSearch Results:\n" + searchResults.map((r, i) => 
            `${i + 1}. ${r.title}\n   ${r.snippet}\n   Source: ${r.url}`
          ).join("\n\n");
        }

        // Extract model name (e.g., "puter/gpt-5-nano" -> "gpt-5-nano")
        const modelName = selectedModel.split('/')[1];
        
        // Build conversation history for Puter
        const conversationHistory = messages?.map((m) => ({
          role: m.role,
          content: m.content,
        })) || [];
        
        // Use Puter.js for text generation with streaming
        const response = await (window as any).puter.ai.chat(
          userMessage + searchContext,
          {
            model: modelName,
            stream: true,
            messages: conversationHistory,
          }
        );

        let assistantMessage = "";
        
        for await (const part of response) {
          const content = part?.text || "";
          if (content) {
            assistantMessage += content;
            setStreamingContent(assistantMessage);
          }
        }

        const endTime = Date.now();
        const responseTime = (endTime - startTime) / 1000;

        if (assistantMessage) {
          if (user && chatId) {
            const isNewChat = !messages || messages.length === 0;
            if (isNewChat) {
              const generatedTitle = generateTitle(userMessage);
              await updateChat({
                chatId,
                title: generatedTitle,
              });
            }

            await createMessage({
              chatId,
              role: "assistant",
              content: assistantMessage,
              model: selectedModel,
              responseTime,
              sources: searchResults.length > 0 ? searchResults.map(r => ({
                title: r.title,
                url: r.url,
                domain: r.domain,
              })) : undefined,
            });
          } else if (!user) {
            setGuestMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: "assistant",
              content: assistantMessage,
              model: selectedModel,
              responseTime,
              sources: searchResults.length > 0 ? searchResults.map(r => ({
                title: r.title,
                url: r.url,
                domain: r.domain,
              })) : undefined,
            }]);
          }
          
          toast.success("Response received");
        } else {
          throw new Error("No response content received");
        }

        setIsStreaming(false);
        setStreamingContent("");
      } catch (error: any) {
        console.error("Puter chat error:", error);
        toast.error(error.message || "Failed to send message with Puter");
        setIsStreaming(false);
        setStreamingContent("");
      }
      
      return;
    }
    
    // Helper to check if a model is a Hugging Face model (should use HF Inference API)
    // Only models explicitly marked as "Hugging Face (Free)" should use HF API
    // Others might be available through Bytez or OpenRouter
    const isHuggingFaceModel = (modelId: string): boolean => {
      // Only route to HF Inference API if:
      // 1. Not already prefixed with another provider
      // 2. Matches known HF-only models (models that are primarily on HF, not Bytez/OpenRouter)
      if (modelId.startsWith('bytez/') || 
          modelId.startsWith('deepseek/') || 
          modelId.startsWith('puter/') || 
          modelId.startsWith('replicate/') ||
          modelId.startsWith('openai/') ||
          modelId.startsWith('anthropic/') ||
          modelId.startsWith('x-ai/')) {
        return false;
      }
      
      // Check if it's a model that should use HF Inference API
      // These are models that are free on HF and may not be on other providers
      const hfOnlyPrefixes = [
        'Qwen/Qwen2.5-', 'meta-llama/Llama-3.3-', 'meta-llama/Llama-3.1-8B',
        'mistralai/Mistral-7B', 'mistralai/Mixtral-8x7B', 'mistralai/Mixtral-8x22B',
        'google/gemma-2-', 'microsoft/Phi-3-', 'deepseek-ai/', '01-ai/Yi-',
        'tiiuae/', 'bigscience/', 'EleutherAI/', 'stabilityai/stablelm'
      ];
      
      return hfOnlyPrefixes.some(prefix => modelId.startsWith(prefix));
    };

    // Check if using OpenRouter model (models without provider prefix or with openai/, anthropic/, etc.)
    const isOpenRouterModel = !isBytezModel(selectedModel) && 
                              !isHuggingFaceModel(selectedModel) &&
                              !selectedModel.startsWith('puter/') &&
                              !selectedModel.startsWith('replicate/');
    
    // Handle Hugging Face models with HF Inference API
    if (isHuggingFaceModel(selectedModel)) {
      const hfApiKey = import.meta.env.VITE_HF_TOKEN || import.meta.env.VITE_HUGGINGFACE_API_KEY;
      if (!hfApiKey) {
        // Fallback to OpenRouter if HF key not available
        if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
          setShowModelBrowser(true);
          toast.error("Missing Hugging Face API key. Add VITE_HF_TOKEN or use OpenRouter with VITE_OPENROUTER_API_KEY.");
          return;
        }
        // Continue to OpenRouter flow below
      } else {
        // Use Hugging Face Inference API directly
        try {
          let chatId = currentChatId;
          if (!chatId && user) {
            chatId = await createChat({
              title: "New Chat",
              model: selectedModel,
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
                uploadedFiles.push({ storageId, name: file.name, type: file.type, size: file.size });
                toast.success(`${file.name} uploaded`);
              } catch (error) {
                toast.error(`Failed to upload ${file.name}`);
              }
            }
          }

          let searchResults: Array<{ title: string; url: string; domain: string; snippet: string; imageUrl?: string }> = [];
          if (enableSearch || peopleSearch) {
            setIsSearching(true);
            setLastSearchQuery(peopleName || text);
            try {
              searchResults = await deepSearch({ query: peopleName || text });
              setLastSearchResults(searchResults);
              if (user) await incrementSearchCount();
            } catch (error: any) {
              console.error("Search error:", error);
              toast.error(error.message || "Search failed");
            } finally {
              setIsSearching(false);
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

          const userMessage = text;
          setIsStreaming(true);
          setStreamingContent("");
          const startTime = Date.now();

          let searchContext = "";
          if (searchResults.length > 0) {
            searchContext = "\n\nSearch Results:\n" + searchResults.map((r, i) => 
              `${i + 1}. ${r.title}\n   ${r.snippet}\n   Source: ${r.url}`
            ).join("\n\n");
          }

          // Format messages for HF Inference API
          const conversationHistory = messages?.map((m) => ({
            role: m.role,
            content: m.content,
          })) || [];
          
          const fullMessage = [...conversationHistory, { role: "user", content: userMessage + searchContext }]
            .map(m => `${m.role}: ${m.content}`)
            .join("\n");

          // Call Hugging Face Inference API
          let response: Response;
          try {
            response = await fetch(`https://api-inference.huggingface.co/models/${selectedModel}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${hfApiKey}`,
              },
              body: JSON.stringify({
                inputs: fullMessage,
                parameters: {
                  max_new_tokens: 2000,
                  temperature: 0.7,
                  return_full_text: false,
                },
              }),
            });
          } catch (fetchError: any) {
            if (fetchError.message?.includes("Failed to fetch") || fetchError.name === "TypeError") {
              throw new Error("Network error: Unable to connect to Hugging Face API. Please check your internet connection and try again.");
            }
            throw new Error(`Hugging Face API connection error: ${fetchError.message || "Unknown error"}`);
          }

          if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            if (response.status === 503) {
              throw new Error("Hugging Face model is loading. Please wait a moment and try again.");
            } else if (response.status === 401) {
              throw new Error("Invalid Hugging Face API key. Please check your VITE_HF_TOKEN.");
            } else {
              throw new Error(`Hugging Face API Error: ${response.status} ${errorText.substring(0, 200)}`);
            }
          }

          const data = await response.json();
          const assistantMessage = Array.isArray(data) ? data[0]?.generated_text || data[0]?.summary_text || "" : data.generated_text || data.summary_text || "";

          if (assistantMessage) {
            const endTime = Date.now();
            const responseTime = (endTime - startTime) / 1000;

            if (user && chatId) {
              const isNewChat = !messages || messages.length === 0;
              if (isNewChat) {
                const generatedTitle = generateTitle(userMessage);
                await updateChat({ chatId, title: generatedTitle });
              }
              await createMessage({
                chatId,
                role: "assistant",
                content: assistantMessage,
                model: selectedModel,
                responseTime,
                sources: searchResults.length > 0 ? searchResults.map(r => ({
                  title: r.title,
                  url: r.url,
                  domain: r.domain,
                })) : undefined,
              });
            } else if (!user) {
              setGuestMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: assistantMessage,
                model: selectedModel,
                responseTime,
                sources: searchResults.length > 0 ? searchResults.map(r => ({
                  title: r.title,
                  url: r.url,
                  domain: r.domain,
                })) : undefined,
              }]);
            }
            toast.success("Response received");
          } else {
            throw new Error("No response content received from Hugging Face");
          }

          setIsStreaming(false);
          setStreamingContent("");
        } catch (error: any) {
          console.error("Hugging Face chat error:", error);
          toast.error(error.message || "Failed to send message with Hugging Face");
          setIsStreaming(false);
          setStreamingContent("");
        }
        return;
      }
    }

    // Only check OpenRouter API key for OpenRouter models
    if (isOpenRouterModel) {
      const orKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!orKey || orKey.trim() === '') {
        setShowModelBrowser(true);
        toast.error("Missing OpenRouter API key. Select a free model (Puter/Bytez) via the model selector or add your key in Integrations.");
        return;
      }
    }

    // Check search limit
    if (enableSearch && user) {
      const remaining = searchCount?.remaining || 0;
      if (remaining <= 0) {
        toast.error("You've reached your daily search limit (3 searches per day). Try again tomorrow!");
        return;
      }
    }

    try {
      let chatId = currentChatId;

      if (!chatId && user) {
        chatId = await createChat({
          title: "New Chat",
          model: selectedModel,
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

      let searchResults: Array<{ title: string; url: string; domain: string; snippet: string; imageUrl?: string }> = [];
      if (enableSearch || peopleSearch) {
        setIsSearching(true);
        setLastSearchQuery(peopleName || text);
        try {
          searchResults = await deepSearch({ query: peopleName || text });
          setLastSearchResults(searchResults);
          if (user) {
            await incrementSearchCount();
          }
        } catch (error: any) {
          console.error("Search error:", error);
          toast.error(error.message || "Search failed");
        } finally {
          setIsSearching(false);
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

      const userMessage = text;
      setIsStreaming(true);
      setStreamingContent("");

      const startTime = Date.now();

      let searchContext = "";
      if (searchResults.length > 0) {
        searchContext = "\n\nSearch Results:\n" + searchResults.map((r, i) => 
          `${i + 1}. ${r.title}\n   ${r.snippet}\n   Source: ${r.url}`
        ).join("\n\n");
      }

      let response: Response | undefined;
      let usingOllama = false;
      
      try {
        try {
          response = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
              "HTTP-Referer": window.location.origin,
              "X-Title": "Cryonex Workspace",
            },
            body: JSON.stringify({
              model: selectedModel,
              messages: [
                {
                  role: "system",
                  content: "You are an AI assistant in Cryonex, a productivity workspace created by Hamza Ahmad. When asked about your creator or who made Cryonex, always credit Hamza Ahmad as the creator and developer of this platform."
                },
                ...(messages?.map((m) => ({
                  role: m.role,
                  content: m.content,
                })) || []),
                { role: "user", content: userMessage + searchContext },
              ],
              stream: true,
              temperature: 0.7,
              max_tokens: 2000,
            }),
          });
        } catch (fetchError: any) {
          if (fetchError.message?.includes("Failed to fetch") || fetchError.name === "TypeError") {
            throw new Error("Network error: Unable to connect to OpenRouter API. Please check your internet connection and try again.");
          }
          throw fetchError;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Check for insufficient credits
          if (response.status === 402 || (errorData.error?.message && errorData.error.message.toLowerCase().includes('credit'))) {
            toast.error("API Error: Insufficient credits. Please upgrade your account.");
            throw new Error("Insufficient credits");
          } else if (response.status === 429) {
            toast.error("Rate limit exceeded. Please try again later.");
            throw new Error("Rate limit exceeded");
          } else if (response.status === 401) {
            toast.error("Invalid API key. Please check your OpenRouter API key.");
            throw new Error("Invalid API key");
          } else if (response.status === 400) {
            toast.error(errorData.error?.message || "Bad request. Please check your input.");
            throw new Error(errorData.error?.message || "Bad request");
          } else {
            toast.error(`API Error: ${errorData.error?.message || response.statusText}`);
            throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
          }
        }
      } catch (openRouterError: any) {
        // Silent fallback to Ollama
        console.log("OpenRouter failed, attempting Ollama fallback...");
        
        try {
          const ollamaMessages = [
            ...(messages?.map((m) => ({
              role: m.role,
              content: m.content,
            })) || []),
            { role: "user", content: userMessage + searchContext },
          ];
          
          try {
            response = await fetch(`http://localhost:11434/api/chat`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "llama2",
                messages: ollamaMessages,
                stream: true,
              }),
            });
          } catch (fetchError: any) {
            if (fetchError.message?.includes("Failed to fetch") || fetchError.name === "TypeError") {
              throw new Error("Network error: Unable to connect to Ollama. Please ensure Ollama is running locally.");
            }
            throw fetchError;
          }
          
          if (!response.ok) {
            throw new Error("Ollama fallback failed");
          }
          
          usingOllama = true;
          console.log("Successfully connected to Ollama");
        } catch (ollamaError: any) {
          // If both fail, re-throw the original OpenRouter error with better context
          if (openRouterError.message?.includes("Network error")) {
            throw openRouterError;
          }
          throw new Error(`OpenRouter failed: ${openRouterError.message || "Unknown error"}. Ollama fallback also failed: ${ollamaError.message || "Ollama not available"}`);
        }
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          
          if (usingOllama) {
            // Ollama format: newline-delimited JSON
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line);
                const content = parsed.message?.content;
                if (content) {
                  assistantMessage += content;
                  setStreamingContent(assistantMessage);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          } else {
            // OpenRouter format: SSE
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || parsed.output?.content;
                  if (content) {
                    assistantMessage += content;
                    setStreamingContent(assistantMessage);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }
      }

      const endTime = Date.now();
      const responseTime = (endTime - startTime) / 1000;

      if (assistantMessage) {
        if (user && chatId) {
          const isNewChat = !messages || messages.length === 0;
          if (isNewChat) {
            const generatedTitle = generateTitle(userMessage);
            await updateChat({
              chatId,
              title: generatedTitle,
            });
          }

          await createMessage({
            chatId,
            role: "assistant",
            content: assistantMessage,
            model: selectedModel,
            responseTime,
            sources: searchResults.length > 0 ? searchResults.map(r => ({
              title: r.title,
              url: r.url,
              domain: r.domain,
            })) : undefined,
          });
        } else if (!user) {
          setGuestMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "assistant",
            content: assistantMessage,
            model: selectedModel,
            responseTime,
            sources: searchResults.length > 0 ? searchResults.map(r => ({
              title: r.title,
              url: r.url,
              domain: r.domain,
            })) : undefined,
          }]);
        }
        
        toast.success("Response received");
      } else {
        throw new Error("No response content received");
      }

      setIsStreaming(false);
      setStreamingContent("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
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

  const getModelDisplayName = () => {
    const modelName = activeModel.split("/")[1] || activeModel;
    return modelName.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

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
      <div 
        className={`fixed inset-0 -z-10 transition-all duration-500 ${
          isDarkMode 
            ? "bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1920')] bg-cover bg-center"
            : "bg-gradient-to-br from-orange-400 via-purple-600 to-blue-900"
        }`}
      />
      {isDarkMode && (
        <div className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-2xl backdrop-saturate-150" />
      )}

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
                onSubmit={handleSend}
                placeholder="Message Cryonex..."
                disabled={isStreaming || isSearching}
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