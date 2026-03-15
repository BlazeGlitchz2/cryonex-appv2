import React from "react";
import { CreditIndicator } from "@/components/credits/CreditIndicator";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";

interface ChatHeaderProps {
    toggleSubwaySurfers: () => void;
    showSubwaySurfers: boolean;
    isMobile: boolean;
}

export function ChatHeader({
    toggleSubwaySurfers,
    showSubwaySurfers,
    isMobile,
}: ChatHeaderProps) {
    return (
        <>
            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between px-6 py-3 z-20 absolute top-0 right-0 left-0 pointer-events-none">
                <div className="pointer-events-auto">
                    <CreditIndicator
                        type="main"
                        className="glass border-white/10 rounded-full"
                    />
                </div>
                <div className="flex items-center gap-3 pointer-events-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSubwaySurfers}
                        className={`text-xs font-medium transition-colors rounded-full px-3 border ${showSubwaySurfers
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
                            }`}
                    >
                        <Gamepad2 className="h-4 w-4 mr-2" />
                        {showSubwaySurfers ? "Focus Mode On" : "Bored?"}
                    </Button>
                </div>
            </div>

            {/* Mobile Header Credits - Floating */}
            {isMobile && (
                <div className="md:hidden absolute top-3 right-3 z-20">
                    <CreditIndicator
                        type="main"
                        className="glass border-white/10 rounded-full text-xs scale-90"
                    />
                </div>
            )}
        </>
    );
}
