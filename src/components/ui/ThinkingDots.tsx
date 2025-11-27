import React from "react";

type Props = {
  className?: string;
  colorClassName?: string;
  sizeClassName?: string;
};

export function ThinkingDots({
  className = "",
  colorClassName = "bg-foreground/70",
  sizeClassName = "h-2 w-2",
}: Props) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span
        className={`inline-block rounded-full ${sizeClassName} ${colorClassName} animate-pulse`}
        style={{ animationDelay: "0ms" }}
      />
      <span
        className={`inline-block rounded-full ${sizeClassName} ${colorClassName} animate-pulse`}
        style={{ animationDelay: "150ms" }}
      />
      <span
        className={`inline-block rounded-full ${sizeClassName} ${colorClassName} animate-pulse`}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

export default ThinkingDots;
