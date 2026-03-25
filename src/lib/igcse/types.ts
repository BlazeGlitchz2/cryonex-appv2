export type IgcseBoardId = "cambridge" | "edexcel" | "oxford_aqa";

export type IgcseSubjectId =
  | "biology"
  | "chemistry"
  | "physics"
  | "mathematics";

export type IgcseResourceKind = "book" | "past_paper";

export type IgcsePlanStatus = "draft" | "saved" | "pack_ready";

export interface IgcseDemandSignal {
  id: string;
  title: string;
  detail: string;
}

export interface IgcseBoard {
  id: IgcseBoardId;
  label: string;
  provider: string;
  positioning: string;
  strengths: string[];
}

export interface IgcseTopic {
  id: string;
  title: string;
  description: string;
  examSignals: string[];
  weaknessCue: string;
}

export interface IgcseRangePreset {
  id: string;
  label: string;
  startPage: number;
  endPage: number;
  topicIds: string[];
  summaryFocus: string;
}

export interface IgcseBook {
  id: string;
  kind: "book";
  boardId: IgcseBoardId;
  subjectId: IgcseSubjectId;
  title: string;
  publisher: string;
  edition: string;
  pageCount: number;
  description: string;
  topicIds: string[];
  studyAngles: string[];
  rangePresets: IgcseRangePreset[];
}

export interface IgcsePastPaper {
  id: string;
  kind: "past_paper";
  boardId: IgcseBoardId;
  subjectId: IgcseSubjectId;
  title: string;
  paperCode: string;
  sessionLabel: string;
  component: string;
  duration: string;
  description: string;
  topicIds: string[];
  questionFocus: string[];
  markSchemeFocus: string;
}

export interface IgcseTemplate {
  id: string;
  title: string;
  description: string;
  focusPrompt: string;
  targetOutcomes: string[];
  estimatedMinutes: number;
}

export interface IgcseTrack {
  board: IgcseBoard;
  subject: {
    id: IgcseSubjectId;
    label: string;
    shortLabel: string;
    positioning: string;
  };
  topics: IgcseTopic[];
  books: IgcseBook[];
  pastPapers: IgcsePastPaper[];
  templates: IgcseTemplate[];
}

export interface IgcseSelectedBook {
  resourceId: string;
  title: string;
  publisher: string;
  edition: string;
  pageCount: number;
  topicIds: string[];
  startPage: number;
  endPage: number;
  summaryFocus: string;
  selectedPresetId?: string;
}

export interface IgcseSelectedPastPaper {
  resourceId: string;
  title: string;
  paperCode: string;
  sessionLabel: string;
  component: string;
  duration: string;
  topicIds: string[];
  questionFocus: string[];
  markSchemeFocus: string;
}

export interface IgcsePlanDraft {
  title: string;
  boardId: IgcseBoardId;
  boardLabel: string;
  subjectId: IgcseSubjectId;
  subjectLabel: string;
  focusTopic: string;
  notes: string;
  selectedTopicIds: string[];
  selectedTopicTitles: string[];
  weakTopicIds: string[];
  weakTopicTitles: string[];
  selectedTemplateIds: string[];
  selectedTemplateTitles: string[];
  targetOutcomes: string[];
  totalEstimatedMinutes: number;
  selectedBooks: IgcseSelectedBook[];
  selectedPastPapers: IgcseSelectedPastPaper[];
}

export interface IgcsePlanRecord extends IgcsePlanDraft {
  _id: string;
  _creationTime: number;
  status: IgcsePlanStatus;
  materialId?: string;
  docId?: string;
  packId?: string;
  createdAt: number;
  updatedAt: number;
  lastBuiltAt?: number;
}
