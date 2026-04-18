import { useState, useEffect, RefObject } from "react";

interface UseInputPaddingOptions {
    usesTouchShell?: boolean;
    extraClearance?: number;
}

export function useInputPadding(
    inputRef: RefObject<HTMLDivElement | null>,
    {
        usesTouchShell = false,
        extraClearance = 12,
    }: UseInputPaddingOptions = {},
) {
    const [composerHeight, setComposerHeight] = useState(usesTouchShell ? 72 : 108);

    useEffect(() => {
        const inputEl = inputRef.current;
        if (!inputEl) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setComposerHeight(Math.round(entry.contentRect.height));
            }
        });

        observer.observe(inputEl);
        return () => observer.disconnect();
    }, [inputRef]);

    if (usesTouchShell) {
        return `calc(${composerHeight}px + var(--phone-composer-bottom, 0px) + ${extraClearance}px)`;
    }

    return `${composerHeight + 72}px`;
}
