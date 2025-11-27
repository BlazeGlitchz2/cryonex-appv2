import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Shield, Zap, Lock, Activity, Settings } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="h-full flex flex-col bg-[#050014] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="border-b border-white/10 px-6 py-6 shrink-0 bg-white/5 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
            <p className="text-white/50 text-sm">Manage application settings and features</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-6 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-8 mx-auto"
        >
          {/* Feature Toggles */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white/80 mb-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Features</h2>
            </div>
            <div className="grid gap-4">
              <motion.div whileHover={{ scale: 1.01 }} className="group bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-white group-hover:text-purple-300 transition-colors">Deep Research</p>
                    <p className="text-sm text-white/50">Enable web search and research capabilities</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-purple-600" />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }} className="group bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-white group-hover:text-purple-300 transition-colors">Code Generation</p>
                    <p className="text-sm text-white/50">Allow AI to generate and execute code</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-purple-600" />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }} className="group bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-white group-hover:text-purple-300 transition-colors">Image Generation</p>
                    <p className="text-sm text-white/50">Enable AI image creation features</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-purple-600" />
                </div>
              </motion.div>
            </div>
          </section>

          {/* Security Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white/80 mb-2">
              <Lock className="h-4 w-4 text-red-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Security</h2>
            </div>
            <div className="grid gap-4">
              <motion.div whileHover={{ scale: 1.01 }} className="group bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-white group-hover:text-purple-300 transition-colors">Data Encryption</p>
                    <p className="text-sm text-white/50">Encrypt all stored data (Enforced)</p>
                  </div>
                  <Switch defaultChecked disabled className="opacity-50" />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }} className="group bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-white group-hover:text-purple-300 transition-colors">Audit Logging</p>
                    <p className="text-sm text-white/50">Log all user actions for security</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-purple-600" />
                </div>
              </motion.div>
            </div>
          </section>
        </motion.div>
      </ScrollArea>
    </div>
  );
}
