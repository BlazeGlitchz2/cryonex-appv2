import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Link as LinkIcon, Mic } from "lucide-react";
import { motion } from "framer-motion";

export function StudyDashboard() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-background overflow-y-auto">
      {/* Cosmic background - scoping to dark mode variants */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-background dark:bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_30%),linear-gradient(180deg,#060235_0%,#050218_55%,#030112_100%)] opacity-0 dark:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.12] [background-image:radial-gradient(circle,rgba(0,0,0,0.4)_1px,transparent_1.35px)] dark:[background-image:radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1.35px)] [background-size:28px_28px]" />
      </div>

      {/* Welcome Header */}
      <div className="relative z-10 p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 leading-tight">
            Hey, what do you wanna master?
          </h1>
        </motion.div>
      </div>

      {/* Upload Options */}
      <div className="relative z-10 px-6 pb-24 md:px-8 md:pb-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
          <Card
            className="bg-card/50 dark:bg-[#0a0625]/80 border-border transition-all cursor-pointer flex-1 rounded-2xl backdrop-blur-xl hover:bg-accent/10"
            onClick={() => navigate("/study")}
          >
            <CardContent className="p-6 text-center">
              <Upload className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-foreground font-semibold mb-1">Upload</h3>
              <p className="text-muted-foreground text-sm">Image, file, audio, video</p>
            </CardContent>
          </Card>
          <Card
            className="bg-card/50 dark:bg-[#0a0625]/80 border-border transition-all cursor-pointer flex-1 rounded-2xl backdrop-blur-xl hover:bg-accent/10"
            onClick={() => navigate("/study")}
          >
            <CardContent className="p-6 text-center">
              <LinkIcon className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-foreground font-semibold mb-1">Paste</h3>
              <p className="text-muted-foreground text-sm">YouTube, website, text</p>
            </CardContent>
          </Card>
          <Card
            className="bg-card/50 dark:bg-[#0a0625]/80 border-border transition-all cursor-pointer flex-1 rounded-2xl backdrop-blur-xl hover:bg-accent/10"
            onClick={() => navigate("/study")}
          >
            <CardContent className="p-6 text-center">
              <Mic className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-foreground font-semibold mb-1">Record</h3>
              <p className="text-muted-foreground text-sm">Record live lecture</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
