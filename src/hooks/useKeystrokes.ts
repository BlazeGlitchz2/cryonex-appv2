import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type ActionType = "insert" | "delete" | "paste";

interface KeystrokeLog {
    chunk: string;
    actionType: ActionType;
    timestamp: number;
    timeSinceLastKeystrokeMs: number;
}

const SYNC_INTERVAL_MS = 15000; // 15 seconds batch sync

// The heart of the Receipts Engine
export function useKeystrokes(essayId: Id<"essays"> | null) {
    const [content, setContent] = useState("");

    // Use refs to avoid React re-render lag on every keystroke
    const logQueue = useRef<KeystrokeLog[]>([]);
    const lastKeyTime = useRef<number>(Date.now());
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const logRevision = useMutation(api.vault.logRevisions);

    // Safely sync to backend without interrupting flow
    const flushQueue = useCallback(async () => {
        if (!essayId || logQueue.current.length === 0) return;

        // Snapshot current queue and clear it local
        const payload = [...logQueue.current];
        logQueue.current = [];

        try {
            await logRevision({
                essayId,
                revisions: payload,
            });
        } catch (e) {
            console.error("Failed to sync revisions silently", e);
            // Re-queue if failed (optimistic)
            logQueue.current = [...payload, ...logQueue.current];
        }
    }, [essayId, logRevision]);

    // Set up the batching interval
    useEffect(() => {
        if (essayId) {
            timerRef.current = setInterval(flushQueue, SYNC_INTERVAL_MS);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            flushQueue(); // Final flush on unmount
        };
    }, [essayId, flushQueue]);

    // The actual event handler attached to the textarea/editor
    const handleInput = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newContent = e.target.value;
            const now = Date.now();
            const timeSince = now - lastKeyTime.current;

            // Extremely naive diffing for performance
            // In a real pro-app, we would track cursor position and insert/delete specifics.
            // For this MVP, we track the delta of the string length to guess the action.
            // If the change is massive (>10 chars instantly), it's a paste.

            let action: ActionType = "insert";
            let chunk = "";

            const lengthDelta = newContent.length - content.length;

            if (lengthDelta > 10) {
                action = "paste";
                // Attempt to find what was pasted
                chunk = newContent.substring(content.length);
            } else if (lengthDelta < 0) {
                action = "delete";
                chunk = content.substring(newContent.length); // Attempt to see what was deleted
            } else {
                action = "insert";
                chunk = newContent.slice(-lengthDelta); // Typically the last character typed
            }

            logQueue.current.push({
                chunk: chunk || " ", // fallback
                actionType: action,
                timestamp: now,
                timeSinceLastKeystrokeMs: timeSince,
            });

            lastKeyTime.current = now;
            setContent(newContent);
        },
        [content]
    );

    return {
        content,
        setContent, // for initial load
        handleInput,
        flushQueue, // manual trigger if needed
    };
}
