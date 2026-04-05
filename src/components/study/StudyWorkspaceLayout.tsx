import React from "react";
import { cn } from "@/lib/utils";

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
  return (
    <div className="h-screen w-full bg-background text-foreground overflow-hidden flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-50 shrink-0">{header}</div>

      {/* Main Layout */}
      <div className="relative z-10 flex min-h-0 flex-1 gap-1 overflow-hidden p-0 md:gap-3 md:p-2">
        {/* Sidebar - visible from tablet widths upward so iPad gets a real study rail */}
        <aside className="hidden md:flex flex-col w-[76px] shrink-0 bg-black/40 backdrop-blur-xl border border-border rounded-2xl py-5 gap-4 items-center shadow-2xl lg:w-20 lg:py-6">
          {sidebar}
        </aside>

        {/* Content Area - Glass Sheet */}
        <main className="flex min-h-0 flex-1 bg-black/40 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl relative flex-col">
          {/* Content Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

          {/* Top Bar (Workspace Pill) - pinned above scrollable content */}
          {topBar && (
            <div className="relative z-10 shrink-0">{topBar}</div>
          )}

          <div className="relative flex min-h-0 flex-1 overflow-hidden">{content}</div>
        </main>

        {/* Chat Panel - Glass Sheet (Desktop) */}
        <aside className="hidden xl:flex w-[380px] shrink-0 bg-black/40 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl flex-col">
          {chat}
        </aside>
      </div>
    </div>
  );
};
