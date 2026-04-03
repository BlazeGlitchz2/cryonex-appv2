import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/lib/stores/theme-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HlsVideo } from "@/components/ui/hls-video";
import { isNativePlatform } from "@/lib/platform-runtime";
import { getBunnyStorageUrl } from "@/lib/utils/cdn-optimizer";
import {
  buildBrowserAuthRedirect,
  buildNativeAuthRedirect,
  readRedirectTarget,
  resolveAuthenticatedDestination,
} from "@/lib/auth-redirect";

type AuthStep = "intro" | "email" | "otp";

function describeDestination(redirectTarget: string) {
  try {
    const pathname = new URL(redirectTarget, "https://cryonex.app").pathname;

    if (pathname.startsWith("/study/workspace/")) return "study workspace";
    if (pathname === "/study/dashboard") return "study dashboard";
    if (pathname === "/app") return "assistant";
    if (pathname === "/library") return "library";
    if (pathname === "/app") return "assistant";
    if (pathname === "/affiliate") return "affiliate dashboard";
  } catch {
    return "workspace";
  }

  return "workspace";
}

export default function Auth() {
  const { signIn, isAuthenticated, isLoading, user } = useAuth();
  const mode = useThemeStore((state) => state.mode);
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<AuthStep>("intro");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const redirectTarget = readRedirectTarget(searchParams);
  const redirectTo = isNativePlatform()
    ? buildNativeAuthRedirect(redirectTarget)
    : buildBrowserAuthRedirect(redirectTarget);
  const destinationLabel = useMemo(
    () => describeDestination(redirectTarget),
    [redirectTarget],
  );
  const isLight = mode === "light";

  const shellClass = isLight
    ? "bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.18),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(125,211,252,0.24),transparent_24%),linear-gradient(180deg,#fff9fc_0%,#f8f2ff_52%,#eef4ff_100%)] text-slate-950 selection:bg-emerald-300/40 selection:text-slate-950"
    : "bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.08),transparent_26%),radial-gradient(circle_at_85%_15%,rgba(45,212,191,0.12),transparent_24%),linear-gradient(180deg,#040507_0%,#050913_52%,#04050a_100%)] text-white selection:bg-emerald-500/30 selection:text-white";
  const panelClass = isLight
    ? "border border-rose-200/80 bg-white/78 shadow-[0_32px_90px_rgba(244,114,182,0.12)]"
    : "border border-white/10 bg-[rgba(7,9,18,0.78)] shadow-[0_32px_90px_rgba(0,0,0,0.4)]";
  const secondaryPanelClass = isLight
    ? "border border-slate-200/80 bg-white/68"
    : "border border-white/10 bg-white/[0.04]";
  const heroEyebrowClass = isLight
    ? "border border-emerald-300/55 bg-emerald-50 text-emerald-700"
    : "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  const subtleTextClass = isLight ? "text-slate-600" : "text-white/58";
  const faintTextClass = isLight ? "text-slate-500" : "text-white/38";
  const sectionTitleClass = isLight ? "text-slate-950" : "text-white";
  const cardTextClass = isLight ? "text-slate-700" : "text-white/60";
  const formInputClass = isLight
    ? "h-14 rounded-2xl border-slate-200 bg-white/82 px-5 text-base text-slate-950 shadow-none placeholder:text-slate-400 focus:border-emerald-400/70 focus:ring-emerald-400/20"
    : "h-14 rounded-2xl border-white/10 bg-white/5 px-5 text-base text-white shadow-none placeholder:text-white/28 focus:border-emerald-500/55 focus:ring-emerald-500/20";
  const tertiaryButtonClass = isLight
    ? "border border-slate-200 bg-white/80 text-slate-700 hover:bg-white hover:text-slate-950"
    : "border border-white/10 bg-white/5 text-white/78 hover:bg-white/10 hover:text-white";

  const submitEmail = async (emailValue: string) => {
    if (!emailValue || !signIn) return;
    setIsSubmitting(true);
    try {
      await signIn("email-otp", { email: emailValue.trim() });
      setStep("otp");
      toast.success("Check your email for a sign-in code");
    } catch {
      toast.error("Failed to send code");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(
        resolveAuthenticatedDestination({
          user,
          redirectTarget: readRedirectTarget(location.search),
        }),
        { replace: true },
      );
    }
  }, [isAuthenticated, isLoading, location.search, navigate, user]);

  useEffect(() => {
    const hint = searchParams.get("hint");
    const action = searchParams.get("action");
    const auto = searchParams.get("auto");

    if (hint) {
      setEmail(hint);
      if (auto === "true") {
        void submitEmail(hint);
      } else {
        setStep("email");
      }
    } else if (action === "add_account") {
      setStep("intro");
    }
  }, [searchParams, signIn]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitEmail(email);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !signIn) return;
    setIsSubmitting(true);
    try {
      await signIn("email-otp", {
        email: email.trim(),
        code: code.trim(),
        redirectTo,
      });
    } catch (error: any) {
      console.error("OTP Error:", error);
      toast.error(error?.message || "Invalid code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!signIn) return;
    try {
      await signIn("google", { redirectTo });
    } catch (error) {
      console.error("Google sign-in failed", error);
      toast.error("Failed to sign in with Google");
    }
  };

  const handleGuestLogin = async () => {
    if (!signIn) return;
    try {
      localStorage.setItem("kimi_guest_pending", "true");
      await signIn("anonymous");
    } catch (error) {
      console.error("Guest sign-in failed", error);
      toast.error("Failed to enter guest mode");
      localStorage.removeItem("kimi_guest_pending");
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full overflow-hidden font-sans",
        shellClass,
      )}
    >
      <div className="relative grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className={cn(
              "absolute left-[-8%] top-[-12%] h-72 w-72 rounded-full blur-3xl",
              isLight ? "bg-rose-300/45" : "bg-emerald-500/10",
            )}
          />
          <div
            className={cn(
              "absolute bottom-[-12%] right-[-10%] h-80 w-80 rounded-full blur-3xl",
              isLight ? "bg-sky-300/35" : "bg-cyan-500/10",
            )}
          />
        </div>

        <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-xl space-y-6">
            <div
              className={cn(
                "rounded-[2rem] p-6 sm:p-8 backdrop-blur-2xl",
                panelClass,
              )}
            >
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl",
                      isLight
                        ? "border border-rose-200/80 bg-white shadow-[0_20px_40px_rgba(244,114,182,0.14)]"
                        : "border border-white/10 bg-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.3)]",
                    )}
                  >
                    <img
                      src="/logo.png"
                      alt="Cryonex"
                      className="h-9 w-9 object-contain"
                    />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-xs font-semibold uppercase tracking-[0.22em]",
                        faintTextClass,
                      )}
                    >
                      Cryonex
                    </p>
                    <h1
                      className={cn(
                        "text-lg font-semibold tracking-tight",
                        sectionTitleClass,
                      )}
                    >
                      Continue to your {destinationLabel}
                    </h1>
                  </div>
                </div>
                <div
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    heroEyebrowClass,
                  )}
                >
                  Google + email
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <p
                    className={cn(
                      "text-sm font-medium uppercase tracking-[0.18em]",
                      faintTextClass,
                    )}
                  >
                    Source-grounded study flow
                  </p>
                  <h2
                    className={cn(
                      "text-4xl font-semibold tracking-[-0.05em] sm:text-5xl",
                      sectionTitleClass,
                    )}
                  >
                    Bring your material in.
                    <span
                      className={cn(
                        "block",
                        isLight ? "text-emerald-700" : "text-emerald-300",
                      )}
                    >
                      Leave with a plan.
                    </span>
                  </h2>
                  <p
                    className={cn(
                      "max-w-lg text-[15px] leading-7",
                      subtleTextClass,
                    )}
                  >
                    Upload notes, PDFs, screenshots, or recordings, then move
                    straight into summaries, flashcards, quizzes, and focused
                    review without losing the thread of what you were already
                    doing.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Free start",
                      detail: "Open your workspace without a card.",
                    },
                    {
                      label: "Real material",
                      detail: "Built around lectures, notes, and PDFs.",
                    },
                    {
                      label: "Clean handoff",
                      detail: `After sign-in, you return to your ${destinationLabel}.`,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={cn("rounded-2xl p-4", secondaryPanelClass)}
                    >
                      <p
                        className={cn(
                          "text-[11px] font-semibold uppercase tracking-[0.2em]",
                          isLight ? "text-slate-500" : "text-white/40",
                        )}
                      >
                        {item.label}
                      </p>
                      <p
                        className={cn("mt-2 text-sm leading-6", cardTextClass)}
                      >
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <AnimatePresence mode="wait">
                  {step === "intro" ? (
                    <motion.div
                      key="intro"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-4"
                    >
                      <Button
                        onClick={handleGoogleLogin}
                        className={cn(
                          "h-14 w-full rounded-2xl text-base font-semibold shadow-none",
                          isLight
                            ? "bg-slate-950 text-white hover:bg-slate-900"
                            : "bg-white text-slate-950 hover:bg-white/92",
                        )}
                      >
                        <svg
                          className="mr-2 h-5 w-5"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
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

                      <Button
                        onClick={() => setStep("email")}
                        variant="outline"
                        className={cn(
                          "h-14 w-full rounded-2xl text-base font-medium shadow-none",
                          tertiaryButtonClass,
                        )}
                      >
                        <Mail className="mr-2 h-5 w-5" />
                        Continue with email
                      </Button>

                      <Button
                        onClick={handleGuestLogin}
                        variant="ghost"
                        className={cn(
                          "w-full rounded-2xl px-4 py-3 text-sm font-medium",
                          isLight
                            ? "text-slate-600 hover:bg-slate-950/4 hover:text-slate-950"
                            : "text-white/46 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        Preview workspace first
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="email"
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -14 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-5"
                    >
                      <button
                        onClick={() => setStep("intro")}
                        className={cn(
                          "inline-flex items-center gap-2 text-sm transition-colors",
                          isLight
                            ? "text-slate-500 hover:text-slate-950"
                            : "text-white/42 hover:text-white",
                        )}
                      >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        Back to options
                      </button>

                      <div>
                        <h3
                          className={cn(
                            "text-2xl font-semibold tracking-tight",
                            sectionTitleClass,
                          )}
                        >
                          {step === "email"
                            ? "Use your email"
                            : "Check your inbox"}
                        </h3>
                        <p
                          className={cn(
                            "mt-2 text-sm leading-6",
                            subtleTextClass,
                          )}
                        >
                          {step === "email"
                            ? "We’ll attach this address to your study workspace and send a one-time code."
                            : `We sent a 6-digit code to ${email}. Enter it below to finish signing in.`}
                        </p>
                      </div>

                      {step === "email" ? (
                        <form
                          onSubmit={handleEmailSubmit}
                          className="space-y-4"
                        >
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={formInputClass}
                            autoFocus
                          />
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-base font-semibold text-white shadow-none hover:from-emerald-400 hover:to-teal-400"
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              "Send code"
                            )}
                          </Button>
                        </form>
                      ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-4">
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="123456"
                            value={code}
                            onChange={(e) =>
                              setCode(e.target.value.replace(/\D/g, ""))
                            }
                            className={cn(
                              formInputClass,
                              "text-center font-mono text-2xl tracking-[0.35em]",
                            )}
                            maxLength={6}
                            autoFocus
                          />
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-base font-semibold text-white shadow-none hover:from-emerald-400 hover:to-teal-400"
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              "Verify code"
                            )}
                          </Button>
                        </form>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div
              className={cn(
                "flex items-start gap-3 rounded-2xl p-4",
                secondaryPanelClass,
              )}
            >
              <ShieldCheck
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0",
                  isLight ? "text-emerald-600" : "text-emerald-300",
                )}
              />
              <div>
                <p className={cn("text-sm font-medium", sectionTitleClass)}>
                  Smooth handoff after sign-in
                </p>
                <p className={cn("mt-1 text-sm leading-6", subtleTextClass)}>
                  Google and email both return you to the correct in-app
                  destination instead of dropping you onto the hosted auth
                  domain.
                </p>
              </div>
            </div>

            <p className={cn("px-1 text-xs leading-6", faintTextClass)}>
              By continuing, you agree to our{" "}
              <a
                href="/terms"
                className={cn(
                  "underline underline-offset-4",
                  isLight ? "hover:text-slate-950" : "hover:text-white",
                )}
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className={cn(
                  "underline underline-offset-4",
                  isLight ? "hover:text-slate-950" : "hover:text-white",
                )}
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>

        <section className="relative hidden min-h-screen lg:flex">
          <div className="relative m-4 flex-1 overflow-hidden rounded-[2.5rem] border border-white/10">
            <HlsVideo
              autoPlay
              loop
              muted
              playsInline
              isHls={false}
              src={getBunnyStorageUrl(
                "/assets/Cinematic_premium_sky_1080p_202601102101.mp4",
              )}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className={cn(
                "absolute inset-0",
                isLight
                  ? "bg-[linear-gradient(180deg,rgba(250,247,255,0.18),rgba(10,14,24,0.08),rgba(4,8,12,0.56))]"
                  : "bg-gradient-to-t from-black/82 via-black/18 to-black/24",
              )}
            />

            <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-12">
              <div className="flex justify-end">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-md",
                    isLight
                      ? "border border-white/60 bg-white/70 text-slate-900"
                      : "border border-white/10 bg-white/10 text-white",
                  )}
                >
                  <Sparkles
                    className={cn(
                      "h-4 w-4",
                      isLight ? "text-emerald-600" : "text-emerald-300",
                    )}
                  />
                  Return to your {destinationLabel}
                </div>
              </div>

              <div className="max-w-xl space-y-6">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-md",
                    isLight
                      ? "border border-white/60 bg-white/70 text-slate-700"
                      : "border border-white/10 bg-white/10 text-white/72",
                  )}
                >
                  <ShieldCheck
                    className={cn(
                      "h-4 w-4",
                      isLight ? "text-emerald-600" : "text-emerald-300",
                    )}
                  />
                  Built for real studying
                </div>

                <div
                  className={cn(
                    "max-w-lg rounded-[2rem] p-7 backdrop-blur-xl",
                    isLight
                      ? "border border-white/60 bg-white/62 text-slate-950"
                      : "border border-white/12 bg-white/10 text-white",
                  )}
                >
                  <h3 className="text-3xl font-semibold tracking-[-0.04em]">
                    Upload. Understand.
                    <span
                      className={cn(
                        "block",
                        isLight ? "text-emerald-700" : "text-emerald-300",
                      )}
                    >
                      Practice with intent.
                    </span>
                  </h3>
                  <p
                    className={cn(
                      "mt-4 text-sm leading-7",
                      isLight ? "text-slate-600" : "text-white/74",
                    )}
                  >
                    Cryonex keeps the jump from raw class material to active
                    recall tight, so sign-in feels like stepping back into the
                    session you were already having.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Mode", value: "Source-first" },
                  { label: "Start", value: "Free" },
                  { label: "Focus", value: "Exam prep" },
                  { label: "Flow", value: "Recall" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "rounded-[1.5rem] p-4 backdrop-blur-md",
                      isLight
                        ? "border border-white/55 bg-white/58 text-slate-950"
                        : "border border-white/10 bg-white/10 text-white",
                    )}
                  >
                    <p className="text-lg font-semibold">{stat.value}</p>
                    <p
                      className={cn(
                        "mt-1 text-[11px] uppercase tracking-[0.18em]",
                        isLight ? "text-slate-500" : "text-white/45",
                      )}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
