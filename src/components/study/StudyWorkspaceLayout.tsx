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
            "absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full blur-[120px]",
            isLight ? "bg-sky-200/50" : "bg-blue-900/20",
          )}
        />
        <div
          className={cn(
            "absolute bottom-[-20%] right-[-10%] h-[50%] w-[50%] rounded-full blur-[120px]",
            isLight ? "bg-cyan-100/60" : "bg-cyan-900/20",
          )}
        />
        <div
          className={cn(
            "absolute top-[20%] right-[20%] h-[30%] w-[30%] rounded-full blur-[100px]",
            isLight ? "bg-slate-200/50" : "bg-blue-900/10",
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
            "hidden w-[76px] shrink-0 flex-col items-center gap-4 rounded-[24px] border py-5 lg:w-20 lg:py-6 md:flex",
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

          {/* Top Bar (Workspace Pill) - pinned above scrollable content */}
          {topBar && (
            <div className="relative z-10 shrink-0">{topBar}</div>
          )}

          <div className="relative flex min-h-0 flex-1 overflow-hidden">{content}</div>
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
