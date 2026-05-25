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
  const promptActions = platformDescriptor.quickPrompts
    .slice(0, 2)
    .map((item, index) => ({
      ...item,
      icon: promptIcons[index % promptIcons.length],
    }));

  return (
    <div
      className={cn(
        "flex w-full flex-col justify-center px-4 text-left md:px-0",
        prefersLeftAlignedShell
          ? "max-w-[46rem] items-start"
          : "max-w-[36rem] items-start md:max-w-[58rem] md:items-stretch",
      )}
    >
      <div className="grid w-full gap-6 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
        <div>
          <div
            className={cn(
              "hidden w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] sm:inline-flex",
              isLight
                ? "border-border/50 bg-background/50 text-muted-foreground"
                : platformFlavor === "android"
                  ? "border-emerald-300/16 bg-emerald-400/10 text-emerald-100/80"
                  : platformFlavor === "ios"
                    ? "border-sky-300/16 bg-sky-400/10 text-sky-100/80"
                    : "border-orange-200/14 bg-orange-300/[0.06] text-orange-100/72",
            )}
          >
            {platformDescriptor.workspaceBadge}
          </div>

          <div className="mt-5 space-y-3 md:mt-6">
            <h1
              className={cn(
                "max-w-[14ch] font-semibold leading-[1.02] tracking-[-0.05em] md:max-w-[12ch] md:leading-[1.04]",
                deviceInfo.isPhone
                  ? "text-[clamp(1.75rem,8.5vw,2.5rem)]"
                  : "text-[clamp(2.1rem,8vw,4rem)]",
                isLight ? "text-foreground" : "text-white",
                prefersLeftAlignedShell && "max-w-[18ch]",
              )}
            >
              {project ? project.name : platformDescriptor.workspaceTitle}
            </h1>
            <p
              className={cn(
                "max-w-[30rem] text-sm leading-7 sm:text-base md:max-w-[34rem] md:text-[1rem] md:leading-7",
                isLight ? "text-muted-foreground" : "text-white/68",
              )}
            >
              {project
                ? "Ask for a clearer explanation, a sharper study plan, or a review set built from this workspace."
                : `${platformDescriptor.workspaceBody} Start with one source or one focused question.`}
            </p>
          </div>

          <div
            className={cn(
              "mt-7 flex w-full max-w-3xl flex-wrap items-center justify-start gap-2.5 md:gap-3",
              prefersLeftAlignedShell ? "md:justify-start" : "md:justify-start",
            )}
          >
            {promptActions.map((item, index) => (
              <button
                key={item.label}
                onClick={() => onSend(item.prompt)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-all active:scale-[0.98]",
                  index === 0 && !isLight
                    ? "tactile-button"
                    : isLight
                      ? "border-border/50 bg-background/50 text-foreground hover:bg-background"
                      : platformFlavor === "android"
                        ? "border-emerald-300/16 bg-emerald-400/10 text-white/84 hover:bg-emerald-400/16 hover:text-white"
                        : platformFlavor === "ios"
                          ? "border-sky-300/16 bg-sky-400/10 text-white/84 hover:bg-sky-400/16 hover:text-white"
                          : "border-white/[0.08] bg-white/[0.04] text-white/78 hover:bg-white/[0.08] hover:text-white",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    index === 0 && !isLight
                      ? "text-black/70"
                      : isLight
                        ? "text-muted-foreground"
                        : "text-white/58",
                  )}
                />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {!isLight ? (
          <div className="cyber-tactile-card hidden min-h-[260px] rounded-[30px] p-5 md:block">
            <div className="relative flex h-full min-h-[220px] items-center justify-center">
              <div className="cyber-orb h-32 w-32" />
              <div className="absolute left-3 top-5 rounded-full border border-white/10 bg-black/28 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/52">
                Source
              </div>
              <div className="absolute bottom-4 right-2 rounded-full border border-cyan-200/12 bg-cyan-300/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70">
                Coach
              </div>
              <div className="absolute right-7 top-7 h-8 w-8 rounded-full bg-[linear-gradient(180deg,#ffe2ad,#ff7a1f)] shadow-[0_10px_28px_rgba(255,122,31,0.28)]" />
              <div className="absolute bottom-12 left-8 h-6 w-6 rounded-full bg-[linear-gradient(180deg,#7dd3fc,#d946ef)] shadow-[0_10px_28px_rgba(217,70,239,0.22)]" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
