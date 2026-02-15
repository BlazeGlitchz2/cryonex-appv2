import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { COUNTRIES, GRADE_LEVELS, CountryConfig } from "@/lib/countryConfig";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Globe, School, GraduationCap, BookOpen, Search } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { isIOS } from "@/lib/mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PersonalizationWizard() {
    const { user } = useAuth();
    const updateProfile = useMutation(api.users.updateProfile);

    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"country" | "school" | "grade" | "curriculum">("country");

    // Form State
    const [country, setCountry] = useState<CountryConfig | null>(null);
    const [schoolId, setSchoolId] = useState<string>("");
    const [gradeLevel, setGradeLevel] = useState<string>("");
    const [curriculum, setCurriculum] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");

    // Check if we need to show the wizard
    useEffect(() => {
        if (user && !user.country && !user.schoolId && !sessionStorage.getItem("skipped_personalization")) {
            // Small delay for smooth entrance
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleNext = () => {
        if (isIOS()) Haptics.impact({ style: ImpactStyle.Light });

        if (step === "country") {
            setStep("school");
        } else if (step === "school") {
            setStep("grade");
        } else if (step === "grade") {
            setStep("curriculum");
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!user) return;

        try {
            await updateProfile({
                country: country?.id,
                schoolId: schoolId,
                gradeLevel: gradeLevel,
                curriculumTrack: curriculum,
                // Auto-set RTL if country is generic Arabic region and not overridden
                isRTL: country?.direction === "rtl"
            });
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
            // Fallback to closing the wizard so the user isn't stuck
            setIsOpen(false);
            // Optionally show a toast if you want, but silent fail + close is better than crash
            // toast.error("Failed to save preferences");
        }
    };

    const handleSkip = () => {
        sessionStorage.setItem("skipped_personalization", "true");
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#0A0A0B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Progress Bar */}
                <div className="h-1 bg-white/5 w-full">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                        style={{
                            width: step === "country" ? "25%" :
                                step === "school" ? "50%" :
                                    step === "grade" ? "75%" : "100%"
                        }}
                    />
                </div>

                <div className="p-6 h-[500px] flex flex-col">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {step === "country" && (
                                <motion.div
                                    key="country"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center mb-6">
                                        <div className="h-12 w-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-purple-400">
                                            <Globe className="h-6 w-6" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white">Where are you learning from?</h2>
                                        <p className="text-sm text-white/50">We'll customize your experience based on your region.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.values(COUNTRIES).map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => setCountry(c)}
                                                className={cn(
                                                    "p-4 rounded-xl border transition-all text-left group relative overflow-hidden",
                                                    "hover:scale-[1.02] active:scale-[0.98]", // Added interaction scaling
                                                    country?.id === c.id
                                                        ? "bg-white/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]" // Added shadow
                                                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20" // Added border hover
                                                )}
                                            >
                                                <span className="text-3xl mb-2 block">{c.flag}</span>
                                                <span className="font-medium text-white block">{c.name}</span>
                                                {country?.id === c.id && (
                                                    <div className="absolute top-3 right-3 text-purple-400">
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === "school" && (
                                <motion.div
                                    key="school"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center mb-6">
                                        <div className="h-12 w-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-cyan-400">
                                            <School className="h-6 w-6" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white">Do you attend a specific school?</h2>
                                        <p className="text-sm text-white/50">Select your school for tailored resources.</p>
                                    </div>

                                    <div className="relative mb-4">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                        <Input
                                            placeholder="Search schools..."
                                            className="pl-9 bg-white/5 border-white/10"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setSchoolId("")}
                                            className={cn(
                                                "w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all",
                                                schoolId === ""
                                                    ? "bg-white/10 border-cyan-500/50"
                                                    : "bg-white/5 border-white/5 hover:bg-white/10"
                                            )}
                                        >
                                            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                                <Globe className="h-5 w-5 text-white/60" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">Other / Independent</div>
                                                <div className="text-xs text-white/40">I don't see my school listed</div>
                                            </div>
                                            {schoolId === "" && <Check className="ml-auto h-4 w-4 text-cyan-400" />}
                                        </button>

                                        {country?.schools.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => setSchoolId(s.id)}
                                                className={cn(
                                                    "w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all",
                                                    schoolId === s.id
                                                        ? "bg-white/10 border-cyan-500/50"
                                                        : "bg-white/5 border-white/5 hover:bg-white/10"
                                                )}
                                            >
                                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                                    <School className="h-5 w-5 text-white/60" />
                                                </div>
                                                <div className="font-medium text-white">{s.name}</div>
                                                {schoolId === s.id && <Check className="ml-auto h-4 w-4 text-cyan-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === "grade" && (
                                <motion.div
                                    key="grade"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center mb-6">
                                        <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-400">
                                            <GraduationCap className="h-6 w-6" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white">What grade are you in?</h2>
                                        <p className="text-sm text-white/50">This helps us adjust the difficulty.</p>
                                    </div>

                                    <div className="space-y-2">
                                        {GRADE_LEVELS.map(g => (
                                            <button
                                                key={g}
                                                onClick={() => setGradeLevel(g)}
                                                className={cn(
                                                    "w-full p-3 rounded-xl border text-left flex items-center transition-all",
                                                    gradeLevel === g
                                                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-100"
                                                        : "bg-white/5 border-white/5 hover:bg-white/10 text-white/80"
                                                )}
                                            >
                                                {g}
                                                {gradeLevel === g && <Check className="ml-auto h-4 w-4 text-emerald-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === "curriculum" && (
                                <motion.div
                                    key="curriculum"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center mb-6">
                                        <div className="h-12 w-12 bg-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-pink-400">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white">Which curriculum do you follow?</h2>
                                        <p className="text-sm text-white/50">We'll prioritize relevant study materials.</p>
                                    </div>

                                    <div className="space-y-2">
                                        {country?.curriculums.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setCurriculum(c)}
                                                className={cn(
                                                    "w-full p-4 rounded-xl border text-left flex items-center transition-all",
                                                    curriculum === c
                                                        ? "bg-pink-500/20 border-pink-500/50 text-pink-100"
                                                        : "bg-white/5 border-white/5 hover:bg-white/10 text-white/80"
                                                )}
                                            >
                                                {c}
                                                {curriculum === c && <Check className="ml-auto h-4 w-4 text-pink-400" />}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurriculum("Other")}
                                            className={cn(
                                                "w-full p-4 rounded-xl border text-left flex items-center transition-all",
                                                curriculum === "Other"
                                                    ? "bg-pink-500/20 border-pink-500/50 text-pink-100"
                                                    : "bg-white/5 border-white/5 hover:bg-white/10 text-white/80"
                                            )}
                                        >
                                            Other
                                            {curriculum === "Other" && <Check className="ml-auto h-4 w-4 text-pink-400" />}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <Button
                            variant="ghost"
                            className="flex-1 text-white/40 hover:text-white"
                            onClick={handleSkip}
                        >
                            Skip
                        </Button>
                        <Button
                            className="flex-[2] bg-white text-black hover:bg-white/90 font-bold"
                            onClick={handleNext}
                            disabled={
                                (step === "country" && !country) ||
                                (step === "grade" && !gradeLevel) ||
                                (step === "curriculum" && !curriculum)
                            }
                        >
                            {step === "curriculum" ? "Finish" : "Next"}
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
