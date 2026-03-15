import React from "react";
import { NeoMessage } from "@/components/chat/NeoMessage";

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
        <div className="space-y-2 py-4 px-2 md:px-0">
            {messages.map((message, idx) => {
                const key = ("_id" in message ? message._id : message.id) as any;
                const isLastMessage = idx === messages.length - 1;
                const isAssistantStreaming = !!(
                    isStreaming &&
                    isLastMessage &&
                    message.role === "assistant" &&
                    user
                );
                return (
                    <NeoMessage
                        key={key}
                        role={message.role as any}
                        content={message.content}
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
                );
            })}
            {isStreaming && !user && (
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
