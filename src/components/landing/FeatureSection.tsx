import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureSectionProps {
    title: string;
    description: string;
    image: string;
    icon?: LucideIcon | React.ComponentType<{ className?: string }>;
    reversed?: boolean;
    gradient?: string;
}

export function FeatureSection({ title, description, image, icon: Icon, reversed = false, gradient = "from-purple-500/20 to-cyan-500/20" }: FeatureSectionProps) {
    return (
        <section className="relative py-24 md:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className={cn("flex flex-col gap-16 items-center", reversed ? "md:flex-row-reverse" : "md:flex-row")}>

                    {/* Content Side */}
                    <div className="flex-1 relative z-10">
                        <ScrollReveal variant={reversed ? "fade-left" : "fade-right"}>
                            <div className="relative">
                                {/* Glow Effect */}
                                <div className={cn("absolute -inset-4 bg-gradient-to-r blur-3xl opacity-20 rounded-full", gradient)} />

                                <div className="relative bg-white/[0.03] border border-white/10 backdrop-blur-xl p-8 md:p-12 rounded-3xl">
                                    {Icon && (
                                        <div className="inline-flex p-4 rounded-2xl bg-white/5 mb-6 border border-white/5 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                            <Icon className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                        </div>
                                    )}
                                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                        {title}
                                    </h2>
                                    <p className="text-lg text-white/60 leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Image/Visual Side */}
                    <div className="flex-1 w-full">
                        <ScrollReveal variant="scale-up">
                            <div className="relative group aspect-video md:aspect-square rounded-3xl overflow-hidden border border-white/10 bg-black/50">
                                <div className={cn("absolute inset-0 bg-gradient-to-tr opacity-20 group-hover:opacity-30 transition-opacity duration-700", gradient)} />
                                <img
                                    src={image}
                                    alt={title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>
    );
}
