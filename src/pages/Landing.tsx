import { useNavigate } from "react-router";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Menu, X, ChevronRight, Star, Globe, Shield, ArrowDown, Rocket, Brain, Wand2, Mic, Play } from "lucide-react";
import Logo3D from "@/components/Logo3D";
import SpaceBackground from "@/components/SpaceBackground";

function TiltCard({ children, className, gradient, border }: { children: React.ReactNode; className?: string; gradient: string; border: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set(clientX - left - width / 2);
    y.set(clientY - top - height / 2);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-12deg", "12deg"]);

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      className={`group relative rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-lg hover:bg-white/[0.05] transition-colors duration-500 overflow-hidden ${border} ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`} />
      <div style={{ transform: "translateZ(20px)" }} className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -120]);
  const phoneTilt = useTransform(scrollYProgress, [0, 0.6], [0, -10]);

  const handleCTAClick = () => {
    navigate("/app");
  };

  const handleLaunchAppClick = () => {
    const element = document.getElementById('showcase');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020005] text-white relative overflow-x-hidden font-sans selection:bg-fuchsia-500/30">

      {/* Cosmic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#2E1065] via-[#020005] to-[#020005]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />

        {/* Stars */}
        <SpaceBackground />

        {/* Deep Atmospheric Glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-fuchsia-600/20 rounded-full blur-[150px] animate-pulse mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[150px] animate-pulse mix-blend-screen" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse mix-blend-screen" style={{ animationDelay: '5s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030014]/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-indigo-500 blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles className="h-6 w-6 text-white relative z-10" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white/80">
              Cryonex
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Showcase", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-white/60 hover:text-white transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] px-3 py-1 rounded-full hover:bg-white/5"
              >
                {item}
              </a>
            ))}
            <Button
              onClick={handleCTAClick}
              className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              Launch
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
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
            className="md:hidden absolute top-20 left-0 w-full bg-[#030014]/95 backdrop-blur-3xl border-b border-white/10 p-6 flex flex-col gap-4"
          >
            {["Features", "Showcase", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-lg font-medium text-white/70 hover:text-white py-2 border-b border-white/5"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <Button onClick={handleCTAClick} className="w-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white mt-4 rounded-xl h-12 shadow-lg">
              Launch App
            </Button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden min-h-screen flex items-center">
        <motion.div
          style={{ opacity, scale, y: heroY }}
          className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1fr] items-center gap-12 lg:gap-20"
        >
          <div className="text-center lg:text-left space-y-8 relative z-20">
             <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-fuchsia-300 mb-4 backdrop-blur-md shadow-[0_0_20px_rgba(192,38,211,0.2)] hover:bg-white/10 transition-colors cursor-default"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
              </span>
              Next Generation AI Workspace
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50"
            >
              Your personal <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 animate-gradient-x drop-shadow-[0_0_50px_rgba(168,85,247,0.5)]">
                AI Companion
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Chat, create and orchestrate your work in a cosmic-class workspace. Designed with deep glass aesthetics and fluid 3D interactions for the creative mind.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-5 pt-6"
            >
              <Button
                onClick={handleCTAClick}
                size="lg"
                className="h-14 px-8 rounded-full bg-white text-black hover:bg-white/90 text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_rgba(255,255,255,0.6)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Launch Cryonex <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md text-lg font-medium transition-all hover:-translate-y-1"
              >
                Interactive Tour
              </Button>
            </motion.div>
          </div>

          {/* 3D Logo Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
            className="relative w-full h-[500px] flex items-center justify-center"
          >
             <Logo3D />
             {/* Floating Badges */}
             <motion.div 
               animate={{ y: [0, 20, 0] }} 
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-20 right-10 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-xl"
             >
               ✨ GPT-4 Turbo
             </motion.div>
             <motion.div 
               animate={{ y: [0, -20, 0] }} 
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute bottom-20 left-10 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-xl"
             >
               🚀 Ultra Fast
             </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-200 to-indigo-200">
              Unleash Cosmic Power
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
              Everything you need to build, create, and learn in one unified, glass-morphic interface.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Global Intelligence",
                desc: "Access the world's knowledge with real-time web search integrated directly into your chat.",
                gradient: "from-indigo-500/20 to-blue-500/20",
                border: "group-hover:border-indigo-500/50"
              },
              {
                icon: Zap,
                title: "Instant Creation",
                desc: "Generate code, images, and documents in milliseconds with our optimized engine.",
                gradient: "from-fuchsia-500/20 to-pink-500/20",
                border: "group-hover:border-fuchsia-500/50"
              },
              {
                icon: Shield,
                title: "Private & Secure",
                desc: "Your data remains yours. Enterprise-grade encryption for all your conversations.",
                gradient: "from-teal-500/20 to-emerald-500/20",
                border: "group-hover:border-teal-500/50"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="h-full"
              >
                <TiltCard gradient={feature.gradient} border={feature.border} className="h-full p-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-white/90">{feature.title}</h3>
                  <p className="text-white/50 leading-relaxed group-hover:text-white/80 transition-colors text-base">
                    {feature.desc}
                  </p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase / Testimonial */}
      <section id="showcase" className="py-32 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-900/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                Designed for the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">future of work</span>
              </h2>
              <p className="text-white/60 text-xl mb-10 leading-relaxed">
                "Cryonex completely changed how I approach coding and content creation. The interface is stunning, and the AI responsiveness is unmatched."
              </p>

              <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/10 w-fit backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-xl font-bold shadow-lg group-hover:scale-105 transition-transform">
                  A
                </div>
                <div>
                  <div className="font-bold text-lg group-hover:text-fuchsia-300 transition-colors">Alex Chen</div>
                  <div className="text-sm text-white/40">Senior Developer</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-indigo-600 rounded-full blur-[100px] opacity-20 animate-pulse" />
              <TiltCard gradient="from-fuchsia-500/10 to-indigo-500/10" border="border-white/20" className="aspect-video flex items-center justify-center shadow-2xl">
                <div className="text-center space-y-4 z-10 relative p-8">
                  <div className="inline-block p-4 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 mb-2 animate-bounce">
                    <Star className="w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                  </div>
                  <h3 className="text-3xl font-bold text-white">Interactive Demo</h3>
                  <p className="text-white/50 text-lg">Experience the fluid power of Cryonex</p>
                  <Button variant="outline" className="mt-6 h-12 px-8 border-white/20 hover:bg-white/10 hover:border-white/40 backdrop-blur-md text-base rounded-full">Coming Soon</Button>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-32 text-center relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 blur-3xl opacity-20 rounded-[3rem]" />
          <div className="relative z-10 bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-[3rem] p-12 md:p-24 overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
             
             <h2 className="text-4xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Ready to launch?</h2>
             <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto">
               Join thousands of pioneers exploring the new frontier of AI productivity.
             </p>
             <Button
               onClick={handleCTAClick}
               size="lg"
               className="h-16 px-12 rounded-full bg-white text-black hover:bg-white/90 text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300"
             >
               Get Started for Free
             </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#020005] py-12 text-center text-white/40 text-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <Sparkles className="h-4 w-4 text-fuchsia-400" />
            <span className="font-semibold text-white/80">Cryonex</span>
          </div>
          <div className="flex gap-8">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
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