'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ScrollExpandMediaProps {
    mediaType?: 'video' | 'image';
    mediaSrc: string;
    posterSrc?: string;
    bgImageSrc: string;
    title?: string;
    date?: string;
    scrollToExpand?: string;
    textBlend?: boolean;
    children?: React.ReactNode;
}

const ScrollExpandMedia = ({
    mediaType = 'video',
    mediaSrc,
    posterSrc,
    bgImageSrc,
    title,
    date,
    scrollToExpand,
    textBlend,
    children,
}: ScrollExpandMediaProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    // Smooth out the scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Transform values based on scroll progress
    // 0 to 0.5: Expand media
    // 0.5 to 1.0: Show content

    // Media expansion
    const width = useTransform(smoothProgress, [0, 0.6], ['300px', '100vw']);
    const height = useTransform(smoothProgress, [0, 0.6], ['400px', '100vh']);
    const borderRadius = useTransform(smoothProgress, [0, 0.6], ['16px', '0px']);

    // Text movement
    // Text movement
    const textTranslateX = useTransform(smoothProgress, [0.6, 0.8], ['0%', '100%']);
    const textTranslateXNeg = useTransform(smoothProgress, [0.6, 0.8], ['0%', '-100%']);
    const textOpacity = useTransform(smoothProgress, [0.6, 0.8], [1, 0]);

    // Background opacity
    const bgOpacity = useTransform(smoothProgress, [0, 0.4], [1, 0]);

    // Content opacity
    const contentOpacity = useTransform(smoothProgress, [0.4, 0.8], [0, 1]);
    const contentY = useTransform(smoothProgress, [0.4, 0.8], [50, 0]);

    const firstWord = title ? title.split(' ')[0] : '';
    const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

    return (
        <div ref={containerRef} className="relative h-[300vh] w-full">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">

                {/* Background Image */}
                <motion.div
                    className="absolute inset-0 z-0"
                    style={{ opacity: bgOpacity }}
                >
                    <img
                        src={bgImageSrc}
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                </motion.div>

                {/* Expanding Media Container */}
                <motion.div
                    className="relative z-10 overflow-hidden shadow-2xl"
                    style={{
                        width,
                        height,
                        borderRadius,
                        maxWidth: useTransform(smoothProgress, [0, 0.6], ['90vw', '100vw']),
                        maxHeight: useTransform(smoothProgress, [0, 0.6], ['80vh', '100vh']),
                    }}
                >
                    {mediaType === 'video' ? (
                        <video
                            src={mediaSrc}
                            poster={posterSrc}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={mediaSrc}
                            alt="Media"
                            className="w-full h-full object-cover"
                        />
                    )}
                    <motion.div
                        className="absolute inset-0 bg-black/30"
                        style={{ opacity: useTransform(smoothProgress, [0.5, 1], [0.3, 0.7]) }}
                    />
                </motion.div>

                {/* Floating Text (Title & Date) */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                    <div className={`flex flex-col items-center gap-4 ${textBlend ? 'mix-blend-difference' : ''}`}>
                        <div className="flex items-center gap-4">
                            <motion.h2
                                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white"
                                style={{ x: textTranslateXNeg, opacity: textOpacity }}
                            >
                                {firstWord}
                            </motion.h2>
                            <motion.h2
                                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white"
                                style={{ x: textTranslateX, opacity: textOpacity }}
                            >
                                {restOfTitle}
                            </motion.h2>
                        </div>

                        <motion.div
                            className="flex flex-col items-center mt-4"
                            style={{ opacity: textOpacity }}
                        >
                            {date && <p className="text-xl text-blue-200 mb-2">{date}</p>}
                            {scrollToExpand && <p className="text-sm text-white/80 uppercase tracking-widest">{scrollToExpand}</p>}
                        </motion.div>
                    </div>
                </div>

                {/* Content Overlay */}
                <motion.div
                    className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                    style={{ opacity: contentOpacity, y: contentY }}
                >
                    <div className="container mx-auto px-4 pointer-events-auto">
                        {children}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ScrollExpandMedia;
