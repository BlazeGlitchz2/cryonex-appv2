import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useChatStore } from "@/lib/stores/chat-store";
import { detectImageIntent, getSystemInstruction } from "@/lib/constants/chat";
// Removed static import of offlineLLM to allow lazy-loading by Vite
import { useOfflineModelStore } from "@/lib/stores/offline-model-store";
import { nativeLLM } from "@/lib/services/native-llm";
import { Capacitor } from "@capacitor/core";
import { useNavigate } from "react-router";
import {
    serializeStudyRouteCard,
} from "@/lib/study-routing";
import { useStudyIntentRouter } from "@/hooks/use-study-intent-router";

interface UseChatHandlersProps {
    user: any;
    typedChatId: Id<"chats"> | null;
    projectId: Id<"projects"> | null;
    dbMessages: any[] | undefined;
    currentChat: any;
}

export function useChatHandlers({
    user,
    typedChatId,
    projectId,
    dbMessages,
    currentChat,
}: UseChatHandlersProps) {
    const isNativePlatform = Capacitor.isNativePlatform();
    const navigate = useNavigate();
    const {
        activeModel,
        setCurrentChatId,
        isStreaming,
        setIsStreaming,
        streamingContent,
        setStreamingContent,
        temporaryModel,
        setTemporaryModel
    } = useChatStore();
    const { recordStudySignal, routePdfToStudy } = useStudyIntentRouter();

    const [guestMessages, setGuestMessages] = useState<Array<any>>([]);
    const [pendingMessages, setPendingMessages] = useState<Array<any>>([]);
    const streamGenerationRef = useRef(0);

    const createChat = useMutation(api.chats.create);
    const renameChat = useMutation(api.chats.rename);
    const createMessage = useMutation(api.messages.create);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const sendMessage = useAction(api.chat.sendMessage);
    const generateTitle = useAction(api.titles.generateTitle);
    const updateMessage = useMutation(api.messages.update);
    const deleteMessagesFromIndex = useMutation(api.messages.deleteMessagesFromIndex);

    const messages = user
        ? [...(dbMessages || []), ...pendingMessages]
        : guestMessages;

    useEffect(() => {
        if (dbMessages) setPendingMessages([]);
    }, [dbMessages]);

    const handleStop = useCallback(() => {
        streamGenerationRef.current += 1;
        setIsStreaming(false);
        setStreamingContent("");
        setTemporaryModel(null);
    }, []);

    const revealResponse = useCallback(async (fullContent: string) => {
        const streamId = ++streamGenerationRef.current;
        const trimmedContent = fullContent || "";
        setStreamingContent(trimmedContent);
        return streamGenerationRef.current === streamId;
    }, []);

    const uploadFilesToStorage = useCallback(
        async (
            files?: File[],
            options?: { announceSuccess?: boolean },
        ) => {
            const uploadedFiles: Array<{
                storageId: Id<"_storage">;
                name: string;
                type: string;
                size: number;
            }> = [];

            if (!files || files.length === 0) {
                return uploadedFiles;
            }

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

                    if (options?.announceSuccess !== false) {
                        toast.success(`${file.name} uploaded`);
                    }
                } catch (error) {
                    toast.error(`Failed to upload ${file.name}`);
                }
            }

            return uploadedFiles;
        },
        [generateUploadUrl],
    );

    const handleSend = async (text: string, files?: File[]) => {
        if (!text.trim() && (!files || files.length === 0)) {
            toast.error("Please enter a message");
            return;
        }

        const normalizedStudyIntent = recordStudySignal(text, files);
        const pdfFile = files?.find(
            (file) =>
                file.type === "application/pdf" ||
                file.name.toLowerCase().endsWith(".pdf"),
        );

        const currentCount = parseInt(localStorage.getItem("cryonex_msg_count") || "0");
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
                const initialTitle = text.slice(0, 30) + (text.length > 30 ? "..." : "");
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
                const initialTitle = text.slice(0, 30) + (text.length > 30 ? "..." : "");
                await renameChat({ chatId, title: initialTitle });
            } catch (err) {
                console.error("Failed to rename chat:", err);
            }
        }

        const shouldRoutePdfToStudy = !!(
            user &&
            chatId &&
            pdfFile &&
            normalizedStudyIntent.shouldRoutePdf
        );

        if (shouldRoutePdfToStudy && pdfFile) {
            const effectiveStudyPrompt =
                text.trim() || "Summarize this PDF and train me on it.";
            let assistantMessageId: Id<"messages"> | undefined;

            streamGenerationRef.current += 1;
            setIsStreaming(true);
            setStreamingContent("Routing your PDF into the Study Dashboard...");
            setTemporaryModel("study-router");

            try {
                const uploadedFiles = await uploadFilesToStorage([pdfFile], {
                    announceSuccess: false,
                });
                const uploadedPdf = uploadedFiles[0];

                if (!uploadedPdf) {
                    throw new Error("Failed to upload the PDF attachment.");
                }

                if (user && chatId) {
                    await createMessage({
                        chatId,
                        role: "user",
                        content: effectiveStudyPrompt,
                        attachments: [uploadedPdf],
                    });
                    setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));

                    assistantMessageId = await createMessage({
                        chatId,
                        role: "assistant",
                        content: "",
                        model: "study-router",
                    });
                }

                if (isNewChat && chatId) {
                    generateTitle({ chatId, firstMessage: effectiveStudyPrompt }).catch((err) =>
                        console.error("Failed to generate title:", err),
                    );
                }

                const routeResult = await routePdfToStudy({
                    file: pdfFile,
                    storageId: uploadedPdf.storageId,
                    prompt: effectiveStudyPrompt,
                });

                const assistantContent = [
                    serializeStudyRouteCard({
                        version: 1,
                        jobId: routeResult.jobId,
                        status: "complete",
                        fileName: pdfFile.name,
                        request: effectiveStudyPrompt,
                        primaryIntent: routeResult.intent.primaryIntent,
                        intensity: routeResult.intent.intensity,
                        intentLabel: routeResult.intent.intentLabel,
                        summary: routeResult.intent.summary,
                        topic: routeResult.intent.topic,
                        dashboardUrl: routeResult.dashboardUrl,
                        workspaceUrl: routeResult.workspaceUrl,
                    }),
                    `I routed **${pdfFile.name}** into your study workspace and personalized it for: "${effectiveStudyPrompt}".`,
                    "Everything is prepared for you in the dashboard and the PDF workspace.",
                ].join("\n\n");

                if (assistantMessageId) {
                    await updateMessage({
                        messageId: assistantMessageId,
                        content: assistantContent,
                        model: "study-router",
                    });
                } else {
                    setGuestMessages((prev) => [
                        ...prev,
                        {
                            id: Date.now().toString(),
                            role: "assistant",
                            content: assistantContent,
                            model: "study-router",
                        },
                    ]);
                }

                await revealResponse(assistantContent);
            } catch (error: any) {
                const errorMessage =
                    error?.message || "Failed to route your PDF into the study workspace.";

                if (assistantMessageId) {
                    await updateMessage({
                        messageId: assistantMessageId,
                        content: `I couldn't finish preparing that PDF yet.\n\n${errorMessage}`,
                        model: "study-router",
                    });
                }

                toast.error(errorMessage);
                setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
            } finally {
                setIsStreaming(false);
                setStreamingContent("");
                setTemporaryModel(null);
            }

            return;
        }

        streamGenerationRef.current += 1;
        setIsStreaming(true);
        setStreamingContent("");

        const predictedModel = detectImageIntent(text) ? "pollinations/flux" : activeModel;
        setTemporaryModel(predictedModel);

        const uploadedFiles = await uploadFilesToStorage(files);

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
                setIsStreaming(false);
                setStreamingContent("");
                setTemporaryModel(null);
                return;
            }
        }

        if (isNewChat && chatId) {
            generateTitle({ chatId, firstMessage: text }).catch((err) =>
                console.error("Failed to generate title:", err),
            );
        }

        if (activeModel.startsWith("offline/")) {
            if (user && user.tier !== "PRO") {
                toast.error("Offline Mode is exclusively for PRO users.", {
                    description: "Upgrade to access local AI models.",
                });
                setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
                return;
            }

            const { isInitialized, isDownloading, isModelLoading } = useOfflineModelStore.getState();
            if (!isInitialized) {
                if (isDownloading || isModelLoading) {
                    toast.info("Please wait for the AI model to finish loading.");
                    setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
                    return;
                }

                try {
                    toast.info("Initializing offline AI model...");
                    if (isNativePlatform) {
                        await nativeLLM.initialize();
                    } else {
                        const { offlineLLM } = await import("@/lib/services/offline-llm");
                        await offlineLLM.initialize();
                    }
                } catch (err: any) {
                    toast.error("Failed to initialize offline model: " + err.message);
                    setPendingMessages((prev) => prev.filter((m) => m.id !== tempId));
                    return;
                }
            }

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
                const chatWithOfflineModel = isNativePlatform
                    ? nativeLLM.chat.bind(nativeLLM)
                    : async (offlineMessages: any[], onStream: (chunk: string) => void) => {
                        const { offlineLLM } = await import("@/lib/services/offline-llm");
                        return offlineLLM.chat(offlineMessages, onStream);
                    };
                await chatWithOfflineModel(context, (chunk) => {
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

            await revealResponse(responseContent);

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

    const handleEditMessage = async (messageId: string | undefined, newContent: string) => {
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

            streamGenerationRef.current += 1;
            setIsStreaming(true);
            setStreamingContent("");

            const previousMessages = messages
                .slice(0, messageIndex)
                .map((m: any) => ({ role: m.role, content: m.content }));
            const currentContext = [
                ...previousMessages,
                { role: "user", content: newContent },
            ];

            setTemporaryModel(detectImageIntent(newContent) ? "pollinations/flux" : activeModel);

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

            const result = await sendMessage({
                messages: currentContext,
                model: activeModel,
                messageId: assistantMessageId,
                chatId: typedChatId,
            });
            await revealResponse(result?.content ?? "");
        } catch (error: any) {
            console.error("Failed to edit and regenerate:", error);
            toast.error("Failed to edit message");
            setIsStreaming(false);
            setTemporaryModel(null);
        }
    };

    return {
        messages,
        isStreaming,
        streamingContent,
        temporaryModel,
        pendingMessages,
        handleSend,
        handleEditMessage,
        handleStop,
        setGuestMessages,
        setPendingMessages,
    };
}
