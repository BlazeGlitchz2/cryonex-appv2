import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
    Terminal,
    Play,
    Cpu,
    Zap,
    Lock,
    Box,
    Cloud,
    Database,
    Triangle,
    Hexagon,
    Layers,
    Activity,
    Shield,
    GitBranch,
    Twitter,
    Github,
    X,
    Check
} from 'lucide-react';

const TypewriterTerminal = () => {
    const [lines, setLines] = useState<{ type: string, text: string }[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);

    const script = [
        { type: 'cmd', text: 'cryonex init project-alpha' },
        { type: 'output', text: 'Initializing environment...' },
        { type: 'output', text: 'Resolving dependencies...' },
        { type: 'success', text: '✓ Done in 143ms' },
        { type: 'cmd', text: 'cryonex model --select gpt-4' },
        { type: 'output', text: 'Context window set to 128k tokens.' },
        { type: 'output', text: 'Temperature: 0.7' },
        { type: 'cmd', text: 'generate component ' },
    ];

    useEffect(() => {
        if (currentLineIndex >= script.length) return;

        const currentScriptLine = script[currentLineIndex];

        if (currentScriptLine.type === 'cmd') {
            if (currentCharIndex < currentScriptLine.text.length) {
                const timeout = setTimeout(() => {
                    setLines(prev => {
                        const newLines = [...prev];
                        if (newLines[currentLineIndex]) {
                            newLines[currentLineIndex].text = currentScriptLine.text.substring(0, currentCharIndex + 1);
                        } else {
                            newLines.push({ type: 'cmd', text: currentScriptLine.text.substring(0, 1) });
                        }
                        return newLines;
                    });
                    setCurrentCharIndex(prev => prev + 1);
                }, 50 + Math.random() * 50); // Random typing speed
                return () => clearTimeout(timeout);
            } else {
                // Line finished
                const timeout = setTimeout(() => {
                    setCurrentLineIndex(prev => prev + 1);
                    setCurrentCharIndex(0);
                }, 500);
                return () => clearTimeout(timeout);
            }
        } else {
            // Output lines appear instantly or quickly
            const timeout = setTimeout(() => {
                setLines(prev => [...prev, currentScriptLine]);
                setCurrentLineIndex(prev => prev + 1);
            }, 200);
            return () => clearTimeout(timeout);
        }
    }, [currentLineIndex, currentCharIndex]);

    return (
        <div className="bg-[#0e0e10] rounded-xl border border-white/10 shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-500 h-[320px] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">user@cryonex-cli ~</div>
            </div>
            <div className="p-6 font-mono text-sm space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                {lines.map((line, i) => (
                    <div key={i} className={`${line.type === 'output' ? 'text-slate-400 pl-6' : ''} ${line.type === 'success' ? 'text-green-400 pl-6' : ''}`}>
                        {line.type === 'cmd' && (
                            <div className="flex gap-3">
                                <span className="text-green-400">➜</span>
                                <span className="text-white">{line.text}</span>
                            </div>
                        )}
                        {line.type !== 'cmd' && line.text}
                    </div>
                ))}
                {currentLineIndex < script.length && script[currentLineIndex].type === 'cmd' && (
                    <div className="flex gap-3">
                        <span className="text-green-400">➜</span>
                        <span className="text-white flex items-center">
                            {lines[currentLineIndex]?.text || ''}
                            <span className="w-2 h-5 bg-white/50 animate-pulse ml-1"></span>
                        </span>
                    </div>
                )}
                {currentLineIndex >= script.length && (
                    <div className="flex gap-3">
                        <span className="text-green-400">➜</span>
                        <span className="text-white flex items-center">
                            <span className="w-2 h-5 bg-white/50 animate-pulse ml-1"></span>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

const NewLandingPage = () => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [showDemo, setShowDemo] = useState(false);

    useEffect(() => {
        // Mouse Spotlight Effect
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

        // Scroll Reveal
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px"
        };

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observerRef.current?.observe(el));

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
        }, 2500); // Start prefetching after 2.5s to prioritize landing page load

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            observerRef.current?.disconnect();
            clearTimeout(prefetchTimeout);
        };
    }, []);

    return (
        <div className="text-slate-400 selection:bg-cryonex-purple/30 selection:text-white relative bg-[#030304] overflow-x-hidden font-sans min-h-screen">
            <style>{`
        /* 3D Transform Utilities */
        .perspective-1000 { perspective: 1000px; }
        .perspective-2000 { perspective: 2000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        
        /* Isometric Layer Stack */
        .iso-card {
            transform: rotateX(60deg) rotateZ(-45deg) rotateY(0deg);
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: -20px 20px 60px rgba(0,0,0,0.5);
        }
        
        .iso-card:hover {
            transform: rotateX(60deg) rotateZ(-45deg) translateZ(20px);
        }

        .iso-layer {
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .group:hover .iso-layer-1 { transform: translateZ(20px); }
        .group:hover .iso-layer-2 { transform: translateZ(60px); }
        .group:hover .iso-layer-3 { transform: translateZ(100px); }

        /* Mouse Spotlight Effect */
        .spotlight-card {
            position: relative;
            background: rgba(255, 255, 255, 0.02);
            overflow: hidden;
        }
        
        .spotlight-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.06), transparent 40%);
            opacity: 0;
            transition: opacity 0.5s;
            pointer-events: none;
            z-index: 2;
        }

        .spotlight-card:hover::before {
            opacity: 1;
        }

        .spotlight-border {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 1px;
            background: radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.3), transparent 40%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s;
        }
        
        .spotlight-card:hover .spotlight-border {
            opacity: 1;
        }

        /* Glassmorphism */
        .glass {
            background: rgba(10, 10, 12, 0.7);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Scanline Animation */
        .scanline {
            position: absolute;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(20, 241, 149, 0.5), transparent);
            animation: scan 3s linear infinite;
            box-shadow: 0 0 15px rgba(20, 241, 149, 0.3);
        }

        /* Scroll Reveal */
        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
        }
        
        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 2px;
        }
      `}</style>

            {/* Demo Modal */}
            {showDemo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-4xl bg-[#0A0A0B] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                            <h3 className="text-white font-medium">Cryonex Demo</h3>
                            <button
                                onClick={() => setShowDemo(false)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="aspect-video bg-black flex items-center justify-center relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-cryonex-purple/20 to-cryonex-teal/20 opacity-20"></div>
                            <div className="text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/10">
                                    <Play className="w-8 h-8 text-white fill-white" />
                                </div>
                                <p className="text-white font-medium text-lg">Interactive Demo Coming Soon</p>
                                <p className="text-slate-500 text-sm mt-2">We are putting the finishing touches on our showcase.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Background FX */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:32px_32px] opacity-[0.07]"></div>
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cryonex-purple/10 rounded-full blur-[100px] animate-pulse-glow"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cryonex-teal/5 rounded-full blur-[100px] animate-float"></div>
                {/* Floating Particles */}
                <div className="absolute top-20 right-20 w-2 h-2 bg-white/10 rounded-full animate-float"></div>
                <div className="absolute bottom-40 left-10 w-3 h-3 bg-white/5 rounded-full animate-float-delayed"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative w-8 h-8 flex items-center justify-center transition-transform group-hover:rotate-90 duration-700">
                            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                            <div className="absolute inset-0 bg-cryonex-purple/20 blur-lg rounded-full"></div>
                        </div>
                        <span className="font-semibold text-white tracking-tight text-sm">Cryonex</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
                        <a href="#features" className="px-4 py-1.5 text-xs font-medium text-white bg-white/10 rounded-full shadow-sm transition-all">Product</a>
                        <a href="#engine" className="px-4 py-1.5 text-xs font-medium hover:text-white transition-colors">Engine</a>
                        <a href="#security" className="px-4 py-1.5 text-xs font-medium hover:text-white transition-colors">Security</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-500 border border-white/5 px-2 py-1 rounded bg-black/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            SYSTEM ONLINE
                        </div>
                        <Link to="/playground" className="relative group px-4 py-2 text-xs font-semibold text-white rounded bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-r from-cryonex-purple/20 to-cryonex-teal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <span className="relative z-10 flex items-center gap-2">Console <Terminal className="w-3 h-3" /></span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden perspective-2000">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Hero Content */}
                    <div className="relative z-20 reveal active">
                        {/* Status Chip */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cryonex-purple/30 bg-cryonex-purple/10 backdrop-blur-sm mb-8 animate-float-fast cursor-pointer hover:bg-cryonex-purple/20 transition-colors">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cryonex-purple opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cryonex-purple"></span>
                            </span>
                            <span className="text-[10px] font-bold text-white tracking-wide uppercase">New: Llama 3 Integration</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-semibold text-white tracking-tighter leading-[1] mb-8">
                            Build <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-500">Without</span> <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-cryonex-purple to-cryonex-teal">Boundaries.</span>
                        </h1>

                        <p className="text-lg text-slate-400 max-w-lg mb-10 leading-relaxed font-light border-l border-white/10 pl-6">
                            Orchestrate multiple AI models in a single fluid interface. The first development environment designed for non-linear intelligence.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <Link to="/auth" className="relative px-8 py-4 bg-white text-black font-semibold text-sm rounded-full overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-1">
                                <span className="relative z-10">Start Deploying</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>

                            <button
                                onClick={() => setShowDemo(true)}
                                className="group relative px-8 py-4 rounded-full border border-white/10 text-white font-medium text-sm hover:bg-white/5 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cryonex-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="flex items-center gap-2">
                                    <Play className="w-3 h-3 fill-current" /> Demo Video
                                </span>
                            </button>
                        </div>

                        {/* Floating Code Snippet */}
                        <div className="mt-12 absolute -right-20 top-full hidden lg:block animate-float-delayed glass p-4 rounded-lg border border-white/10 max-w-xs rotate-6 hover:rotate-0 transition-transform duration-500">
                            <div className="flex gap-1.5 mb-3">
                                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                            </div>
                            <div className="font-mono text-[10px] text-slate-300">
                                <span className="text-cryonex-purple">const</span> intelligence = <span className="text-cryonex-teal">new</span> Cryonex();<br />
                                <span className="text-blue-400">await</span> intelligence.<span className="text-yellow-300">transcend</span>();
                            </div>
                        </div>
                    </div>

                    {/* 3D Interactive Stack */}
                    <div className="relative h-[600px] flex items-center justify-center transform-style-3d group perspective-1000">
                        <div className="relative w-64 h-64 md:w-80 md:h-80 transition-transform duration-700 ease-out transform group-hover:rotate-x-[10deg] group-hover:rotate-y-[10deg]">

                            {/* Back Layer (Data) */}
                            <div className="absolute inset-0 bg-[#0A0A0B] border border-white/10 rounded-2xl iso-layer iso-layer-1 flex items-center justify-center shadow-2xl opacity-60">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:32px_32px] opacity-20"></div>
                                <div className="font-mono text-xs text-slate-600">RAW DATA LAYER</div>
                            </div>

                            {/* Middle Layer (Processing) */}
                            <div className="absolute inset-0 bg-[#0F0F11] border border-white/10 rounded-2xl iso-layer iso-layer-2 flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm transform translate-z-10 opacity-80 overflow-hidden">
                                <div className="scanline top-1/4"></div>
                                <Cpu className="w-16 h-16 text-cryonex-purple mb-2 animate-pulse" />
                                <div className="font-mono text-xs text-cryonex-purple">PROCESSING...</div>
                            </div>

                            {/* Front Layer (Interface) */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1e] to-[#0A0A0B] border border-white/20 rounded-2xl iso-layer iso-layer-3 flex flex-col p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform translate-z-20">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex gap-2">
                                        <div className="w-8 h-1 rounded-full bg-white/20"></div>
                                        <div className="w-4 h-1 rounded-full bg-white/10"></div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-cryonex-teal shadow-[0_0_10px_#14F195]"></div>
                                </div>
                                <div className="space-y-3 flex-1">
                                    <div className="h-2 w-3/4 bg-white/10 rounded animate-pulse"></div>
                                    <div className="h-2 w-1/2 bg-white/10 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="h-2 w-full bg-white/5 rounded"></div>
                                </div>

                                {/* Floating elements around the stack */}
                                <div className="absolute -right-12 top-10 bg-black/80 backdrop-blur border border-white/10 p-3 rounded-lg shadow-xl animate-float">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div className="absolute -left-8 bottom-20 bg-black/80 backdrop-blur border border-white/10 p-3 rounded-lg shadow-xl animate-float-delayed">
                                    <Lock className="w-5 h-5 text-cryonex-teal" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Logo Marquee */}
            <section className="border-y border-white/5 bg-white/[0.01] overflow-hidden py-10 relative">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#030304] to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#030304] to-transparent z-10"></div>

                <div className="flex w-[200%] animate-marquee">
                    <div className="flex gap-20 items-center justify-around w-full opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex items-center gap-2"><Box className="w-6 h-6" /><span className="font-bold tracking-tight">Vercel</span></div>
                        <div className="flex items-center gap-2"><Cloud className="w-6 h-6" /><span className="font-bold tracking-tight">Stripe</span></div>
                        <div className="flex items-center gap-2"><Database className="w-6 h-6" /><span className="font-bold tracking-tight">Supabase</span></div>
                        <div className="flex items-center gap-2"><Triangle className="w-6 h-6" /><span className="font-bold tracking-tight">Prisma</span></div>
                        <div className="flex items-center gap-2"><Hexagon className="w-6 h-6" /><span className="font-bold tracking-tight">Node.js</span></div>
                        <div className="flex items-center gap-2"><Layers className="w-6 h-6" /><span className="font-bold tracking-tight">Raycast</span></div>
                        {/* Duplicate for loop */}
                        <div className="flex items-center gap-2"><Box className="w-6 h-6" /><span className="font-bold tracking-tight">Vercel</span></div>
                        <div className="flex items-center gap-2"><Cloud className="w-6 h-6" /><span className="font-bold tracking-tight">Stripe</span></div>
                        <div className="flex items-center gap-2"><Database className="w-6 h-6" /><span className="font-bold tracking-tight">Supabase</span></div>
                        <div className="flex items-center gap-2"><Triangle className="w-6 h-6" /><span className="font-bold tracking-tight">Prisma</span></div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features (Interactive) */}
            <section id="features" className="py-32 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-20">
                        <h2 className="text-4xl font-semibold text-white tracking-tight mb-4 reveal">
                            Supercharged <br /><span className="text-slate-500">Infrastructure.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Large Card */}
                        <div className="md:col-span-2 row-span-2 spotlight-card rounded-3xl p-1 border border-white/10 group reveal">
                            <div className="spotlight-border"></div>
                            <div className="bg-cryonex-card h-full rounded-[20px] p-8 relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-50 transition-opacity">
                                    <Activity className="w-24 h-24 text-white" />
                                </div>

                                <div className="relative z-10 mb-8">
                                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-semibold text-white mb-2">Real-time Inference</h3>
                                    <p className="text-slate-400 text-sm max-w-sm">Global edge network ensures your prompts are processed with &lt; 50ms latency anywhere in the world.</p>
                                </div>

                                {/* Animated Graph */}
                                <div className="mt-auto h-48 w-full bg-white/5 rounded-xl border border-white/5 relative overflow-hidden group-hover:border-white/10 transition-colors">
                                    <div className="absolute inset-0 flex items-end justify-between px-4 pb-0 gap-1 opacity-60">
                                        {/* Bars that grow on hover */}
                                        <div className="w-full bg-cryonex-purple/40 h-[30%] rounded-t-sm transition-all duration-500 group-hover:h-[60%]"></div>
                                        <div className="w-full bg-cryonex-purple/30 h-[50%] rounded-t-sm transition-all duration-500 group-hover:h-[80%] delay-75"></div>
                                        <div className="w-full bg-cryonex-teal/40 h-[40%] rounded-t-sm transition-all duration-500 group-hover:h-[50%] delay-100"></div>
                                        <div className="w-full bg-cryonex-teal/30 h-[70%] rounded-t-sm transition-all duration-500 group-hover:h-[90%] delay-150"></div>
                                        <div className="w-full bg-white/20 h-[30%] rounded-t-sm transition-all duration-500 group-hover:h-[40%] delay-200"></div>
                                    </div>
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 animate-scan"></div>
                                </div>
                            </div>
                        </div>

                        {/* Side Card 1 */}
                        <div className="spotlight-card rounded-3xl p-1 border border-white/10 group reveal h-[300px]">
                            <div className="spotlight-border"></div>
                            <div className="bg-cryonex-card h-full rounded-[20px] p-8 relative overflow-hidden">
                                <Shield className="w-10 h-10 text-white mb-4 group-hover:text-cryonex-teal transition-colors" />
                                <h3 className="text-lg font-semibold text-white mb-2">Enterprise Guardrails</h3>
                                <p className="text-slate-400 text-xs">PII redaction and custom moderation filters enabled by default.</p>

                                <div className="absolute bottom-6 right-6">
                                    <div className="flex -space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-black flex items-center justify-center text-[10px] text-white">🔒</div>
                                        <div className="w-8 h-8 rounded-full bg-slate-700 border border-black flex items-center justify-center text-[10px] text-white">🔑</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side Card 2 */}
                        <div className="spotlight-card rounded-3xl p-1 border border-white/10 group reveal h-[300px]">
                            <div className="spotlight-border"></div>
                            <div className="bg-cryonex-card h-full rounded-[20px] p-8 relative overflow-hidden">
                                <GitBranch className="w-10 h-10 text-white mb-4 group-hover:rotate-180 transition-transform duration-700" />
                                <h3 className="text-lg font-semibold text-white mb-2">Version Control</h3>
                                <p className="text-slate-400 text-xs">Rollback prompt chains instantly. Branch production flows safely.</p>

                                <div className="mt-6 space-y-2">
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-2/3 bg-cryonex-purple"></div>
                                    </div>
                                    <div className="h-1.5 w-2/3 bg-white/10 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Terminal/Playground */}
            <section className="py-20 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cryonex-teal/5 blur-[100px] pointer-events-none"></div>

                <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-12 items-center">
                    <div className="flex-1 reveal">
                        <h2 className="text-3xl md:text-5xl font-semibold text-white mb-6">Designed for <br />Flow State.</h2>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cryonex-teal group-hover:text-black transition-colors">1</div>
                                <span className="text-slate-400 group-hover:text-white transition-colors">Connect Data Sources</span>
                            </li>
                            <li className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cryonex-purple group-hover:text-white transition-colors">2</div>
                                <span className="text-slate-400 group-hover:text-white transition-colors">Configure Model Parameters</span>
                            </li>
                            <li className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">3</div>
                                <span className="text-slate-400 group-hover:text-white transition-colors">Deploy to Production</span>
                            </li>
                        </ul>
                    </div>

                    {/* Terminal Window */}
                    <div className="flex-1 w-full reveal delay-200">
                        <TypewriterTerminal />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div className="space-y-2 group cursor-default">
                        <div className="text-4xl font-bold text-white group-hover:text-cryonex-purple transition-colors">99.9%</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">Uptime</div>
                    </div>
                    <div className="space-y-2 group cursor-default">
                        <div className="text-4xl font-bold text-white group-hover:text-cryonex-teal transition-colors">50ms</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">Latency</div>
                    </div>
                    <div className="space-y-2 group cursor-default">
                        <div className="text-4xl font-bold text-white group-hover:text-blue-400 transition-colors">10k+</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">Developers</div>
                    </div>
                    <div className="space-y-2 group cursor-default">
                        <div className="text-4xl font-bold text-white group-hover:text-pink-400 transition-colors">24/7</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">Support</div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 relative overflow-hidden">
                {/* Rotating gradient behind */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[600px] h-[600px] bg-gradient-to-r from-cryonex-purple/20 to-cryonex-teal/20 rounded-full blur-[120px] animate-spin-slow opacity-50"></div>
                </div>

                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-5xl md:text-7xl font-semibold text-white tracking-tight mb-8 reveal">
                        Ready to optimize your <br />intelligence layer?
                    </h2>
                    <p className="text-slate-400 text-lg mb-12 reveal delay-100">Join the waitlist today. No credit card required.</p>

                    <form className="max-w-md mx-auto relative reveal delay-200 group">
                        <input type="email" placeholder="enter@your.email" className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder-slate-500 outline-none focus:border-cryonex-purple/50 transition-colors pr-32" />
                        <button type="button" className="absolute right-2 top-2 bottom-2 bg-white text-black px-6 rounded-full font-medium hover:scale-105 transition-transform">
                            Join
                        </button>
                        {/* Glowing border effect on focus */}
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cryonex-purple to-cryonex-teal opacity-0 group-focus-within:opacity-20 blur transition-opacity -z-10"></div>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#020202] pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                                <span className="text-white font-semibold">Cryonex</span>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all"><Twitter className="w-4 h-4" /></a>
                                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all"><Github className="w-4 h-4" /></a>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
                        <p>© 2024 Cryonex Inc. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link to="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-slate-400">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default NewLandingPage;
