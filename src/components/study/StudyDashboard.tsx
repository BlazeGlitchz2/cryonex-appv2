import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Link as LinkIcon, Mic } from "lucide-react";
import { motion } from "framer-motion";

export function StudyDashboard() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-[#050218] overflow-y-auto">
      {/* Cosmic background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,68,255,0.12),transparent_30%),linear-gradient(180deg,#060235_0%,#050218_55%,#030112_100%)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1.35px)] [background-size:28px_28px]" />
      </div>

      {/* Welcome Header */}
      <div className="relative z-10 p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
            Hey, what do you wanna master?
          </h1>
        </motion.div>
      </div>

      {/* Upload Options */}
      <div className="relative z-10 px-6 pb-24 md:px-8 md:pb-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
          <Card
            className="bg-[#0a0625]/80 border-white/[0.06] hover:bg-white/[0.06] transition-all cursor-pointer flex-1 rounded-2xl gradient-border backdrop-blur-xl"
            onClick={() => navigate("/study")}
          >
            <CardContent className="p-6 text-center">
              <Upload className="h-8 w-8 text-[#D244FF] mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Upload</h3>
              <p className="text-white/50 text-sm">Image, file, audio, video</p>
            </CardContent>
          </Card>
          <Card
            className="bg-[#0a0625]/80 border-white/[0.06] hover:bg-white/[0.06] transition-all cursor-pointer flex-1 rounded-2xl gradient-border backdrop-blur-xl"
            onClick={() => navigate("/study")}
          >
            <CardContent className="p-6 text-center">
              <LinkIcon className="h-8 w-8 text-[#D244FF] mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Paste</h3>
              <p className="text-white/50 text-sm">YouTube, website, text</p>
            </CardContent>
          </Card>
          <Card
            className="bg-[#0a0625]/80 border-white/[0.06] hover:bg-white/[0.06] transition-all cursor-pointer flex-1 rounded-2xl gradient-border backdrop-blur-xl"
            onClick={() => navigate("/study")}
          >
            <CardContent className="p-6 text-center">
              <Mic className="h-8 w-8 text-[#D244FF] mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Record</h3>
              <p className="text-white/50 text-sm">Record live lecture</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
