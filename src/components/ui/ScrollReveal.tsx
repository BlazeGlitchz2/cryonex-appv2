import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    variant?: "fade-up" | "fade-in" | "scale-up" | "fade-left" | "fade-right";
    delay?: number;
    className?: string;
}

const variants = {
    "fade-up": {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    },
    "fade-in": {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    "scale-up": {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
    },
    "fade-left": {
        hidden: { opacity: 0, x: -40 },
        visible: { opacity: 1, x: 0 },
    },
    "fade-right": {
        hidden: { opacity: 0, x: 40 },
        visible: { opacity: 1, x: 0 },
    },
};

export function ScrollReveal({
    children,
    variant = "fade-up",
    delay = 0,
    className = "",
}: ScrollRevealProps) {
    return (
        <motion.div
            variants={variants[variant]}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
