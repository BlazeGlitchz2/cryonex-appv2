"use client";

import * as React from "react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Hexagon } from "lucide-react";

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
);

interface ModernStunningSignInProps {
  className?: string;
}

const ModernStunningSignIn = ({ className }: ModernStunningSignInProps) => {
  const { signIn } = useAuth();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);
  const [code, setCode] = React.useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignIn = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      await signIn("resend", { email });
      setIsSent(true);
      toast.success("Code sent to your email");
    } catch (error) {
      setError("Failed to send code. Please try again.");
      toast.error("Failed to send code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!code) {
      setError("Please enter the code.");
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn("resend", { email, code });
    } catch (error) {
      setError("Invalid code");
      toast.error("Invalid code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google");
    } catch (error) {
      toast.error("Failed to sign in with Google");
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center relative overflow-hidden w-full rounded-xl ${className}`}
    >
      {/* Centered glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff05] to-[#121212] backdrop-blur-md border border-white/5 shadow-2xl p-8 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500/20 to-blue-500/20 mb-6 shadow-lg border border-white/10">
          {/* <img src="http://hextaui.com/logo.svg" /> */}
          <Hexagon className="w-6 h-6 text-white" />
        </div>
        {/* Title */}
        <h2 className="text-2xl font-semibold text-white mb-2 text-center">
          Hello Again!
        </h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          {isSent
            ? `Enter the code sent to ${email}`
            : "Welcome back to Cryonex"}
        </p>

        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            {!isSent ? (
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  placeholder="Email Address"
                  type="email"
                  value={email}
                  className="w-full pl-10 pr-5 py-3 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                />
              </div>
            ) : (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  placeholder="Enter Code"
                  type="text"
                  value={code}
                  className="w-full pl-10 pr-5 py-3 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                />
              </div>
            )}

            {error && (
              <div className="text-xs text-red-400 text-left pl-1">{error}</div>
            )}
          </div>

          <div>
            {!isSent ? (
              <button
                onClick={handleSignIn}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-500 text-white font-medium px-5 py-3 rounded-full shadow-lg shadow-blue-500/20 transition-all mb-3 text-sm flex items-center justify-center"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Sign in"
                )}
              </button>
            ) : (
              <button
                onClick={handleVerify}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-500 text-white font-medium px-5 py-3 rounded-full shadow-lg shadow-blue-500/20 transition-all mb-3 text-sm flex items-center justify-center"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify Code"
                )}
              </button>
            )}

            {isSent && (
              <button
                onClick={() => setIsSent(false)}
                className="w-full text-xs text-gray-500 hover:text-white mb-4 transition-colors"
              >
                Change email
              </button>
            )}

            <div className="flex items-center gap-2 mb-4">
              <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
              <span className="text-xs text-white/30 uppercase">
                Or continue with
              </span>
              <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] border border-white/5 hover:bg-[#252525] hover:border-white/10 rounded-full px-5 py-3 font-medium text-white transition-all mb-2 text-sm group"
            >
              <GoogleIcon />
              <span className="text-gray-300 group-hover:text-white transition-colors">
                Google
              </span>
            </button>

            <div className="w-full text-center mt-4">
              <span className="text-xs text-gray-400">
                Don&apos;t have an account?{" "}
                <a
                  href="#"
                  className="underline text-white/80 hover:text-white transition-colors"
                >
                  It will be created automatically!
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* User count and avatars */}
      <div className="relative z-10 mt-8 flex flex-col items-center text-center">
        <p className="text-gray-400 text-xs mb-3">
          Join <span className="font-medium text-white">thousands</span> of
          active learners on Cryonex.
        </p>
        <div className="flex -space-x-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#121212] object-cover ring-2 ring-blue-500/20"
          />
          <img
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#121212] object-cover ring-2 ring-blue-500/20"
          />
          <img
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=faces"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#121212] object-cover ring-2 ring-blue-500/20"
          />
          <img
            src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64&h=64&fit=crop&crop=faces"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#121212] object-cover ring-2 ring-blue-500/20"
          />
          <div className="w-8 h-8 rounded-full border-2 border-[#121212] bg-gradient-to-tr from-blue-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white/10">
            +2k
          </div>
        </div>
      </div>
    </div>
  );
};

export { ModernStunningSignIn };
