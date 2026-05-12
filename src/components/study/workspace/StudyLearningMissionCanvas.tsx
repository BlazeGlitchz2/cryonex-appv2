import { lazy, Suspense } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Network,
  PenLine,
  ShieldCheck,
  Sparkles,
  StickyNote,
  Target,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StudyMaterialViewer } from "@/components/study/StudyMaterialViewer";
import { useAppLocale } from "@/hooks/use-app-locale";
import { cn } from "@/lib/utils";

import {
  buildStudyWorkspaceLearningPlan,
  type StudyWorkspaceLearningTabId,
} from "./study-workspace-sections";

const RegionalStudyPlaybooks = lazy(() =>
  import("@/components/study/RegionalStudyPlaybooks").then((module) => ({
    default: module.RegionalStudyPlaybooks,
  })),
);

const SourceGroundingPanel = lazy(() =>
  import("@/components/study/SourceGroundingPanel").then((module) => ({
    default: module.SourceGroundingPanel,
  })),
);

type StudyLearningMissionCanvasProps = {
  title: string;
  user: any;
  isSimpleMode: boolean;
  setIsSimpleMode: (value: boolean) => void;
  isDeepFocus: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  summaryContent: string;
  setSummaryContent: (value: string) => void;
  handleSaveSummary: () => void;
  handleCreatePack: () => void;
  isGeneratingPack: boolean;
  openImproveDialog: () => void;
  onSelectTab: (tab: string) => void;
  sourceWordCount: number;
  transcriptText: string;
  flashcards: any[];
  quizzes: any[];
  showPlaybooks: boolean;
  setShowPlaybooks: (value: boolean) => void;
  showGrounding: boolean;
  setShowGrounding: (value: boolean) => void;
  applyPlaybookInstruction: (instruction: string) => void;
  sourceSections?: Array<{
    id?: string;
    title?: string;
    text?: string;
    count?: number;
  }>;
};

const toolActions: Array<{
  id: StudyWorkspaceLearningTabId;
  label: string;
  helper: string;
  icon: typeof Brain;
}> = [
  {
    id: "flashcards",
    label: "Recall",
    helper: "Review cards",
    icon: Brain,
  },
  {
    id: "quizzes",
    label: "Exam check",
    helper: "Practice questions",
    icon: ListChecks,
  },
  {
    id: "notes",
    label: "Notes",
    helper: "Write in your words",
    icon: StickyNote,
  },
  {
    id: "mindmap",
    label: "Concept map",
    helper: "See structure",
    icon: Network,
  },
];

function statusTone(status: string) {
  if (status === "done") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200";
  }

  if (status === "current") {
    return "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-400/30 dark:bg-cyan-500/12 dark:text-cyan-100";
  }

  return "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400";
}

function actionTone(tab: StudyWorkspaceLearningTabId) {
  if (tab === "flashcards") return "text-cyan-700 dark:text-cyan-200";
  if (tab === "quizzes") return "text-emerald-700 dark:text-emerald-200";
  if (tab === "gaps") return "text-amber-700 dark:text-amber-200";
  return "text-slate-700 dark:text-slate-200";
}

function CanvasFallback({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300">
      {label}
    </div>
  );
}

function sourceDomId(id: string) {
  return `study-source-${id.replace(/[^a-z0-9_-]/gi, "-")}`;
}

