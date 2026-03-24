import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Gauge,
  Globe2,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildCurriculumPersonalization,
  type StudyPace,
} from "@/lib/curriculumPersonalization";
import { cn } from "@/lib/utils";

interface RegionalTrainerProps {
  region?: string;
  country?: string;
  curriculum?: string;
  curriculumTrack?: string;
  gradeLevel?: string;
  targetSubjects?: string[];
  targetExams?: string[];
  studyPace?: StudyPace;
  preferredLanguage?: "en" | "ar";
  onExit: () => void;
}

export function RegionalTrainer({
  region,
  country,
  curriculum,
  curriculumTrack,
  gradeLevel,
  targetSubjects,
  targetExams,
  studyPace,
  preferredLanguage,
  onExit,
}: RegionalTrainerProps) {
  const blueprint = useMemo(
    () =>
      buildCurriculumPersonalization({
        region,
        country,
        curriculum,
        curriculumTrack,
        gradeLevel,
        targetSubjects,
        targetExams,
        studyPace,
        preferredLanguage,
      }),
    [
      region,
      country,
      curriculum,
      curriculumTrack,
      gradeLevel,
      targetSubjects,
      targetExams,
      studyPace,
      preferredLanguage,
    ],
  );

  const [selectedLaneId, setSelectedLaneId] = useState(
    blueprint.trainerLanes[0]?.id || "",
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [sessionState, setSessionState] = useState<
    "chooser" | "playing" | "results"
  >("chooser");

  useEffect(() => {
    setSelectedLaneId(blueprint.trainerLanes[0]?.id || "");
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setStreak(0);
    setBestStreak(0);
    setSessionState("chooser");
  }, [blueprint]);

  const selectedLane =
    blueprint.trainerLanes.find((lane) => lane.id === selectedLaneId) ||
    blueprint.trainerLanes[0];
  const currentQuestion = selectedLane?.questions[questionIndex];
  const accuracy =
    questionIndex === 0 && selectedAnswer === null
      ? 0
      : Math.round(
          (correctAnswers /
            Math.max(questionIndex + (selectedAnswer !== null ? 1 : 0), 1)) *
            100,
        );

  const resetSession = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setStreak(0);
    setBestStreak(0);
    setSessionState("chooser");
  };

  const startLane = (laneId: string) => {
    setSelectedLaneId(laneId);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setStreak(0);
    setBestStreak(0);
    setSessionState("playing");
  };

  const handleAnswer = (answerIndex: number) => {
    if (!currentQuestion || selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    if (answerIndex === currentQuestion.answerIndex) {
      setCorrectAnswers((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((currentBest) => Math.max(currentBest, next));
        return next;
      });
      return;
    }

    setStreak(0);
  };

  const advanceQuestion = () => {
    if (!selectedLane) return;

    if (questionIndex >= selectedLane.questions.length - 1) {
      setSessionState("results");
      setSelectedAnswer(null);
      return;
    }

    setQuestionIndex((prev) => prev + 1);
    setSelectedAnswer(null);
  };

  if (!selectedLane) {
    return (
      <div className="flex h-full items-center justify-center bg-[#09090b] text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-lg font-semibold">
            No trainer lanes available yet.
          </p>
          <Button className="mt-4" onClick={onExit}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-5 text-white md:px-6 md:py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-[30px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200">
              <Trophy className="h-3.5 w-3.5" />
              Regional training upgraded
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">
              {blueprint.trainerTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58 md:text-base">
              {blueprint.trainerDescription}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                blueprint.countryLabel,
                blueprint.curriculumLabel,
                blueprint.stageLabel,
                blueprint.languageMode,
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] text-white/62"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-[24px] border border-white/10 bg-black/25 px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
                Recommended exams
              </p>
              <p className="mt-2 text-sm text-white/75">
                {blueprint.selectedExams.join(" • ")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onExit}
              aria-label="Close regional trainer"
              className="h-11 w-11 rounded-full border border-white/10 bg-black/25 text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              <Globe2 className="h-3.5 w-3.5" />
              Training lanes
            </div>
            <div className="mt-4 space-y-3">
              {blueprint.trainerLanes.map((lane) => (
                <button
                  key={lane.id}
                  type="button"
                  onClick={() =>
                    sessionState === "playing"
                      ? setSelectedLaneId(lane.id)
                      : startLane(lane.id)
                  }
                  className={cn(
                    "w-full rounded-[24px] border p-4 text-left transition-colors",
                    selectedLane.id === lane.id
                      ? "border-amber-400/30 bg-amber-400/10"
                      : "border-white/10 bg-black/20 hover:bg-white/[0.05]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {lane.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {lane.description}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 text-white/35" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {lane.focusTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/42">
                <Sparkles className="h-3.5 w-3.5" />
                Why this lane exists
              </div>
              <div className="mt-3 space-y-2">
                {blueprint.insights.map((insight) => (
                  <div
                    key={insight}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-white/58"
                  >
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="rounded-[30px] border border-white/10 bg-[#0b0f1e]/92 p-5 md:p-6">
            {sessionState === "chooser" ? (
              <div className="grid gap-4">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                        Featured lane
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">
                        {selectedLane.label}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
                        {selectedLane.description}
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[
                        {
                          label: "Questions",
                          value: selectedLane.questions.length,
                          icon: BrainCircuit,
                        },
                        {
                          label: "Focus",
                          value: blueprint.selectedSubjects
                            .slice(0, 2)
                            .join(" / "),
                          icon: Target,
                        },
                        {
                          label: "Pace",
                          value: blueprint.paceLabel,
                          icon: Gauge,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[22px] border border-white/10 bg-black/25 px-4 py-3"
                        >
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/42">
                            <item.icon className="h-3.5 w-3.5" />
                            {item.label}
                          </div>
                          <p className="mt-2 text-sm font-semibold text-white/78">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => startLane(selectedLane.id)}
                    className="mt-5 rounded-full bg-amber-500 px-6 font-semibold text-black hover:bg-amber-400"
                  >
                    Start lane
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {blueprint.studyPacks.slice(0, 2).map((pack) => (
                    <div
                      key={pack.id}
                      className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                    >
                      <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                        Best follow-up pack
                      </p>
                      <h4 className="mt-2 text-lg font-semibold text-white">
                        {pack.title}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-white/58">
                        {pack.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pack.outputs.map((output) => (
                          <span
                            key={output}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55"
                          >
                            {output}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {sessionState === "playing" && currentQuestion ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedLane.id}-${questionIndex}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  className="space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/60">
                        {selectedLane.label}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/60">
                        Question {questionIndex + 1} /{" "}
                        {selectedLane.questions.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                        Correct {correctAnswers}
                      </span>
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
                        Streak {bestStreak}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-300 transition-all duration-300"
                      style={{
                        width: `${((questionIndex + 1) / selectedLane.questions.length) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                          {currentQuestion.type}
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold leading-relaxed text-white">
                          {currentQuestion.prompt}
                        </h3>
                      </div>
                      <div className="rounded-[20px] border border-white/10 bg-black/25 px-4 py-3 text-right">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
                          Accuracy
                        </p>
                        <p className="mt-2 text-xl font-semibold text-white">
                          {accuracy}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3">
                      {currentQuestion.options.map((option, optionIndex) => {
                        const isCorrect =
                          optionIndex === currentQuestion.answerIndex;
                        const isChosen = optionIndex === selectedAnswer;

                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={selectedAnswer !== null}
                            onClick={() => handleAnswer(optionIndex)}
                            className={cn(
                              "flex w-full items-center gap-4 rounded-[22px] border p-4 text-left transition-colors",
                              selectedAnswer === null &&
                                "border-white/10 bg-black/25 hover:bg-white/[0.06]",
                              selectedAnswer !== null && "cursor-default",
                              isChosen &&
                                !isCorrect &&
                                "border-rose-400/35 bg-rose-400/10",
                              isCorrect &&
                                selectedAnswer !== null &&
                                "border-emerald-400/35 bg-emerald-400/10",
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] font-semibold text-white/70",
                                isCorrect &&
                                  selectedAnswer !== null &&
                                  "bg-emerald-400/20 text-emerald-100",
                                isChosen &&
                                  !isCorrect &&
                                  "bg-rose-400/20 text-rose-100",
                              )}
                            >
                              {selectedAnswer !== null ? (
                                isCorrect ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  String.fromCharCode(65 + optionIndex)
                                )
                              ) : (
                                String.fromCharCode(65 + optionIndex)
                              )}
                            </div>
                            <span className="text-sm leading-6 text-white/78">
                              {option}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {selectedAnswer !== null ? (
                      <div className="mt-5 rounded-[22px] border border-white/10 bg-black/25 p-4">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
                          Explanation
                        </p>
                        <p className="mt-2 text-sm leading-7 text-white/68">
                          {currentQuestion.explanation}
                        </p>
                        <Button
                          onClick={advanceQuestion}
                          className="mt-4 rounded-full bg-white text-black hover:bg-white/90"
                        >
                          {questionIndex >= selectedLane.questions.length - 1
                            ? "See results"
                            : "Next question"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : null}

            {sessionState === "results" ? (
              <div className="space-y-5">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                        Session complete
                      </p>
                      <h3 className="mt-2 text-3xl font-semibold text-white">
                        {correctAnswers} / {selectedLane.questions.length}{" "}
                        correct
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
                        The next best move is to take the weakest parts of this
                        lane and convert them into one of your starter packs.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        {
                          label: "Accuracy",
                          value: `${Math.round((correctAnswers / selectedLane.questions.length) * 100)}%`,
                        },
                        { label: "Best streak", value: String(bestStreak) },
                        { label: "Lane", value: selectedLane.label },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[22px] border border-white/10 bg-black/25 px-4 py-3"
                        >
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
                            {item.label}
                          </p>
                          <p className="mt-2 text-lg font-semibold text-white">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {blueprint.studyPacks.slice(0, 2).map((pack) => (
                    <div
                      key={pack.id}
                      className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                    >
                      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                        Recommended next pack
                      </p>
                      <h4 className="mt-2 text-lg font-semibold text-white">
                        {pack.title}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-white/58">
                        {pack.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pack.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => startLane(selectedLane.id)}
                    className="rounded-full bg-amber-500 px-5 font-semibold text-black hover:bg-amber-400"
                  >
                    Replay lane
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetSession}
                    className="rounded-full border-white/15 bg-black/25 text-white hover:bg-white/[0.06]"
                  >
                    Change lane
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onExit}
                    className="rounded-full text-white/70 hover:bg-white/[0.06] hover:text-white"
                  >
                    Back to dashboard
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
