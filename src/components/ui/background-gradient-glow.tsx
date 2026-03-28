import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useState, type ReactNode } from "react";

export const LIGHT_AURORA_BACKGROUND = `
  radial-gradient(ellipse 85% 65% at 8% 8%, rgba(175, 109, 255, 0.42), transparent 60%),
  radial-gradient(ellipse 75% 60% at 75% 35%, rgba(255, 235, 170, 0.55), transparent 62%),
  radial-gradient(ellipse 70% 60% at 15% 80%, rgba(255, 100, 180, 0.40), transparent 62%),
  radial-gradient(ellipse 70% 60% at 92% 92%, rgba(120, 190, 255, 0.45), transparent 62%),
  linear-gradient(180deg, #f7eaff 0%, #fde2ea 100%)
`;

export const DARK_AURORA_BACKGROUND = `
  radial-gradient(ellipse 88% 68% at 10% 10%, rgba(133, 92, 255, 0.34), transparent 58%),
  radial-gradient(ellipse 76% 62% at 78% 24%, rgba(64, 196, 255, 0.24), transparent 60%),
  radial-gradient(ellipse 70% 58% at 22% 82%, rgba(232, 84, 184, 0.22), transparent 60%),
  radial-gradient(ellipse 72% 60% at 92% 92%, rgba(86, 111, 255, 0.22), transparent 62%),
  linear-gradient(180deg, #09032f 0%, #060220 58%, #040115 100%)
`;

interface BackgroundGradientGlowProps {
  className?: string;
  backgroundClassName?: string;
  contentClassName?: string;
  children?: ReactNode;
  mode?: "light" | "dark";
  variant?: "light" | "dark";
}

export const Component = ({
  className,
  backgroundClassName,
  contentClassName,
  children,
  mode = "light",
  variant,
}: BackgroundGradientGlowProps) => {
  const [count, setCount] = useState(0);
  void count;
  void setCount;

  return (
    <div className={cn("min-h-screen w-full relative", className)}>
      <div
        className={cn("absolute inset-0 z-0", backgroundClassName)}
        style={{
          background:
            (variant ?? mode) === "light"
              ? LIGHT_AURORA_BACKGROUND
              : DARK_AURORA_BACKGROUND,
        }}
      />
      {children ? (
        <div className={cn("relative z-10", contentClassName)}>{children}</div>
      ) : null}
    </div>
  );
};

export const BackgroundGradientGlow = Component;

export function AuroraThemeBackground({
  mode,
  variant,
  ...props
}: Omit<BackgroundGradientGlowProps, "mode" | "variant"> &
  Partial<Pick<BackgroundGradientGlowProps, "mode" | "variant">>) {
  const resolvedMode = useThemeStore((state) => state.resolvedMode);

  return (
    <Component
      {...props}
      mode={variant ?? mode ?? resolvedMode}
    />
  );
}
