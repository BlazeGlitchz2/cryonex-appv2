import { useDeviceInfo } from "@/hooks/use-mobile";
import {
  getPlatformDescriptor,
  resolvePlatformFlavor,
} from "@/lib/platform-flavor";
import {
  IconBrain,
  IconData,
  IconFile,
  IconImage,
} from "@/components/ui/icons/Web3Icons";
import { useThemeStore } from "@/lib/stores/theme-store";
import { cn } from "@/lib/utils";

const promptIcons = [IconImage, IconFile, IconData, IconBrain];

export function ChatEmptyState({
  project,
  onSend,
}: {
  project: { name?: string } | null | undefined;
  onSend: (text: string) => void;
}) {
  const mode = useThemeStore((state) => state.mode);
  const deviceInfo = useDeviceInfo();
  const isLight = mode === "light";
  const platformFlavor = resolvePlatformFlavor(deviceInfo);
  const platformDescriptor = getPlatformDescriptor(platformFlavor, deviceInfo);
  const prefersLeftAlignedShell = platformFlavor === "android";
  const promptActions = platformDescriptor.quickPrompts.map((item, index) => ({
    ...item,
    icon: promptIcons[index % promptIcons.length],
  }));

  return (
    <div
      className={cn(
        "flex w-full flex-col justify-center px-4 text-left md:px-0",
        prefersLeftAlignedShell
          ? "max-w-[46rem] items-start"
          : "max-w-[38rem] items-start md:max-w-[56rem] md:items-center md:text-center",
      )}
    >
      <div
        className={cn(
          "hidden sm:inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]",
          isLight
            ? "border-border/50 bg-background/50 text-muted-foreground"
            : platformFlavor === "android"
              ? "border-emerald-300/16 bg-emerald-400/10 text-emerald-100/80"
              : platformFlavor === "ios"
                ? "border-sky-300/16 bg-sky-400/10 text-sky-100/80"
                : "border-white/[0.06] bg-white/[0.04] text-white/56 gradient-border",
        )}
      >
        {platformDescriptor.workspaceBadge}
      </div>

      <div className="mt-5 space-y-4 md:mt-6 md:space-y-4">
        <h1
          className={cn(
            "max-w-[14ch] font-semibold leading-[1.02] tracking-[-0.05em] md:max-w-none md:leading-[1.04]",
            deviceInfo.isPhone
              ? "text-[clamp(1.75rem,8.5vw,2.5rem)]"
              : "text-[clamp(2.1rem,10vw,4.35rem)]",
            isLight ? "text-foreground" : "text-white",
            prefersLeftAlignedShell && "max-w-[18ch]",
          )}
        >
          {project ? project.name : platformDescriptor.workspaceTitle}
        </h1>
        <p
          className={cn(
            "max-w-[30rem] text-sm leading-7 sm:text-base md:max-w-[40rem] md:text-[1.02rem] md:leading-8",
            isLight ? "text-muted-foreground" : "text-white/65",
          )}
        >
          {project
            ? "Ask for a clearer explanation, a sharper study plan, or a review set built from this workspace."
            : platformDescriptor.workspaceBody}
        </p>
      </div>

      <div
        className={cn(
          "mt-8 flex w-full max-w-4xl flex-wrap items-center justify-start gap-2.5 md:mt-7 md:gap-3",
          prefersLeftAlignedShell ? "md:justify-start" : "md:justify-center",
        )}
      >
        {promptActions.map((item) => (
          <button
            key={item.label}
            onClick={() => onSend(item.prompt)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors",
              isLight
                ? "border-border/50 bg-background/50 text-foreground hover:bg-background"
                : platformFlavor === "android"
                  ? "border-emerald-300/16 bg-emerald-400/10 text-white/84 hover:bg-emerald-400/16 hover:text-white"
                  : platformFlavor === "ios"
                    ? "border-sky-300/16 bg-sky-400/10 text-white/84 hover:bg-sky-400/16 hover:text-white"
                    : "border-white/[0.06] bg-white/[0.03] text-white/72 hover:bg-white/[0.08] hover:text-white gradient-border",
            )}
          >
            <item.icon
              className={cn(
                "h-4 w-4",
                isLight ? "text-muted-foreground" : "text-white/58",
              )}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
