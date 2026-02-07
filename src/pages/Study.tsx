import { StudyUploadZone } from "@/components/study/StudyUploadZone";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function Study() {
  return (
    <div className="flex-1 h-full overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#020005]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.15),_transparent_50%)]" />
      </div>

      <div className="h-full overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto w-full space-y-8"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Study Center
              </h1>
              <p className="text-white/50">
                Upload documents and start learning.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex-1 flex items-center justify-center min-h-[400px]"
          >
            <StudyUploadZone />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
