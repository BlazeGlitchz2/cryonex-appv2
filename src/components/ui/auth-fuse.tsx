"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Chrome,
  Compass,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
  enableGuestPreviewMode,
  buildBrowserAuthRedirect,
  buildNativeAuthRedirect,
  GUEST_PREVIEW_WORKSPACE_REDIRECT,
  shouldUseDirectGuestPreviewNavigation,
} from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";
import { isNativePlatform } from "@/lib/mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            window.setTimeout(() => setIsDeleting(true), delay);
          }
        } else if (displayText.length > 0) {
          setDisplayText((prev) => prev.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex(0);
          setTextArrayIndex((prev) => (prev + 1) % textArray.length);
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => window.clearTimeout(timeout);
  }, [
    currentIndex,
    currentText,
    delay,
    deleteSpeed,
    displayText,
    isDeleting,
    loop,
    speed,
    textArray.length,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse text-cyan-300">{cursor}</span>
    </span>
  );
}

interface AuthContentProps {
  image?: {
    src: string;
    alt: string;
  };
  quote?: {
    text: string | string[];
    author: string;
  };
  eyebrow?: string;
  title?: string;
  description?: string;
}

interface AuthUIProps {
  signInContent?: AuthContentProps;
  signUpContent?: AuthContentProps;
  initialEmail?: string;
  autoSendCode?: boolean;
  defaultMode?: "signin" | "signup";
  redirectTarget?: string | null;
  destinationLabel?: string;
  className?: string;
}

const defaultSignInContent: Required<AuthContentProps> = {
  image: {
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    alt: "Modern workspace with warm lighting",
  },
  quote: {
    text: [
      "Welcome back to your study command center.",
      "Your notes, copilots, and projects are ready when you are.",
    ],
    author: "Cryonex Workspace",
  },
  eyebrow: "Return To Flow",
  title: "Sign in and continue your next sprint.",
  description:
    "Use your email for a one-time verification code, or jump in with Google.",
};

