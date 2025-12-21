import React, { Suspense, useEffect } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, Brain, Cpu, Layers, CheckCircle2, Play, Star } from "lucide-react";
import Hero3D from "@/components/landing/Hero3D";
import LandingShader from "@/components/landing/LandingShader";

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    useEffect(() => {
        // Smart Preloading: Prefetch App and Studio after initial render
        const prefetchTimeout = setTimeout(() => {
            const prefetch = async () => {
                try {
                    await import("./App");
                    await import("./MediaStudio");
                    console.log("App resources prefetched");
                } catch (e) {
                    // Ignore prefetch errors
                }
            };
            prefetch();
        }, 2500);

        return () => clearTimeout(prefetchTimeout);
    }, []);

    const features = [
        { icon: Brain, title: "Advanced AI", desc: "Chat with open-source models from HuggingFace, Groq, and more. No limits.", color: "from-purple-500 to-violet-600" },
        { icon: Zap, title: "Lightning Fast", desc: "Responses in milliseconds with edge-optimized inference.", color: "from-yellow-500 to-orange-500" },
        { icon: Shield, title: "Privacy First", desc: "Your data stays yours. No training on your conversations.", color: "from-green-500 to-emerald-500" },
        { icon: Cpu, title: "Multi-Modal", desc: "Text, images, video generation, code execution—all in one place.", color: "from-blue-500 to-cyan-500" },
        { icon: Layers, title: "Study Tools", desc: "AI-powered flashcards, quizzes, and smart note-taking.", color: "from-pink-500 to-rose-500" },
        { icon: Sparkles, title: "Beautiful Design", desc: "Liquid glass aesthetics that inspire creativity.", color: "from-indigo-500 to-purple-500" }
    ];

    return (
        <div className="min-h-screen bg-[#030008] text-white overflow-x-hidden selection:bg-primary/30 font-sans">
            {/* Animated Background Shader */}
            <LandingShader />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Cryonex"
                            className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Cryonex
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#demo" className="hover:text-white transition-colors">Demo</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/auth">
                            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5">Log in</Button>
                        </Link>
                        <Link to="/auth">
                            <Button className="bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                {/* 3D Elements */}
                <div className="absolute inset-0 z-[1]">
                    <Suspense fallback={null}>
                        <Hero3D />
                    </Suspense>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-5xl mx-auto"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 backdrop-blur-md"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                            </span>
                            <span className="text-white/70">Now with 50+ Open-Source AI Models</span>
                        </motion.div>

                        {/* Hero Title */}
                        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.05]">
                            <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">
                                Your AI-Powered
                            </span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                                Creative Studio
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Chat with open-source AI models, generate stunning images, create videos,
                            study smarter with AI flashcards—all in one beautiful workspace.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/auth">
                                <Button size="lg" className="h-14 px-10 text-lg bg-white text-black hover:bg-white/90 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all hover:scale-105 group">
                                    Start Creating Free
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-white/10 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md group">
                                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                Watch Demo
                            </Button>
                        </div>

                        {/* Social Proof */}
                        <div className="mt-16 flex items-center justify-center gap-8 text-white/40 text-sm">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="ml-2">4.9/5 from 2k+ users</span>
                            </div>
                            <div className="hidden sm:block h-4 w-px bg-white/20" />
                            <div className="hidden sm:block">No credit card required</div>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
                    style={{ opacity }}
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center p-2 backdrop-blur-sm">
                        <motion.div
                            className="w-1 h-2 bg-white/50 rounded-full"
                            animate={{ y: [0, 4, 0], opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-bold mb-6"
                        >
                            Everything you need
                        </motion.h2>
                        <p className="text-white/50 max-w-xl mx-auto text-lg">
                            Powerful AI tools in a stunning interface designed for creators.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="group relative p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 backdrop-blur-sm overflow-hidden"
                            >
                                {/* Gradient background on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <feature.icon className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                                <p className="text-white/50 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Demo Section */}
            <section id="demo" className="py-32 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-bold mb-6"
                        >
                            See it in action
                        </motion.h2>
                        <p className="text-white/50 max-w-xl mx-auto text-lg">
                            A glimpse into the Cryonex experience.
                        </p>
                    </div>

                    {/* Demo Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-5xl mx-auto"
                    >
                        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
                            {/* Browser header */}
                            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="px-4 py-1 rounded-md bg-white/5 text-xs text-white/40">cryonex.app</div>
                                </div>
                            </div>

                            {/* Content area */}
                            <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                                        <Play className="h-8 w-8 text-white" />
                                    </div>
                                    <p className="text-white/50">Interactive demo coming soon</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="pricing" className="py-32 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto p-12 md:p-16 rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
                    >
                        {/* Background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-radial from-purple-500/20 to-transparent pointer-events-none" />

                        <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10">
                            Ready to create?
                        </h2>
                        <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto relative z-10">
                            Join thousands of creators building amazing things with Cryonex.
                            Start your journey today—it's completely free.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                            <Link to="/auth">
                                <Button size="lg" className="h-16 px-12 text-xl bg-white text-black hover:bg-white/90 rounded-full shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.4)] transition-all hover:scale-105">
                                    Get Started Now
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-sm text-white/40 mt-8 relative z-10">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            No credit card required • Free forever tier
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-black/50 backdrop-blur-lg relative z-10">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Cryonex" className="h-6 w-6 object-contain" />
                        <span className="font-bold text-white/60">Cryonex</span>
                    </div>
                    <div className="flex gap-8 text-sm text-white/40">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                    <div className="text-sm text-white/30">
                        © 2025 Cryonex. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
