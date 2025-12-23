import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const mouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            });
        };

        const handleMouseOver = (e: MouseEvent) => {
            if ((e.target as HTMLElement).tagName === "BUTTON" || (e.target as HTMLElement).tagName === "A" || (e.target as HTMLElement).closest("button")) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    const variants = {
        default: {
            x: mousePosition.x - 16,
            y: mousePosition.y - 16,
            height: 32,
            width: 32,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            mixBlendMode: "difference" as any,
        },
        hover: {
            x: mousePosition.x - 32,
            y: mousePosition.y - 32,
            height: 64,
            width: 64,
            backgroundColor: "rgba(255, 255, 255, 1)",
            border: "none",
            mixBlendMode: "difference" as any,
        },
    };

    return (
        <motion.div
            className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] hidden md:block"
            variants={variants}
            animate={isHovering ? "hover" : "default"}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
        />
    );
};
