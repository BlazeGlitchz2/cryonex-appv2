import { useCallback } from "react";
import { useAction, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  buildStudyWorkspaceUrl,
  parseStudyIntent,
} from "@/lib/study-routing";
import { useStudyRouterStore } from "@/lib/stores/study-router-store";

interface RoutePdfToStudyInput {
  file: File;
  storageId: Id<"_storage">;
  prompt: string;
}

export function useStudyIntentRouter() {
  const createMaterial = useMutation(api.study.createMaterial);
  const extractPDF = useAction(api.studyExtractor.extractPDF);
  const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);
  const getPipelineReadiness = useAction(api.studyRuntime.getPipelineReadiness);
  const setMaterialDocId = useMutation(api.studyMutations.setMaterialDocId);

  const recordStudySignal = useCallback(
    (
      text: string,
      files?: Array<{
        name?: string;
        type?: string;
      }>,
    ) => {
      const intent = parseStudyIntent(text, files);
    if (!intent.isStudyRelated) {
      return intent;
    }

    useStudyRouterStore.getState().recordSignal({
      text,
      topic: intent.topic,
      primaryIntent: intent.primaryIntent,
      intensity: intent.intensity,
    });

    return intent;
    },
    [],
  );

  const routePdfToStudy = useCallback(
    async ({ file, storageId, prompt }: RoutePdfToStudyInput) => {
      const intent = parseStudyIntent(prompt, [file]);
      const readiness = await getPipelineReadiness({});

      if (!readiness.canUploadPdf) {
        throw new Error(
          `PDF study packs are not ready yet. Missing: ${readiness.missingForPdfUpload.join(", ")}`,
        );
      }

      const jobId = useStudyRouterStore.getState().startJob({
        fileName: file.name,
        request: prompt,
        primaryIntent: intent.primaryIntent,
        intensity: intent.intensity,
        intentLabel: intent.intentLabel,
        summary: intent.summary,
        topic: intent.topic,
      });

      try {
        toast.info("Routing your PDF into the study pipeline...");

        const materialId = await createMaterial({
          title: file.name,
          type: "pdf",
          storageId,
        });

        const extractionResult = await extractPDF({
          storageId,
          fileName: file.name,
        });

        await setMaterialDocId({
          materialId,
          docId: extractionResult.docId,
        });

        await generateAllAssets({
          materialId,
          content: extractionResult.text,
          title: file.name,
          docId: extractionResult.docId,
        });

        const workspaceUrl = buildStudyWorkspaceUrl(
          extractionResult.docId,
          intent,
        );
        const dashboardUrl = `/study/dashboard?routeJob=${jobId}`;

        useStudyRouterStore.getState().completeJob({
          id: jobId,
          materialId: String(materialId),
          docId: extractionResult.docId,
          dashboardUrl,
          workspaceUrl,
          summary: intent.summary,
        });

        toast.success("PDF done. Your study workspace is ready.");

        return {
          jobId,
          materialId,
          docId: extractionResult.docId,
          dashboardUrl,
          workspaceUrl,
          intent,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to route PDF to study.";

        useStudyRouterStore.getState().failJob({
          id: jobId,
          error: message,
        });

        throw error;
      }
    },
    [
      createMaterial,
      extractPDF,
      generateAllAssets,
      getPipelineReadiness,
      setMaterialDocId,
    ],
  );

  return {
    recordStudySignal,
    routePdfToStudy,
  };
}
