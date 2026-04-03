import { useState, useEffect, RefObject } from "react";

export function useInputPadding(inputRef: RefObject<HTMLDivElement | null>) {
    const [bottomPadding, setBottomPadding] = useState(180);

    useEffect(() => {
        const inputEl = inputRef.current;
        if (!inputEl) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // Keep extra clearance under the composer so the last
                // assistant lines and follow-ups stay above the vignette/input.
                setBottomPadding(entry.contentRect.height + 72);
            }
        });

        observer.observe(inputEl);
        return () => observer.disconnect();
    }, [inputRef]);

    return bottomPadding;
}
