import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
    Play,
    Zap,
    Shield,
    Activity,
    Twitter,
    Github,
    X,
    Check,
    Sparkles,
    Brain,
    BookOpen,
    ImageIcon,
    ArrowRight,
    Star,
    Clock,
    Users,
    Crown,
    Gem,
    Code,
    MessageSquare,
    Cpu,
    Globe
} from 'lucide-react';
import Scene3D from '@/components/landing/Scene3D';
import NeoCosmicShader from '@/components/shaders/NeoCosmicShader';
import Neo3DShader from '@/components/shaders/Neo3DShader';
import { motion, useScroll, useTransform } from 'framer-motion';

// Pricing Plans Data
const pricingPlans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for getting started',
        features: [
            '50 messages/day',
            '10+ AI models',
            'Basic study tools',
            'Community support',
            'Ads supported',
        ],
        cta: 'Get Started',
        popular: false,
        icon: Sparkles,
    },
    {
        name: 'Pro',
        price: '$9',
        period: '/month',
        description: 'For power users',
        features: [
            'Unlimited messages',
            '50+ AI models',
            'Advanced study tools',
            'Priority support',
            'No ads',
            'File uploads (50MB)',
            'Custom AI personas',
        ],
        cta: 'Upgrade to Pro',
        popular: true,
        icon: Zap,
    },
    {
        name: 'Ultra',
        price: '$29',
        period: '/month',
        description: 'For teams & power users',
        features: [
            'Everything in Pro',
            'API access',
            'Team collaboration',
            'Priority model access',
            'Dedicated support',
            'Custom integrations',
            'White-label options',
        ],
        cta: 'Go Ultra',
        popular: false,
        icon: Crown,
    },
];

// Comparison Data
const comparisonData = [
    { feature: 'Price', cryonex: 'Free - $29', chatgpt: '$20/mo', perplexity: '$20/mo', gemini: '$20/mo' },
    { feature: 'AI Models', cryonex: '50+', chatgpt: '2-3', perplexity: '1', gemini: '1' },
    { feature: 'Study Tools', cryonex: '✅', chatgpt: '❌', perplexity: '❌', gemini: '❌' },
    { feature: 'Image Gen', cryonex: '✅', chatgpt: '✅', perplexity: '❌', gemini: '✅' },
    { feature: 'Free Tier', cryonex: '✅ Generous', chatgpt: 'Limited', perplexity: 'Limited', gemini: 'Limited' },
    { feature: 'Open Source', cryonex: '✅', chatgpt: '❌', perplexity: '❌', gemini: '❌' },
];

