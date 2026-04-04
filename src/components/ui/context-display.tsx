import * as React from "react";
import { motion } from "framer-motion";
import { FileText, Image, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useThemeStore } from "@/lib/stores/theme-store";

interface ContextItem {
  type: "file" | "image" | "link";
  name: string;
  url?: string;
}

interface ContextDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  items: ContextItem[];
  title?: string;
}

const iconMap = {
  file: FileText,
  image: Image,
  link: LinkIcon,
};

export function ContextDisplay({
  items,
  title = "Context",
  className,
  ...props
}: ContextDisplayProps) {
  const isLight = useThemeStore((state) => state.mode === "light");
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <h4
        className={cn(
          "text-xs font-medium uppercase tracking-wider transition-colors",
          isLight ? "text-muted-foreground" : "text-white/60",
        )}
      >
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => {
          const Icon = iconMap[item.type];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Badge
                variant="outline"
                className={cn(
                  "transition-colors",
                  isLight
                    ? "bg-accent/30 border-border text-foreground hover:bg-accent/50"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10",
                )}
              >
                <Icon className="h-3 w-3 mr-1.5" />
                {item.name}
              </Badge>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
