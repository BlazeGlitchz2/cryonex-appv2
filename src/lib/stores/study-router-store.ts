import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  StudyIntensity,
  StudyPrimaryIntent,
  StudyRouteStatus,
} from "@/lib/study-routing";

export interface StudyPersonalizationSignal {
  id: string;
  text: string;
  topic?: string;
  primaryIntent: StudyPrimaryIntent;
  intensity: StudyIntensity;
  createdAt: number;
}

export interface StudyRouteJob {
  id: string;
  status: StudyRouteStatus;
  fileName: string;
  request: string;
  primaryIntent: StudyPrimaryIntent;
  intensity: StudyIntensity;
  intentLabel: string;
  summary: string;
  topic?: string;
  materialId?: string;
  docId?: string;
  dashboardUrl?: string;
  workspaceUrl?: string;
  createdAt: number;
  updatedAt: number;
  openedAt?: number;
  error?: string;
}

interface StartStudyRouteJobInput {
  fileName: string;
  request: string;
  primaryIntent: StudyPrimaryIntent;
  intensity: StudyIntensity;
  intentLabel: string;
  summary: string;
  topic?: string;
}

interface CompleteStudyRouteJobInput {
  id: string;
  materialId?: string;
  docId?: string;
  dashboardUrl?: string;
  workspaceUrl?: string;
  summary?: string;
}

interface FailStudyRouteJobInput {
  id: string;
  error: string;
}

interface StudyRouterStore {
  signals: StudyPersonalizationSignal[];
  jobs: StudyRouteJob[];
  recordSignal: (
    signal: Omit<StudyPersonalizationSignal, "id" | "createdAt">,
  ) => string;
  startJob: (job: StartStudyRouteJobInput) => string;
  completeJob: (job: CompleteStudyRouteJobInput) => void;
  failJob: (job: FailStudyRouteJobInput) => void;
  markOpened: (jobId: string) => void;
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
}

export const useStudyRouterStore = create<StudyRouterStore>()(
  persist(
    (set) => ({
      signals: [],
      jobs: [],
      recordSignal: (signal) => {
        const id = createId("study-signal");
        const createdAt = Date.now();

        set((state) => ({
          signals: [
            {
              id,
              createdAt,
              ...signal,
            },
            ...state.signals,
          ].slice(0, 24),
        }));

        return id;
      },
      startJob: (job) => {
        const id = createId("study-job");
        const now = Date.now();

        set((state) => ({
          jobs: [
            {
              id,
              status: "processing" as const,
              createdAt: now,
              updatedAt: now,
              ...job,
            },
            ...state.jobs,
          ].slice(0, 18),
        }));

        return id;
      },
      completeJob: (job) => {
        set((state) => ({
          jobs: state.jobs.map((existingJob) =>
            existingJob.id === job.id
              ? {
                  ...existingJob,
                  status: "complete",
                  updatedAt: Date.now(),
                  materialId: job.materialId ?? existingJob.materialId,
                  docId: job.docId ?? existingJob.docId,
                  dashboardUrl: job.dashboardUrl ?? existingJob.dashboardUrl,
                  workspaceUrl: job.workspaceUrl ?? existingJob.workspaceUrl,
                  summary: job.summary ?? existingJob.summary,
                  error: undefined,
                }
              : existingJob,
          ),
        }));
      },
      failJob: (job) => {
        set((state) => ({
          jobs: state.jobs.map((existingJob) =>
            existingJob.id === job.id
              ? {
                  ...existingJob,
                  status: "error",
                  updatedAt: Date.now(),
                  error: job.error,
                }
              : existingJob,
          ),
        }));
      },
      markOpened: (jobId) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  openedAt: Date.now(),
                }
              : job,
          ),
        }));
      },
    }),
    {
      name: "study-router-store",
      partialize: (state) => ({
        signals: state.signals,
        jobs: state.jobs,
      }),
    },
  ),
);
