import React from "react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/theme-store";

interface StudyWorkspaceLayoutProps {
  header: React.ReactNode;
  topBar?: React.ReactNode;
  sidebar: React.ReactNode;
  content: React.ReactNode;
  chat: React.ReactNode;
  activeTab: string;
}

export const StudyWorkspaceLayout = ({
  header,
  topBar,
  sidebar,
  content,
  chat,
  activeTab,
}: StudyWorkspaceLayoutProps) => {
  const mode = useThemeStore((state) => state.mode);
  const isLight = mode === "light";
  const showAssistantRail = activeTab !== "summary";

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden font-sans text-foreground selection:bg-cyan-500/20",
        isLight
          ? "bg-[#eef5fb]"
          : "bg-[#060914]",
      )}
    >
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_0%,rgba(6,182,212,0.16),transparent_26%),radial-gradient(circle_at_90%_8%,rgba(16,185,129,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,246,255,0.86))] dark:bg-[radial-gradient(circle_at_14%_0%,rgba(34,211,238,0.1),transparent_26%),radial-gradient(circle_at_88%_8%,rgba(16,185,129,0.08),transparent_24%),linear-gradient(180deg,#0a1020,#060914)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:42px_42px] opacity-45 dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] dark:opacity-35" />

      <div
        className={cn(
          "relative z-50 shrink-0 border-b backdrop-blur-2xl",
          isLight
            ? "border-slate-200/80 bg-white/86 shadow-[0_1px_0_rgba(15,23,42,0.04),0_18px_44px_rgba(15,23,42,0.05)]"
            : "border-white/10 bg-[#0b1020]/82 shadow-[0_18px_44px_rgba(0,0,0,0.24)]",
        )}
      >
        {header}
      </div>

      <div className={cn(
        "relative z-10 grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-3 md:grid-cols-[216px_minmax(0,1fr)]",
        showAssistantRail && "2xl:grid-cols-[216px_minmax(0,1fr)_360px]",
      )}>
        <aside
          className={cn(
            "hidden min-h-0 flex-col overflow-hidden rounded-2xl border backdrop-blur-2xl md:flex",
            isLight
              ? "border-slate-200/80 bg-white/88 shadow-[0_18px_46px_rgba(15,23,42,0.08)]"
              : "border-white/10 bg-[#0b1020]/88 shadow-[0_24px_56px_rgba(0,0,0,0.42)]",
          )}
        >
          {sidebar}
        </aside>

        <main
          className={cn(
            "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border backdrop-blur-2xl",
            isLight
              ? "border-slate-200/80 bg-white/92 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
              : "border-white/10 bg-[#0b1020]/92 shadow-[0_24px_60px_rgba(0,0,0,0.46)]",
          )}
        >
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {topBar && (
              <div className="relative z-20 shrink-0">{topBar}</div>
            )}

            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">{content}</div>
          </div>
        </main>

        {showAssistantRail ? (
          <aside
            className={cn(
              "relative hidden min-h-0 flex-col overflow-hidden rounded-2xl border backdrop-blur-2xl 2xl:flex",
              isLight
                ? "border-slate-200/80 bg-white/90 shadow-[0_18px_46px_rgba(15,23,42,0.07)]"
                : "border-white/10 bg-[#0b1020]/90 shadow-[0_24px_56px_rgba(0,0,0,0.42)]",
            )}
          >
            {chat}
          </aside>
        ) : null}
      </div>
    </div>
  );
};
