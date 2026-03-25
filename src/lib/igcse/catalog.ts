import type {
  IgcseBoard,
  IgcseBoardId,
  IgcseDemandSignal,
  IgcsePastPaper,
  IgcseRangePreset,
  IgcseSubjectId,
  IgcseTemplate,
  IgcseTopic,
  IgcseTrack,
  IgcseBook,
} from "@/lib/igcse/types";

type SubjectBlueprint = {
  id: IgcseSubjectId;
  label: string;
  shortLabel: string;
  positioning: string;
  topics: IgcseTopic[];
  books: Array<{
    id: string;
    titleByBoard: Record<IgcseBoardId, string>;
    publisher: string;
    edition: string;
    pageCount: number;
    description: string;
    topicIds: string[];
    studyAngles: string[];
    rangePresets: IgcseRangePreset[];
  }>;
  pastPapers: Array<{
    id: string;
    title: string;
    paperCodeByBoard: Record<IgcseBoardId, string>;
    sessionLabel: string;
    component: string;
    duration: string;
    description: string;
    topicIds: string[];
    questionFocus: string[];
    markSchemeFocus: string;
  }>;
  templates: IgcseTemplate[];
};

export const IGCSE_DEMAND_SIGNALS: IgcseDemandSignal[] = [
  {
    id: "board-topic-filters",
    title: "Board and topic filters first",
    detail:
      "Students want to start with exam board, subject, paper, and topic before they do anything else.",
  },
  {
    id: "topical-past-papers",
    title: "Topical past papers with mark schemes",
    detail:
      "Past-paper drills, model answers, and weak-topic revisits are the most requested exam workflow.",
  },
  {
    id: "short-revision-assets",
    title: "Short notes and flashcards",
    detail:
      "Concise outputs beat long PDFs when the goal is revision speed and exam recall.",
  },
  {
    id: "bundled-study-packs",
    title: "Everything in one pack",
    detail:
      "Students repeatedly ask for one place to hold notes, papers, prompts, and memorisation cues.",
  },
];

export const IGCSE_BOARDS: IgcseBoard[] = [
  {
    id: "cambridge",
    label: "Cambridge IGCSE",
    provider: "Cambridge Assessment International Education",
    positioning: "Strong for board-specific practical papers and classic topic sequencing.",
    strengths: ["Topical paper drill", "Practical paper alignment", "Strong topic tagging"],
  },
  {
    id: "edexcel",
    label: "Pearson Edexcel International GCSE",
    provider: "Pearson Edexcel",
    positioning: "Great for structured question progression and specification-led revision.",
    strengths: ["Specification-first", "Paper-component filtering", "Clear mark-scheme habits"],
  },
  {
    id: "oxford_aqa",
    label: "Oxford AQA International GCSE",
    provider: "OxfordAQA International Qualifications",
    positioning: "Useful when students want compact revision and transferable exam technique.",
    strengths: ["Compact paper flow", "Technique-led revision", "Balanced recall and application"],
  },
];

