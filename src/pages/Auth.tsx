import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Mail, Loader2, Apple, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { useNavigate } from "react-router";

import { HlsVideo } from "@/components/ui/hls-video";
import { getBunnyStorageUrl } from "@/lib/utils/cdn-optimizer";

export default function Auth() {
    const { signIn, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<"intro" | "email" | "otp">("intro");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchParams] = useSearchParams();

    const submitEmail = async (emailValue: string) => {
        if (!emailValue) return;
        setIsSubmitting(true);
        try {
            await signIn("email-otp", { email: emailValue.trim() });
            setStep("otp");
            toast.success("Code sent to your email");
        } catch (error) {
            toast.error("Failed to send code");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/app");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const hint = searchParams.get("hint");
        const action = searchParams.get("action");
        const auto = searchParams.get("auto");

        if (hint) {
            setEmail(hint);
            if (auto === "true") {
                submitEmail(hint);
            } else {
                setStep("email");
            }
        } else if (action === "add_account") {
            setStep("intro");
        }
    }, [searchParams]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitEmail(email);
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;
        setIsSubmitting(true);
        try {
            await signIn("email-otp", { email: email.trim(), code: code.trim() });
        } catch (error: any) {
            console.error("OTP Error:", error);
            toast.error(error.message || "Invalid code");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialLogin = async (provider: "github" | "google" | "apple") => {
        try {
            // Note: "apple" provider might need specific configuration in Convex/Auth
            await signIn(provider as any);
        } catch (error) {
            toast.error(`Failed to sign in with ${provider}`);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] text-white flex overflow-hidden font-sans selection:bg-green-500/30">
            {/* Left Side - Auth Form */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 relative z-10">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
                </div>

                <div className="w-full max-w-md space-y-8 relative">
                    {/* Logo Area */}
                    <div className="text-center space-y-6 mb-12">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] backdrop-blur-xl">
                                <img src="/logo.png" alt="Cryonex" className="w-10 h-10 object-contain opacity-90" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                            Experience the Future <br />
                            <span className="text-green-400">
                                of Artificial Intelligence
                            </span>
                        </h1>
                        <p className="text-lg text-white/40 font-medium">
                            in minutes
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === "intro" ? (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <Button
                                    onClick={() => handleSocialLogin("google")}
                                    className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-full font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
                                    Continue with Google
                                </Button>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        onClick={() => handleSocialLogin("github")}
                                        className="h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Github className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        onClick={() => handleSocialLogin("apple")}
                                        className="h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Apple className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                        <span className="bg-[#050505] px-4 text-white/20">OR</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setStep("email")}
                                    className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-medium text-lg transition-all hover:scale-[1.02] active:scale-[0.98] group"
                                >
                                    <Mail className="w-5 h-5 mr-3 text-white/50 group-hover:text-white transition-colors" />
                                    Continue with Email
                                </Button>

                                <Button
                                    onClick={async () => {
                                        try {
                                            localStorage.setItem("kimi_guest_pending", "true");
                                            await signIn("anonymous");
                                        } catch (error) {
                                            toast.error("Failed to enter guest mode");
                                            localStorage.removeItem("kimi_guest_pending");
                                        }
                                    }}
                                    variant="ghost"
                                    className="w-full text-white/20 hover:text-white hover:bg-white/5 rounded-full px-6 py-2 text-sm font-medium transition-all"
                                >
                                    KIMI OK COMPUTER Guest Mode
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="email-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <button
                                    onClick={() => setStep("intro")}
                                    className="text-sm text-white/40 hover:text-white flex items-center gap-2 transition-colors mb-4"
                                >
                                    <ArrowRight className="w-4 h-4 rotate-180" /> Back to options
                                </button>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold">{step === "email" ? "Sign in with Email" : "Check your inbox"}</h2>
                                    <p className="text-white/40">{step === "email" ? "Enter your email to continue" : `We sent a code to ${email}`}</p>
                                </div>

                                {step === "email" ? (
                                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg px-6 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                                            autoFocus
                                        />
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-green-500/20"
                                        >
                                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                                        </Button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                                        <Input
                                            type="text"
                                            placeholder="123456"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="h-14 bg-white/5 border-white/10 rounded-2xl text-center text-2xl tracking-[0.5em] font-mono focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                                            maxLength={6}
                                            autoFocus
                                        />
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-green-500/20"
                                        >
                                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
                                        </Button>
                                    </form>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="pt-12 text-center">
                        <p className="text-xs text-white/20">
                            By continuing, you agree to our <a href="/terms" className="hover:text-white transition-colors underline">Terms of Service</a> and <a href="/privacy" className="hover:text-white transition-colors underline">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Video Showcase */}
            <div className="hidden lg:flex flex-1 relative p-4 pl-0">
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative border border-white/10 shadow-2xl">
                    <HlsVideo
                        autoPlay
                        loop
                        muted
                        playsInline
                        isHls={false}
                        src="https://cryonex-cdn.b-cdn.net/Cinematic_premium_sky_1080p_202601102101.mp4"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Floating Elements */}
                    <div className="absolute inset-0 p-12 flex flex-col justify-between">
                        <div className="flex justify-center">
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-500 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-white">Grand Launch Jan 25</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md text-center relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10">
                                    <div className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                                        Premier AI Solutions
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">
                                        Proudly Made in <br />
                                        <span className="text-green-400">Egypt & KSA</span>
                                    </h3>
                                    <p className="text-white/70 text-sm mt-4 leading-relaxed">
                                        Experience the future of AI development. Join us for our grand launch on January 25th.
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-4 gap-8 border-t border-white/10 pt-8">
                            {[
                                { label: "Status", value: "Pre-Launch" },
                                { label: "Region", value: "MENA" },
                                { label: "HQ", value: "Egypt" },
                                { label: "Launch", value: "Jan 25" },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-xs text-white/40 uppercase tracking-wider mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