const defaultSignUpContent: Required<AuthContentProps> = {
  image: {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    alt: "Focused student desk with laptop and notes",
  },
  quote: {
    text: [
      "Set up your account in under a minute.",
      "Start building your second brain with Cryonex today.",
    ],
    author: "Cryonex Onboarding",
  },
  eyebrow: "Start Fresh",
  title: "Create your account and unlock the workspace.",
  description:
    "We create your account automatically after email verification, so there is no password to remember.",
};

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function AuthUI({
  signInContent = {},
  signUpContent = {},
  initialEmail = "",
  autoSendCode = false,
  defaultMode = "signin",
  redirectTarget,
  destinationLabel = "workspace",
  className,
}: AuthUIProps) {
  const { signIn } = useAuth();
  const [isSignIn, setIsSignIn] = useState(defaultMode === "signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"details" | "verify">("details");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasAutoSentRef = useRef(false);

  const finalSignInContent = {
    ...defaultSignInContent,
    ...signInContent,
    image: { ...defaultSignInContent.image, ...signInContent.image },
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
    ...defaultSignUpContent,
    ...signUpContent,
    image: { ...defaultSignUpContent.image, ...signUpContent.image },
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    setIsSignIn(defaultMode === "signin");
  }, [defaultMode]);

  const sendEmailCode = async (value = email) => {
    const normalizedEmail = value.trim();

    if (!normalizedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!signIn) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await signIn("resend", { email: normalizedEmail });
      setEmail(normalizedEmail);
      setStep("verify");
      toast.success("Verification code sent to your email");
    } catch (sendError) {
      console.error("Failed to send email code", sendError);
      setError("We couldn't send the verification code. Please try again.");
      toast.error("Failed to send code");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!autoSendCode || !initialEmail || hasAutoSentRef.current) return;

    hasAutoSentRef.current = true;
    void sendEmailCode(initialEmail);
  }, [autoSendCode, initialEmail, signIn]);

  const handleVerify = async () => {
    if (!email.trim()) {
      setError("Please enter your email first.");
      setStep("details");
      return;
    }

    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    if (!signIn) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const redirectTo = isNativePlatform()
        ? buildNativeAuthRedirect(redirectTarget)
        : buildBrowserAuthRedirect(redirectTarget);
      await signIn("resend", {
        email: email.trim(),
        code: code.trim(),
        redirectTo,
      });
    } catch (verifyError) {
      console.error("Failed to verify email code", verifyError);
      setError("Invalid code. Please try again.");
      toast.error("Invalid verification code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!signIn) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    try {
      const redirectTo = isNativePlatform()
        ? buildNativeAuthRedirect(redirectTarget)
        : buildBrowserAuthRedirect(redirectTarget);
      await signIn("google", { redirectTo });
    } catch (googleError) {
      console.error("Failed to sign in with Google", googleError);
      toast.error("Failed to sign in with Google");
    }
  };

  const handleGuestSignIn = async () => {
    if (shouldUseDirectGuestPreviewNavigation()) {
      enableGuestPreviewMode();
      localStorage.removeItem("kimi_guest_pending");
      window.location.assign(GUEST_PREVIEW_WORKSPACE_REDIRECT);
      return;
    }

    if (!signIn) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    try {
      localStorage.setItem("kimi_guest_pending", "true");
      enableGuestPreviewMode();
      await signIn("anonymous");
    } catch (guestError) {
      console.error("Failed to enter guest mode", guestError);
      toast.error("Failed to enter guest mode");
      localStorage.removeItem("kimi_guest_pending");
    }
  };

  const handleModeToggle = (nextMode: "signin" | "signup") => {
    setIsSignIn(nextMode === "signin");
    setStep("details");
    setCode("");
    setError("");
  };

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-[#050218] text-white",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-15%] top-[-10%] h-72 w-72 rounded-full bg-cyan-500/18 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-10%] h-72 w-72 rounded-full bg-blue-500/18 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),linear-gradient(135deg,rgba(9,12,32,0.96),rgba(5,2,24,1))]" />
      </div>

      <div className="relative z-10 grid min-h-screen md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur">
                <img
                  src="/logo.png"
                  alt="Cryonex"
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/80">
                  Cryonex
                </p>
                <p className="text-sm text-white/50">
                  Continue to your {destinationLabel}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 flex w-full rounded-full border border-white/10 bg-black/20 p-1">
                <button
                  type="button"
                  onClick={() => handleModeToggle("signin")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition",
                    isSignIn
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-white/70 hover:text-white",
                  )}
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleModeToggle("signup")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition",
                    !isSignIn
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-white/70 hover:text-white",
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  Create Account
                </button>
              </div>

              <div className="mb-8 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                  {currentContent.eyebrow}
                </p>
                <h1 className="max-w-lg text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {step === "verify"
                    ? "Check your inbox for the six-digit code."
                    : currentContent.title}
                </h1>
                <p className="max-w-xl text-sm leading-6 text-white/60 sm:text-base">
                  {step === "verify"
                    ? `We sent a verification code to ${email || "your email address"}. Enter it below to continue.`
                    : `${currentContent.description} After sign-in, you'll return to your ${destinationLabel}.`}
                </p>
              </div>

              <div className="mb-6 flex flex-wrap gap-3">
                {[
                  `Redirects back to ${destinationLabel}`,
                  "Email code or Google",
                  "Guest preview supported",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (step === "verify") {
                    void handleVerify();
                    return;
                  }
                  void sendEmailCode();
                }}
              >
                {!isSignIn && step === "details" && (
                  <div className="space-y-2">
                    <Label htmlFor="auth-full-name">Name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <Input
                        id="auth-full-name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="What should we call you?"
                        className="h-12 rounded-2xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/35"
                      />
                    </div>
                    <p className="text-xs text-white/40">
                      Optional for now. We&apos;ll finish setup after you verify
                      your email.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="auth-email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <Input
                      id="auth-email"
                      type="email"
                      value={email}
                      autoComplete="email"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="h-12 rounded-2xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/35"
                    />
                  </div>
                </div>

                {step === "verify" && (
                  <div className="space-y-2">
                    <Label htmlFor="auth-code">Verification code</Label>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <Input
                        id="auth-code"
                        value={code}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        onChange={(event) => setCode(event.target.value)}
                        placeholder="Enter 6-digit code"
                        className="h-12 rounded-2xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/35"
                      />
                    </div>
                  </div>
                )}

                {error ? (
                  <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </p>
                ) : null}

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-2xl bg-white text-slate-950 hover:bg-white/90"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : step === "verify" ? (
                      "Verify and continue"
                    ) : isSignIn ? (
                      "Continue with email"
                    ) : (
                      "Create account with email"
                    )}
                  </Button>

                  {step === "verify" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setStep("details");
                        setCode("");
                        setError("");
                      }}
                      className="h-11 w-full rounded-2xl text-white/70 hover:bg-white/6 hover:text-white"
                    >
                      Change email
                    </Button>
                  ) : null}
                </div>
              </form>

              <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.24em] text-white/30">
                <div className="h-px flex-1 bg-white/10" />
                <span>Or continue with</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="h-12 w-full rounded-2xl border-white/12 bg-white/6 text-white hover:bg-white/10 hover:text-white"
                >
                  <Chrome className="h-4 w-4" />
                  Continue with Google
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleGuestSignIn}
                  className="h-11 w-full rounded-2xl text-white/55 hover:bg-white/6 hover:text-white"
                >
                  Preview workspace first
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                  <Compass className="mb-3 h-4 w-4 text-cyan-300" />
                  <p className="text-sm font-medium text-white">Fast entry</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Email code flow with no password reset loop.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                  <Bot className="mb-3 h-4 w-4 text-cyan-300" />
                  <p className="text-sm font-medium text-white">
                    Built for AI work
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Continue into notes, copilots, dashboards, and chat.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                  <ShieldCheck className="mb-3 h-4 w-4 text-cyan-300" />
                  <p className="text-sm font-medium text-white">
                    Safe by default
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Verification codes expire quickly and preserve the return
                    path to your {destinationLabel}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="relative hidden overflow-hidden md:block">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentContent.image.src})` }}
            aria-label={currentContent.image.alt}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,2,24,0.15),rgba(5,2,24,0.82)),radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_30%)]" />
          <div className="absolute right-8 top-8 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-white/80 backdrop-blur">
            {isSignIn ? "Live Workspace" : "Fresh Setup"}
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between p-10 lg:p-14">
            <div className="max-w-sm rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-[0_18px_80px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/85">
                Why teams pick Cryonex
              </p>
              <ul className="space-y-3 text-sm leading-6 text-white/80">
                <li className="flex items-start gap-3">
                  <Sparkles className="mt-1 h-4 w-4 text-cyan-300" />
                  One place for AI chat, materials, projects, and study tools.
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="mt-1 h-4 w-4 text-cyan-300" />
                  Low-friction sign-in that works on desktop and mobile.
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="mt-1 h-4 w-4 text-cyan-300" />A visual
                  workspace that feels closer to a product than a form.
                </li>
              </ul>
            </div>

            <div className="max-w-xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-100/80">
                {currentContent.eyebrow}
              </p>
              <blockquote className="space-y-4">
                <p className="text-3xl font-semibold leading-tight text-white lg:text-4xl">
                  <Typewriter
                    key={`${isSignIn}-${currentContent.quote.author}`}
                    text={currentContent.quote.text}
                    speed={42}
                    deleteSpeed={24}
                    delay={1800}
                    loop
                  />
                </p>
                <cite className="block text-sm not-italic text-white/60">
                  {currentContent.quote.author}
                </cite>
              </blockquote>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