const SUBJECT_BLUEPRINTS: SubjectBlueprint[] = [
  {
    id: "biology",
    label: "Biology",
    shortLabel: "Bio",
    positioning: "Mix conceptual revision with mark-scheme wording and practical interpretation.",
    topics: [
      {
        id: "cell-biology",
        title: "Cell biology and transport",
        description: "Cell structure, diffusion, osmosis, active transport, and microscopy basics.",
        examSignals: ["definitions", "compare and contrast", "practical setup"],
        weaknessCue: "Loses marks on transport method comparisons or microscope calculations.",
      },
      {
        id: "coordination-homeostasis",
        title: "Coordination and homeostasis",
        description: "Nervous system, hormones, reflexes, and internal regulation.",
        examSignals: ["sequence explanation", "negative feedback", "graph interpretation"],
        weaknessCue: "Mixes up pathways and forgets the language of stimulus-response control.",
      },
      {
        id: "inheritance-variation",
        title: "Inheritance and variation",
        description: "DNA, genes, monohybrid crosses, selection, and variation.",
        examSignals: ["Punnett squares", "extended explanation", "data handling"],
        weaknessCue: "Gets probability and genotype-to-phenotype reasoning tangled under pressure.",
      },
      {
        id: "ecology",
        title: "Ecology and cycles",
        description: "Food webs, biodiversity, nutrient cycles, and human impact.",
        examSignals: ["scenario application", "evaluate impact", "graph reasoning"],
        weaknessCue: "Knows facts but struggles to link ecosystem change to population effects.",
      },
      {
        id: "practical-biology",
        title: "Practical skills and investigations",
        description: "Required practical habits, controlling variables, and interpreting method results.",
        examSignals: ["AO3 planning", "errors and improvements", "data tables"],
        weaknessCue: "Misses variables, reliability language, or improvement suggestions.",
      },
    ],
    books: [
      {
        id: "coursebook",
        titleByBoard: {
          cambridge: "Cambridge IGCSE Biology Coursebook",
          edexcel: "Pearson Edexcel International GCSE Biology Student Book",
          oxford_aqa: "Oxford AQA International GCSE Biology Revision Guide",
        },
        publisher: "Hodder / Pearson / Oxford",
        edition: "2025 learner edition",
        pageCount: 348,
        description:
          "Best for chapter sequencing, quick concept refreshers, and topic-by-topic page targeting.",
        topicIds: [
          "cell-biology",
          "coordination-homeostasis",
          "inheritance-variation",
          "ecology",
          "practical-biology",
        ],
        studyAngles: [
          "Use when you need page-range summaries before attempting topical questions.",
          "Best paired with mark-scheme language after the first summary pass.",
        ],
        rangePresets: [
          {
            id: "foundations",
            label: "Foundations",
            startPage: 18,
            endPage: 64,
            topicIds: ["cell-biology"],
            summaryFocus:
              "Build a short, diagram-friendly summary with definitions and transport comparisons.",
          },
          {
            id: "control-systems",
            label: "Control systems",
            startPage: 172,
            endPage: 226,
            topicIds: ["coordination-homeostasis"],
            summaryFocus:
              "Explain feedback loops, hormone pathways, and common exam comparison traps.",
          },
          {
            id: "variation-and-ecology",
            label: "Variation and ecology",
            startPage: 244,
            endPage: 326,
            topicIds: ["inheritance-variation", "ecology"],
            summaryFocus:
              "Connect genetic reasoning with environment-and-population application questions.",
          },
        ],
      },
      {
        id: "revision-guide",
        titleByBoard: {
          cambridge: "CGP IGCSE Biology Revision Guide",
          edexcel: "CGP Edexcel International GCSE Biology Revision Guide",
          oxford_aqa: "CGP Oxford AQA International GCSE Biology Revision Guide",
        },
        publisher: "CGP",
        edition: "Exam practice edition",
        pageCount: 212,
        description:
          "Dense recap format for weak-topic rescue and rapid revision the week before a paper.",
        topicIds: [
          "cell-biology",
          "coordination-homeostasis",
          "inheritance-variation",
          "ecology",
          "practical-biology",
        ],
        studyAngles: [
          "Ideal when you already know the content and need compact retrieval practice.",
          "Use with topical papers for exam-speed reinforcement.",
        ],
        rangePresets: [
          {
            id: "rapid-recall",
            label: "Rapid recall",
            startPage: 8,
            endPage: 74,
            topicIds: ["cell-biology", "coordination-homeostasis"],
            summaryFocus:
              "Condense the range into flashcard-ready bullets and quick definitions.",
          },
          {
            id: "exam-sprint",
            label: "Exam sprint",
            startPage: 118,
            endPage: 194,
            topicIds: ["inheritance-variation", "ecology", "practical-biology"],
            summaryFocus:
              "Prioritize exam traps, high-mark explanations, and variable-control reminders.",
          },
        ],
      },
    ],
    pastPapers: [
      {
        id: "extended-theory",
        title: "Extended theory blend",
        paperCodeByBoard: {
          cambridge: "0610/42",
          edexcel: "4BI1/2B",
          oxford_aqa: "9201/2",
        },
        sessionLabel: "May/June 2024",
        component: "Theory paper",
        duration: "1h 15m",
        description:
          "Good mixed paper for longer biological explanations, graphs, and mark-scheme phrasing.",
        topicIds: [
          "cell-biology",
          "coordination-homeostasis",
          "inheritance-variation",
        ],
        questionFocus: [
          "long-form explanation",
          "data interpretation",
          "exam vocabulary precision",
        ],
        markSchemeFocus:
          "Watch the exact terms used for transport, control, and inheritance reasoning.",
      },
      {
        id: "core-drill",
        title: "Core drill paper",
        paperCodeByBoard: {
          cambridge: "0610/22",
          edexcel: "4BI1/1B",
          oxford_aqa: "9201/1",
        },
        sessionLabel: "Oct/Nov 2023",
        component: "Structured questions",
        duration: "1h 00m",
        description:
          "Shorter-response paper that is strong for quick retrieval and mixed-topic warmups.",
        topicIds: ["cell-biology", "ecology", "practical-biology"],
        questionFocus: [
          "definition recall",
          "short calculations",
          "describe practical steps",
        ],
        markSchemeFocus:
          "Practice concise wording and make sure every command word is answered directly.",
      },
      {
        id: "practical-focus",
        title: "Practical and method focus",
        paperCodeByBoard: {
          cambridge: "0610/62",
          edexcel: "4BI1/1PR",
          oxford_aqa: "9201/3",
        },
        sessionLabel: "Specimen 2025",
        component: "Practical paper",
        duration: "1h 00m",
        description:
          "Best for experimental planning, data handling, and improvement questions.",
        topicIds: ["practical-biology", "cell-biology", "ecology"],
        questionFocus: [
          "identify variables",
          "table and graph setup",
          "improve the method",
        ],
        markSchemeFocus:
          "Most lost marks come from vague reliability comments and incomplete control-variable language.",
      },
    ],
    templates: [
      {
        id: "mixed-source-pack",
        title: "Mixed-source pack",
        description: "Blend textbook windows with past-paper drill and mark-scheme cues.",
        focusPrompt:
          "Keep the explanations concise, board-aware, and connected to the chosen topical paper set.",
        targetOutcomes: [
          "one-page summary",
          "flashcards",
          "topical practice sequence",
          "mark-scheme traps",
        ],
        estimatedMinutes: 65,
      },
      {
        id: "weak-topic-rescue",
        title: "Weak-topic rescue",
        description: "Prioritize the topics that are still causing mistakes under timed conditions.",
        focusPrompt:
          "Start with misconceptions, then build up confidence with short answer patterns and a small quiz.",
        targetOutcomes: [
          "misconception list",
          "targeted flashcards",
          "mini quiz",
          "next-paper checklist",
        ],
        estimatedMinutes: 45,
      },
      {
        id: "exam-sprint",
        title: "48-hour exam sprint",
        description: "Use when the paper is close and the student needs a tighter revision run.",
        focusPrompt:
          "Strip the pack down to high-yield notes, answer phrasing, and final-check retrieval prompts.",
        targetOutcomes: [
          "high-yield notes",
          "answer phrasing bank",
          "fast recall prompts",
        ],
        estimatedMinutes: 35,
      },
    ],
  },
  {
    id: "chemistry",
    label: "Chemistry",
    shortLabel: "Chem",
    positioning: "Anchor the pack around patterns, calculations, and practical wording.",
    topics: [
      {
        id: "atomic-structure-bonding",
        title: "Atomic structure and bonding",
        description: "Particles, electron structure, ionic, covalent, and metallic bonding.",
        examSignals: ["structure-property links", "diagram explanation", "compare and contrast"],
        weaknessCue: "Knows the facts but misses the reason properties change with structure.",
      },
      {
        id: "chemical-calculations",
        title: "Moles and chemical calculations",
        description: "Relative masses, mole calculations, concentration, and gas volumes.",
        examSignals: ["step calculations", "units", "percentage yield"],
        weaknessCue: "Loses method marks by skipping units or jumping straight to an answer.",
      },
      {
        id: "energetics-rates",
        title: "Energetics and rates",
        description: "Exothermic/endothermic changes, collision theory, and catalysts.",
        examSignals: ["graph reading", "explain factors", "reaction profile"],
        weaknessCue: "Mixes up activation energy language and graph trends.",
      },
      {
        id: "organic-chemistry",
        title: "Organic chemistry",
        description: "Hydrocarbons, homologous series, alcohols, carboxylic acids, and polymers.",
        examSignals: ["formula patterns", "naming", "reaction use cases"],
        weaknessCue: "Misses pattern recognition between functional groups and uses.",
      },
      {
        id: "practical-chemistry",
        title: "Practical chemistry",
        description: "Salt preparation, chromatography, titration logic, and test procedures.",
        examSignals: ["method design", "observation language", "error evaluation"],
        weaknessCue: "Forgets exact observation words or practical sequencing.",
      },
    ],
    books: [
      {
        id: "coursebook",
        titleByBoard: {
          cambridge: "Cambridge IGCSE Chemistry Coursebook",
          edexcel: "Pearson Edexcel International GCSE Chemistry Student Book",
          oxford_aqa: "Oxford AQA International GCSE Chemistry Revision Guide",
        },
        publisher: "Hodder / Pearson / Oxford",
        edition: "2025 learner edition",
        pageCount: 356,
        description:
          "Strong for mapped topic study, worked examples, and linking theory with practical technique.",
        topicIds: [
          "atomic-structure-bonding",
          "chemical-calculations",
          "energetics-rates",
          "organic-chemistry",
          "practical-chemistry",
        ],
        studyAngles: [
          "Use when you need a page-range summary before jumping into paper drill.",
          "Best for connecting calculations with method steps and observation language.",
        ],
        rangePresets: [
          {
            id: "bonding-and-structure",
            label: "Bonding and structure",
            startPage: 16,
            endPage: 88,
            topicIds: ["atomic-structure-bonding"],
            summaryFocus:
              "Focus on structure-property reasoning, diagram language, and quick comparison cues.",
          },
          {
            id: "calculation-workshop",
            label: "Calculation workshop",
            startPage: 108,
            endPage: 176,
            topicIds: ["chemical-calculations", "energetics-rates"],
            summaryFocus:
              "Show each calculation method, the unit checks, and the graph interpretation habits.",
          },
          {
            id: "organic-practical",
            label: "Organic and practical",
            startPage: 232,
            endPage: 332,
            topicIds: ["organic-chemistry", "practical-chemistry"],
            summaryFocus:
              "Prioritize reaction patterns, practical observations, and common method mistakes.",
          },
        ],
      },
      {
        id: "revision-guide",
        titleByBoard: {
          cambridge: "CGP IGCSE Chemistry Revision Guide",
          edexcel: "CGP Edexcel International GCSE Chemistry Revision Guide",
          oxford_aqa: "CGP Oxford AQA International GCSE Chemistry Revision Guide",
        },
        publisher: "CGP",
        edition: "Exam practice edition",
        pageCount: 220,
        description:
          "Works well for short recap bursts and calculation-heavy last-minute revision.",
        topicIds: [
          "atomic-structure-bonding",
          "chemical-calculations",
          "energetics-rates",
          "organic-chemistry",
          "practical-chemistry",
        ],
        studyAngles: [
          "Best for weak-topic rescue when the student already covered the chapter once.",
          "Useful for turning long chapters into fast revision cues.",
        ],
        rangePresets: [
          {
            id: "calculation-sprint",
            label: "Calculation sprint",
            startPage: 52,
            endPage: 114,
            topicIds: ["chemical-calculations", "energetics-rates"],
            summaryFocus:
              "Compress worked examples into method steps and a calculator-safe checklist.",
          },
          {
            id: "organic-recall",
            label: "Organic recall",
            startPage: 140,
            endPage: 206,
            topicIds: ["organic-chemistry", "practical-chemistry"],
            summaryFocus:
              "Turn reaction patterns and tests into rapid recall cards with observation wording.",
          },
        ],
      },
    ],
    pastPapers: [
      {
        id: "calculation-paper",
        title: "Calculation-heavy theory paper",
        paperCodeByBoard: {
          cambridge: "0620/42",
          edexcel: "4CH1/2C",
          oxford_aqa: "9271/2",
        },
        sessionLabel: "May/June 2024",
        component: "Theory paper",
        duration: "1h 15m",
        description:
          "Ideal for stoichiometry, yield, energy profiles, and explaining reaction trends.",
        topicIds: [
          "chemical-calculations",
          "energetics-rates",
          "atomic-structure-bonding",
        ],
        questionFocus: ["multi-step calculations", "graph explanation", "bonding logic"],
        markSchemeFocus:
          "Method marks matter. Keep units, working, and exact energy language visible.",
      },
      {
        id: "structured-practice",
        title: "Structured chemistry practice",
        paperCodeByBoard: {
          cambridge: "0620/22",
          edexcel: "4CH1/1C",
          oxford_aqa: "9271/1",
        },
        sessionLabel: "Oct/Nov 2023",
        component: "Short-answer paper",
        duration: "1h 00m",
        description:
          "Fast mixed-topic drill for short-answer chemistry under time pressure.",
        topicIds: ["atomic-structure-bonding", "organic-chemistry", "practical-chemistry"],
        questionFocus: ["short explanation", "identify observations", "formula patterns"],
        markSchemeFocus:
          "Do not over-answer. Exact observations and formula terminology matter more than extra prose.",
      },
      {
        id: "practical-focus",
        title: "Practical and investigation focus",
        paperCodeByBoard: {
          cambridge: "0620/62",
          edexcel: "4CH1/1PR",
          oxford_aqa: "9271/3",
        },
        sessionLabel: "Specimen 2025",
        component: "Practical paper",
        duration: "1h 00m",
        description:
          "Best for observation wording, chromatography, salt preparation, and experimental design.",
        topicIds: ["practical-chemistry", "chemical-calculations"],
        questionFocus: ["method sequence", "observations", "reliability improvements"],
        markSchemeFocus:
          "Marks are usually lost on vague method language and missing the exact observation sequence.",
      },
    ],
    templates: [
      {
        id: "mixed-source-pack",
        title: "Mixed-source pack",
        description: "Fuse selected chemistry pages with calculation and practical paper drill.",
        focusPrompt:
          "Emphasize method steps, structure-property reasoning, and mark-scheme-safe observation wording.",
        targetOutcomes: [
          "worked-example notes",
          "equation flashcards",
          "practical traps",
          "topical question ladder",
        ],
        estimatedMinutes: 70,
      },
      {
        id: "calculation-rescue",
        title: "Calculation rescue",
        description: "Turn a weak mole or energetics topic into a guided recovery run.",
        focusPrompt:
          "Show every calculation step clearly and point out where method marks are usually dropped.",
        targetOutcomes: [
          "step-by-step methods",
          "unit checklist",
          "mini quiz",
          "paper warm-up set",
        ],
        estimatedMinutes: 50,
      },
      {
        id: "exam-sprint",
        title: "48-hour exam sprint",
        description: "A compact chemistry revision run for the final stretch.",
        focusPrompt:
          "Prioritize equation balance, calculations, common observation language, and the most common paper traps.",
        targetOutcomes: [
          "high-yield revision sheet",
          "observation bank",
          "rapid recall cards",
        ],
        estimatedMinutes: 35,
      },
    ],
  },
  {
    id: "physics",
    label: "Physics",
    shortLabel: "Physics",
    positioning: "Balance conceptual explanations with formula use and experimental interpretation.",
    topics: [
      {
        id: "motion-forces",
        title: "Motion and forces",
        description: "Speed, acceleration, Newton's laws, momentum, and stopping distance.",
        examSignals: ["equations", "graph reading", "explain cause and effect"],
        weaknessCue: "Can calculate but struggles to explain what the result means physically.",
      },
      {
        id: "energy-electricity",
        title: "Energy and electricity",
        description: "Work, power, energy transfer, circuits, and electrical calculations.",
        examSignals: ["formula substitution", "circuit reasoning", "power and efficiency"],
        weaknessCue: "Loses marks by picking the wrong formula or not showing the unit trail.",
      },
      {
        id: "waves-light",
        title: "Waves and light",
        description: "Wave properties, EM spectrum, reflection, refraction, and lenses.",
        examSignals: ["diagram reasoning", "ray tracing", "compare behavior"],
        weaknessCue: "Mixes up the language for wave properties and image formation.",
      },
      {
        id: "thermal-radioactivity",
        title: "Thermal physics and radioactivity",
        description: "Specific heat, gas behavior, decay, and nuclear uses and risks.",
        examSignals: ["extended explanation", "half-life graph", "evaluate applications"],
        weaknessCue: "Needs stronger structure when describing processes and interpreting decay data.",
      },
      {
        id: "practical-physics",
        title: "Practical physics",
        description: "Measurement, data processing, uncertainty, and method design.",
        examSignals: ["identify variables", "processing data", "evaluate errors"],
        weaknessCue: "Finds it hard to translate the apparatus setup into exam wording.",
      },
    ],
    books: [
      {
        id: "coursebook",
        titleByBoard: {
          cambridge: "Cambridge IGCSE Physics Coursebook",
          edexcel: "Pearson Edexcel International GCSE Physics Student Book",
          oxford_aqa: "Oxford AQA International GCSE Physics Revision Guide",
        },
        publisher: "Hodder / Pearson / Oxford",
        edition: "2025 learner edition",
        pageCount: 372,
        description:
          "Use for chapter-to-paper mapping, formula understanding, and experiment interpretation.",
        topicIds: [
          "motion-forces",
          "energy-electricity",
          "waves-light",
          "thermal-radioactivity",
          "practical-physics",
        ],
        studyAngles: [
          "Best when you need a clean summary before you start formula-heavy practice.",
          "Pairs well with a past paper that tests the same formulas in mixed contexts.",
        ],
        rangePresets: [
          {
            id: "forces-toolkit",
            label: "Forces toolkit",
            startPage: 22,
            endPage: 106,
            topicIds: ["motion-forces"],
            summaryFocus:
              "Keep the summary equation-led, but explain what each result means physically.",
          },
          {
            id: "circuits-and-energy",
            label: "Circuits and energy",
            startPage: 132,
            endPage: 224,
            topicIds: ["energy-electricity"],
            summaryFocus:
              "Show circuit logic, formula choices, and common efficiency mistakes.",
          },
          {
            id: "waves-to-practical",
            label: "Waves to practical",
            startPage: 236,
            endPage: 344,
            topicIds: ["waves-light", "thermal-radioactivity", "practical-physics"],
            summaryFocus:
              "Blend ray diagrams, decay interpretation, and experiment-evaluation language.",
          },
        ],
      },
      {
        id: "revision-guide",
        titleByBoard: {
          cambridge: "CGP IGCSE Physics Revision Guide",
          edexcel: "CGP Edexcel International GCSE Physics Revision Guide",
          oxford_aqa: "CGP Oxford AQA International GCSE Physics Revision Guide",
        },
        publisher: "CGP",
        edition: "Exam practice edition",
        pageCount: 226,
        description:
          "Good for quick formula refreshers, misconception fixes, and last-minute topic rescue.",
        topicIds: [
          "motion-forces",
          "energy-electricity",
          "waves-light",
          "thermal-radioactivity",
          "practical-physics",
        ],
        studyAngles: [
          "Ideal for switching from rereading into retrieval practice quickly.",
          "Works well with a chosen paper when you need rapid confidence repair.",
        ],
        rangePresets: [
          {
            id: "formula-recall",
            label: "Formula recall",
            startPage: 20,
            endPage: 118,
            topicIds: ["motion-forces", "energy-electricity"],
            summaryFocus:
              "Convert the range into formula cues, worked examples, and mistake patterns.",
          },
          {
            id: "waves-and-modern",
            label: "Waves and modern",
            startPage: 126,
            endPage: 214,
            topicIds: ["waves-light", "thermal-radioactivity", "practical-physics"],
            summaryFocus:
              "Focus on diagram reasoning, decay phrasing, and practical-evaluation language.",
          },
        ],
      },
    ],
    pastPapers: [
      {
        id: "formula-paper",
        title: "Formula and explanation paper",
        paperCodeByBoard: {
          cambridge: "0625/42",
          edexcel: "4PH1/2P",
          oxford_aqa: "9265/2",
        },
        sessionLabel: "May/June 2024",
        component: "Theory paper",
        duration: "1h 15m",
        description:
          "Strong for motion, electricity, and mixed explanation questions.",
        topicIds: ["motion-forces", "energy-electricity", "waves-light"],
        questionFocus: ["formula selection", "graph interpretation", "short explanation"],
        markSchemeFocus:
          "Marks disappear when the calculation has no unit trail or the explanation misses physical meaning.",
      },
      {
        id: "mixed-paper",
        title: "Mixed-topic structured paper",
        paperCodeByBoard: {
          cambridge: "0625/22",
          edexcel: "4PH1/1P",
          oxford_aqa: "9265/1",
        },
        sessionLabel: "Oct/Nov 2023",
        component: "Structured questions",
        duration: "1h 00m",
        description:
          "Short-answer practice for switching topics quickly under time pressure.",
        topicIds: ["motion-forces", "waves-light", "thermal-radioactivity"],
        questionFocus: ["quick calculations", "label diagrams", "apply definitions"],
        markSchemeFocus:
          "Be precise with terminology, especially for wave properties and nuclear language.",
      },
      {
        id: "practical-paper",
        title: "Practical and planning focus",
        paperCodeByBoard: {
          cambridge: "0625/62",
          edexcel: "4PH1/1PR",
          oxford_aqa: "9265/3",
        },
        sessionLabel: "Specimen 2025",
        component: "Practical paper",
        duration: "1h 00m",
        description:
          "Best for measurement technique, graphing, and evaluation of the method.",
        topicIds: ["practical-physics", "motion-forces", "energy-electricity"],
        questionFocus: ["identify variables", "process data", "improve apparatus setup"],
        markSchemeFocus:
          "Keep the practical language concrete: what changes, what is controlled, and how reliability improves.",
      },
    ],
    templates: [
      {
        id: "mixed-source-pack",
        title: "Mixed-source pack",
        description: "Blend page-range theory with a formula-aware paper sequence.",
        focusPrompt:
          "Keep the pack equation-led, but make every formula feel connected to a physical meaning and common exam trap.",
        targetOutcomes: [
          "formula map",
          "worked examples",
          "topical paper drill",
          "method-evaluation notes",
        ],
        estimatedMinutes: 70,
      },
      {
        id: "weak-topic-rescue",
        title: "Weak-topic rescue",
        description: "Rebuild shaky formula and explanation topics before they spread into other papers.",
        focusPrompt:
          "Start with misconceptions, then move into short worked examples and a tiny quiz.",
        targetOutcomes: [
          "mistake bank",
          "micro summaries",
          "confidence quiz",
          "next-step paper set",
        ],
        estimatedMinutes: 45,
      },
      {
        id: "exam-sprint",
        title: "48-hour exam sprint",
        description: "Condense physics into the most useful formulas, traps, and paper habits.",
        focusPrompt:
          "Prioritize formula choice, units, diagram labels, and concise physical explanations.",
        targetOutcomes: [
          "high-yield sheet",
          "formula recall set",
          "final-check prompts",
        ],
        estimatedMinutes: 35,
      },
    ],
  },
  {
    id: "mathematics",
    label: "Mathematics",
    shortLabel: "Maths",
    positioning: "Sequence the revision around weak-topic filters, worked methods, and past-paper repetition.",
    topics: [
      {
        id: "number-algebra",
        title: "Number and algebra",
        description: "Indices, surds, linear equations, quadratics, and manipulation.",
        examSignals: ["multi-step method", "show working", "algebra fluency"],
        weaknessCue: "Often reaches the answer mentally but drops method marks in the middle steps.",
      },
      {
        id: "functions-graphs",
        title: "Functions and graphs",
        description: "Coordinate graphs, transformations, simultaneous equations, and functions.",
        examSignals: ["graph interpretation", "link equation to graph", "sketch accuracy"],
        weaknessCue: "Can solve the algebra but hesitates when the question turns visual.",
      },
      {
        id: "geometry-trigonometry",
        title: "Geometry and trigonometry",
        description: "Angle facts, circle theorems, similarity, trigonometry, and vectors.",
        examSignals: ["diagram reasoning", "proof-like steps", "calculator accuracy"],
        weaknessCue: "Loses structure on geometry explanations and theorem justification.",
      },
      {
        id: "probability-statistics",
        title: "Probability and statistics",
        description: "Probability, tree diagrams, averages, cumulative frequency, and histograms.",
        examSignals: ["process interpretation", "data display", "reasoning from context"],
        weaknessCue: "Makes slips turning a diagram or graph into the final numerical answer.",
      },
      {
        id: "exam-technique",
        title: "Exam technique and mixed papers",
        description: "Time management, question selection, and checking routines for mixed papers.",
        examSignals: ["strategy", "show working", "spotting hidden topics"],
        weaknessCue: "Needs a cleaner routine for checking answers and navigating mixed papers.",
      },
    ],
    books: [
      {
        id: "coursebook",
        titleByBoard: {
          cambridge: "Cambridge IGCSE Mathematics Coursebook",
          edexcel: "Pearson Edexcel International GCSE Mathematics Student Book",
          oxford_aqa: "Oxford AQA International GCSE Mathematics Revision Guide",
        },
        publisher: "Hodder / Pearson / Oxford",
        edition: "2025 learner edition",
        pageCount: 398,
        description:
          "Best for worked examples, chapter mapping, and choosing a range before paper practice.",
        topicIds: [
          "number-algebra",
          "functions-graphs",
          "geometry-trigonometry",
          "probability-statistics",
          "exam-technique",
        ],
        studyAngles: [
          "Use when the student needs structured worked methods rather than another full paper first.",
          "Pairs well with a paper set when algebra or geometry confidence is uneven.",
        ],
        rangePresets: [
          {
            id: "algebra-core",
            label: "Algebra core",
            startPage: 24,
            endPage: 128,
            topicIds: ["number-algebra", "functions-graphs"],
            summaryFocus:
              "Keep the notes method-first, with worked examples and the exact steps students forget under pressure.",
          },
          {
            id: "geometry-trig",
            label: "Geometry and trig",
            startPage: 176,
            endPage: 276,
            topicIds: ["geometry-trigonometry"],
            summaryFocus:
              "Emphasize theorem justification, calculator setup, and sketch-supported reasoning.",
          },
          {
            id: "data-and-exam",
            label: "Data and exam routine",
            startPage: 296,
            endPage: 378,
            topicIds: ["probability-statistics", "exam-technique"],
            summaryFocus:
              "Focus on reading graphs correctly, showing working, and a final-check routine.",
          },
        ],
      },
      {
        id: "revision-guide",
        titleByBoard: {
          cambridge: "CGP IGCSE Mathematics Revision Guide",
          edexcel: "CGP Edexcel International GCSE Mathematics Revision Guide",
          oxford_aqa: "CGP Oxford AQA International GCSE Mathematics Revision Guide",
        },
        publisher: "CGP",
        edition: "Exam practice edition",
        pageCount: 248,
        description:
          "Good for quick method refreshers, weak-topic recall, and compact paper prep.",
        topicIds: [
          "number-algebra",
          "functions-graphs",
          "geometry-trigonometry",
          "probability-statistics",
          "exam-technique",
        ],
        studyAngles: [
          "Great for turning longer chapters into a short, repeatable revision set.",
          "Use with a paper stack when the student needs pace and confidence.",
        ],
        rangePresets: [
          {
            id: "method-repair",
            label: "Method repair",
            startPage: 18,
            endPage: 124,
            topicIds: ["number-algebra", "functions-graphs"],
            summaryFocus:
              "Turn the range into worked steps, common slips, and mini confidence questions.",
          },
          {
            id: "paper-finish",
            label: "Paper finish",
            startPage: 130,
            endPage: 236,
            topicIds: [
              "geometry-trigonometry",
              "probability-statistics",
              "exam-technique",
            ],
            summaryFocus:
              "Prioritize geometry reasoning, graph reading, and the question-check routine.",
          },
        ],
      },
    ],
    pastPapers: [
      {
        id: "non-calculator-drill",
        title: "Non-calculator drill",
        paperCodeByBoard: {
          cambridge: "0580/22",
          edexcel: "4MA1/1H",
          oxford_aqa: "9260/1",
        },
        sessionLabel: "May/June 2024",
        component: "Paper 1",
        duration: "1h 30m",
        description:
          "Useful for algebra fluency, number control, and showing every method step clearly.",
        topicIds: ["number-algebra", "functions-graphs", "exam-technique"],
        questionFocus: ["method marks", "algebra fluency", "time management"],
        markSchemeFocus:
          "Method marks matter as much as accuracy. Make every step explicit enough to earn partial credit.",
      },
      {
        id: "calculator-mixed",
        title: "Calculator mixed paper",
        paperCodeByBoard: {
          cambridge: "0580/42",
          edexcel: "4MA1/2H",
          oxford_aqa: "9260/2",
        },
        sessionLabel: "Oct/Nov 2023",
        component: "Paper 2",
        duration: "1h 30m",
        description:
          "Covers geometry, trig, probability, and larger multi-step mixed questions.",
        topicIds: [
          "geometry-trigonometry",
          "probability-statistics",
          "exam-technique",
        ],
        questionFocus: ["multi-step geometry", "calculator setup", "mixed-topic endurance"],
        markSchemeFocus:
          "Students lose marks when they skip reasoning between a diagram and a final number.",
      },
      {
        id: "targeted-topic-paper",
        title: "Targeted topic refresh paper",
        paperCodeByBoard: {
          cambridge: "0580/12",
          edexcel: "4MA1/1HR",
          oxford_aqa: "9260/3",
        },
        sessionLabel: "Specimen 2025",
        component: "Short mixed paper",
        duration: "1h 00m",
        description:
          "Best for a fast weak-topic revisit before returning to full papers.",
        topicIds: ["number-algebra", "geometry-trigonometry", "probability-statistics"],
        questionFocus: ["topic switches", "check routine", "confidence rebuild"],
        markSchemeFocus:
          "Keep method lines readable and always write the intermediate step when switching methods.",
      },
    ],
    templates: [
      {
        id: "mixed-source-pack",
        title: "Mixed-source pack",
        description: "Blend worked textbook pages with a targeted paper stack and error patterns.",
        focusPrompt:
          "Keep the pack method-first, with worked examples, common slips, and a weak-topic paper sequence.",
        targetOutcomes: [
          "worked methods",
          "error bank",
          "targeted question ladder",
          "final-check routine",
        ],
        estimatedMinutes: 75,
      },
      {
        id: "weak-topic-rescue",
        title: "Weak-topic rescue",
        description: "Repair the chapters that still break down during mixed papers.",
        focusPrompt:
          "Expose the missing method step, then reinforce it with a short sequence of practice questions.",
        targetOutcomes: [
          "method recap",
          "mistake tracker",
          "mini quiz",
          "retry paper set",
        ],
        estimatedMinutes: 50,
      },
      {
        id: "exam-sprint",
        title: "48-hour exam sprint",
        description: "Compact math revision for the final run-in to a paper.",
        focusPrompt:
          "Prioritize method visibility, calculator checks, geometry justification, and fast final-check habits.",
        targetOutcomes: [
          "high-yield sheet",
          "top slips checklist",
          "timed warm-up prompts",
        ],
        estimatedMinutes: 35,
      },
    ],
  },
];

