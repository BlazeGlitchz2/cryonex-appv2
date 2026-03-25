"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  Chrome,
  CircleCheckBig,
  KeyRound,
  Loader2,
  Mail,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Timer,
  UploadCloud,
  Users,
} from "lucide-react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isNativePlatform } from "@/lib/mobile";

type Mode = "signin" | "signup";
type Step = "details" | "otp";

const studySignals = {
  signin: [
    {
      label: "Resume lane",
      value: "last study pack",
      detail: "Get back to the exact material you were already working through.",
    },
    {
      label: "Review lane",
      value: "due flashcards",
      detail: "Jump straight into active recall instead of re-orienting first.",
    },
    {
      label: "Focus lane",
      value: "45 min session",
      detail: "Open a calmer workspace with a visible next step already in front of you.",
    },
  ],
  signup: [
    {
      label: "Setup speed",
      value: "under 1 minute",
      detail: "Email code first, then into the product without a password maze.",
    },
    {
      label: "First move",
      value: "upload one source",
      detail: "Turn your first lecture note or PDF into something testable right away.",
    },
    {
      label: "Study rhythm",
      value: "daily streak",
      detail: "Build consistency from the very first session, not after setup is over.",
    },
  ],
} as const;

const workflowCards = [
  {
    title: "Upload material",
    description: "Bring in PDFs, notes, screenshots, or pasted text.",
    icon: UploadCloud,
    accent: "text-cyan-300 border-cyan-400/20 bg-cyan-400/10",
  },
  {
    title: "Turn it into practice",
    description: "Generate summaries, flashcards, or a quiz from the same source.",
    icon: BookOpenCheck,
    accent: "text-violet-300 border-violet-400/20 bg-violet-400/10",
  },
  {
    title: "Keep the session moving",
    description: "Return to study with a timer, a task, and a visible next step.",
    icon: Timer,
    accent: "text-emerald-300 border-emerald-400/20 bg-emerald-400/10",
  },
] as const;

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function MetricStrip({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="dashboard-subtle-panel rounded-[22px] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
          {label}
        </span>
        <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
      </div>
      <p className="mt-3 text-lg font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-sm leading-6 text-white/50">{detail}</p>
    </div>
  );
}

