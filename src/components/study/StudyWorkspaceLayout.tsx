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
    <div
      data-workspace-tab={activeTab}
      className="flex h-screen w-full flex-col overflow-hidden bg-background font-sans text-foreground selection:bg-sky-500/20"
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className={cn(
            "absolute inset-0",
            isLight
              ? "bg-[linear-gradient(180deg,#f8fafc_0%,#eef4f8_46%,#e7f0ea_100%)]"
              : "bg-[linear-gradient(180deg,#050816_0%,#0b1020_54%,#07151d_100%)]",
          )}
        />
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-px",
            isLight
              ? "bg-slate-200"
              : "bg-white/10",
          )}
        />
      </div>

      <div className="relative z-50 shrink-0">{header}</div>

      <div className="relative z-10 flex min-h-0 flex-1 gap-0 overflow-hidden p-0 md:gap-3 md:p-3">
        <aside
          className={cn(
            "hidden w-[280px] shrink-0 overflow-hidden rounded-[18px] border md:flex",
            isLight
              ? "border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.06)]"
              : "border-white/10 bg-slate-950/78 shadow-[0_18px_44px_rgba(0,0,0,0.36)]",
          )}
        >
          {sidebar}
        </aside>

        <main
          className={cn(
            "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border-0 md:rounded-[18px] md:border",
            isLight
              ? "border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.06)]"
              : "border-white/10 bg-slate-950/74 shadow-[0_18px_44px_rgba(0,0,0,0.36)]",
          )}
        >
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {topBar && <div className="relative z-20 shrink-0">{topBar}</div>}
            <div className="relative flex min-h-0 flex-1 flex-col">{content}</div>
          </div>
        </main>

        <aside
          className={cn(
            "relative hidden w-[392px] shrink-0 flex-col overflow-hidden rounded-[18px] border xl:flex 2xl:w-[420px]",
            isLight
              ? "border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.06)]"
              : "border-white/10 bg-slate-950/78 shadow-[0_18px_44px_rgba(0,0,0,0.36)]",
          )}
        >
          {chat}
        </aside>
      </div>
    </div>
  );
};
