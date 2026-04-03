import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";

interface UseSmartScrollOptions {
  threshold?: number; // Distance from bottom to consider "at bottom" (px)
  smooth?: boolean; // Use smooth scrolling by default?
}

export function useSmartScroll<T extends HTMLElement>({
  threshold = 250,
  smooth = true,
}: UseSmartScrollOptions = {}) {
  const scrollRef = useRef<T>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  // Track if we should stick to the bottom
  const shouldAutoScrollRef = useRef(true);
  // Track if the user actively broke the auto-scroll lock
  const userForceBrokeRef = useRef(false);
  // RAF throttle ref for scroll events
  const scrollRafRef = useRef<number | null>(null);

  // Helper to check if we are at the bottom
  const checkIfAtBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceFromBottom <= threshold;
  }, [threshold]);

  // Scroll to bottom helper — uses 'auto' behavior for instant response
  const scrollToBottom = useCallback((instant = false) => {
    const el = scrollRef.current;
    if (el) {
      userForceBrokeRef.current = false;
      // Use RAF to batch with render cycle
      requestAnimationFrame(() => {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: instant ? "auto" : "smooth",
        });
      });
      shouldAutoScrollRef.current = true;
      setUserHasScrolledUp(false);
      setShowScrollButton(false);
    }
  }, []);

  // 1. Handle Scroll Events — RAF-throttled to prevent excessive updates on mobile
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      // Throttle with RAF — at most one state update per animation frame
      if (scrollRafRef.current !== null) return;

      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        
        const el = scrollRef.current;
        if (!el) return;

        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        const reachedAbsoluteBottom = distanceFromBottom <= 10;

        if (reachedAbsoluteBottom) {
          shouldAutoScrollRef.current = true;
          setUserHasScrolledUp(false);
          setShowScrollButton(false);
          userForceBrokeRef.current = false;
        } else if (userForceBrokeRef.current) {
          shouldAutoScrollRef.current = false;
          setUserHasScrolledUp(true);
          setShowScrollButton(true);
        } else {
          const atBottom = distanceFromBottom <= threshold;
          if (atBottom) {
            shouldAutoScrollRef.current = true;
            setUserHasScrolledUp(false);
            setShowScrollButton(false);
          } else {
            shouldAutoScrollRef.current = false;
            setUserHasScrolledUp(true);
            setShowScrollButton(true);
          }
        }
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, [threshold]);

  // 1.5. Handle Explicit User Scroll Intent to break auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let touchStartY = 0;

    const breakAutoScroll = () => {
      userForceBrokeRef.current = true;
      shouldAutoScrollRef.current = false;
      setUserHasScrolledUp(true);
      setShowScrollButton(true);
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) breakAutoScroll(); // Scrolled up
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      if (touchY > touchStartY + 5) {
        breakAutoScroll(); // Scrolled up by dragging down
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: true });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // 2. Observer for content size changes (New messages, images loading, etc.)
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      if (shouldAutoScrollRef.current) {
        // Use 'auto' (instant) behavior during resize to prevent visual lag
        el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
      }
    });

    if (el.firstElementChild) {
      observer.observe(el.firstElementChild);
    } else {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []); // Run once on mount

  return {
    scrollRef,
    showScrollButton,
    scrollToBottom,
    userHasScrolledUp,
  };
}
