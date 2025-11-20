import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, BookOpen, Menu, X } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  const handleCTAClick = () => {
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a15] to-[#0a0f15] relative overflow-hidden">
      {/* Liquid Glass Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs with liquid glass effect */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/20 via-cyan-500/15 to-purple-500/10 rounded-full blur-3xl animate-pulse" 
             style={{ animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-tl from-cyan-500/20 via-blue-500/15 to-primary/10 rounded-full blur-3xl animate-pulse" 
             style={{ animation: 'float 10s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 via-primary/15 to-cyan-500/10 rounded-full blur-3xl" 
             style={{ animation: 'pulse 6s ease-in-out infinite' }} />
        
        {/* Glass shards effect */}
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-3xl rotate-12 border border-white/10" 
             style={{ animation: 'float 7s ease-in-out infinite' }} />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-gradient-to-tl from-cyan-500/10 to-transparent backdrop-blur-sm rounded-2xl -rotate-12 border border-cyan-500/20" 
             style={{ animation: 'float 9s ease-in-out infinite reverse' }} />
      </div>

      {/* Liquid Glass Navigation */}
      <nav className="relative z-50 border-b border-white/10 bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-2xl backdrop-saturate-150 sticky top-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-cyan-500/5 to-primary/5 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Cryonex
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <Button onClick={handleCTAClick} className="bg-primary hover:bg-primary/90">
                Get Started Free
              </Button>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <Button onClick={handleCTAClick} className="w-full bg-primary hover:bg-primary/90">
                Get Started Free
              </Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium">AI-Powered Workspace</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-primary to-cyan-400 bg-clip-text text-transparent">
              Your AI Workspace
            </span>
            <br />
            <span className="text-foreground">That Actually Works</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Chat with multiple AI models, generate images, analyze PDFs, and boost your productivity—all in one beautiful interface.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={handleCTAClick}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Start Creating Free
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-lg px-8 py-6"
            >
              See How It Works
            </Button>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="font-semibold text-primary">10,000+ users</span>
            </div>
          </div>
        </motion.div>

        {/* Hero Image/Demo */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 relative"
        >
          {/* Liquid Glass Demo Container */}
          <div className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl backdrop-saturate-150 p-6 shadow-2xl overflow-hidden">
            {/* Animated liquid gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-cyan-500/30 to-purple-500/30 blur-2xl opacity-60" 
                 style={{ animation: 'gradientShift 4s ease-in-out infinite' }} />
            <div className="absolute inset-0 bg-gradient-to-tl from-cyan-500/20 via-transparent to-primary/20 animate-pulse" />
            
            <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-primary/30 via-[#0a0a0f] to-cyan-500/30 flex items-center justify-center border border-white/10 backdrop-blur-sm overflow-hidden">
              {/* Inner glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
              <div className="text-center space-y-4 p-8">
                <div className="relative">
                  <Sparkles className="h-16 w-16 text-primary mx-auto animate-pulse" />
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">Experience AI-Powered Productivity</p>
                  <p className="text-sm text-muted-foreground">Multi-model chat • Image generation • Study tools</p>
                </div>
                <Button
                  onClick={handleCTAClick}
                  variant="outline"
                  className="mt-4 border-primary/30 hover:bg-primary/10"
                >
                  Try It Now
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl font-bold">Everything You Need</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful AI tools designed to supercharge your workflow
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Sparkles,
              title: "Multi-Model AI Chat",
              description: "Access GPT-4, Claude, Gemini, and more. Auto-selects the best model for your query.",
              color: "text-purple-400"
            },
            {
              icon: Zap,
              title: "Instant Image Generation",
              description: "Create stunning visuals from text prompts using state-of-the-art AI models.",
              color: "text-cyan-400"
            },
            {
              icon: BookOpen,
              title: "Smart Study Tools",
              description: "Analyze PDFs, generate flashcards, create quizzes, and build mind maps automatically.",
              color: "text-pink-400"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10"
            >
              <div className={`inline-flex p-3 rounded-xl bg-primary/10 ${feature.color} mb-4`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl font-bold">Get Started in Seconds</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No complex setup. Just sign in and start creating.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Sign In", description: "Quick email authentication. No passwords to remember." },
            { step: "2", title: "Choose Your Tool", description: "Chat, generate images, or analyze documents—your choice." },
            { step: "3", title: "Create Magic", description: "Let AI handle the heavy lifting while you focus on what matters." }
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 text-2xl font-bold text-primary">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-primary/20 via-cyan-500/15 to-purple-500/20 backdrop-blur-2xl backdrop-saturate-150 p-12 text-center space-y-6 overflow-hidden"
        >
          {/* Liquid glass layers */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-cyan-500/10 to-primary/10 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-tl from-white/5 via-transparent to-white/5" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Workflow?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already creating with Cryonex
            </p>
            <Button
              size="lg"
              onClick={handleCTAClick}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-lg shadow-primary/25"
            >
              Start Free Today
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Liquid Glass Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-2xl backdrop-saturate-150 mt-24">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">Cryonex</span>
              </div>
              <p className="text-xs text-muted-foreground">AI-Powered Workspace</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/about" className="hover:text-foreground transition-colors">About</a>
              <a href="/integrations" className="hover:text-foreground transition-colors">Integrations</a>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>All systems operational</span>
              </div>
              <p className="text-xs text-muted-foreground">© 2024 Cryonex. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}