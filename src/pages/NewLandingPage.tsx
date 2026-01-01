import { useNavigate } from "react-router";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import TestimonialsSection from "@/components/ui/testimonial-v2";
import { HoverPreview, SmartHoverLink } from "@/components/ui/hover-preview";
import { LogoCloud } from "@/components/ui/logo-cloud-4";
import { AnimatedFeatureSpotlight3D } from "@/components/ui/animated-feature-spotlight3d";
import { Gift, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { GhostIntro } from "@/components/ui/GhostIntro";
import { GradientButton } from "@/components/ui/gradient-button";
import { Typewriter } from "@/components/ui/typewriter";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { LobeHeader } from "@/components/landing/LobeHeader";
import { LobeHero } from "@/components/landing/LobeHero";
import { LobeFooter } from "@/components/landing/LobeFooter";


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
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
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
    const SCROLL_THRESHOLD = 500;

    // Smooth scroll physics
    const springScrollY = useSpring(scrollY, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const contentOffset = useTransform(springScrollY, [0, SCROLL_THRESHOLD], [-SCROLL_THRESHOLD, 0]);

    // Parallax effects
    const heroTextY = useTransform(springScrollY, [0, 500], [0, 200]);
    const heroOpacity = useTransform(springScrollY, [SCROLL_THRESHOLD, SCROLL_THRESHOLD + 400], [1, 0]);

    const bentoY = useTransform(springScrollY, [500, 1000], [100, 0]);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#030010] text-white relative overflow-x-hidden font-sans selection:bg-primary/30">

            <GhostIntro fadeDistance={SCROLL_THRESHOLD} />

            {/* Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-noise" />
            </div>

            {/* Scroll Spacer */}
            <div style={{ height: SCROLL_THRESHOLD }} />

            {/* Main Content Wrapper */}
            <motion.div style={{ y: contentOffset }} className="relative z-0">

                {/* Multi-layer Background */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <ShaderAnimation />
                </div>

                {/* Navigation */}
                <LobeHeader />

                {/* SECTION 1: HERO */}
                <LobeHero />

                {/* SECTION 2: LOGO CLOUD */}
                <section className="relative z-20 py-20 bg-gradient-to-b from-black/50 to-transparent border-t border-white/5 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-6 text-center mb-8">
                        <motion.p
                            initial={{ opacity: 0, letterSpacing: "0.2em" }}
                            whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="text-sm font-medium text-white/30 uppercase mb-12"
                        >
                            Powered by the Best
                        </motion.p>
                        <LogoCloud logos={logos} />
                    </div>
                </section>

                {/* SECTION 3: BENTO GRID FEATURES */}
                <motion.div style={{ y: bentoY }}>
                    <BentoGrid />
                </motion.div>

                {/* SECTION 4: VISION */}
                <section className="relative z-20 py-32 md:py-48">
                    <div className="max-w-7xl mx-auto px-6">
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            className="text-center mb-24"
                        >
                            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                                Unleash Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Creativity</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed">
                                Our mission is simple: make AI accessible, powerful, and delightful for everyone.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            {visionPoints.map((point, index) => (
                                <motion.div
                                    key={point.title}
                                    variants={fadeInUp}
                                    whileHover={{ y: -10 }}
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="relative bg-white/[0.02] border border-white/5 rounded-[2rem] p-10 hover:border-purple-500/30 transition-all duration-500 h-full backdrop-blur-sm">
                                        <div className="inline-flex p-5 rounded-2xl bg-purple-500/10 mb-8 group-hover:bg-purple-500/20 transition-colors">
                                            <point.icon className="w-10 h-10 text-purple-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4">{point.title}</h3>
                                        <p className="text-lg text-white/50 leading-relaxed">{point.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* SECTION 5: HOVER PREVIEW */}
                <section className="relative z-20 py-40 bg-black/50">
                    <div className="max-w-6xl mx-auto px-6 text-center">
                        <motion.h2
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="text-5xl md:text-7xl font-bold text-white mb-16 tracking-tight"
                        >
                            Integrate With the Best AI
                        </motion.h2>
                        <HoverPreview items={previewItems}>
                            <div className="text-3xl md:text-5xl leading-relaxed text-white/60 font-light">
                                <p className="mb-12">
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
                <section className="relative z-20 py-32">
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Loved by Creators Worldwide</h2>
                        <p className="text-xl text-white/50">See what our community has to say</p>
                    </motion.div>
                    <TestimonialsSection />
                </section>

                {/* SECTION 8: FINAL CTA */}
                <section className="relative z-20 py-32 md:py-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />

                    <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                        <motion.div
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <h2 className="text-5xl md:text-8xl font-bold text-white mb-8 tracking-tighter">
                                Ready to Build Your Dreams?
                            </h2>
                            <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-2xl mx-auto">
                                Join thousands of creators already using Cryonex to push the boundaries of what's possible.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <MagneticButton>
                                    <Button
                                        onClick={() => navigate("/app")}
                                        className="bg-white text-black hover:bg-white/90 rounded-full px-12 py-8 text-xl font-semibold inline-flex items-center gap-2 shadow-2xl shadow-white/20 transition-all hover:scale-105"
                                    >
                                        Get Started Free
                                        <ArrowRight className="w-6 h-6" />
                                    </Button>
                                </MagneticButton>
                                <MagneticButton>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate("/pricing")}
                                        className="border-white/20 text-white hover:bg-white/5 rounded-full px-12 py-8 text-xl backdrop-blur-sm"
                                    >
                                        View Pricing
                                    </Button>
                                </MagneticButton>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* FOOTER */}
                <LobeFooter />

            </motion.div>
        </div>
    );
}