export function LoginNew() {
  const { signIn } = useAuth();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoSentRef = useRef(false);

  useEffect(() => {
    const nextMode: Mode =
      searchParams.get("action") === "add_account" ? "signup" : "signin";
    setMode(nextMode);
    setStep("details");
  }, [searchParams]);

  useEffect(() => {
    const hint = searchParams.get("hint");
    const auto = searchParams.get("auto");

    if (hint) {
      setEmail(hint);
      setStep("details");
    }

    if (hint && auto === "true" && !autoSentRef.current) {
      autoSentRef.current = true;

      if (!signIn) return;

      const normalized = hint.trim();
      if (!validateEmail(normalized)) return;

      setIsSubmitting(true);
      setError("");

      void signIn("email-otp", { email: normalized })
        .then(() => {
          setEmail(normalized);
          setStep("otp");
          toast.success("Verification code sent to your email");
        })
        .catch((sendError: unknown) => {
          console.error("Failed to send verification code", sendError);
          setError("We couldn't send the verification code. Please try again.");
          toast.error("Failed to send code");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  }, [searchParams, signIn]);

  const redirectTo = isNativePlatform() ? "cryonex://mobile/login" : undefined;

  async function sendCode(emailValue = email) {
    if (!signIn) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    const normalized = emailValue.trim();
    if (!normalized) {
      setError("Please enter your email.");
      return;
    }

    if (!validateEmail(normalized)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await signIn("email-otp", { email: normalized });
      setEmail(normalized);
      setStep("otp");
      toast.success("Verification code sent to your email");
    } catch (sendError: unknown) {
      console.error("Failed to send verification code", sendError);
      setError("We couldn't send the verification code. Please try again.");
      toast.error("Failed to send code");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyCode() {
    if (!signIn) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email first.");
      setStep("details");
      return;
    }

    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await signIn("email-otp", {
        email: email.trim(),
        code: code.trim(),
        redirectTo,
      });
    } catch (verifyError) {
      console.error("Failed to verify email code", verifyError);
      setError("That code did not work. Please try again.");
      toast.error("Invalid verification code");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!signIn) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    try {
      await signIn("google", { redirectTo });
    } catch (googleError) {
      console.error("Failed to sign in with Google", googleError);
      toast.error("Failed to sign in with Google");
    }
  }

  async function handleGuestSignIn() {
    if (!signIn) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    try {
      localStorage.setItem("kimi_guest_pending", "true");
      await signIn("anonymous");
    } catch (guestError) {
      console.error("Failed to enter guest mode", guestError);
      toast.error("Failed to enter guest mode");
      localStorage.removeItem("kimi_guest_pending");
    }
  }

  const signals = studySignals[mode];
  const headline =
    mode === "signin"
      ? "Upload a source. Leave with a plan."
      : "Start your study system without the setup drama.";
  const subcopy =
    mode === "signin"
      ? "Good student apps make the next action obvious. Cryonex should open like your real study desk: recent pack, due review, and a focused session waiting."
      : "The fastest path wins. Verify your email, upload your first source, and move straight into summaries, flashcards, quizzes, and focus blocks.";

  return (
    <div className="study-dashboard-shell relative min-h-screen overflow-hidden bg-[#050218] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="dashboard-orb dashboard-orb-cyan" />
        <div className="dashboard-orb dashboard-orb-amber" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(73,212,198,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(242,166,90,0.1),transparent_22%),linear-gradient(180deg,#07031d_0%,#050218_48%,#040113_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <img src="/logo.svg" alt="Cryonex" className="h-6 w-6 object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/75">
                Cryonex study access
              </p>
              <p className="text-sm text-white/50">
                Student front door into notes, review, and focus
              </p>
            </div>
          </div>

          <div className="dashboard-subtle-panel hidden items-center gap-2 rounded-full px-3 py-2 md:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
              Passwordless access
            </span>
          </div>
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1.08fr)_420px]">
          <section className="order-2 dashboard-surface flex min-h-[640px] flex-col rounded-[32px] p-5 sm:p-6 lg:order-1 lg:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                {mode === "signin" ? "Back to your workflow" : "Fast student onboarding"}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                <Timer className="h-3.5 w-3.5" />
                {mode === "signin" ? "Resume in seconds" : "Setup in under a minute"}
              </div>
            </div>

            <div className="mt-5 max-w-2xl space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
                {headline}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                {subcopy}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {signals.map((signal) => (
                <MetricStrip
                  key={signal.label}
                  label={signal.label}
                  value={signal.value}
                  detail={signal.detail}
                />
              ))}
            </div>

            <div className="mt-4 grid flex-1 gap-3 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="dashboard-subtle-panel rounded-[28px] p-5">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                  <PlayCircle className="h-3.5 w-3.5 text-cyan-300" />
                  After login
                </div>
                <div className="mt-4 space-y-3">
                  <div className="dashboard-subtle-panel rounded-[22px] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/70">
                          Recent pack
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          Cell respiration review
                        </p>
                      </div>
                      <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                        Resume
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/48">
                      Summaries, flashcards, and quiz prompts stay grouped around the same source.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="dashboard-subtle-panel rounded-[22px] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-100/70">
                        Due review
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">18 cards</p>
                      <p className="mt-2 text-sm leading-6 text-white/48">
                        Enough to restart momentum without opening five different screens.
                      </p>
                    </div>
                    <div className="dashboard-subtle-panel rounded-[22px] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/70">
                        Focus block
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">45 min</p>
                      <p className="mt-2 text-sm leading-6 text-white/48">
                        A single timer, one task, and a visible next move.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-surface rounded-[28px] p-5">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/75">
                  <CircleCheckBig className="h-3.5 w-3.5 text-amber-300" />
                  Why students stick
                </div>
                <div className="mt-4 space-y-3">
                  {workflowCards.map((card) => (
                    <div
                      key={card.title}
                      className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                          <card.icon className="h-4 w-4 text-white/80" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{card.title}</p>
                          <p className="mt-1 text-sm leading-6 text-white/50">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="order-1 dashboard-surface flex min-h-[640px] flex-col rounded-[30px] p-5 sm:p-6 lg:order-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/75">
                  Access panel
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  {mode === "signin" ? "Sign in" : "Create account"}
                </h2>
              </div>
              <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/60 sm:flex">
                Secure login
              </div>
            </div>

            <div className="mt-5 flex rounded-full border border-white/10 bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setStep("details");
                  setError("");
                  setCode("");
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition ${
                  mode === "signin"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-white/65 hover:text-white"
                }`}
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setStep("details");
                  setError("");
                  setCode("");
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-white/65 hover:text-white"
                }`}
              >
                <Users className="h-4 w-4" />
                Create account
              </button>
            </div>

            <div className="mt-5 rounded-[26px] border border-white/8 bg-white/[0.03] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <ShieldCheck className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {step === "otp"
                      ? "Step 2 of 2: verify and continue"
                      : "Step 1 of 2: enter one email"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/55">
                    {step === "otp"
                      ? `We sent a six-digit code to ${email || "your email address"}.`
                      : "Use the shortest route into the workspace. Google, guest mode, and email code are all available immediately."}
                  </p>
                </div>
              </div>
            </div>

            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (step === "otp") {
                  void verifyCode();
                  return;
                }
                void sendCode();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="auth-email" className="text-white/80">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    id="auth-email"
                    type="email"
                    value={email}
                    autoComplete="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-12 rounded-[18px] border-white/10 bg-[#0f1220]/80 pl-10 text-white placeholder:text-white/35"
                    autoFocus={step === "details"}
                  />
                </div>
              </div>

              {step === "otp" ? (
                <div className="space-y-2">
                  <Label htmlFor="auth-code" className="text-white/80">
                    Verification code
                  </Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <Input
                      id="auth-code"
                      value={code}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      onChange={(event) => setCode(event.target.value)}
                      placeholder="123456"
                      className="h-12 rounded-[18px] border-white/10 bg-[#0f1220]/80 pl-10 tracking-[0.3em] text-white placeholder:tracking-normal placeholder:text-white/35"
                      autoFocus
                    />
                  </div>
                  <p className="text-sm leading-6 text-white/50">
                    We keep this short on purpose: enter the code and return straight to your study flow.
                  </p>
                </div>
              ) : null}

              {error ? (
                <p className="rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-[18px] bg-white text-slate-950 hover:bg-white/90"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : step === "otp" ? (
                  <>
                    Verify and continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Send verification code
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              {step === "otp" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep("details");
                      setCode("");
                      setError("");
                    }}
                    className="h-11 rounded-[18px] text-white/60 hover:bg-white/[0.05] hover:text-white"
                  >
                    Change email
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void sendCode()}
                    className="h-11 rounded-[18px] text-white/60 hover:bg-white/[0.05] hover:text-white"
                  >
                    Resend code
                  </Button>
                </div>
              ) : null}
            </motion.form>

            <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/28">
              <div className="h-px flex-1 bg-white/10" />
              <span>Or continue faster</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                className="h-12 w-full rounded-[20px] bg-white text-slate-950 hover:bg-white/90"
              >
                <Chrome className="h-4 w-4" />
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleGuestSignIn}
                className="h-12 w-full rounded-[18px] text-white/60 hover:bg-white/[0.05] hover:text-white"
              >
                Browse in guest mode
              </Button>
            </div>

            <div className="mt-auto pt-5">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="dashboard-subtle-panel rounded-[22px] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100/75">
                    Email OTP
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    Short verification keeps login simple across mobile and desktop.
                  </p>
                </div>
                <div className="dashboard-subtle-panel rounded-[22px] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100/75">
                    Google
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    One-tap account entry for students who already use school email.
                  </p>
                </div>
                <div className="dashboard-subtle-panel rounded-[22px] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100/75">
                    Guest mode
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    Preview the workspace before you commit to an account.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
