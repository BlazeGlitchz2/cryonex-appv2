import { useRef, useCallback, useEffect } from 'react';

interface SwipeGestureOptions {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    threshold?: number; // Minimum swipe distance (default: 80px for more intentional swipes)
    velocityThreshold?: number; // Minimum velocity for quick swipes (default: 0.3 px/ms)
    onSwipeProgress?: (progress: number, direction: 'left' | 'right') => void;
    disabled?: boolean;
}

interface SwipeState {
    startX: number;
    startY: number;
    currentX: number;
    startTime: number;
    isSwiping: boolean;
    isScrolling: boolean | null; // null = undetermined, true = vertical scroll, false = horizontal swipe
}

/**
 * Custom hook for detecting swipe gestures on touch devices.
 * Optimized for Android message interactions (swipe-to-reply, swipe-to-delete).
 */
export function useSwipeGesture<T extends HTMLElement = HTMLDivElement>(
    options: SwipeGestureOptions = {}
) {
    const {
        onSwipeLeft,
        onSwipeRight,
        threshold = 80, // Increased for more intentional swipes
        velocityThreshold = 0.3, // px/ms
        onSwipeProgress,
        disabled = false,
    } = options;

    const ref = useRef<T>(null);
    const stateRef = useRef<SwipeState>({
        startX: 0,
        startY: 0,
        currentX: 0,
        startTime: 0,
        isSwiping: false,
        isScrolling: null,
    });

    const handleTouchStart = useCallback(
        (e: TouchEvent) => {
            if (disabled) return;

            const touch = e.touches[0];
            stateRef.current = {
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                startTime: Date.now(),
                isSwiping: true,
                isScrolling: null,
            };
        },
        [disabled]
    );

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (disabled || !stateRef.current.isSwiping) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - stateRef.current.startX;
            const deltaY = touch.clientY - stateRef.current.startY;
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            // Determine scroll vs swipe direction on first significant movement
            if (stateRef.current.isScrolling === null && (absX > 10 || absY > 10)) {
                // If vertical movement is significantly greater, it's a scroll
                stateRef.current.isScrolling = absY > absX * 1.5;
            }

            // If determined to be scrolling, cancel the swipe
            if (stateRef.current.isScrolling) {
                stateRef.current.isSwiping = false;
                onSwipeProgress?.(0, 'right');
                return;
            }

            // It's a horizontal swipe - prevent page scroll
            if (absX > 15) {
                e.preventDefault();
            }

            stateRef.current.currentX = touch.clientX;

            // Report progress with smooth curve
            const rawProgress = absX / threshold;
            const progress = Math.min(rawProgress, 1);
            const direction: 'left' | 'right' = deltaX < 0 ? 'left' : 'right';
            onSwipeProgress?.(progress, direction);
        },
        [disabled, threshold, onSwipeProgress]
    );

    const handleTouchEnd = useCallback(() => {
        if (disabled || !stateRef.current.isSwiping) return;

        const deltaX = stateRef.current.currentX - stateRef.current.startX;
        const absX = Math.abs(deltaX);
        const duration = Date.now() - stateRef.current.startTime;
        const velocity = duration > 0 ? absX / duration : 0;

        // Trigger swipe if distance threshold OR velocity threshold is met
        const isValidSwipe = absX >= threshold || (velocity >= velocityThreshold && absX > 30);

        if (isValidSwipe && !stateRef.current.isScrolling) {
            // Trigger haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }

            if (deltaX < 0) {
                onSwipeLeft?.();
            } else {
                onSwipeRight?.();
            }
        }

        // Reset
        stateRef.current.isSwiping = false;
        stateRef.current.isScrolling = null;
        onSwipeProgress?.(0, 'right');
    }, [disabled, threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeProgress]);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });
        element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return ref;
}


/**
 * Hook for long-press detection on touch devices.
 * Useful for context menus on messages.
 */
export function useLongPress<T extends HTMLElement = HTMLDivElement>(
    onLongPress: () => void,
    options: { delay?: number; disabled?: boolean } = {}
) {
    const { delay = 500, disabled = false } = options;

    const ref = useRef<T>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPressRef = useRef(false);

    const clear = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        isLongPressRef.current = false;
    }, []);

    const handleTouchStart = useCallback(() => {
        if (disabled) return;

        timerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            onLongPress();
            // Trigger haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }, delay);
    }, [disabled, delay, onLongPress]);

    const handleTouchEnd = useCallback(() => {
        clear();
    }, [clear]);

    const handleTouchMove = useCallback(() => {
        // Cancel on move
        clear();
    }, [clear]);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: true });
        element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchcancel', handleTouchEnd);
            clear();
        };
    }, [handleTouchStart, handleTouchEnd, handleTouchMove, clear]);

    return ref;
}
