import React, { Suspense, useRef } from "react";
import { Link } from "react-router";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Text3D, Center, useMatcapTexture } from "@react-three/drei";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, Globe, Cpu, Layers } from "lucide-react";
import * as THREE from "three";

// --- 3D Components ---

const FloatingCrystal = ({ position, color }: { position: [number, number, number], color: string }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh ref={meshRef} position={position}>
                <octahedronGeometry args={[1, 0]} />
                <meshPhysicalMaterial
                    color={color}
                    transmission={0.6}
                    thickness={2}
                    roughness={0}
                    ior={1.5}
                    clearcoat={1}
                />
            </mesh>
        </Float>
    );
};

const HeroScene = () => {
    return (
        <Canvas camera={{ position: [0, 0, 8] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="purple" />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <FloatingCrystal position={[-3, 1, 0]} color="#a855f7" />
            <FloatingCrystal position={[3, -1, -2]} color="#3b82f6" />
            <FloatingCrystal position={[0, 3, -5]} color="#ec4899" />
        </Canvas>
    );
};

// --- Landing Page Component ---

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <div className="min-h-screen bg-[#050014] text-white overflow-x-hidden selection:bg-primary/30">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050014]/80 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        Cryonex
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                        <a href="#about" className="hover:text-white transition-colors">About</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="text-muted-foreground hover:text-white">Log in</Button>
                        </Link>
                        <Link to="/auth">
                            <Button className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_-5px_var(--primary)]">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center pt-16 overflow-hidden">
                {/* 3D Background */}
                <div className="absolute inset-0 z-0 opacity-60">
                    <Suspense fallback={null}>
                        <HeroScene />
                    </Suspense>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-6 backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            v2.0 Now Available
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 pb-2">
                            The Future of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent animate-pulse-glow">
                                Digital Creation
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            Experience the next generation of AI-powered productivity.
                            Seamlessly blend coding, design, and study in one liquid interface.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/auth">
                                <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-white/90 rounded-full shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] transition-transform hover:scale-105">
                                    Start Building Free
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/10 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md">
                                View Demo
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center p-2">
                        <div className="w-1 h-2 bg-white/50 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Unleash Your Potential</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Powerful tools designed to help you achieve more, faster.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed with edge computing.", color: "text-yellow-400" },
                            { icon: Shield, title: "Secure by Design", desc: "Enterprise-grade security for your data.", color: "text-green-400" },
                            { icon: Globe, title: "Global Scale", desc: "Deploy anywhere with a single click.", color: "text-blue-400" },
                            { icon: Cpu, title: "AI Powered", desc: "Built-in intelligence to assist your workflow.", color: "text-purple-400" },
                            { icon: Layers, title: "Seamless Integration", desc: "Works with your favorite tools out of the box.", color: "text-pink-400" },
                            { icon: Sparkles, title: "Beautiful UI", desc: "Stunning liquid glass interface that inspires.", color: "text-cyan-400" }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br from-${feature.color.split('-')[1]}-500/10 to-transparent blur-3xl rounded-full -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100`} />

                                <div className={`h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/20 pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto p-12 rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to dive in?</h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Join thousands of creators building the future with Cryonex.
                        </p>
                        <Link to="/auth">
                            <Button size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/50 transition-all hover:scale-105">
                                Get Started Now
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-black/50 backdrop-blur-lg">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 font-bold text-lg text-muted-foreground">
                        <Sparkles className="h-5 w-5" /> Cryonex
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
