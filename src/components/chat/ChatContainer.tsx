import React, { useRef, useEffect, useState } from "react";
import { NeoMessage } from "@/components/chat/NeoMessage";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { ChatInputArea } from "@/components/chat/ChatInputArea";
import MobileHome from "@/pages/MobileHome";
import { createPortal } from "react-dom";
import { useSmartScroll } from "@/hooks/use-smart-scroll";

interface ChatContainerProps {
    isMobile: boolean;
    showEmptyState: boolean;
    messages: Array<any>;
    user: any;
    project: any;
    isStreaming: boolean;
    streamingContent: string;
    temporaryModel: string | null;
    activeModel: string;
    isMobileSidebarOpen: boolean;
    onSend: (text: string, files?: File[]) => Promise<void>;
    onStop: () => void;
    onEditMessage: (messageId: string | undefined, newContent: string) => Promise<void>;
    pendingMessagesLength: number;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
    isMobile,
    showEmptyState,
    messages,
    user,
    project,
    isStreaming,
    streamingContent,
    temporaryModel,
    activeModel,
    isMobileSidebarOpen,
    onSend,
    onStop,
    onEditMessage,
    pendingMessagesLength,
}) => {
    const { scrollRef, showScrollButton, scrollToBottom } =
        useSmartScroll<HTMLDivElement>({ threshold: 30 });

    // Dynamic padding for input area
    const [bottomPadding, setBottomPadding] = useState(150);
    const inputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const inputEl = inputRef.current;
        if (!inputEl) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setBottomPadding(entry.contentRect.height + 40);
            }
        });

        observer.observe(inputEl);
        return () => observer.disconnect();
    }, []);

    // Force scroll to bottom when a new user message is pending (optimistic update)
    useEffect(() => {
        if (pendingMessagesLength > 0) {
            scrollToBottom(false);
        }
    }, [pendingMessagesLength, scrollToBottom]);

    // Force instant scroll stickiness when streaming starts/updates
    useEffect(() => {
        if (isStreaming) {
            scrollToBottom(true);
        }
    }, [isStreaming, scrollToBottom]);

    return (
        <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden">
            {isMobile && showEmptyState ? (
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain mobile-scroll-thin">
                    <MobileHome />
                </div>
            ) : (
                <div
                    className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain scroll-smooth custom-scrollbar mobile-scroll-thin"
                    ref={scrollRef}
                >
                    <div
                        className="max-w-4xl mx-auto w-full px-4 md:px-0 pt-20 min-h-full flex flex-col transition-[padding] duration-200"
                        style={{ paddingBottom: `${bottomPadding}px` }}
                    >
                        {showEmptyState ? (
                            <ChatEmptyState project={project} onSend={onSend} />
                        ) : (
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
                                    // Keep the streaming buffer authoritative for
                                    // the active assistant message to avoid a
                                    // full-response flash before reveal begins.
                                    const renderedContent = isAssistantStreaming
                                        ? streamingContent
                                        : message.content;
                                    return (
                                        <NeoMessage
                                            key={key}
                                            role={message.role as any}
                                            content={renderedContent}
                                            userImage={user?.image}
                                            userName={user?.name}
                                            timestamp={
                                                "_creationTime" in message
                                                    ? message._creationTime
                                                    : Date.now()
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
                                                onEditMessage(
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
                        )}
                    </div>
                </div>
            )}

            {/* Render Input Area - Portal on Mobile */}
            {isMobile ? createPortal(
                <ChatInputArea
                    ref={inputRef}
                    isMobile={isMobile}
                    isMobileSidebarOpen={isMobileSidebarOpen}
                    isStreaming={isStreaming}
                    showScrollButton={showScrollButton}
                    onSend={onSend}
                    onStop={onStop}
                    scrollToBottom={scrollToBottom}
                />
                , document.body) : (
                <ChatInputArea
                    ref={inputRef}
                    isMobile={isMobile}
                    isMobileSidebarOpen={isMobileSidebarOpen}
                    isStreaming={isStreaming}
                    showScrollButton={showScrollButton}
                    onSend={onSend}
                    onStop={onStop}
                    scrollToBottom={scrollToBottom}
                />
            )}
        </div>
    );
};
