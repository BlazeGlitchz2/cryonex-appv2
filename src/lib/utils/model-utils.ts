import {
  AUDIO_MODELS as SHARED_AUDIO_MODELS,
  IMAGE_MODELS as SHARED_IMAGE_MODELS,
  TEXT_MODELS as SHARED_TEXT_MODELS,
  VIDEO_MODELS as SHARED_VIDEO_MODELS,
  getModelDefinition,
  inferModelProvider as inferSharedProvider,
  normalizeModelId,
  type ModelProvider,
} from "@/shared/ai-models";

export interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  description: string;
  logo?: string;
  isImage?: boolean;
  isVideo?: boolean;
  isAudio?: boolean;
  tags?: string[];
  showcase?: boolean;
}

const toModel = (model: (typeof SHARED_TEXT_MODELS)[number]): Model => ({
  id: model.id,
  name: model.name,
  provider: model.provider,
  contextWindow: model.contextWindow,
  description: model.description,
  logo: model.logo,
  isImage: model.isImage,
  isVideo: model.isVideo,
  isAudio: model.isAudio,
  tags: model.tags,
  showcase: model.showcase,
});

export const AVAILABLE_MODELS: Model[] = SHARED_TEXT_MODELS.map(toModel);
export const IMAGE_MODELS: Model[] = SHARED_IMAGE_MODELS.map(toModel);
export const VIDEO_MODELS: Model[] = SHARED_VIDEO_MODELS.map(toModel);
export const AUDIO_MODELS: Model[] = SHARED_AUDIO_MODELS.map(toModel);

export { normalizeModelId };
export type { ModelProvider };

export const inferModelProvider = (modelId: string): ModelProvider =>
  inferSharedProvider(modelId);

export const getModelById = (id: string) => {
  const model = getModelDefinition(id);
  return model ? toModel(model) : AVAILABLE_MODELS[0];
};

export const getModelDisplayMeta = (modelId: string, provider?: string) => {
  const normalized = normalizeModelId(modelId);
  const model = getModelDefinition(normalized);

  return {
    name: model?.name || normalized,
    provider: provider || model?.provider || inferModelProvider(normalized),
    logo: model?.logo,
  };
};

