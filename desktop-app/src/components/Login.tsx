import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Mail, Github, Chrome, ArrowRight } from "lucide-react";

export function Login() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | "otp">("signIn");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn("email", { email });
      setStep("otp");
    } catch (error) {
      console.error(error);
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn("email", { email, code: otp });
    } catch (error) {
      console.error(error);
      alert("Invalid Code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050510] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="glass-panel p-8 rounded-3xl w-full max-w-md relative z-10 border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
            Welcome to Cryonex
          </h1>
          <p className="text-gray-400">Sign in to access your workspace</p>
        </div>

        {step === "signIn" ? (
          <div className="space-y-6">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full glass-button bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                {loading ? "Sending Code..." : "Continue with Email"}
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0A0A12] px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => signIn("google")}
                className="glass-button flex items-center justify-center gap-2 py-3 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Chrome size={20} />
                <span>Google</span>
              </button>
              <button
                onClick={() => signIn("github")}
                className="glass-button flex items-center justify-center gap-2 py-3 rounded-xl text-white hover:bg-white/10 transition"
              >
                <Github size={20} />
                <span>GitHub</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleOtpVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="glass-input w-full px-4 py-3 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-600 focus:ring-2 focus:ring-purple-500/50"
                maxLength={6}
                required
              />
              <p className="text-xs text-center text-gray-500">
                Sent to {email}.{" "}
                <button
                  type="button"
                  onClick={() => setStep("signIn")}
                  className="text-purple-400 hover:underline"
                >
                  Change email
                </button>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full glass-button bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02]"
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
