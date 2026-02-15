import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PendingMessage {
    /** Temporary client-side ID */
    tempId: string;
    /** Chat this message belongs to */
    chatId: string;
    /** Message text */
    content: string;
    /** Files that were attached (metadata only — files can't be cached) */
    attachmentNames?: string[];
    /** Timestamp of when the message was queued */
    queuedAt: number;
    /** Current sync status */
    status: "pending" | "syncing" | "failed";
}

export interface CachedChat {
    chatId: string;
    title: string;
    model?: string;
    /** Most recent messages (last 50) */
    messages: Array<{
        role: "user" | "assistant" | "system";
        content: string;
        model?: string;
        timestamp?: number;
    }>;
    /** When this cache was last updated */
    cachedAt: number;
}

interface OfflineStore {
    /** Messages queued while offline, waiting to be sent */
    pendingMessages: PendingMessage[];
    /** Cached chats for offline reading */
    cachedChats: CachedChat[];

    // — Pending message actions —
    addPendingMessage: (msg: Omit<PendingMessage, "status">) => void;
    removePendingMessage: (tempId: string) => void;
    updatePendingStatus: (
        tempId: string,
        status: PendingMessage["status"],
    ) => void;
    clearPendingMessages: () => void;

    // — Chat cache actions —
    cacheChat: (chat: CachedChat) => void;
    getCachedChat: (chatId: string) => CachedChat | undefined;
    removeCachedChat: (chatId: string) => void;
    clearCachedChats: () => void;
}

const MAX_CACHED_CHATS = 20;

export const useOfflineStore = create<OfflineStore>()(
    persist(
        (set, get) => ({
            pendingMessages: [],
            cachedChats: [],

            // — Pending messages —
            addPendingMessage: (msg) =>
                set((state) => ({
                    pendingMessages: [
                        ...state.pendingMessages,
                        { ...msg, status: "pending" as const },
                    ],
                })),

            removePendingMessage: (tempId) =>
                set((state) => ({
                    pendingMessages: state.pendingMessages.filter(
                        (m) => m.tempId !== tempId,
                    ),
                })),

            updatePendingStatus: (tempId, status) =>
                set((state) => ({
                    pendingMessages: state.pendingMessages.map((m) =>
                        m.tempId === tempId ? { ...m, status } : m,
                    ),
                })),

            clearPendingMessages: () => set({ pendingMessages: [] }),

            // — Chat cache —
            cacheChat: (chat) =>
                set((state) => {
                    const filtered = state.cachedChats.filter(
                        (c) => c.chatId !== chat.chatId,
                    );
                    // Keep the most recent N chats
                    const updated = [chat, ...filtered].slice(0, MAX_CACHED_CHATS);
                    return { cachedChats: updated };
                }),

            getCachedChat: (chatId) =>
                get().cachedChats.find((c) => c.chatId === chatId),

            removeCachedChat: (chatId) =>
                set((state) => ({
                    cachedChats: state.cachedChats.filter((c) => c.chatId !== chatId),
                })),

            clearCachedChats: () => set({ cachedChats: [] }),
        }),
        {
            name: "cryonex-offline-store",
        },
    ),
);
