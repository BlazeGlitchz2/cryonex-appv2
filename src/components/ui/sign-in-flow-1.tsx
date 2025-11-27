"use client";
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";
import { ArrowRight, Mail, Lock, Github, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Sphere args={[1.2, 64, 64]} position={[2, 0, -2]}>
            <MeshDistortMaterial
              color="#4c1d95"
              distort={0.4}
              speed={2}
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>
        </Float>
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.4}>
           <Sphere args={[0.8, 64, 64]} position={[-2, 1, -3]}>
            <MeshDistortMaterial
              color="#3b82f6"
              distort={0.3}
              speed={3}
              roughness={0.1}
              metalness={0.9}
            />
          </Sphere>
        </Float>
      </Canvas>
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

  const handleGuestAccess = () => {
    navigate("/app");
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authSignIn("google", { redirectTo: "/app" });
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    try {
      await authSignIn("github", { redirectTo: "/app" });
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
    <div className="min-h-screen bg-[#050014] text-white relative overflow-hidden flex items-center justify-center p-4">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Showcase */}
        <div className="hidden md:flex flex-col justify-center space-y-8 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.95 1.477 2.95-1.477L12 14.09l-5.9-3.09L12 11zm0 3.82L2 10v7l10 5 10-5v-7l-10 4.82z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                The Future
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-md leading-relaxed">
              Experience the next generation of productivity tools designed to streamline your workflow and boost your team's performance.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              { title: "Advanced Analytics", desc: "Get detailed insights into your performance.", icon: "bar_chart" },
              { title: "AI Collaboration", desc: "Work seamlessly with your personal AI companion.", icon: "group" },
              { title: "Enterprise Security", desc: "Bank-level security to protect your sensitive data.", icon: "security" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-xs text-white/50">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" />
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="mx-auto h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
              <p className="text-sm text-white/50 mt-2">Sign in to continue to Cryonex</p>
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
                    <label className="text-xs font-medium uppercase tracking-wider text-white/70 pl-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-white text-black hover:bg-white/90 rounded-xl h-12 font-semibold text-sm shadow-lg shadow-white/5"
                  >
                    {isLoading ? "Sending..." : "Sign In with Email"}
                  </Button>

                  <div className="relative flex items-center gap-4 py-2">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-xs text-white/30 uppercase tracking-widest">Or continue with</span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      onClick={handleGoogleSignIn}
                      variant="outline"
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-12 rounded-xl"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>
                    <Button
                      type="button"
                      onClick={handleGithubSignIn}
                      variant="outline"
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-12 rounded-xl"
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
                  <div className="text-center mb-4">
                    <div className="inline-block bg-white/10 rounded-lg px-3 py-1 text-xs text-white/70 mb-2">
                      Sent to {email}
                    </div>
                    <button 
                      type="button"
                      onClick={() => setStep("email")}
                      className="block w-full text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Change email
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-white/70 pl-1">Verification Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 text-center text-2xl tracking-[0.5em] text-white placeholder:text-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
                      autoFocus
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading || code.length !== 6}
                    className="w-full bg-white text-black hover:bg-white/90 rounded-xl h-12 font-semibold text-sm shadow-lg shadow-white/5"
                  >
                    {isLoading ? "Verifying..." : "Verify & Enter"}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-white/40 mb-4">Don't have an account? It will be created automatically.</p>
              <button
                onClick={handleGuestAccess}
                className="text-sm text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto group"
              >
                Continue as Guest
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};