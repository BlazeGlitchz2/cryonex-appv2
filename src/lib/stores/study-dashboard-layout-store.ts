import { create } from "zustand";
import { persist } from "zustand/middleware";

export type StudyDashboardWidgetId =
  | "hero"
  | "live_context"
  | "next_actions"
  | "stats"
  | "igcse_studio"
  | "source_shelf"
  | "study_packs"
  | "capture_lane"
  | "local_context"
  | "community"
  | "schoolmates";

export type StudyDashboardWidgetPlacement = "main" | "rail" | "full";

export interface StudyDashboardWidgetConfig {
  id: StudyDashboardWidgetId;
  placement: StudyDashboardWidgetPlacement;
}

export const DEFAULT_STUDY_DASHBOARD_WIDGETS: StudyDashboardWidgetConfig[] = [
  { id: "hero", placement: "main" },
  { id: "live_context", placement: "rail" },
  { id: "next_actions", placement: "main" },
  { id: "stats", placement: "rail" },
  { id: "igcse_studio", placement: "full" },
  { id: "source_shelf", placement: "full" },
  { id: "study_packs", placement: "full" },
  { id: "capture_lane", placement: "full" },
  { id: "local_context", placement: "full" },
  { id: "community", placement: "main" },
  { id: "schoolmates", placement: "rail" },
];

const VALID_WIDGET_IDS = new Set(
  DEFAULT_STUDY_DASHBOARD_WIDGETS.map((widget) => widget.id),
);

function normalizeWidgets(
  widgets: StudyDashboardWidgetConfig[] | undefined,
): StudyDashboardWidgetConfig[] {
  if (!widgets?.length) {
    return DEFAULT_STUDY_DASHBOARD_WIDGETS;
  }

  const defaultsById = new Map(
    DEFAULT_STUDY_DASHBOARD_WIDGETS.map((widget) => [widget.id, widget]),
  );
  const nextWidgets: StudyDashboardWidgetConfig[] = [];
  const seen = new Set<StudyDashboardWidgetId>();

  widgets.forEach((widget) => {
    if (!VALID_WIDGET_IDS.has(widget.id) || seen.has(widget.id)) {
      return;
    }

    seen.add(widget.id);
    nextWidgets.push({
      id: widget.id,
      placement:
        widget.placement === "main" ||
        widget.placement === "rail" ||
        widget.placement === "full"
          ? widget.placement
          : (defaultsById.get(widget.id)?.placement ?? "full"),
    });
  });

  DEFAULT_STUDY_DASHBOARD_WIDGETS.forEach((widget) => {
    if (!seen.has(widget.id)) {
      nextWidgets.push(widget);
    }
  });

  return nextWidgets;
}

interface StudyDashboardLayoutStore {
  isCustomizing: boolean;
  widgets: StudyDashboardWidgetConfig[];
  setCustomizing: (value: boolean) => void;
  setWidgets: (widgets: StudyDashboardWidgetConfig[]) => void;
  reorderWidgets: (orderedIds: StudyDashboardWidgetId[]) => void;
  cyclePlacement: (id: StudyDashboardWidgetId) => void;
  resetLayout: () => void;
}

export const useStudyDashboardLayoutStore =
  create<StudyDashboardLayoutStore>()(
    persist(
      (set) => ({
        isCustomizing: false,
        widgets: DEFAULT_STUDY_DASHBOARD_WIDGETS,
        setCustomizing: (value) => set({ isCustomizing: value }),
        setWidgets: (widgets) =>
          set({
            widgets: normalizeWidgets(widgets),
          }),
        reorderWidgets: (orderedIds) =>
          set((state) => {
            const byId = new Map(state.widgets.map((widget) => [widget.id, widget]));
            return {
              widgets: normalizeWidgets(
                orderedIds.map(
                  (id) => byId.get(id) ?? { id, placement: "full" },
                ),
              ),
            };
          }),
        cyclePlacement: (id) =>
          set((state) => ({
            widgets: state.widgets.map((widget) => {
              if (widget.id !== id) return widget;

              const nextPlacement =
                widget.placement === "main"
                  ? "rail"
                  : widget.placement === "rail"
                    ? "full"
                    : "main";

              return {
                ...widget,
                placement: nextPlacement,
              };
            }),
          })),
        resetLayout: () =>
          set({
            isCustomizing: false,
            widgets: DEFAULT_STUDY_DASHBOARD_WIDGETS,
          }),
      }),
      {
        name: "study-dashboard-layout-store",
        partialize: (state) => ({
          widgets: state.widgets,
        }),
        merge: (persistedState, currentState) => {
          const nextState = persistedState as Partial<StudyDashboardLayoutStore>;
          return {
            ...currentState,
            widgets: normalizeWidgets(nextState?.widgets),
          };
        },
      },
    ),
  );
