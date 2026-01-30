import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Image as ImageIcon, Mic, FileText, Brain, Zap, Menu, ArrowRight, Settings, Home } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { useState } from "react";

export default function MobileHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white overflow-hidden">
      {/* Status Bar Placeholder (optional, for aesthetics) */}
      <div className="h-6 bg-black/20 w-full" />

      <ScrollArea className="flex-1 pb-20">
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Hi, {user?.name?.split(" ")[0] || "Friend"}!</h1>
                <p className="text-xs text-white/50">Ready to create?</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="rounded-full bg-white/5 hover:bg-white/10">
              <Settings className="h-5 w-5 text-white/70" />
            </Button>
          </div>

          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 p-6 shadow-2xl shadow-indigo-900/30"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Power Up Your AI Conversation</h2>
              <p className="text-white/70 text-sm mb-6">Get faster responses and smarter insights with our Pro model.</p>
              <Button className="w-full bg-white text-indigo-900 hover:bg-white/90 rounded-xl font-semibold h-12 shadow-lg">
                Unlock Pro
              </Button>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="bg-[#151515] p-5 rounded-3xl border border-white/5 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              onClick={() => navigate('/app')}
            >
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center mb-3">
                <ImageIcon className="h-5 w-5 text-pink-400" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Generate Image</h3>
              <p className="text-[10px] text-white/40">Create visuals instantly</p>
            </motion.div>

            <motion.div
              whileTap={{ scale: 0.98 }}
              className="bg-[#151515] p-5 rounded-3xl border border-white/5 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              onClick={() => navigate('/app')}
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Document Creation</h3>
              <p className="text-[10px] text-white/40">Draft & edit files</p>
            </motion.div>
          </div>

          {/* Recent Prompts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Recent Prompts</h3>
              <button className="text-xs text-purple-400 font-medium">See all</button>
            </div>
            <div className="space-y-3">
              {[
                { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10", text: "Show me how to create an AI tool using OpenAI" },
                { icon: Sparkles, color: "text-fuchsia-400", bg: "bg-fuchsia-400/10", text: "Suggest a style enhancement plan based on my preferences" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#151515] border border-white/5"
                >
                  <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <p className="text-xs text-white/70 line-clamp-2 flex-1 font-medium">
                    {item.text}
                  </p>
                  <ArrowRight className="h-4 w-4 text-white/20" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

    </div>
  );
}
