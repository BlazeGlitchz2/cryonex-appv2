import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Check, ChevronRight, User, Briefcase, GraduationCap, Palette, Target, Share2, Link } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const updateProfile = useMutation(api.users.updateProfile);
    const createAffiliate = useMutation(api.affiliates.create);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        role: "",
        goals: [] as string[],
        source: "",
        affiliateCode: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user?.name) {
            setFormData(prev => ({ ...prev, name: user.name! }));
        }
    }, [user]);

    const handleNext = () => {
        if (step === 1 && !formData.role) return toast.error("Please select a role");
        if (step === 2 && !formData.name) return toast.error("Please enter your name");
        if (step === 3 && formData.goals.length === 0) return toast.error("Please select at least one goal");

        setStep(prev => prev + 1);
    };

    const handleFinish = async () => {
        setIsSubmitting(true);
        try {
            await updateProfile({
                name: formData.name,
                userRole: formData.role,
                goals: formData.goals,
                source: formData.source,
                affiliateCode: formData.affiliateCode,
                onboardingCompleted: true,
            });

            // Auto-generate affiliate code for them
            try {
                await createAffiliate({});
            } catch (e) {
                console.error("Failed to create affiliate profile", e);
            }

            toast.success("Welcome to Cryonex!");
            navigate("/app");
        } catch (error) {
            console.error(error);
            toast.error("Failed to complete onboarding");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleGoal = (goal: string) => {
        setFormData(prev => ({
            ...prev,
            goals: prev.goals.includes(goal)
                ? prev.goals.filter(g => g !== goal)
                : [...prev.goals, goal]
        }));
    };

    const roles = [
        { id: "student", label: "Student", icon: GraduationCap, desc: "I want to study smarter" },
        { id: "professional", label: "Professional", icon: Briefcase, desc: "I want to optimize workflow" },
        { id: "creative", label: "Creative", icon: Palette, desc: "I want to generate ideas" },
    ];

    const goals = [
        { id: "study", label: "Ace Exams", icon: GraduationCap },
        { id: "create", label: "Create Content", icon: Palette },
        { id: "organize", label: "Get Organized", icon: Target },
        { id: "research", label: "Deep Research", icon: User },
    ];

    const sources = [
        "TikTok", "Twitter / X", "Instagram", "YouTube", "Friend", "Other"
    ];

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(120,50,255,0.1),_transparent_70%)]" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

            <div className="max-w-md w-full relative z-10">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Setup Profile
                    </h1>
                    <div className="flex justify-center gap-2 mt-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-300 ${i <= step ? "w-8 bg-purple-500" : "w-2 bg-white/10"}`}
                            />
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-semibold text-center mb-6">Which describes you best?</h2>
                            <div className="grid gap-3">
                                {roles.map(role => (
                                    <button
                                        key={role.id}
                                        onClick={() => setFormData({ ...formData, role: role.id })}
                                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-4 group ${formData.role === role.id
                                                ? "bg-purple-500/20 border-purple-500"
                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${formData.role === role.id ? "bg-purple-500 text-white" : "bg-white/10 text-white/60"}`}>
                                            <role.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{role.label}</div>
                                            <div className="text-xs text-white/50">{role.desc}</div>
                                        </div>
                                        {formData.role === role.id && <Check className="w-4 h-4 ml-auto text-purple-400" />}
                                    </button>
                                ))}
                            </div>
                            <Button onClick={handleNext} className="w-full mt-6 bg-white text-black hover:bg-white/90" disabled={!formData.role}>
                                Continue <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-semibold text-center">What should we call you?</h2>
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-bold">
                                    {formData.name ? formData.name[0].toUpperCase() : <User className="w-8 h-8 opacity-50" />}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-white/60 ml-1">Display Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-white/5 border-white/10 h-12 text-lg"
                                    placeholder="Your Name"
                                    autoFocus
                                />
                            </div>
                            <Button onClick={handleNext} className="w-full bg-white text-black hover:bg-white/90" disabled={!formData.name}>
                                Continue <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-semibold text-center mb-6">What are your goals?</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {goals.map(goal => (
                                    <button
                                        key={goal.id}
                                        onClick={() => toggleGoal(goal.id)}
                                        className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-3 ${formData.goals.includes(goal.id)
                                                ? "bg-purple-500/20 border-purple-500"
                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                            }`}
                                    >
                                        <goal.icon className={`w-6 h-6 ${formData.goals.includes(goal.id) ? "text-purple-400" : "text-white/40"}`} />
                                        <span className="text-sm font-medium">{goal.label}</span>
                                    </button>
                                ))}
                            </div>
                            <Button onClick={handleNext} className="w-full mt-6 bg-white text-black hover:bg-white/90" disabled={formData.goals.length === 0}>
                                Continue <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-semibold text-center mb-6">How did you find us?</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {sources.map(source => (
                                    <button
                                        key={source}
                                        onClick={() => {
                                            setFormData({ ...formData, source });
                                            setTimeout(handleNext, 200);
                                        }}
                                        className={`p-3 rounded-xl border text-center transition-all ${formData.source === source
                                                ? "bg-purple-500/20 border-purple-500 text-white"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
                                            }`}
                                    >
                                        {source}
                                    </button>
                                ))}
                            </div>
                            <Button onClick={handleNext} className="w-full mt-6 bg-white text-black hover:bg-white/90" disabled={!formData.source}>
                                Continue <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-semibold text-center">Have an invite code?</h2>
                            <div className="text-center text-white/50 text-sm mb-4">
                                Enter an affiliate code if you were referred by someone.
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <Input
                                        value={formData.affiliateCode}
                                        onChange={(e) => setFormData({ ...formData, affiliateCode: e.target.value.toUpperCase() })}
                                        className="bg-white/5 border-white/10 h-12 pl-10 text-lg uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
                                        placeholder="CODE (Optional)"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button
                                    onClick={handleFinish}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 h-12 text-lg shadow-lg shadow-purple-900/20"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Setting up..." : "Get Started"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={handleFinish}
                                    className="w-full text-white/40 hover:text-white"
                                >
                                    Skip this step
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
