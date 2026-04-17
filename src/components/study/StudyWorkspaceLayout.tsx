import React from "react";

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
}: StudyWorkspaceLayoutProps) => {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.10),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900 selection:bg-sky-200/70">
      <div className="relative z-30 shrink-0">{header}</div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2 md:px-4 md:pb-4">
        {topBar ? <div className="shrink-0">{topBar}</div> : null}

        <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
          <aside className="hidden min-h-0 overflow-hidden rounded-[30px] border border-slate-200/80 bg-[#f8fafc]/95 shadow-[0_24px_80px_rgba(15,23,42,0.08)] xl:block">
            {sidebar}
          </aside>

          <main className="min-h-0 overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/95 shadow-[0_30px_100px_rgba(15,23,42,0.10)]">
            {content}
          </main>

          <aside className="hidden min-h-0 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.08)] xl:block">
            {chat}
          </aside>
        </div>
      </div>
    </div>
  );
};
