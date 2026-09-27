import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
    compact?: boolean;
}

export const EmptyState = React.memo(function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
    compact = false,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "flex flex-col items-center justify-center text-center",
                compact ? "py-6 px-4" : "py-12 px-6",
                className,
            )}
        >
            <div
                className={cn(
                    "rounded-2xl bg-primary/5 border border-border flex items-center justify-center",
                    compact ? "h-12 w-12 mb-3" : "h-16 w-16 mb-4",
                )}
            >
                <Icon
                    className={cn(
                        "text-primary/60",
                        compact ? "h-5 w-5" : "h-7 w-7",
                    )}
                />
            </div>

            <h3
                className={cn(
                    "font-semibold text-foreground",
                    compact ? "text-xs" : "text-sm",
                )}
            >
                {title}
            </h3>

            {description && (
                <p
                    className={cn(
                        "text-muted-foreground mt-1 max-w-xs",
                        compact ? "text-[10px]" : "text-xs",
                    )}
                >
                    {description}
                </p>
            )}

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    size="sm"
                    className={cn(
                        "mt-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all",
                        compact ? "h-8 text-[11px] px-3" : "h-9 text-xs px-4",
                    )}
                >
                    {actionLabel}
                </Button>
            )}
        </motion.div>
    );
});
