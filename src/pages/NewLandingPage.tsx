import { useNavigate } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import TestimonialsSection from "@/components/ui/testimonial-v2";
import { HoverPreview, SmartHoverLink } from "@/components/ui/hover-preview";
import { LogoCloud } from "@/components/ui/logo-cloud-4";
import { AnimatedFeatureSpotlight3D } from "@/components/ui/animated-feature-spotlight3d";
import { Gift, Sparkles, Zap, Shield, ArrowRight, Play } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { GhostIntro } from "@/components/ui/GhostIntro";
import { GradientButton } from "@/components/ui/gradient-button";
import { Typewriter } from "@/components/ui/typewriter";

const logos = [
    { src: "https://svgl.app/library/nvidia-wordmark-light.svg", alt: "Nvidia" },
    { src: "https://svgl.app/library/openai_wordmark_light.svg", alt: "OpenAI" },
    { src: "/assets/logo-vercel.png", alt: "Vercel" },
    { src: "https://svgl.app/library/github_wordmark_light.svg", alt: "GitHub" },
    { src: "https://svgl.app/library/react_wordmark_light.svg", alt: "React" },
    { src: "/assets/logo-tailwind.png", alt: "Tailwind" },
];

const previewItems = {
    midjourney: {
        key: "midjourney",
        image: "https://images.unsplash.com/photo-1695144244472-a4543101ef35?w=560&h=320&fit=crop",
        title: "Midjourney",
        subtitle: "Create stunning AI-generated artwork",
    },
    stable: {
        key: "stable",
        image: "https://images.unsplash.com/photo-1712002641088-9d76f9080889?w=560&h=320&fit=crop",
        title: "Stable Diffusion",
        subtitle: "Open-source generative AI model",
    },
    leonardo: {
        key: "leonardo",
        image: "https://images.unsplash.com/photo-1718241905696-cb34c2c07bed?w=560&h=320&fit=crop",
        title: "Leonardo AI",
        subtitle: "Production-ready creative assets",
    },
};

// Vision points
const visionPoints = [
    {
        icon: Sparkles,
        title: "Democratize AI Creativity",
        description: "Everyone deserves access to powerful AI tools. Cryonex brings enterprise-grade AI to students, creators, and dreamers worldwide.",
    },
    {
        icon: Zap,
        title: "One Platform, Infinite Possibilities",
        description: "No more juggling subscriptions. Chat with 50+ AI models, generate images, study smarter, and build projects—all in one seamless experience.",
    },
    {
        icon: Shield,
        title: "Privacy-First Design",
        description: "Your conversations and creations stay yours. We don't train on your data or sell your information. Your privacy is our priority.",
    },
];

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
};

