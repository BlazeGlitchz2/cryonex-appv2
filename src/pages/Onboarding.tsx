import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Globe2,
  GraduationCap,
  Lock,
  School,
  Sparkles,
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
import ProgressIndicator from "@/components/ui/progress-indicator";
import { COUNTRIES, GRADE_LEVELS } from "@/lib/countryConfig";
import { cn } from "@/lib/utils";
import { StarterStudyPack } from "@/components/study/StarterStudyPack";
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

  if (localeString.includes("-us") || localeString.includes("_us")) return "us";
  if (localeString.includes("-gb") || localeString.includes("_gb")) return "uk";
  return "sa";
}

function inferRegion(country?: string) {
  if (country === "sa") return "ksa";
  if (country === "eg") return "egypt";
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
  const [schoolSearch, setSchoolSearch] = useState("");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    image: user?.image || "",
    imageStorageId: undefined as Id<"_storage"> | undefined,
    userRole: "student",
    goals: [] as string[],
    country: "",
    region: "",
    curriculum: "",
    curriculumTrack: "",
    gradeLevel: "",
    schoolId: "",
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
  const filteredSchools = useMemo(() => {
    return (selectedCountry?.schools || []).filter((school) =>
      school.name.toLowerCase().includes(schoolSearch.toLowerCase()),
    );
  }, [schoolSearch, selectedCountry]);

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

      await completeOnboarding({
        name: formData.name.trim(),
        userRole: formData.userRole,
        goals: formData.goals,
        image:
          formData.image && !formData.image.startsWith("blob:")
            ? formData.image
            : undefined,
        imageStorageId: formData.imageStorageId || undefined,
        affiliateCode,
        region: inferRegion(formData.country),
        curriculum: formData.curriculum,
        country: formData.country,
        schoolId: formData.schoolId || undefined,
        gradeLevel: formData.gradeLevel,
        curriculumTrack,
        isRTL: countryConfig?.direction === "rtl",
        preferredLanguage: formData.preferredLanguage,
        targetSubjects: formData.targetSubjects,
        targetExams: formData.targetExams,
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

  const progress = ((step + 1) / (STEPS.COMPLETION + 1)) * 100;
  const onboardingPhase =
    step <= STEPS.IDENTITY ? 1 : step <= STEPS.PRIVACY ? 2 : 3;

  return (
    <div className="relative h-[100dvh] overflow-y-auto overflow-x-hidden bg-[#050218] px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.06),transparent_0,transparent_18%),radial-gradient(circle_at_78%_10%,rgba(118,88,255,0.16),transparent_22%),linear-gradient(180deg,#09032f_0%,#060220_52%,#040115_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:url('/noise.svg')]" />
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-[#D244FF]/10 blur-[130px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl pb-8 sm:pb-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
              <Sparkles className="h-3.5 w-3.5" />
              Cryonex onboarding
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
              Personalize your study OS
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <ProgressIndicator
              currentStep={onboardingPhase}
              hideButtons
              className="rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-4"
            />
            <div className="w-full max-w-xs rounded-full border border-white/10 bg-white/[0.03] p-1">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#D244FF] via-[#8C7BFF] to-cyan-400 transition-all duration-500"
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
              className="deepshi-panel rounded-[36px] border border-white/10 p-8 md:p-10"
            >
              <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_320px]">
                <div>
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/10">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="mt-6 text-4xl font-semibold tracking-[-0.06em] text-white md:text-5xl">
                    Start with your real learning context.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58 md:text-base">
                    Cryonex works best when it knows your country, curriculum,
                    grade, school, and privacy preferences. We use that context
                    to shape the dashboard, the library rails, and the school
                    hub from day one.
                  </p>
                  <div className="mt-8 flex gap-3">
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="rounded-full bg-white px-6 text-black hover:bg-white/92"
                    >
                      Begin setup
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/42">
                    You’ll personalize
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      "Country + curriculum",
                      "School + grade",
                      "Language + RTL mode",
                      "School feed privacy",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80"
                      >
                        {item}
                      </div>
                    ))}
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
              className="deepshi-panel rounded-[36px] border border-white/10 p-8"
            >
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white">
                Who’s studying?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Add a name and profile photo so your school hub identity feels
                real when you choose to opt in.
              </p>

              <div className="mt-8 grid gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <div
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-[26px] border border-dashed border-white/15 bg-black/20 px-5 py-8 transition-colors hover:border-white/25"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10">
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
                    <p className="mt-4 text-sm font-medium text-white">
                      Upload photo
                    </p>
                    <p className="mt-1 text-xs text-white/42">
                      Optional but helpful for school discovery
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/65">
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

                <div className="space-y-3">
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    className="h-14 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                    placeholder="Ahmed, Sara, Alex..."
                  />
                  <p className="text-sm text-white/45">
                    Your name appears on your private dashboard, and on
                    school-visible assets only if you opt into the school
                    network later.
                  </p>
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
                  className="rounded-full bg-white text-black hover:bg-white/92"
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
              className="deepshi-panel rounded-[36px] border border-white/10 p-8"
            >
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white">
                Match Cryonex to your learning environment
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                We suggest your country from locale/timezone signals, but you
                stay in full control.
              </p>

              <div className="mt-8 space-y-8">
                <div>
                  <Label>Country</Label>
                  <div className="mt-3 grid gap-3 md:grid-cols-4">
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
                            preferredLanguage:
                              country.direction === "rtl" ? "ar" : "en",
                          }))
                        }
                        className={cn(
                          "rounded-[24px] border p-4 text-left transition-colors",
                          formData.country === country.id
                            ? "border-white/20 bg-white/[0.08]"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                        )}
                      >
                        <div className="text-3xl">{country.flag}</div>
                        <div className="mt-3 text-sm font-semibold text-white">
                          {country.name}
                        </div>
                        <div className="mt-1 text-xs text-white/42">
                          Suggested from your device when possible
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label>Curriculum</Label>
                    <div className="mt-3 grid gap-2">
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
                              "rounded-[22px] border px-4 py-3 text-left text-sm transition-colors",
                              formData.curriculum === curriculum
                                ? "border-white/20 bg-white/[0.08] text-white"
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
                    <div className="mt-3 grid gap-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
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
                            "rounded-[22px] border px-4 py-3 text-left text-sm transition-colors",
                            formData.gradeLevel === grade
                              ? "border-white/20 bg-white/[0.08] text-white"
                              : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.05]",
                          )}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <Label>School</Label>
                      <span className="text-xs text-white/40">
                        Optional, but needed for the school hub
                      </span>
                    </div>
                    <Input
                      value={schoolSearch}
                      onChange={(event) => setSchoolSearch(event.target.value)}
                      placeholder="Search schools..."
                      className="mt-3 h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                    />
                    <div className="mt-3 grid gap-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, schoolId: "" }))
                        }
                        className={cn(
                          "rounded-[22px] border px-4 py-3 text-left text-sm transition-colors",
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
                            }))
                          }
                          className={cn(
                            "rounded-[22px] border px-4 py-3 text-left text-sm transition-colors",
                            formData.schoolId === school.id
                              ? "border-white/20 bg-white/[0.08] text-white"
                              : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.05]",
                          )}
                        >
                          {school.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                      <Globe2 className="h-3.5 w-3.5" />
                      Language
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">
                      Preferred explanation language
                    </h3>
                    <div className="mt-4 grid gap-2">
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
                              preferredLanguage: language.id as "en" | "ar",
                            }))
                          }
                          className={cn(
                            "rounded-[22px] border px-4 py-3 text-left text-sm transition-colors",
                            formData.preferredLanguage === language.id
                              ? "border-white/20 bg-white/[0.08] text-white"
                              : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.05]",
                          )}
                        >
                          {language.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Label>Starter-pack subjects</Label>
                        <p className="mt-2 text-sm leading-6 text-white/50">
                          Pick the subjects Cryonex should prioritize first.
                          Leave it empty and we’ll use the strongest defaults
                          for your stage.
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                        Optional
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {starterBlueprint.recommendedSubjects.map((subject) => {
                        const isActive =
                          formData.targetSubjects.includes(subject);
                        return (
                          <button
                            key={subject}
                            type="button"
                            onClick={() =>
                              toggleArrayValue("targetSubjects", subject)
                            }
                            className={cn(
                              "rounded-full border px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "border-white/20 bg-white/[0.09] text-white"
                                : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.05]",
                            )}
                          >
                            {subject}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <Label>Exam targets</Label>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                      This is what makes the starter pack feel local instead of
                      generic.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {starterBlueprint.recommendedExams.map((exam) => {
                        const isActive = formData.targetExams.includes(exam);
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
                                ? "border-white/20 bg-white/[0.09] text-white"
                                : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.05]",
                            )}
                          >
                            {exam}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5">
                      <Label>Study pace</Label>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {[
                          {
                            id: "light",
                            label: "Light",
                            description:
                              "Shorter sessions with more scaffolding.",
                          },
                          {
                            id: "balanced",
                            label: "Balanced",
                            description:
                              "Steady weekly progress without overload.",
                          },
                          {
                            id: "intensive",
                            label: "Intensive",
                            description:
                              "Higher pressure for exam-focused weeks.",
                          },
                        ].map((pace) => (
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
                              "rounded-[22px] border px-4 py-3 text-left transition-colors",
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

                <StarterStudyPack
                  country={formData.country}
                  region={formData.region}
                  curriculum={formData.curriculum}
                  curriculumTrack={formData.curriculumTrack}
                  gradeLevel={formData.gradeLevel}
                  targetSubjects={formData.targetSubjects}
                  targetExams={formData.targetExams}
                  studyPace={formData.studyPace}
                  preferredLanguage={formData.preferredLanguage}
                  title="Preview your starter study pack"
                  description="This updates live as you choose your country, curriculum, grade, subjects, exams, and study pace."
                />
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
                  className="rounded-full bg-white text-black hover:bg-white/92"
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
              className="deepshi-panel rounded-[36px] border border-white/10 p-8"
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
                      "w-full rounded-[26px] border p-5 text-left transition-colors",
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
                      "w-full rounded-[26px] border p-5 text-left transition-colors",
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

                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
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
                  className="rounded-full bg-white text-black hover:bg-white/92"
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
              className="deepshi-panel rounded-[36px] border border-white/10 p-8"
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
                      "rounded-[26px] border p-5 text-left transition-colors",
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
                  className="rounded-full bg-white text-black hover:bg-white/92"
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
              className="deepshi-panel rounded-[36px] border border-white/10 p-8"
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
                        "rounded-[22px] border px-4 py-4 text-left text-sm transition-colors",
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
                  className="rounded-full bg-white text-black hover:bg-white/92"
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
              className="deepshi-panel rounded-[36px] border border-white/10 p-10 text-center"
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
