import { useChatStore } from "@/lib/stores/chat-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { getModelDisplayMeta } from "@/lib/utils/model-utils";
import { NeoMessage } from "@/components/chat/NeoMessage";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { NeoModelSelector } from "@/components/chat/NeoModelSelector";
// import NeoCosmicShader from "@/components/shaders/NeoCosmicShader";
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation, useAction } from "convex/react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Image,
  FileText,
  Code,
  Brain,
  Gamepad2
} from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useLocation, useNavigate, useParams } from "react-router";
import { WelcomePopup } from "@/components/WelcomePopup";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubwaySurfersOverlay } from "@/components/ui/subway-surfers";
import { EmojiRatingWrapper } from "@/components/EmojiRatingWrapper";
import { SourcePreviewProvider } from "@/components/ui/source-preview";

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSubwaySurfers, showSubwaySurfers } = useUIStore();

  // Use centralized chat store for state sync with sidebar
  const { currentChatId, setCurrentChatId } = useChatStore();
  const { chatId: urlChatId } = useParams();
  const typedChatId = (urlChatId || currentChatId) as Id<"chats"> | null;

  const [guestMessages, setGuestMessages] = useState<Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    model?: string;
    responseTime?: number;
    attachments?: Array<{ name: string; type: string; size: number }>;
    sources?: Array<{ title: string; url: string; domain: string; snippet?: string }>;
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

  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("project") as Id<"projects"> | null;
  const project = useQuery(api.projects.get, projectId ? { id: projectId } : "skip");

  // Lazy load queries only when needed
  const dbMessages = useQuery(
    api.messages.list,
    typedChatId && user ? { chatId: typedChatId } : "skip"
  );

  // Get current chat details to check for "New Chat" title
  const currentChat = useQuery(api.chats.get, typedChatId ? { chatId: typedChatId } : "skip");

  // Mutations & Actions
  const createChat = useMutation(api.chats.create);
  const renameChat = useMutation(api.chats.rename);
  const createMessage = useMutation(api.messages.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const sendMessage = useAction(api.chat.sendMessage);
  const generateTitle = useAction(api.titles.generateTitle);
  const createLibraryItem = useMutation(api.library.create);
  const createProject = useMutation(api.projects.create);

  const { activeModel, activeModelProvider } = useChatStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use guest messages for non-authenticated users, db messages + pending for authenticated
  const messages = user
    ? [...(dbMessages || []), ...pendingMessages]
    : guestMessages;

  // Sync store with URL and handle new chat logic
  useEffect(() => {
    if (urlChatId) {
      if (currentChatId !== urlChatId) {
        setCurrentChatId(urlChatId as Id<"chats">);
      }
    } else if (location.pathname === "/app") {
      // If we are on /app without a chatId, it means we want a new chat
      if (currentChatId) {
        setCurrentChatId(null);
      }
    }
  }, [urlChatId, location.pathname, currentChatId, setCurrentChatId]);

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
      if (!location.pathname.includes("/onboarding")) {
        navigate("/onboarding");
      }
    }
  }, [user, navigate, location.pathname]);

  const scrollViewport = useCallback(() => {
    return scrollRootRef.current;
  }, []);

  // Combine DB messages with pending messages
  useEffect(() => {
    if (dbMessages) {
      setPendingMessages([]);
    }
  }, [dbMessages]);

  // Track if user is near bottom for conditional auto-scroll
  const isNearBottomRef = useRef(true);
  const SCROLL_THRESHOLD = 100; // pixels from bottom to consider "near"

  // Update near-bottom status on scroll
  const handleScroll = useCallback(() => {
    const container = scrollRootRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      isNearBottomRef.current = distanceFromBottom < SCROLL_THRESHOLD;
    }
  }, []);

  // Conditional auto-scroll: only scroll if user is near bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming, streamingContent]);


  const handleSend = async (text: string, files?: File[]) => {
    if (!text.trim() && (!files || files.length === 0)) {
      toast.error("Please enter a message");
      return;
    }

    // Increment message count for Emoji Rating
    const currentCount = parseInt(localStorage.getItem("cryonex_msg_count") || "0");
    localStorage.setItem("cryonex_msg_count", (currentCount + 1).toString());
    window.dispatchEvent(new Event("cryonex-message-sent"));

    // OPTIMISTIC UPDATE
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

    let chatId = typedChatId;
    let isNewChat = false;

    // Case 1: No chat ID exists yet
    if (!chatId && user) {
      try {
        // Use truncated message as initial title for immediate feedback
        const initialTitle = text.slice(0, 30) + (text.length > 30 ? "..." : "");
        chatId = await createChat({
          title: initialTitle,
          model: activeModel,
          projectId: projectId || undefined
        });
        setCurrentChatId(chatId as string);
        navigate(`/app/chat/${chatId}`, { replace: true });
        isNewChat = true;
      } catch (error) {
        console.error("Failed to create chat:", error);
        toast.error("Failed to start new chat");
        setPendingMessages(prev => prev.filter(m => m.id !== tempId));
        return;
      }
    }
    // Case 2: Chat exists but has default "New Chat" title (e.g. created via Sidebar)
    else if (chatId && user && currentChat?.title === "New Chat") {
      isNewChat = true;
      try {
        const initialTitle = text.slice(0, 30) + (text.length > 30 ? "..." : "");
        await renameChat({ chatId, title: initialTitle });
      } catch (err) {
        console.error("Failed to rename chat:", err);
      }
    }

    const uploadedFiles: Array<{ storageId: Id<"_storage">; name: string; type: string; size: number }> = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type || "application/octet-stream" },
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
          console.error("Upload failed:", error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    }

    if (user && chatId) {
      try {
        await createMessage({
          chatId,
          role: "user",
          content: text,
          attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        });
        setPendingMessages(prev => prev.filter(m => m.id !== tempId));
      } catch (error) {
        console.error("Failed to save message:", error);
        toast.error("Failed to send message");
        setPendingMessages(prev => prev.filter(m => m.id !== tempId));
        return;
      }
    }

    setIsStreaming(true);
    setStreamingContent("");

    // Generate AI title for new chats immediately (don't wait for response)
    if (isNewChat && chatId) {
      generateTitle({ chatId, firstMessage: text }).catch(err =>
        console.error("Failed to generate title:", err)
      );
    }

    try {
      const modelId = activeModel;

      const history = messages?.map((m: any) => ({
        role: m.role,
        content: m.content
      })) || [];

      let systemInstruction = "";
      if (text.startsWith("[Think] ")) {
        systemInstruction = "You are in REASONING mode. You MUST output your internal thought process wrapped in <tool_call>...<tool_call> tags before your final response. The user wants to see how you think.";
      } else if (text.startsWith("[Search] ")) {
        systemInstruction = "You are in SEARCH mode. Please provide a comprehensive answer with sources if possible.";
      } else if (text.startsWith("[Canvas] ")) {
        systemInstruction = "You are in CANVAS mode. Focus on generating structured content, code, or designs.";
      }

      const currentMessages = [
        ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
        ...history,
        { role: "user", content: text }
      ];

      let assistantMessageId;
      if (user && chatId) {
        assistantMessageId = await createMessage({
          chatId,
          role: "assistant",
          content: "",
          model: modelId,
        });
      }

      const { content: responseContent, sources: responseSources } = await sendMessage({
        messages: currentMessages,
        model: modelId,
        messageId: assistantMessageId,
        chatId: chatId || undefined,
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      });

      if (!user) {
        setGuestMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: responseContent,
          model: modelId,
          sources: responseSources,
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

  const handleSaveMessage = (content: string) => {
    setContentToSave(content);
    const defaultTitle = content.split(" ").slice(0, 5).join(" ") + "...";
    setSaveTitle(defaultTitle);
    setSaveCategory("AI Chat");
    setSaveDialogOpen(true);
  };

  const executeSave = async () => {
    if (!saveTitle) {
      toast.error("Please enter a title");
      return;
    }

    try {
      if (saveType === "library") {
        await createLibraryItem({
          title: saveTitle,
          prompt: contentToSave,
          category: saveCategory,
        });
        toast.success("Saved to Library");
      } else {
        await createProject({
          name: saveTitle,
          description: contentToSave,
          color: "blue",
        });
        toast.success("Project created");
      }
      setSaveDialogOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save");
    }
  };

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [contentToSave, setContentToSave] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [saveCategory, setSaveCategory] = useState("");
  const [saveType, setSaveType] = useState<"library" | "project">("library");

  const showEmptyState = !messages || messages.length === 0;

  return (
    <SourcePreviewProvider>
      <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden bg-transparent">
        {/* New Visual Core */}
        {/* NeoCosmicShader handled in AppLayout */}

        <WelcomePopup />
        <SubwaySurfersOverlay />
        <EmojiRatingWrapper />

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 z-20 absolute top-0 right-0 left-0 pointer-events-none">
          <div />
          <div className="flex items-center gap-3 pointer-events-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSubwaySurfers}
              className={`text-xs font-medium transition-colors rounded-full px-3 border ${showSubwaySurfers ? 'bg-primary/10 text-primary border-primary/20' : 'text-white/50 hover:text-white hover:bg-white/5 border-transparent'}`}
            >
              <Gamepad2 className="h-4 w-4 mr-2" />
              {showSubwaySurfers ? "Focus Mode On" : "Bored?"}
            </Button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 relative z-10">
          <div
            className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar"
            ref={scrollRootRef}
            onScroll={handleScroll}
          >
            <div className="max-w-4xl mx-auto w-full px-4 md:px-0 pt-20 pb-48 min-h-full flex flex-col">
              {showEmptyState ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] py-10 animate-in fade-in duration-700">
                  {/* Main Greeting */}
                  <div className="space-y-6 flex flex-col items-center mb-10 relative z-10">
                    <div className="relative group cursor-pointer">
                      <div className="absolute inset-0 bg-cryonex-purple/30 blur-[50px] rounded-full group-hover:bg-cryonex-teal/30 transition-colors duration-700" />
                      <img
                        src="/logo.png"
                        alt="Cryonex Logo"
                        className="relative h-24 w-24 md:h-32 md:w-32 object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.3)] animate-in fade-in zoom-in duration-700 hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-center space-y-3 px-4">
                      <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight text-glow">
                        {project ? `Project: ${project.name}` : `Hi, ${user?.name?.split(" ")[0] || "Creator"}`}
                      </h2>
                      <p className="text-base sm:text-lg text-white/60 font-light max-w-md mx-auto">
                        {project ? "What would you like to work on?" : <>What shall we <span className="text-cryonex-teal font-medium">build</span> today?</>}
                      </p>
                    </div>
                  </div>

                  {/* Feature Cards Grid */}
                  <FeatureCards onSend={handleSend} />
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  {messages.map((message, idx) => {
                    const key = ("_id" in message ? message._id : message.id) as any;
                    const isUser = message.role === "user";
                    const isLastMessage = idx === messages.length - 1;
                    const isAssistantStreaming = !!(isStreaming && isLastMessage && message.role === "assistant" && user);

                    return (
                      <NeoMessage
                        key={key}
                        role={message.role as any}
                        content={message.content}
                        userImage={user?.image}
                        userName={user?.name}
                        timestamp={"_creationTime" in message ? message._creationTime : Date.now()}
                        isStreaming={isAssistantStreaming}
                        sources={(message as any).sources}
                      />
                    );
                  })}
                  {/* Only show separate streaming indicator for guests (logged-in users stream directly to DB message) */}
                  {isStreaming && !user && (
                    <NeoMessage
                      role="assistant"
                      content={streamingContent}
                      isStreaming={true}
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Floating Input Area */}
          <div className="absolute bottom-0 left-0 right-0 z-50 px-4 pb-8 pt-24 bg-gradient-to-t from-[#030005] via-[#030005]/80 to-transparent pointer-events-none">
            <div className="max-w-3xl mx-auto w-full pointer-events-auto">
              <PromptInputBox
                onSend={handleSend}
                isLoading={isStreaming}
                className="border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.24)]"
              />
              <p className="text-center text-[10px] text-white/30 mt-3 font-medium hidden sm:block">
                Cryonex can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>

        {/* Save Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent className="bg-[#0a0a0a] border-white/10 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Save Content</DialogTitle>
              <DialogDescription className="text-white/50">
                Save this message to your Library or create a new Project.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="library" onValueChange={(v) => setSaveType(v as any)} className="w-full mt-2">
              <TabsList className="grid w-full grid-cols-2 bg-white/5">
                <TabsTrigger value="library">Library Item</TabsTrigger>
                <TabsTrigger value="project">New Project</TabsTrigger>
              </TabsList>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    className="bg-white/5 border-white/10"
                    placeholder="Enter a title..."
                  />
                </div>

                <TabsContent value="library" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={saveCategory}
                      onChange={(e) => setSaveCategory(e.target.value)}
                      className="bg-white/5 border-white/10"
                      placeholder="e.g. Coding, Ideas..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="project" className="mt-0">
                  <p className="text-xs text-white/40">
                    This will create a new project with the message content as the description.
                  </p>
                </TabsContent>

                <div className="pt-2">
                  <Button onClick={executeSave} className="w-full bg-white text-black hover:bg-white/90">
                    {saveType === "library" ? "Save to Library" : "Create Project"}
                  </Button>
                </div>
              </div>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </SourcePreviewProvider>
  );
}

const FeatureCards = React.memo(({ onSend }: { onSend: (text: string) => void }) => {
  const features = [
    { icon: Image, label: "Generate Image", desc: "Visuals", gradient: "from-purple-500/20 to-fuchsia-500/20", border: "border-purple-500/20" },
    { icon: FileText, label: "Draft Text", desc: "Writing", gradient: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/20" },
    { icon: Code, label: "Write Code", desc: "Development", gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/20" },
    { icon: Brain, label: "Brainstorm", desc: "Ideas", gradient: "from-orange-500/20 to-amber-500/20", border: "border-orange-500/20" }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4">
      {features.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSend(`Help me ${item.label.toLowerCase()}`)}
          className={`group relative overflow-hidden rounded-2xl border ${item.border} bg-white/[0.02] hover:bg-white/[0.05] p-4 text-left transition-all hover:scale-[1.01] hover:shadow-lg active:scale-95 touch-manipulation`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} text-white`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-white group-hover:text-white transition-colors">{item.label}</h3>
              <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors">{item.desc}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
});