export function StudyLearningMissionCanvas({
  title,
  user,
  isSimpleMode,
  setIsSimpleMode,
  isDeepFocus,
  isEditing,
  setIsEditing,
  summaryContent,
  setSummaryContent,
  handleSaveSummary,
  handleCreatePack,
  isGeneratingPack,
  openImproveDialog,
  onSelectTab,
  sourceWordCount,
  transcriptText,
  flashcards,
  quizzes,
  showPlaybooks,
  setShowPlaybooks,
  showGrounding,
  setShowGrounding,
  applyPlaybookInstruction,
  sourceSections = [],
}: StudyLearningMissionCanvasProps) {
  const { isRTL: isLocaleRTL, language } = useAppLocale();
  const reviewedCards = flashcards.filter((card) => (card.reviewCount || 0) > 0);
  const masteredCards = flashcards.filter((card) => card.status === "mastered");
  const quizQuestionCount = quizzes.reduce(
    (sum, quiz) => sum + (quiz.questions?.length || 0),
    0,
  );
  const plan = buildStudyWorkspaceLearningPlan({
    title,
    summary: summaryContent,
    transcriptText,
    flashcardCount: flashcards.length,
    reviewedFlashcardCount: reviewedCards.length,
    masteredFlashcardCount: masteredCards.length,
    quizCount: quizzes.length,
    quizQuestionCount,
    sourceSections,
  });
  const weakSpots =
    plan.weakSpots.length > 0
      ? plan.weakSpots
      : [
          {
            label: "No weak spot logged yet",
            detail:
              "Review cards or take a quiz so Cryonex can turn misses into a repair plan.",
            targetTab: "flashcards" as const,
          },
        ];
  const isWorkspaceRTL = Boolean(
    isLocaleRTL ||
      language === "ar" ||
      user?.isRTL ||
      user?.preferredLanguage === "ar",
  );
  const copy = isWorkspaceRTL
    ? {
        mission: "مهمة التعلم اليوم",
        sourceWords: "كلمة من المصدر",
        learningMode: isDeepFocus ? "تركيز عميق" : "وضع التعلم",
        description:
          "اقرأ الملخص أولاً، ثم انتقل إلى التذكر النشط والأمثلة والأسئلة عندما تكون جاهزاً.",
        ready: "جاهز",
        summaryTitle: "الملخص الرئيسي",
        summarySubtitle: "مساحة القراءة الأساسية لهذا المصدر.",
        primaryReaderLabel: "Primary summary reader",
        detail: "تفصيلي",
        simple: "مبسط",
        simpleMissing: "الملخص المبسط غير متاح.",
        emptySummary: "لا يوجد ملخص بعد.",
        groundedWords: "كلمة موثقة",
        cards: "بطاقات",
        questions: "أسئلة",
        save: "حفظ",
        edit: "تعديل",
        improve: "تحسين",
        generatePack: "إنشاء حزمة دراسة",
        generating: "جارٍ الإنشاء...",
        realLifeAnchor: "مثال واقعي",
        misconceptionWatch: "انتبه لهذا الالتباس",
        activeRecall: "مختبر التذكر",
        activeRecallHint: "أغلق المصدر ثم استرجع الفكرة.",
        testingScenarios: "أسئلة اختبار",
        testingHint: "تحقق من الفهم بأسئلة واقعية.",
        sourceEvidence: "دليل من المصدر",
        sourceEvidenceHint: "كل خطوة تعلم يجب أن تعود إلى النص الأصلي.",
        checkGrounding: "تحقق من التوثيق",
        practiceLauncher: "أدوات التدريب",
        coachPrompts: "أسئلة المدرب",
        curriculumPlaybooks: "خطط المنهج",
        curriculumHint: "طرق دراسة محلية لهذا المصدر.",
        groundingCheck: "فحص التوثيق",
      }
    : {
        mission: "Today's learning mission",
        sourceWords: "source words",
        learningMode: isDeepFocus ? "Deep Focus" : "Learning mode",
        description:
          "Read the summary first, then move into recall, examples, and exam checks when you are ready.",
        ready: "Ready",
        summaryTitle: "Main summary",
        summarySubtitle: "The primary reading surface for this source.",
        primaryReaderLabel: "Primary summary reader",
        detail: "Detail",
        simple: "Simple",
        simpleMissing: "Simple summary not available.",
        emptySummary: "No summary content available yet.",
        groundedWords: "words grounded",
        cards: "cards",
        questions: "quiz questions",
        save: "Save",
        edit: "Edit",
        improve: "Improve",
        generatePack: "Generate Study Pack",
        generating: "Generating...",
        realLifeAnchor: "Real-life anchor",
        misconceptionWatch: "Misconception watch",
        activeRecall: "Active recall lab",
        activeRecallHint: "Close the source, then retrieve.",
        testingScenarios: "Testing scenarios",
        testingHint: "Real-world and exam-style checks.",
        sourceEvidence: "Source evidence",
        sourceEvidenceHint:
          "Every learning move should point back to the original material.",
        checkGrounding: "Check grounding",
        practiceLauncher: "Practice launcher",
        coachPrompts: "Coach prompts",
        curriculumPlaybooks: "Curriculum playbooks",
        curriculumHint: "Regional study moves for this source.",
        groundingCheck: "Grounding check",
      };

  return (
    <div
      data-testid="study-learning-mission-canvas"
      dir={isWorkspaceRTL ? "rtl" : "ltr"}
      className={cn(
        "flex min-h-0 flex-1 flex-col bg-[#f5f8fb] text-slate-950 dark:bg-[#07101b] dark:text-white",
        isWorkspaceRTL && "font-arabic",
      )}
    >
      <div className="border-b border-slate-200/80 bg-white/94 px-5 py-4 dark:border-white/10 dark:bg-[#0b1220]/94 lg:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-200">
                <Target className="h-3.5 w-3.5" />
                {copy.mission}
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                {sourceWordCount.toLocaleString()} {copy.sourceWords}
              </span>
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-200">
                {copy.learningMode}
              </span>
            </div>
            <h2 className="mt-3 break-words text-2xl font-black tracking-tight text-slate-950 dark:text-white lg:text-3xl">
              {title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {copy.description}
            </p>
          </div>

          <div className="grid min-w-[280px] gap-3 sm:grid-cols-[92px_minmax(0,1fr)]">
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                {copy.ready}
              </p>
              <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
                {plan.readinessScore}%
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab(plan.primaryAction.targetTab)}
              className="rounded-lg border border-cyan-200 bg-cyan-600 px-4 py-3 text-left text-white shadow-[0_16px_34px_rgba(6,182,212,0.18)] transition hover:bg-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
            >
              <span className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-black">
                    {plan.primaryAction.label}
                  </span>
                  <span className="mt-1 block text-xs font-semibold opacity-85">
                    {plan.primaryAction.helper}
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 lg:px-5">
        <div className="mx-auto w-full max-w-[1680px] min-w-0 space-y-4">
          <div className="grid min-w-0 gap-4">
            <div className="order-2 grid gap-2 md:grid-cols-4">
              {plan.missionSteps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectTab(step.targetTab)}
                  className={cn(
                    "min-h-[112px] rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
                    statusTone(step.status),
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/75 text-xs font-black shadow-sm dark:bg-white/10">
                      {index + 1}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.14em]">
                      {step.status}
                    </span>
                  </span>
                  <span className="mt-3 block text-base font-black">
                    {step.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 opacity-80">
                    {step.description}
                  </span>
                </button>
              ))}
            </div>

            <div className="order-1 grid min-w-0 gap-4">
              <section
                data-testid="study-summary-primary"
                aria-label={copy.primaryReaderLabel}
                className="lg:col-span-12 min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1220]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-950 dark:text-white">
                        {copy.summaryTitle}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {copy.summarySubtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSimpleMode(false)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-bold",
                        !isSimpleMode
                          ? "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-200"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.05]",
                      )}
                    >
                      {copy.detail}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSimpleMode(true)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-bold",
                        isSimpleMode
                          ? "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-200"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.05]",
                      )}
                    >
                      {copy.simple}
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-5">
                  {isEditing ? (
                    <Textarea
                      value={summaryContent}
                      onChange={(event) => setSummaryContent(event.target.value)}
                      dir={isWorkspaceRTL ? "rtl" : "ltr"}
                      className="min-h-[56vh] resize-none rounded-lg border-slate-200 bg-slate-50 p-5 text-base leading-8 text-slate-800 dark:border-white/10 dark:bg-black/25 dark:text-slate-100 lg:min-h-[620px]"
                    />
                  ) : (
                    <StudyMaterialViewer
                      density="comfortable"
                      isRTL={isWorkspaceRTL}
                      className="min-h-[56vh] rounded-lg border border-slate-200 bg-white px-5 py-5 dark:border-white/10 dark:bg-[#0b1220] lg:min-h-[620px] lg:px-8 lg:py-7"
                      content={
                        summaryContent?.trim() ||
                        (isSimpleMode
                          ? copy.simpleMissing
                          : copy.emptySummary)
                      }
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-white/10">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <BookOpen className="h-4 w-4" />
                    {sourceWordCount.toLocaleString()} {copy.groundedWords}
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    {flashcards.length} {copy.cards}
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    {quizQuestionCount} {copy.questions}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        isEditing ? handleSaveSummary() : setIsEditing(true)
                      }
                      className="h-9 rounded-lg border-slate-200 bg-white text-xs font-bold dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <PenLine className="mr-2 h-3.5 w-3.5" />
                      {isEditing ? copy.save : copy.edit}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openImproveDialog}
                      className="h-9 rounded-lg border-slate-200 bg-white text-xs font-bold dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <Wand2 className="mr-2 h-3.5 w-3.5" />
                      {copy.improve}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreatePack}
                      disabled={isGeneratingPack}
                      className="h-9 rounded-lg bg-slate-950 px-4 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                      {isGeneratingPack ? copy.generating : copy.generatePack}
                    </Button>
                  </div>
                </div>
              </section>

              <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                <section className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-400/25 dark:bg-emerald-500/10">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-200">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-950 dark:text-white">
                        {copy.realLifeAnchor}
                      </h3>
                      <p className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-100">
                        {plan.realLifeExamples[0]?.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                        {plan.realLifeExamples[0]?.situation}
                      </p>
                      <p className="mt-3 rounded-lg border border-emerald-200 bg-white p-3 text-xs leading-5 text-emerald-800 dark:border-emerald-400/20 dark:bg-white/[0.06] dark:text-emerald-100">
                        {plan.realLifeExamples[0]?.learnerAction}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-400/25 dark:bg-amber-500/10">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-200" />
                    <h3 className="text-sm font-black text-slate-950 dark:text-white">
                      {copy.misconceptionWatch}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {weakSpots.map((spot) => (
                      <button
                        key={spot.label}
                        type="button"
                        onClick={() => onSelectTab(spot.targetTab)}
                        className="w-full rounded-lg border border-amber-200 bg-white p-3 text-left text-sm text-amber-900 transition hover:bg-amber-50 dark:border-amber-400/20 dark:bg-white/[0.05] dark:text-amber-100 dark:hover:bg-white/[0.08]"
                      >
                        <span className="block font-black">{spot.label}</span>
                        <span className="mt-1 block text-xs leading-5 opacity-80">
                          {spot.detail}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="order-3 grid min-w-0 gap-4 xl:grid-cols-2">
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1220]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 dark:text-white">
                      {copy.activeRecall}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {copy.activeRecallHint}
                    </p>
                  </div>
                  <Brain className="h-5 w-5 text-cyan-600 dark:text-cyan-200" />
                </div>
                <div className="space-y-2">
                  {plan.recallPrompts.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => onSelectTab(prompt.targetTab)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50/60 dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-cyan-400/30 dark:hover:bg-cyan-500/10"
                    >
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">
                        {prompt.label}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-800 dark:text-slate-200">
                        {prompt.prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1220]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 dark:text-white">
                      {copy.testingScenarios}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {copy.testingHint}
                    </p>
                  </div>
                  <ClipboardCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-200" />
                </div>
                <div className="space-y-2">
                  {plan.examChecks.map((check) => (
                    <button
                      key={check.label}
                      type="button"
                      onClick={() => onSelectTab(check.targetTab)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/60 dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-emerald-400/30 dark:hover:bg-emerald-500/10"
                    >
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-200">
                        {check.label}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-800 dark:text-slate-200">
                        {check.question}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <section className="order-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1220]">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-950 dark:text-white">
                    {copy.sourceEvidence}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {copy.sourceEvidenceHint}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGrounding(true)}
                  className="h-9 rounded-lg border-slate-200 bg-white text-xs font-bold dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                  {copy.checkGrounding}
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {plan.sourceEvidence.map((evidence) => (
                  <article
                    key={evidence.id}
                    id={sourceDomId(evidence.id)}
                    className="scroll-mt-28 rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.035]"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      {evidence.sectionTitle}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-800 dark:text-slate-200">
                      {evidence.snippet}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="grid min-w-0 gap-4 xl:grid-cols-3">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1220]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-950 dark:text-white">
                  {copy.practiceLauncher}
                </h3>
                <BarChart3 className="h-5 w-5 text-slate-400" />
              </div>
              <div className="grid gap-2">
                {toolActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => onSelectTab(action.id)}
                    className="flex min-h-[64px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50/60 dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-cyan-400/30 dark:hover:bg-cyan-500/10"
                  >
                    <action.icon
                      className={cn("h-5 w-5 shrink-0", actionTone(action.id))}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-black text-slate-900 dark:text-white">
                        {action.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {action.helper}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1220]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-950 dark:text-white">
                  {copy.coachPrompts}
                </h3>
                <MessageSquare className="h-5 w-5 text-cyan-600 dark:text-cyan-200" />
              </div>
              <div className="space-y-2">
                {plan.coachPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => onSelectTab("chat")}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-left text-sm leading-6 text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50/60 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-200 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-500/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1220]">
              <button
                type="button"
                onClick={() => setShowPlaybooks(!showPlaybooks)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span>
                  <span className="block text-sm font-black text-slate-950 dark:text-white">
                    {copy.curriculumPlaybooks}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {copy.curriculumHint}
                  </span>
                </span>
                <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-200" />
              </button>
              {showPlaybooks ? (
                <div className="mt-3 border-t border-slate-200 pt-3 dark:border-white/10">
                  <Suspense fallback={<CanvasFallback label="Loading playbooks..." />}>
                    <RegionalStudyPlaybooks
                      region={user?.region}
                      country={user?.country}
                      curriculum={user?.curriculum}
                      curriculumTrack={user?.curriculumTrack}
                      gradeLevel={user?.gradeLevel}
                      targetSubjects={user?.targetSubjects}
                      targetExams={user?.targetExams}
                      studyPace={user?.studyPace}
                      preferredLanguage={user?.preferredLanguage}
                      isRTL={user?.isRTL}
                      compact
                      onApplyInstruction={applyPlaybookInstruction}
                    />
                  </Suspense>
                </div>
              ) : null}
            </section>

            {showGrounding ? (
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1220]">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-200" />
                  <h3 className="text-sm font-black text-slate-950 dark:text-white">
                    {copy.groundingCheck}
                  </h3>
                </div>
                <Suspense fallback={<CanvasFallback label="Checking source grounding..." />}>
                  <SourceGroundingPanel
                    summary={summaryContent}
                    sourceText={transcriptText}
                    compact
                  />
                </Suspense>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
