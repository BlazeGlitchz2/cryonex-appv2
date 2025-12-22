"use client"

import { useState, useEffect } from "react"
import { RatingInteraction } from "@/components/ui/emoji-rating"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"

export function EmojiRatingWrapper() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const checkRating = () => {
            const count = parseInt(localStorage.getItem("cryonex_msg_count") || "0")
            const hasRated = localStorage.getItem("cryonex_has_rated")

            if (count >= 5 && !hasRated) {
                setIsOpen(true)
            }
        }

        // Check on mount and listen for custom event
        checkRating()
        window.addEventListener("cryonex-message-sent", checkRating)
        return () => window.removeEventListener("cryonex-message-sent", checkRating)
    }, [])

    const handleRate = (rating: number) => {
        // In a real app, send to Convex here
        console.log("User rated:", rating)
        toast.success("Thank you for your feedback!")
        localStorage.setItem("cryonex_has_rated", "true")
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-sm">
                <div className="relative">
                    {/* Close button is handled by Dialog but we can add custom one if needed */}
                    <RatingInteraction onChange={handleRate} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