export const IGCSE_SUBJECTS = SUBJECT_BLUEPRINTS.map((subject) => ({
  id: subject.id,
  label: subject.label,
  shortLabel: subject.shortLabel,
  positioning: subject.positioning,
}));

function buildBooks(
  board: IgcseBoard,
  subject: SubjectBlueprint,
): IgcseBook[] {
  return subject.books.map((book) => ({
    id: `${board.id}-${subject.id}-${book.id}`,
    kind: "book",
    boardId: board.id,
    subjectId: subject.id,
    title: book.titleByBoard[board.id],
    publisher: book.publisher,
    edition: book.edition,
    pageCount: book.pageCount,
    description: book.description,
    topicIds: book.topicIds,
    studyAngles: book.studyAngles,
    rangePresets: book.rangePresets,
  }));
}

function buildPapers(
  board: IgcseBoard,
  subject: SubjectBlueprint,
): IgcsePastPaper[] {
  return subject.pastPapers.map((paper) => ({
    id: `${board.id}-${subject.id}-${paper.id}`,
    kind: "past_paper",
    boardId: board.id,
    subjectId: subject.id,
    title: paper.title,
    paperCode: paper.paperCodeByBoard[board.id],
    sessionLabel: paper.sessionLabel,
    component: paper.component,
    duration: paper.duration,
    description: paper.description,
    topicIds: paper.topicIds,
    questionFocus: paper.questionFocus,
    markSchemeFocus: paper.markSchemeFocus,
  }));
}

export const IGCSE_TRACKS: IgcseTrack[] = IGCSE_BOARDS.flatMap((board) =>
  SUBJECT_BLUEPRINTS.map((subject) => ({
    board,
    subject: {
      id: subject.id,
      label: subject.label,
      shortLabel: subject.shortLabel,
      positioning: subject.positioning,
    },
    topics: subject.topics,
    books: buildBooks(board, subject),
    pastPapers: buildPapers(board, subject),
    templates: subject.templates,
  })),
);

export function getIgcseTrack(boardId: IgcseBoardId, subjectId: IgcseSubjectId) {
  return (
    IGCSE_TRACKS.find(
      (track) => track.board.id === boardId && track.subject.id === subjectId,
    ) || IGCSE_TRACKS[0]
  );
}

export function getIgcseBoard(boardId: IgcseBoardId) {
  return IGCSE_BOARDS.find((board) => board.id === boardId) || IGCSE_BOARDS[0];
}

export function getTopicLookup(track: IgcseTrack) {
  return new Map(track.topics.map((topic) => [topic.id, topic]));
}

