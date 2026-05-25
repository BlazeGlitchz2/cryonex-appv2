import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Clock,
  Menu,
  MessageSquare,
  Moon,
  Sparkles,
  Sun,
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
import { useThemeStore } from "@/lib/stores/theme-store";
import { useAppLocale } from "@/hooks/use-app-locale";

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
  const { mode, toggleMode } = useThemeStore();
  const { isRTL, language } = useAppLocale();
  const isLight = mode === "light";
  const [isToolDrawerOpen, setIsToolDrawerOpen] = useState(false);
  const activeTool =
    tools.find((tool) => tool.id === activeTab) ?? tools[0] ?? null;
  const visibleBadges = badges.slice(0, 2);
  const isImmersiveTool = ["summary", "chat", "flashcards", "quizzes"].includes(
    activeTab,
  );
  const isArabic = isRTL || language === "ar";
  const copy = isArabic
    ? {
        workspace: "مساحة الدراسة",
        coach: "المدرب",
        tools: "الأدوات",
        selectTool: "اختر أداة الدراسة",
        session: "الجلسة",
        next: "التالي",
        open: "افتح",
      }
    : {
        workspace: "Personal Workspace",
        coach: "Coach",
        tools: "Tools",
        selectTool: "Select Study Tool",
        session: "Session",
        next: "Next",
        open: "Open",
      };

  return (
    <div className="space-y-0" dir={isRTL ? "rtl" : "ltr"}>
      <header
        className={cn(
          "z-40 border-b px-3 pb-2 pt-[env(safe-area-inset-top)] backdrop-blur-3xl sm:px-4 transition-colors duration-500",
          isLight
            ? "border-primary/10 bg-white/60"
            : "border-white/[0.06] bg-background/60",
        )}
      >
        <div className="flex min-h-14 items-center justify-between gap-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className={cn(
              "h-11 w-11 rounded-lg border transition-all active:scale-95",
              isLight
                ? "border-primary/10 bg-white/60 text-primary hover:bg-white/80"
                : "border-white/[0.08] bg-white/[0.03] text-foreground/70 hover:bg-white/[0.08] hover:text-foreground",
            )}
            aria-label="Back to study dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-400/80">
              {copy.workspace}
            </p>
            <h1 className="truncate text-[15px] font-bold tracking-[-0.03em] text-foreground">
              {activeTool?.label || activeToolLabel}
            </h1>
            {!isImmersiveTool ? (
              <p className="truncate text-[11px] text-foreground/45">
                {brief.headline}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "hidden items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold sm:flex",
                isLight
                  ? "border-primary/10 bg-primary/5 text-primary/70"
                  : "border-white/[0.08] bg-white/[0.03] text-foreground/60",
              )}
            >
              <Clock className="h-3 w-3 text-cyan-400" />
              {studyTimeLabel}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleMode}
              className={cn(
                "h-10 w-10 rounded-lg border transition-all active:scale-95",
                isLight
                  ? "border-primary/10 bg-white/60 text-primary hover:bg-white/80"
                  : "border-white/[0.08] bg-white/[0.03] text-foreground/70 hover:bg-white/[0.08] hover:text-foreground",
              )}
              aria-label="Toggle light or dark mode"
            >
              {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onOpenAssistant}
              className={cn(
                "h-10 rounded-lg px-4 text-xs font-bold text-white shadow-lg transition-all active:scale-95",
                isLight
                  ? "bg-primary shadow-primary/20 hover:bg-primary/90"
                  : "bg-cyan-600 shadow-cyan-600/30 hover:bg-cyan-700",
              )}
            >
              <MessageSquare className="mr-2 h-3.5 w-3.5" />
              <span>{copy.coach}</span>
            </Button>
          </div>
        </div>

        <div
          className={cn(
            isImmersiveTool
              ? "mt-2"
              : "mobile-premium-surface mt-3 rounded-lg px-3 py-3 ring-1 ring-inset",
            !isImmersiveTool &&
              (isLight
                ? "border-primary/10 bg-white/60 ring-primary/5"
                : "border-white/[0.1] bg-white/[0.03] ring-white/[0.05]"),
          )}
        >
          {!isImmersiveTool ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                        isLight
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
                      )}
                    >
                      {brief.focusLabel}
                    </span>
                    {visibleBadges.map((badge) => (
                      <span
                        key={badge}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                          isLight
                            ? "border-primary/10 bg-primary/5 text-primary/55"
                            : "border-white/[0.08] bg-white/[0.04] text-foreground/50",
                        )}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-foreground/78">
                    {brief.subheadline}
                  </p>
                </div>

                <div
                  className={cn(
                    "shrink-0 rounded-lg border px-3 py-2 text-right",
                    isLight
                      ? "border-primary/10 bg-primary/5"
                      : "border-white/[0.08] bg-white/[0.03]",
                  )}
                >
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-foreground/35">
                    {copy.session}
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {studyTimeLabel}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-semibold",
                    isLight
                      ? "border-primary/15 bg-primary/5 text-primary/80"
                      : "border-white/[0.08] bg-white/[0.03] text-foreground/70",
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  {copy.next}: {brief.recommendedToolLabel}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectTool(brief.recommendedToolId)}
                  className={cn(
                    "shrink-0 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all active:scale-[0.98]",
                    isLight
                      ? "border-primary/15 bg-primary/5 text-primary hover:bg-primary/10"
                      : "border-cyan-500/20 bg-cyan-500/5 text-cyan-300 hover:bg-cyan-500/10",
                  )}
                >
                  {copy.open} {brief.recommendedToolLabel}
                </button>
                <button
                  type="button"
                  onClick={onOpenAssistant}
                  className={cn(
                    "shrink-0 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all active:scale-[0.98]",
                    isLight
                      ? "border-primary/10 bg-white/70 text-foreground/70 hover:bg-white"
                      : "border-white/[0.08] bg-white/[0.03] text-foreground/70 hover:bg-white/[0.08]",
                  )}
                >
                  {isArabic ? copy.coach : coach.title}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]",
                    isLight
                      ? "border-primary/15 bg-primary/5 text-primary/80"
                      : "border-cyan-500/20 bg-cyan-500/5 text-cyan-300",
                  )}
                >
                  {brief.focusLabel}
                </span>
                {visibleBadges.map((badge) => (
                  <span
                    key={badge}
                    className={cn(
                      "shrink-0 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      isLight
                        ? "border-primary/10 bg-white/70 text-foreground/55"
                        : "border-white/[0.08] bg-white/[0.03] text-foreground/55",
                    )}
                  >
                    {badge}
                  </span>
                ))}
                <span
                  className={cn(
                    "shrink-0 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
                    isLight
                      ? "border-primary/10 bg-primary/5 text-primary/70"
                      : "border-white/[0.08] bg-white/[0.03] text-foreground/65",
                  )}
                  dir="ltr"
                >
                  {studyTimeLabel}
                </span>
              </div>
              <Drawer
                open={isToolDrawerOpen}
                onOpenChange={setIsToolDrawerOpen}
              >
                <DrawerTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all active:scale-[0.98]",
                      isLight
                        ? "border-primary/10 bg-white/80 text-foreground/70 hover:bg-white"
                        : "border-white/[0.08] bg-white/[0.03] text-foreground/70 hover:bg-white/[0.08]",
                    )}
                  >
                    <Menu className="h-3.5 w-3.5" />
                    {copy.tools}
                  </button>
                </DrawerTrigger>
                <DrawerContent
                  className={cn(
                    "border-t outline-none text-foreground backdrop-blur-2xl transition-colors duration-500",
                    isLight
                      ? "border-primary/10 bg-white/95"
                      : "border-white/[0.08] bg-[#0d1117]/95",
                  )}
                >
                  <DrawerHeader className="space-y-1 pb-4">
                    <DrawerTitle className="text-xl font-bold tracking-tight">
                      {copy.selectTool}
                    </DrawerTitle>
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        isLight ? "text-primary/60" : "text-cyan-400/70",
                      )}
                    >
                      {brief.focusLabel} ·{" "}
                      {activeTool?.label || activeToolLabel}
                    </p>
                  </DrawerHeader>

                  <div className="max-h-[70vh] overflow-y-auto px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3 pb-4">
                      {tools.map((tool) => {
                        const isActive = activeTab === tool.id;
                        const isRecommended =
                          brief.recommendedToolId === tool.id;

                        return (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => {
                              onSelectTool(tool.id);
                              setIsToolDrawerOpen(false);
                            }}
                            className={cn(
                              "group relative rounded-lg border p-4 text-left transition-all duration-200 active:scale-[0.96]",
                              isActive
                                ? isLight
                                  ? "border-primary/20 bg-primary/10"
                                  : "border-cyan-500/30 bg-cyan-500/10"
                                : isLight
                                  ? "border-primary/5 bg-primary/[0.02] hover:bg-primary/[0.04]"
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
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
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
                              <span className="rounded-lg bg-white/[0.04] px-2 py-0.5 text-[8px] font-bold uppercase tracking-tighter text-foreground/40">
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
          )}
        </div>

        {!isImmersiveTool ? (
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
                    "inline-flex min-w-max items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-all duration-200 active:scale-95",
                    isActive
                      ? isLight
                        ? "border-primary/30 bg-primary/20 shadow-lg shadow-primary/5"
                        : "border-cyan-500/30 bg-cyan-500/10 shadow-[0_10px_25px_rgba(8,145,178,0.15)]"
                      : isLight
                        ? "border-primary/10 bg-primary/[0.02] hover:bg-primary/[0.05]"
                        : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
                      isActive
                        ? "border-cyan-500/30 bg-cyan-500 text-white"
                        : "border-white/[0.08] bg-background/50 text-foreground/40",
                    )}
                  >
                    <tool.icon className="h-3.5 w-3.5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "truncate text-[12px] font-bold tracking-tight transition-colors",
                          isActive ? "text-foreground" : "text-foreground/60",
                        )}
                      >
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
        ) : null}
      </header>
    </div>
  );
}

export function MobileWorkspaceChromeSkeleton() {
  return (
    <div className="space-y-0">
      <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/60 px-3 pb-3 pt-[env(safe-area-inset-top)] backdrop-blur-3xl sm:px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/[0.05]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-28 rounded-full bg-white/[0.07]" />
            <div className="h-4 w-40 rounded-full bg-white/[0.08]" />
          </div>
          <div className="h-9 w-24 rounded-lg bg-white/[0.08]" />
        </div>

        <div className="mt-3 rounded-lg border border-white/[0.1] bg-white/[0.03] p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <div className="h-5 w-24 rounded-full bg-white/[0.06]" />
            <div className="h-5 w-20 rounded-full bg-white/[0.05]" />
          </div>
          <div className="mt-3 space-y-3">
            <div className="h-5 w-full rounded-full bg-white/[0.08]" />
            <div className="h-4 w-5/6 rounded-full bg-white/[0.06]" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-28 rounded-full bg-white/[0.05]" />
            <div className="h-8 w-32 rounded-full bg-white/[0.05]" />
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
              className="h-11 min-w-[7.5rem] rounded-lg bg-white/[0.05]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