export default function Landing() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const SCROLL_THRESHOLD = 500; // Distance to scroll before unlocking content

    // Transform content position: 
    // At scroll 0, content is pushed down 500px by spacer, so we pull it up 500px.
    // At scroll 500, content is at natural position, so we pull it up 0px.
    const contentOffset = useTransform(scrollY, [0, SCROLL_THRESHOLD], [-SCROLL_THRESHOLD, 0]);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#030010] text-white relative overflow-x-hidden font-sans selection:bg-primary/30">
            <GhostIntro fadeDistance={SCROLL_THRESHOLD} />

            {/* Scroll Spacer to allow scrolling while content is locked */}
            <div style={{ height: SCROLL_THRESHOLD }} />

            {/* Main Content Wrapper */}
            <motion.div style={{ y: contentOffset }} className="relative z-0">

                {/* Multi-layer Background */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <ShaderAnimation />
                </div>

                {/* Navigation */}
                <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030010]/40 backdrop-blur-xl transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => navigate("/")}
                        >
                            <img src="/assets/cryonex-logo-official.png" alt="Cryonex Logo" className="h-9 w-9" />
                            <span className="text-xl font-bold tracking-tight text-white">
                                Cryonex
                            </span>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/signin")}
                                className="text-white/60 hover:text-white hidden md:inline-flex hover:bg-white/5"
                            >
                                Sign In
                            </Button>
                            <GradientButton
                                onClick={() => navigate("/app")}
                                className="min-w-[120px] px-6 py-2 h-10 text-sm"
                            >
                                Launch App
                            </GradientButton>
                        </motion.div>
                    </div>
                </nav>

                {/* SECTION 1: HERO */}
                <section className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-white">
                            Build Your <br className="hidden md:block" />
                            <Typewriter
                                text={[
                                    "Dreams",
                                    "Future",
                                    "Vision",
                                    "Reality",
                                    "Legacy"
                                ]}
                                speed={70}
                                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
                                waitTime={1500}
                                deleteSpeed={40}
                                cursorChar={"_"}
                            />
                        </h1>
                        <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl mx-auto">
                            AI-powered creativity for the next generation.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <GradientButton
                                onClick={() => navigate("/app")}
                                className="min-w-[160px] px-8 py-6 text-lg"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </GradientButton>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/pricing")}
                                className="border-white/20 text-white hover:bg-white/5 rounded-full px-10 py-6 text-lg backdrop-blur-sm"
                            >
                                View Pricing
                            </Button>
                        </div>
                    </motion.div>
                </section>

                {/* SECTION 2: LOGO CLOUD */}
                <section className="relative z-20 py-16 bg-gradient-to-b from-black/50 to-transparent">
                    <div className="max-w-7xl mx-auto px-6 text-center mb-8">
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-sm font-medium text-white/30 uppercase tracking-widest mb-8"
                        >
                            Powered by the Best
                        </motion.p>
                        <LogoCloud logos={logos} />
                    </div>
                </section>

                {/* SECTION 3: BENTO GRID FEATURES */}
                <BentoGrid />

                {/* SECTION 4: VISION */}
                <section className="relative z-20 py-24 md:py-32">
                    <div className="max-w-7xl mx-auto px-6">
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                                Unleash Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Creativity</span>
                            </h2>
                            <p className="text-lg md:text-xl text-white/50 max-w-3xl mx-auto">
                                Our mission is simple: make AI accessible, powerful, and delightful for everyone.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            {visionPoints.map((point, index) => (
                                <motion.div
                                    key={point.title}
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.02 }}
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:border-purple-500/30 transition-all duration-300 h-full">
                                        <div className="inline-flex p-4 rounded-2xl bg-purple-500/10 mb-6">
                                            <point.icon className="w-8 h-8 text-purple-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3">{point.title}</h3>
                                        <p className="text-white/50 leading-relaxed">{point.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* SECTION 5: HOVER PREVIEW */}
                <section className="relative z-20 py-32 bg-black/50">
                    <div className="max-w-5xl mx-auto px-6 text-center">
                        <motion.h2
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-bold text-white mb-12"
                        >
                            Integrate With the Best AI
                        </motion.h2>
                        <HoverPreview items={previewItems}>
                            <div className="text-2xl md:text-4xl leading-relaxed text-white/60 font-light">
                                <p className="mb-8">
                                    Harness the power of <SmartHoverLink previewKey="midjourney">Midjourney</SmartHoverLink> for
                                    breathtaking visuals, or dive into open-source freedom with <SmartHoverLink previewKey="stable">Stable Diffusion</SmartHoverLink>.
                                </p>
                                <p>
                                    Generate production-ready assets instantly using <SmartHoverLink previewKey="leonardo">Leonardo AI</SmartHoverLink>
                                    and bring your wildest ideas to life.
                                </p>
                            </div>
                        </HoverPreview>
                    </div>
                </section>

                {/* SECTION 6: AFFILIATE */}
                <section className="relative z-20 py-32">
                    <div className="max-w-7xl mx-auto px-6">
                        <AnimatedFeatureSpotlight3D
                            preheaderIcon={<Gift className="w-4 h-4 text-purple-400" />}
                            preheaderText="Join the Movement"
                            heading={
                                <>
                                    Earn Rewards with <span className="text-purple-400">Cryonex Affiliate</span>
                                </>
                            }
                            description="Join our affiliate program and receive exclusive rewards for every new creator you bring to the Digital Nebula. Earn up to 30% commission on referrals."
                            buttonText="Join Affiliate Program"
                            imageUrl="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/gift-3.png"
                        />
                    </div>
                </section>

                {/* SECTION 7: TESTIMONIALS */}
                <section className="relative z-20 py-24">
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Loved by Creators Worldwide</h2>
                        <p className="text-white/50">See what our community has to say</p>
                    </motion.div>
                    <TestimonialsSection />
                </section>

                {/* SECTION 8: FINAL CTA */}
                <section className="relative z-20 py-24 md:py-32">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent" />
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                                Ready to Build Your Dreams?
                            </h2>
                            <p className="text-lg text-white/50 mb-10">
                                Join thousands of creators already using Cryonex to push the boundaries of what's possible.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    onClick={() => navigate("/app")}
                                    className="bg-white text-black hover:bg-white/90 rounded-full px-10 py-6 text-lg font-semibold inline-flex items-center gap-2 shadow-xl shadow-white/10 transition-all hover:scale-105"
                                >
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/pricing")}
                                    className="border-white/20 text-white hover:bg-white/5 rounded-full px-10 py-6 text-lg backdrop-blur-sm"
                                >
                                    View Pricing
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="relative z-20 border-t border-white/5 bg-black/50 py-12 backdrop-blur-lg">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <img src="/assets/cryonex-logo-official.png" alt="Cryonex Logo" className="h-8 w-8" />
                                <span className="text-lg font-bold text-white">Cryonex</span>
                            </div>
                            <p className="text-sm text-white/30 text-center">
                                © 2024 Cryonex Systems. All rights reserved.
                            </p>
                            <div className="flex items-center gap-6 text-sm text-white/40">
                                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                                <a href="#" className="hover:text-white transition-colors">Terms</a>
                                <a href="#" className="hover:text-white transition-colors">Contact</a>
                            </div>
                        </div>
                    </div>
                </footer>

            </motion.div>
        </div>
    );
}