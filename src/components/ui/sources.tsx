import * as React from "react";
import { motion } from "framer-motion";
import { ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/theme-store";
import { getSafeExternalUrl } from "@/lib/safe-url";

interface Source {
  title: string;
  url: string;
  description?: string;
}

interface SourcesProps extends React.HTMLAttributes<HTMLDivElement> {
  sources: Source[];
  title?: string;
}

export function Sources({
  sources,
  title = "Sources",
  className,
  ...props
}: SourcesProps) {
  const isLight = useThemeStore((state) => state.mode === "light");
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <h4
        className={cn(
          "text-xs font-medium uppercase tracking-wider transition-colors",
          isLight ? "text-muted-foreground" : "text-white/60",
        )}
      >
        {title}
      </h4>
      <div className="space-y-2">
        {sources.map((source, index) => {
          const safeUrl = getSafeExternalUrl(source.url);

          return (
            <motion.a
              key={index}
              href={safeUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 transition-all group",
                !safeUrl && "pointer-events-none opacity-60",
                isLight
                  ? "border-border/50 bg-background/50 hover:bg-accent/30"
                  : "border-white/10 bg-white/5 hover:bg-white/10",
              )}
            >
              <FileText
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 transition-colors",
                  isLight ? "text-muted-foreground" : "text-white/60",
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "truncate text-sm font-medium transition-colors",
                      isLight ? "text-foreground" : "text-white",
                    )}
                  >
                    {source.title}
                  </p>
                  <ExternalLink
                    className={cn(
                      "h-3 w-3 shrink-0 transition-colors",
                      isLight
                        ? "text-muted-foreground/50 group-hover:text-foreground"
                        : "text-white/40 group-hover:text-white/60",
                    )}
                  />
                </div>
                {source.description && (
                  <p
                    className={cn(
                      "mt-1 line-clamp-2 text-xs transition-colors",
                      isLight ? "text-muted-foreground/80" : "text-white/60",
                    )}
                  >
                    {source.description}
                  </p>
                )}
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
