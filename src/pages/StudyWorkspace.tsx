import {
  lazy,
  startTransition,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Download,
  Edit,
  EyeOff,
  FileText,
  ListChecks,
  MessageSquare,
  Network,
  Save,
  Sparkles,
  StickyNote,
  TrendingUp,
  Wand2,
  X,
  Plus,
  SendHorizontal,
  Target,
  Users,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { generateWorksheetPDF } from "@/lib/pdf-generator";
import { StudyWorkspaceLayout } from "@/components/study/StudyWorkspaceLayout";
import { StudyWorkspaceNextSteps } from "@/components/study/StudyWorkspaceNextSteps";
import { StudyMaterialViewer } from "@/components/study/StudyMaterialViewer";
import { ShareButton } from "@/components/viral/ShareButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useFocusSessionController } from "@/hooks/use-focus-session-controller";
import { useStudyPresence } from "@/hooks/use-study-presence";
import { useStudentOS } from "@/hooks/use-student-os";
import { FocusSessionCard } from "@/components/study/FocusSessionCard";

const PDFChat = lazy(() =>
  import("@/components/study/PDFChat").then((module) => ({
    default: module.PDFChat,
  })),
);
const StudyFlashcards = lazy(() =>
  import("@/components/study/StudyFlashcards").then((module) => ({
    default: module.StudyFlashcards,
  })),
);
const StudyQuizzes = lazy(() =>
  import("@/components/study/StudyQuizzes").then((module) => ({
    default: module.StudyQuizzes,
  })),
);
const StudyNotes = lazy(() =>
  import("@/components/study/StudyNotes").then((module) => ({
    default: module.StudyNotes,
  })),
);
const StudyConceptMap = lazy(() =>
  import("@/components/study/StudyConceptMap").then((module) => ({
    default: module.StudyConceptMap,
  })),
);
const KnowledgeGapDashboard = lazy(() =>
  import("@/components/study/KnowledgeGapDashboard").then((module) => ({
    default: module.KnowledgeGapDashboard,
  })),
);
const ImageOcclusionTool = lazy(() =>
  import("@/components/study/ImageOcclusionTool").then((module) => ({
    default: module.ImageOcclusionTool,
  })),
);
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

const formatStudyTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

function WorkspacePanelFallback({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex h-full flex-col ${compact ? "justify-start p-4" : "justify-center p-6 md:p-8"}`}
    >
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-foreground/[0.07]" />
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-full bg-foreground/[0.08]" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-foreground/[0.06]" />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] md:p-5">
          <p className="text-sm font-medium text-foreground/70">{label}</p>
          <div className="mt-4 space-y-3">
            <div className="h-4 w-full animate-pulse rounded-full bg-foreground/[0.06]" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-foreground/[0.05]" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-foreground/[0.05]" />
          </div>
        </div>
      </div>
    </div>
  );
}

const demoSummary = `# Cell Structure: Summary

## Cell Theory
- All living organisms are composed of one or more cells.
- The cell is the basic unit of structure and function in living things.
- All cells come from pre-existing cells.

## Cell Membrane
- The cell membrane is a selectively permeable barrier that controls what enters and exits the cell.
- It is composed of a phospholipid bilayer with embedded proteins.
- Key functions include protection, cell signaling, and maintaining homeostasis.

## Cytoplasm & Organelles
- Cytoplasm is the gel-like substance inside the cell where organelles are suspended.
- Organelles each perform specialized functions.
- Mitochondria produce ATP, ribosomes synthesize proteins, and the Golgi apparatus modifies and packages proteins.`;

const demoTranscript =
  "Cell theory, membrane structure, organelles, mitochondria, ribosomes, and Golgi apparatus review notes from Biology 101.";

const isDemoWorkspaceId = (docId?: string) => docId === "test-doc";

function StudySummaryCanvas({
  title,
  isSimpleMode,
  setIsSimpleMode,
  isEditing,
  setIsEditing,
  summaryContent,
  setSummaryContent,
  handleSaveSummary,
  handleDownloadWorksheet,
  openImproveDialog,
  onSelectTab,
  sourceWordCount,
}: {
  title: string;
  isSimpleMode: boolean;
  setIsSimpleMode: (value: boolean) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  summaryContent: string;
  setSummaryContent: (value: string) => void;
  handleSaveSummary: () => void;
  handleDownloadWorksheet: () => void;
  openImproveDialog: () => void;
  onSelectTab: (tab: string) => void;
  sourceWordCount: number;
}) {
  const summarySections = [
    {
      title: "Cell Theory",
      points: [
        "All living organisms are composed of one or more cells.",
        "The cell is the basic unit of structure and function in living things.",
        "All cells come from pre-existing cells.",
      ],
    },
    {
      title: "Cell Membrane",
      points: [
        "A selectively permeable barrier controls what enters and exits the cell.",
        "A phospholipid bilayer holds embedded proteins for transport and signaling.",
        "Its main jobs are protection, signaling, and stable homeostasis.",
      ],
    },
    {
      title: "Cytoplasm & Organelles",
      points: [
        "Cytoplasm suspends organelles in a gel-like environment.",
        "Organelles perform specialized jobs that keep the cell alive.",
      ],
    },
  ];

  const organelles = [
    ["Nucleus", "Double membrane, contains DNA", "Control center; stores genetic information"],
    ["Mitochondria", "Double membrane, inner folds", "Produces ATP energy"],
    ["Ribosomes", "Small particles, free or bound", "Protein synthesis"],
    ["Golgi Apparatus", "Stacked membranous sacs", "Modifies and packages proteins"],
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f8fafc]">
      <div className="border-b border-slate-200 bg-white/95 px-5 backdrop-blur">
        <div className="flex gap-8 overflow-x-auto">
          {[
            ["summary", "Summary"],
            ["notes", "Notes"],
            ["flashcards", "Flashcards"],
            ["quizzes", "Quiz"],
            ["mindmap", "Concept Map"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              className={cn(
                "border-b-2 px-1 py-4 text-sm font-semibold transition-colors",
                id === "summary"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-950",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 lg:p-4">
        <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-200 px-5 py-4 lg:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    {title}: Summary
                  </h2>
                  <button
                    type="button"
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                    aria-label="Favorite summary"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Key concepts from 4 sources
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    [BookOpen, "Campbell Biology 12e"],
                    [FileText, "Lecture Notes 4-18"],
                    [Network, "Website"],
                    [Plus, "+1"],
                  ].map(([Icon, label]) => (
                    <span
                      key={String(label)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
                    >
                      <Icon className="h-4 w-4 text-blue-600" />
                      {label as string}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid min-w-[260px] grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-full border-[5px] border-blue-500 border-b-emerald-400 text-sm font-bold text-slate-950">
                    68%
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Study Progress</p>
                    <p className="text-sm font-semibold text-slate-950">Good progress</p>
                  </div>
                </div>
                <div className="border-l border-slate-200 pl-5">
                  <p className="text-xs font-semibold text-slate-500">Mastery</p>
                  <div className="mt-2 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-bold text-amber-600">Medium</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Keep reviewing</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 lg:px-6">
            {isEditing ? (
              <Textarea
                value={summaryContent}
                onChange={(event) => setSummaryContent(event.target.value)}
                className="min-h-[430px] resize-none rounded-lg border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-800"
              />
            ) : (
              <div className="space-y-0">
                {summarySections.map((section, index) => (
                  <section
                    key={section.title}
                    className="grid grid-cols-[36px_minmax(0,1fr)] gap-4 border-b border-slate-200 py-3.5 last:border-b-0"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-600">{section.title}</h3>
                      <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-sm leading-6 text-slate-800">
                        {section.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                      {index === 2 ? (
                        <div className="mt-3 max-w-3xl overflow-hidden rounded-lg border border-slate-200">
                          <table className="w-full text-left text-[11px] text-slate-600">
                            <thead className="bg-slate-50 text-slate-900">
                              <tr>
                                <th className="border-b border-r border-slate-200 px-3 py-1.5">Organelle</th>
                                <th className="border-b border-r border-slate-200 px-3 py-1.5">Structure</th>
                                <th className="border-b border-slate-200 px-3 py-1.5">Function</th>
                              </tr>
                            </thead>
                            <tbody>
                              {organelles.map((row) => (
                                <tr key={row[0]}>
                                  {row.map((cell) => (
                                    <td key={cell} className="border-r border-t border-slate-200 px-3 py-1.5 last:border-r-0">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                  </section>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-4 w-4" />
                Last updated 1h ago
                <span className="text-slate-300">|</span>
                {sourceWordCount.toLocaleString()} source words
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSimpleMode(!isSimpleMode)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {isSimpleMode ? "Detailed" : "Simple"}
                </button>
                <button
                  type="button"
                  onClick={() => (isEditing ? handleSaveSummary() : setIsEditing(true))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {isEditing ? "Save" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={openImproveDialog}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Improve
                </button>
                <button
                  type="button"
                  onClick={handleDownloadWorksheet}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                >
                  Add to Notes
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid shrink-0 gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.8fr)]">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
              <MoreButton />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {[
                [FileText, "New Flashcards", "From this topic", "flashcards", "text-purple-600"],
                [CheckCircle2, "Practice Quiz", "10 questions", "quizzes", "text-emerald-600"],
                [Network, "Concept Map", "Visual overview", "mindmap", "text-blue-600"],
                [StickyNote, "Add Note", "Capture thoughts", "notes", "text-amber-600"],
              ].map(([Icon, label, helper, tab, color]) => (
                <button
                  key={String(label)}
                  type="button"
                  onClick={() => onSelectTab(tab as string)}
                  className="flex min-h-[72px] items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm"
                >
                  <Icon className={cn("h-6 w-6", color as string)} />
                  <span>
                    <span className="block text-sm font-bold leading-tight text-slate-900">{label as string}</span>
                    <span className="text-xs text-slate-500">{helper as string}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <h3 className="mb-2 text-sm font-bold text-slate-800">Next Steps</h3>
            <div className="space-y-2 rounded-lg border border-slate-200 p-3">
              {[
                ["Review Mitochondria (Flashcards)", "15 min"],
                ["Take Quiz: Cell Organelles", "20 min"],
                ["Read: Transport Across Membranes", "30 min"],
              ].map(([label, time]) => (
                <button key={label} type="button" className="flex w-full items-center justify-between gap-3 text-left text-xs text-slate-700">
                  <span className="flex items-center gap-2">
                    <Circle className="h-3.5 w-3.5 text-slate-400" />
                    {label}
                  </span>
                  <span className="text-slate-400">{time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoreButton() {
  return (
    <button type="button" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

function StudyCoachPanel({ onSelectTab }: { onSelectTab: (tab: string) => void }) {
  const prompts = [
    [MessageSquare, "Explain the function of mitochondria", "chat"],
    [CheckCircle2, "Give me a practice quiz on cell organelles", "quizzes"],
    [Network, "Help me create a concept map", "mindmap"],
    [FileText, "Summarize the cell membrane", "summary"],
  ] as const;

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-slate-900" />
          <h2 className="text-lg font-bold text-slate-950">AI Coach</h2>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Bell className="h-4 w-4" />
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      <div className="border-b border-slate-200 px-4">
        <div className="flex gap-7">
          <button className="border-b-2 border-blue-600 px-1 py-3 text-sm font-semibold text-blue-600">
            Chat
          </button>
          <button className="border-b-2 border-transparent px-1 py-3 text-sm font-semibold text-slate-500">
            Study Plan
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm leading-6 text-slate-700">
          <p>Hi Alex! 👋</p>
          <p>How can I help you with Cell Structure today?</p>
          <p className="mt-3 text-xs text-slate-500">10:30 AM</p>
        </div>

        <div className="mt-5 space-y-2">
          {prompts.map(([Icon, label, tab]) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelectTab(tab)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3 text-left text-sm font-medium text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50/40"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-blue-600" />
                {label}
              </span>
              <ChevronDown className="-rotate-90 h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>

        <div className="ml-auto mt-6 max-w-[82%] rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-sm leading-6 text-slate-800">
          Can you explain the differences between plant and animal cells?
          <p className="mt-2 text-right text-xs text-slate-500">10:31 AM ✓</p>
        </div>

        <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-slate-600">
          Thinking...
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-lg border border-slate-200 bg-white p-2">
          <div className="flex items-center gap-2">
            <input
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400"
              placeholder="Ask anything..."
            />
            <button className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-white">
              <SendHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            {["Attach", "Images", "Sources"].map((label) => (
              <button key={label} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudyWorkspace() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const packIdParam = searchParams.get("packId");

  // Student OS Integration
  const { osState } = useStudentOS();
  const isFatigued = osState?.flowState === "fatigue";
  const isDeepFocus = osState?.flowState === "deep-focus";

  const document = useQuery(
    api.studyQuery.getDocument,
    docId ? { docId } : "skip",
  ) as any;
  const sharedPack = useQuery(
    api.study.getStudyPack,
    packIdParam ? { packId: packIdParam as any } : "skip",
  ) as any;
  const material = useQuery(
    api.study.getMaterialByDocId,
    docId ? { docId } : "skip",
  );
  const recommendations = useQuery(api.study.getStudyRecommendations, {});
  const improveSummary = useAction(api.autoGenerate.improveSummary);
  const updateDocumentSummary = useMutation(
    api.studyMutations.updateDocumentSummary,
  );
  const ensureMaterialWorkspace = useMutation(
    api.studyMutations.ensureMaterialWorkspace,
  );

  const flashcards = useQuery(
    api.study.listFlashcards,
    material?._id
      ? { materialId: material._id, shareId: packIdParam || undefined }
      : "skip",
  );
  const studyPack = useQuery(
    api.study.getStudyPackByMaterialId,
    material?._id ? { materialId: material._id } : "skip",
  );
  const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);
  const [isGeneratingPack, setIsGeneratingPack] = useState(false);
  const quizzes = useQuery(
    api.study.listQuizzes,
    material?._id
      ? { materialId: material._id, shareId: packIdParam || undefined }
      : "skip",
  );

  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [showImproveDialog, setShowImproveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(tabParam || "summary");
  const [showPlaybooks, setShowPlaybooks] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const demoWorkspaceDocument = isDemoWorkspaceId(docId)
    ? {
        meta: {
          title: "Cell Structure",
        },
        summary: {
          simple: demoSummary,
          detailed: demoSummary,
          short: "Cell theory, membranes, and organelles in one study workspace.",
        },
        extracted: {
          text: demoTranscript,
          sections: [],
        },
        workspaceRecovered: false,
      }
    : null;
  const resolvedDocument =
    document ||
    (sharedPack
      ? {
          meta: {
            title:
              sharedPack.title || sharedPack.sourceTitle || "Shared study pack",
          },
          summary: sharedPack.summary || null,
          extracted: {
            text:
              sharedPack.summary?.detailed ||
              sharedPack.summary?.short ||
              sharedPack.description ||
              "",
            sections: [],
          },
          workspaceRecovered: true,
        }
      : demoWorkspaceDocument);

  useEffect(() => {
    if (resolvedDocument?.summary) {
      // If OS detects fatigue, force simple mode to reduce cognitive load
      const shouldUseSimpleMode = isFatigued ? true : isSimpleMode;
      if (shouldUseSimpleMode !== isSimpleMode) {
        setIsSimpleMode(shouldUseSimpleMode);
        toast("Student OS: Cognitive fatigue detected. Switched to Simple Mode constraints.", { icon: "🧠" });
      }

      setSummaryContent(
        shouldUseSimpleMode
          ? resolvedDocument.summary.simple || ""
          : resolvedDocument.summary.detailed || "",
      );
    }
  }, [resolvedDocument, isSimpleMode, isFatigued]);

  const transcriptText =
    resolvedDocument?.extracted?.text ||
    ((resolvedDocument?.extracted?.sections as any[] | undefined)
      ?.map((section) => section.text)
      .join("\n\n") ??
      "");
  const sourceWordCount = transcriptText.split(/\s+/).filter(Boolean).length;
  const isDocumentLoading =
    Boolean(docId) &&
    !demoWorkspaceDocument &&
    (authLoading ||
      document === undefined ||
      (material === undefined && !sharedPack));
  const hasValidWorkspace = Boolean(docId && user && resolvedDocument);
  const {
    activeSession,
    completeSession,
    androidFocusShieldReady,
    elapsedSeconds: studyTime,
    endSessionEarly,
    remainingBreakSeconds,
    remainingSeconds,
    resumeAfterBreak,
    selectedDuration,
    sessionRecord,
    sessionState,
    setSelectedDuration,
    startFocusSession,
    startForceBreak,
    openAndroidFocusShieldSettings,
  } = useFocusSessionController({
    activityType: "reading",
    enabled: hasValidWorkspace,
    materialId: material?._id,
    surfaceLabel: resolvedDocument?.meta?.title || "Study Workspace",
  });
  useStudyPresence({
    source: "study_workspace",
    route: docId ? `/study/workspace/${docId}` : "/study/workspace",
    currentActivity: activeTab,
    currentSection: activeTab,
    title: resolvedDocument?.meta?.title || "Study Workspace",
    subject: material?.type || undefined,
    materialId: material?._id,
    docId,
    sessionId: activeSession?._id,
    enabled: hasValidWorkspace,
    details: {
      studyTime,
      isSimpleMode,
      hasFlashcards: Boolean(flashcards?.length),
      hasQuizzes: Boolean(quizzes?.length),
      focusPhase: sessionState?.phase || "idle",
    },
  });

  useEffect(() => {
    if (!docId || authLoading || resolvedDocument === undefined || !resolvedDocument?.workspaceRecovered) {
      return;
    }

    void ensureMaterialWorkspace({ docId }).catch(console.error);
  }, [authLoading, docId, resolvedDocument, ensureMaterialWorkspace]);

  const handleSaveSummary = async () => {
    if (!docId || !document) return;

    try {
      await updateDocumentSummary({
        docId,
        summary: {
          ...document.summary,
          [isSimpleMode ? "simple" : "detailed"]: summaryContent,
          short: summaryContent.substring(0, 200) + "...",
        },
      });
      setIsEditing(false);
      toast.success("Summary updated!");
    } catch {
      toast.error("Failed to save summary");
    }
  };

  const handleImproveSummary = async () => {
    if (!summaryContent || !aiInstruction) return;

    setIsImproving(true);
    try {
      const improved = await improveSummary({
        currentSummary: summaryContent,
        instruction: aiInstruction,
      });
      setSummaryContent(improved);
      setAiInstruction("");
      setShowImproveDialog(false);
      toast.success("Summary improved by AI!");
    } catch {
      toast.error("Failed to improve summary");
    } finally {
      setIsImproving(false);
    }
  };

  const applyPlaybookInstruction = (instruction: string) => {
    setAiInstruction(instruction);
    setShowImproveDialog(true);
    if (isEditing) setIsEditing(false);
  };

  const handleDownloadWorksheet = () => {
    if (!resolvedDocument || !summaryContent) {
      toast.error("No content available to generate worksheet");
      return;
    }

    try {
      generateWorksheetPDF({
        title: resolvedDocument.meta.title || "Untitled Worksheet",
        summary: summaryContent,
        flashcards: (flashcards || []).map((f: any) => ({
          front: f.front,
          back: f.back,
        })),
        quizzes: (quizzes || []).flatMap((q: any) =>
          (q.questions || []).map((quest: any) => ({
            question: quest.question,
            options: quest.options,
            correctAnswer: quest.correctAnswer,
            explanation: quest.explanation,
            type: quest.type,
          })),
        ),
        metadata: {
          region: user?.region,
          curriculum: user?.curriculum,
        },
      });
      toast.success("Worksheet generated successfully!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };
  
  const handleCreatePack = async () => {
    if (!material || !transcriptText || isGeneratingPack) return;

    setIsGeneratingPack(true);
    const creationToast = toast.loading("Building your reusable study pack...");
    try {
      await generateAllAssets({
        materialId: material._id,
        content: transcriptText,
        title: material.title,
        docId: material.docId,
      });
      toast.success("Study Pack created! You can now share it with others.", {
        id: creationToast,
      });
    } catch {
      toast.error("Failed to create Study Pack. Please try again.", {
        id: creationToast,
      });
    } finally {
      setIsGeneratingPack(false);
    }
  };

  if (!docId) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-foreground/50">
        Missing workspace source.
      </div>
    );
  }

  const handleSelectTab = (tabId: string) => {
    startTransition(() => {
      setActiveTab(tabId);
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        if (tabId === "summary") {
          nextParams.delete("tab");
        } else {
          nextParams.set("tab", tabId);
        }
        return nextParams;
      });
    });
  };

  const NavButton = ({ id, icon: Icon, label, mobile }: any) => (
    <Button
      variant="ghost"
      onClick={() => handleSelectTab(id)}
      className={cn(
        mobile ? "h-10 flex-1 gap-2 px-3" : "h-11 w-11",
        "rounded-lg p-0 transition-all duration-200",
        activeTab === id
          ? "border border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm dark:border-cyan-500/30 dark:bg-cyan-500/12 dark:text-cyan-200"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-white",
      )}
      title={label}
    >
      <Icon className="h-5 w-5" />
      {mobile ? <span className="text-xs">{label}</span> : null}
    </Button>
  );

  const sidebarContent = (
    <>
      <NavButton id="summary" icon={FileText} label="Summary" />
      <NavButton id="chat" icon={MessageSquare} label="Chat" />
      <NavButton id="flashcards" icon={Brain} label="Flashcards" />
      <NavButton id="quizzes" icon={ListChecks} label="Quizzes" />
      <NavButton id="notes" icon={StickyNote} label="Notes" />
      <NavButton id="mindmap" icon={Network} label="Map" />
      <NavButton id="gaps" icon={TrendingUp} label="Gaps" />
      <NavButton id="diagrams" icon={EyeOff} label="Occlusion" />
    </>
  );

  if (isDocumentLoading) {
    return (
      <StudyWorkspaceLayout
        activeTab={activeTab}
        header={
          <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/study/dashboard")}
                className="h-9 w-9 rounded-lg p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white md:w-auto md:px-3"
              >
                <ArrowLeft className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Back</span>
              </Button>
              <div className="hidden h-6 w-px bg-foreground/10 md:block" />
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-44 animate-pulse rounded-full bg-foreground/[0.08]" />
                  <div className="h-3 w-28 animate-pulse rounded-full bg-foreground/[0.05]" />
                </div>
              </div>
            </div>
            <div className="h-9 w-28 animate-pulse rounded-lg bg-foreground/[0.05]" />
          </header>
        }
        topBar={
          <div className="flex items-center gap-3 overflow-x-auto border-b border-slate-200 bg-slate-50/80 px-4 py-2 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="h-3 w-24 animate-pulse rounded-full bg-foreground/[0.07]" />
            <div className="h-4 w-px bg-border" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-foreground/[0.06]" />
          </div>
        }
        sidebar={sidebarContent}
        content={
          <div className="flex min-h-0 flex-col">
            <div className="border-b border-border bg-foreground/[0.02] p-6">
              <div className="h-6 w-32 animate-pulse rounded-full bg-foreground/[0.08]" />
            </div>
            <WorkspacePanelFallback label="Loading workspace content..." />
          </div>
        }
        chat={
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-foreground/[0.02] p-4">
              <div className="h-4 w-28 animate-pulse rounded-full bg-foreground/[0.08]" />
              <div className="h-3 w-16 animate-pulse rounded-full bg-foreground/[0.05]" />
            </div>
            <WorkspacePanelFallback
              label="Connecting your study assistant..."
              compact
            />
          </>
        }
      />
    );
  }

  if (!resolvedDocument) {
    if (sharedPack) {
      return (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
            Loading shared study pack...
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
          This workspace could not be found.
        </div>
      </div>
    );
  }

  return (
    <StudyWorkspaceLayout
      activeTab={activeTab}
      header={
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/study/dashboard")}
              className="h-9 w-9 rounded-lg p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white md:w-auto md:px-3"
            >
              <ArrowLeft className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Back</span>
            </Button>
            <div className="hidden min-w-[210px] max-w-[250px] items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex">
              <span className="truncate text-sm font-bold text-slate-950">
                Biology 101 - {resolvedDocument.meta.title || "Untitled Document"}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="hidden min-w-0 items-center gap-2 lg:flex">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-500">Focus</span>
              <span className="font-mono text-xl font-bold text-slate-950">25:00</span>
              <button
                type="button"
                onClick={() => startFocusSession()}
                className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100"
              >
                Start
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSelectTab("flashcards")}
              className="flex max-w-[210px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left shadow-sm hover:bg-slate-50"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-blue-500 text-blue-600">
                <Clock className="h-4 w-4" />
              </div>
              <span>
                <span className="block text-xs font-semibold text-slate-500">Next up</span>
                <span className="block truncate text-sm font-bold text-slate-950">Review Mitochondria</span>
              </span>
              <ChevronDown className="-rotate-90 h-4 w-4 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden h-10 w-10 rounded-lg text-slate-500 hover:bg-slate-100 xl:inline-flex">
              <BarChart3 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden h-10 w-10 rounded-lg text-slate-500 hover:bg-slate-100 xl:inline-flex">
              <Bell className="h-5 w-5" />
            </Button>

            {material ? (
              <ShareButton
                id={material._id}
                type="material"
                title={material.title}
                isPublic={material.isPublic}
                existingShareId={material.shareId}
              />
            ) : (
              <Button variant="outline" className="hidden rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 xl:inline-flex">
                <Users className="mr-2 h-4 w-4" />
                Share
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleDownloadWorksheet}
              className="hidden rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 md:inline-flex"
            >
              Export
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>

          </div>
        </header>
      }
      topBar={
        null
      }
      sidebar={sidebarContent}
      content={
        <>
          <Dialog open={showImproveDialog} onOpenChange={setShowImproveDialog}>
            <DialogContent className="border-slate-200 bg-white text-slate-950">
              <DialogHeader>
                <DialogTitle>Improve Summary</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder="How should Cryonex improve this summary?"
                  value={aiInstruction}
                  onChange={(event) => setAiInstruction(event.target.value)}
                  className="min-h-[120px] rounded-lg border-slate-200 bg-slate-50 text-slate-900"
                />
                <Button
                  onClick={handleImproveSummary}
                  disabled={isImproving || !aiInstruction}
                  className="w-full rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isImproving ? (
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Improve
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {activeTab === "summary" ? (
            <StudySummaryCanvas
              title={resolvedDocument.meta.title || "Untitled Document"}
              isSimpleMode={isSimpleMode}
              setIsSimpleMode={setIsSimpleMode}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              summaryContent={summaryContent}
              setSummaryContent={setSummaryContent}
              handleSaveSummary={handleSaveSummary}
              handleDownloadWorksheet={handleDownloadWorksheet}
              openImproveDialog={() => setShowImproveDialog(true)}
              onSelectTab={handleSelectTab}
              sourceWordCount={sourceWordCount}
            />
          ) : null}

          {activeTab === "chat" ? (
            <Suspense
              fallback={
                <WorkspacePanelFallback label="Connecting study chat..." />
              }
            >
              <PDFChat docId={docId} title={resolvedDocument.meta.title || "Untitled document"} />
            </Suspense>
          ) : null}

          {activeTab === "flashcards" ? (
            <Suspense
              fallback={
                <WorkspacePanelFallback label="Preparing flashcards..." />
              }
            >
              <StudyFlashcards
                materialId={material?._id}
                autoContent={transcriptText}
                title={resolvedDocument.meta.title || "Untitled document"}
              />
            </Suspense>
          ) : null}

          {activeTab === "quizzes" ? (
            <Suspense
              fallback={<WorkspacePanelFallback label="Preparing quizzes..." />}
            >
              <StudyQuizzes
                materialId={material?._id}
                shareId={packIdParam || undefined}
                autoContent={transcriptText}
                title={resolvedDocument.meta.title || "Untitled document"}
              />
            </Suspense>
          ) : null}

          {activeTab === "notes" ? (
            <Suspense
              fallback={<WorkspacePanelFallback label="Loading notes..." />}
            >
              <StudyNotes
                content={resolvedDocument.summary?.detailed || transcriptText}
                title={resolvedDocument.meta.title || "Untitled document"}
                materialId={material?._id}
              />
            </Suspense>
          ) : null}

          {activeTab === "mindmap" ? (
            <Suspense
              fallback={
                <WorkspacePanelFallback label="Building concept map..." />
              }
            >
              <StudyConceptMap
                title={resolvedDocument.meta.title || "Untitled document"}
                autoContent={transcriptText}
                materialId={material?._id}
              />
            </Suspense>
          ) : null}

          {activeTab === "gaps" ? (
            <Suspense
              fallback={
                <WorkspacePanelFallback label="Analyzing knowledge gaps..." />
              }
            >
              <div className="min-h-0 h-full overflow-y-auto p-6">
                <KnowledgeGapDashboard materialId={material?._id} />
              </div>
            </Suspense>
          ) : null}

          {activeTab === "diagrams" ? (
            <Suspense
              fallback={
                <WorkspacePanelFallback label="Preparing occlusion study..." />
              }
            >
              <ImageOcclusionTool materialId={material?._id} />
            </Suspense>
          ) : null}
        </>
      }
      chat={
        <StudyCoachPanel onSelectTab={handleSelectTab} />
      }
    />
  );
}
