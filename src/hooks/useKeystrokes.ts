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
  index: number;
  insertedText?: string;
  removedText?: string;
  contentAfter?: string;
}

const SYNC_INTERVAL_MS = 15000;

function getExactDiff(previous: string, next: string) {
  let start = 0;

  while (
    start < previous.length &&
    start < next.length &&
    previous[start] === next[start]
  ) {
    start += 1;
  }

  let previousEnd = previous.length - 1;
  let nextEnd = next.length - 1;

  while (
    previousEnd >= start &&
    nextEnd >= start &&
    previous[previousEnd] === next[nextEnd]
  ) {
    previousEnd -= 1;
    nextEnd -= 1;
  }

  return {
    index: start,
    removedText:
      previousEnd >= start ? previous.slice(start, previousEnd + 1) : "",
    insertedText: nextEnd >= start ? next.slice(start, nextEnd + 1) : "",
  };
}

export function useKeystrokes(essayId: Id<"essays"> | null) {
  const [contentState, setContentState] = useState("");
  const contentRef = useRef("");
  const logQueue = useRef<KeystrokeLog[]>([]);
  const lastKeyTime = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isComposingRef = useRef(false);

  const logRevision = useMutation(api.vault.logRevisions);

  const setContent = useCallback(
    (value: string | ((previous: string) => string)) => {
      setContentState((previous) => {
        const nextValue =
          typeof value === "function" ? value(previous) : value;
        contentRef.current = nextValue;
        return nextValue;
      });
    },
    [],
  );

  const flushQueue = useCallback(async () => {
    if (!essayId || logQueue.current.length === 0) return;

    const payload = [...logQueue.current];
    logQueue.current = [];

    try {
      await logRevision({
        essayId,
        revisions: payload,
      });
    } catch (error) {
      console.error("Failed to sync revisions silently", error);
      logQueue.current = [...payload, ...logQueue.current];
    }
  }, [essayId, logRevision]);

  useEffect(() => {
    if (!essayId) return;

    timerRef.current = setInterval(() => {
      void flushQueue();
    }, SYNC_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      void flushQueue();
    };
  }, [essayId, flushQueue]);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
  }, []);

  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = event.target.value;
      const previousContent = contentRef.current;

      if (previousContent === newContent) return;

      const now = Date.now();
      const timeSinceLastKeystrokeMs = now - lastKeyTime.current;

      contentRef.current = newContent;
      setContentState(newContent);

      if (isComposingRef.current) {
        lastKeyTime.current = now;
        return;
      }

      const diff = getExactDiff(previousContent, newContent);
      const nativeInputType =
        (event.nativeEvent as InputEvent | undefined)?.inputType ?? "";

      let actionType: ActionType = "insert";
      if (
        nativeInputType.includes("delete") ||
        (!!diff.removedText && !diff.insertedText)
      ) {
        actionType = "delete";
      } else if (
        nativeInputType.includes("paste") ||
        diff.insertedText.length > 1
      ) {
        actionType = "paste";
      }

      logQueue.current.push({
        chunk: diff.insertedText || diff.removedText || " ",
        actionType,
        timestamp: now,
        timeSinceLastKeystrokeMs,
        index: diff.index,
        insertedText: diff.insertedText || undefined,
        removedText: diff.removedText || undefined,
        contentAfter: newContent,
      });

      lastKeyTime.current = now;
    },
    [],
  );

  return {
    content: contentState,
    setContent,
    handleInput,
    handleCompositionStart,
    handleCompositionEnd,
    flushQueue,
  };
}
