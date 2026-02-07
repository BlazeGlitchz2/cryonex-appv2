import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  GraduationCap,
  Briefcase,
  Palette,
  Code,
  Rocket,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Sparkles,
  Brain,
  Zap,
  Globe,
  Music,
  Video,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Id } from "@/convex/_generated/dataModel";

// Steps
const STEPS = {
  WELCOME: 0,
  IDENTITY: 1,
  ROLE: 2,
  EXPERIENCE: 3,
  INTERESTS: 4,
  GOALS: 5,
  COMPLETION: 6,
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [step, setStep] = useState(STEPS.WELCOME);
  const [searchParams] = useSearchParams();

  // Redirect unauthenticated users to Auth
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const ref = searchParams.get("ref");
      const redirectUrl = `/login?redirect=/onboarding${ref ? `&ref=${ref}` : ""}`;
      navigate(redirectUrl);
    }
  }, [isLoading, isAuthenticated, navigate, searchParams]);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    image: user?.image || "",
    imageStorageId: undefined as Id<"_storage"> | undefined,
    role: "",
    experienceLevel: "",
    interests: [] as string[],
    goals: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    if (step === STEPS.IDENTITY && !formData.name) {
      toast.error("Please enter your name");
      return;
    }
    if (step === STEPS.ROLE && !formData.role) {
      toast.error("Please select a role");
      return;
    }
    // Experience and Interests are optional, so no validation needed for them if user wants to skip
    // But if we want to enforce, we can. The user asked for "optional" questions.

    if (step === STEPS.GOALS && formData.goals.length === 0) {
      toast.error("Please select at least one goal");
      return;
    }

    if (step === STEPS.GOALS) {
      handleSubmit();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    setStep((prev) => prev + 1);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get upload URL
      const postUrl = await generateUploadUrl();

      // 2. Upload file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");

      const { storageId } = await result.json();

      // 3. Update state
      setFormData((prev) => ({
        ...prev,
        imageStorageId: storageId,
        image: URL.createObjectURL(file), // Preview
      }));
      toast.success("Photo uploaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Get affiliate code from session storage (set by Auth page) or URL
      const affiliateCode =
        sessionStorage.getItem("affiliateRef") ||
        searchParams.get("ref") ||
        undefined;

      // Construct payload with explicit undefined checks
      const payload = {
        name: formData.name,
        userRole: formData.role,
        goals: formData.goals,
        // Only send image if it's not empty AND not a blob URL (local preview)
        image:
          formData.image && !formData.image.startsWith("blob:")
            ? formData.image
            : undefined,
        // Only send storage ID if it exists
        imageStorageId: formData.imageStorageId || undefined,
        // Only send experience level if selected
        experienceLevel: formData.experienceLevel || undefined,
        // Always send interests (can be empty array)
        interests: formData.interests,
        affiliateCode: affiliateCode,
        tosAccepted: true,
        privacyPolicyAccepted: true,
      };

      await completeOnboarding(payload);

      // Show completion step briefly then navigate
      setStep(STEPS.COMPLETION);

      // Navigate immediately after a short delay to show completion animation
      // The user.onboardingCompleted will be updated by Convex, preventing redirect back
      setTimeout(() => {
        navigate("/app", { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error("Onboarding error:", error);
      // Show the actual error message from Convex
      const errorMessage = error.message || "Failed to complete onboarding";
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const roles = [
    {
      id: "student",
      label: "Student",
      icon: GraduationCap,
      desc: "Learning & Researching",
    },
    {
      id: "professional",
      label: "Professional",
      icon: Briefcase,
      desc: "Work & Productivity",
    },
    { id: "creative", label: "Creative", icon: Palette, desc: "Design & Art" },
    {
      id: "developer",
      label: "Developer",
      icon: Code,
      desc: "Coding & Building",
    },
    { id: "other", label: "Explorer", icon: Rocket, desc: "Just browsing" },
  ];

  const experienceLevels = [
    { id: "beginner", label: "Beginner", desc: "Just starting out" },
    { id: "intermediate", label: "Intermediate", desc: "I know my way around" },
    { id: "expert", label: "Expert", desc: "Power user" },
  ];

  const interests = [
    { id: "ai", label: "Artificial Intelligence", icon: Brain },
    { id: "coding", label: "Coding", icon: Code },
    { id: "design", label: "Design", icon: Palette },
    { id: "productivity", label: "Productivity", icon: Zap },
    { id: "research", label: "Research", icon: Globe },
    { id: "content", label: "Content Creation", icon: Video },
    { id: "learning", label: "Learning", icon: BookOpen },
    { id: "music", label: "Music", icon: Music },
  ];

  const goals = [
    "Ace my exams",
    "Build a project",
    "Learn a new skill",
    "Organize my life",
    "Create content",
    "Research faster",
  ];

  return (
    <div className="min-h-screen bg-[#030304] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] animate-float" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          {step === STEPS.WELCOME && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-primary/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold tracking-tight">
                Welcome to <span className="text-purple-400">Cryonex</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-md mx-auto">
                Your new intelligent workspace. Let's set up your profile to
                personalize your experience.
              </p>
              <Button
                onClick={handleNext}
                size="lg"
                className="rounded-full px-8 py-6 text-lg bg-white text-black hover:bg-slate-200 transition-transform hover:scale-105"
              >
                Get Started <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {step === STEPS.IDENTITY && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0A0A0B]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
            >
              <h2 className="text-2xl font-semibold mb-2">
                First things first
              </h2>
              <p className="text-slate-400 mb-8">How should we call you?</p>

              <div className="space-y-6">
                <div className="flex justify-center mb-8">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden hover:border-primary transition-colors">
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-slate-500" />
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-primary p-2 rounded-full shadow-lg">
                      <Upload className="w-3 h-3 text-white" />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
                {isUploading && (
                  <p className="text-center text-sm text-primary animate-pulse">
                    Uploading...
                  </p>
                )}

                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-white/5 border-white/10 h-12 text-lg focus:border-primary/50"
                    placeholder="e.g. Alex Chen"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8 pt-8 border-t border-white/5">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-slate-400 hover:text-white"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90"
                >
                  Next Step
                </Button>
              </div>
            </motion.div>
          )}

          {step === STEPS.ROLE && (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0A0A0B]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
            >
              <h2 className="text-2xl font-semibold mb-2">
                What describes you best?
              </h2>
              <p className="text-slate-400 mb-8">
                We'll customize your tools based on your role.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center gap-4 ${
                      formData.role === role.id
                        ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                        : "bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg ${formData.role === role.id ? "bg-primary text-white" : "bg-white/5 text-slate-400"}`}
                    >
                      <role.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{role.label}</div>
                      <div className="text-xs text-slate-400">{role.desc}</div>
                    </div>
                    {formData.role === role.id && (
                      <Check className="w-5 h-5 text-primary ml-auto" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-8 pt-8 border-t border-white/5">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-slate-400 hover:text-white"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90"
                >
                  Next Step
                </Button>
              </div>
            </motion.div>
          )}

          {step === STEPS.EXPERIENCE && (
            <motion.div
              key="experience"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0A0A0B]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-semibold">Experience Level</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Skip
                </Button>
              </div>
              <p className="text-slate-400 mb-8">
                How familiar are you with AI tools?
              </p>

              <div className="space-y-4">
                {experienceLevels.map((level) => (
                  <div
                    key={level.id}
                    onClick={() =>
                      setFormData({ ...formData, experienceLevel: level.id })
                    }
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                      formData.experienceLevel === level.id
                        ? "bg-primary/20 border-primary"
                        : "bg-white/10 border-white/10 hover:bg-white/15"
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white">
                        {level.label}
                      </div>
                      <div className="text-sm text-slate-400">{level.desc}</div>
                    </div>
                    {formData.experienceLevel === level.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-8 pt-8 border-t border-white/5">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-slate-400 hover:text-white"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90"
                >
                  Next Step
                </Button>
              </div>
            </motion.div>
          )}

          {step === STEPS.INTERESTS && (
            <motion.div
              key="interests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0A0A0B]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-semibold">Your Interests</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Skip
                </Button>
              </div>
              <p className="text-slate-400 mb-8">
                Select topics you care about.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {interests.map((interest) => (
                  <div
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                      formData.interests.includes(interest.id)
                        ? "bg-primary/20 border-primary text-white"
                        : "bg-white/10 border-white/10 text-slate-300 hover:bg-white/15"
                    }`}
                  >
                    <interest.icon className="w-4 h-4" />
                    <span className="text-sm">{interest.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-8 pt-8 border-t border-white/5">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-slate-400 hover:text-white"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90"
                >
                  Next Step
                </Button>
              </div>
            </motion.div>
          )}

          {step === STEPS.GOALS && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0A0A0B]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
            >
              <h2 className="text-2xl font-semibold mb-2">
                What are your goals?
              </h2>
              <p className="text-slate-400 mb-8">Select all that apply.</p>

              <div className="grid grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <div
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 text-center ${
                      formData.goals.includes(goal)
                        ? "bg-secondary/20 border-secondary text-secondary shadow-[0_0_15px_rgba(20,241,149,0.2)]"
                        : "bg-white/10 border-white/10 text-slate-300 hover:bg-white/15"
                    }`}
                  >
                    {goal}
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-8 pt-8 border-t border-white/5">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-slate-400 hover:text-white"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:opacity-90"
                >
                  {isSubmitting ? "Setting up..." : "Complete Setup"}
                </Button>
              </div>
            </motion.div>
          )}

          {step === STEPS.COMPLETION && (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Check className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-white">All Set!</h2>
              <p className="text-slate-400">
                Preparing your personalized workspace...
              </p>
              <div className="w-64 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5 }}
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
