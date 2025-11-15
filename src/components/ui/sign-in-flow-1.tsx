"use client";
import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";

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
      await authSignIn("google");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google");
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
      toast.success("Verification code sent to your email");
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
      toast.success("Successfully signed in!");
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
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Sphere args={[1, 32, 32]} position={[-2, 0, 0]}>
            <meshStandardMaterial color="#6366f1" wireframe />
          </Sphere>
          <Sphere args={[0.8, 32, 32]} position={[2, 1, 0]}>
            <meshStandardMaterial color="#8b5cf6" wireframe />
          </Sphere>
          <Sphere args={[0.6, 32, 32]} position={[0, -1.5, 0]}>
            <meshStandardMaterial color="#ec4899" wireframe />
          </Sphere>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Mini Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 8L48 24L32 40L16 24L32 8Z" fill="black" />
              <path d="M32 24L48 40L32 56L16 40L32 24Z" fill="black" opacity="0.6" />
            </svg>
          </div>
          <span className="text-lg font-semibold">Cryonex</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-[#aaaaaa] hover:text-white transition-colors">
            Home
          </a>
          <a href="/app" className="text-sm text-[#aaaaaa] hover:text-white transition-colors">
            App
          </a>
        </div>
      </nav>

      {/* Sign In Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-73px)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 backdrop-blur-sm bg-opacity-80">
            {step === "email" ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
                <p className="text-[#aaaaaa] mb-6">Enter your email to sign in</p>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-[#6b6b6b]"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Sending..." : "Continue"}
                  </motion.button>
                </form>
                <div className="mt-6 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {isLoading ? "Signing in..." : "Sign in with Google"}
                  </motion.button>
                </div>

                <p className="text-xs text-[#6b6b6b] mt-4 text-center">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
                <div className="mt-4 text-center">
                  <button
                    onClick={handleGuestAccess}
                    className="text-sm text-[#aaaaaa] hover:text-white transition-colors"
                  >
                    Continue as Guest
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="code"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setStep("email")}
                  className="text-sm text-[#aaaaaa] hover:text-white mb-4 flex items-center gap-1"
                  disabled={isLoading}
                >
                  ← Back
                </button>
                <h2 className="text-2xl font-bold mb-2">Check your email</h2>
                <p className="text-[#aaaaaa] mb-6">
                  We sent a code to <span className="text-white">{email}</span>
                </p>
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium mb-2">
                      Verification Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-[#6b6b6b] text-center text-2xl tracking-widest"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Verifying..." : "Verify"}
                  </motion.button>
                </form>
                <div className="space-y-2 mt-4">
                  <button 
                    className="text-sm text-[#aaaaaa] hover:text-white w-full text-center"
                    onClick={() => setStep("email")}
                    disabled={isLoading}
                  >
                    Didn't receive a code? Resend
                  </button>
                  <button
                    onClick={handleGuestAccess}
                    className="text-sm text-[#aaaaaa] hover:text-white w-full text-center"
                    disabled={isLoading}
                  >
                    Continue as Guest
                  </button>
                  <button
                    onClick={handleGoogleSignIn}
                    className="text-sm text-[#aaaaaa] hover:text-white w-full text-center"
                    disabled={isLoading}
                  >
                    Sign in with Google instead
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};