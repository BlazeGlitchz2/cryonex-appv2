import { useNavigate } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, X, Menu } from "lucide-react";
import SpaceBackground from "@/components/SpaceBackground";
import GenerativeMountainScene from "@/components/ui/mountain-scene";
import { PoemAnimation } from "@/components/ui/3d-animation";
import TestimonialsSection from "@/components/ui/testimonial-v2";
import { HoverPreview } from "@/components/ui/hover-preview";
import { RatingInteraction } from "@/components/ui/emoji-rating";

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkPerformance = () => {
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isMobile = window.innerWidth < 768;
      setIsPerformanceMode(isAndroid || isMobile);
    };
    checkPerformance();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -120]);

  const handleCTAClick = () => {
    navigate("/app");
  };

  const poemHTML = `
    <div style="text-align: center; font-family: 'Courier New', monospace;">
      <p>In the void of code,</p>
      <p>We build our dreams,</p>
      <p>A digital nebula,</p>
      <p>Or so it seems.</p>
    </div>
  `;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050510] text-white relative overflow-x-hidden font-sans selection:bg-primary/30 cosmic">

      {/* Global Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050510] to-[#050510]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        {isPerformanceMode ? (
          <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-[#0a0a0b] opacity-80" />
        ) : (
          <>
            <SpaceBackground />
            <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-50 mix-blend-screen">
              <GenerativeMountainScene />
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050510]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050510]/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-primary blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="https://harmless-tapir-303.convex.cloud/api/storage/87893b86-54f0-457c-9239-2ebfde8a2814"
                alt="Cryonex Logo"
                className="w-full h-full object-contain relative z-10"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white text-glow">
              Cryonex
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Showcase", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-white/70 hover:text-white transition-all hover:text-glow px-3 py-1 rounded-full hover:bg-white/5"
              >
                {item}
              </a>
            ))}
            <Button
              onClick={handleCTAClick}
              className="glass-button rounded-full px-6 font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95"
            >
              Launch App
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
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
            className="md:hidden absolute top-20 left-0 w-full bg-[#050510]/95 backdrop-blur-3xl border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl"
          >
            {["Features", "Showcase", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-lg font-medium text-white/60 hover:text-white py-2 border-b border-white/5"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <Button onClick={handleCTAClick} className="w-full bg-white text-black mt-4 rounded-xl h-12 shadow-lg font-bold">
              Launch App
            </Button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden min-h-screen flex items-center">
        <motion.div
          style={{ y: isPerformanceMode ? 0 : heroY }}
          className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1fr] items-center gap-12 lg:gap-20"
        >
          <div className="text-center lg:text-left space-y-8 relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-4 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:bg-white/10 transition-colors cursor-default"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Neo-Cosmic Intelligence
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] text-white drop-shadow-2xl"
            >
              Enter the <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 animate-gradient-x drop-shadow-lg text-glow">
                Digital Nebula
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light"
            >
              A high-fidelity workspace where code, creativity, and intelligence merge. Experience the fluid glass interface designed for the next era of building.
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
                className="h-14 px-8 rounded-full bg-white text-black hover:bg-white/90 text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  Enter Cryonex <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-md text-lg font-medium transition-all hover:-translate-y-1 glass-button"
              >
                Explore Vision
              </Button>
            </motion.div>
          </div>

          {/* 3D Poem Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
            className="relative w-full h-[500px] flex items-center justify-center"
          >
            {!isPerformanceMode ? (
              <PoemAnimation
                poemHTML={poemHTML}
                backgroundImageUrl="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
                boyImageUrl="https://harmless-tapir-303.convex.cloud/api/storage/87893b86-54f0-457c-9239-2ebfde8a2814"
              />
            ) : (
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div className="absolute inset-0 bg-purple-500/20 blur-[60px] rounded-full animate-pulse" />
                <img
                  src="https://harmless-tapir-303.convex.cloud/api/storage/87893b86-54f0-457c-9239-2ebfde8a2814"
                  alt="Cryonex Logo"
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Hover Preview Section */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white text-glow">
              Discover the Nebula
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
              Hover to reveal the tools that power your next breakthrough.
            </p>
          </motion.div>

          <HoverPreview />
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Feedback Section */}
      <section className="py-20 relative z-10 flex flex-col items-center justify-center">
        <h3 className="text-2xl font-bold text-white mb-10 text-glow">Rate your Experience</h3>
        <RatingInteraction />
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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-cyan-600 to-purple-600 blur-3xl opacity-20 rounded-[3rem]" />
          <div className="relative z-10 glass-panel rounded-[3rem] p-12 md:p-24 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <h2 className="text-4xl md:text-7xl font-bold mb-8 text-white text-glow">Ready to launch?</h2>
            <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto">
              Join thousands of pioneers exploring the new frontier of AI productivity.
            </p>
            <Button
              onClick={handleCTAClick}
              size="lg"
              className="h-16 px-12 rounded-full bg-white text-black hover:bg-white/90 text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300"
            >
              Get Started for Free
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050510] py-12 text-center text-white/40 text-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <img
              src="https://harmless-tapir-303.convex.cloud/api/storage/87893b86-54f0-457c-9239-2ebfde8a2814"
              alt="Cryonex Logo"
              className="w-5 h-5 object-contain"
            />
            <span className="font-semibold text-white">Cryonex</span>
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