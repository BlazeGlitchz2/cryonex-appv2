import { useChatStore } from "@/lib/stores/chat-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { getModelDisplayMeta } from "@/lib/utils/model-utils";
import { NeoMessage } from "@/components/chat/NeoMessage";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation, useAction } from "convex/react";
import { useState, useRef, useEffect, useCallback } from "react";
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
import { IconAssistant, IconImage, IconFile, IconData, IconBrain, IconCryonex } from "@/components/ui/icons/Web3Icons";
import { Gamepad2, ArrowDown } from "lucide-react";
import { CreditIndicator } from "@/components/credits/CreditIndicator";
import { useSmartScroll } from "@/hooks/use-smart-scroll";
import MobileHome from "@/pages/MobileHome";
import { useIsMobile } from "@/hooks/use-mobile";

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSubwaySurfers, showSubwaySurfers } = useUIStore();
  const { currentChatId, setCurrentChatId, activeModel } = useChatStore();
  const { chatId: urlChatId } = useParams();
  const typedChatId = (urlChatId || currentChatId) as Id<"chats"> | null;
  const isMobile = useIsMobile();

  const [guestMessages, setGuestMessages] = useState<Array<any>>([]);
  const [pendingMessages, setPendingMessages] = useState<Array<any>>([]);
  const [initialMessageProcessed, setInitialMessageProcessed] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("project") as Id<"projects"> | null;
  const project = useQuery(api.projects.get, projectId ? { id: projectId } : "skip");
  const dbMessages = useQuery(api.messages.list, typedChatId && user ? { chatId: typedChatId } : "skip");
  const currentChat = useQuery(api.chats.get, typedChatId ? { chatId: typedChatId } : "skip");

  const createChat = useMutation(api.chats.create);
  const renameChat = useMutation(api.chats.rename);
  const createMessage = useMutation(api.messages.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const sendMessage = useAction(api.chat.sendMessage);
  const generateTitle = useAction(api.titles.generateTitle);
  const createLibraryItem = useMutation(api.library.create);
  const createProject = useMutation(api.projects.create);
  const updateMessage = useMutation(api.messages.update);
  const deleteMessagesFromIndex = useMutation(api.messages.deleteMessagesFromIndex);

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [temporaryModel, setTemporaryModel] = useState<string | null>(null);
  const { scrollRef, showScrollButton, scrollToBottom } = useSmartScroll<HTMLDivElement>({ threshold: 30 });

  const messages = user ? [...(dbMessages || []), ...pendingMessages] : guestMessages;

  useEffect(() => {
    if (urlChatId) {
      if (currentChatId !== urlChatId) setCurrentChatId(urlChatId as Id<"chats">);
    } else if (location.pathname === "/app" && currentChatId) {
      setCurrentChatId(null);
    }
  }, [urlChatId, location.pathname, currentChatId, setCurrentChatId]);

  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null;
    if (state?.initialMessage && !initialMessageProcessed) {
      setInitialMessageProcessed(true);
      navigate(location.pathname, { replace: true, state: {} });
      handleSend(state.initialMessage);
    }
  }, [location.state, initialMessageProcessed, navigate, location.pathname]);

  useEffect(() => {
    if (user && user.onboardingCompleted === false && !location.pathname.includes("/onboarding")) {
      navigate("/onboarding");
    }
  }, [user, navigate, location.pathname]);

  useEffect(() => { if (dbMessages) setPendingMessages([]); }, [dbMessages]);

  const upgradeToKimi = useMutation(api.users.upgradeToKimiGuest);
  useEffect(() => {
    if (user && localStorage.getItem("kimi_guest_pending") === "true") {
      upgradeToKimi()
        .then(() => {
          localStorage.removeItem("kimi_guest_pending");
          toast.success("KIMI Guest Mode Activated!");
        })
        .catch((err) => {
          console.error("Failed to upgrade to KIMI guest:", err);
          localStorage.removeItem("kimi_guest_pending");
        });
    }
  }, [user, upgradeToKimi]);

  // Force scroll to bottom when a new user message is pending (optimistic update)
  useEffect(() => {
    // If we just added a pending message (user sent one), snap to bottom
    if (pendingMessages.length > 0) {
      scrollToBottom(false);
    }
  }, [pendingMessages.length, scrollToBottom]);

  // Force instant scroll stickiness when streaming starts/updates
  // The hook handles most resize events, but this ensures we lock on the stream start
  useEffect(() => {
    if (isStreaming) {
      // Ideally we just ensure stickiness, but calling scrollToBottom(true) is safe
      // if we are already near bottom (which the hook handles internally via its ref logic? No.)
      // Actually, the hook handles "If I am stuck, stay stuck".
      // We just need to make sure we START stuck when streaming begins.
      scrollToBottom(true);
    }
  }, [isStreaming, scrollToBottom]);

  const handleSend = async (text: string, files?: File[]) => {
    if (!text.trim() && (!files || files.length === 0)) {
      toast.error("Please enter a message");
      return;
    }

    const currentCount = parseInt(localStorage.getItem("cryonex_msg_count") || "0");
    localStorage.setItem("cryonex_msg_count", (currentCount + 1).toString());
    window.dispatchEvent(new Event("cryonex-message-sent"));

    const tempId = Date.now().toString();
    const optimisticMessage = {
      id: tempId,
      role: "user" as const,
      content: text,
      attachments: files?.map(f => ({ name: f.name, type: f.type, size: f.size }))
    };

    if (user) setPendingMessages(prev => [...prev, optimisticMessage]);
    else setGuestMessages(prev => [...prev, optimisticMessage]);

    let chatId = typedChatId;
    let isNewChat = false;

    if (!chatId && user) {
      try {
        const initialTitle = text.slice(0, 30) + (text.length > 30 ? "..." : "");
        chatId = await createChat({ title: initialTitle, model: activeModel, projectId: projectId || undefined });
        setCurrentChatId(chatId as string);
        navigate(`/app/chat/${chatId}`, { replace: true });
        isNewChat = true;
      } catch (error) {
        toast.error("Failed to start new chat");
        setPendingMessages(prev => prev.filter(m => m.id !== tempId));
        return;
      }
    } else if (chatId && user && currentChat?.title === "New Chat") {
      isNewChat = true;
      try {
        const initialTitle = text.slice(0, 30) + (text.length > 30 ? "..." : "");
        await renameChat({ chatId, title: initialTitle });
      } catch (err) { console.error("Failed to rename chat:", err); }
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
          uploadedFiles.push({ storageId, name: file.name, type: file.type, size: file.size });
          toast.success(`${file.name} uploaded`);
        } catch (error) { toast.error(`Failed to upload ${file.name}`); }
      }
    }

    if (user && chatId) {
      try {
        await createMessage({ chatId, role: "user", content: text, attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined });
        setPendingMessages(prev => prev.filter(m => m.id !== tempId));
      } catch (error) {
        toast.error("Failed to send message");
        setPendingMessages(prev => prev.filter(m => m.id !== tempId));
        return;
      }
    }

    setIsStreaming(true);
    setStreamingContent("");

    // Determine temporary model for UI feedback
    const lowerText = text.toLowerCase();
    const imageKeywords = ["generate image", "create image", "make image", "generate picture", "create picture", "make picture", "generate photo", "create photo", "make photo", "create art", "make art", "generate art", "draw a ", "draw an ", "paint a ", "paint an ", "sketch a ", "sketch an "];
    const isImageIntent = lowerText.startsWith("/image") ||
      lowerText.startsWith("/img") ||
      imageKeywords.some(keyword => lowerText.includes(keyword));

    // If it's a think/search command but NOT an image command, don't force image UI
    const isExplicitNonImage = lowerText.startsWith("/think") || lowerText.startsWith("/search");

    const predictedModel = (isImageIntent && !isExplicitNonImage) ? "pollinations/flux" : activeModel;
    setTemporaryModel(predictedModel);

    if (isNewChat && chatId) {
      generateTitle({ chatId, firstMessage: text }).catch(err => console.error("Failed to generate title:", err));
    }

    try {
      const modelId = activeModel;
      const history = messages?.map((m: any) => ({ role: m.role, content: m.content })) || [];

      let systemInstruction = "";
      if (text.startsWith("[Think] ")) systemInstruction = "You are in REASONING mode. You MUST output your internal thought process wrapped in <tool_call>...<tool_call> tags before your final response. The user wants to see how you think.";
      else if (text.startsWith("[Search] ")) systemInstruction = "You are in SEARCH mode. Please provide a comprehensive answer with sources if possible.";
      else if (text.startsWith("[Canvas] ")) systemInstruction = "You are in CANVAS mode. Focus on generating structured content, code, or designs.";

      const currentMessages = [...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []), ...history, { role: "user", content: text }];

      let assistantMessageId;
      if (user && chatId) {
        assistantMessageId = await createMessage({ chatId, role: "assistant", content: "", model: modelId });
      }

      const { content: responseContent, sources: responseSources, model: usedModel } = await sendMessage({
        messages: currentMessages,
        model: modelId,
        messageId: assistantMessageId,
        chatId: chatId || undefined,
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      });

      if (!user) {
        setGuestMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: responseContent, model: usedModel || modelId, sources: responseSources }]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate response");
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      setTemporaryModel(null);
    }
  };

  const handleEditMessage = async (messageId: string | undefined, newContent: string) => {
    if (!messageId || !user || !typedChatId) return;

    try {
      const messageIndex = messages.findIndex((m: any) => m._id === messageId);
      if (messageIndex === -1) {
        toast.error("Message not found");
        return;
      }

      // Optimistic Update: Update the message in the local list immediately to prevent jumpiness
      // We can do this by mutating the pendingMessages if it's there, but usually it's in dbMessages
      // Since we rely on Convex reactivity, we just wait for the mutation.

      await updateMessage({ messageId: messageId as Id<"messages">, content: newContent });

      // Delete subsequent messages
      await deleteMessagesFromIndex({ chatId: typedChatId, fromIndex: messageIndex + 1 });

      setIsStreaming(true);
      setStreamingContent("");

      // Reconstruct context for AI (up to the edited message)
      const previousMessages = messages.slice(0, messageIndex).map((m: any) => ({ role: m.role, content: m.content }));
      const currentContext = [...previousMessages, { role: "user", content: newContent }];

      const lowerText = newContent.toLowerCase();
      const imageKeywords = ["generate image", "create image", "make image", "generate picture", "create picture", "make picture", "generate photo", "create photo", "make photo", "create art", "make art", "generate art", "draw a ", "draw an ", "paint a ", "paint an ", "sketch a ", "sketch an "];
      const isImageIntent = lowerText.startsWith("/image") ||
        lowerText.startsWith("/img") ||
        imageKeywords.some(keyword => lowerText.includes(keyword));
      const isExplicitNonImage = lowerText.startsWith("/think") || lowerText.startsWith("/search");

      setTemporaryModel((isImageIntent && !isExplicitNonImage) ? "pollinations/flux" : activeModel);

      // Add system instruction if needed
      let systemInstruction = "";
      if (newContent.startsWith("[Think] ")) systemInstruction = "You are in REASONING mode. You MUST output your internal thought process wrapped in <tool_call>...<tool_call> tags before your final response. The user wants to see how you think.";
      else if (newContent.startsWith("[Search] ")) systemInstruction = "You are in SEARCH mode. Please provide a comprehensive answer with sources if possible.";
      else if (newContent.startsWith("[Canvas] ")) systemInstruction = "You are in CANVAS mode. Focus on generating structured content, code, or designs.";

      if (systemInstruction) {
        currentContext.unshift({ role: "system", content: systemInstruction });
      }

      const assistantMessageId = await createMessage({ chatId: typedChatId, role: "assistant", content: "", model: activeModel });

      await sendMessage({
        messages: currentContext,
        model: activeModel,
        messageId: assistantMessageId,
        chatId: typedChatId,
      });

    } catch (error: any) {
      console.error("Failed to edit and regenerate:", error);
      toast.error("Failed to edit message");
      setIsStreaming(false);
      setTemporaryModel(null);
    }
  };

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [contentToSave, setContentToSave] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [saveCategory, setSaveCategory] = useState("");
  const [saveType, setSaveType] = useState<"library" | "project">("library");

  const executeSave = async () => {
    if (!saveTitle) { toast.error("Please enter a title"); return; }
    try {
      if (saveType === "library") {
        await createLibraryItem({ title: saveTitle, prompt: contentToSave, category: saveCategory });
        toast.success("Saved to Library");
      } else {
        await createProject({ name: saveTitle, description: contentToSave, color: "blue" });
        toast.success("Project created");
      }
      setSaveDialogOpen(false);
    } catch (error) { toast.error("Failed to save"); }
  };

  const showEmptyState = !messages || messages.length === 0;

  // Dynamic padding for input area
  const [bottomPadding, setBottomPadding] = useState(150); // Default start
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Add a small buffer (e.g. 20px) to the input height
        setBottomPadding(entry.contentRect.height + 40);
      }
    });

    observer.observe(inputEl);
    return () => observer.disconnect();
  }, []);

  return (
    <SourcePreviewProvider>
      <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden bg-transparent">
        <WelcomePopup />
        <SubwaySurfersOverlay />
        <EmojiRatingWrapper />

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 z-20 absolute top-0 right-0 left-0 pointer-events-none">
          <div className="pointer-events-auto">
            <CreditIndicator type="main" className="glass border-white/10 rounded-full" />
          </div>
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

        {/* Mobile Header Credits - Floating */}
        <div className="md:hidden absolute top-3 right-3 z-20">
          <CreditIndicator type="main" className="glass border-white/10 rounded-full text-xs scale-90" />
        </div>

        {/* Main Chat Area */}
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden">
          {isMobile && showEmptyState ? (
            <div className="flex-1 overflow-y-auto mobile-scroll-thin">
              <MobileHome />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar mobile-scroll-thin" ref={scrollRef}>
              <div
                className="max-w-4xl mx-auto w-full px-4 md:px-0 pt-20 min-h-full flex flex-col transition-[padding] duration-200"
                style={{ paddingBottom: `${bottomPadding}px` }}
              >
                {showEmptyState ? (
                  <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh] py-6 md:py-10 animate-in fade-in duration-700 px-4">
                    {/* Main Greeting */}
                    <div className="space-y-4 md:space-y-6 flex flex-col items-center mb-6 md:mb-10 relative z-10">
                      <div className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-purple-500/20 blur-[60px] rounded-full group-hover:bg-cyan-500/20 transition-colors duration-700" />
                        <div className="relative h-20 w-20 md:h-32 md:w-32 rounded-[1.5rem] md:rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.2)] hover:scale-105 transition-transform duration-500">
                          <img src="/assets/cryonex-logo-official.png" alt="Cryonex Logo" className="h-14 w-14 md:h-20 md:w-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                        </div>
                      </div>
                      <div className="text-center space-y-2 md:space-y-3">
                        <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white tracking-tight mobile-text-hero">
                          {project ? `${project.name}` : "Hey there!"}
                        </h2>
                        <p className="text-sm md:text-base lg:text-lg text-white/60 font-light max-w-xs md:max-w-md mx-auto">
                          {project ? "Ready for input." : "What would you like to create?"}
                        </p>
                      </div>
                    </div>

                    {/* Feature Cards Grid */}
                    <FeatureCards onSend={handleSend} />
                  </div>
                ) : (
                  <div className="space-y-2 py-4 px-2 md:px-0">
                    {messages.map((message, idx) => {
                      const key = ("_id" in message ? message._id : message.id) as any;
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
                          model={isAssistantStreaming && temporaryModel ? temporaryModel : (message as any).model}
                          attachments={(message as any).attachments}
                          onEdit={(newContent) => handleEditMessage(message.role === "user" ? ("_id" in message ? message._id : message.id) : undefined, newContent)}
                        />
                      );
                    })}
                    {isStreaming && !user && <NeoMessage role="assistant" content={streamingContent} isStreaming={true} model={temporaryModel || activeModel} />}

                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floating Input Area */}
          <div ref={inputRef} className="absolute bottom-0 left-0 right-0 z-50 px-3 md:px-4 pb-4 md:pb-8 pt-16 md:pt-24 bg-gradient-to-t from-[#030005] via-[#030005]/90 to-transparent pointer-events-none">
            <div className="max-w-3xl mx-auto w-full pointer-events-auto">
              <PromptInputBox
                onSend={handleSend}
                isLoading={isStreaming}
                className="glass-panel border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-[1.5rem] md:rounded-[2rem]"
              />
              <p className="text-center text-[10px] text-white/30 mt-2 md:mt-3 font-medium hidden sm:block">
                Cryonex AI can make mistakes. Please verify important information.
              </p>
            </div>

            {/* Scroll to Bottom Button */}
            {showScrollButton && (
              <button
                onClick={() => scrollToBottom(false)}
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-full p-2 shadow-lg hover:bg-black/80 transition-all animate-in fade-in zoom-in duration-200 z-50 cursor-pointer pointer-events-auto"
                aria-label="Scroll to bottom"
              >
                <ArrowDown className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Save Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent className="glass-panel border-white/10 text-white sm:max-w-[425px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle>Save Content</DialogTitle>
              <DialogDescription className="text-white/50">Save this conversation to your library or start a new project.</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="library" onValueChange={(v) => setSaveType(v as any)} className="w-full mt-2">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-xl">
                <TabsTrigger value="library" className="rounded-lg data-[state=active]:bg-white/10">Library</TabsTrigger>
                <TabsTrigger value="project" className="rounded-lg data-[state=active]:bg-white/10">New Project</TabsTrigger>
              </TabsList>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={saveTitle} onChange={(e) => setSaveTitle(e.target.value)} className="bg-black/40 border-white/10 rounded-xl" placeholder="Enter title..." />
                </div>
                <TabsContent value="library" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={saveCategory} onChange={(e) => setSaveCategory(e.target.value)} className="bg-black/40 border-white/10 rounded-xl" placeholder="e.g. Protocol, Intel..." />
                  </div>
                </TabsContent>
                <div className="pt-2">
                  <Button onClick={executeSave} className="w-full bg-white text-black hover:bg-white/90 rounded-xl font-bold">
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
    { icon: IconImage, label: "Generate Images", desc: "Create Visuals", gradient: "from-purple-500 to-fuchsia-500", bgGradient: "from-purple-500/20 to-fuchsia-500/20", border: "border-purple-500/30", prompt: "generate a image of a golden robot" },
    { icon: IconFile, label: "Write Content", desc: "AI Writing", gradient: "from-blue-500 to-cyan-500", bgGradient: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
    { icon: IconData, label: "Write Code", desc: "Development", gradient: "from-emerald-500 to-teal-500", bgGradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
    { icon: IconBrain, label: "Brainstorm", desc: "Ideation", gradient: "from-orange-500 to-amber-500", bgGradient: "from-orange-500/20 to-amber-500/20", border: "border-orange-500/30" }
  ];

  return (
    <>
      {/* Mobile: Horizontal scroll */}
      <div className="md:hidden w-full overflow-visible -mx-4 px-4">
        <div className="mobile-scroll-x pb-2">
          {features.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSend(item.prompt || `Help me ${item.label.toLowerCase()}`)}
              className={`group relative overflow-hidden rounded-2xl border ${item.border} glass p-4 text-left touch-feedback min-w-[140px] flex-shrink-0`}
            >
              <div className="flex flex-col gap-3">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.bgGradient} flex items-center justify-center`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{item.label}</h3>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">{item.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: Grid */}
      <div className="hidden md:grid grid-cols-2 gap-4 w-full max-w-2xl">
        {features.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSend(item.prompt || `Help me ${item.label.toLowerCase()}`)}
            className={`group relative overflow-hidden rounded-[1.5rem] border ${item.border} glass hover:bg-white/[0.1] p-5 text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 touch-manipulation`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${item.bgGradient} text-white shadow-inner`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">{item.label}</h3>
                <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors uppercase tracking-wider">{item.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
});