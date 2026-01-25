"use client";

import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AIThinkingBlockProps {
    thinking?: string;
    isFinished?: boolean;
}

export default function AIThinkingBlock({ thinking, isFinished }: AIThinkingBlockProps) {
    const [displayedContent, setDisplayedContent] = useState("");
    const contentRef = useRef<HTMLDivElement>(null);
    const [timer, setTimer] = useState(0);

    const ThinkingContent = thinking || "Thinking...";

    useEffect(() => {
        if (isFinished) return;
        const timerInterval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);

        return () => {
            clearInterval(timerInterval);
        };
    }, [isFinished]);

    // Streaming Text Effect
    useEffect(() => {
        if (!thinking) return;
        // If finished, just show full content
        if (isFinished) {
            setDisplayedContent(thinking);
            return;
        }

        let index = 0;
        const chunkSize = 5; // Faster chunk
        const intervalTime = 10;

        // Reset if thinking changes
        setDisplayedContent("");

        const streamInterval = setInterval(() => {
            if (index < ThinkingContent.length) {
                setDisplayedContent((prev) => prev + ThinkingContent.slice(index, index + chunkSize));
                index += chunkSize;
            } else {
                clearInterval(streamInterval);
            }
        }, intervalTime);

        return () => clearInterval(streamInterval);
    }, [ThinkingContent, isFinished, thinking]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [displayedContent]);

    return (
        <div className="flex flex-col p-3 max-w-xl">
            <div className="flex items-center justify-start gap-2 mb-4">
                {/* Using existing Loader with sm size. Note: Existing Loader might default to circular */}
                <Loader size="sm" />
                <p
                    className="bg-[linear-gradient(110deg,#404040,35%,#fff,50%,#404040,75%,#404040)] bg-[length:200%_100%] bg-clip-text text-base text-transparent animate-[shimmer_5s_linear_infinite]"
                    style={{
                        animation: "shimmer 5s linear infinite",
                    }}
                >
                    Cryonex is thinking
                </p>
                <span className="text-sm text-muted-foreground">
                    {timer}s
                </span>
            </div>
            <Card className="relative h-[200px] overflow-hidden bg-secondary p-2 rounded-card border-none ring-1 ring-border">
                {/* Top fade overlay */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-secondary to-transparent z-10 pointer-events-none h-8" />

                {/* Bottom fade overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-secondary to-transparent z-10 pointer-events-none h-8" />

                {/* Scrolling content */}
                <div
                    ref={contentRef}
                    className="h-full overflow-y-auto p-4 text-xs md:text-sm leading-relaxed text-secondary-foreground font-mono"
                    style={{
                        scrollBehavior: "smooth",
                    }}
                >
                    <div className="whitespace-pre-wrap">
                        {displayedContent}
                        <span className="inline-block w-2 h-4 ml-1 bg-primary/50 animate-pulse align-middle" />
                    </div>
                </div>
            </Card>
        </div>
    );
}
