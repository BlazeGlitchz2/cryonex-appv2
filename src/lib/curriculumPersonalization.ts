export type StudyPace = "light" | "balanced" | "intensive";

export interface CurriculumPersonalizationInput {
  country?: string;
  region?: string;
  curriculum?: string;
  curriculumTrack?: string;
  gradeLevel?: string;
  targetSubjects?: string[];
  targetExams?: string[];
  studyPace?: StudyPace;
  preferredLanguage?: "en" | "ar";
}

export interface StarterStudyPackModule {
  id: string;
  title: string;
  description: string;
  focus: string;
  subjects: string[];
  outputs: string[];
  prompt: string;
  accent: "emerald" | "cyan" | "amber" | "rose";
}

export interface TrainerQuestion {
  id: string;
  type: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface TrainerLane {
  id: string;
  label: string;
  description: string;
  focusTags: string[];
  questions: TrainerQuestion[];
}

export interface CurriculumBlueprint {
  countryId: string;
  countryLabel: string;
  curriculumLabel: string;
  curriculumFamily: string;
  stageLabel: string;
  stageDescription: string;
  paceLabel: string;
  languageMode: string;
  recommendedSubjects: string[];
  selectedSubjects: string[];
  recommendedExams: string[];
  selectedExams: string[];
  studyPacks: StarterStudyPackModule[];
  trainerTitle: string;
  trainerDescription: string;
  trainerLanes: TrainerLane[];
  insights: string[];
}

type Accent = StarterStudyPackModule["accent"];

const COUNTRY_LABELS: Record<string, string> = {
  sa: "Saudi Arabia",
  eg: "Egypt",
  uk: "United Kingdom",
  us: "United States",
  ae: "United Arab Emirates",
  global: "Global",
};

const DEFAULT_SUBJECTS = ["Mathematics", "English", "Science", "History"];

const PACE_LABELS: Record<StudyPace, string> = {
  light: "Light pace",
  balanced: "Balanced pace",
  intensive: "Intensive pace",
};

function dedupe(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

function normalizeCountry(country?: string, region?: string) {
  const value = String(country || region || "global").toLowerCase();
  if (value === "ksa") return "sa";
  if (value === "egypt") return "eg";
  if (value === "uae") return "ae";
  if (["sa", "eg", "uk", "us", "ae"].includes(value)) return value;
  return "global";
}

function parseGradeLevel(gradeLevel?: string) {
  const value = String(gradeLevel || "").toLowerCase();
  const match = value.match(/grade\s*(\d{1,2})/i);
  if (match?.[1]) return Number(match[1]);
  if (value.includes("freshman")) return 9;
  if (value.includes("sophomore")) return 10;
  if (value.includes("junior")) return 11;
  if (value.includes("senior")) return 12;
  if (value.includes("year 1")) return 13;
  if (value.includes("year 2")) return 14;
  return null;
}

function inferCurriculumFamily(input: CurriculumPersonalizationInput) {
  const value = String(
    input.curriculumTrack || input.curriculum || "",
  ).toLowerCase();

  if (value.includes("nile")) return "nile";
  if (value.includes("thanaweya") || value.includes("egyptian national"))
    return "egypt_national";
  if (value.includes("saudi national") || value.includes("secondary tracks"))
    return "saudi_national";
  if (value.includes("british") || value.includes("igcse")) return "british";
  if (value.includes("a-level")) return "a_level";
  if (value.includes("gcse")) return "gcse";
  if (value.includes("scottish")) return "scottish";
  if (value.includes("common core")) return "common_core";
  if (
    value.includes("advanced placement") ||
    value === "ap" ||
    value.includes(" ap")
  )
    return "ap";
  if (value.includes("honors")) return "honors";
  if (value.includes("ib")) return "ib";
  if (value.includes("american")) return "american";
  return "general";
}

function pickSelectedSubjects(
  selectedSubjects: string[] | undefined,
  recommendedSubjects: string[],
) {
  return dedupe(
    (selectedSubjects?.length ? selectedSubjects : recommendedSubjects).slice(
      0,
      5,
    ),
  );
}

function pickSelectedExams(
  selectedExams: string[] | undefined,
  recommendedExams: string[],
) {
  return dedupe(
    (selectedExams?.length ? selectedExams : recommendedExams).slice(0, 3),
  );
}

function describeLanguageMode(
  countryId: string,
  preferredLanguage?: "en" | "ar",
) {
  if (preferredLanguage === "ar") return "Arabic-first explanations";
  if (preferredLanguage === "en") {
    return countryId === "sa" || countryId === "eg" || countryId === "ae"
      ? "English-first with Arabic support"
      : "English-first explanations";
  }

  return countryId === "sa" || countryId === "eg" || countryId === "ae"
    ? "Arabic-first bilingual mode"
    : "English-first explanations";
}

function createPack(args: {
  id: string;
  title: string;
  description: string;
  focus: string;
  subjects: string[];
  outputs: string[];
  prompt: string;
  accent: Accent;
}): StarterStudyPackModule {
  return args;
}

function buildSaudiBlueprint(
  input: CurriculumPersonalizationInput,
): CurriculumBlueprint {
  const grade = parseGradeLevel(input.gradeLevel);
  const family = inferCurriculumFamily(input);
  const curriculumLabel =
    input.curriculum ||
    (family === "british"
      ? "British (IGCSE / A-Level)"
      : family === "american"
        ? "American"
        : family === "ib"
          ? "IB"
          : "Saudi National (Secondary Tracks)");

  let stageLabel = "Saudi starter lane";
  let stageDescription =
    "A personalized Saudi lane should branch by school system, grade band, and exam intent.";
  let recommendedSubjects = [
    "Arabic",
    "Mathematics",
    "Science",
    "English",
    "Islamic Studies",
    "Social Studies",
  ];
  let recommendedExams =
    family === "saudi_national" || family === "general"
      ? ["GAT (Qudurat)"]
      : ["IGCSE / A-Level", "GAT (Qudurat)"];

  if (grade === 6) {
    stageLabel = "Grade 6 bridge";
    stageDescription =
      "Bridge primary into intermediate with Arabic, math, science, and English diagnostics plus habit-building.";
    recommendedSubjects = ["Arabic", "Mathematics", "Science", "English"];
    recommendedExams = ["No admissions exam yet"];
  } else if (grade && grade <= 9) {
    stageLabel = "Intermediate foundation";
    stageDescription =
      "Grades 7-9 should stay broad, bilingual, and strong in Arabic, math, science, and English before secondary sorting.";
    recommendedSubjects = [
      "Arabic",
      "Mathematics",
      "Science",
      "English",
      "Islamic Studies",
      "Social Studies",
    ];
    recommendedExams =
      grade === 9 ? ["NAFS readiness", "GAT (Qudurat)"] : ["GAT (Qudurat)"];
  } else if (grade === 10) {
    stageLabel = "Secondary common year";
    stageDescription =
      "Grade 10 should mix common-year mastery, track discovery, and first-pass admissions diagnostics.";
    recommendedSubjects = [
      "Arabic",
      "Mathematics",
      "Integrated Science",
      "English",
      "Financial Knowledge",
      "Track exploration",
    ];
    recommendedExams = ["GAT (Qudurat)", "STEP"];
  } else if (grade && grade >= 11) {
    stageLabel = "Specialization + admissions";
    stageDescription =
      "Grades 11-12 should combine school-track depth with Saudi admissions overlays like GAT and SAAT.";
    recommendedSubjects =
      family === "british" || family === "american" || family === "ib"
        ? ["Mathematics", "Science", "English", "Arabic support"]
        : [
            "Track specialization",
            "Mathematics",
            "Science",
            "Arabic",
            "English",
          ];
    recommendedExams =
      family === "british" || family === "american" || family === "ib"
        ? ["GAT (Qudurat)", "SAAT", "STEP"]
        : ["GAT (Qudurat)", "SAAT", "STEP"];
  }

  const selectedSubjects = pickSelectedSubjects(
    input.targetSubjects,
    recommendedSubjects,
  );
  const selectedExams = pickSelectedExams(input.targetExams, recommendedExams);
  const subjectLabel = selectedSubjects.join(", ");

  return {
    countryId: "sa",
    countryLabel: COUNTRY_LABELS.sa,
    curriculumLabel,
    curriculumFamily: family,
    stageLabel,
    stageDescription,
    paceLabel: PACE_LABELS[input.studyPace || "balanced"],
    languageMode: describeLanguageMode("sa", input.preferredLanguage),
    recommendedSubjects,
    selectedSubjects,
    recommendedExams,
    selectedExams,
    studyPacks: [
      createPack({
        id: "sa-foundation-pack",
        title: "Saudi foundation pack",
        description:
          "Build the local core with bilingual explanations, misconception tracking, and unit-by-unit review.",
        focus: stageLabel,
        subjects: selectedSubjects.slice(0, 4),
        outputs: [
          "diagnostic checklist",
          "retrieval cards",
          "bilingual glossary",
        ],
        prompt: `Build a Saudi-focused starter study pack for ${stageLabel}. Prioritize ${subjectLabel}. Use ${describeLanguageMode(
          "sa",
          input.preferredLanguage,
        )}. Include a diagnostic, weekly retrieval plan, bilingual glossary, and the top weak-topic checklist.`,
        accent: "emerald",
      }),
      createPack({
        id: "sa-exam-pack",
        title: "Admissions exam overlay",
        description:
          "Layer local admissions logic into the same study flow instead of separating school and exam prep.",
        focus: selectedExams.join(" + "),
        subjects: selectedExams,
        outputs: ["timed drill set", "mistake log", "readiness heatmap"],
        prompt: `Create a Saudi admissions overlay pack for ${selectedExams.join(
          ", ",
        )}. Mix timed drills, weak-skill tracking, pacing advice, and a 2-week checkpoint loop that fits ${stageLabel}.`,
        accent: "amber",
      }),
      createPack({
        id: "sa-track-pack",
        title: "Track-depth pack",
        description:
          "Move beyond generic summaries with subject bundles that match the student's current specialization or likely route.",
        focus:
          family === "saudi_national" || family === "general"
            ? "National track depth"
            : "International-in-Saudi overlay",
        subjects:
          family === "saudi_national" || family === "general"
            ? selectedSubjects
            : ["Arabic support", ...selectedSubjects.slice(0, 3)],
        outputs: ["high-yield notes", "exam questions", "concept map"],
        prompt: `Design a track-depth study pack for a Saudi student following ${curriculumLabel}. Focus on ${subjectLabel}. Add concept maps, exam-style questions, and a weak-topic intervention loop.`,
        accent: "cyan",
      }),
      createPack({
        id: "sa-language-pack",
        title: "Arabic + English mastery pack",
        description:
          "Keep Arabic-first clarity without losing the English terminology students need for science and international pathways.",
        focus: "Bilingual precision",
        subjects: [
          "Arabic",
          "English terminology",
          ...selectedSubjects.slice(0, 2),
        ],
        outputs: [
          "dual-language definitions",
          "translation pitfalls",
          "speaking prompts",
        ],
        prompt: `Turn the current topics into an Arabic-first bilingual study pack for a Saudi learner. Keep English scientific terms, explain them in clear Arabic, and add translation traps to avoid.`,
        accent: "rose",
      }),
    ],
    trainerTitle:
      grade && grade >= 10
        ? "Saudi exam + track trainer"
        : "Saudi foundation trainer",
    trainerDescription:
      "Use Saudi-specific lanes for Qudurat, SAAT, bilingual core subjects, and track discovery.",
    trainerLanes: [
      {
        id: "sa-qudurat",
        label: "Qudurat sprint",
        description:
          "Analytical, verbal, and quantitative pressure aligned to Saudi admissions habits.",
        focusTags: ["reasoning", "timed", "admissions"],
        questions: [
          {
            id: "sa-q1",
            type: "verbal analogy",
            prompt: "LION : PRIDE :: FISH : ?",
            options: ["School", "Nest", "Pack", "Hive"],
            answerIndex: 0,
            explanation:
              "A pride is a group of lions; a school is the matching collective noun for fish.",
          },
          {
            id: "sa-q2",
            type: "quantitative reasoning",
            prompt:
              "A study plan covers 5 units in 15 days at a constant rate. How many units are covered in 9 days?",
            options: ["2", "3", "4", "5"],
            answerIndex: 1,
            explanation:
              "The rate is 5/15 = 1/3 unit per day, so in 9 days the student covers 3 units.",
          },
          {
            id: "sa-q3",
            type: "reading logic",
            prompt:
              "If every science track student studies chemistry, and Sara studies chemistry, what can you conclude?",
            options: [
              "Sara is definitely in the science track",
              "Sara might be in the science track",
              "Sara is not in the science track",
              "No conclusion is possible",
            ],
            answerIndex: 1,
            explanation:
              "The statement is one-way only. Chemistry is required for the track, but others may also study it.",
          },
        ],
      },
      {
        id: "sa-saat",
        label: "SAAT science lane",
        description:
          "High-yield science and math recall for students aiming at Saudi science admissions.",
        focusTags: ["science", "content mastery", "timed"],
        questions: [
          {
            id: "sa-s1",
            type: "chemistry",
            prompt:
              "Which change best describes oxidation in a basic school chemistry context?",
            options: [
              "Gain of neutrons",
              "Loss of electrons",
              "Decrease in temperature",
              "Formation of a mixture",
            ],
            answerIndex: 1,
            explanation:
              "Oxidation is commonly framed as the loss of electrons.",
          },
          {
            id: "sa-s2",
            type: "biology",
            prompt:
              "Which body system is primarily responsible for transporting oxygen around the body?",
            options: ["Digestive", "Circulatory", "Skeletal", "Nervous"],
            answerIndex: 1,
            explanation:
              "The circulatory system transports oxygen via blood and the cardiovascular network.",
          },
          {
            id: "sa-s3",
            type: "mathematics",
            prompt: "If f(x) = 2x + 3, what is f(4)?",
            options: ["8", "10", "11", "14"],
            answerIndex: 2,
            explanation: "Substitute x = 4. The result is 2(4) + 3 = 11.",
          },
        ],
      },
      {
        id: "sa-bilingual-core",
        label: "Bilingual core boost",
        description:
          "Sharpen Arabic-first explanations while keeping English terminology for science-heavy study.",
        focusTags: ["bilingual", "terminology", "clarity"],
        questions: [
          {
            id: "sa-b1",
            type: "terminology",
            prompt:
              "Which study move best supports bilingual science revision?",
            options: [
              "Memorize English terms only",
              "Write Arabic definitions with English keywords",
              "Avoid diagrams",
              "Skip translation practice",
            ],
            answerIndex: 1,
            explanation:
              "Arabic explanations plus English keywords keeps understanding and exam terminology connected.",
          },
          {
            id: "sa-b2",
            type: "study strategy",
            prompt:
              "A strong Saudi weekly review loop should usually end with:",
            options: [
              "A new textbook chapter only",
              "A retrieval quiz and mistake review",
              "No recap",
              "A color-coded title page",
            ],
            answerIndex: 1,
            explanation:
              "Retention improves when the week ends with recall and a mistake log, not passive rereading.",
          },
          {
            id: "sa-b3",
            type: "track choice",
            prompt:
              "Which path is most science-heavy in the Saudi secondary tracks?",
            options: [
              "Business Administration",
              "Sharia",
              "Health and Life",
              "General only",
            ],
            answerIndex: 2,
            explanation:
              "Health and Life is the most directly science-oriented route and pairs naturally with SAAT-style preparation.",
          },
        ],
      },
    ],
    insights: [
      "Saudi students usually need school-study and admissions-prep in the same dashboard.",
      "Arabic-first output should stay visible even when the learner studies in English-heavy subjects.",
      "The strongest branching question is school system first, then stage, then exam intent.",
    ],
  };
}

function buildEgyptBlueprint(
  input: CurriculumPersonalizationInput,
): CurriculumBlueprint {
  const grade = parseGradeLevel(input.gradeLevel);
  const family = inferCurriculumFamily(input);
  const curriculumLabel =
    input.curriculum ||
    (family === "nile"
      ? "Nile International"
      : family === "british"
        ? "British (IGCSE / A-Level)"
        : family === "american"
          ? "American Diploma"
          : family === "ib"
            ? "IB"
            : "Egyptian National (Preparatory / Thanaweya Amma)");

  let stageLabel = "Egypt starter lane";
  let stageDescription =
    "A strong Egypt flow should branch by stage, curriculum family, and stream rather than only country.";
  let recommendedSubjects = [
    "Arabic",
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
  ];
  let recommendedExams =
    family === "nile"
      ? ["CNIPE / CNISE"]
      : family === "british"
        ? ["IGCSE / A-Level"]
        : family === "american"
          ? ["SAT"]
          : family === "ib"
            ? ["IB assessments"]
            : ["Preparatory certificate", "Thanaweya Amma"];

  if (grade && grade <= 8) {
    stageLabel = "Preparatory foundation";
    stageDescription =
      "Grades 7-8 should stay broad with Arabic, English, math, science, and social studies reinforced together.";
    recommendedSubjects = [
      "Arabic",
      "English",
      "Mathematics",
      "Science",
      "Social Studies",
      "Computer",
    ];
    recommendedExams = ["Preparatory certificate"];
  } else if (grade === 9) {
    stageLabel = "Preparatory certificate year";
    stageDescription =
      "Grade 9 needs exam-blueprint practice, timed mini-mocks, and clear pathway guidance into secondary options.";
    recommendedSubjects = [
      "Arabic",
      "English",
      "Mathematics",
      "Science",
      "Social Studies",
    ];
    recommendedExams = ["Preparatory certificate", "Pathway selection"];
  } else if (grade === 10) {
    stageLabel = "Secondary foundation";
    stageDescription =
      "Grade 10 should introduce assessment style early and separate mastery packs from exam-prep packs.";
    recommendedSubjects = [
      "Arabic",
      "First foreign language",
      "Mathematics",
      "Integrated Science",
      "History",
      "Philosophy and Logic",
    ];
    recommendedExams =
      family === "nile"
        ? ["CNISE Level 1"]
        : family === "british"
          ? ["IGCSE"]
          : family === "american"
            ? ["SAT"]
            : family === "ib"
              ? ["IB assessments"]
              : ["Thanaweya Amma readiness"];
  } else if (grade && grade >= 11) {
    stageLabel = "Specialization + exam year";
    stageDescription =
      "Grades 11-12 should split stream-aware subject bundles, timed checkpoints, and board-specific exam technique.";
    recommendedSubjects =
      family === "nile"
        ? ["Mathematics", "Science", "English", "Business / ICT"]
        : family === "british"
          ? ["Chosen IGCSE / A-Level subjects", "English", "Mathematics"]
          : family === "american"
            ? ["Course roster", "English", "Mathematics", "Science"]
            : family === "ib"
              ? ["Subject groups", "TOK / EE / IA"]
              : ["Arabic", "First foreign language", "Stream subjects"];
    recommendedExams =
      family === "nile"
        ? ["CNISE Level 2 / 3"]
        : family === "british"
          ? ["IGCSE / A-Level"]
          : family === "american"
            ? ["SAT", "AP"]
            : family === "ib"
              ? ["IB assessments"]
              : ["Thanaweya Amma"];
  }

  const selectedSubjects = pickSelectedSubjects(
    input.targetSubjects,
    recommendedSubjects,
  );
  const selectedExams = pickSelectedExams(input.targetExams, recommendedExams);
  const subjectLabel = selectedSubjects.join(", ");

  return {
    countryId: "eg",
    countryLabel: COUNTRY_LABELS.eg,
    curriculumLabel,
    curriculumFamily: family,
    stageLabel,
    stageDescription,
    paceLabel: PACE_LABELS[input.studyPace || "balanced"],
    languageMode: describeLanguageMode("eg", input.preferredLanguage),
    recommendedSubjects,
    selectedSubjects,
    recommendedExams,
    selectedExams,
    studyPacks: [
      createPack({
        id: "eg-core-pack",
        title: "Egypt core mastery pack",
        description:
          "Anchor Arabic-first understanding and bilingual terminology across the subjects that actually drive progress.",
        focus: stageLabel,
        subjects: selectedSubjects.slice(0, 4),
        outputs: ["topic checklist", "mini quizzes", "bilingual glossary"],
        prompt: `Create an Egypt-focused study pack for ${stageLabel}. Prioritize ${subjectLabel}. Use Arabic-first bilingual explanations, topic checklists, short quizzes, and a weekly review loop.`,
        accent: "emerald",
      }),
      createPack({
        id: "eg-exam-pack",
        title: "Exam-prep pack",
        description:
          "Separate exam pressure from ordinary mastery so the student gets both pathways clearly.",
        focus: selectedExams.join(" + "),
        subjects: selectedExams,
        outputs: ["timed mini-mocks", "mistake log", "revision countdown"],
        prompt: `Build an Egypt exam-prep pack for ${selectedExams.join(
          ", ",
        )}. Add timed mini-mocks, likely high-yield topics, a mistake log, and a countdown revision plan.`,
        accent: "amber",
      }),
      createPack({
        id: "eg-stream-pack",
        title: "Stream-aware study pack",
        description:
          "Support the exact stream or board instead of flattening science, math, literary, or international students together.",
        focus: curriculumLabel,
        subjects: selectedSubjects,
        outputs: ["stream notes", "exam-style prompts", "weak-area drills"],
        prompt: `Design a stream-aware study pack for an Egypt student following ${curriculumLabel}. Focus on ${subjectLabel}. Include weak-area drills, stream-specific prompts, and board-aware revision tips.`,
        accent: "cyan",
      }),
      createPack({
        id: "eg-writing-pack",
        title: "Arabic + explanation quality pack",
        description:
          "Improve answer structure, definition precision, and bilingual clarity for ministry and international pathways.",
        focus: "Answer quality",
        subjects: [
          "Arabic",
          "English support",
          ...selectedSubjects.slice(0, 2),
        ],
        outputs: ["model answers", "definition bank", "translation traps"],
        prompt: `Turn the chosen Egypt topics into a high-clarity answer-quality pack. Keep Arabic-first explanations, preserve English keywords where needed, and add concise model answers plus common wording mistakes.`,
        accent: "rose",
      }),
    ],
    trainerTitle:
      family === "nile" ? "Egypt + Nile trainer" : "Egypt national trainer",
    trainerDescription:
      "Mix preparatory foundations, Thanaweya discipline, and international-in-Egypt pathways without losing Arabic context.",
    trainerLanes: [
      {
        id: "eg-foundation",
        label: "Preparatory fundamentals",
        description:
          "Core Arabic, math, science, and social-studies readiness for early Egypt stages.",
        focusTags: ["foundation", "bilingual", "discipline"],
        questions: [
          {
            id: "eg-f1",
            type: "math",
            prompt:
              "If a revision plan covers 4 chapters in 8 days, how many chapters are covered in 6 days at the same pace?",
            options: ["2", "3", "4", "5"],
            answerIndex: 1,
            explanation:
              "The pace is half a chapter per day, so 6 days completes 3 chapters.",
          },
          {
            id: "eg-f2",
            type: "science",
            prompt:
              "Which skill is most useful when revising science terminology in Arabic and English together?",
            options: [
              "Ignoring diagrams",
              "Using a bilingual glossary",
              "Only memorizing English spellings",
              "Skipping definitions",
            ],
            answerIndex: 1,
            explanation:
              "A bilingual glossary connects meaning and terminology, especially in science-heavy subjects.",
          },
          {
            id: "eg-f3",
            type: "study strategy",
            prompt: "The best end-of-week review move is usually:",
            options: [
              "Passive rereading only",
              "A blank-page recall check",
              "Changing notebook colors",
              "Skipping weak topics",
            ],
            answerIndex: 1,
            explanation:
              "Blank-page recall exposes what the student actually remembers and what still needs work.",
          },
        ],
      },
      {
        id: "eg-thanaweya",
        label: "Thanaweya pressure lane",
        description:
          "Timed reasoning and stream-aware revision habits for national-secondary students.",
        focusTags: ["timed", "ministry style", "high yield"],
        questions: [
          {
            id: "eg-t1",
            type: "physics habit",
            prompt:
              "What should a student do first after missing a physics question in a mock?",
            options: [
              "Delete the question",
              "Record the error type and the missing concept",
              "Ignore the topic",
              "Memorize the answer only",
            ],
            answerIndex: 1,
            explanation:
              "A strong error log captures both the concept gap and the reason the answer failed.",
          },
          {
            id: "eg-t2",
            type: "history / humanities",
            prompt:
              "Which revision move best supports content-heavy humanities in exam year?",
            options: [
              "Only watching videos",
              "Timeline compression and active recall prompts",
              "Skipping dates and sequences",
              "Reading once without testing",
            ],
            answerIndex: 1,
            explanation:
              "Timeline compression plus active recall keeps sequence-heavy content manageable.",
          },
          {
            id: "eg-t3",
            type: "stream planning",
            prompt: "Why should Grade 11-12 packs split by stream?",
            options: [
              "Because all streams share the same exam style",
              "Because science, math, and literary students need different subject bundles",
              "Because the grade does not matter",
              "Because exam prep should replace all mastery work",
            ],
            answerIndex: 1,
            explanation:
              "The streams diverge heavily, so a generic pack loses relevance quickly.",
          },
        ],
      },
      {
        id: "eg-international",
        label: "International-in-Egypt",
        description:
          "Keep local identity-subject awareness while respecting Nile, British, American, or IB assessment styles.",
        focusTags: ["board aware", "bilingual", "mixed pathway"],
        questions: [
          {
            id: "eg-i1",
            type: "board awareness",
            prompt:
              "What makes a pack stronger for an Egypt student in an international school?",
            options: [
              "Ignoring local context entirely",
              "Mixing board-specific prep with local subject reminders",
              "Using one identical pack for every board",
              "Removing Arabic support",
            ],
            answerIndex: 1,
            explanation:
              "International-track students in Egypt often still need local subject awareness alongside board prep.",
          },
          {
            id: "eg-i2",
            type: "exam technique",
            prompt:
              "Which study-pack field becomes especially important for Egypt international students?",
            options: [
              "Favorite notebook color",
              "Exact board / qualification route",
              "Phone wallpaper",
              "Lunch break length",
            ],
            answerIndex: 1,
            explanation:
              "Board and qualification route drive assessment style and the right study assets.",
          },
          {
            id: "eg-i3",
            type: "language mode",
            prompt:
              "The safest default explanation mode for many Egypt learners is:",
            options: [
              "English-only",
              "Arabic-first bilingual",
              "No subject language support",
              "Emoji-only summaries",
            ],
            answerIndex: 1,
            explanation:
              "Arabic-first bilingual delivery keeps clarity high while preserving exam terminology.",
          },
        ],
      },
    ],
    insights: [
      "Egypt students often need both mastery packs and exam-prep packs at the same time.",
      "The major switches are Grade 9, Grade 10, and Grade 11-12 specialization.",
      "Arabic-first bilingual output is usually the safer default than English-only output.",
    ],
  };
}

function buildUkBlueprint(
  input: CurriculumPersonalizationInput,
): CurriculumBlueprint {
  const grade = parseGradeLevel(input.gradeLevel);
  const family = inferCurriculumFamily(input);
  const curriculumLabel =
    input.curriculum ||
    (family === "a_level"
      ? "A-Level"
      : family === "scottish"
        ? "Scottish Highers"
        : family === "ib"
          ? "IB Diploma"
          : "GCSE");

  let stageLabel = "UK route-aware lane";
  let stageDescription =
    "UK learners need qualification-route personalization, not one generic national curriculum.";
  let recommendedSubjects = [
    "English",
    "Mathematics",
    "Science",
    "Humanities",
    "Languages",
  ];
  let recommendedExams =
    family === "scottish"
      ? ["National 5 / Higher"]
      : family === "a_level"
        ? ["A-Level"]
        : family === "ib"
          ? ["IB assessments"]
          : ["GCSE"];

  if (grade && grade <= 9) {
    stageLabel = "Lower secondary / KS3";
    stageDescription =
      "Early secondary should build retrieval habits, vocabulary, source analysis, and problem-solving before qualification narrowing.";
    recommendedExams = ["No major qualification yet"];
  } else if (grade === 10 || grade === 11) {
    stageLabel =
      family === "scottish" ? "National qualification prep" : "GCSE / KS4 prep";
    stageDescription =
      "Years 10-11 should become subject + qualification + command-word aware, with mark-scheme habits early.";
    recommendedSubjects = [
      "English",
      "Mathematics",
      "Sciences",
      "Humanities",
      "Languages / chosen options",
    ];
  } else if (grade && grade >= 12) {
    stageLabel =
      family === "scottish"
        ? "Higher / Advanced Higher lane"
        : family === "ib"
          ? "IB depth lane"
          : "Post-16 qualification lane";
    stageDescription =
      "Post-16 UK study should be narrower, deeper, and tied tightly to the chosen qualification route and subjects.";
    recommendedSubjects =
      family === "ib"
        ? ["Chosen subject groups", "TOK / EE / IA"]
        : [
            "Chosen subjects",
            "Essay / problem solving",
            "Coursework / project",
          ];
    recommendedExams =
      family === "scottish"
        ? ["Higher", "Advanced Higher"]
        : family === "ib"
          ? ["IB assessments"]
          : ["A-Level"];
  }

  const selectedSubjects = pickSelectedSubjects(
    input.targetSubjects,
    recommendedSubjects,
  );
  const selectedExams = pickSelectedExams(input.targetExams, recommendedExams);
  const subjectLabel = selectedSubjects.join(", ");

  return {
    countryId: "uk",
    countryLabel: COUNTRY_LABELS.uk,
    curriculumLabel,
    curriculumFamily: family,
    stageLabel,
    stageDescription,
    paceLabel: PACE_LABELS[input.studyPace || "balanced"],
    languageMode: describeLanguageMode("uk", input.preferredLanguage),
    recommendedSubjects,
    selectedSubjects,
    recommendedExams,
    selectedExams,
    studyPacks: [
      createPack({
        id: "uk-route-pack",
        title: "Qualification-route pack",
        description:
          "Tie the study plan to the actual route, because usefulness drops fast when packs ignore GCSE vs A-Level vs Scottish vs IB logic.",
        focus: curriculumLabel,
        subjects: selectedSubjects.slice(0, 4),
        outputs: ["topic checklist", "command-word map", "subject planner"],
        prompt: `Build a UK starter study pack for ${curriculumLabel} at ${stageLabel}. Focus on ${subjectLabel}. Add content checklists, command-word training, and a planner that matches the qualification route.`,
        accent: "emerald",
      }),
      createPack({
        id: "uk-past-paper-pack",
        title: "Past-paper loop",
        description:
          "Blend mark-scheme reflection, weak-topic repair, and timed practice into one repeatable system.",
        focus: selectedExams.join(" + "),
        subjects: selectedExams,
        outputs: [
          "timed question set",
          "mark-scheme reflection",
          "error tracker",
        ],
        prompt: `Create a UK past-paper loop for ${selectedExams.join(
          ", ",
        )}. Include timed questions, mark-scheme reflection, command-word feedback, and a weak-topic repair loop.`,
        accent: "amber",
      }),
      createPack({
        id: "uk-depth-pack",
        title: "Depth + writing pack",
        description:
          "Support essay-heavy and calculation-heavy subjects differently instead of forcing one format.",
        focus: "Essay vs calculation depth",
        subjects: selectedSubjects,
        outputs: ["essay frames", "problem sets", "synoptic review"],
        prompt: `Design a UK depth pack for ${subjectLabel}. Separate essay-heavy support from calculation-heavy support, and include synoptic review where the route needs it.`,
        accent: "cyan",
      }),
      createPack({
        id: "uk-progression-pack",
        title: "Progression support pack",
        description:
          "Keep coursework, internal milestones, and progression goals visible once the student moves into post-16 routes.",
        focus: "Post-16 momentum",
        subjects:
          grade && grade >= 12
            ? ["Coursework", "Projects", ...selectedSubjects.slice(0, 2)]
            : ["Study skills", ...selectedSubjects.slice(0, 2)],
        outputs: [
          "deadline tracker",
          "target-grade gap scan",
          "weekly next steps",
        ],
        prompt: `Build a UK progression support pack for ${stageLabel}. Add deadline tracking, target-grade gap analysis, and the next weekly study steps for ${subjectLabel}.`,
        accent: "rose",
      }),
    ],
    trainerTitle: "UK qualification trainer",
    trainerDescription:
      "Use route-aware drills for command words, mark-schemes, subject depth, and post-16 planning.",
    trainerLanes: [
      {
        id: "uk-command-words",
        label: "Command-word coach",
        description:
          "Train the difference between explain, compare, analyse, and evaluate so answers match the question.",
        focusTags: ["command words", "writing", "GCSE / A-Level"],
        questions: [
          {
            id: "uk-c1",
            type: "command word",
            prompt:
              "Which command word usually asks for strengths and weaknesses before a judgement?",
            options: ["Define", "Evaluate", "List", "State"],
            answerIndex: 1,
            explanation:
              "Evaluate typically asks for balanced judgement, evidence, and a reasoned conclusion.",
          },
          {
            id: "uk-c2",
            type: "exam technique",
            prompt:
              "What is the smartest first move when a six-mark response asks you to compare two causes?",
            options: [
              "Ignore one cause",
              "Plan both causes and the comparison link",
              "Write only definitions",
              "Skip structure",
            ],
            answerIndex: 1,
            explanation:
              "A quick comparison structure prevents the answer from becoming two isolated descriptions.",
          },
          {
            id: "uk-c3",
            type: "study habit",
            prompt: "Why do route-specific packs matter in the UK?",
            options: [
              "Because GCSE, A-Level, Scottish, and IB are identical",
              "Because the qualification route changes pacing and assessment style",
              "Because year level is irrelevant",
              "Because all subjects use the same rubric",
            ],
            answerIndex: 1,
            explanation:
              "Qualification route changes how deep the content goes and how students are assessed.",
          },
        ],
      },
      {
        id: "uk-mark-scheme",
        label: "Mark-scheme loop",
        description:
          "Build the habit of checking what earned marks, what missed them, and how to repair the gap.",
        focusTags: ["mark scheme", "timed", "feedback"],
        questions: [
          {
            id: "uk-m1",
            type: "feedback",
            prompt:
              "A student loses marks for missing precise vocabulary. The best response is to:",
            options: [
              "Reread without notes",
              "Create a subject-term bank and reuse it in practice answers",
              "Ignore the vocabulary issue",
              "Only highlight the textbook",
            ],
            answerIndex: 1,
            explanation:
              "Vocabulary repair works best when the student builds and reuses exact terms in exam practice.",
          },
          {
            id: "uk-m2",
            type: "timed practice",
            prompt: "What makes a past-paper loop effective?",
            options: [
              "Doing papers without review",
              "Timed questions, mark-scheme comparison, and error tracking",
              "Only reading mark schemes",
              "Answering from memory without correction",
            ],
            answerIndex: 1,
            explanation:
              "Timing plus correction plus error tracking turns practice into better performance next time.",
          },
          {
            id: "uk-m3",
            type: "post-16",
            prompt:
              "Which post-16 route usually becomes narrower and deeper than KS4?",
            options: ["A-Level", "KS3 only", "Primary only", "None"],
            answerIndex: 0,
            explanation:
              "A-Level study narrows subject count and pushes much deeper within each chosen subject.",
          },
        ],
      },
      {
        id: "uk-depth",
        label: "Depth + progression",
        description:
          "Support subject depth, coursework, and progression without collapsing every route into the same pattern.",
        focusTags: ["depth", "coursework", "progression"],
        questions: [
          {
            id: "uk-d1",
            type: "synoptic study",
            prompt: "What does synoptic revision usually require?",
            options: [
              "Studying each topic in isolation forever",
              "Connecting topics and reusing ideas across the course",
              "Skipping older units",
              "Only memorizing definitions",
            ],
            answerIndex: 1,
            explanation:
              "Synoptic work asks students to connect ideas across units rather than keeping them siloed.",
          },
          {
            id: "uk-d2",
            type: "coursework",
            prompt:
              "When coursework or internal assessment exists, the pack should include:",
            options: [
              "No deadline support",
              "Milestone tracking and feedback loops",
              "Only flashcards",
              "Random topic order",
            ],
            answerIndex: 1,
            explanation:
              "Deadlines and iterative feedback are part of performance, not side details.",
          },
          {
            id: "uk-d3",
            type: "route logic",
            prompt:
              "For a Scottish learner, the strongest default route label is usually:",
            options: ["GCSE", "National 5 / Higher", "SAT", "AP"],
            answerIndex: 1,
            explanation:
              "Scottish learners should not be flattened into English qualification assumptions.",
          },
        ],
      },
    ],
    insights: [
      "UK personalization works best when the student chooses a qualification route up front.",
      "Command words and mark-scheme habits are a high-leverage pack feature at GCSE and beyond.",
      "Scottish and IB learners should not be forced through English GCSE/A-Level assumptions.",
    ],
  };
}

function buildUsBlueprint(
  input: CurriculumPersonalizationInput,
): CurriculumBlueprint {
  const grade = parseGradeLevel(input.gradeLevel);
  const family = inferCurriculumFamily(input);
  const curriculumLabel =
    input.curriculum ||
    (family === "ap"
      ? "AP"
      : family === "ib"
        ? "IB"
        : family === "honors"
          ? "Honors"
          : "Common Core / State Standards");

  let stageLabel = "US course-aware lane";
  let stageDescription =
    "US personalization should branch by grade band, course roster, rigor track, and exact exam targets.";
  let recommendedSubjects = [
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "World Language / elective",
  ];
  let recommendedExams =
    family === "ap"
      ? ["AP exams"]
      : family === "ib"
        ? ["IB assessments"]
        : ["PSAT / SAT", "ACT"];

  if (grade && grade <= 8) {
    stageLabel = "Middle school foundation";
    stageDescription =
      "Grades 6-8 should emphasize standards mastery, short retrieval loops, and strong literacy support across subjects.";
    recommendedSubjects = [
      "ELA / literacy",
      "Mathematics",
      "Science",
      "Social Studies",
      "Academic vocabulary",
    ];
    recommendedExams = ["PSAT 8/9 readiness"];
  } else if (grade === 9 || grade === 10) {
    stageLabel = "High school build stage";
    stageDescription =
      "Grades 9-10 should align packs to current classes and add stronger writing and error-analysis routines.";
    recommendedSubjects = [
      "English",
      "Mathematics",
      "Science",
      "Social Studies",
      "Course roster",
    ];
    recommendedExams =
      family === "ap"
        ? ["AP subject exams", "PSAT 10"]
        : family === "ib"
          ? ["IB assessments"]
          : ["PSAT 10", "PSAT / SAT"];
  } else if (grade && grade >= 11) {
    stageLabel = "Admissions + advanced coursework";
    stageDescription =
      "Grades 11-12 need coursework packs layered with SAT, ACT, AP, or IB deadlines rather than generic national study plans.";
    recommendedSubjects =
      family === "ap"
        ? ["AP subject roster", "English", "Mathematics"]
        : family === "ib"
          ? ["IB subject groups", "TOK / EE / IA"]
          : ["Current courses", "SAT / ACT domains", "Writing", "Mathematics"];
    recommendedExams =
      family === "ap"
        ? ["AP exams", "SAT", "ACT"]
        : family === "ib"
          ? ["IB assessments", "SAT", "ACT"]
          : ["SAT", "ACT"];
  }

  const selectedSubjects = pickSelectedSubjects(
    input.targetSubjects,
    recommendedSubjects,
  );
  const selectedExams = pickSelectedExams(input.targetExams, recommendedExams);
  const subjectLabel = selectedSubjects.join(", ");

  return {
    countryId: "us",
    countryLabel: COUNTRY_LABELS.us,
    curriculumLabel,
    curriculumFamily: family,
    stageLabel,
    stageDescription,
    paceLabel: PACE_LABELS[input.studyPace || "balanced"],
    languageMode: describeLanguageMode("us", input.preferredLanguage),
    recommendedSubjects,
    selectedSubjects,
    recommendedExams,
    selectedExams,
    studyPacks: [
      createPack({
        id: "us-course-pack",
        title: "Course mastery pack",
        description:
          "Build packs from the student’s actual classes and skill strands instead of pretending the US has one national syllabus.",
        focus: stageLabel,
        subjects: selectedSubjects.slice(0, 4),
        outputs: ["skill map", "cumulative review", "error log"],
        prompt: `Create a US study pack for ${stageLabel}. Focus on ${subjectLabel}. Build around actual class mastery with skill maps, cumulative review, and an error-analysis log.`,
        accent: "emerald",
      }),
      createPack({
        id: "us-exam-pack",
        title: "Admissions exam pack",
        description:
          "Split SAT and ACT into concrete domains, timing blocks, and weak-skill practice instead of generic test-prep slogans.",
        focus: selectedExams.join(" + "),
        subjects: selectedExams,
        outputs: ["timed sections", "mistake taxonomy", "score trend loop"],
        prompt: `Build a US admissions prep pack for ${selectedExams.join(
          ", ",
        )}. Split the work into timed sections, weakness tracking, pacing strategy, and weekly benchmarks.`,
        accent: "amber",
      }),
      createPack({
        id: "us-rigor-pack",
        title: "Rigor-track pack",
        description:
          "Adjust the pack to standards, honors, AP, or IB instead of treating every advanced course the same way.",
        focus: curriculumLabel,
        subjects: selectedSubjects,
        outputs: ["unit map", "rubric checklist", "advanced practice"],
        prompt: `Design a US rigor-track study pack for ${curriculumLabel}. Focus on ${subjectLabel}. Include unit maps, rubric-aware practice, and a weekly advanced-work plan.`,
        accent: "cyan",
      }),
      createPack({
        id: "us-writing-pack",
        title: "Writing + reasoning pack",
        description:
          "Improve evidence-based writing, cumulative math reasoning, and faster review across high-school coursework.",
        focus: "Evidence + reasoning",
        subjects: ["Writing", "Mathematics", ...selectedSubjects.slice(0, 2)],
        outputs: ["response frames", "math checkpoints", "reflection prompts"],
        prompt: `Turn the selected US topics into a writing-and-reasoning pack. Add evidence-based response frames, cumulative math checkpoints, and reflection prompts that fit ${stageLabel}.`,
        accent: "rose",
      }),
    ],
    trainerTitle: "US course + exam trainer",
    trainerDescription:
      "Switch between standards mastery, SAT / ACT, and AP / IB depth without losing the student’s current course context.",
    trainerLanes: [
      {
        id: "us-standards",
        label: "Standards mastery",
        description:
          "Skill-by-skill practice for class performance, cumulative review, and literacy across subjects.",
        focusTags: ["standards", "skill strands", "coursework"],
        questions: [
          {
            id: "us-s1",
            type: "ELA",
            prompt:
              "Which revision move best strengthens an evidence-based paragraph?",
            options: [
              "Adding unrelated examples",
              "Using a clearer claim and direct textual support",
              "Removing all evidence",
              "Only changing the title",
            ],
            answerIndex: 1,
            explanation:
              "US coursework and admissions writing both reward a clear claim supported by relevant evidence.",
          },
          {
            id: "us-s2",
            type: "math habits",
            prompt:
              "What is the highest-value response after missing a mixed-review algebra problem?",
            options: [
              "Skip the topic forever",
              "Log the error type and redo a similar problem",
              "Only read the final answer",
              "Switch subjects immediately",
            ],
            answerIndex: 1,
            explanation:
              "Error analysis plus similar re-practice is the fastest way to convert a miss into mastery.",
          },
          {
            id: "us-s3",
            type: "study planning",
            prompt: "Why should US packs start from the actual course roster?",
            options: [
              "Because one national syllabus covers everything",
              "Because courses, rigor, and assessments vary widely by school",
              "Because grade level is enough",
              "Because exams never matter",
            ],
            answerIndex: 1,
            explanation:
              "US schools are decentralized, so real personalization needs courses plus rigor track plus exam targets.",
          },
        ],
      },
      {
        id: "us-sat-act",
        label: "SAT / ACT sprint",
        description:
          "Timed sections, pacing strategy, and mistake taxonomy for college-admissions testing.",
        focusTags: ["timed", "admissions", "pacing"],
        questions: [
          {
            id: "us-a1",
            type: "SAT math",
            prompt: "If y = 3x - 4 and x = 6, what is y?",
            options: ["10", "12", "14", "18"],
            answerIndex: 2,
            explanation: "Substitute x = 6. The result is 18 - 4 = 14.",
          },
          {
            id: "us-a2",
            type: "pacing",
            prompt: "What should a student record after a timed SAT / ACT set?",
            options: [
              "Only the final score",
              "Accuracy, timing, and the reason for each miss",
              "Nothing",
              "The color of the booklet",
            ],
            answerIndex: 1,
            explanation:
              "The highest-value review tracks both speed and why questions were missed.",
          },
          {
            id: "us-a3",
            type: "exam strategy",
            prompt:
              "Which statement best reflects strong US admissions prep design?",
            options: [
              "Do classwork and test prep in separate worlds forever",
              "Layer timed prep on top of course mastery and weak-skill review",
              "Ignore course grades",
              "Treat SAT and ACT as identical in pacing",
            ],
            answerIndex: 1,
            explanation:
              "The strongest system combines course mastery with exam timing and weakness repair.",
          },
        ],
      },
      {
        id: "us-advanced",
        label: "AP / IB depth",
        description:
          "Use framework-aware and rubric-aware practice for advanced coursework instead of generic hard-mode drills.",
        focusTags: ["rubrics", "advanced", "frameworks"],
        questions: [
          {
            id: "us-p1",
            type: "AP logic",
            prompt:
              "Why should AP packs be built per subject instead of one generic AP mode?",
            options: [
              "Because every AP subject uses the same framework",
              "Because AP course frameworks and FRQs differ by subject",
              "Because AP ignores writing",
              "Because timing never matters",
            ],
            answerIndex: 1,
            explanation:
              "AP Biology, AP US History, and AP Calculus all need different assets and question styles.",
          },
          {
            id: "us-p2",
            type: "IB logic",
            prompt:
              "Which IB support element is missing from a generic quiz-only pack?",
            options: [
              "Rubric and internal-assessment planning",
              "Any need for review",
              "Any deadlines",
              "Any subject structure",
            ],
            answerIndex: 0,
            explanation:
              "IB success depends on rubric-aware work, internal assessments, and longer-term projects.",
          },
          {
            id: "us-p3",
            type: "honors",
            prompt: "A strong honors pack should usually add:",
            options: [
              "Lower expectations",
              "Deeper readings and extension problems",
              "No writing",
              "Only memorization",
            ],
            answerIndex: 1,
            explanation:
              "Honors courses usually mean more pace, more complexity, and more depth rather than a separate national curriculum.",
          },
        ],
      },
    ],
    insights: [
      "US personalization is weak if it only asks for country and grade.",
      "The best abstraction is grade band plus course roster plus rigor track plus exact exam targets.",
      "SAT / ACT prep should sit on top of coursework rather than replacing it.",
    ],
  };
}

function buildGlobalBlueprint(
  input: CurriculumPersonalizationInput,
): CurriculumBlueprint {
  const selectedSubjects = pickSelectedSubjects(
    input.targetSubjects,
    DEFAULT_SUBJECTS,
  );
  const selectedExams = pickSelectedExams(input.targetExams, [
    "Course mastery",
  ]);

  return {
    countryId: normalizeCountry(input.country, input.region),
    countryLabel:
      COUNTRY_LABELS[normalizeCountry(input.country, input.region)] || "Global",
    curriculumLabel: input.curriculum || "General",
    curriculumFamily: "general",
    stageLabel: input.gradeLevel || "General study stage",
    stageDescription:
      "Use course-aware starter packs even when the country or curriculum is not deeply modeled yet.",
    paceLabel: PACE_LABELS[input.studyPace || "balanced"],
    languageMode: describeLanguageMode(
      normalizeCountry(input.country, input.region),
      input.preferredLanguage,
    ),
    recommendedSubjects: DEFAULT_SUBJECTS,
    selectedSubjects,
    recommendedExams: ["Course mastery"],
    selectedExams,
    studyPacks: [
      createPack({
        id: "global-foundation",
        title: "Starter mastery pack",
        description:
          "Build a clean foundation with diagnostics, retrieval, and concept-by-concept review.",
        focus: "General starter pack",
        subjects: selectedSubjects,
        outputs: ["diagnostic", "notes", "flashcards"],
        prompt: `Create a personalized starter study pack for ${selectedSubjects.join(
          ", ",
        )}. Add diagnostics, short notes, flashcards, and a one-week review loop.`,
        accent: "emerald",
      }),
      createPack({
        id: "global-exam",
        title: "Exam drill pack",
        description:
          "Turn the selected subjects into timed practice, error logging, and weak-topic repair.",
        focus: "Exam prep",
        subjects: selectedExams,
        outputs: ["timed drill", "error log", "review plan"],
        prompt: `Turn the selected topics into an exam drill pack with timed questions, an error log, and a targeted weak-topic review plan.`,
        accent: "amber",
      }),
    ],
    trainerTitle: "Personalized study trainer",
    trainerDescription:
      "Use a simple skill lane until richer regional data is available.",
    trainerLanes: [
      {
        id: "global-core",
        label: "Core skill lane",
        description: "Retrieval, error correction, and clean study habits.",
        focusTags: ["core", "retrieval", "focus"],
        questions: [
          {
            id: "g1",
            type: "study skill",
            prompt: "Which action most improves retention after reading?",
            options: [
              "Close the notes and recall the key points",
              "Reread passively three times",
              "Skip review completely",
              "Only rewrite headings",
            ],
            answerIndex: 0,
            explanation:
              "Active recall checks what the learner can produce from memory, which is stronger than passive rereading.",
          },
          {
            id: "g2",
            type: "math habit",
            prompt: "A mistake log is most useful when it records:",
            options: [
              "Only whether the answer was wrong",
              "The error type and the fix",
              "Notebook decorations",
              "Nothing after the test",
            ],
            answerIndex: 1,
            explanation:
              "The fix is as important as the error itself because it tells the student what to practice next.",
          },
        ],
      },
    ],
    insights: [
      "Even the fallback path should stay course-aware and diagnostic-driven.",
    ],
  };
}

export function buildCurriculumPersonalization(
  input: CurriculumPersonalizationInput,
): CurriculumBlueprint {
  const countryId = normalizeCountry(input.country, input.region);

  if (countryId === "sa") return buildSaudiBlueprint(input);
  if (countryId === "eg") return buildEgyptBlueprint(input);
  if (countryId === "uk") return buildUkBlueprint(input);
  if (countryId === "us") return buildUsBlueprint(input);
  return buildGlobalBlueprint(input);
}

export function hasEnhancedRegionalTrainer(
  input: CurriculumPersonalizationInput,
) {
  const countryId = normalizeCountry(input.country, input.region);
  return ["sa", "eg", "uk", "us"].includes(countryId);
}
