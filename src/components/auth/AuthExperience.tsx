import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  FileText,
  Layers,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";
import { AppearanceToggle } from "@/components/AppearanceToggle";
import { AccountModeSwitch } from "./AccountModeSwitch";
import { useAuth } from "@/hooks/use-auth";
import {
  buildBrowserAuthRedirect,
  buildNativeAuthRedirect,
  disableGuestPreviewMode,
  enableGuestPreviewMode,
  GUEST_PREVIEW_WORKSPACE_REDIRECT,
  shouldUseDirectGuestPreviewNavigation,
} from "@/lib/auth-redirect";
import { isNativePlatform } from "@/lib/platform-runtime";
import { cn } from "@/lib/utils";
import "@/styles/auth-refresh.css";

type Content = {
  image?: { src: string; alt: string };
  quote?: { text: string | string[]; author: string };
  eyebrow?: string;
  title?: string;
  description?: string;
};
interface AuthUIProps {
  signInContent?: Content;
  signUpContent?: Content;
  initialEmail?: string;
  autoSendCode?: boolean;
  defaultMode?: "signin" | "signup";
  redirectTarget?: string | null;
  destinationLabel?: string;
  className?: string;
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.88-1.73 2.99-4.28 2.99-7.36Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.41l-3.22-2.51c-.9.6-2.04.96-3.4.96-2.6 0-4.8-1.75-5.6-4.1H3.1v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.94a6 6 0 0 1 0-3.88V7.47H3.1a10 10 0 0 0 0 9.06l3.3-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.9 5.47l3.3 2.59c.8-2.35 3-4.1 5.6-4.1Z"
      />
    </svg>
  );
}

function AuthStudyPreview() {
  return (
    <div className="cx-auth-study couture-panel">
      <div className="cx-auth-study-header">
        <BookOpen size={19} aria-hidden="true" />
        <strong>Your study workspace</strong>
      </div>
      <p>Bring a source. Build understanding. Practice what you learn.</p>
      <ol className="cx-auth-study-steps">
        <li>
          <span>
            <FileText size={18} aria-hidden="true" />
          </span>
          <div>
            <strong>Start with your material</strong>
            <p>Notes, PDFs, slides, or a recording.</p>
          </div>
        </li>
        <li>
          <span>
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <div>
            <strong>Work through the ideas</strong>
            <p>Summaries and a coach grounded in your source.</p>
          </div>
        </li>
        <li>
          <span>
            <Layers size={18} aria-hidden="true" />
          </span>
          <div>
            <strong>Test your understanding</strong>
            <p>Flashcards, quizzes, and active recall.</p>
          </div>
        </li>
      </ol>
      <div className="cx-auth-study-footer">
        <ShieldCheck size={15} aria-hidden="true" /> Your sources stay connected
        to your work.
      </div>
    </div>
  );
}

