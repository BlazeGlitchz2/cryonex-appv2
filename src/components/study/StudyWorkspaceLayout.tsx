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
  const showAssistantRail = activeTab !== "summary";

  return (
    <div
      className={cn(
        "cx-study-workspace premium-study-shell flex h-full min-h-0 w-full flex-col overflow-hidden font-sans text-foreground selection:bg-primary/20",
        "bg-transparent",
      )}
    >
      <div
        className={cn(
          "relative z-50 shrink-0 border-b backdrop-blur-2xl",
          "border-border bg-card shadow-sm",
        )}
      >
        {header}
      </div>

      <div
        className={cn(
          "relative z-10 grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-3 md:grid-cols-[232px_minmax(0,1fr)]",
          showAssistantRail && "2xl:grid-cols-[216px_minmax(0,1fr)_360px]",
        )}
      >
        <aside
          className={cn(
            "hidden min-h-0 flex-col overflow-hidden rounded-2xl border backdrop-blur-2xl md:flex",
            "border-border bg-card shadow-sm",
          )}
        >
          {sidebar}
        </aside>

        <section
          aria-label="Study material"
          className={cn(
            "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border backdrop-blur-2xl",
            "border-border bg-card shadow-sm",
          )}
        >
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {topBar && <div className="relative z-20 shrink-0">{topBar}</div>}

            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              {content}
            </div>
          </div>
        </section>

        {showAssistantRail ? (
          <aside
            className={cn(
              "relative hidden min-h-0 flex-col overflow-hidden rounded-2xl border backdrop-blur-2xl 2xl:flex",
              "border-border bg-card shadow-sm",
            )}
          >
            {chat}
          </aside>
        ) : null}
      </div>
    </div>
  );
};
