import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Github, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LoginNew() {
    const { signIn, isLoading } = useAuth();
    const [step, setStep] = useState<"intro" | "email" | "otp">("intro");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 3D Tilt Effect State
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX - innerWidth / 2) / 25;
            const y = (e.clientY - innerHeight / 2) / 25;
            setMousePosition({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsSubmitting(true);
        try {
            await signIn("resend", { email });
            setStep("otp");
            toast.success("Code sent to your email");
        } catch (error) {
            toast.error("Failed to send code");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;
        setIsSubmitting(true);
        try {
            await signIn("resend", { email, code });
        } catch (error) {
            toast.error("Invalid code");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialLogin = async (provider: "github" | "google") => {
        try {
            await signIn(provider);
        } catch (error) {
            toast.error(`Failed to sign in with ${provider}`);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#030010] flex items-center justify-center relative overflow-hidden selection:bg-purple-500/30">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
            </div>

            <AnimatePresence mode="wait">
                {step === "intro" && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        {/* 3D Logo Container */}
                        <motion.div
                            style={{
                                rotateX: -mousePosition.y,
                                rotateY: mousePosition.x,
                            }}
                            className="mb-12 relative group cursor-pointer perspective-1000"
                            onClick={() => setStep("email")}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                            <div className="relative w-40 h-40 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl shadow-purple-500/20 group-hover:scale-105 transition-transform duration-500">
                                <img src="/logo.png" alt="Cryonex" className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                            </div>

                            {/* Orbiting Elements */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-[-20px] rounded-full border border-purple-500/20 border-dashed"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-[-40px] rounded-full border border-blue-500/10 border-dashed"
                            />
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight text-center">
                            Enter the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                Nebula
                            </span>
                        </h1>

                        <Button
                            onClick={() => setStep("email")}
                            className="group relative px-8 py-6 bg-white text-black text-lg font-medium rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Initialize Session <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Button>
                    </motion.div>
                )}

                {(step === "email" || step === "otp") && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10 w-full max-w-md p-8"
                    >
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-2xl" />

                        <div className="relative z-10">
                            <button
                                onClick={() => setStep("intro")}
                                className="mb-8 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm"
                            >
                                ← Back
                            </button>

                            <h2 className="text-3xl font-bold text-white mb-2">
                                {step === "email" ? "Identity Verification" : "Security Check"}
                            </h2>
                            <p className="text-white/40 mb-8">
                                {step === "email" ? "Begin your journey into the digital void." : `Enter the code sent to ${email}`}
                            </p>

                            {step === "email" ? (
                                <form onSubmit={handleEmailSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                                            <Input
                                                type="email"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl text-white placeholder:text-white/20 focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-medium text-lg transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                                    </Button>

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-[#030010] px-2 text-white/30">Or connect with</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleSocialLogin("github")}
                                            className="h-12 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl"
                                        >
                                            <Github className="w-5 h-5 mr-2" /> GitHub
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleSocialLogin("google")}
                                            className="h-12 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl"
                                        >
                                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                                <path
                                                    fill="currentColor"
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                />
                                            </svg>
                                            Google
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleOtpSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Input
                                            type="text"
                                            placeholder="Enter 6-digit code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="bg-white/5 border-white/10 h-14 text-center text-2xl tracking-[0.5em] rounded-2xl text-white placeholder:text-white/10 focus:border-purple-500/50 focus:bg-white/10 transition-all font-mono"
                                            maxLength={6}
                                            autoFocus
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-medium text-lg transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Access"}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
