import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Zap, Battery, BatteryMedium, BatteryLow, BatteryFull } from "lucide-react";
import { cn } from "@/lib/utils";
import { RefuelModal } from "./RefuelModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CreditIndicatorProps {
    type?: 'main' | 'study';
    className?: string;
}

export function CreditIndicator({ type = 'main', className }: CreditIndicatorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const balance = useQuery(type === 'main' ? api.credits.getBalance : api.credits.getStudyBalance);

    // Default to 100 if loading, or actual balance
    const currentCredits = balance ?? 100;
    const maxCredits = 100;
    const percentage = Math.min(100, Math.max(0, (currentCredits / maxCredits) * 100));

    // Determine color based on percentage
    const getColor = () => {
        if (percentage > 60) return "text-green-400";
        if (percentage > 30) return "text-yellow-400";
        return "text-red-500";
    };

    const getBgColor = () => {
        if (percentage > 60) return "bg-green-500/20 border-green-500/30";
        if (percentage > 30) return "bg-yellow-500/20 border-yellow-500/30";
        return "bg-red-500/20 border-red-500/30";
    };

    const getIcon = () => {
        if (type === 'study') return <Zap className={cn("w-3 h-3", getColor())} fill="currentColor" />;

        if (percentage > 90) return <BatteryFull className={cn("w-4 h-4", getColor())} />;
        if (percentage > 40) return <BatteryMedium className={cn("w-4 h-4", getColor())} />;
        return <BatteryLow className={cn("w-4 h-4", getColor())} />;
    };

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:scale-105",
                                getBgColor(),
                                className
                            )}
                        >
                            {getIcon()}
                            <span className={cn("text-xs font-bold font-mono", getColor())}>
                                {currentCredits}/{maxCredits}
                            </span>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-black/90 border-white/10 text-xs">
                        <p>Click to refuel {type === 'main' ? 'credits' : 'study energy'}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <RefuelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={type}
            />
        </>
    );
}
