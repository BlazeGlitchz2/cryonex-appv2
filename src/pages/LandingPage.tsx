import React, { Suspense, useEffect } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, Globe, Cpu, Layers, CheckCircle2 } from "lucide-react";
import Hero3D from "@/components/landing/Hero3D";
import DemoCard from "@/components/landing/DemoCard";
import TrustedBy from "@/components/landing/TrustedBy";
import Testimonials from "@/components/landing/Testimonials";

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    useEffect(() => {
        // Smart Preloading: Prefetch App and Studio after initial render
        const prefetchTimeout = setTimeout(() => {
            const prefetch = async () => {
                try {
                    // Dynamic import to trigger network request for chunks
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

    return (
        <div className="min-h-screen bg-[#050014] text-white overflow-x-hidden selection:bg-primary/30 font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050014]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050014]/50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Cryonex</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#demo" className="hover:text-white transition-colors">Demo</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5">Log in</Button>
                        </Link>
                        <Link to="/auth">
                            <Button className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_-5px_var(--primary)] border border-white/10">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                {/* 3D Background */}
                <div className="absolute inset-0 z-0">
                    <Suspense fallback={<div className="w-full h-full bg-[#050014]" />}>
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
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-primary mb-8 backdrop-blur-md shadow-lg shadow-primary/10 hover:bg-white/10 transition-colors cursor-default"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Cryonex v2.0 is now live
                        </motion.div>

                        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                                Build the Future
                            </span>
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent animate-pulse-glow">
                                With Liquid Speed
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
                            The all-in-one workspace for developers, designers, and dreamers.
                            Seamlessly blend coding, AI, and design in one fluid interface.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/auth">
                                <Button size="lg" className="h-14 px-10 text-lg bg-white text-black hover:bg-white/90 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)]">
                                    Start Building Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-white/10 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md transition-all hover:scale-105">
                                View Documentation
                            </Button>
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
                        <div className="w-1 h-2 bg-white/50 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Trusted By */}
            <TrustedBy />

            {/* Demo Section */}
            <section id="demo" className="py-32 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Experience the Power</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                            A fully interactive studio environment right in your browser.
                        </p>
                    </div>
                    <DemoCard />
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 relative bg-black/20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                            Powerful features to supercharge your development workflow.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed with edge computing and instant state updates.", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
                            { icon: Shield, title: "Secure by Design", desc: "Enterprise-grade security with end-to-end encryption for your data.", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
                            { icon: Globe, title: "Global Scale", desc: "Deploy anywhere with a single click to our global edge network.", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                            { icon: Cpu, title: "AI Powered", desc: "Built-in intelligence to assist your workflow and generate code.", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                            { icon: Layers, title: "Seamless Integration", desc: "Works with your favorite tools out of the box. No config needed.", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
                            { icon: Sparkles, title: "Beautiful UI", desc: "Stunning liquid glass interface that inspires creativity.", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                                className={`group p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden backdrop-blur-sm`}
                            >
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent`} />

                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} ${feature.border} border group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon size={28} className={feature.color} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <Testimonials />

            {/* CTA Section / Pricing */}
            <section id="pricing" className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-primary/20 pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto p-12 rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

                        <h2 className="text-5xl md:text-7xl font-bold mb-8 relative z-10">Ready to dive in?</h2>
                        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto relative z-10">
                            Join thousands of creators building the future with Cryonex.
                            Start your journey today.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                            <Link to="/auth">
                                <Button size="lg" className="h-16 px-12 text-xl bg-primary hover:bg-primary/90 text-white rounded-full shadow-[0_0_30px_-5px_var(--primary)] hover:shadow-[0_0_50px_-5px_var(--primary)] transition-all hover:scale-105">
                                    Get Started Now
                                </Button>
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 sm:mt-0 sm:ml-6">
                                <CheckCircle2 className="w-4 h-4 text-green-400" /> No credit card required
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-black/50 backdrop-blur-lg">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 font-bold text-lg text-muted-foreground">
                        <Sparkles className="h-5 w-5" /> Cryonex
                    </div>
                    <div className="flex gap-8 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                    <div className="text-sm text-muted-foreground/60">
                        © 2025 Cryonex Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
