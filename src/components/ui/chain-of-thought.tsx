"use client"

import * as React from "react"
import { ChevronDown, Dot } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const ChainOfThought = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ open, defaultOpen, onOpenChange, className, children, ...props }, ref) => {
  return (
    <Collapsible open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </Collapsible>
  )
})
ChainOfThought.displayName = "ChainOfThought"

const ChainOfThoughtHeader = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof CollapsibleTrigger> & {
    children?: React.ReactNode
  }
>(({ children = "Chain of Thought", className, ...props }, ref) => {
  return (
    <CollapsibleTrigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-all hover:bg-accent/50 [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </CollapsibleTrigger>
  )
})
ChainOfThoughtHeader.displayName = "ChainOfThoughtHeader"

type StepStatus = "complete" | "active" | "pending"

const ChainOfThoughtStep = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    icon?: LucideIcon
    label?: string
    description?: string
    status?: StepStatus
  }
>(({ icon: Icon, label, description, status = "complete", className, ...props }, ref) => {
  const statusStyles: Record<StepStatus, { text: string; icon: string; dot: string }> = {
    complete: {
      text: "text-muted-foreground",
      icon: "text-muted-foreground",
      dot: "bg-muted-foreground",
    },
    active: {
      text: "text-foreground",
      icon: "text-foreground",
      dot: "bg-foreground animate-pulse",
    },
    pending: {
      text: "text-muted-foreground/50",
      icon: "text-muted-foreground/50",
      dot: "bg-muted-foreground/30",
    },
  }

  const styles = statusStyles[status]

  return (
    <div
      ref={ref}
      className={cn("flex items-start gap-3 py-2", className)}
      {...props}
    >
      {Icon ? (
        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", styles.icon)} />
      ) : (
        <div className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", styles.dot)} />
      )}
      <div className="flex-1 min-w-0 space-y-1">
        {label && (
          <div className={cn("text-sm leading-relaxed", styles.text)}>
            {label}
          </div>
        )}
        {description && (
          <div className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </div>
        )}
      </div>
    </div>
  )
})
ChainOfThoughtStep.displayName = "ChainOfThoughtStep"

const ChainOfThoughtContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CollapsibleContent>
>(({ className, children, ...props }, ref) => {
  return (
    <CollapsibleContent
      ref={ref}
      className={cn(
        "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className
      )}
      {...props}
    >
      <div className="px-4 pb-4 pt-0">{children}</div>
    </CollapsibleContent>
  )
})
ChainOfThoughtContent.displayName = "ChainOfThoughtContent"

const ChainOfThoughtSearchResults = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-wrap gap-1.5", className)}
      {...props}
    />
  )
})
ChainOfThoughtSearchResults.displayName = "ChainOfThoughtSearchResults"

const ChainOfThoughtSearchResult = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Badge>
>(({ className, ...props }, ref) => {
  return (
    <Badge
      ref={ref}
      variant="outline"
      className={cn("text-xs font-normal", className)}
      {...props}
    />
  )
})
ChainOfThoughtSearchResult.displayName = "ChainOfThoughtSearchResult"

const ChainOfThoughtImage = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    caption?: string
  }
>(({ caption, className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("space-y-2 my-3", className)}
      {...props}
    >
      <div className="rounded-lg overflow-hidden border bg-muted/50">
        {children}
      </div>
      {caption && (
        <div className="text-xs text-muted-foreground leading-relaxed px-1">
          {caption}
        </div>
      )}
    </div>
  )
})
ChainOfThoughtImage.displayName = "ChainOfThoughtImage"

export {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
  ChainOfThoughtContent,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  ChainOfThoughtImage,
}
