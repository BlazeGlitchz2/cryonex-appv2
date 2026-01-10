import { useNavigate } from "react-router";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import TestimonialsSection from "@/components/ui/testimonial-v2";
import { LogoCloud } from "@/components/ui/logo-cloud-4";
import { AnimatedFeatureSpotlight3D } from "@/components/ui/animated-feature-spotlight3d";
import { Gift, Sparkles, Zap, Shield, ArrowRight, MessageSquare, Network, FileText } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { LobeHeader } from "@/components/landing/LobeHeader";
import { LobeFooter } from "@/components/landing/LobeFooter";
import { FullScreenMenu } from "@/components/ui/FullScreenMenu";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AssetPreloader } from "@/components/landing/AssetPreloader";
import { VideoScrubHero } from "@/components/landing/VideoScrubHero";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { IconBrain, IconAssistant, IconData, IconCryonex } from "@/components/ui/icons/Web3Icons";

const logos = [
    { src: "https://svgl.app/library/nvidia-wordmark-light.svg", alt: "Nvidia" },
    { src: "https://svgl.app/library/openai_wordmark_light.svg", alt: "OpenAI" },
    { src: "/assets/logo-vercel.png", alt: "Vercel" },
    { src: "https://svgl.app/library/github_wordmark_light.svg", alt: "GitHub" },
    { src: "https://svgl.app/library/react_wordmark_light.svg", alt: "React" },
    { src: "/assets/logo-tailwind.png", alt: "Tailwind" },
];

export default function Landing() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [assetsLoaded, setAssetsLoaded] = useState(false);

    // Enforce black background
    useEffect(() => {
        document.body.style.backgroundColor = "#030010";
        return () => {
            document.body.style.backgroundColor = "";
        };
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#030010] text-white relative overflow-x-hidden font-sans selection:bg-cyan-500/30">
            {/* Global Background - Shader Animation */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ShaderAnimation />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
            </div>

            {/* Asset Preloader */}
            {!assetsLoaded && <AssetPreloader onComplete={() => setAssetsLoaded(true)} />}

            {/* Main Content */}
            {assetsLoaded && (
                <>
                    <FullScreenMenu />

                    {/* Noise Overlay */}
                    <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.04] mix-blend-overlay">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-noise" />
                    </div>

                    {/* HERO SECTION: Video Scrub */}
                    <div className="relative z-10">
                        <VideoScrubHero />
                    </div>

                    {/* Main Content Wrapper */}
                    <div className="relative z-20 bg-transparent">

                        {/* Navigation */}
                        <div className="hidden md:block absolute top-0 left-0 right-0 z-50">
                            <LobeHeader />
                        </div>

                        {/* SECTION 2: LOGO CLOUD */}
                        <ScrollReveal variant="fade-in">
                            <section className="relative z-20 py-20 bg-black/40 backdrop-blur-xl border-t border-white/5">
                                <div className="max-w-7xl mx-auto px-6 text-center mb-8">
                                    <p className="text-sm font-medium text-white/30 uppercase mb-12 tracking-[0.3em]">
                                        Trusted by Visionaries
                                    </p>
                                    <LogoCloud logos={logos} />
                                </div>
                            </section>
                        </ScrollReveal>

                        {/* FEATURE SECTIONS */}
                        <div className="relative">
                            {/* Background Glows */}
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                                <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[120px]" />
                                <div className="absolute top-[40%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[120px]" />
                                <div className="absolute bottom-[10%] left-[20%] w-[50vw] h-[50vw] bg-pink-600/10 rounded-full blur-[120px]" />
                            </div>

                            <FeatureSection
                                title="Master Any Subject"
                                description="Turn any PDF, video, or lecture into interactive study materials. Generate flashcards, quizzes, and summaries instantly with AI."
                                image="/assets/feature-study-3d.png"
                                icon={IconBrain}
                                gradient="from-purple-500/20 to-blue-500/20"
                            />

                            <FeatureSection
                                title="Conversations with Intelligence"
                                description="Chat with your documents using advanced RAG technology. Ask questions, get citations, and understand complex topics in seconds."
                                image="/assets/feature-chat-3d.png"
                                icon={IconAssistant}
                                reversed
                                gradient="from-cyan-500/20 to-emerald-500/20"
                            />

                            <FeatureSection
                                title="Visualize Your Knowledge"
                                description="See the connections between ideas with our dynamic Knowledge Web. Navigate through concepts in a 3D interactive space."
                                image="/assets/feature-web-3d.png"
                                icon={IconData}
                                gradient="from-pink-500/20 to-orange-500/20"
                            />
                        </div>

                        {/* SECTION: BENTO GRID */}
                        <section className="py-32">
                            <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
                                <ScrollReveal variant="fade-up">
                                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Everything You Need</h2>
                                    <p className="text-xl text-white/50 max-w-2xl mx-auto">
                                        A complete ecosystem for learning, creating, and exploring.
                                    </p>
                                </ScrollReveal>
                            </div>
                            <ScrollReveal variant="fade-up">
                                <BentoGrid />
                            </ScrollReveal>
                        </section>

                        {/* SECTION: AFFILIATE */}
                        <ScrollReveal variant="fade-up">
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
                        </ScrollReveal>

                        {/* SECTION: TESTIMONIALS */}
                        <section className="relative z-20 py-32">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center mb-16"
                            >
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Loved by Creators</h2>
                            </motion.div>
                            <TestimonialsSection />
                        </section>

                        {/* FINAL CTA */}
                        <section className="relative z-20 py-32 md:py-48 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent" />

                            <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                                <ScrollReveal variant="scale-up">
                                    <div>
                                        <h2 className="text-5xl md:text-8xl font-bold text-white mb-8 tracking-tighter">
                                            Ready to Ascend?
                                        </h2>
                                        <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-2xl mx-auto">
                                            Join thousands of creators pushing the boundaries of what's possible.
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
                                    </div>
                                </ScrollReveal>
                            </div>
                        </section>

                        <LobeFooter />
                    </div>
                </>
            )}
        </div>
    );
}