import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePerformanceStore } from '@/lib/stores/performance-store';

interface Interactive3DCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

export function Interactive3DCard({ title, description, icon }: Interactive3DCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const shouldDisableEffects = usePerformanceStore(state => state.shouldDisableHeavyEffects());

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (shouldDisableEffects || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateXValue = ((y - centerY) / centerY) * -10; // Max 10 degrees
        const rotateYValue = ((x - centerX) / centerX) * 10;

        setRotateX(rotateXValue);
        setRotateY(rotateYValue);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transformStyle: "preserve-3d",
                rotateX: shouldDisableEffects ? 0 : rotateX,
                rotateY: shouldDisableEffects ? 0 : rotateY,
            }}
            className="relative w-full h-[400px] rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-md transition-transform duration-200 ease-out group"
        >
            <div style={{ transform: shouldDisableEffects ? "none" : "translateZ(50px)" }} className="absolute top-8 left-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-500/20">
                    {icon}
                </div>
            </div>

            <div style={{ transform: shouldDisableEffects ? "none" : "translateZ(30px)" }} className="absolute bottom-8 left-8 right-8">
                <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">{title}</h3>
                <p className="text-white/60 leading-relaxed">{description}</p>
            </div>

            {/* Glow Effect - Disabled in Lite/Reduced Motion */}
            {!shouldDisableEffects && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            )}
        </motion.div>
    );
}
