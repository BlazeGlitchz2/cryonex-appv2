import * as React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InlineCitationProps extends React.HTMLAttributes<HTMLAnchorElement> {
  number: number;
  title: string;
  url: string;
}

export function InlineCitation({ number, title, url, className, ...props }: InlineCitationProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors",
              "px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20",
              className
            )}
            {...props}
          >
            [{number}]
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
