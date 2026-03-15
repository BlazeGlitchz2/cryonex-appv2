import { useState, useEffect, RefObject } from "react";

export function useInputPadding(inputRef: RefObject<HTMLDivElement | null>) {
    const [bottomPadding, setBottomPadding] = useState(150);

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
    }, [inputRef]);

    return bottomPadding;
}
