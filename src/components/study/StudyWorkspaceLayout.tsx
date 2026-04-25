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
      className={cn(
        "flex h-screen w-full flex-col overflow-hidden font-sans text-foreground selection:bg-cyan-500/20",
        isLight
          ? "bg-[#f5f7fb]"
          : "bg-[#080b10]",
      )}
    >
      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-0",
          isLight
            ? "bg-[linear-gradient(to_right,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:44px_44px]"
            : "bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.026)_1px,transparent_1px)] bg-[size:44px_44px]",
        )}
      />

      <div
        className={cn(
          "relative z-50 shrink-0 border-b",
          isLight
            ? "border-slate-200 bg-white/92 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
            : "border-white/10 bg-[#0d1117]/92",
        )}
      >
        {header}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 gap-2 overflow-hidden p-2 md:gap-3 md:p-3">
        <aside
          className={cn(
            "hidden w-[72px] shrink-0 flex-col items-center gap-3 rounded-lg border py-4 md:flex",
            isLight
              ? "border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)]"
              : "border-white/10 bg-[#0d1117] shadow-[0_20px_50px_rgba(0,0,0,0.35)]",
          )}
        >
          {sidebar}
        </aside>

        <main
          className={cn(
            "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border",
            isLight
              ? "border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.07)]"
              : "border-white/10 bg-[#0d1117] shadow-[0_24px_56px_rgba(0,0,0,0.42)]",
          )}
        >
          <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden custom-scrollbar">
            {topBar && (
              <div className="relative z-20 shrink-0">{topBar}</div>
            )}

            <div className="relative flex min-h-0 flex-1 flex-col">{content}</div>
          </div>
        </main>

        <aside
          className={cn(
            "relative hidden w-[380px] shrink-0 flex-col overflow-hidden rounded-lg border xl:flex",
            isLight
              ? "border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.06)]"
              : "border-white/10 bg-[#0d1117] shadow-[0_24px_56px_rgba(0,0,0,0.38)]",
          )}
        >
          {chat}
        </aside>
      </div>
    </div>
  );
};
