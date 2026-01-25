import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';

interface UseSmartScrollOptions {
    threshold?: number; // Distance from bottom to consider "at bottom" (px)
    smooth?: boolean;   // Use smooth scrolling by default?
}

export function useSmartScroll<T extends HTMLElement>({
    threshold = 100,
    smooth = true
}: UseSmartScrollOptions = {}) {
    const scrollRef = useRef<T>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

    // Track if we should stick to the bottom
    const shouldAutoScrollRef = useRef(true);

    // Helper to check if we are at the bottom
    const checkIfAtBottom = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return true;

        // Logic: scrollHeight - scrollTop - clientHeight < threshold
        // We add a small buffer (1px) for float precision issues
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        return distanceFromBottom <= threshold;
    }, [threshold]);

    // Scroll to bottom helper
    const scrollToBottom = useCallback((instant = false) => {
        const el = scrollRef.current;
        if (el) {
            el.scrollTo({
                top: el.scrollHeight,
                behavior: instant ? 'auto' : 'smooth'
            });
            // Force reset stickiness
            shouldAutoScrollRef.current = true;
            setUserHasScrolledUp(false);
            setShowScrollButton(false);
        }
    }, []);

    // 1. Handle Scroll Events (User Interaction)
    // We need to know if the USER scrolled up, so we can disable auto-scroll
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const onScroll = () => {
            const atBottom = checkIfAtBottom();

            // If at bottom, we resume auto-scroll stickiness
            if (atBottom) {
                shouldAutoScrollRef.current = true;
                setUserHasScrolledUp(false);
                setShowScrollButton(false);
            } else {
                // If not at bottom, user might have scrolled up
                // BUT we need to be careful: programmatic scrolls also fire onScroll
                // However, usually we update `shouldAutoScroll` *before* programmatic scroll
                // So this is mostly for detecting manual divergence
                shouldAutoScrollRef.current = false;
                setUserHasScrolledUp(true);
                setShowScrollButton(true);
            }
        };

        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, [checkIfAtBottom]);

    // 2. Observer for content size changes (New messages, images loading, etc.)
    // This replaces the need to pass `messages` dependency manually if we stick to size changes
    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const observer = new ResizeObserver(() => {
            // If we were sticking to bottom, stay at bottom
            if (shouldAutoScrollRef.current) {
                // Use 'auto' (instant) behavior during resize to prevent visual lag
                el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
            }
        });

        // Observe the container itself (scrollHeight changes trigger this usually?)
        // Actually simpler: observe the single child wrapper if it exists, or just the container
        // Observing container size (width/height) is one thing, but we want SCROLL HEIGHT
        // ResizeObserver fires on content box changes.
        // Ideally we observe the *children*.
        // Let's observe the first child (the content wrapper)
        if (el.firstElementChild) {
            observer.observe(el.firstElementChild);
        } else {
            // Fallback: observe the container itself (less reliable for overflow content)
            observer.observe(el);
        }

        return () => observer.disconnect();
    }, []); // Run once on mount

    return {
        scrollRef,
        showScrollButton,
        scrollToBottom,
        userHasScrolledUp
    };
}
