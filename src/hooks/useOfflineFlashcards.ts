import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface CachedFlashcard {
    id: Id<"flashcards">;
    front: string;
    back: string;
    difficulty?: "easy" | "medium" | "hard";
}

interface OfflineReview {
    flashcardId: Id<"flashcards">;
    rating: "wrong" | "hard" | "good" | "easy";
    timestamp: number;
}

export function useOfflineFlashcards() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const reviewFlashcard = useMutation(api.study.updateFlashcardReview);

    // Track online status
    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            syncOfflineReviews();
        };
        const handleOffline = () => setIsOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Initial sync
        if (navigator.onLine) syncOfflineReviews();

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Sync queued reviews to backend
    const syncOfflineReviews = async () => {
        try {
            const stored = localStorage.getItem("cryonex_offline_reviews");
            if (!stored) return;

            const reviews: OfflineReview[] = JSON.parse(stored);
            if (reviews.length === 0) return;

            console.log(`Syncing ${reviews.length} offline flashcard reviews...`);
            for (const review of reviews) {
                await reviewFlashcard({
                    flashcardId: review.flashcardId,
                    rating: review.rating,
                });
            }

            // Clear queue after successful sync
            localStorage.removeItem("cryonex_offline_reviews");
        } catch (error) {
            console.error("Failed to sync offline reviews", error);
        }
    };

    // Cache cards for offline use
    const cacheCards = (cards: CachedFlashcard[]) => {
        if (cards && cards.length > 0) {
            localStorage.setItem("cryonex_offline_cards", JSON.stringify(cards));
        }
    };

    // Get cached cards if offline
    const getCachedCards = (): CachedFlashcard[] => {
        try {
            const stored = localStorage.getItem("cryonex_offline_cards");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    };

    // Process a review (handles both online and offline)
    const processReview = async (
        flashcardId: Id<"flashcards">,
        rating: "wrong" | "hard" | "good" | "easy"
    ) => {
        if (isOffline) {
            // Queue offline review
            const stored = localStorage.getItem("cryonex_offline_reviews");
            const reviews: OfflineReview[] = stored ? JSON.parse(stored) : [];
            reviews.push({ flashcardId, rating, timestamp: Date.now() });
            localStorage.setItem("cryonex_offline_reviews", JSON.stringify(reviews));
        } else {
            // Send directly to backend
            try {
                await reviewFlashcard({ flashcardId, rating });
            } catch (error) {
                console.error("Failed to submit review online, queuing offline.", error);
                const stored = localStorage.getItem("cryonex_offline_reviews");
                const reviews: OfflineReview[] = stored ? JSON.parse(stored) : [];
                reviews.push({ flashcardId, rating, timestamp: Date.now() });
                localStorage.setItem("cryonex_offline_reviews", JSON.stringify(reviews));
            }
        }
    };

    return {
        isOffline,
        cacheCards,
        getCachedCards,
        processReview,
    };
}
