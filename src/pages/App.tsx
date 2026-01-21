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
import { Gamepad2 } from "lucide-react";

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSubwaySurfers, showSubwaySurfers } = useUIStore();
  const { currentChatId, setCurrentChatId, activeModel } = useChatStore();
  const { chatId: urlChatId } = useParams();
  const typedChatId = (urlChatId || currentChatId) as Id<"chats"> | null;

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

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const isNearBottomRef = useRef(true);
  const handleScroll = useCallback(() => {
    const container = scrollRootRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
    }
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, streamingContent]);

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

      const { content: responseContent, sources: responseSources } = await sendMessage({
        messages: currentMessages,
        model: modelId,
        messageId: assistantMessageId,
        chatId: chatId || undefined,
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      });

      if (!user) {
        setGuestMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: responseContent, model: modelId, sources: responseSources }]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate response");
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
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
      { icon: IconData, label: "Write Code", desc: "Development", gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/20" },
      { icon: IconBrain, label: "Brainstorm", desc: "Ideation", gradient: "from-orange-500/20 to-amber-500/20", border: "border-orange-500/20" }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
      {features.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSend(`Help me ${item.label.toLowerCase()}`)}
          className={`group relative overflow-hidden rounded-[1.5rem] border ${item.border} bg-black/20 backdrop-blur-md hover:bg-white/[0.05] p-5 text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 touch-manipulation`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-inner`}>
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
  );
});