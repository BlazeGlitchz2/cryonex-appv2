import { LobeHeader } from "@/components/landing/LobeHeader";
import { LobeFooter } from "@/components/landing/LobeFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

export default function MobileLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white relative font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-50">
        <LobeHeader />
      </div>

      <main className="pt-24 pb-10 px-6">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold tracking-tighter text-white mb-6 leading-tight">
              Master Any <br /> Subject
            </h1>
            <p className="text-lg text-white/60 font-light mb-8 max-w-xs mx-auto">
              The ultimate AI study companion. Chat with your documents and
              master any subject.
            </p>
            <Button
              onClick={() => navigate("/app")}
              className="group relative overflow-hidden rounded-full bg-white px-8 py-6 text-lg font-bold text-black transition-transform active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started <ArrowRight className="h-5 w-5" />
              </span>
            </Button>
          </motion.div>
        </section>

        {/* Features List (Simplified) */}
        <section className="space-y-8 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Unleash Your Potential</h2>
            <p className="text-white/50 text-sm">
              Powerful tools in your pocket.
            </p>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI-Powered Study</h3>
            <p className="text-white/60 text-sm">
              Transform any document into interactive study materials instantly.
            </p>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Instant Knowledge</h3>
            <p className="text-white/60 text-sm">
              Chat with your documents using advanced RAG technology.
            </p>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Global Connection</h3>
            <p className="text-white/60 text-sm">
              Connect with students and creators worldwide.
            </p>
          </div>
        </section>

        <LobeFooter />
      </main>
    </div>
  );
}