const NewLandingPage = () => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [showDemo, setShowDemo] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
    const heroY = useTransform(scrollY, [0, 500], [0, 100]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const cards = document.getElementsByClassName('spotlight-card');
            for (const card of cards) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
                (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
            }
        };
        window.addEventListener('mousemove', handleMouseMove);

        const observerOptions = { threshold: 0.1, rootMargin: "0px" };
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
            });
        }, observerOptions);
        document.querySelectorAll('.reveal').forEach(el => observerRef.current?.observe(el));

        const prefetchTimeout = setTimeout(async () => {
            try {
                await import("./App");
                await import("./MediaStudio");
            } catch (e) { }
        }, 2500);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            observerRef.current?.disconnect();
            clearTimeout(prefetchTimeout);
        };
    }, []);

    return (
        <div className="text-slate-400 selection:bg-purple-500/30 selection:text-white relative bg-[#030005] overflow-x-hidden font-sans min-h-screen">
            <style>{`
                .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.5, 0, 0, 1); }
                .reveal.active { opacity: 1; transform: translateY(0); }
                .spotlight-card { position: relative; background: rgba(255, 255, 255, 0.02); overflow: hidden; }
                .spotlight-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.06), transparent 40%); opacity: 0; transition: opacity 0.5s; pointer-events: none; z-index: 2; }
                .spotlight-card:hover::before { opacity: 1; }
                .text-gradient { background: linear-gradient(135deg, #c084fc 0%, #6366f1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                .glow-purple { box-shadow: 0 0 60px rgba(168, 85, 247, 0.3); }
                .bento-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 1.5rem; }
                @media (min-width: 768px) { .bento-grid { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 300px); } }
                .bento-item-1 { grid-column: span 1; grid-row: span 2; }
                .bento-item-2 { grid-column: span 2; grid-row: span 1; }
                .bento-item-3 { grid-column: span 1; grid-row: span 1; }
                .bento-item-4 { grid-column: span 1; grid-row: span 1; }
            `}</style>

            {/* Demo Modal */}
            {showDemo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl bg-[#0A0A0B] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                            <h3 className="text-white font-medium">See Cryonex in Action</h3>
                            <button onClick={() => setShowDemo(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="aspect-video bg-black flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/10">
                                    <Play className="w-8 h-8 text-white fill-white" />
                                </div>
                                <p className="text-white font-medium text-lg">Demo Coming Soon</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Background Shader */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Base Layer: Cosmic Nebula */}
                <div className="absolute inset-0 z-0">
                    <NeoCosmicShader />
                </div>
                {/* Top Layer: 3D Elements (Transparent) */}
                <div className="absolute inset-0 z-10">
                    <Neo3DShader />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030005]/50 to-[#030005] z-20" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-[#030005]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">C</div>
                        <span className="font-bold text-white text-lg tracking-tight">Cryonex</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#vision" className="hover:text-white transition-colors">Vision</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/auth" className="text-sm text-white/60 hover:text-white px-4 py-2 transition-colors">Log in</Link>
                        <Link to="/auth" className="text-sm bg-white text-black px-5 py-2 rounded-full font-semibold hover:bg-white/90 transition-all hover:scale-105 shadow-lg shadow-white/10">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 min-h-screen flex items-center justify-center overflow-hidden">
                <motion.div
                    style={{ opacity: heroOpacity, y: heroY }}
                    className="max-w-7xl mx-auto px-6 relative z-10 text-center"
                >
                    {/* Status Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md mb-8"
                    >
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                        </span>
                        <span className="text-xs font-medium text-purple-200">v2.0 Now Available</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-6xl sm:text-7xl md:text-9xl font-bold tracking-tighter mb-8 leading-[0.9]"
                    >
                        <span className="text-white drop-shadow-2xl">Think Different.</span><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient-x drop-shadow-2xl">Build Faster.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
                    >
                        The all-in-one AI workspace. Chat with top models, generate stunning media, and master new subjects with built-in study tools.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20"
                    >
                        <Link to="/auth" className="px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]">
                            Start Creating Free <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button onClick={() => setShowDemo(true)} className="px-8 py-4 border border-white/20 bg-white/5 backdrop-blur-sm text-white font-medium text-lg rounded-full hover:bg-white/10 transition-all flex items-center gap-2">
                            <Play className="w-4 h-4 fill-white" /> Watch Demo
                        </button>
                    </motion.div>

                    {/* Feature Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="grid grid-cols-3 gap-12 max-w-2xl mx-auto border-t border-white/10 pt-12"
                    >
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">50+</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">AI Models</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">∞</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Generations</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">4.9</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">User Rating</div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Vision Section */}
            <section id="vision" className="py-32 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="reveal">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                One Interface. <br />
                                <span className="text-purple-400">Infinite Possibilities.</span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                We believe AI shouldn't be fragmented. Why switch between ChatGPT for text, Midjourney for images, and Perplexity for search? Cryonex unifies them all into a single, cohesive workflow.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Unified Chat History across all models",
                                    "Seamless switching between GPT-4, Claude 3, and Llama 3",
                                    "Integrated Media Studio for instant creation",
                                    "Context-aware Study Tools for deep learning"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300">
                                        <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-purple-400" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative reveal">
                            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-[2rem] blur-2xl opacity-20" />
                            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#0A0A0B] shadow-2xl">
                                <div className="aspect-square md:aspect-[4/3] bg-gradient-to-br from-[#1a1a1a] to-black p-8 flex flex-col">
                                    {/* Mock UI Interface */}
                                    <div className="flex-1 rounded-xl bg-[#0A0A0B] border border-white/5 p-4 space-y-4">
                                        <div className="flex gap-2">
                                            <div className="h-3 w-3 rounded-full bg-red-500/20" />
                                            <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
                                            <div className="h-3 w-3 rounded-full bg-green-500/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-3/4 rounded bg-white/10" />
                                            <div className="h-2 w-1/2 rounded bg-white/10" />
                                        </div>
                                        <div className="flex-1 rounded-lg bg-purple-500/5 border border-purple-500/10 flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-purple-500/50" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Bento Grid */}
            <section id="features" className="py-32 relative z-10 bg-gradient-to-b from-transparent to-[#0A0A0B]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20 reveal">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Everything You Need</h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">One platform for all your AI needs. No more switching between tools.</p>
                    </div>

                    <div className="bento-grid">
                        {/* Item 1: Smart Chat (Large Vertical) */}
                        <div className="bento-item-1 spotlight-card p-8 rounded-3xl border border-white/5 reveal group hover:border-white/20 transition-all bg-[#0A0A0B]/50 flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-6 shadow-lg">
                                <Brain className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Smart Chat</h3>
                            <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                                Access the world's most powerful models including GPT-4o, Claude 3.5 Sonnet, and Llama 3. Switch instantly to find the best model for your task.
                            </p>
                            <div className="mt-auto rounded-xl bg-black/40 border border-white/5 p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-300 font-bold">AI</div>
                                    <div className="h-2 w-24 rounded bg-white/10" />
                                </div>
                                <div className="space-y-2 pl-11">
                                    <div className="h-2 w-full rounded bg-white/5" />
                                    <div className="h-2 w-3/4 rounded bg-white/5" />
                                </div>
                            </div>
                        </div>

                        {/* Item 2: Creative Studio (Wide Horizontal) */}
                        <div className="bento-item-2 spotlight-card p-8 rounded-3xl border border-white/5 reveal group hover:border-white/20 transition-all bg-[#0A0A0B]/50 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6 shadow-lg">
                                    <ImageIcon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Creative Studio</h3>
                                <p className="text-slate-400 leading-relaxed max-w-lg">
                                    Generate stunning images, edit videos, and create assets with state-of-the-art diffusion models.
                                </p>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-pink-500/10 to-transparent" />
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
                                <div className="w-32 h-32 rounded-lg bg-pink-500/20 rotate-12 backdrop-blur-md border border-pink-500/30" />
                            </div>
                        </div>

                        {/* Item 3: Study Center */}
                        <div className="bento-item-3 spotlight-card p-8 rounded-3xl border border-white/5 reveal group hover:border-white/20 transition-all bg-[#0A0A0B]/50">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg">
                                <BookOpen className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Study Center</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Turn any document into flashcards and quizzes automatically.
                            </p>
                        </div>

                        {/* Item 4: Code & Dev */}
                        <div className="bento-item-4 spotlight-card p-8 rounded-3xl border border-white/5 reveal group hover:border-white/20 transition-all bg-[#0A0A0B]/50">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-6 shadow-lg">
                                <Code className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Developer Tools</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Generate, debug, and refactor code in any language.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 reveal">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Simple Pricing</h2>
                        <p className="text-slate-400 text-lg mb-10">Start free. Upgrade when you need more power.</p>

                        {/* Billing Toggle */}
                        <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                            <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}>Monthly</button>
                            <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}>
                                Yearly <span className="text-green-500 text-xs ml-1 font-bold">-20%</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {pricingPlans.map((plan, idx) => (
                            <div key={idx} className={`spotlight-card p-8 rounded-[2rem] border transition-all reveal flex flex-col ${plan.popular ? 'border-purple-500/50 bg-purple-500/5 scale-105 shadow-2xl shadow-purple-900/20 z-10' : 'border-white/10 bg-[#0A0A0B]/50'}`}>
                                {plan.popular && (
                                    <div className="inline-block px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-full mb-6 self-start tracking-wider">MOST POPULAR</div>
                                )}
                                <div className="mb-6">
                                    <plan.icon className={`w-12 h-12 mb-6 ${plan.popular ? 'text-purple-400' : 'text-white/40'}`} />
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                    <p className="text-slate-400 text-sm">{plan.description}</p>
                                </div>

                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-5xl font-bold text-white">{billingCycle === 'yearly' && plan.price !== '$0' ? `$${Math.floor(parseInt(plan.price.replace('$', '')) * 0.8)}` : plan.price}</span>
                                    <span className="text-slate-500 font-medium">{plan.period}</span>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-3 text-sm">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-slate-400'}`}>
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className="text-slate-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link to="/auth" className={`block w-full py-4 rounded-xl text-center font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${plan.popular ? 'bg-white text-black hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section id="compare" className="py-32 relative z-10">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16 reveal">
                        <h2 className="text-4xl font-bold text-white mb-4">Why Cryonex?</h2>
                        <p className="text-slate-400 text-lg">See how we stack up against the competition</p>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0B]/50 backdrop-blur-sm reveal">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="text-left py-6 px-6 text-slate-400 font-medium w-1/4">Feature</th>
                                        <th className="py-6 px-6 text-white font-bold bg-purple-500/10 w-1/4 text-lg">Cryonex</th>
                                        <th className="py-6 px-6 text-slate-400 w-1/6">ChatGPT</th>
                                        <th className="py-6 px-6 text-slate-400 w-1/6">Perplexity</th>
                                        <th className="py-6 px-6 text-slate-400 w-1/6">Gemini</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonData.map((row, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-5 px-6 text-slate-300 font-medium">{row.feature}</td>
                                            <td className="py-5 px-6 text-center text-white font-bold bg-purple-500/5">{row.cryonex}</td>
                                            <td className="py-5 px-6 text-center text-slate-500">{row.chatgpt}</td>
                                            <td className="py-5 px-6 text-center text-slate-500">{row.perplexity}</td>
                                            <td className="py-5 px-6 text-center text-slate-500">{row.gemini}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative z-10">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <div className="p-16 rounded-[3rem] bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 reveal relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
                        <div className="relative z-10">
                            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">Ready to Build?</h2>
                            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">Join thousands of creators, students, and professionals using Cryonex today.</p>
                            <Link to="/auth" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                                Get Started Free <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 relative z-10 bg-[#030005]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold">C</div>
                            <span className="font-bold text-white">Cryonex</span>
                        </div>
                        <div className="flex gap-8 text-sm text-slate-500 font-medium">
                            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">GitHub</a>
                        </div>
                        <div className="text-sm text-slate-600">© 2025 Cryonex. All rights reserved.</div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default NewLandingPage;