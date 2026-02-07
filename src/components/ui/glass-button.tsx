import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all disabled:pointer-events-none disabled:opacity-50 overflow-hidden group",
  {
    variants: {
      size: {
        default: "h-11 px-6 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean;
  contentClassName?: string;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    { className, size, asChild = false, children, contentClassName, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(glassButtonVariants({ size, className }))}
        ref={ref}
        {...props}
      >
        {/* Glass background layer */}
        <span className="absolute inset-0 bg-white/10 backdrop-blur-md backdrop-saturate-150 border border-white/20 rounded-full" />

        {/* Hover effect layer */}
        <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

        {/* Shadow layer */}
        <span className="absolute inset-0 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full" />

        {/* Content */}
        <span className={cn("relative z-10 text-white", contentClassName)}>
          {children}
        </span>
      </Comp>
    );
  },
);

GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
