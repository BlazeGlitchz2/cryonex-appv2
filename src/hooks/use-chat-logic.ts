import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/lib/stores/chat-store";
import { detectImageIntent, getSystemInstruction } from "@/lib/constants/chat";
// Removed static import of offlineLLM to allow lazy-loading by Vite
import { useOfflineModelStore } from "@/lib/stores/offline-model-store";

export function useChatLogic() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentChatId, setCurrentChatId, activeModel } = useChatStore();
    const { chatId: urlChatId } = useParams();
    const typedChatId = (urlChatId || currentChatId) as Id<"chats"> | null;

    const [guestMessages, setGuestMessages] = useState<Array<any>>([]);
    const [pendingMessages, setPendingMessages] = useState<Array<any>>([]);
    const [initialMessageProcessed, setInitialMessageProcessed] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const projectId = queryParams.get("project") as Id<"projects"> | null;
    const project = useQuery(
        api.projects.get,
        projectId ? { id: projectId } : "skip",
    );
    const dbMessages = useQuery(
        api.messages.list,
        typedChatId && user ? { chatId: typedChatId } : "skip",
    );
    const currentChat = useQuery(
        api.chats.get,
        typedChatId ? { chatId: typedChatId } : "skip",
    );

    const createChat = useMutation(api.chats.create);
    const renameChat = useMutation(api.chats.rename);
    const createMessage = useMutation(api.messages.create);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const sendMessage = useAction(api.chat.sendMessage);
    const generateTitle = useAction(api.titles.generateTitle);
    const createLibraryItem = useMutation(api.library.create);
    const createProject = useMutation(api.projects.create);
    const updateMessage = useMutation(api.messages.update);
    const deleteMessagesFromIndex = useMutation(
        api.messages.deleteMessagesFromIndex,
    );

    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const [temporaryModel, setTemporaryModel] = useState<string | null>(null);

    const messages = user
        ? [...(dbMessages || []), ...pendingMessages]
        : guestMessages;

    useEffect(() => {
        if (urlChatId) {
            if (currentChatId !== urlChatId)
                setCurrentChatId(urlChatId as Id<"chats">);
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
        if (dbMessages) setPendingMessages([]);
    }, [dbMessages]);

    const handleSend = async (text: string, files?: File[]) => {
        if (!text.trim() && (!files || files.length === 0)) {
            toast.error("Please enter a message");
            return;
        }

        const currentCount = parseInt(
            localStorage.getItem("cryonex_msg_count") || "0",
        );
        localStorage.setItem("cryonex_msg_count", (currentCount + 1).toString());
        window.dispatchEvent(new Event("cryonex-message-sent"));

        const tempId = Date.now().toString();
        const optimisticMessage = {
            id: tempId,
            role: "user" as const,
            content: text,
            attachments: files?.map((f) => ({
                name: f.name,
                type: f.type,
                size: f.size,
            })),
        };

        if (user) setPendingMessages((prev) => [...prev, optimisticMessage]);
        else setGuestMessages((prev) => [...prev, optimisticMessage]);

        let chatId = typedChatId;
        let isNewChat = false;

        if (!chatId && user) {
            try {
                const initialTitle =
                    text.slice(0, 30) + (text.length > 30 ? "..." : "");
                chatId = await createChat({
                    title: initialTitle,
                    model: activeModel,
                    projectId: projectId || undefined,
                });
                setCurrentChatId(chatId as string);
                navigate(`/app/chat/${chatId}`, { replace: true });
                isNewChat = true;
            } catch (error) {
                toast.error("Failed to start new chat");
                setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
                return;
            }
        } else if (chatId && user && currentChat?.title === "New Chat") {
            isNewChat = true;
            try {
                const initialTitle =
                    text.slice(0, 30) + (text.length > 30 ? "..." : "");
                await renameChat({ chatId, title: initialTitle });
            } catch (err) {
                console.error("Failed to rename chat:", err);
            }
        }

        const uploadedFiles: Array<{
            storageId: Id<"_storage">;
            name: string;
            type: string;
            size: number;
        }> = [];
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const uploadUrl = await generateUploadUrl();
                    const result = await fetch(uploadUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": file.type || "application/octet-stream",
                        },
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
            try {
                await createMessage({
                    chatId,
                    role: "user",
                    content: text,
                    attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
                });
                setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
            } catch (error) {
                toast.error("Failed to send message");
                setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
                return;
            }
        }

        setIsStreaming(true);
        setStreamingContent("");

        // Determine temporary model for UI feedback
        const predictedModel = detectImageIntent(text) ? "pollinations/flux" : activeModel;
        setTemporaryModel(predictedModel);

        if (isNewChat && chatId) {
            generateTitle({ chatId, firstMessage: text }).catch((err) =>
                console.error("Failed to generate title:", err),
            );
        }

        if (activeModel.startsWith("offline/")) {
            // PRO Check
            if (user && user.tier !== "PRO") {
                toast.error("Offline Mode is exclusively for PRO users.", {
                    description: "Upgrade to access local AI models.",
                });
                setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
                return;
            }

            // Initialize if needed - await initialization before proceeding
            const { isInitialized, isDownloading, isModelLoading } = useOfflineModelStore.getState();
            if (!isInitialized) {
                if (isDownloading || isModelLoading) {
                    toast.info("Please wait for the AI model to finish loading.");
                    setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
                    return;
                }

                try {
                    toast.info("Initializing offline AI model...");
                    const { offlineLLM } = await import("@/lib/services/offline-llm");
                    await offlineLLM.initialize();
                } catch (err: any) {
                    toast.error("Failed to initialize offline model: " + err.message);
                    setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
                    return;
                }
            }

            // Prepare offline chat
            const assistantId = Date.now().toString() + "_ai";
            const offlineAssistantMsg = {
                id: assistantId,
                role: "assistant",
                content: "",
                model: activeModel,
                isOffline: true,
            };

            if (user) setPendingMessages((prev) => [...prev, offlineAssistantMsg]);
            else setGuestMessages((prev) => [...prev, offlineAssistantMsg]);

            setIsStreaming(true);
            setStreamingContent("");

            try {
                const history = messages?.map((m: any) => ({ role: m.role, content: m.content })) || [];
                const context = [...history, { role: "user", content: text }];

                let fullContent = "";
                const { offlineLLM } = await import("@/lib/services/offline-llm");
                await offlineLLM.chat(context, (chunk) => {
                    fullContent += chunk;
                    setStreamingContent(fullContent);

                    if (user) {
                        setPendingMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m));
                    } else {
                        setGuestMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m));
                    }
                });

                if (user) {
                    setPendingMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m));
                } else {
                    setGuestMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m));
                }

            } catch (error: any) {
                console.error("Offline generation error:", error);
                toast.error("Offline AI error: " + (error.message || "Unknown error"));
                if (user) setPendingMessages(prev => prev.filter(m => m.id !== assistantId));
                else setGuestMessages(prev => prev.filter(m => m.id !== assistantId));
            } finally {
                setIsStreaming(false);
                setTemporaryModel(null);
            }
            return;
        }

        try {
            const modelId = activeModel;
            const history = messages?.map((m: any) => ({ role: m.role, content: m.content })) || [];
            const systemInstruction = getSystemInstruction(text);

            const currentMessages = [
                ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
                ...history,
                { role: "user", content: text },
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

            const {
                content: responseContent,
                sources: responseSources,
                model: usedModel,
            } = await sendMessage({
                messages: currentMessages,
                model: modelId,
                messageId: assistantMessageId,
                chatId: chatId || undefined,
                attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
            });

            if (!user) {
                setGuestMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: responseContent,
                        model: usedModel || modelId,
                        sources: responseSources,
                    },
                ]);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to generate response");
        } finally {
            setIsStreaming(false);
            setStreamingContent("");
            setTemporaryModel(null);
        }
    };

    const handleEditMessage = async (
        messageId: string | undefined,
        newContent: string,
    ) => {
        if (!messageId || !user || !typedChatId) return;

        try {
            const messageIndex = messages.findIndex((m: any) => m._id === messageId);
            if (messageIndex === -1) {
                toast.error("Message not found");
                return;
            }

            await updateMessage({
                messageId: messageId as Id<"messages">,
                content: newContent,
            });

            await deleteMessagesFromIndex({
                chatId: typedChatId,
                fromIndex: messageIndex + 1,
            });

            setIsStreaming(true);
            setStreamingContent("");

            const previousMessages = messages
                .slice(0, messageIndex)
                .map((m: any) => ({ role: m.role, content: m.content }));
            const currentContext = [
                ...previousMessages,
                { role: "user", content: newContent },
            ];

            setTemporaryModel(
                detectImageIntent(newContent) ? "pollinations/flux" : activeModel,
            );

            const systemInstruction = getSystemInstruction(newContent);
            if (systemInstruction) {
                currentContext.unshift({ role: "system", content: systemInstruction });
            }

            const assistantMessageId = await createMessage({
                chatId: typedChatId,
                role: "assistant",
                content: "",
                model: activeModel,
            });

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
            toast.error("Failed to save");
        }
    };

    const handleStop = useCallback(() => {
        setIsStreaming(false);
        setStreamingContent("");
        setTemporaryModel(null);
    }, []);

    const showEmptyState = !messages || messages.length === 0;

    return {
        messages,
        project,
        isStreaming,
        streamingContent,
        temporaryModel,
        activeModel,
        pendingMessagesLength: pendingMessages.length,
        showEmptyState,
        handleSend,
        handleStop,
        handleEditMessage,
        saveDialogOpen,
        setSaveDialogOpen,
        contentToSave,
        setContentToSave,
        saveTitle,
        setSaveTitle,
        saveCategory,
        setSaveCategory,
        saveType,
        setSaveType,
        executeSave
    };
}
