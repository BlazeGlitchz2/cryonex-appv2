import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, X, Sparkles, Ban } from "lucide-react"; // Import Ban icon
import { cn } from "@/lib/utils";

export interface TourStep {
    targetId: string;
    title: string;
    description: string;
    position?: "top" | "bottom" | "left" | "right";
}

interface OnboardingTourProps {
    steps: TourStep[];
    tourId: string;
}

export function OnboardingTour({ steps, tourId }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        // Check if specific tour has been seen
        const seen = localStorage.getItem(`cryonex_tour_seen_${tourId}`);
        const userOptOut = localStorage.getItem(`cryonex_tour_opt_out`);

        if (!seen && !userOptOut) {
            // Small delay to ensure UI is ready
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [tourId]);

    useEffect(() => {
        if (!isVisible) return;

        const updateRect = () => {
            const step = steps[currentStep];
            if (!step) return;

            const element = document.getElementById(step.targetId);

            if (element) {
                // Scroll element into view if needed
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                setTargetRect(element.getBoundingClientRect());
            } else {
                // Skip if element not found
                // console.warn(`Tour target ${step.targetId} not found`);
            }
        };

        updateRect();
        window.addEventListener("resize", updateRect);
        window.addEventListener("scroll", updateRect, true);

        return () => {
            window.removeEventListener("resize", updateRect);
            window.removeEventListener("scroll", updateRect, true);
        };
    }, [currentStep, isVisible, steps]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        localStorage.setItem(`cryonex_tour_seen_${tourId}`, "true");
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleDontShowAgain = () => {
        setIsVisible(false);
        localStorage.setItem(`cryonex_tour_opt_out`, "true");
        // Also mark this specific tour as seen just in case
        localStorage.setItem(`cryonex_tour_seen_${tourId}`, "true");
    };

    if (!isVisible || !targetRect) return null;

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    // Window dimensions for boundary clamping
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate tooltip position
    const getTooltipPosition = () => {
        const gap = 16;
        const tooltipWidth = 280;
        const tooltipHeight = 240; // Increased approximate height for new button
        const padding = 20; // Minimum distance from screen edge

        let top = 0;
        let left = 0;

        switch (step.position) {
            case "right":
                top = targetRect.top + targetRect.height / 2 - 80;
                left = targetRect.right + gap;
                break;
            case "bottom":
                top = targetRect.bottom + gap;
                left = targetRect.left + targetRect.width / 2 - (tooltipWidth / 2);
                break;
            case "left":
                top = targetRect.top;
                left = targetRect.left - tooltipWidth - gap;
                break;
            case "top":
                top = targetRect.top - 160 - gap;
                left = targetRect.left;
                break;
            default:
                top = 0; left = 0;
        }

        // Horizontal Clamping
        if (left + tooltipWidth > windowWidth - padding) {
            left = windowWidth - tooltipWidth - padding;
        }
        if (left < padding) {
            left = padding;
        }

        // Vertical Clamping
        if (top + tooltipHeight > windowHeight - padding) {
            top = windowHeight - tooltipHeight - padding;
        }
        if (top < padding) {
            top = padding;
        }

        return { top, left };
    };

    const tooltipPos = getTooltipPosition();

    // Padding around target
    const p = 8;
    const radius = 12;

    if (!isVisible || !targetRect) return null;

    return createPortal(
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[9999] pointer-events-none">
                    {/* Spotlight Mask */}
                    <svg className="absolute inset-0 w-full h-full opacity-50 text-black fill-current transition-all duration-500 ease-out">
                        <defs>
                            <mask id="spotlight-mask">
                                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                <motion.rect
                                    initial={false}
                                    animate={{
                                        x: targetRect.left - p,
                                        y: targetRect.top - p,
                                        width: targetRect.width + p * 2,
                                        height: targetRect.height + p * 2,
                                        rx: radius
                                    }}
                                    transition={{ type: "spring", stiffness: 200, damping: 30 }}
                                    fill="black"
                                />
                            </mask>
                        </defs>
                        <rect
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            mask="url(#spotlight-mask)"
                        />
                    </svg>

                    {/* Highlight Ring */}
                    <motion.div
                        className="absolute rounded-xl pointer-events-none"
                        initial={false}
                        animate={{
                            top: targetRect.top - p,
                            left: targetRect.left - p,
                            width: targetRect.width + p * 2,
                            height: targetRect.height + p * 2,
                        }}
                        transition={{ type: "spring", stiffness: 200, damping: 30 }}
                    >
                        <div className="absolute inset-0 rounded-xl border-2 border-primary/50 animate-pulse shadow-[0_0_30px_rgba(var(--primary),0.3)]" />
                    </motion.div>

                    {/* Tooltip */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            top: tooltipPos.top,
                            left: tooltipPos.left
                        }}
                        transition={{ type: "spring", stiffness: 250, damping: 25 }}
                        className="absolute pointer-events-auto w-[280px]"
                    >
                        <div className="relative bg-[#0A0A0B] border border-white/10 rounded-2xl shadow-2xl p-5 overflow-hidden backdrop-blur-3xl">
                            {/* Background gradient effect */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 blur-3xl rounded-full" />
                            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full" />

                            <div className="relative z-10 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                                            {currentStep + 1}
                                        </span>
                                        <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                                    </div>
                                    <button
                                        onClick={handleSkip}
                                        className="text-white/40 hover:text-white transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <p className="text-sm text-white/60 leading-relaxed">
                                    {step.description}
                                </p>

                                <div className="pt-2 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1.5">
                                            {steps.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "h-1 rounded-full transition-all duration-300",
                                                        idx === currentStep ? "w-4 bg-primary" : "w-1 bg-white/10"
                                                    )}
                                                />
                                            ))}
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={handleNext}
                                            className="h-8 rounded-lg bg-white text-black hover:bg-white/90 font-medium text-xs px-4"
                                        >
                                            {isLastStep ? (
                                                <span className="flex items-center gap-1.5">
                                                    Finish <Sparkles className="h-3 w-3" />
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5">
                                                    Next <ChevronRight className="h-3 w-3" />
                                                </span>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Don't Show Again Button */}
                                    <button
                                        onClick={handleDontShowAgain}
                                        className="w-full text-[10px] text-white/30 hover:text-white/60 transition-colors flex items-center justify-center gap-1.5 pt-2 border-t border-white/5 mt-2"
                                    >
                                        <Ban className="h-3 w-3" /> Don't show tutorials again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
