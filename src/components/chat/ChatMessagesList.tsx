import React from "react";
import { NeoMessage } from "@/components/chat/NeoMessage";
import { motion } from "framer-motion";

interface ChatMessagesListProps {
    messages: any[];
    user: any;
    isStreaming: boolean;
    streamingContent: string;
    temporaryModel: string | null;
    activeModel: string;
    handleEditMessage: (messageId: string | undefined, newContent: string) => void;
}

export function ChatMessagesList({
    messages,
    user,
    isStreaming,
    streamingContent,
    temporaryModel,
    activeModel,
    handleEditMessage,
}: ChatMessagesListProps) {
    return (
        <div className="space-y-5 px-2 py-8 md:px-0 md:py-10">
            {messages.map((message, idx) => {
                const key =
                    ("_id" in message ? message._id : message.id) ??
                    `${message.role}-${message.content?.slice(0, 24) ?? "message"}-${idx}`;
                const isLastMessage = idx === messages.length - 1;
                const isAssistantStreaming = !!(
                    isStreaming &&
                    isLastMessage &&
                    message.role === "assistant"
                );
                // Keep the streaming view authoritative for the active assistant
                // message so we don't briefly flash the fully-saved response and
                // then restart from the animated reveal.
                const renderedContent = isAssistantStreaming
                    ? streamingContent
                    : message.content;
                return (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <NeoMessage
                            role={message.role as any}
                            content={renderedContent}
                            userImage={user?.image}
                            userName={user?.name}
                            timestamp={
                                "_creationTime" in message ? message._creationTime : Date.now()
                            }
                            isStreaming={isAssistantStreaming}
                            sources={(message as any).sources}
                            model={
                                isAssistantStreaming && temporaryModel
                                    ? temporaryModel
                                    : (message as any).model
                            }
                            attachments={(message as any).attachments}
                            onEdit={(newContent) =>
                                handleEditMessage(
                                    message.role === "user"
                                        ? "_id" in message
                                            ? message._id
                                            : message.id
                                        : undefined,
                                    newContent,
                                )
                            }
                        />
                    </motion.div>
                );
            })}
            {isStreaming && (messages.length === 0 || messages[messages.length - 1]?.role !== "assistant") && (
                <NeoMessage
                    role="assistant"
                    content={streamingContent}
                    isStreaming={true}
                    model={temporaryModel || activeModel}
                />
            )}
        </div>
    );
}
