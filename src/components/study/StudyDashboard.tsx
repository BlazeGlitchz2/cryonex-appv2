import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Link as LinkIcon, Mic } from "lucide-react";
import { motion } from "framer-motion";

export function StudyDashboard() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-black overflow-y-auto">
      {/* Welcome Header */}
      <div className="relative z-10 p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Hey Rat, what do you wanna master?</h1>
        </motion.div>
      </div>

      {/* Upload Options */}
      <div className="relative z-10 px-8 pb-8">
        <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
          <Card 
            className="bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#222] transition-all cursor-pointer flex-1"
            onClick={() => navigate('/study')}
          >
            <CardContent className="p-6 text-center">
              <Upload className="h-8 w-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Upload</h3>
              <p className="text-white/60 text-sm">Image, file, audio, video</p>
            </CardContent>
          </Card>
          <Card 
            className="bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#222] transition-all cursor-pointer flex-1"
            onClick={() => navigate('/study')}
          >
            <CardContent className="p-6 text-center">
              <LinkIcon className="h-8 w-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Paste</h3>
              <p className="text-white/60 text-sm">YouTube, website, text</p>
            </CardContent>
          </Card>
          <Card 
            className="bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#222] transition-all cursor-pointer flex-1"
            onClick={() => navigate('/study')}
          >
            <CardContent className="p-6 text-center">
              <Mic className="h-8 w-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Record</h3>
              <p className="text-white/60 text-sm">Record live lecture</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}