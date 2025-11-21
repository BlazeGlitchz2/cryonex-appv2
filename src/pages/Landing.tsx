import { useNavigate } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, BookOpen, Menu, X, ChevronRight, Star, Globe, Shield, Cpu } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const handleCTAClick = () => {
    navigate("/app");
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030014] text-white relative overflow-x-hidden font-sans selection:bg-purple-500/30">
      
      {/* Cosmic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a0b2e] via-[#030014] to-[#030014]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        
        {/* Stars */}
        <div className="stars absolute inset-0" />
        
        {/* Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030014]/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 blur-lg opacity-50" />
              <Sparkles className="h-6 w-6 text-white relative z-10" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Cryonex
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Showcase", "Pricing"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
            <Button 
              onClick={handleCTAClick}
              className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-medium text-sm"
            >
              Launch App
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-20 left-0 w-full bg-[#030014] border-b border-white/10 p-6 flex flex-col gap-4"
          >
            {["Features", "Showcase", "Pricing"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-lg text-white/70 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <Button onClick={handleCTAClick} className="w-full bg-white text-black mt-4">
              Launch App
            </Button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <motion.div 
          style={{ opacity, scale }}
          className="max-w-5xl mx-auto text-center space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-purple-300 mb-4"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Next Generation AI Workspace
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight"
          >
            Build the future <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient-x">
              with Cryonex
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            The all-in-one workspace where creativity meets intelligence. Chat, generate, and build with the world's most advanced AI models.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Button 
              onClick={handleCTAClick}
              size="lg"
              className="h-12 px-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all group"
            >
              Start Building
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="h-12 px-8 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm"
            >
              View Documentation
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 max-w-6xl mx-auto perspective-[2000px]"
        >
          <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl shadow-2xl overflow-hidden transform-style-3d group">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Fake UI Header */}
            <div className="h-12 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                <div className="w-3 h-3 rounded-full bg-green-500/20" />
              </div>
              <div className="mx-auto w-1/3 h-6 rounded-md bg-white/5" />
            </div>

            {/* Content Placeholder */}
            <div className="aspect-[16/9] md:aspect-[21/9] flex items-center justify-center bg-black/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
              <div className="text-center space-y-4 relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20 animate-float">
                  <Cpu className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Cryonex Engine Active</h3>
                <p className="text-white/50">Processing requests at lightspeed...</p>
              </div>
              
              {/* Floating Particles */}
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-2 h-2 bg-blue-400 rounded-full blur-[1px] animate-pulse"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.5}s`
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Glow Under Card */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2rem] blur-3xl opacity-20 -z-10" />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Unleash Cosmic Power</h2>
            <p className="text-white/60 max-w-2xl mx-auto text-lg">
              Everything you need to build, create, and learn in one unified interface.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: "Global Intelligence",
                desc: "Access the world's knowledge with real-time web search integrated directly into your chat.",
                gradient: "from-blue-500/20 to-cyan-500/20"
              },
              {
                icon: Zap,
                title: "Instant Creation",
                desc: "Generate code, images, and documents in milliseconds with our optimized engine.",
                gradient: "from-purple-500/20 to-pink-500/20"
              },
              {
                icon: Shield,
                title: "Private & Secure",
                desc: "Your data remains yours. Enterprise-grade encryption for all your conversations.",
                gradient: "from-green-500/20 to-emerald-500/20"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase / Testimonial */}
      <section id="showcase" className="py-20 relative z-10 border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Designed for the future of work</h2>
              <p className="text-white/60 text-lg mb-8">
                "Cryonex completely changed how I approach coding and content creation. The interface is stunning, and the AI responsiveness is unmatched."
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-lg font-bold">
                  A
                </div>
                <div>
                  <div className="font-semibold">Alex Chen</div>
                  <div className="text-sm text-white/40">Senior Developer</div>
                </div>
              </div>
            </motion.div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-[100px] opacity-20" />
              <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0f] p-6 aspect-video flex items-center justify-center">
                <span className="text-white/40">Interactive Demo Preview</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-32 text-center relative z-10 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to launch?</h2>
          <p className="text-xl text-white/60 mb-10">
            Join thousands of pioneers exploring the new frontier of AI productivity.
          </p>
          <Button 
            onClick={handleCTAClick}
            size="lg"
            className="h-14 px-10 rounded-full bg-white text-black hover:bg-white/90 text-lg font-medium"
          >
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#030014] py-12 text-center text-white/40 text-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold text-white/80">Cryonex</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <div>
            © 2024 Cryonex Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}
