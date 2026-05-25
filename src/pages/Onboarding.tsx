import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock3,
  Globe2,
  GraduationCap,
  Lock,
  MapPin,
  School,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  User,
  Users,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES, GRADE_LEVELS } from "@/lib/countryConfig";
import { getAvailableClassSections } from "@/lib/schoolConfig";
import { cn } from "@/lib/utils";
import {
  buildCurriculumPersonalization,
  type StudyPace,
} from "@/lib/curriculumPersonalization";
import {
  buildLoginPath,
  resolveOnboardingCompletionDestination,
} from "@/lib/auth-redirect";

const STEPS = {
  WELCOME: 0,
  IDENTITY: 1,
  LEARNING: 2,
  PRIVACY: 3,
  ROLE: 4,
  GOALS: 5,
  COMPLETION: 6,
} as const;

const ONBOARDING_STEPS = [
  { id: STEPS.WELCOME, label: "Start" },
  { id: STEPS.IDENTITY, label: "Profile" },
  { id: STEPS.LEARNING, label: "Learning" },
  { id: STEPS.PRIVACY, label: "Privacy" },
  { id: STEPS.ROLE, label: "Role" },
  { id: STEPS.GOALS, label: "Goals" },
];

const ROLES = [
  {
    id: "student",
    label: "Student",
    description: "Coursework, revision, exams, and class notes.",
  },
  {
    id: "teacher",
    label: "Teacher",
    description: "Lesson prep, study resources, and curriculum support.",
  },
  {
    id: "professional",
    label: "Professional",
    description: "Upskilling, certifications, and structured self-learning.",
  },
] as const;

const GOALS = [
  "Ace my exams",
  "Review faster",
  "Stay organized",
  "Build stronger notes",
  "Find weak spots earlier",
  "Learn with my school",
];

const INTEREST_SUGGESTIONS = [
  "Biology",
  "Chemistry",
  "Physics",
  "Math",
  "Computer science",
  "English",
  "Debate",
  "Robotics",
  "History",
  "SAT prep",
];

const PACE_OPTIONS = [
  {
    id: "light",
    label: "Light",
    description: "Short sessions",
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Steady weekly rhythm",
  },
  {
    id: "intensive",
    label: "Intensive",
    description: "Exam-focused weeks",
  },
] as const;

function inferCountrySuggestion() {
  if (typeof window === "undefined") return "sa";

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const locales = [navigator.language, ...(navigator.languages || [])].filter(
    Boolean,
  );

  const localeString = locales.join(" ").toLowerCase();
  const timeZoneLower = timeZone.toLowerCase();

  if (
    localeString.includes("-sa") ||
    localeString.includes("_sa") ||
    timeZoneLower.includes("riyadh")
  ) {
    return "sa";
  }

  if (
    localeString.includes("-eg") ||
    localeString.includes("_eg") ||
    timeZoneLower.includes("cairo")
  ) {
    return "eg";
  }

  if (
    localeString.includes("-kw") ||
    localeString.includes("_kw") ||
    timeZoneLower.includes("kuwait")
  ) {
    return "kw";
  }

  if (localeString.includes("-us") || localeString.includes("_us")) return "us";
  if (localeString.includes("-gb") || localeString.includes("_gb")) return "uk";
  return "sa";
}

function inferRegion(country?: string) {
  if (country === "sa") return "ksa";
  if (country === "eg") return "egypt";
  if (country === "kw") return "kuwait";
  if (country === "uk") return "uk";
  if (country === "us") return "us";
  return "global";
}

