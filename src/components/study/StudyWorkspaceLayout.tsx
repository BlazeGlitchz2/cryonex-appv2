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

  return (
    <div className="h-screen w-full bg-background text-foreground overflow-hidden flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className={cn(
            "absolute inset-0",
            isLight
              ? "bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.78)_45%,rgba(236,254,255,0.52))]"
              : "bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(8,13,28,0.94)_48%,rgba(4,22,35,0.86))]",
          )}
        />
        <div
          className={cn(
            "absolute inset-0 opacity-[0.32]",
            isLight
              ? "bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:44px_44px]"
              : "bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:48px_48px]",
          )}
        />
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-28",
            isLight
              ? "bg-[linear-gradient(180deg,rgba(14,165,233,0.10),transparent)]"
              : "bg-[linear-gradient(180deg,rgba(34,211,238,0.10),transparent)]",
          )}
        />
      </div>

      {/* Header */}
      <div className="relative z-50 shrink-0">{header}</div>

      {/* Main Layout */}
      <div className="relative z-10 flex min-h-0 flex-1 gap-1 overflow-hidden p-0 md:gap-4 md:p-4">
        {/* Sidebar - visible from tablet widths upward so iPad gets a real study rail */}
        <aside
          className={cn(
            "hidden w-[82px] shrink-0 flex-col items-center gap-3 rounded-[24px] border py-4 lg:w-[88px] lg:py-5 md:flex",
            isLight
              ? "border-slate-200/80 bg-white/80 shadow-[0_18px_36px_rgba(15,23,42,0.06)]"
              : "border-white/[0.04] bg-black/40 shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
          )}
        >
          {sidebar}
        </aside>

        {/* Content Area - Glass Sheet */}
        <main
          className={cn(
            "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border backdrop-blur-2xl",
            isLight
              ? "border-slate-200/80 bg-white/80 shadow-[0_18px_36px_rgba(15,23,42,0.06)]"
              : "border-white/[0.04] bg-black/40 shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
          )}
        >
          {/* Content Glow */}
          <div
            className={cn(
              "absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent to-transparent opacity-80",
              isLight ? "via-slate-300/90" : "via-white/[0.15]",
            )}
          />

          {/* Scrollable wrapper: topBar + content scroll together */}
          <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden custom-scrollbar">
            {/* Top Bar (Focus Shield + Next Steps) - scrolls with content */}
            {topBar && (
              <div className="relative z-20 shrink-0">{topBar}</div>
            )}

            <div className="relative flex min-h-0 flex-1 flex-col">{content}</div>
          </div>
        </main>

        {/* Chat Panel - Glass Sheet (Desktop) */}
        <aside
          className={cn(
            "relative hidden w-[380px] shrink-0 flex-col overflow-hidden rounded-[24px] border xl:flex",
            isLight
              ? "border-slate-200/80 bg-white/78 shadow-[0_18px_36px_rgba(15,23,42,0.06)]"
              : "border-white/[0.04] bg-black/40 shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
          )}
        >
          <div
            className={cn(
              "absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent to-transparent opacity-80",
              isLight ? "via-slate-300/90" : "via-white/[0.15]",
            )}
          />
          {chat}
        </aside>
      </div>
    </div>
  );
};
