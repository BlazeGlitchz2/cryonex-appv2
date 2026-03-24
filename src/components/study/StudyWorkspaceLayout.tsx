import React from "react";
import { cn } from "@/lib/utils";

interface StudyWorkspaceLayoutProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  content: React.ReactNode;
  chat: React.ReactNode;
  activeTab: string;
}

export const StudyWorkspaceLayout = ({
  header,
  sidebar,
  content,
  chat,
  activeTab,
}: StudyWorkspaceLayoutProps) => {
  return (
    <div className="h-screen w-full bg-[#030014] text-white overflow-hidden flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-50 shrink-0">{header}</div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10 p-4 gap-4">
        {/* Sidebar - Floating Glass Dock */}
        <aside className="hidden lg:flex flex-col w-20 shrink-0 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl py-6 gap-4 items-center shadow-2xl">
          {sidebar}
        </aside>

        {/* Content Area - Glass Sheet */}
        <main className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
          {/* Content Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />

          <div className="flex-1 overflow-hidden relative">{content}</div>
        </main>

        {/* Chat Panel - Glass Sheet (Desktop) */}
        <aside className="hidden lg:flex w-[400px] shrink-0 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex-col">
          {chat}
        </aside>
      </div>
    </div>
  );
};
