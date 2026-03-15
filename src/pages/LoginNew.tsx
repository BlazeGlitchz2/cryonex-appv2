import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ModernStunningSignIn } from "@/components/ui/modern-stunning-sign-in";

export function LoginNew() {
  const { signIn } = useAuth();

  // 3D Tilt Effect State
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / 25;
      const y = (e.clientY - innerHeight / 2) / 25;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#030010] flex overflow-hidden selection:bg-cyan-500/30">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 w-full flex flex-col lg:flex-row h-screen">
        {/* Left Side: Sign In Component */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
          <div className="absolute inset-0 lg:hidden bg-black/40 backdrop-blur-sm z-0" />
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md z-10"
          >
            <ModernStunningSignIn />

            <div className="mt-8 flex justify-center">
              <Button
                onClick={async () => {
                  try {
                    localStorage.setItem("kimi_guest_pending", "true");
                    await signIn("anonymous");
                  } catch (error) {
                    toast.error("Failed to enter guest mode");
                    localStorage.removeItem("kimi_guest_pending");
                  }
                }}
                variant="ghost"
                className="text-white/30 hover:text-white hover:bg-white/5 rounded-full px-6 py-2 text-xs font-medium transition-all"
              >
                KIMI OK COMPUTER Guest Mode
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right Side: 3D Visuals (Hidden on small screens or reduced) */}
        <div className="hidden lg:flex w-1/2 items-center justify-center relative perspective-1000">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* 3D Logo Container */}
            <motion.div
              style={{
                rotateX: -mousePosition.y,
                rotateY: mousePosition.x,
              }}
              className="mb-12 relative group cursor-pointer perspective-1000"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative w-64 h-64 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 flex items-center justify-center shadow-2xl shadow-cyan-500/10 group-hover:scale-105 transition-transform duration-500">
                <img
                  src="/logo.png"
                  alt="Cryonex"
                  className="w-32 h-32 object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                />
              </div>

              {/* Orbiting Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-40px] rounded-full border border-cyan-500/10 border-dashed"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-80px] rounded-full border border-indigo-500/10 border-dashed"
              />
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight text-center">
              Cryonex
              <br />
              <span className="text-4xl md:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 opacity-80">
                Next Gen UI
              </span>
            </h1>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
