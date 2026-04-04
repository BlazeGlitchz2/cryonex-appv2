import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Clock,
  ChevronRight,
  Menu,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export interface MobileWorkspaceToolBrief {
  eyebrow: string;
  description: string;
  metric: string;
}

export interface MobileWorkspaceToolSpec {
  id: string;
  label: string;
  icon: LucideIcon;
  brief: MobileWorkspaceToolBrief;
}

export interface MobileWorkspaceBrief {
  headline: string;
  subheadline: string;
  focusLabel: string;
  recommendedToolId: string;
  recommendedToolLabel: string;
  recommendedToolReason: string;
  badges: string[];
}

export interface MobileWorkspaceCoach {
  title: string;
  description: string;
  prompt: string;
}

interface MobileWorkspaceChromeProps {
  activeTab: string;
  activeToolLabel: string;
  badges?: string[];
  brief: MobileWorkspaceBrief;
  coach: MobileWorkspaceCoach;
  onBack: () => void;
  onOpenAssistant: () => void;
  onSelectTool: (toolId: string) => void;
  studyTimeLabel: string;
  tools: MobileWorkspaceToolSpec[];
}

export function MobileWorkspaceChrome({
  activeTab,
  activeToolLabel,
  badges = [],
  brief,
  coach,
  onBack,
  onOpenAssistant,
  onSelectTool,
  studyTimeLabel,
  tools,
}: MobileWorkspaceChromeProps) {
  const activeTool =
    tools.find((tool) => tool.id === activeTab) ?? tools[0] ?? null;

  return (
    <div className="space-y-0">
      <header className="z-40 border-b border-white/[0.06] bg-background/60 px-3 pb-3 pt-[env(safe-area-inset-top)] backdrop-blur-3xl sm:px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-10 w-10 rounded-full border border-white/[0.08] bg-white/[0.03] text-foreground/70 hover:bg-white/[0.08] hover:text-foreground"
            aria-label="Back to study dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-400/80">
              Personal Workspace
            </p>
            <h1 className="truncate text-sm font-bold tracking-tight text-foreground">
              {brief.headline}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-bold text-foreground/60 sm:flex">
              <Clock className="h-3 w-3 text-cyan-400" />
              {studyTimeLabel}
            </div>

            <Button
              type="button"
              size="sm"
              onClick={onOpenAssistant}
              className="h-9 rounded-full bg-cyan-600 px-4 text-xs font-bold text-white shadow-[0_8px_20px_rgba(8,145,178,0.3)] hover:bg-cyan-700"
            >
              <MessageSquare className="mr-2 h-3.5 w-3.5" />
              <span>Ask AI</span>
            </Button>
          </div>
        </div>

        <section className="mt-3 rounded-[28px] border border-white/[0.1] bg-white/[0.03] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.15)] ring-1 ring-inset ring-white/[0.05]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              {brief.focusLabel}
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
              {studyTimeLabel}
            </span>
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/50"
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <h2 className="text-xl font-bold leading-tight tracking-tight text-foreground">
              {brief.headline}
            </h2>
            <p className="text-[13px] leading-relaxed text-foreground/50">
              {brief.subheadline}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenAssistant}
              className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition-all hover:bg-white/[0.06] active:scale-[0.98]"
            >
              <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/30">
                AI Coach
              </p>
              <p className="mt-2 text-xs font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                {coach.title}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-foreground/40">
                {coach.description}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onSelectTool(brief.recommendedToolId)}
              className="group relative rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-left transition-all hover:bg-cyan-500/10 active:scale-[0.98]"
            >
               <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <p className="text-[9px] font-bold uppercase tracking-widest text-cyan-500/60">
                Next Step
              </p>
              <p className="mt-2 text-xs font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                {brief.recommendedToolLabel}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-foreground/40">
                {brief.recommendedToolReason}
              </p>
            </button>
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
              Workspace Tools
            </p>
          </div>

          <Drawer>
            <DrawerTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-8 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 text-[11px] font-bold text-foreground/70 active:scale-95 transition-all"
              >
                <Menu className="mr-2 h-3.5 w-3.5" />
                Switcher
              </Button>
            </DrawerTrigger>
            <DrawerContent className="border-white/[0.08] bg-[#0a0625]/95 text-foreground backdrop-blur-2xl outline-none">
              <DrawerHeader className="space-y-1 pb-4">
                <DrawerTitle className="text-xl font-bold tracking-tight">Select Studio Tool</DrawerTitle>
                <p className="text-xs font-semibold text-cyan-400/70">
                  {brief.focusLabel} · {activeTool?.label || activeToolLabel}
                </p>
              </DrawerHeader>

              <div className="max-h-[70vh] overflow-y-auto px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] custom-scrollbar">
                <div className="grid grid-cols-2 gap-3 pb-4">
                  {tools.map((tool) => {
                    const isActive = activeTab === tool.id;
                    const isRecommended = brief.recommendedToolId === tool.id;

                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                           onSelectTool(tool.id);
                           const closeBtn = document.querySelector('[data-drawer-close]') as HTMLButtonElement;
                           if (closeBtn) closeBtn.click();
                        }}
                        className={cn(
                          "group relative rounded-[24px] border p-4 text-left transition-all duration-200 active:scale-[0.96]",
                          isActive
                            ? "border-cyan-500/30 bg-cyan-500/10"
                            : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[9px] font-bold uppercase tracking-widest text-foreground/30">
                              {tool.brief.eyebrow}
                            </p>
                            <p className="mt-1 truncate text-xs font-bold text-foreground">
                              {tool.label}
                            </p>
                          </div>
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors",
                              isActive
                                ? "border-cyan-500/30 bg-cyan-500 text-white"
                                : "border-white/[0.08] bg-background/70 text-foreground/50 group-hover:text-foreground",
                            )}
                          >
                            <tool.icon className="h-4 w-4" />
                          </div>
                        </div>

                        <p className="mt-3 line-clamp-2 text-[10px] leading-relaxed text-foreground/40">
                          {tool.brief.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-2">
                           <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[8px] font-bold uppercase tracking-tighter text-foreground/40">
                             {tool.brief.metric}
                           </span>
                           {isRecommended && (
                             <span className="text-[8px] font-bold uppercase tracking-tighter text-cyan-500">
                               Next
                             </span>
                           )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 pr-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
          {tools.map((tool) => {
            const isActive = activeTab === tool.id;
            const isRecommended = brief.recommendedToolId === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onSelectTool(tool.id)}
                className={cn(
                  "inline-flex min-w-[9.5rem] flex-1 items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all duration-200 active:scale-95",
                  isActive
                    ? "border-cyan-500/30 bg-cyan-500/10 shadow-[0_10px_25px_rgba(8,145,178,0.15)]"
                    : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
                    isActive
                      ? "border-cyan-500/30 bg-cyan-500 text-white"
                      : "border-white/[0.08] bg-background/50 text-foreground/40",
                  )}
                >
                  <tool.icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "truncate text-[13px] font-bold tracking-tight transition-colors",
                      isActive ? "text-foreground" : "text-foreground/60"
                    )}>
                      {tool.label}
                    </span>
                    {isRecommended && (
                       <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(8,145,178,0.6)]" />
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[10px] font-medium text-foreground/30">
                    {tool.brief.metric}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </header>
    </div>
  );
}

export function MobileWorkspaceChromeSkeleton() {
  return (
    <div className="space-y-0">
      <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/60 px-3 pb-3 pt-[env(safe-area-inset-top)] backdrop-blur-3xl sm:px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <div className="h-10 w-10 rounded-full bg-white/[0.05]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-28 rounded-full bg-white/[0.07]" />
            <div className="h-4 w-40 rounded-full bg-white/[0.08]" />
          </div>
          <div className="h-9 w-24 rounded-full bg-white/[0.08]" />
        </div>

        <div className="mt-3 rounded-[28px] border border-white/[0.1] bg-white/[0.03] p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <div className="h-5 w-24 rounded-full bg-white/[0.06]" />
            <div className="h-5 w-20 rounded-full bg-white/[0.05]" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="h-6 w-11/12 rounded-full bg-white/[0.08]" />
            <div className="h-4 w-full rounded-full bg-white/[0.06]" />
            <div className="h-4 w-5/6 rounded-full bg-white/[0.06]" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-24 rounded-2xl bg-white/[0.05]" />
            <div className="h-24 rounded-2xl bg-white/[0.05]" />
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-full bg-white/[0.06]" />
          </div>
          <div className="h-8 w-28 rounded-full bg-white/[0.06]" />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 pr-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`mobile-workspace-skeleton-${index}`}
              className="h-[3.5rem] min-w-[9.5rem] flex-1 rounded-2xl bg-white/[0.05]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