export function AuthUI({
  initialEmail = "",
  autoSendCode = false,
  defaultMode = "signin",
  redirectTarget,
  destinationLabel = "workspace",
  signInContent,
  signUpContent,
  className,
}: AuthUIProps) {
  const { signIn } = useAuth();
  const [isSignIn, setIsSignIn] = useState(defaultMode === "signin");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"details" | "verify">("details");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<
    "email" | "verify" | "google" | "guest" | null
  >(null);
  const [cooldown, setCooldown] = useState(0);
  const autoSentRef = useRef(false);
  const busyRef = useRef(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const currentContent = isSignIn ? signInContent : signUpContent;
  const redirectTo = () =>
    isNativePlatform()
      ? buildNativeAuthRedirect(redirectTarget)
      : buildBrowserAuthRedirect(redirectTarget);
  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);
  useEffect(() => {
    setIsSignIn(defaultMode === "signin");
  }, [defaultMode]);
  useEffect(() => {
    if (step === "verify") codeInputRef.current?.focus();
  }, [step]);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(
      () => setCooldown((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const sendEmailCode = useCallback(
    async (value = email) => {
      if (busyRef.current) return;
      const normalizedEmail = value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        setError("Enter a valid email address to continue.");
        emailInputRef.current?.focus();
        return;
      }
      if (!signIn) {
        setError("Sign-in is still loading. Please try again in a moment.");
        return;
      }
      busyRef.current = true;
      setPending("email");
      setError("");
      try {
        await signIn("resend", { email: normalizedEmail });
        setEmail(normalizedEmail);
        setStep("verify");
        setCode("");
        setCooldown(30);
        toast.success("Check your inbox — your code is on its way.");
      } catch {
        setError("We couldn't send your code. Check your email and try again.");
      } finally {
        busyRef.current = false;
        setPending(null);
      }
    },
    [email, signIn],
  );
  useEffect(() => {
    if (!autoSendCode || !initialEmail || !signIn || autoSentRef.current)
      return;
    autoSentRef.current = true;
    void sendEmailCode(initialEmail);
  }, [autoSendCode, initialEmail, sendEmailCode, signIn]);

  const verifyCode = async () => {
    if (busyRef.current) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the complete six-digit code from your email.");
      codeInputRef.current?.focus();
      return;
    }
    if (!signIn) {
      setError("Sign-in is still loading. Please try again in a moment.");
      return;
    }
    busyRef.current = true;
    setPending("verify");
    setError("");
    try {
      await signIn("resend", {
        email: email.trim(),
        code,
        redirectTo: redirectTo(),
      });
    } catch {
      setError("That code didn't work. Try again or request a new one.");
      codeInputRef.current?.focus();
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  };
  const googleSignIn = async () => {
    if (busyRef.current) return;
    if (!signIn) {
      setError("Sign-in is still loading. Please try again in a moment.");
      return;
    }
    busyRef.current = true;
    setPending("google");
    setError("");
    try {
      await signIn("google", { redirectTo: redirectTo() });
    } catch {
      setError(
        "Google sign-in couldn't connect. Try again or continue with email.",
      );
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  };
  const guestSignIn = async () => {
    if (busyRef.current) return;
    if (shouldUseDirectGuestPreviewNavigation()) {
      enableGuestPreviewMode();
      localStorage.removeItem("kimi_guest_pending");
      window.location.assign(GUEST_PREVIEW_WORKSPACE_REDIRECT);
      return;
    }
    if (!signIn) {
      setError("Sign-in is still loading. Please try again in a moment.");
      return;
    }
    busyRef.current = true;
    setPending("guest");
    setError("");
    try {
      localStorage.setItem("kimi_guest_pending", "true");
      enableGuestPreviewMode();
      await signIn("anonymous");
    } catch {
      localStorage.removeItem("kimi_guest_pending");
      disableGuestPreviewMode();
      setError("The preview couldn't open. Please try again.");
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  };
  const changeMode = (mode: "signin" | "signup") => {
    setIsSignIn(mode === "signin");
    setStep("details");
    setCode("");
    setError("");
  };
  return (
    <main className={cn("cx-auth-page", className)}>
      <section className="cx-auth-story">
        <a href="/" className="cx-auth-brand" aria-label="Cryonex home">
          <BrandMark />
          <strong>cryonex</strong>
        </a>
        <div className="cx-auth-story-content">
          <h2>A workspace built around the way you learn.</h2>
          <p>Your materials, study tools, and AI conversations in one place.</p>
          <AuthStudyPreview />
        </div>
        <div className="cx-auth-story-footer">
          <span>
            <ShieldCheck size={13} /> A workspace that's yours.
          </span>
          <span>Study with Cryonex</span>
        </div>
      </section>
      <section className="cx-auth-form-side">
        <div className="cx-auth-form-top">
          <a href="/">
            <ArrowLeft size={14} /> Back to home
          </a>
          <AppearanceToggle />
        </div>
        <div className="cx-auth-form-content">
          <a
            href="/"
            className="cx-auth-mobile-brand"
            aria-label="Cryonex home"
          >
            <BrandMark />
            <strong>cryonex</strong>
          </a>
          <AccountModeSwitch
            value={isSignIn ? "signin" : "signup"}
            onChange={changeMode}
            disabled={!!pending}
          />
          <div className="cx-auth-form-heading">
            <h1>
              {step === "verify"
                ? "Check your email"
                : currentContent?.title ||
                  (isSignIn
                    ? "Sign in to Cryonex"
                    : "Create your Cryonex account")}
            </h1>
            <p>
              {step === "verify" ? (
                <>
                  We've sent a six-digit code to <strong>{email}</strong>. Enter
                  it below and you're in.
                </>
              ) : (
                currentContent?.description || (
                  <>
                    {isSignIn ? "Continue to your" : "Set up your"}{" "}
                    {destinationLabel} with Google or an email code.
                  </>
                )
              )}
            </p>
          </div>
          {step === "details" && (
            <>
              <button
                className="cx-auth-google"
                disabled={!!pending}
                onClick={() => void googleSignIn()}
              >
                {pending === "google" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <GoogleMark />
                )}
                Continue with Google
              </button>
              <div className="cx-auth-divider">
                <span />
                or continue with email
                <span />
              </div>
            </>
          )}
          <form
            className="cx-auth-form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void (step === "verify" ? verifyCode() : sendEmailCode());
            }}
          >
            {step === "details" ? (
              <div className="cx-auth-field">
                <label htmlFor="auth-email">Email address</label>
                <div>
                  <Mail size={16} />
                  <input
                    ref={emailInputRef}
                    id="auth-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    disabled={!!pending}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError("");
                    }}
                    aria-invalid={!!error}
                    aria-describedby={
                      error ? "auth-error auth-email-help" : "auth-email-help"
                    }
                    placeholder="you@example.com"
                  />
                </div>
                <small id="auth-email-help">
                  <ShieldCheck size={11} /> No password to remember. Just a
                  secure email code.
                </small>
              </div>
            ) : (
              <div className="cx-auth-field">
                <label htmlFor="auth-code">Verification code</label>
                <input
                  ref={codeInputRef}
                  className="cx-auth-code-input"
                  id="auth-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={code}
                  disabled={!!pending}
                  aria-invalid={!!error}
                  aria-describedby={error ? "auth-error" : undefined}
                  onChange={(event) => {
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    if (error) setError("");
                  }}
                  onPaste={(event) => {
                    const pastedCode = event.clipboardData
                      .getData("text")
                      .replace(/\D/g, "")
                      .slice(0, 6);
                    if (!pastedCode) return;
                    event.preventDefault();
                    setCode(pastedCode);
                    setError("");
                  }}
                  placeholder="000000"
                />
              </div>
            )}
            {error && (
              <p id="auth-error" className="cx-auth-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="cx-auth-submit"
              disabled={!!pending}
            >
              {pending === "email" || pending === "verify" ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  {pending === "verify"
                    ? "Verifying your code…"
                    : "Sending your code…"}
                </>
              ) : (
                <>
                  {step === "verify"
                    ? "Verify and continue"
                    : isSignIn
                      ? "Continue with email"
                      : "Create your free workspace"}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
          {step === "verify" ? (
            <div className="cx-auth-code-actions">
              <button
                disabled={!!pending}
                onClick={() => {
                  setStep("details");
                  setCode("");
                  setError("");
                }}
              >
                <ArrowLeft size={12} /> Use a different email
              </button>
              <button
                disabled={!!pending || cooldown > 0}
                onClick={() => void sendEmailCode()}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          ) : (
            <>
              <p className="cx-auth-terms">
                By continuing, you agree to our <a href="/terms">Terms</a> and{" "}
                <a href="/privacy">Privacy Policy</a>.
              </p>
              <div className="cx-auth-preview">
                <span>Just looking around?</span>
                <button onClick={() => void guestSignIn()} disabled={!!pending}>
                  {pending === "guest" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Compass size={14} />
                  )}{" "}
                  Preview workspace <ArrowUpRight size={13} />
                </button>
                <small>Explore a sample study session before signing up.</small>
              </div>
            </>
          )}
        </div>
        <footer className="cx-auth-form-footer">
          <span>© {new Date().getFullYear()} Cryonex</span>
          <a href="/privacy">
            <ShieldCheck size={12} /> Your privacy matters
          </a>
        </footer>
      </section>
    </main>
  );
}
