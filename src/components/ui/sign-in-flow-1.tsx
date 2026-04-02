"use client";

import React, {
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";

import { useOptimization } from "@/components/SmartOptimizer";
import { useAuth } from "@/hooks/use-auth";
import { useDeviceInfo } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { isNativePlatform } from "@/lib/mobile";
import {
  buildBrowserAuthRedirect,
  buildNativeAuthRedirect,
  readRedirectTarget,
} from "@/lib/auth-redirect";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

interface SignInPageProps {
  className?: string;
}
const SignInCanvasRevealEffect = lazy(() => import("./sign-in-canvas-reveal"));

const AnimatedNavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const defaultTextColor = "text-gray-300";
  const hoverTextColor = "text-white";
  const textSizeClass = "text-sm";

  return (
    <a
      href={href}
      className={`group relative inline-block h-5 overflow-hidden ${textSizeClass} flex items-center`}
    >
      <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
        <span className={defaultTextColor}>{children}</span>
        <span className={hoverTextColor}>{children}</span>
      </div>
    </a>
  );
};

function MiniNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState("rounded-full");
  const shapeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass("rounded-xl");
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass("rounded-full");
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const logoElement = (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gray-200 opacity-80" />
      <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gray-200 opacity-80" />
      <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gray-200 opacity-80" />
      <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gray-200 opacity-80" />
    </div>
  );

  const navLinksData = [
    { label: "Study OS", href: "#1" },
    { label: "Focus", href: "#2" },
    { label: "Library", href: "#3" },
  ];

  const loginButtonElement = (
    <button className="w-full rounded-full border border-[#333] bg-[rgba(31,31,31,0.62)] px-4 py-2 text-xs text-gray-300 transition-colors duration-200 hover:border-white/50 hover:text-white sm:w-auto sm:px-3 sm:text-sm">
      Login
    </button>
  );

  const signupButtonElement = (
    <div className="group relative w-full sm:w-auto">
      <div className="pointer-events-none absolute inset-0 -m-2 hidden rounded-full bg-gray-100 opacity-40 blur-lg transition-all duration-300 ease-out group-hover:-m-3 group-hover:opacity-60 group-hover:blur-xl sm:block" />
      <button className="relative z-10 w-full rounded-full bg-gradient-to-br from-gray-100 to-gray-300 px-4 py-2 text-xs font-semibold text-black transition-all duration-200 hover:from-gray-200 hover:to-gray-400 sm:w-auto sm:px-3 sm:text-sm">
        Signup
      </button>
    </div>
  );

  return (
    <header
      className={`fixed left-1/2 top-6 z-20 flex w-[calc(100%-2rem)] -translate-x-1/2 transform flex-col items-center border border-[#333] bg-[#1f1f1f57] px-6 py-3 backdrop-blur-sm transition-[border-radius] duration-0 ease-in-out sm:w-auto ${headerShapeClass}`}
    >
      <div className="flex w-full items-center justify-between gap-x-6 sm:gap-x-8">
        <div className="flex items-center">{logoElement}</div>

        <nav className="hidden items-center text-sm sm:flex sm:space-x-6">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex sm:gap-3">
          {loginButtonElement}
          {signupButtonElement}
        </div>

        <button
          className="flex h-8 w-8 items-center justify-center text-gray-300 focus:outline-none sm:hidden"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`flex w-full flex-col items-center overflow-hidden transition-all duration-300 ease-in-out sm:hidden ${isOpen ? "max-h-[1000px] opacity-100 pt-4" : "pointer-events-none max-h-0 opacity-0 pt-0"}`}
      >
        <nav className="flex w-full flex-col items-center space-y-4 text-base">
          {navLinksData.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="w-full text-center text-gray-300 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-4 flex w-full flex-col items-center space-y-4">
          {loginButtonElement}
          {signupButtonElement}
        </div>
      </div>
    </header>
  );
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const SignInPage = ({ className }: SignInPageProps) => {
  const { signIn } = useAuth();
  const deviceInfo = useDeviceInfo();
  const { shouldShowHeavyEffects, tier } = useOptimization();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "code" | "success">("email");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoSentRef = useRef(false);

  const redirectTarget = readRedirectTarget(searchParams);
  const redirectTo = isNativePlatform()
    ? buildNativeAuthRedirect(redirectTarget)
    : buildBrowserAuthRedirect(redirectTarget);

  const joinedCode = useMemo(() => code.join(""), [code]);
  const showAnimatedCanvas =
    shouldShowHeavyEffects &&
    tier !== "lite" &&
    !deviceInfo.isLowPowerDevice &&
    !deviceInfo.isSmartboard;

  const sendCode = async (emailValue: string) => {
    if (!signIn) {
      toast.error("Authentication is still loading");
      return false;
    }

    const normalized = emailValue.trim();
    if (!validateEmail(normalized)) {
      toast.error("Enter a valid email address");
      return false;
    }

    setIsSubmitting(true);
    try {
      await signIn("email-otp", { email: normalized });
      setEmail(normalized);
      setStep("code");
      toast.success("Verification code sent");
      return true;
    } catch (error) {
      console.error("Failed to send verification code", error);
      toast.error("Failed to send code");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyCode = async (verificationCode: string) => {
    if (!signIn) {
      toast.error("Authentication is still loading");
      return;
    }

    if (!email.trim() || verificationCode.length !== 6) return;

    setIsSubmitting(true);
    try {
      await signIn("email-otp", {
        email: email.trim(),
        code: verificationCode,
        redirectTo,
      });
      setStep("success");
    } catch (error) {
      console.error("Failed to verify email code", error);
      toast.error("Invalid verification code");
      setCode(["", "", "", "", "", ""]);
      codeInputRefs.current[0]?.focus();
      setReverseCanvasVisible(false);
      setInitialCanvasVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!signIn) {
      toast.error("Authentication is still loading");
      return;
    }

    try {
      await signIn("google", { redirectTo });
    } catch (error) {
      console.error("Failed to sign in with Google", error);
      toast.error("Failed to sign in with Google");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendCode(email);
  };

  useEffect(() => {
    const hint = searchParams.get("hint");
    const auto = searchParams.get("auto");

    if (hint) {
      setEmail(hint);
    }

    if (hint && auto === "true" && !autoSentRef.current) {
      autoSentRef.current = true;
      void sendCode(hint);
    }
  }, [searchParams, signIn]);

  useEffect(() => {
    if (step === "code") {
      const timeout = setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 500);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [step]);

  const handleCodeChange = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    if (nextValue.length <= 1) {
      const newCode = [...code];
      newCode[index] = nextValue;
      setCode(newCode);

      if (nextValue && index < 5) {
        codeInputRefs.current[index + 1]?.focus();
      }

      if (index === 5 && nextValue) {
        const isComplete = newCode.every((digit) => digit.length === 1);
        if (isComplete) {
          setReverseCanvasVisible(true);

          setTimeout(() => {
            setInitialCanvasVisible(false);
          }, 50);

          setTimeout(() => {
            void verifyCode(newCode.join(""));
          }, 1200);
        }
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleBackClick = () => {
    setStep("email");
    setCode(["", "", "", "", "", ""]);
    setReverseCanvasVisible(false);
    setInitialCanvasVisible(true);
  };

  return (
    <div
      className={cn(
        "relative flex min-h-screen w-[100%] flex-col bg-black",
        className,
      )}
    >
      <div className="absolute inset-0 z-0">
        {showAnimatedCanvas ? (
          <>
            {initialCanvasVisible ? (
              <div className="absolute inset-0">
                <Suspense fallback={null}>
                  <SignInCanvasRevealEffect
                    animationSpeed={3}
                    containerClassName="bg-black"
                    colors={[
                      [255, 255, 255],
                      [255, 255, 255],
                    ]}
                    dotSize={6}
                    reverse={false}
                  />
                </Suspense>
              </div>
            ) : null}

            {reverseCanvasVisible ? (
              <div className="absolute inset-0">
                <Suspense fallback={null}>
                  <SignInCanvasRevealEffect
                    animationSpeed={4}
                    containerClassName="bg-black"
                    colors={[
                      [255, 255, 255],
                      [255, 255, 255],
                    ]}
                    dotSize={6}
                    reverse
                  />
                </Suspense>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.16),transparent_38%),linear-gradient(180deg,#010308_0%,#050816_52%,#071223_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.024)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25" />
          </>
        )}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
        <div className="absolute left-0 right-0 top-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        <MiniNavbar />

        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="mt-[150px] w-full max-w-sm">
              <AnimatePresence mode="wait">
                {step === "email" ? (
                  <motion.div
                    key="email-step"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                        Turn class material into one study flow
                      </h1>
                      <p className="text-[1.25rem] font-light leading-8 text-white/70">
                        Sign in to keep your notes, lectures, summaries,
                        flashcards, and quizzes in one calmer workspace.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/52">
                      {[
                        "Bring your own material",
                        "Free to start",
                        "See plans first",
                      ].map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => void handleGoogleSignIn()}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10"
                      >
                        <span className="text-lg">G</span>
                        <span>Continue with Google</span>
                      </button>

                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-sm text-white/40">or</span>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>

                      <form onSubmit={handleEmailSubmit}>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="you@school.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-full border border-white/10 px-4 py-3 text-center text-white backdrop-blur-[1px] focus:border-white/30 focus:outline-none"
                            required
                          />
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span className="relative block h-full w-full overflow-hidden">
                              <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-full">
                                →
                              </span>
                              <span className="absolute inset-0 -translate-x-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0">
                                →
                              </span>
                            </span>
                          </button>
                        </div>
                      </form>
                    </div>

                    <p className="text-sm leading-7 text-white/52">
                      Start free, bring your own study material, and review the{" "}
                      <Link
                        to="/plans"
                        className="text-white/70 underline transition-colors hover:text-white"
                      >
                        plan details
                      </Link>{" "}
                      before you commit.
                    </p>

                    <p className="pt-10 text-xs text-white/40">
                      By continuing, you agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-white/40 underline transition-colors hover:text-white/60"
                      >
                        Terms
                      </Link>
                      ,{" "}
                      <Link
                        to="/privacy"
                        className="text-white/40 underline transition-colors hover:text-white/60"
                      >
                        Privacy Notice
                      </Link>
                      , and platform policies.
                    </p>
                  </motion.div>
                ) : step === "code" ? (
                  <motion.div
                    key="code-step"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                        We sent you a code
                      </h1>
                      <p className="text-[1.1rem] font-light leading-8 text-white/50">
                        Enter the 6-digit code sent to {email} to open your
                        study workspace.
                      </p>
                    </div>

                    <div className="w-full">
                      <div className="relative rounded-full border border-white/10 bg-transparent px-5 py-4">
                        <div className="flex items-center justify-center">
                          {code.map((digit, i) => (
                            <div key={i} className="flex items-center">
                              <div className="relative">
                                <input
                                  ref={(el) => {
                                    codeInputRefs.current[i] = el;
                                  }}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) =>
                                    handleCodeChange(i, e.target.value)
                                  }
                                  onKeyDown={(e) => handleKeyDown(i, e)}
                                  className="w-8 appearance-none border-none bg-transparent text-center text-xl text-white focus:outline-none focus:ring-0"
                                  style={{ caretColor: "transparent" }}
                                />
                                {!digit ? (
                                  <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full items-center justify-center">
                                    <span className="text-xl text-white">
                                      0
                                    </span>
                                  </div>
                                ) : null}
                              </div>
                              {i < 5 ? (
                                <span className="text-xl text-white/20">|</span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <motion.p
                        className="cursor-pointer text-sm text-white/50 transition-colors hover:text-white/70"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => void sendCode(email)}
                      >
                        Send another code
                      </motion.p>
                    </div>

                    <div className="flex w-full gap-3">
                      <motion.button
                        onClick={handleBackClick}
                        className="w-[30%] rounded-full bg-white px-8 py-3 font-medium text-black transition-colors hover:bg-white/90"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        Back
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => void verifyCode(joinedCode)}
                        className={`flex-1 rounded-full border py-3 font-medium transition-all duration-300 ${
                          code.every((d) => d !== "") && !isSubmitting
                            ? "cursor-pointer border-transparent bg-white text-black hover:bg-white/90"
                            : "cursor-not-allowed border-white/10 bg-[#111] text-white/50"
                        }`}
                        disabled={!code.every((d) => d !== "") || isSubmitting}
                      >
                        Open study workspace
                      </motion.button>
                    </div>

                    <div className="pt-16">
                      <p className="text-xs text-white/40">
                        By continuing, you agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-white/40 underline transition-colors hover:text-white/60"
                        >
                          Terms
                        </Link>
                        ,{" "}
                        <Link
                          to="/privacy"
                          className="text-white/40 underline transition-colors hover:text-white/60"
                        >
                          Privacy Notice
                        </Link>
                        , and platform policies.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-step"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                    className="space-y-6 text-center"
                  >
                    <div className="space-y-1">
                      <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                        You're in!
                      </h1>
                      <p className="text-[1.25rem] font-light text-white/50">
                        Opening your study workspace
                      </p>
                    </div>

                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="py-10"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-white to-white/70">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-black"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="w-full rounded-full bg-white py-3 font-medium text-black transition-colors hover:bg-white/90"
                    >
                      Continue to Dashboard
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DemoOne = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <SignInPage />
    </div>
  );
};

export { DemoOne };
