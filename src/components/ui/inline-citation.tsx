import * as React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSafeExternalUrl } from "@/lib/safe-url";
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

export function InlineCitation({
  number,
  title,
  url,
  className,
  ...props
}: InlineCitationProps) {
  const safeUrl = getSafeExternalUrl(url);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {safeUrl ? (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1 rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-xs font-medium text-blue-400 transition-colors hover:text-blue-300",
                className,
              )}
              {...props}
            >
              [{number}]
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-xs font-medium text-blue-400/60",
                className,
              )}
            >
              [{number}]
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
