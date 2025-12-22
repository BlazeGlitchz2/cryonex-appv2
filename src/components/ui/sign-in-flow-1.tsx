"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";
import { ArrowRight, Mail, Lock, Github, Smartphone, Sparkles, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import NeoCosmicShader from "@/components/shaders/NeoCosmicShader";
import Neo3DShader from "@/components/shaders/Neo3DShader";

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base Layer: Cosmic Nebula */}
      <div className="absolute inset-0 z-0">
        <NeoCosmicShader />
      </div>
      {/* Top Layer: 3D Elements (Transparent) */}
      <div className="absolute inset-0 z-10">
        <Neo3DShader />
      </div>
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030005]/40 to-[#030005] z-20" />
    </div>
  );
}

export const SignInPage = () => {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { signIn: authSignIn } = useAuthActions();
  const navigate = useNavigate();
  const ensureUser = useMutation(api.users.ensureUser);

  const handleGuestAccess = () => {
    navigate("/app");
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authSignIn("google");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    try {
      await authSignIn("github");
    } catch (error) {
      console.error("Github sign-in error:", error);
      toast.error("Failed to sign in with Github");
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      await signIn("email-otp", formData);
      setStep("code");
      toast.success("Verification code sent!");
    } catch (error) {
      console.error("Email sign-in error:", error);
      toast.error("Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("code", code);
      await signIn("email-otp", formData);

      try {
        await ensureUser();
      } catch (err) {
        console.error("Failed to ensure user record:", err);
      }

      toast.success("Welcome to Cryonex!");
      navigate("/app");
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Invalid verification code");
      setCode("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030005] text-white relative overflow-hidden flex items-center justify-center p-4">
      <AnimatedBackground />

      <div className="relative z-30 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Vision & Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-10 p-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-purple-200">The AI Workspace for Creators</span>
            </div>

            <h1 className="text-6xl font-bold mb-6 leading-tight tracking-tight">
              Build the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient-x">
                Impossible.
              </span>
            </h1>

            <p className="text-xl text-slate-300 max-w-lg leading-relaxed font-light">
              Cryonex brings together the world's best AI models, creative tools, and study resources into one unified, beautiful interface.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "Universal Chat", desc: "GPT-4, Claude, Llama & more", icon: Globe },
              { title: "Creative Studio", desc: "Generate images, code & text", icon: Sparkles },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                className="p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-all hover:scale-[1.02] group"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-3 group-hover:from-purple-500/20 group-hover:to-blue-500/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-white/80 group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-white/50">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side - Glassmorphism Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

            <div className="relative bg-[#0A0A0B]/60 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-2xl">
              <div className="text-center mb-8">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center mb-5 shadow-lg shadow-purple-500/10">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
                <p className="text-sm text-slate-400 mt-2">Enter your email to access your workspace</p>
              </div>

              <AnimatePresence mode="wait">
                {step === "email" ? (
                  <motion.form
                    key="email-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleEmailSubmit}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">Email</label>
                      <div className="relative group/input">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-white text-black hover:bg-slate-200 rounded-xl h-12 font-bold text-sm shadow-lg shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isLoading ? "Sending Code..." : "Continue with Email"}
                    </Button>

                    <div className="relative flex items-center gap-4 py-2">
                      <div className="h-px bg-white/10 flex-1" />
                      <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">Or</span>
                      <div className="h-px bg-white/10 flex-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        onClick={handleGoogleSignIn}
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-12 rounded-xl transition-all hover:scale-[1.02]"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                      </Button>
                      <Button
                        type="button"
                        onClick={handleGithubSignIn}
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-12 rounded-xl transition-all hover:scale-[1.02]"
                      >
                        <Github className="w-5 h-5 mr-2" />
                        GitHub
                      </Button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="code-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleCodeSubmit}
                    className="space-y-5"
                  >
                    <div className="text-center mb-6">
                      <div className="inline-block bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2 text-sm text-purple-200 mb-3">
                        Code sent to <span className="font-semibold text-white">{email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep("email")}
                        className="block w-full text-xs text-slate-400 hover:text-white transition-colors underline decoration-slate-600 hover:decoration-white"
                      >
                        Use a different email
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">Verification Code</label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 text-center text-3xl tracking-[0.5em] text-white placeholder:text-white/5 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
                        autoFocus
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || code.length !== 6}
                      className="w-full bg-white text-black hover:bg-slate-200 rounded-xl h-12 font-bold text-sm shadow-lg shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isLoading ? "Verifying..." : "Verify & Enter"}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <button
                  onClick={handleGuestAccess}
                  className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto group py-2 px-4 rounded-lg hover:bg-white/5"
                >
                  Continue as Guest
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};