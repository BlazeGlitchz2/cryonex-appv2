import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Home, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030010] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="relative text-center px-6 max-w-lg"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 h-20 w-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center backdrop-blur-xl"
        >
          <Sparkles className="h-8 w-8 text-white/60" />
        </motion.div>

        {/* 404 Text */}
        <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-white to-cyan-400 bg-clip-text text-transparent mb-4 tracking-tight">
          404
        </h1>
        <p className="text-lg text-white/60 mb-2 font-medium">
          Page Not Found
        </p>
        <p className="text-sm text-white/30 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="h-12 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/app")}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-semibold border-0 shadow-lg shadow-purple-500/20 transition-all"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Cryonex
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