function inferCurriculumTrack(curriculum?: string) {
  const value = String(curriculum || "").toLowerCase();
  if (
    value.includes("british") ||
    value.includes("igcse") ||
    value.includes("cambridge")
  ) {
    return "british";
  }
  if (
    value.includes("american") ||
    value.includes("sat") ||
    value.includes("ap")
  ) {
    return "american";
  }
  if (value.includes("ib")) return "ib";
  if (value.includes("nile")) return "nile";
  if (value.includes("scottish")) return "scottish";
  if (value.includes("honors")) return "honors";
  if (
    value.includes("national") ||
    value.includes("thanaweya") ||
    value.includes("general")
  ) {
    return "national";
  }
  return "general";
}

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<number>(STEPS.WELCOME);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAdvancedLearning, setShowAdvancedLearning] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    image: user?.image || "",
    imageStorageId: undefined as Id<"_storage"> | undefined,
    bio: user?.bio || "",
    userRole: "student",
    goals: [] as string[],
    interests: user?.interests || ([] as string[]),
    country: "",
    region: "",
    curriculum: "",
    curriculumTrack: "",
    gradeLevel: "",
    schoolId: "",
    classSection: user?.classSection || "",
    preferredLanguage: "en" as "en" | "ar",
    targetSubjects: [] as string[],
    targetExams: [] as string[],
    studyPace: "balanced" as StudyPace,
    schoolNetworkOptIn: false,
    discoverableInSchool: false,
    profileVisibility: "private" as "private" | "school" | "public",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(
        buildLoginPath(
          `${location.pathname}${location.search}${location.hash}`,
        ),
        { replace: true },
      );
    }
  }, [
    isAuthenticated,
    isLoading,
    location.hash,
    location.pathname,
    location.search,
    navigate,
  ]);

  useEffect(() => {
    if (!formData.country) {
      const suggestedCountry = inferCountrySuggestion();
      const countryConfig = COUNTRIES[suggestedCountry];
      setFormData((prev) => ({
        ...prev,
        country: suggestedCountry,
        region: inferRegion(suggestedCountry),
        preferredLanguage: countryConfig?.direction === "rtl" ? "ar" : "en",
      }));
    }
  }, [formData.country]);

  const selectedCountry = formData.country ? COUNTRIES[formData.country] : null;
  const availableClassSections = useMemo(
    () => getAvailableClassSections(formData.schoolId, formData.gradeLevel),
    [formData.gradeLevel, formData.schoolId],
  );
  const filteredSchools = useMemo(() => {
    return (selectedCountry?.schools || []).filter((school) =>
      school.name.toLowerCase().includes(schoolSearch.toLowerCase()),
    );
  }, [schoolSearch, selectedCountry]);

  useEffect(() => {
    if (
      formData.classSection &&
      !availableClassSections.includes(formData.classSection)
    ) {
      setFormData((prev) => ({
        ...prev,
        classSection: "",
      }));
    }
  }, [availableClassSections, formData.classSection]);

  const starterBlueprint = useMemo(
    () =>
      buildCurriculumPersonalization({
        country: formData.country,
        region: formData.region,
        curriculum: formData.curriculum,
        curriculumTrack: formData.curriculumTrack,
        gradeLevel: formData.gradeLevel,
        targetSubjects: formData.targetSubjects,
        targetExams: formData.targetExams,
        studyPace: formData.studyPace,
        preferredLanguage: formData.preferredLanguage,
      }),
    [
      formData.country,
      formData.region,
      formData.curriculum,
      formData.curriculumTrack,
      formData.gradeLevel,
      formData.targetSubjects,
      formData.targetExams,
      formData.studyPace,
      formData.preferredLanguage,
    ],
  );

  const toggleArrayValue = (
    key: "targetSubjects" | "targetExams",
    value: string,
  ) => {
    setFormData((prev) => {
      const items = prev[key];
      const exists = items.includes(value);
      const nextItems = exists
        ? items.filter((item) => item !== value)
        : [...items, value];
      return { ...prev, [key]: nextItems };
    });
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((item: string) => item !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      setFormData((prev) => ({
        ...prev,
        imageStorageId: storageId,
        image: URL.createObjectURL(file),
      }));
      toast.success("Photo uploaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (step === STEPS.IDENTITY && !formData.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (step === STEPS.LEARNING) {
      if (!formData.country || !formData.curriculum || !formData.gradeLevel) {
        toast.error("Choose your country, curriculum, and grade to continue.");
        return;
      }
    }

    if (step === STEPS.ROLE && !formData.userRole) {
      toast.error("Choose the role that fits you best.");
      return;
    }

    if (step === STEPS.GOALS && formData.goals.length === 0) {
      toast.error("Pick at least one goal.");
      return;
    }

    if (step === STEPS.GOALS) {
      void handleSubmit();
      return;
    }

    setStep((current) => current + 1);
  };

  const handleBack = () => {
    setStep((current) => Math.max(STEPS.WELCOME, current - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const affiliateCode =
        sessionStorage.getItem("affiliateRef") ||
        searchParams.get("ref") ||
        undefined;

      const curriculumTrack = inferCurriculumTrack(formData.curriculum);
      const countryConfig = formData.country
        ? COUNTRIES[formData.country]
        : null;
      const targetSubjects = formData.targetSubjects.length
        ? formData.targetSubjects
        : starterBlueprint.recommendedSubjects;
      const targetExams = formData.targetExams.length
        ? formData.targetExams
        : starterBlueprint.recommendedExams;

      await completeOnboarding({
        name: formData.name.trim(),
        userRole: formData.userRole,
        goals: formData.goals,
        image:
          formData.image && !formData.image.startsWith("blob:")
            ? formData.image
            : undefined,
        imageStorageId: formData.imageStorageId || undefined,
        bio: formData.bio,
        interests: formData.interests,
        affiliateCode,
        region: inferRegion(formData.country),
        curriculum: formData.curriculum,
        country: formData.country,
        schoolId: formData.schoolId || undefined,
        gradeLevel: formData.gradeLevel,
        classSection: formData.classSection || undefined,
        curriculumTrack,
        isRTL: countryConfig?.direction === "rtl",
        preferredLanguage: formData.preferredLanguage,
        targetSubjects,
        targetExams,
        studyPace: formData.studyPace,
        schoolNetworkOptIn: Boolean(
          formData.schoolId && formData.schoolNetworkOptIn,
        ),
        discoverableInSchool: Boolean(
          formData.schoolId &&
            formData.schoolNetworkOptIn &&
            formData.discoverableInSchool,
        ),
        profileVisibility:
          formData.schoolId && formData.schoolNetworkOptIn
            ? formData.profileVisibility
            : "private",
        schoolMembershipStatus: formData.schoolId ? "unverified" : undefined,
        tosAccepted: true,
        privacyPolicyAccepted: true,
      });

      setStep(STEPS.COMPLETION);
      setTimeout(() => {
        navigate(
          resolveOnboardingCompletionDestination(searchParams.get("redirect")),
          { replace: true },
        );
      }, 1800);
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Failed to complete onboarding");
      setIsSubmitting(false);
    }
  };

  const handleQuickStart = async () => {
    setIsSubmitting(true);
    try {
      const suggestedCountry = formData.country || inferCountrySuggestion();
      const countryConfig = COUNTRIES[suggestedCountry];
      const fallbackCurriculum = countryConfig?.curriculums?.[0] || "General";
      const fallbackGrade =
        formData.gradeLevel || GRADE_LEVELS[2] || GRADE_LEVELS[0] || "Grade 8";
      const curriculum = formData.curriculum || fallbackCurriculum;
      const quickBlueprint = buildCurriculumPersonalization({
        country: suggestedCountry,
        region: inferRegion(suggestedCountry),
        curriculum,
        curriculumTrack: inferCurriculumTrack(curriculum),
        gradeLevel: fallbackGrade,
        targetSubjects: formData.targetSubjects,
        targetExams: formData.targetExams,
        studyPace: formData.studyPace,
        preferredLanguage: countryConfig?.direction === "rtl" ? "ar" : "en",
      });

      await completeOnboarding({
        name: formData.name.trim() || user?.name || "Student",
        userRole: formData.userRole || "student",
        goals: formData.goals.length ? formData.goals : ["Build a study pack"],
        image: undefined,
        imageStorageId: undefined,
        bio: "",
        interests: formData.interests,
        affiliateCode:
          sessionStorage.getItem("affiliateRef") ||
          searchParams.get("ref") ||
          undefined,
        region: inferRegion(suggestedCountry),
        curriculum,
        country: suggestedCountry,
        schoolId: undefined,
        gradeLevel: fallbackGrade,
        classSection: undefined,
        curriculumTrack: inferCurriculumTrack(curriculum),
        isRTL: countryConfig?.direction === "rtl",
        preferredLanguage: countryConfig?.direction === "rtl" ? "ar" : "en",
        targetSubjects: formData.targetSubjects.length
          ? formData.targetSubjects
          : quickBlueprint.recommendedSubjects,
        targetExams: formData.targetExams.length
          ? formData.targetExams
          : quickBlueprint.recommendedExams,
        studyPace: formData.studyPace,
        schoolNetworkOptIn: false,
        discoverableInSchool: false,
        profileVisibility: "private",
        schoolMembershipStatus: undefined,
        tosAccepted: true,
        privacyPolicyAccepted: true,
      });

      navigate("/study/dashboard?action=scan#mobile-capture-lane", {
        replace: true,
      });
    } catch (error: any) {
      console.error("Quick onboarding error:", error);
      toast.error(error.message || "Failed to start Cryonex");
      setIsSubmitting(false);
    }
  };

  const progress = ((step + 1) / (STEPS.COMPLETION + 1)) * 100;
  const requiredSetupCount = [
    formData.country,
    formData.curriculum,
    formData.gradeLevel,
  ].filter(Boolean).length;
  const welcomeCards = [
    {
      icon: MapPin,
      title: "Local study context",
      body: selectedCountry
        ? `${selectedCountry.name} is ready. Pick curriculum and grade next.`
        : "We suggest your region from device language and timezone.",
    },
    {
      icon: BookOpen,
      title: "Curriculum-aware help",
      body: formData.curriculum
        ? `${formData.curriculum} will tune packs, quizzes, and summaries.`
        : "Choose the track your school actually follows.",
    },
    {
      icon: ShieldCheck,
      title: "Private by default",
      body: "School discovery stays off unless you explicitly opt in.",
    },
  ];

  return (
    <div className="cryonex-couture-shell relative h-[100dvh] overflow-y-auto overflow-x-hidden px-4 py-5 text-white sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(37,99,235,0.13)_0%,rgba(5,2,24,0.72)_42%,rgba(5,2,24,1)_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:url('/noise.svg')]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl pb-8 sm:pb-10">
        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              <Sparkles className="h-3.5 w-3.5" />
              Step {Math.min(step + 1, ONBOARDING_STEPS.length)} of{" "}
              {ONBOARDING_STEPS.length}
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
              Personalize your study OS
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/52">
              A calmer setup that asks for study context first, then keeps
              optional profile and school visibility choices out of the way.
            </p>
          </div>
          <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-4 px-1 pb-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                  Setup signal
                </p>
                <p className="mt-1 text-sm font-medium text-white/80">
                  {requiredSetupCount}/3 required choices ready
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/64">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {ONBOARDING_STEPS.map((item) => {
                const isActive = step === item.id;
                const isDone = step > item.id;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-[16px] border px-2.5 py-2 text-center text-[10px] font-semibold transition-colors",
                      isActive
                        ? "border-white/20 bg-white/[0.1] text-white"
                        : isDone
                          ? "border-white/10 bg-white/[0.05] text-white/58"
                          : "border-white/10 bg-transparent text-white/34",
                    )}
                  >
                    {item.label}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 w-full rounded-full border border-white/10 bg-black/20 p-1">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-300 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === STEPS.WELCOME && (
            <motion.section
              key="welcome"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="deepshi-panel couture-panel overflow-hidden rounded-[32px] border border-white/10 p-6 md:p-8"
            >
              <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.06em] text-white md:text-5xl lg:text-6xl">
                    Start with the context that actually changes your study plan.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58 md:text-base">
                    Cryonex only needs three required choices: region,
                    curriculum, and grade. Profile, school discovery, and
                    extras stay clearly optional.
                  </p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    {welcomeCards.map((card) => (
                      <div
                        key={card.title}
                        className="cyber-tactile-card rounded-[22px] p-4"
                      >
                        <card.icon className="h-5 w-5 text-cyan-200/86" />
                        <p className="mt-3 text-sm font-semibold text-white">
                          {card.title}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-white/48">
                          {card.body}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="tactile-button h-11 rounded-full px-6"
                    >
                      Start setup
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleQuickStart}
                      disabled={isSubmitting}
                      className="h-11 rounded-full text-white/70 hover:bg-white/[0.06] hover:text-white"
                    >
                      Use defaults and upload
                    </Button>
                  </div>
                </div>

                <div className="cyber-tactile-card flex flex-col rounded-[28px] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">
                    What gets saved
                  </p>
                  <div className="mt-4 grid gap-3">
                    {[
                      ["Region", selectedCountry?.name || "Auto-suggested"],
                      [
                        "Subjects",
                        starterBlueprint.recommendedSubjects
                          .slice(0, 3)
                          .join(", ") || "Recommended from your curriculum",
                      ],
                      ["Privacy", "Private unless you opt into school"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3"
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/34">
                          {label}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-white/76">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto rounded-[20px] border border-cyan-200/10 bg-cyan-300/[0.06] px-4 py-3">
                    <p className="text-xs leading-5 text-white/50">
                      The quick path saves these defaults and opens the study
                      upload lane. You can change them later from Settings.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {step === STEPS.IDENTITY && (
            <motion.section
              key="identity"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="deepshi-panel couture-panel rounded-[32px] border border-white/10 p-6 md:p-8"
            >
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white">
                Who’s studying?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Keep this simple. A name is required; photo, bio, and interests
                help only if you use school discovery later.
              </p>

              <div className="mt-7 grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <div
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-white/15 bg-black/20 px-4 py-6 transition-colors hover:border-white/25"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10">
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-white/45" />
                      )}
                    </div>
                    <p className="mt-3 text-sm font-medium text-white">
                      Upload photo
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/65">
                      <Upload className="h-3.5 w-3.5" />
                      {isUploading ? "Uploading..." : "Choose image"}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="grid gap-5">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      className="mt-3 h-[52px] rounded-2xl border-white/10 bg-white/[0.04] text-white"
                      placeholder="Ahmed, Sara, Alex..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <Label>Bio</Label>
                      <span className="text-xs text-white/38">Optional</span>
                    </div>
                    <Textarea
                      value={formData.bio}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          bio: event.target.value,
                        }))
                      }
                      placeholder="Short profile note for school discovery"
                      className="mt-3 min-h-[92px] rounded-2xl border-white/10 bg-white/[0.04] text-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <Label>Interests</Label>
                      <span className="text-xs text-white/40">
                        {formData.interests.length} selected
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {INTEREST_SUGGESTIONS.map((interest) => {
                        const isActive = formData.interests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={cn(
                              "rounded-full border px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "border-cyan-300/30 bg-cyan-300/10 text-white"
                                : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.05]",
                            )}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between border-t border-white/10 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="rounded-full text-white/65 hover:bg-white/[0.06] hover:text-white"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="tactile-button rounded-full"
                    >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.section>
          )}

          {step === STEPS.LEARNING && (
            <motion.section
              key="learning"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="deepshi-panel couture-panel rounded-[32px] border border-white/10 p-6 md:p-8"
            >
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white">
                Match Cryonex to your classes
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Choose the required basics first. School, language, exam, and
                pace controls stay in an advanced panel until you need them.
              </p>

              <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
                <div className="space-y-5">
                  <div className="cyber-tactile-card rounded-[28px] p-4 md:p-5">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/10 bg-cyan-300/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/74">
                          <Target className="h-3.5 w-3.5" />
                          Essentials
                        </div>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/52">
                          Required choices are grouped here so the page has one
                          clear job.
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/58">
                        {requiredSetupCount}/3 ready
                      </span>
                    </div>

                    <div className="mt-5">
                      <Label>Country</Label>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {Object.values(COUNTRIES).map((country) => (
                          <button
                            key={country.id}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                country: country.id,
                                region: inferRegion(country.id),
                                curriculum:
                                  prev.country === country.id
                                    ? prev.curriculum
                                    : "",
                                schoolId: "",
                                classSection: "",
                                preferredLanguage:
                                  country.direction === "rtl" ? "ar" : "en",
                              }))
                            }
                            className={cn(
                              "rounded-[20px] border px-4 py-3 text-left transition-colors",
                              formData.country === country.id
                                ? "border-cyan-300/30 bg-cyan-300/10"
                                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{country.flag}</span>
                              <div>
                                <div className="text-sm font-semibold text-white">
                                  {country.name}
                                </div>
                                <div className="mt-0.5 text-xs text-white/42">
                                  {country.direction === "rtl" ? "RTL" : "LTR"}{" "}
                                  default
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      <div>
                        <Label>Curriculum</Label>
                        <div className="mt-3 grid max-h-[248px] gap-2 overflow-y-auto pr-1 custom-scrollbar">
                          {(selectedCountry?.curriculums || []).map(
                            (curriculum) => (
                              <button
                                key={curriculum}
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    curriculum,
                                    curriculumTrack:
                                      inferCurriculumTrack(curriculum),
                                  }))
                                }
                                className={cn(
                                  "rounded-[18px] border px-4 py-3 text-left text-sm transition-colors",
                                  formData.curriculum === curriculum
                                    ? "border-cyan-300/30 bg-cyan-300/10 text-white"
                                    : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.05]",
                                )}
                              >
                                {curriculum}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Grade</Label>
                        <div className="mt-3 grid max-h-[248px] gap-2 overflow-y-auto pr-1 custom-scrollbar">
                          {GRADE_LEVELS.map((grade) => (
                            <button
                              key={grade}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  gradeLevel: grade,
                                }))
                              }
                              className={cn(
                                "rounded-[18px] border px-4 py-3 text-left text-sm transition-colors",
                                formData.gradeLevel === grade
                                  ? "border-cyan-300/30 bg-cyan-300/10 text-white"
                                  : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.05]",
                              )}
                            >
                              {grade}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAdvancedLearning((open) => !open)}
                    className="cyber-tactile-card flex w-full items-center justify-between gap-4 rounded-[24px] px-5 py-4 text-left transition-colors hover:bg-white/[0.07]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Advanced personalization
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/46">
                        School, language, starter subjects, exams, and pace.
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/58">
                      {showAdvancedLearning ? "Hide" : "Open"}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {showAdvancedLearning ? (
                      <motion.div
                        key="advanced-learning"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="cyber-tactile-card overflow-hidden rounded-[28px]"
                      >
                        <div className="p-4 md:p-5">
                          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                            <div>
                              <div className="flex items-center justify-between gap-3">
                                <Label>School</Label>
                                <span className="text-xs text-white/40">
                                  Optional
                                </span>
                              </div>
                              <Input
                                value={schoolSearch}
                                onChange={(event) =>
                                  setSchoolSearch(event.target.value)
                                }
                                placeholder="Search schools..."
                                className="mt-3 h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                              />
                              <div className="mt-3 grid max-h-[210px] gap-2 overflow-y-auto pr-1 custom-scrollbar">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      schoolId: "",
                                      classSection: "",
                                    }))
                                  }
                                  className={cn(
                                    "rounded-[18px] border px-4 py-3 text-left text-sm transition-colors",
                                    !formData.schoolId
                                      ? "border-white/20 bg-white/[0.08] text-white"
                                      : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.05]",
                                  )}
                                >
                                  Independent / not listed
                                </button>
                                {filteredSchools.map((school) => (
                                  <button
                                    key={school.id}
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        schoolId: school.id,
                                        classSection: "",
                                      }))
                                    }
                                    className={cn(
                                      "rounded-[18px] border px-4 py-3 text-left text-sm transition-colors",
                                      formData.schoolId === school.id
                                        ? "border-white/20 bg-white/[0.08] text-white"
                                        : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.05]",
                                    )}
                                  >
                                    {school.name}
                                  </button>
                                ))}
                              </div>

                              {availableClassSections.length > 0 ? (
                                <div className="mt-4">
                                  <Label>Class section</Label>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {availableClassSections.map((section) => (
                                      <button
                                        key={section}
                                        type="button"
                                        onClick={() =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            classSection: section,
                                          }))
                                        }
                                        className={cn(
                                          "rounded-full border px-3 py-2 text-sm transition-colors",
                                          formData.classSection === section
                                            ? "border-white/20 bg-white/[0.09] text-white"
                                            : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.05]",
                                        )}
                                      >
                                        Section {section}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>

                            <div className="space-y-5">
                              <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                                  <Globe2 className="h-3.5 w-3.5" />
                                  Language
                                </div>
                                <div className="mt-3 grid gap-2">
                                  {[
                                    { id: "en", label: "English-first" },
                                    { id: "ar", label: "Arabic-first" },
                                  ].map((language) => (
                                    <button
                                      key={language.id}
                                      type="button"
                                      onClick={() =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          preferredLanguage:
                                            language.id as "en" | "ar",
                                        }))
                                      }
                                      className={cn(
                                        "rounded-[18px] border px-4 py-3 text-left text-sm transition-colors",
                                        formData.preferredLanguage ===
                                          language.id
                                          ? "border-white/20 bg-white/[0.08] text-white"
                                          : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.05]",
                                      )}
                                    >
                                      {language.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                                  <Clock3 className="h-3.5 w-3.5" />
                                  Pace
                                </div>
                                <div className="mt-3 grid gap-2">
                                  {PACE_OPTIONS.map((pace) => (
                                    <button
                                      key={pace.id}
                                      type="button"
                                      onClick={() =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          studyPace: pace.id as StudyPace,
                                        }))
                                      }
                                      className={cn(
                                        "rounded-[18px] border px-4 py-3 text-left transition-colors",
                                        formData.studyPace === pace.id
                                          ? "border-white/20 bg-white/[0.08] text-white"
                                          : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.05]",
                                      )}
                                    >
                                      <p className="text-sm font-semibold">
                                        {pace.label}
                                      </p>
                                      <p className="mt-1 text-xs leading-5 text-white/50">
                                        {pace.description}
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-5 md:grid-cols-2">
                            <div>
                              <div className="flex items-center justify-between gap-3">
                                <Label>Starter subjects</Label>
                                <span className="text-xs text-white/40">
                                  Defaults save if untouched
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {starterBlueprint.recommendedSubjects.map(
                                  (subject) => {
                                    const isActive =
                                      formData.targetSubjects.includes(subject);
                                    return (
                                      <button
                                        key={subject}
                                        type="button"
                                        onClick={() =>
                                          toggleArrayValue(
                                            "targetSubjects",
                                            subject,
                                          )
                                        }
                                        className={cn(
                                          "rounded-full border px-3 py-2 text-sm transition-colors",
                                          isActive
                                            ? "border-cyan-300/30 bg-cyan-300/10 text-white"
                                            : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.05]",
                                        )}
                                      >
                                        {subject}
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between gap-3">
                                <Label>Exam targets</Label>
                                <span className="text-xs text-white/40">
                                  Defaults save if untouched
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {starterBlueprint.recommendedExams.map(
                                  (exam) => {
                                    const isActive =
                                      formData.targetExams.includes(exam);
                                    return (
                                      <button
                                        key={exam}
                                        type="button"
                                        onClick={() =>
                                          toggleArrayValue("targetExams", exam)
                                        }
                                        className={cn(
                                          "rounded-full border px-3 py-2 text-sm transition-colors",
                                          isActive
                                            ? "border-cyan-300/30 bg-cyan-300/10 text-white"
                                            : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.05]",
                                        )}
                                      >
                                        {exam}
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <aside className="cyber-tactile-card h-fit rounded-[28px] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">
                    Study plan preview
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      {
                        icon: MapPin,
                        label: "Region",
                        value: selectedCountry?.name || "Not chosen",
                      },
                      {
                        icon: BookOpen,
                        label: "Curriculum",
                        value: formData.curriculum || "Required",
                      },
                      {
                        icon: GraduationCap,
                        label: "Grade",
                        value: formData.gradeLevel || "Required",
                      },
                      {
                        icon: Target,
                        label: "Subjects",
                        value: formData.targetSubjects.length
                          ? `${formData.targetSubjects.length} selected`
                          : `${starterBlueprint.recommendedSubjects.length} defaults`,
                      },
                      {
                        icon: School,
                        label: "School",
                        value: formData.schoolId ? "Linked" : "Independent",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-black/20 px-3 py-3"
                      >
                        <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-white/48" />
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-white/36">
                            {item.label}
                          </p>
                          <p className="mt-1 text-sm font-medium text-white/78">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-[20px] border border-cyan-200/10 bg-cyan-300/[0.06] px-4 py-3">
                    <p className="text-xs leading-5 text-white/50">
                      If you skip advanced choices, Cryonex saves the
                      recommended subjects and exams from this preview.
                    </p>
                  </div>
                </aside>
              </div>

              <div className="mt-8 flex justify-between border-t border-white/10 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="rounded-full text-white/65 hover:bg-white/[0.06] hover:text-white"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                    className="tactile-button rounded-full"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.section>
          )}

          {step === STEPS.PRIVACY && (
            <motion.section
              key="privacy"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="deepshi-panel couture-panel rounded-[36px] border border-white/10 p-8"
            >
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white">
                Choose your school privacy defaults
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Cryonex never auto-enrolls you in a school network. You choose
                whether classmates can discover your profile and study assets.
              </p>

              <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        schoolNetworkOptIn: false,
                        discoverableInSchool: false,
                        profileVisibility: "private",
                      }))
                    }
                    className={cn(
                      "cyber-tactile-card w-full rounded-[26px] p-5 text-left transition-colors",
                      !formData.schoolNetworkOptIn
                        ? "border-white/20 bg-white/[0.08]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Lock className="mt-1 h-5 w-5 text-white/72" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Keep me private
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-white/55">
                          No schoolmate discovery, no school feed presence, and
                          private profile defaults.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={!formData.schoolId}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        schoolNetworkOptIn: true,
                        discoverableInSchool: true,
                        profileVisibility: "school",
                      }))
                    }
                    className={cn(
                      "cyber-tactile-card w-full rounded-[26px] p-5 text-left transition-colors",
                      formData.schoolNetworkOptIn
                        ? "border-white/20 bg-white/[0.08]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                      !formData.schoolId && "cursor-not-allowed opacity-55",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Users className="mt-1 h-5 w-5 text-white/72" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Opt into my school network
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-white/55">
                          Let classmates discover your profile and
                          school-visible study assets. Public sharing still
                          stays opt-in per asset.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="cyber-tactile-card rounded-[28px] p-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    <School className="h-3.5 w-3.5" />
                    Visibility
                  </div>
                  <div className="mt-4 grid gap-2">
                    {[
                      { id: "private", label: "Private profile" },
                      { id: "school", label: "Visible to school only" },
                      { id: "public", label: "Public creator profile" },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        disabled={
                          !formData.schoolNetworkOptIn &&
                          option.id !== "private"
                        }
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            profileVisibility: option.id as
                              | "private"
                              | "school"
                              | "public",
                          }))
                        }
                        className={cn(
                          "rounded-[22px] border px-4 py-3 text-left text-sm transition-colors",
                          formData.profileVisibility === option.id
                            ? "border-white/20 bg-white/[0.08] text-white"
                            : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.05]",
                          !formData.schoolNetworkOptIn &&
                            option.id !== "private" &&
                            "cursor-not-allowed opacity-55",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between border-t border-white/10 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="rounded-full text-white/65 hover:bg-white/[0.06] hover:text-white"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="tactile-button rounded-full"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.section>
          )}

          {step === STEPS.ROLE && (
            <motion.section
              key="role"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="deepshi-panel couture-panel rounded-[36px] border border-white/10 p-8"
            >
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white">
                Which role fits you best?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                We use this to tune the dashboard language and study
                suggestions.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, userRole: role.id }))
                    }
                    className={cn(
                      "cyber-tactile-card rounded-[26px] p-5 text-left transition-colors",
                      formData.userRole === role.id
                        ? "border-white/20 bg-white/[0.08]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <GraduationCap className="h-5 w-5 text-white/72" />
                      {formData.userRole === role.id ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : null}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {role.label}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/55">
                      {role.description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-between border-t border-white/10 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="rounded-full text-white/65 hover:bg-white/[0.06] hover:text-white"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="tactile-button rounded-full"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.section>
          )}

          {step === STEPS.GOALS && (
            <motion.section
              key="goals"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="deepshi-panel couture-panel rounded-[36px] border border-white/10 p-8"
            >
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white">
                What should Cryonex optimize for?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Pick the goals that best describe what a great dashboard should
                do for you.
              </p>

              <div className="mt-8 grid gap-3 md:grid-cols-3">
                {GOALS.map((goal) => {
                  const selected = formData.goals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          goals: selected
                            ? prev.goals.filter((item) => item !== goal)
                            : [...prev.goals, goal],
                        }))
                      }
                      className={cn(
                        "cyber-tactile-card rounded-[22px] px-4 py-4 text-left text-sm transition-colors",
                        selected
                          ? "border-white/20 bg-white/[0.08] text-white"
                          : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.05]",
                      )}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-between border-t border-white/10 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="rounded-full text-white/65 hover:bg-white/[0.06] hover:text-white"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="tactile-button rounded-full"
                >
                  {isSubmitting ? "Setting up..." : "Complete setup"}
                  {!isSubmitting ? (
                    <ChevronRight className="ml-2 h-4 w-4" />
                  ) : null}
                </Button>
              </div>
            </motion.section>
          )}

          {step === STEPS.COMPLETION && (
            <motion.section
              key="completion"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="deepshi-panel couture-panel rounded-[36px] border border-white/10 p-10 text-center"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                <Check className="h-10 w-10 text-white" />
              </div>
              <h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-white">
                Your study OS is ready.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/58 md:text-base">
                We’re preparing your dashboard, localized discovery rails, and
                school hub defaults.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
