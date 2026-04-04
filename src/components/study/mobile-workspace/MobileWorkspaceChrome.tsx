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
    <div className="space-y-3">
      <header className="sticky top-0 z-40 -mx-3 border-b border-border/70 bg-background/88 px-3 pb-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl sm:-mx-4 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-10 w-10 rounded-full border border-border/70 bg-foreground/[0.04] text-foreground/70 hover:bg-foreground/[0.08] hover:text-foreground"
            aria-label="Back to study dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/38">
              Mobile workspace
            </p>
            <h1 className="truncate text-sm font-semibold tracking-[-0.02em] text-foreground">
              {brief.headline}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-full border border-border/70 bg-foreground/[0.04] px-3 py-1.5 text-[11px] font-medium text-foreground/60 sm:flex">
              <Clock className="h-3 w-3" />
              {studyTimeLabel}
            </div>

            <Button
              type="button"
              size="sm"
              onClick={onOpenAssistant}
              className="h-10 rounded-full bg-primary px-3 text-primary-foreground shadow-[0_16px_35px_rgba(101,69,237,0.25)] hover:bg-primary/90"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{activeToolLabel}</span>
              <span className="sm:hidden">Ask</span>
            </Button>
          </div>
        </div>

        <section className="mt-3 rounded-[28px] border border-border/80 bg-card/90 p-4 shadow-[0_20px_55px_rgba(6,10,20,0.18)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              {brief.focusLabel}
            </span>
            <span className="rounded-full border border-border bg-foreground/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground/58">
              {studyTimeLabel}
            </span>
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-border bg-foreground/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground/54"
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <h2 className="text-[1.45rem] font-semibold leading-tight tracking-[-0.05em] text-foreground">
              {brief.headline}
            </h2>
            <p className="text-sm leading-6 text-foreground/60">
              {brief.subheadline}
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <button
              type="button"
              onClick={onOpenAssistant}
              className="rounded-[22px] border border-border bg-foreground/[0.04] p-4 text-left transition-colors hover:bg-foreground/[0.07]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/38">
                Mobile coach
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {coach.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/58">
                {coach.description}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onSelectTool(brief.recommendedToolId)}
              className="rounded-[22px] border border-primary/20 bg-primary/10 p-4 text-left transition-colors hover:bg-primary/15"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/75">
                Recommended next
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {brief.recommendedToolLabel}
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/58">
                {brief.recommendedToolReason}
              </p>
            </button>
          </div>
        </section>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/38">
              Tool switcher
            </p>
            <p className="text-xs text-foreground/52">
              Flick through tools without losing your place.
            </p>
          </div>

          <Drawer>
            <DrawerTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-full border border-border bg-foreground/[0.04] px-3 text-foreground/72 hover:bg-foreground/[0.08] hover:text-foreground"
              >
                <Menu className="mr-2 h-4 w-4" />
                All tools
              </Button>
            </DrawerTrigger>
            <DrawerContent className="border-border bg-background text-foreground outline-none">
              <DrawerHeader className="space-y-2 pb-3">
                <DrawerTitle>Workspace tools</DrawerTitle>
                <p className="text-sm leading-6 text-foreground/55">
                  {brief.focusLabel} · {activeTool?.label || activeToolLabel}
                </p>
                <p className="text-sm leading-6 text-foreground/58">
                  {coach.prompt}
                </p>
              </DrawerHeader>

              <div className="space-y-4 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={onOpenAssistant}
                    className="h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Open assistant
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onSelectTool(brief.recommendedToolId)}
                    className="h-12 rounded-2xl border-border bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.08]"
                  >
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Open recommended
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {tools.map((tool) => {
                    const isActive = activeTab === tool.id;
                    const isRecommended = brief.recommendedToolId === tool.id;

                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => onSelectTool(tool.id)}
                        className={cn(
                          "rounded-[22px] border p-4 text-left transition-colors",
                          isActive
                            ? "border-primary/30 bg-primary/10"
                            : "border-border bg-foreground/[0.04] hover:bg-foreground/[0.07]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/38">
                              {tool.brief.eyebrow}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                              {tool.label}
                            </p>
                          </div>
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
                              isActive
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-border bg-background/70 text-foreground/72",
                            )}
                          >
                            <tool.icon className="h-4 w-4" />
                          </div>
                        </div>

                        <p className="mt-3 text-[12px] leading-5 text-foreground/60">
                          {tool.brief.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground/55">
                            {tool.brief.metric}
                          </span>
                          {isRecommended ? (
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                              Recommended
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 pr-1 [scrollbar-width:none]">
          {tools.map((tool) => {
            const isActive = activeTab === tool.id;
            const isRecommended = brief.recommendedToolId === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onSelectTool(tool.id)}
                className={cn(
                  "inline-flex min-w-[10.5rem] flex-1 items-center gap-3 rounded-[22px] border px-3 py-3 text-left transition-all duration-200",
                  isActive
                    ? "border-primary/30 bg-primary/10 shadow-[0_14px_30px_rgba(101,69,237,0.12)]"
                    : "border-border bg-foreground/[0.04] hover:bg-foreground/[0.07]",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
                    isActive
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-background/70 text-foreground/72",
                  )}
                >
                  <tool.icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {tool.label}
                    </span>
                    {isRecommended ? (
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary/75">
                        Next
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-foreground/52">
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
    <div className="space-y-3">
      <div className="sticky top-0 z-40 -mx-3 border-b border-border/70 bg-background/88 px-3 pb-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl sm:-mx-4 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="h-10 w-10 rounded-full border border-border/70 bg-foreground/[0.05]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-28 rounded-full bg-foreground/[0.07]" />
            <div className="h-4 w-40 rounded-full bg-foreground/[0.08]" />
          </div>
          <div className="h-10 w-24 rounded-full bg-foreground/[0.08]" />
        </div>

        <div className="mt-3 rounded-[28px] border border-border/80 bg-card/90 p-4">
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-24 rounded-full bg-foreground/[0.06]" />
            <div className="h-6 w-20 rounded-full bg-foreground/[0.05]" />
            <div className="h-6 w-16 rounded-full bg-foreground/[0.05]" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="h-6 w-11/12 rounded-full bg-foreground/[0.08]" />
            <div className="h-4 w-full rounded-full bg-foreground/[0.06]" />
            <div className="h-4 w-5/6 rounded-full bg-foreground/[0.06]" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="h-24 rounded-[22px] bg-foreground/[0.05]" />
            <div className="h-24 rounded-[22px] bg-foreground/[0.05]" />
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-full bg-foreground/[0.06]" />
            <div className="h-3 w-44 rounded-full bg-foreground/[0.05]" />
          </div>
          <div className="h-10 w-28 rounded-full bg-foreground/[0.06]" />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 pr-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`mobile-workspace-skeleton-${index}`}
              className="h-[3.75rem] min-w-[10.5rem] flex-1 rounded-[22px] bg-foreground/[0.05]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
