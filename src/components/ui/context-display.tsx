import * as React from "react";
import { motion } from "framer-motion";
import { FileText, Image, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

export function ContextDisplay({ items, title = "Context", className, ...props }: ContextDisplayProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider">{title}</h4>
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
                className="bg-white/5 border-white/10 text-white/80 hover:bg-white/10 transition-colors"
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
