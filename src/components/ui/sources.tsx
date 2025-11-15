import * as React from "react";
import { motion } from "framer-motion";
import { ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Source {
  title: string;
  url: string;
  description?: string;
}

interface SourcesProps extends React.HTMLAttributes<HTMLDivElement> {
  sources: Source[];
  title?: string;
}

export function Sources({ sources, title = "Sources", className, ...props }: SourcesProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider">{title}</h4>
      <div className="space-y-2">
        {sources.map((source, index) => (
          <motion.a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group"
          >
            <FileText className="h-4 w-4 text-white/60 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white truncate">{source.title}</p>
                <ExternalLink className="h-3 w-3 text-white/40 group-hover:text-white/60 shrink-0" />
              </div>
              {source.description && (
                <p className="text-xs text-white/60 mt-1 line-clamp-2">{source.description}</p>
              )}
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
