import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Plus, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router';

export function QuickCaptureBar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleImpact = async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                await Haptics.impact({ style: ImpactStyle.Light });
            }
        } catch (e) { }
    };

    const toggleOpen = () => {
        handleImpact();
        setIsOpen(!isOpen);
    };

    const actions = [
        {
            id: 'scan',
            label: 'Scan Note',
            icon: Camera,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            onClick: () => {
                handleImpact();
                navigate('/app/dashboard?action=scan');
                setIsOpen(false);
            }
        },
        {
            id: 'voice',
            label: 'Voice Memo',
            icon: Mic,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            onClick: () => {
                handleImpact();
                navigate('/app/dashboard?action=voice');
                setIsOpen(false);
            }
        },
        {
            id: 'ai-chat',
            label: 'Turbo AI Focus',
            icon: Sparkles,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
            onClick: () => {
                handleImpact();
                navigate('/app');
                setIsOpen(false);
            }
        }
    ];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity"
                    />
                )}
            </AnimatePresence>

            <div className="fixed bottom-0 left-0 right-0 z-[70] pb-[calc(env(safe-area-inset-bottom,16px)+16px)] px-4 pointer-events-none flex justify-center">
                <div className="relative pointer-events-auto">
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                                className="absolute bottom-full mb-4 right-1/2 translate-x-1/2 flex flex-col gap-3 min-w-[220px]"
                            >
                                {actions.map((action, idx) => (
                                    <motion.button
                                        key={action.id}
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={action.onClick}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-[1.25rem] border overflow-hidden group touch-feedback",
                                            "border-white/[0.08] hover:border-white/[0.2] bg-[#121217]/95 backdrop-blur-2xl shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

                                        <div className={cn("w-11 h-11 rounded-[0.85rem] flex items-center justify-center border shadow-inner", action.bg, action.border)}>
                                            <action.icon className={cn("w-[22px] h-[22px]", action.color)} />
                                        </div>
                                        <span className="text-[15px] font-semibold text-white tracking-wide">{action.label}</span>
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleOpen}
                        className={cn(
                            "flex items-center justify-center w-[60px] h-[60px] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] border",
                            "transition-all duration-300 backdrop-blur-2xl relative overflow-hidden group haptic-press",
                            isOpen
                                ? "bg-white/10 border-white/20 rotate-45"
                                : "bg-gradient-to-br from-cyan-500 via-primary to-purple-600 border-white/30 hover:shadow-cyan-400/25 hover:border-white/50"
                        )}
                    >
                        {isOpen ? (
                            <X className="w-7 h-7 text-white" />
                        ) : (
                            <Plus className="w-8 h-8 text-white drop-shadow-md" />
                        )}
                    </motion.button>
                </div>
            </div>
        </>
    );
}
